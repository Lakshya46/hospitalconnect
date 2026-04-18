import { useEffect } from "react";
import api from "../utils/api";
import { urlBase64ToUint8Array } from "../utils/notifications";

export default function NotificationManager() {
  useEffect(() => {
    console.log("🛠️ NotificationManager mounted");

    const subscribe = async () => {
      // Check if browser even supports it
      if (!("serviceWorker" in navigator)) {
        console.error("❌ SW not supported");
        return;
      }

      try {
        console.log("⏳ 1. Registering SW...");
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("✅ 2. SW Registered", registration);

        console.log("⏳ 3. Checking Permission...");
        const permission = await Notification.requestPermission();
        console.log("🔔 4. Permission Status:", permission);

        if (permission !== "granted") {
          console.warn("🚫 Permission denied");
          return;
        }

        // Wait for SW to be ready
        const serviceWorkerReady = await navigator.serviceWorker.ready;
        console.log("✅ 5. SW Ready and Active");

        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        console.log("🔑 6. Public Key found:", publicVapidKey ? "YES" : "NO");

        if (!publicVapidKey) throw new Error("VITE_VAPID_PUBLIC_KEY is missing!");

        console.log("⏳ 7. Subscribing to Push...");
        const subscription = await serviceWorkerReady.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        console.log("🚀 8. Sending to Backend...", subscription);
        await api.post("/api/auth/save-subscription", subscription);
        console.log("🎉 9. DONE!");
      } catch (err) {
        console.error("❌ ERROR AT STEP:", err);
      }
    };

    subscribe();
  }, []);

  return null;
}