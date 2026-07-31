/**
 * UUID node graph for editor + deployer — scenes, characters, units, skills.
 * Every deployable object gets a stable UUID for D1/R2/Railway/Forge.
 */

export type NodeKind =
  | "scene"
  | "character"
  | "npc"
  | "unit"
  | "weapon_skill"
  | "anim_pack"
  | "mesh"
  | "collider"
  | "spawn"
  | "path"
  | "trigger"
  | "locomotion"
  | "blend_layer";

export interface DeployNode {
  /** Stable UUID (uuid v4 recommended) */
  uuid: string;
  kind: NodeKind;
  /** Human name */
  name: string;
  /** Optional parent scene/node uuid */
  parentUuid?: string;
  /** CDN or ObjectStore key */
  assetKey?: string;
  /** Race / unit / pack id */
  refId?: string;
  /** World pose for spawns */
  position?: [number, number, number];
  rotationY?: number;
  /** Free-form props (loadout, brain, etc.) */
  props?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeployEdge {
  from: string;
  to: string;
  /** relationship: "child" | "uses_skill" | "uses_pack" | "spawns" | "collides" */
  rel?: string;
}

export interface DeployGraph {
  uuid: string;
  name: string;
  version: number;
  nodes: DeployNode[];
  /** Edges: fromUuid → toUuid */
  edges?: DeployEdge[];
}

/** RFC4122-ish v4 UUID without crypto dependency when available */
export function createUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createNode(
  kind: NodeKind,
  name: string,
  partial: Partial<DeployNode> = {},
): DeployNode {
  const now = new Date().toISOString();
  return {
    uuid: partial.uuid ?? createUuid(),
    kind,
    name,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createGraph(name: string, nodes: DeployNode[] = []): DeployGraph {
  return {
    uuid: createUuid(),
    name,
    version: 1,
    nodes,
    edges: [],
  };
}

export function addNode(graph: DeployGraph, node: DeployNode): DeployGraph {
  return {
    ...graph,
    version: graph.version + 1,
    nodes: [...graph.nodes, node],
  };
}

export function linkNodes(
  graph: DeployGraph,
  from: string,
  to: string,
  rel = "child",
): DeployGraph {
  const edges = [...(graph.edges ?? [])];
  if (!edges.some((e) => e.from === from && e.to === to && e.rel === rel)) {
    edges.push({ from, to, rel });
  }
  return { ...graph, version: graph.version + 1, edges };
}

export function findNode(graph: DeployGraph, uuid: string): DeployNode | undefined {
  return graph.nodes.find((n) => n.uuid === uuid);
}

export function nodesByKind(graph: DeployGraph, kind: NodeKind): DeployNode[] {
  return graph.nodes.filter((n) => n.kind === kind);
}

export function childrenOf(graph: DeployGraph, parentUuid: string): DeployNode[] {
  const childIds = new Set(
    (graph.edges ?? [])
      .filter((e) => e.from === parentUuid && (e.rel === "child" || !e.rel))
      .map((e) => e.to),
  );
  return graph.nodes.filter(
    (n) => n.parentUuid === parentUuid || childIds.has(n.uuid),
  );
}

/** Spawn nodes for characters/units on a scene */
export function createCharacterSpawnNode(opts: {
  name: string;
  characterRefId: string;
  position: [number, number, number];
  parentSceneUuid?: string;
  animPack?: string;
  loadout?: Record<string, unknown>;
  uuid?: string;
}): DeployNode {
  return createNode("spawn", opts.name, {
    uuid: opts.uuid,
    parentUuid: opts.parentSceneUuid,
    refId: opts.characterRefId,
    position: opts.position,
    props: {
      animPack: opts.animPack ?? "sword_shield",
      loadout: opts.loadout,
      kind: "character",
      locomotionCore: true,
    },
  });
}

export function createWeaponSkillNode(opts: {
  name: string;
  skillId: string;
  animPack: string;
  clipKey: string;
  rangeM: number;
  blendOnLocomotion?: boolean;
  hitWindow?: [number, number];
  upperBodyWeight?: number;
  cooldownS?: number;
  uuid?: string;
}): DeployNode {
  return createNode("weapon_skill", opts.name, {
    uuid: opts.uuid,
    refId: opts.skillId,
    props: {
      animPack: opts.animPack,
      clipKey: opts.clipKey,
      rangeM: opts.rangeM,
      blendOnLocomotion: opts.blendOnLocomotion !== false,
      hitWindow: opts.hitWindow ?? [0.28, 0.55],
      upperBodyWeight: opts.upperBodyWeight ?? 0.95,
      cooldownS: opts.cooldownS ?? 0.35,
      weaponCollider: true,
    },
  });
}

export function createAnimPackNode(opts: {
  name: string;
  packId: string;
  clips: Record<string, string>;
  uuid?: string;
}): DeployNode {
  return createNode("anim_pack", opts.name, {
    uuid: opts.uuid,
    refId: opts.packId,
    props: { clips: opts.clips },
  });
}

export function createLocomotionNode(opts: {
  name?: string;
  idleKey: string;
  walkKey: string;
  runKey: string;
  sprintKey?: string;
  continuousGait?: boolean;
  uuid?: string;
}): DeployNode {
  return createNode("locomotion", opts.name ?? "locomotion_core", {
    uuid: opts.uuid,
    refId: "locomotion_core",
    props: {
      idleKey: opts.idleKey,
      walkKey: opts.walkKey,
      runKey: opts.runKey,
      sprintKey: opts.sprintKey,
      continuousGait: opts.continuousGait !== false,
      skillLocoRetain: 0.55,
    },
  });
}

/**
 * Scaffold a playable character deploy subgraph:
 * character + locomotion + anim pack + weapon skills, all UUID-linked.
 * Optional skill list; if omitted, host should load skills from getAnimPack(animPack).
 */
export function createCharacterDeployBundle(opts: {
  name: string;
  characterRefId: string;
  animPack: string;
  position?: [number, number, number];
  /** Skeleton runtime hint for validators */
  skeleton?: "bip001" | "opb" | "kaykit" | "mixamo";
  skills?: Array<{
    skillId: string;
    name: string;
    clipKey: string;
    rangeM?: number;
  }>;
}): DeployGraph {
  const graph = createGraph(`${opts.name}_deploy`);
  const char = createNode("character", opts.name, {
    refId: opts.characterRefId,
    props: {
      animPack: opts.animPack,
      skeleton: opts.skeleton ?? "bip001",
    },
  });
  const loco = createLocomotionNode({
    idleKey: "locomotion/idle",
    walkKey: "locomotion/walking",
    runKey: "locomotion/running",
    sprintKey: "locomotion/sprint",
  });
  const pack = createAnimPackNode({
    name: opts.animPack,
    packId: opts.animPack,
    clips: {},
  });
  pack.props = {
    ...pack.props,
    skeleton: opts.skeleton ?? "bip001",
    registry: "@grudge-studio/assets ANIM_PACKS",
  };
  let g = addNode(graph, char);
  g = addNode(g, loco);
  g = addNode(g, pack);
  g = linkNodes(g, char.uuid, loco.uuid, "uses_loco");
  g = linkNodes(g, char.uuid, pack.uuid, "uses_pack");

  if (opts.position) {
    const spawn = createCharacterSpawnNode({
      name: `${opts.name}_spawn`,
      characterRefId: opts.characterRefId,
      position: opts.position,
      animPack: opts.animPack,
    });
    g = addNode(g, spawn);
    g = linkNodes(g, spawn.uuid, char.uuid, "spawns");
  }

  for (const s of opts.skills ?? []) {
    const skill = createWeaponSkillNode({
      name: s.name,
      skillId: s.skillId,
      animPack: opts.animPack,
      clipKey: s.clipKey,
      rangeM: s.rangeM ?? 2.5,
    });
    g = addNode(g, skill);
    g = linkNodes(g, char.uuid, skill.uuid, "uses_skill");
  }

  return g;
}

export interface GraphValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGraph(graph: DeployGraph): GraphValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!graph.uuid) errors.push("graph.uuid missing");
  if (!Array.isArray(graph.nodes)) errors.push("graph.nodes missing");
  const ids = new Set<string>();
  for (const n of graph.nodes ?? []) {
    if (!n.uuid) errors.push(`node without uuid: ${n.name}`);
    else if (ids.has(n.uuid)) errors.push(`duplicate uuid: ${n.uuid}`);
    else ids.add(n.uuid);
    if (!n.kind) errors.push(`node ${n.uuid} missing kind`);
    if (!n.name) warnings.push(`node ${n.uuid} missing name`);
  }
  for (const e of graph.edges ?? []) {
    if (!ids.has(e.from)) errors.push(`edge.from unknown: ${e.from}`);
    if (!ids.has(e.to)) errors.push(`edge.to unknown: ${e.to}`);
  }
  const hasChar = (graph.nodes ?? []).some(
    (n) => n.kind === "character" || n.kind === "spawn",
  );
  if (!hasChar) warnings.push("no character/spawn nodes");
  const hasLoco = (graph.nodes ?? []).some((n) => n.kind === "locomotion");
  if (hasChar && !hasLoco) {
    warnings.push("character without locomotion node — prefer LocomotionCore");
  }
  return { ok: errors.length === 0, errors, warnings };
}

/** Serialize graph for ObjectStore / Railway */
export function serializeGraph(graph: DeployGraph): string {
  return JSON.stringify(graph, null, 2);
}

export function parseGraph(json: string): DeployGraph {
  const g = JSON.parse(json) as DeployGraph;
  if (!g.uuid || !Array.isArray(g.nodes)) {
    throw new Error("invalid_deploy_graph");
  }
  return g;
}
