"use strict";
/**
 * Aplica a los visuales de kodex-additional-visuals/* los mismos fixes
 * verificados manualmente en kodex-bar-chart:
 *
 *  1) pbiviz.json: agrega "capabilities": "capabilities.json" si falta
 *  2) pbiviz.json: si "assets" está vacío, agrega assets.icon + copia icon.png
 *  3) capabilities.json: quita {"dateTime": true} de requiredTypes (bug del
 *     schema.capabilities.json de powerbi-visuals-api@5.11.1: dateTime existe
 *     en los .d.ts pero no en el schema de validación)
 *  4) src/visual.ts: corrige el import de powerbi-visuals-api (solo tiene
 *     export default en esta versión, no exports nombrados)
 *  5) src/visual.ts: this.root.innerHTML="" -> this.root.replaceChildren()
 *     (regla eslint no-unsafe-innerhtml)
 *  6) src/visual.ts: literal de identidad (ej. "donut"===...) -> const
 *     CHART_TYPE:string="donut"; CHART_TYPE===...  (evita TS2367, cero
 *     cambios de comportamiento)
 *  7) src/visual.ts: cast svgEl("svg",{...}) as unknown as SVGSVGElement,
 *     SOLO en archivos donde exista una llamada this.render(svg, ...)
 *  8) src/settings.ts: FormattingSettingsModel -> formattingSettings.Model
 *     (ya no existe como export nombrado en la versión 6.2.2 instalada)
 *
 * No toca kodex-bar-chart (ya corregido y verificado a mano).
 * Idempotente: si un archivo ya tiene el fix aplicado, no lo vuelve a tocar.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "kodex-additional-visuals");
const SKIP = new Set(["kodex-bar-chart"]);
const ICON_SOURCE = path.join(ROOT, "kodex-bubble-matrix", "assets", "icon.png");

const report = [];

function log(visual, msg) {
  report.push(`${visual}: ${msg}`);
}

function fixPbiviz(dir, visual) {
  const p = path.join(dir, "pbiviz.json");
  if (!fs.existsSync(p)) { log(visual, "SKIP pbiviz.json no existe"); return; }
  const raw = fs.readFileSync(p, "utf8");
  const json = JSON.parse(raw);
  let changed = false;

  if (!json.capabilities) {
    json.capabilities = "capabilities.json";
    changed = true;
    log(visual, "pbiviz.json: agregado capabilities");
  }

  if (!json.assets || Object.keys(json.assets).length === 0) {
    json.assets = { icon: "assets/icon.png" };
    changed = true;
    const assetsDir = path.join(dir, "assets");
    const iconDest = path.join(assetsDir, "icon.png");
    if (!fs.existsSync(iconDest)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      fs.copyFileSync(ICON_SOURCE, iconDest);
      log(visual, "pbiviz.json: agregado assets.icon + copiado icon.png");
    } else {
      log(visual, "pbiviz.json: agregado assets.icon (icon.png ya existía)");
    }
  }

  if (changed) fs.writeFileSync(p, JSON.stringify(json, null, 2) + "\n", "utf8");
}

function fixCapabilities(dir, visual) {
  const p = path.join(dir, "capabilities.json");
  if (!fs.existsSync(p)) { log(visual, "SKIP capabilities.json no existe"); return; }
  const json = JSON.parse(fs.readFileSync(p, "utf8"));
  let removed = 0;
  for (const role of json.dataRoles || []) {
    if (!Array.isArray(role.requiredTypes)) continue;
    const before = role.requiredTypes.length;
    role.requiredTypes = role.requiredTypes.filter(
      (t) => !(t && typeof t === "object" && Object.keys(t).length === 1 && t.dateTime === true)
    );
    removed += before - role.requiredTypes.length;
  }
  if (removed > 0) {
    fs.writeFileSync(p, JSON.stringify(json, null, 2) + "\n", "utf8");
    log(visual, `capabilities.json: quitadas ${removed} entrada(s) dateTime`);
  }
}

function fixVisualTs(dir, visual) {
  const p = path.join(dir, "src", "visual.ts");
  if (!fs.existsSync(p)) { log(visual, "SKIP src/visual.ts no existe"); return; }
  let src = fs.readFileSync(p, "utf8");
  let changed = false;

  // 4) import roto de powerbi-visuals-api
  const badImport = 'import { IVisual, VisualConstructorOptions, VisualUpdateOptions, ISelectionId } from "powerbi-visuals-api";';
  if (src.includes(badImport)) {
    src = src.replace(
      badImport,
      [
        "import IVisual = powerbi.extensibility.visual.IVisual;",
        "import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;",
        "import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;",
        "import ISelectionId = powerbi.visuals.ISelectionId;",
      ].join("\n")
    );
    changed = true;
    log(visual, "visual.ts: import powerbi-visuals-api corregido");
  }

  // 5) innerHTML inseguro
  if (src.includes('this.root.innerHTML="";')) {
    src = src.replace('this.root.innerHTML="";', "this.root.replaceChildren();");
    changed = true;
    log(visual, "visual.ts: innerHTML -> replaceChildren()");
  }

  // 6) literal de identidad en comparaciones de tipo
  const tokenMatches = [...src.matchAll(/"([a-zA-Z0-9_-]+)"===/g)].map((m) => m[1]);
  const uniqueTokens = [...new Set(tokenMatches)];
  if (uniqueTokens.length === 1) {
    const token = uniqueTokens[0];
    const constLine = `const CHART_TYPE:string="${token}";\n`;
    const anchor = 'const NS="http://www.w3.org/2000/svg";';
    if (src.includes(anchor) && !src.includes("const CHART_TYPE:string=")) {
      src = src.replace(anchor, constLine + anchor);
      src = src.split(`"${token}"===`).join("CHART_TYPE===");
      changed = true;
      log(visual, `visual.ts: literal "${token}" -> CHART_TYPE (${tokenMatches.length} ocurrencias)`);
    }
  } else if (uniqueTokens.length > 1) {
    log(visual, `REVISAR A MANO: múltiples literales de tipo encontrados (${uniqueTokens.join(", ")})`);
  }

  // 7) cast SVGSVGElement, solo si hay una llamada this.render(svg,
  if (/this\.render\(\s*svg\s*,/.test(src)) {
    const svgCallRe = /svgEl\("svg",\{[^}]*\}\)(?!\s*as\s)/;
    if (svgCallRe.test(src)) {
      src = src.replace(svgCallRe, (m) => `${m} as unknown as SVGSVGElement`);
      changed = true;
      log(visual, "visual.ts: cast SVGSVGElement agregado");
    }
  }

  if (changed) fs.writeFileSync(p, src, "utf8");
}

function fixSettingsTs(dir, visual) {
  const p = path.join(dir, "src", "settings.ts");
  if (!fs.existsSync(p)) { log(visual, "SKIP src/settings.ts no existe"); return; }
  let src = fs.readFileSync(p, "utf8");
  let changed = false;

  const badImport = 'import { formattingSettings, FormattingSettingsService, FormattingSettingsModel } from "powerbi-visuals-utils-formattingmodel";';
  const goodImport = 'import { formattingSettings, FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";';
  if (src.includes(badImport)) {
    src = src.replace(badImport, goodImport);
    changed = true;
  }

  const badExtends = "export class VisualFormattingSettingsModel extends FormattingSettingsModel {";
  const goodExtends = "export class VisualFormattingSettingsModel extends formattingSettings.Model {";
  if (src.includes(badExtends)) {
    src = src.replace(badExtends, goodExtends);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, src, "utf8");
    log(visual, "settings.ts: FormattingSettingsModel -> formattingSettings.Model");
  }
}

function main() {
  const visuals = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP.has(e.name))
    .map((e) => e.name)
    .sort();

  for (const visual of visuals) {
    const dir = path.join(ROOT, visual);
    fixPbiviz(dir, visual);
    fixCapabilities(dir, visual);
    fixVisualTs(dir, visual);
    fixSettingsTs(dir, visual);
  }

  console.log(report.join("\n"));
  console.log(`\nTotal visuales procesados: ${visuals.length}`);
}

main();
