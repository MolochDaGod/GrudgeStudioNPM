import { CHARACTER_SI } from '@grudge-studio/character';
import { BAKE_QUALITY_GATES } from '@grudge-studio/bake';

/**
 * One quality system for editor + deployer + runtime hosts.
 */

type QualityDomain = "bake" | "character" | "npc" | "unit" | "editor" | "deployer" | "runtime_3d";
interface QualitySystemManifest {
    version: string;
    editorUrl: string;
    cdn: string;
    domains: QualityDomain[];
    characterDeploySteps: readonly string[];
    characterKillList: readonly string[];
    bakeGates: typeof BAKE_QUALITY_GATES;
    si: typeof CHARACTER_SI;
    defaultUnitCount: number;
    defaultNpcCount: number;
    requiredHostPackages: string[];
    requiredNpmSlices: string[];
}
/** SSOT manifest — import from Forge, CI, or game onboarding */
declare const QUALITY_SYSTEM: QualitySystemManifest;
declare function qualityChecklist(): string[];

/**
 * UUID node graph for editor + deployer — scenes, characters, units, skills.
 * Every deployable object gets a stable UUID for D1/R2/Railway/Forge.
 */
type NodeKind = "scene" | "character" | "npc" | "unit" | "weapon_skill" | "anim_pack" | "mesh" | "collider" | "spawn" | "path" | "trigger" | "locomotion" | "blend_layer";
interface DeployNode {
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
interface DeployEdge {
    from: string;
    to: string;
    /** relationship: "child" | "uses_skill" | "uses_pack" | "spawns" | "collides" */
    rel?: string;
}
interface DeployGraph {
    uuid: string;
    name: string;
    version: number;
    nodes: DeployNode[];
    /** Edges: fromUuid → toUuid */
    edges?: DeployEdge[];
}
/** RFC4122-ish v4 UUID without crypto dependency when available */
declare function createUuid(): string;
declare function createNode(kind: NodeKind, name: string, partial?: Partial<DeployNode>): DeployNode;
declare function createGraph(name: string, nodes?: DeployNode[]): DeployGraph;
declare function addNode(graph: DeployGraph, node: DeployNode): DeployGraph;
declare function linkNodes(graph: DeployGraph, from: string, to: string, rel?: string): DeployGraph;
declare function findNode(graph: DeployGraph, uuid: string): DeployNode | undefined;
declare function nodesByKind(graph: DeployGraph, kind: NodeKind): DeployNode[];
declare function childrenOf(graph: DeployGraph, parentUuid: string): DeployNode[];
/** Spawn nodes for characters/units on a scene */
declare function createCharacterSpawnNode(opts: {
    name: string;
    characterRefId: string;
    position: [number, number, number];
    parentSceneUuid?: string;
    animPack?: string;
    loadout?: Record<string, unknown>;
    uuid?: string;
}): DeployNode;
declare function createWeaponSkillNode(opts: {
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
}): DeployNode;
declare function createAnimPackNode(opts: {
    name: string;
    packId: string;
    clips: Record<string, string>;
    uuid?: string;
}): DeployNode;
declare function createLocomotionNode(opts: {
    name?: string;
    idleKey: string;
    walkKey: string;
    runKey: string;
    sprintKey?: string;
    continuousGait?: boolean;
    uuid?: string;
}): DeployNode;
/**
 * Scaffold a playable character deploy subgraph:
 * character + locomotion + anim pack + weapon skills, all UUID-linked.
 * Optional skill list; if omitted, host should load skills from getAnimPack(animPack).
 */
declare function createCharacterDeployBundle(opts: {
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
}): DeployGraph;
interface GraphValidation {
    ok: boolean;
    errors: string[];
    warnings: string[];
}
declare function validateGraph(graph: DeployGraph): GraphValidation;
/** Serialize graph for ObjectStore / Railway */
declare function serializeGraph(graph: DeployGraph): string;
declare function parseGraph(json: string): DeployGraph;

export { type DeployEdge, type DeployGraph, type DeployNode, type GraphValidation, type NodeKind, QUALITY_SYSTEM, type QualityDomain, type QualitySystemManifest, addNode, childrenOf, createAnimPackNode, createCharacterDeployBundle, createCharacterSpawnNode, createGraph, createLocomotionNode, createNode, createUuid, createWeaponSkillNode, findNode, linkNodes, nodesByKind, parseGraph, qualityChecklist, serializeGraph, validateGraph };
