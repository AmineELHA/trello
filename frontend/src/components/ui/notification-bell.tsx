"use client";

import { Bell, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_NOTIFICATIONS } from "@/app/graphql/queries";
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from "@/app/graphql/mutations";
import { getGraphQLClient } from "@/app/lib/graphqlClient";
import { Button } from "@/components/ui/button";
import useAuth from "@/app/hooks/useAuth";
import useWebSocket from "@/app/hooks/useWebSocket";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  task?: {
    id: string;
    title: string;
  };
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  type GetNotificationsResponse = {
    notifications: Notification[];
  };

  const { data: notificationsData, isLoading } = useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const client = getGraphQLClient();
      const response = await client.request<GetNotificationsResponse>(GET_NOTIFICATIONS);
      return response.notifications;
    }
  });

  // Subscribe to real-time notifications via WebSocket
  useWebSocket(
    'NotificationChannel',
    (data) => {
      // When receiving a new notification, update the cache
      if (data.notification) {
        queryClient.setQueryData(["notifications"], (old: any) => {
          if (!old) return [data.notification];
          // Add the new notification to the beginning of the list
          return [data.notification, ...old];
        });
      }
    },
    { token: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '' }
  );

  type MarkNotificationAsReadResponse = {
    markNotificationAsRead?: {
      notification?: Notification;
      errors?: string[];
    };
  };

  const markAsRead = useMutation<MarkNotificationAsReadResponse["markNotificationAsRead"], Error, string, { previousNotifications: Notification[] | undefined }>({
    mutationFn: async (id) => {
      const client = getGraphQLClient();
      const response = await client.request<MarkNotificationAsReadResponse>(MARK_NOTIFICATION_AS_READ, { id });
      return response.markNotificationAsRead;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(["notifications"]);
      
      // Optimistically update cache
      queryClient.setQueryData(["notifications"], (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map((notification: Notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        );
      });
      
      return { previousNotifications };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSuccess: () => {
      // The UI is already updated optimistically, but we can still refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  type MarkAllNotificationsAsReadResponse = {
    markAllNotificationsAsRead?: {
      success?: boolean;
      errors?: string[];
    };
  };

  const markAllAsRead = useMutation<MarkAllNotificationsAsReadResponse["markAllNotificationsAsRead"], Error, void, { previousNotifications: Notification[] | undefined }>({
    mutationFn: async () => {
      const client = getGraphQLClient();
      const response = await client.request<MarkAllNotificationsAsReadResponse>(MARK_ALL_NOTIFICATIONS_AS_READ);
      return response.markAllNotificationsAsRead;
    },
    onMutate: async () => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(["notifications"]);
      
      // Optimistically update cache
      queryClient.setQueryData(["notifications"], (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map((notification: Notification) => 
          ({ ...notification, read: true })
        );
      });
      
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSuccess: () => {
      // The UI is already updated optimistically, but we can still refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };
  
  const unreadCount = notificationsData?.filter(n => !n.read).length || 0;
  
  // These functions are now defined above with the mutations
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notificationsData && notificationsData.length > 0 ? (
              notificationsData.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex justify-between">
                    <p className="text-sm">{notification.message}</p>
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}