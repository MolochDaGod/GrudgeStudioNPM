/**
 * Uniformed asset motion — strip hip/root position for grounded kits.
 * Duck-typed THREE.AnimationClip so three can stay a peer.
 */

export interface KeyframeTrackLike {
  name: string;
}

export interface AnimationClipLike {
  name: string;
  tracks: KeyframeTrackLike[];
  clone?(): AnimationClipLike;
}

/**
 * Remove .position (and optionally .scale) tracks so Bip001 kits stay
 * Box3-grounded. Keeps .quaternion / rotation tracks only.
 * This is the SSOT for "uniformed asset motion" across heroes, NPC, units.
 */
export function stripPositionTracks<T extends AnimationClipLike>(
  clip: T,
  opts: { stripScale?: boolean } = {},
): T {
  const stripScale = opts.stripScale ?? true;
  const next = (typeof clip.clone === "function" ? clip.clone() : { ...clip, tracks: [...clip.tracks] }) as T;
  next.tracks = clip.tracks.filter((t) => {
    const n = t.name || "";
    if (/\.position$/i.test(n)) return false;
    if (stripScale && /\.scale$/i.test(n)) return false;
    return true;
  }) as T["tracks"];
  return next;
}

/** Hip / root bone name patterns that must not drive world Y on grounded kits */
export const HIP_ROOT_BONE_RE =
  /(bip001(\s|_)?(pelvis|hip)?|hips|mixamorig:?hips|root|armature)/i;

/**
 * True if track looks like root/hip translation (dangerous for grounded kits).
 */
export function isHipOrRootPositionTrack(trackName: string): boolean {
  if (!/\.position$/i.test(trackName)) return false;
  const bone = trackName.split(".")[0] || "";
  return HIP_ROOT_BONE_RE.test(bone) || /^(root|hips|pelvis)$/i.test(bone);
}

/** Strip only hip/root Y-driving position tracks; keep foot plant motion if any */
export function stripHipRootPositionTracks<T extends AnimationClipLike>(clip: T): T {
  const next = (typeof clip.clone === "function" ? clip.clone() : { ...clip, tracks: [...clip.tracks] }) as T;
  next.tracks = clip.tracks.filter((t) => !isHipOrRootPositionTrack(t.name || "")) as T["tracks"];
  return next;
}

export type MotionContract = {
  /** Rotation-only clips on grounded kits */
  rotationOnly: true;
  /** Re-ground after first mixer sample of idle/attack */
  reGroundAfterSample: true;
  /** Never ground with pelvis.y = 0 */
  groundFromBodyBoxMinY: true;
};

export const GROUNDED_MOTION_CONTRACT: MotionContract = {
  rotationOnly: true,
  reGroundAfterSample: true,
  groundFromBodyBoxMinY: true,
};
