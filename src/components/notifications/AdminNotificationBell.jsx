import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInventoryNotifications } from "../../api/NotificationApi";
import { getPopupSessionDismissKey } from "../../utils/session";
import ExpiryAlertPopup from "./ExpiryAlertPopup";

function playSubtleChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore autoplay restrictions
  }
}

const AdminNotificationBell = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    enabled: true,
    showLoginPopup: true,
    soundEnabled: false,
    unreadCount: 0,
    notifications: [],
  });
  const [popupOpen, setPopupOpen] = useState(false);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getInventoryNotifications();
        if (!active) return;
        setData(res);

        if (res.enabled && res.unreadCount > 0) {
          if (res.soundEnabled && !soundPlayedRef.current) {
            soundPlayedRef.current = true;
            playSubtleChime();
          }
          const dismissKey = getPopupSessionDismissKey();
          const alreadyDismissed = dismissKey
            ? sessionStorage.getItem(dismissKey) === "1"
            : false;
          if (res.showLoginPopup && !alreadyDismissed) {
            setPopupOpen(true);
          }
        }
      } catch (err) {
        if (err?.response?.status !== 403) {
          console.error("Failed to load inventory notifications:", err);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDismissPopup = () => {
    const dismissKey = getPopupSessionDismissKey();
    if (dismissKey) sessionStorage.setItem(dismissKey, "1");
    setPopupOpen(false);
  };

  const handleViewInventory = () => {
    handleDismissPopup();
    navigate("/dashboard/inventory");
  };

  return (
    <ExpiryAlertPopup
      open={popupOpen}
      notifications={data.notifications}
      onDismiss={handleDismissPopup}
      onViewInventory={handleViewInventory}
    />
  );
};

export default AdminNotificationBell;
