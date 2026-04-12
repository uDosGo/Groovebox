import JSZip from "jszip";
import { AudioStorage } from "./types";

/**
 * Groovebox overlay: fixes Promise passed to JSZip.loadAsync (must be Blob),
 * awaits stem extraction, and surfaces missing API base URL.
 * Upstream: MIT (c) Gabriel Serna — https://github.com/gabe-serna/songscribe
 */
export default async function isolateAudio(
  formData: FormData,
  setAudioStorage: React.Dispatch<React.SetStateAction<AudioStorage | null>>,
) {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw || raw === "undefined") {
    throw new Error("MISSING_API_BASE");
  }
  const apiBase = raw.replace(/\/$/, "");

  if (formData.get("separation_mode") === "Solo") await alignSingle();
  else await isolateTracks();

  async function isolateTracks() {
    const response = await fetch(`${apiBase}/split-audio`, {
      method: "POST",
      mode: "cors",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const zipBlob = await response.blob();
    const zip = await JSZip.loadAsync(zipBlob);
    const tasks = Object.entries(zip.files)
      .filter(([, entry]) => !entry.dir)
      .map(async ([relativePath, file]) => {
        const blob = await file.async("blob");
        const base = relativePath.split("/").pop() || relativePath;
        const name = base.includes(".") ? base.split(".").slice(0, -1).join(".") : base;
        setAudioStorage(
          (prev) =>
            ({
              ...prev,
              [name]: { name, audioBlob: blob, midiBlob: null },
            }) as AudioStorage,
        );
      });
    await Promise.all(tasks);
  }

  async function alignSingle() {
    const response = await fetch(`${apiBase}/align-audio`, {
      method: "POST",
      mode: "cors",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const blob = await response.blob();
    setAudioStorage(
      (prev) =>
        ({
          ...prev,
          no_vocals: { name: "no_vocals", audioBlob: blob, midiBlob: null },
        }) as AudioStorage,
    );
  }
}
