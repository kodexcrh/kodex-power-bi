# KODEX Timeline

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
      }
    ]
  },
  {
    "displayName": "Inicio",
    "name": "start",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "dateTime": true
      },
      {
        "text": true
      }
    ]
  },
  {
    "displayName": "Fin",
    "name": "end",
    "kind": "Grouping",
    "requiredTypes": [
      {
        "dateTime": true
      },
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
