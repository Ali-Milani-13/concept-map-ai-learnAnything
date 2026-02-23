import { useState, useEffect } from 'react';
import { getSession, fetchCloudMaps, syncMapToCloud, deleteAllCloudMaps } from '../actions/map.actions';
import { logoutUser } from '../../auth/actions/auth.actions';
import { HistoryItem } from '../../../types';

interface UseMapSyncProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

export function useMapSync({ history, setHistory }: UseMapSyncProps) {
  const [user, setUser] = useState<any>(null); // Using 'any' for Supabase User object for now
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const performSmartSync = async (currentLocalHistory: HistoryItem[]) => {
    setIsSyncing(true);
    try {
      const { maps: cloudMaps, error: fetchError } = await fetchCloudMaps();
      if (fetchError) throw new Error(fetchError);

      const safeCloudMaps = cloudMaps || [];
      const cloudPrompts = new Set(safeCloudMaps.map((m: any) => m.prompt));

      const localOnlyMaps = currentLocalHistory.filter((m) => !cloudPrompts.has(m.prompt));

      if (localOnlyMaps.length > 0) {
        for (const item of localOnlyMaps) {
          await syncMapToCloud(item);
        }
        const { maps: updatedMaps } = await fetchCloudMaps();
        setHistory((updatedMaps as HistoryItem[]) || []);
      } else {
        setHistory(safeCloudMaps as HistoryItem[]);
      }
    } catch (err) {
      console.error("Sync Error:", err);
      setSyncError("Failed to sync maps with the cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    async function initAuth() {
      const activeUser = await getSession();
      if (activeUser) {
        setUser(activeUser);
        await performSmartSync(history);
      }
    }
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthSuccess = async (authUser: any) => {
    setUser(authUser);
    await performSmartSync(history);
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    await logoutUser();
    setUser(null);
    setIsSyncing(false);
  };

  const handleDeleteAllCloud = async () => {
    if (user) {
      setIsSyncing(true);
      try {
        const { error: deleteError } = await deleteAllCloudMaps();
        if (deleteError) throw new Error(deleteError);
      } catch (err) {
        console.error("Failed to delete all cloud maps:", err);
        setSyncError("Failed to delete maps from cloud.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const pushNewMapToCloud = async (newItem: HistoryItem) => {
    if (user) {
      syncMapToCloud(newItem).then((res) => {
        if (res && res.error) console.error("Failed to sync new map:", res.error);
      });
    }
  };

  return {
    user, isSyncing, syncError, setSyncError,
    isAuthModalOpen, setIsAuthModalOpen,
    handleAuthSuccess, handleLogout,
    handleDeleteAllCloud, pushNewMapToCloud
  };
}