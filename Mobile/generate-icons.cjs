/**
 * Gera todos os ícones do launcher Android para TransEscolar.
 * Executa com: node generate-icons.js
 */
const sharp = require("sharp")
const path = require("path")
const fs = require("fs")

const RES = path.join(__dirname, "android/app/src/main/res")

// ── SVG base 1024×1024 – ícone completo (com fundo) ──────────────────────────
// Ônibus branco centralizado em fundo gradiente azul escuro.
// Transformação do bus (viewBox 0 0 64 64): scale 10.2, centrado.
const BUS_TRANSFORM = "translate(179, 172) scale(10.2)"

function busShapes(opts = {}) {
  const body     = opts.body     ?? "#FFFFFF"
  const windows  = opts.windows  ?? "#93C5FD"
  const door     = opts.door     ?? "#DBEAFE"
  const wheels   = opts.wheels   ?? "#FFFFFF"
  const hub      = opts.hub      ?? "#1e3a8a"
  const hubInner = opts.hubInner ?? "#93C5FD"
  const stripe   = opts.stripe   ?? "#BFDBFE"
  const line     = opts.line     ?? "#DBEAFE"

  return `
    <!-- corpo -->
    <rect x="6" y="14" width="52" height="32" rx="6" fill="${body}"/>
    <!-- faixa teto -->
    <rect x="6" y="14" width="52" height="8" rx="6" fill="${stripe}"/>
    <rect x="6" y="18" width="52" height="4" fill="${stripe}"/>
    <!-- janelas -->
    <rect x="12" y="18" width="10" height="9" rx="2" fill="${windows}"/>
    <rect x="27" y="18" width="10" height="9" rx="2" fill="${windows}"/>
    <rect x="42" y="18" width="10" height="9" rx="2" fill="${windows}"/>
    <!-- porta -->
    <rect x="42" y="30" width="10" height="12" rx="2" fill="${door}"/>
    <rect x="46.5" y="30" width="1" height="12" fill="${stripe}"/>
    <!-- para-choques -->
    <rect x="4"  y="36" width="4" height="6" rx="2" fill="${body}" fill-opacity="0.7"/>
    <rect x="56" y="36" width="4" height="6" rx="2" fill="${body}" fill-opacity="0.7"/>
    <!-- faróis -->
    <rect x="6"  y="28" width="5" height="4" rx="1" fill="#FEF08A"/>
    <!-- lanternas -->
    <rect x="53" y="28" width="5" height="4" rx="1" fill="#FCA5A5"/>
    <!-- fundo inferior -->
    <rect x="8" y="44" width="48" height="4" rx="2" fill="#1E40AF" fill-opacity="0.25"/>
    <!-- linha central -->
    <rect x="6" y="32" width="52" height="1" fill="${line}" fill-opacity="0.5"/>
    <!-- rodas esquerda -->
    <circle cx="18" cy="48" r="6" fill="${wheels}"/>
    <circle cx="18" cy="48" r="3.5" fill="${hub}"/>
    <circle cx="18" cy="48" r="1.5" fill="${hubInner}"/>
    <!-- rodas direita -->
    <circle cx="46" cy="48" r="6" fill="${wheels}"/>
    <circle cx="46" cy="48" r="3.5" fill="${hub}"/>
    <circle cx="46" cy="48" r="1.5" fill="${hubInner}"/>
  `
}

// Ícone completo (com fundo gradiente) – usado em ic_launcher e ic_launcher_round
function launcherSvg(size, rounded = false) {
  const rx = rounded ? size / 2 : Math.round(size * 0.22)
  const scale = size / 1024
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>
  <g transform="scale(${scale}) ${BUS_TRANSFORM}">
    ${busShapes()}
  </g>
</svg>`
}

// Foreground adaptativo – fundo transparente, ônibus centralizado na safe zone (66%)
function foregroundSvg(size) {
  // O foreground é 108dp; safe zone é 72dp = 66.7%
  // Bus ocupa ~65% do canvas para ficar dentro do safe zone
  const innerScale = size * 0.65 / 1024
  const busW = 56 * 10.2 * innerScale
  const busH = 40 * 10.2 * innerScale
  const tx = (size - busW) / 2 - 4 * 10.2 * innerScale
  const ty = (size - busH) / 2 - 14 * 10.2 * innerScale
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${tx.toFixed(1)}, ${ty.toFixed(1)}) scale(${(10.2 * innerScale).toFixed(4)})">
    ${busShapes({ hub: "#1e3a8a", hubInner: "#60A5FA" })}
  </g>
</svg>`
}

// ── Tamanhos por pasta ──────────────────────────────────────────────────────
const DENSITIES = [
  { folder: "mipmap-mdpi",     launcher: 48,  foreground: 108 },
  { folder: "mipmap-hdpi",     launcher: 72,  foreground: 162 },
  { folder: "mipmap-xhdpi",    launcher: 96,  foreground: 216 },
  { folder: "mipmap-xxhdpi",   launcher: 144, foreground: 324 },
  { folder: "mipmap-xxxhdpi",  launcher: 192, foreground: 432 },
]

async function generateAll() {
  for (const { folder, launcher, foreground } of DENSITIES) {
    const dir = path.join(RES, folder)
    fs.mkdirSync(dir, { recursive: true })

    // ic_launcher.png – ícone quadrado com cantos arredondados
    await sharp(Buffer.from(launcherSvg(launcher * 4)))
      .resize(launcher, launcher)
      .png()
      .toFile(path.join(dir, "ic_launcher.png"))

    // ic_launcher_round.png – versão circular
    await sharp(Buffer.from(launcherSvg(launcher * 4, true)))
      .resize(launcher, launcher)
      .png()
      .toFile(path.join(dir, "ic_launcher_round.png"))

    // ic_launcher_foreground.png – camada frontal adaptativa (fundo transparente)
    await sharp(Buffer.from(foregroundSvg(foreground * 4)))
      .resize(foreground, foreground)
      .png()
      .toFile(path.join(dir, "ic_launcher_foreground.png"))

    console.log(`✓ ${folder}: launcher ${launcher}px, foreground ${foreground}px`)
  }
}

generateAll().then(() => console.log("\nIcones gerados com sucesso!")).catch(console.error)
