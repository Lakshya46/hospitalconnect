import { useEffect } from "react";
import api from "../utils/api";
import { urlBase64ToUint8Array } from "../utils/notifications";
import { useAuth } from "../context/AuthContext";

export default function NotificationManager() {
  const { user } = useAuth();

useEffect(() => {
  if (!user) {
    console.log("⏳ NotificationManager: no user yet, skipping");
    return;
  }
  console.log("👤 User found, starting push setup for:", user._id);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      console.error("❌ SW not supported in this browser");
      return;
    }

    try {
      console.log("⏳ 1. Registering SW...");
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      console.log("✅ 2. SW Registered:", registration.scope);

      console.log("⏳ 3. Requesting permission...");
      const permission = await Notification.requestPermission();
      console.log("🔔 4. Permission:", permission);
      if (permission !== "granted") return;

      console.log("⏳ 5. Waiting for SW ready...");
      const serviceWorkerReady = await navigator.serviceWorker.ready;
      console.log("✅ 6. SW is active:", serviceWorkerReady.active?.state);

      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      console.log("🔑 7. VAPID key present:", !!publicVapidKey);
      if (!publicVapidKey) throw new Error("VITE_VAPID_PUBLIC_KEY missing!");

      console.log("⏳ 8. Checking existing subscription...");
      const existingSub = await serviceWorkerReady.pushManager.getSubscription();
      console.log("📦 9. Existing subscription:", existingSub ? "YES" : "NONE");

      console.log("⏳ 10. Subscribing to push...");
      const subscription = await serviceWorkerReady.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      console.log("✅ 11. Got subscription:", JSON.stringify(subscription));

      console.log("⏳ 12. Sending to backend...");
      await api.post("/api/auth/save-subscription", subscription);
      console.log("🎉 13. DONE — subscription saved to backend!");
    } catch (err) {
      console.error("❌ Push setup failed at step:", err.message);
    }
  };

  subscribe();
}, [user]);
  return null;
}