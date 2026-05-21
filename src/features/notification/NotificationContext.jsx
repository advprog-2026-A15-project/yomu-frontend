import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../auth/hooks/useAuth";

const NotificationContext = createContext();

export const useNotificationList = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // We can decide to only connect if user is logged in, but for now we connect always
    // or rely on user existence.
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onopen = () => {
      console.log("Connected to notification stream");
    };

    eventSource.addEventListener("INIT", (event) => {
      console.log("Notification stream initialized:", event.data);
    });

    eventSource.addEventListener("bacaan_updated", (event) => {
      try {
        const data = JSON.parse(event.data);
        const action = data.action === "CREATED" ? "ditambahkan" : "diperbarui";
        const message = `Notifikasi Baru: Bacaan '${data.title}' telah ${action}!`;
        
        toast(message, "success", 5000);
        
        setNotifications((prev) => [
          {
            id: Date.now().toString(),
            message,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ].slice(0, 50)); // Keep max 50 notifications
        
        setUnreadCount((prev) => prev + 1);

      } catch (err) {
        console.error("Error parsing notification:", err);
      }
    });

    eventSource.onerror = (error) => {
      console.error("Notification stream error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [toast, user]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
