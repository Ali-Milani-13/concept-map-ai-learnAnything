'use server'

import { createClient } from '@supabase/supabase-js';
import { getEncryptedSession } from '../../lib/session';

// Helper function to create an authenticated client using the decrypted token
async function getAuthenticatedClient() {
  const session = await getEncryptedSession();
  
  if (!session.access_token) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    }
  );
}

// 1. Check if user is logged in
export async function getSession() {
  const session = await getEncryptedSession();
  return session.user || null;
}

// 2. Hydrate: Fetch maps from the cloud
export async function fetchCloudMaps() {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return { error: 'Unauthorized', maps: [] };

  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, maps: [] };

  const formattedMaps = data.map(row => ({
    id: row.id,
    prompt: row.title,
    nodes: row.content.nodes || [],
    edges: row.content.edges || [],
    explanations: row.content.explanations || {},
    subMaps: row.content.subMaps || {}
  }));

  return { maps: formattedMaps };
}

// 3. Sync: Push local maps to the cloud
export async function syncMapToCloud(mapData: any) {
  const supabase = await getAuthenticatedClient();
  const session = await getEncryptedSession();
  
  if (!supabase || !session.user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('maps').insert([{
    user_id: session.user.id,
    title: mapData.prompt || 'Untitled Map',
    content: {
      nodes: mapData.nodes,
      edges: mapData.edges,
      explanations: mapData.explanations || {},
      subMaps: mapData.subMaps || {}
    },
    is_public: false
  }]);

  if (error) return { error: error.message };
  return { success: true };
}
// 4. Delete All: Wipe all maps for the current user from the cloud
export async function deleteAllCloudMaps() {
  const supabase = await getAuthenticatedClient();
  const session = await getEncryptedSession();
  
  if (!supabase || !session.user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('maps')
    .delete()
    .eq('user_id', session.user.id);

  if (error) return { error: error.message };
  return { success: true };
}