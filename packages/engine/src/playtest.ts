/**
 * Where to playtest a controller — fleet hosts, not GST /play.
 * Live games own Rapier CCT + Controller.ts / loadRaceKit.
 */

export type PlaytestSurface = {
  id: string;
  label: string;
  url: string;
  walk: "rapier-cct" | "lab-cct" | "kinematic-preview";
  controller: string;
  notes: string;
};

export const PLAYTEST_WITH_CONTROLLER = [
  {
    id: "open-danger",
    label: "Open Danger Room",
    url: "https://open.grudge-studio.com/danger",
    walk: "rapier-cct",
    controller: "Controller.ts + CharacterCapsuleKcc",
    notes: "Production play. WASD, mouse, C parry / X dodge. Gamepad if host wired.",
  },
  {
    id: "casting",
    label: "Casting Warlords lab",
    url: "https://casting.grudge-studio.com/",
    walk: "rapier-cct",
    controller: "loadRaceKit + PhysicsWorld CCT",
    notes: "Toon play proof. WASD + Shift run, F skills. Alias casting-abilities-threejs.vercel.app",
  },
  {
    id: "casting-vercel",
    label: "Casting (Vercel)",
    url: "https://casting-abilities-threejs.vercel.app/",
    walk: "rapier-cct",
    controller: "same Casting kit",
    notes: "Always-on Vercel alias of Casting.",
  },
  {
    id: "gladiators",
    label: "Grudge Gladiators",
    url: "https://grudge-combat.vercel.app/",
    walk: "rapier-cct",
    controller: "combat lab kit bake",
    notes: "Arena + /admin weapon skills. Not Open Danger.",
  },
  {
    id: "warlords-client",
    label: "Warlords island",
    url: "https://client.grudge-studio.com/",
    walk: "rapier-cct",
    controller: "Island3D addCharacterCapsule + moveCharacter",
    notes: "Needs character UUID handoff from Foundry. SI 1.8 m.",
  },
  {
    id: "grudgecontrol",
    label: "grudgecontrol lab",
    url: "https://grudgecontrol.vercel.app/",
    walk: "lab-cct",
    controller: "playerController + Rapier CCT (lab scale)",
    notes: "Harvest only. Mixamo 0.001 demos. Do not replace Controller.ts.",
  },
  {
    id: "gst-play",
    label: "Dev Tool Native Play",
    url: "grudge-dev-tool /play",
    walk: "kinematic-preview",
    controller: "PlayRuntime (SceneEngine, no Rapier)",
    notes: "Desktop preview. Not production CCT.",
  },
] as const satisfies readonly PlaytestSurface[];

export function productionPlaytestUrl(): string {
  return PLAYTEST_WITH_CONTROLLER[0].url;
}
