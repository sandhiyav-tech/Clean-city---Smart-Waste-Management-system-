import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { NotificationItem } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/Toast';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: Partial<NotificationItem>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  const getLocalReadIds = (): Set<string> => {
    try {
      const stored = localStorage.getItem('cleancity_read_notif_ids');
      if (stored) return new Set(JSON.parse(stored));
    } catch {}
    return new Set();
  };

  const saveLocalReadId = (id: string) => {
    try {
      const ids = getLocalReadIds();
      ids.add(id);
      localStorage.setItem('cleancity_read_notif_ids', JSON.stringify(Array.from(ids)));
    } catch {}
  };

  const saveAllLocalReadIds = (allIds: string[]) => {
    try {
      const ids = getLocalReadIds();
      allIds.forEach((id) => ids.add(id));
      localStorage.setItem('cleancity_read_notif_ids', JSON.stringify(Array.from(ids)));
    } catch {}
  };

  const getStoredLocalNotifs = (): NotificationItem[] => {
    try {
      const stored = localStorage.getItem('cleancity_local_notifications');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      let remoteNotifs: NotificationItem[] = [];

      try {
        const res = await axiosClient.get('/notifications');
        if (res.data?.success && res.data.data) {
          remoteNotifs = res.data.data.notifications || [];
        }
      } catch (networkErr) {
        console.debug('Polling notifications failed, falling back to local:', networkErr);
      }

      // Merge with client localStorage notifications
      const localNotifs = getStoredLocalNotifs();
      const readIds = getLocalReadIds();

      // Filter local notifications relevant to this user or role
      const relevantLocal = localNotifs.filter((n) => {
        if (!n.user || n.type === 'BROADCAST') {
          if (!n.targetRole || n.targetRole === 'ALL' || n.targetRole === user.role) return true;
        }
        if (n.user === user._id || n.user === user.email) return true;
        if (n.targetRole && (n.targetRole === 'ALL' || n.targetRole === user.role)) return true;
        return false;
      });

      // Deduplicate by ID
      const notifMap = new Map<string, NotificationItem>();

      [...relevantLocal, ...remoteNotifs].forEach((n) => {
        const isRead = readIds.has(n._id) || Boolean(n.isRead);
        notifMap.set(n._id, {
          ...n,
          isRead,
        });
      });

      const merged = Array.from(notifMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Check if there are newly arrived unread notifications after initial load
      if (initialLoadDoneRef.current) {
        const newlyArrived = merged.find(
          (n) => !n.isRead && !knownNotifIdsRef.current.has(n._id)
        );
        if (newlyArrived) {
          toast(newlyArrived.message, 'info');
        }
      }

      // Update known IDs
      merged.forEach((n) => knownNotifIdsRef.current.add(n._id));
      initialLoadDoneRef.current = true;

      setNotifications(merged);
      const unread = merged.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to process notifications:', err);
    }
  }, [user, toast]);

  // Initial load and 15-second polling loop + custom event listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      knownNotifIdsRef.current.clear();
      initialLoadDoneRef.current = false;
      return;
    }

    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    const handleCustomUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener('cleancity_notification_updated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cleancity_notification_updated', handleCustomUpdate);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    saveLocalReadId(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axiosClient.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.debug('Failed to sync mark-read to server:', err);
    }
  };

  const markAllAsRead = async () => {
    const allIds = notifications.map((n) => n._id);
    saveAllLocalReadIds(allIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await axiosClient.patch('/notifications/read-all');
    } catch (err) {
      console.debug('Failed to sync mark-all-read to server:', err);
    }
  };

  const addNotification = (item: Partial<NotificationItem>) => {
    const newNotif: NotificationItem = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user: item.user || (user ? user._id : null),
      targetRole: item.targetRole || 'ALL',
      title: item.title || 'Notification',
      message: item.message || '',
      type: item.type || 'STATUS_UPDATE',
      reportId: item.reportId || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = getStoredLocalNotifs();
      stored.unshift(newNotif);
      localStorage.setItem('cleancity_local_notifications', JSON.stringify(stored.slice(0, 50)));
    } catch {}

    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
    knownNotifIdsRef.current.add(newNotif._id);

    if (item.message) {
      toast(item.message, 'info');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
