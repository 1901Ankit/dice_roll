import { useCallback, useEffect, useRef, useState } from 'react';

const SHAKE_THRESHOLD = 20; // acceleration magnitude (m/s^2) incl. gravity (~9.8 at rest)
const SHAKE_COOLDOWN = 1400; // ms between accepted shakes
const SENSOR_PROBE_MS = 1600; // wait this long for a real motion event before giving up

/**
 * Detects physical phone shakes via the DeviceMotion API.
 *
 * motionState:
 *   'unsupported'       - no DeviceMotionEvent (or no real sensor data)
 *   'needs-permission'  - iOS Safari: must call requestPermission() from a tap
 *   'enabled'           - listening for shakes
 *   'denied'            - user refused permission / request failed
 */
export function useShakeDetector(onShake) {
  const [motionState, setMotionState] = useState(() => {
    if (typeof window === 'undefined' || typeof window.DeviceMotionEvent === 'undefined') {
      return 'unsupported';
    }
    if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
      return 'needs-permission';
    }
    return 'enabled';
  });

  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;
  const lastShakeAt = useRef(0);

  const requestPermission = useCallback(async () => {
    if (
      typeof window.DeviceMotionEvent === 'undefined' ||
      typeof window.DeviceMotionEvent.requestPermission !== 'function'
    ) {
      return 'unsupported';
    }
    try {
      const result = await window.DeviceMotionEvent.requestPermission();
      setMotionState(result === 'granted' ? 'enabled' : 'denied');
      return result;
    } catch {
      setMotionState('denied');
      return 'denied';
    }
  }, []);

  useEffect(() => {
    if (motionState !== 'enabled') return undefined;

    let sawRealData = false;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      if (x === 0 && y === 0 && z === 0) return;
      sawRealData = true;

      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > SHAKE_THRESHOLD && now - lastShakeAt.current > SHAKE_COOLDOWN) {
        lastShakeAt.current = now;
        onShakeRef.current();
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    // Some desktops expose DeviceMotionEvent but never emit real data.
    const probe = setTimeout(() => {
      if (!sawRealData) setMotionState('unsupported');
    }, SENSOR_PROBE_MS);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearTimeout(probe);
    };
  }, [motionState]);

  return { motionState, requestPermission };
}
