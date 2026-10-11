"use strict";
/**
 * powerbi-visuals-tools@7.2.1 busca "powerbi-visuals-api" con una ruta
 * literal `path.join(process.cwd(), "node_modules", "powerbi-visuals-api")`
 * (ver node_modules/powerbi-visuals-tools/lib/WebPackWrap.js, funciones
 * configureAPIVersion() y loadAPIPackage()). No usa resolución de módulos
 * de Node, así que el hoisting de npm workspaces NO le sirve: cada visual
 * necesita su propia copia local de powerbi-visuals-api en su node_modules.
 *
 * Este script copia (no symlink, para que funcione igual en Windows) la
 * copia ya instalada en el node_modules raíz hacia cada visual. Se corre
 * automáticamente como "postinstall" (ver package.json), y también se
 * puede correr a mano: node scripts/link-api-locally.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "node_modules", "powerbi-visuals-api");
const VISUALS_DIR = path.join(ROOT, "kodex-additional-visuals");

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("No se encontró node_modules/powerbi-visuals-api en el root. ¿Corriste npm install?");
    process.exit(1);
  }

  const visuals = fs
    .readdirSync(VISUALS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const visual of visuals) {
    const dest = path.join(VISUALS_DIR, visual, "node_modules", "powerbi-visuals-api");
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(SOURCE, dest, { recursive: true });
    console.log(`${visual}: powerbi-visuals-api copiado localmente`);
  }
}

main();
