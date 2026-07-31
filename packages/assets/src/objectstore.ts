import { getFleetUrls } from "@grudge-studio/core";

export async function fetchObjectStoreJson<T = unknown>(
  file: string,
  init?: RequestInit,
): Promise<T> {
  const base = getFleetUrls().objectStore.replace(/\/$/, "");
  const name = file.endsWith(".json") ? file : `${file}.json`;
  const res = await fetch(`${base}/${name}`, init);
  if (!res.ok) throw new Error(`ObjectStore ${name}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const OBJECTSTORE_KEYS = [
  "weapons",
  "equipment",
  "materials",
  "races",
  "armor",
  "grudge6-gear-presets",
  "race-models.v1",
] as const;
