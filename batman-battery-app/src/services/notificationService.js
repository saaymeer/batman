/**
 * notificationService.js
 *
 * Handles Web Push Notifications and audio alerts for mechanics.
 */

/**
 * Requests browser permission to show Push Notifications.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Trigger an audio chime alert for urgent dispatch requests.
 */
export function playDispatchSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

/**
 * Sends a native browser push notification to the mechanic.
 * @param {string} title 
 * @param {NotificationOptions} options 
 */
export function triggerMechanicPushNotification(title, options = {}) {
  playDispatchSound();

  if ('Notification' in window && Notification.permission === 'granted') {
    const defaultOptions = {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 300],
      tag: 'emergency-dispatch',
      renotify: true,
      requireInteraction: true,
      ...options,
    };

    try {
      new Notification(title, defaultOptions);
    } catch (e) {
      console.warn('Native notification failed, falling back to service worker if available.', e);
    }
  }
}
