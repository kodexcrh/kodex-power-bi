# KODEX Donut

KODEX Power BI custom visual (V7).

## Datos
[
  {
    "displayName": "Categoría",
    "name": "category",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "text": true
      },
      {
        "integer": true
      },
      {
        "numeric": true
      },
      {
        "dateTime": true
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
