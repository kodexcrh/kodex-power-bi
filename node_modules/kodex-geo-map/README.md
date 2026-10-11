# KODEX Geo Map

KODEX Power BI custom visual (V7).

## Datos
[
  {
    "displayName": "Lugar",
    "name": "category",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "text": true
      }
    ]
  },
  {
    "displayName": "Latitud",
    "name": "latitude",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "numeric": true
      }
    ]
  },
  {
    "displayName": "Longitud",
    "name": "longitude",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "numeric": true
      }
    ]
  },
  {
    "displayName": "Tamaño",
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
