import { useState, useEffect } from 'react';
import { getSession, fetchCloudMaps, syncMapToCloud, deleteAllCloudMaps, deleteSingleCloudMap } from '../actions/map.actions';
import { logoutUser } from '../../auth/actions/auth.actions';
import { HistoryItem } from '../../../types';

interface UseMapSyncProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

export function useMapSync({ history, setHistory }: UseMapSyncProps) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsSyncing(true);
    await logoutUser();
    setUser(null);
    setIsSyncing(false);
  };

  const checkAuthError = async (errorMsg: string, fallbackMsg: string) => {
    if (errorMsg.includes("JWT expired") || errorMsg.includes("Unauthorized") || errorMsg.includes("Invalid token")) {
      setSyncError("Your session has expired. Please log in again.");
      await handleLogout();
    } else {
      setSyncError(fallbackMsg);
    }
  };

  const performSmartSync = async (currentLocalHistory: HistoryItem[]) => {
    setIsSyncing(true);
    try {
      const { maps: cloudMaps, error: fetchError } = await fetchCloudMaps();
      
      if (fetchError) {
        await checkAuthError(fetchError, "Failed to sync maps with the cloud.");
        return; 
      }

      const safeCloudMaps = cloudMaps || [];
      const cloudPrompts = new Set(safeCloudMaps.map((m: HistoryItem) => m.prompt));
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
    } catch (err: unknown) {
      console.error("Sync Network Error:", err);
      setSyncError("Failed to connect to the cloud.");
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

  const handleAuthSuccess = async (authUser: Record<string, unknown>) => {
    setUser(authUser);
    await performSmartSync(history);
  };

  const handleDeleteAllCloud = async () => {
    if (user) {
      setIsSyncing(true);
      try {
        const { error: deleteError } = await deleteAllCloudMaps();
        if (deleteError) {
          await checkAuthError(deleteError, "Failed to delete maps from cloud.");
          return;
        }
      } catch (err: unknown) {
        console.error("Delete Network Error:", err);
        setSyncError("Failed to connect to the cloud.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteSingleMapFromCloud = async (prompt: string) => {
    if (user) {
      setIsSyncing(true);
      try {
        const { error } = await deleteSingleCloudMap(prompt);
        if (error) {
          await checkAuthError(error, "Failed to delete map from cloud.");
        }
      } catch (err: unknown) {
        console.error("Delete Single Network Error:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const pushNewMapToCloud = async (newItem: HistoryItem) => {
    if (user) {
      syncMapToCloud(newItem).then(async (res) => {
        if (res && res.error) {
          console.error("Failed to sync new map:", res.error);
          await checkAuthError(res.error, "Failed to sync map to cloud.");
        }
      }).catch(err => {
        console.error("Push Network Error:", err);
      });
    }
  };

  return {
    user, isSyncing, syncError, setSyncError,
    isAuthModalOpen, setIsAuthModalOpen,
    handleAuthSuccess, handleLogout,
    handleDeleteAllCloud, deleteSingleMapFromCloud, pushNewMapToCloud
  };
}