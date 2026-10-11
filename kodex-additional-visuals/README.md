# KODEX Additional Visuals v4

Se agregan seis visuales personalizados para ampliar la suite:

1. KODEX Bar Chart — barras.
2. KODEX Progress — progreso circular.
3. KODEX Donut — circular/donut.
4. KODEX Gauge — indicador de meta.
5. KODEX Geo Map — ubicaciones por latitud/longitud con burbujas.
6. KODEX Table — tabla moderna.

Todos usan el modelo moderno de formato de Power BI y exponen configuración de fondo, bordes, radio, colores, texto y guías.

## Geo Map
Arrastra:
- Lugar
- Latitud
- Longitud
- Tamaño

El mapa incluido es un visual geográfico propio basado en proyección de coordenadas; no depende de un mapa de Microsoft ni de AppSource.

## Compilación
Cada carpeta es un proyecto independiente:

```bash
npm install
npm run package
```

El resultado será un archivo `.pbiviz` en `dist/`.

## Nota de propiedad
El código de estos proyectos es fuente propia de KODEX. Si el visual se desarrolla como parte de una relación laboral, la titularidad legal puede depender del contrato, políticas de propiedad intelectual y jurisdicción aplicables. Técnicamente puedes distribuir/importar los `.pbiviz` de forma privada en tu entorno sin publicarlos en AppSource.
