import { useEffect } from "react";
import { useToast } from "../components/Toast";

export const useNotification = (userId) => {
  const toast = useToast();

  useEffect(() => {
    // If no user is logged in, we might skip or still connect depending on requirements
    // For now, let's always connect to the stream
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
        toast(`Notifikasi Baru: Bacaan '${data.title}' telah ${action}!`, "success", 5000);
      } catch (err) {
        console.error("Error parsing notification:", err);
      }
    });

    eventSource.onerror = (error) => {
      console.error("Notification stream error:", error);
      // EventSource automatically tries to reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [toast, userId]);
};
