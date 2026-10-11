# KODEX Sankey

KODEX Power BI custom visual (V7).

## Datos
[
  {
    "displayName": "Origen",
    "name": "source",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "text": true
      }
    ]
  },
  {
    "displayName": "Destino",
    "name": "destination",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "text": true
      }
    ]
  },
  {
    "displayName": "Valor",
    "name": "value",
    "kind": "Measure",
    "requiredTypes": [
      {
        "numeric": true
      }
    ]
  }
]

## Empaquetado
```bash
npm install
npm run package
```

Desde la raíz del suite: `npm run package:all`.
