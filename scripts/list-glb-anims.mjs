import fs from "node:fs";

const path = process.argv[2] || "D:/Games/Models/one_piece_bounty_rush_adio.glb";
const buf = fs.readFileSync(path);
const magic = buf.toString("utf8", 0, 4);
if (magic !== "glTF") {
  console.error("not glTF", magic);
  process.exit(1);
}
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const anims = (json.animations || []).map((a, i) => a.name || `anim_${i}`);
console.log(JSON.stringify({
  file: path,
  animationCount: anims.length,
  animations: anims,
  skins: (json.skins || []).length,
  nodes: (json.nodes || []).length,
  meshes: (json.meshes || []).length,
  boneLike: (json.nodes || [])
    .map((n) => n.name)
    .filter(Boolean)
    .filter((n) => /mixamo|bip|hand|hip|spine|arm|leg|root|joint|pelvis|foot/i.test(n))
    .slice(0, 50),
}, null, 2));
