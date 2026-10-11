# KODEX Power BI Suite V7

Suite privado de visuales personalizados para Power BI. Incluye 21 visuales y un Design System compartido.

## Requisitos
- Node.js 18.18+
- npm 9+
- Power BI Visual Tools (instalado por npm)

## Instalación
```bash
npm install
```

## Validar TypeScript
```bash
npm run build
```

## Empaquetar todos los visuales
```bash
npm run package:all
```

## Empaquetar uno
```bash
npm run package:one -- kodex-smart-kpi
```

Los `.pbiviz` aparecen en `dist/` dentro de cada visual.

## Visuales
Card, Smart KPI, KPI Matrix, Bar Chart, Trend Chart, Waterfall, Funnel, Radar, Treemap, Timeline, Calendar Heatmap, Heatmap, Progress, Gauge, Sankey, Bubble Matrix, Scatter, Geo Map, Donut, Table y Smart Dropdown.

## Nota técnica
La V7 usa la FormattingModel API de Power BI (API 5.11) y `FormattingSettingsService` para que los valores del panel Formato se carguen en cada actualización. Las selecciones usan `SelectionManager` cuando el visual tiene puntos categóricos seleccionables.
