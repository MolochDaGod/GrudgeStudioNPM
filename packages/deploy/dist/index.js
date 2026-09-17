// src/qualitySystem.ts
import { CHARACTER_DEPLOY_STEPS, CHARACTER_KILL_LIST, CHARACTER_SI } from "@grudge-studio/character";
import { BAKE_QUALITY_GATES } from "@grudge-studio/bake";
import { DEFAULT_NPC_CATALOG, DEFAULT_UNIT_CATALOG } from "@grudge-studio/units";
import { DEFAULT_FLEET_URLS } from "@grudge-studio/core";
var QUALITY_SYSTEM = {
  version: "0.3.2",
  editorUrl: "https://forge.grudge-studio.com",
  cdn: DEFAULT_FLEET_URLS.assets,
  domains: ["bake", "character", "npc", "unit", "editor", "deployer", "runtime_3d"],
  characterDeploySteps: CHARACTER_DEPLOY_STEPS,
  characterKillList: CHARACTER_KILL_LIST,
  bakeGates: BAKE_QUALITY_GATES,
  si: CHARACTER_SI,
  defaultUnitCount: DEFAULT_UNIT_CATALOG.length,
  defaultNpcCount: DEFAULT_NPC_CATALOG.length,
  requiredHostPackages: [
    "three@^0.185.1",
    "@types/three@^0.185.4",
    "@dimforge/rapier3d-compat@^0.19.3 OR @react-three/rapier@^2.2.0",
    "@react-three/fiber@^9.7.0 (R3F hosts)",
    "@react-three/drei@^10.7.8 (R3F hosts)"
  ],
  requiredNpmSlices: [
    "@grudge-studio/sdk",
    "@grudge-studio/character",
    "@grudge-studio/units",
    "@grudge-studio/bake",
    "@grudge-studio/deploy",
    "@grudge-studio/animator"
  ]
};
function qualityChecklist() {
  return [
    "[ ] Bake gates green (BAKE_QUALITY_GATES)",
    "[ ] Character deploy steps 1\u201315 followed",
    "[ ] stripPositionTracks / no hip-Y on grounded kits",
    "[ ] Skeleton Bip001 (SKELETON_CONTRACT / skeletonQualityReport)",
    "[ ] Anim pack from getAnimPack \u2014 skeleton matches pipeline",
    "[ ] formatAnimDebugReport / missingRoles checked for WIP packs",
    "[ ] LocomotionCore for combat \u2014 weapon skills blend on gait",
    "[ ] combatSkillKit + SKILL_BLEND_PROFILES (no ad-hoc retain numbers)",
    "[ ] Hit windows drive colliders; docs WEAPON_SKILL_BLENDS.md",
    "[ ] Directional: directionalSlotFromXZ or gaitBlendFromSpeed",
    "[ ] CharacterRuntimeState + applyLocoSnapshot each frame",
    "[ ] Deploy graph UUIDs valid (validateGraph / createCharacterDeployBundle)",
    "[ ] NPC/unit defs from @grudge-studio/units (+ ObjectStore extensions)",
    "[ ] Editor = forge.grudge-studio.com (no parallel editor SSOT)",
    "[ ] Deployer uses QUALITY_SYSTEM + stack rewrites",
    "[ ] Host has three@^0.185 + Rapier 0.19 (not 0.12 / not @types/three 0.170)",
    "[ ] R3F worlds use fiber 9.7 + drei 10.7 + rapier 2.2 (Grok Builder pin)",
    "[ ] World deploy: one Physics world, Vercel prebuilt SPA, wrangler Worker without WASM physics",
    "[ ] No Meshy/capsule heroes"
  ];
}

// src/nodes.ts
function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function createNode(kind, name, partial = {}) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    uuid: partial.uuid ?? createUuid(),
    kind,
    name,
    createdAt: now,
    updatedAt: now,
    ...partial
  };
}
function createGraph(name, nodes = []) {
  return {
    uuid: createUuid(),
    name,
    version: 1,
    nodes,
    edges: []
  };
}
function addNode(graph, node) {
  return {
    ...graph,
    version: graph.version + 1,
    nodes: [...graph.nodes, node]
  };
}
function linkNodes(graph, from, to, rel = "child") {
  const edges = [...graph.edges ?? []];
  if (!edges.some((e) => e.from === from && e.to === to && e.rel === rel)) {
    edges.push({ from, to, rel });
  }
  return { ...graph, version: graph.version + 1, edges };
}
function findNode(graph, uuid) {
  return graph.nodes.find((n) => n.uuid === uuid);
}
function nodesByKind(graph, kind) {
  return graph.nodes.filter((n) => n.kind === kind);
}
function childrenOf(graph, parentUuid) {
  const childIds = new Set(
    (graph.edges ?? []).filter((e) => e.from === parentUuid && (e.rel === "child" || !e.rel)).map((e) => e.to)
  );
  return graph.nodes.filter(
    (n) => n.parentUuid === parentUuid || childIds.has(n.uuid)
  );
}
function createCharacterSpawnNode(opts) {
  return createNode("spawn", opts.name, {
    uuid: opts.uuid,
    parentUuid: opts.parentSceneUuid,
    refId: opts.characterRefId,
    position: opts.position,
    props: {
      animPack: opts.animPack ?? "sword_shield",
      loadout: opts.loadout,
      kind: "character",
      locomotionCore: true
    }
  });
}
function createWeaponSkillNode(opts) {
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
      weaponCollider: true
    }
  });
}
function createAnimPackNode(opts) {
  return createNode("anim_pack", opts.name, {
    uuid: opts.uuid,
    refId: opts.packId,
    props: { clips: opts.clips }
  });
}
function createLocomotionNode(opts) {
  return createNode("locomotion", opts.name ?? "locomotion_core", {
    uuid: opts.uuid,
    refId: "locomotion_core",
    props: {
      idleKey: opts.idleKey,
      walkKey: opts.walkKey,
      runKey: opts.runKey,
      sprintKey: opts.sprintKey,
      continuousGait: opts.continuousGait !== false,
      skillLocoRetain: 0.55
    }
  });
}
function createCharacterDeployBundle(opts) {
  const graph = createGraph(`${opts.name}_deploy`);
  const char = createNode("character", opts.name, {
    refId: opts.characterRefId,
    props: {
      animPack: opts.animPack,
      skeleton: opts.skeleton ?? "bip001"
    }
  });
  const loco = createLocomotionNode({
    idleKey: "locomotion/idle",
    walkKey: "locomotion/walking",
    runKey: "locomotion/running",
    sprintKey: "locomotion/sprint"
  });
  const pack = createAnimPackNode({
    name: opts.animPack,
    packId: opts.animPack,
    clips: {}
  });
  pack.props = {
    ...pack.props,
    skeleton: opts.skeleton ?? "bip001",
    registry: "@grudge-studio/assets ANIM_PACKS"
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
      animPack: opts.animPack
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
      rangeM: s.rangeM ?? 2.5
    });
    g = addNode(g, skill);
    g = linkNodes(g, char.uuid, skill.uuid, "uses_skill");
  }
  return g;
}
function validateGraph(graph) {
  const errors = [];
  const warnings = [];
  if (!graph.uuid) errors.push("graph.uuid missing");
  if (!Array.isArray(graph.nodes)) errors.push("graph.nodes missing");
  const ids = /* @__PURE__ */ new Set();
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
    (n) => n.kind === "character" || n.kind === "spawn"
  );
  if (!hasChar) warnings.push("no character/spawn nodes");
  const hasLoco = (graph.nodes ?? []).some((n) => n.kind === "locomotion");
  if (hasChar && !hasLoco) {
    warnings.push("character without locomotion node \u2014 prefer LocomotionCore");
  }
  return { ok: errors.length === 0, errors, warnings };
}
function serializeGraph(graph) {
  return JSON.stringify(graph, null, 2);
}
function parseGraph(json) {
  const g = JSON.parse(json);
  if (!g.uuid || !Array.isArray(g.nodes)) {
    throw new Error("invalid_deploy_graph");
  }
  return g;
}
export {
  QUALITY_SYSTEM,
  addNode,
  childrenOf,
  createAnimPackNode,
  createCharacterDeployBundle,
  createCharacterSpawnNode,
  createGraph,
  createLocomotionNode,
  createNode,
  createUuid,
  createWeaponSkillNode,
  findNode,
  linkNodes,
  nodesByKind,
  parseGraph,
  qualityChecklist,
  serializeGraph,
  validateGraph
};
//# sourceMappingURL=index.js.map