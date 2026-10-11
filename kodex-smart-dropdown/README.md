# KODEX Smart Dropdown — Power BI Custom Visual

Selector moderno para Power BI pensado para:

- Años
- Meses
- Días
- Personas
- Habitaciones
- Clientes
- Servicios
- Estados
- Cualquier lista categórica

## Campos

Arrastra una columna al bucket **Lista**.

Power BI puede entregar categorías de texto, enteros, numéricos o fecha/hora; el visual conserva el orden recibido por el modelo.

## Estilo configurable

Desde el panel Formato:

### Contenedor
- Fondo
- Opacidad
- Color de borde
- Grosor
- Radio
- Sombra
- Opacidad de sombra

### Texto
- Color
- Placeholder
- Tamaño
- Familia tipográfica
- Peso

### Acento
- Color de acento
- Fondo hover
- Fondo seleccionado
- Texto seleccionado

### Comportamiento
- Búsqueda
- Cantidad
- Selección múltiple
- Altura máxima
- Espaciado
- Flecha

## Interacción

El visual crea selection IDs para cada categoría y utiliza el Selection Manager de Power BI. Al seleccionar una opción, el resto de visuales del reporte puede responder mediante las interacciones configuradas del informe.

## Instalación de desarrollo

Requiere Node.js 18+.

```bash
npm install
npm run start
```

Para empaquetar:

```bash
npm run package
```

El resultado será un `.pbiviz` dentro de `dist/`.

## Ejemplos

### Año
`Calendario[Año]`

### Mes
`Calendario[Mes]`

### Personas
`Personal[Nombre]`

### Habitaciones
`Habitaciones[Habitación]`

El mismo visual sirve para todas esas listas.
