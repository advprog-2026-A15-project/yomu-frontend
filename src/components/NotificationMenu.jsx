import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotificationList } from "../features/notification/NotificationContext";

export const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationList();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="notification-menu-container" ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          padding: "8px",
          cursor: "pointer",
          position: "relative",
          color: "var(--text-main)",
        }}
        aria-label="Notifikasi"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "4px",
              background: "var(--danger)",
              color: "white",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "10px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            width: "320px",
            background: "var(--bg-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 50,
            overflow: "hidden",
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-page)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-main)" }}>Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--primary)",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <CheckCheck size={14} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-light)", fontSize: "14px" }}>
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    border: "none",
                    textAlign: "left",
                    fontFamily: "inherit",
                    width: "100%",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-color)",
                    background: notif.read ? "var(--bg-main)" : "var(--bg-page)",
                    cursor: "pointer",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: notif.read ? "transparent" : "var(--primary)",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "14px", color: "var(--text-main)", lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: "11px", color: "var(--text-light)" }}>
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
