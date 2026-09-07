import { useEffect, type ReactNode } from "react";
import { useProgress } from "./store";
import { AudioManager } from "@/lib/audio/AudioManager";

/** Rehydrates the persisted store on the client, tracks learning minutes, applies theme. */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const sound = useProgress((s) => s.settings.sound);
  const dark = useProgress((s) => s.settings.darkMode);
  const addMinutes = useProgress((s) => s.addMinutes);

  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);

  useEffect(() => {
    AudioManager.setEnabled(sound);
  }, [sound]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Count a learning minute every 60s while the tab is visible
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") addMinutes(1);
    }, 60_000);
    return () => clearInterval(t);
  }, [addMinutes]);

  return <>{children}</>;
}
