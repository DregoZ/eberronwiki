# Propuesta de arquitectura — Wiki interactiva de Eberron (Angular)

> Versión objetivo: **Angular 22** (última estable, junio 2026) — signal-first, standalone/selectorless components, zoneless por defecto, Signal Forms estable. Toda la propuesta asume estas capacidades.

---

## 1. Decisiones de arquitectura clave

| Decisión | Elección | Por qué |
|---|---|---|
| Arquitectura de componentes | **Standalone, sin NgModules** | Es el estándar en Angular 22; menos boilerplate, mejor tree-shaking, `imports` explícitos por componente |
| Gestión de estado | **Signals** (no NgRx/Akita) | La app es de solo-lectura, sin mutaciones complejas de servidor; signals dan reactividad fina sin la sobrecarga de un store completo |
| Carga de contenido | **`httpResource()` + JSON estático** | API estable en v22 para datos async basados en signals; reemplaza el patrón manual `Observable + async pipe` con menos código |
| Renderizado de bloques | **Component Factory Pattern vía `NgComponentOutlet`** con un registro de tipo `Record<BlockType, Type<Component>>` | Es la pieza central de todo el diseño — lo justifico en detalle en la sección 6 |
| Enlaces internos `[[Página]]` | **Pipe/Directiva de parsing + regex → `routerLink` dinámico** | Evita `[innerHTML]` con `bypassSecurityTrustHtml` siempre que sea posible; más seguro y más testeable |
| Persistencia (favoritos, historial, notas) | **Signals + `localStorage`** (sin backend) | Cero infraestructura; encapsulado detrás de un servicio para poder cambiar de storage backend sin tocar componentes |
| Búsqueda | **Índice en memoria + Fuse.js** | Fuzzy search sin backend; dataset pequeño-mediano (wiki de campaña, no Wikipedia) |
| Mapas | **Leaflet.js envuelto en un `MapComponent`** | Librería madura, ligera, con soporte nativo de imágenes como "mapa" (no necesitas tiles reales) |

---

## 2. Estructura de carpetas

```
src/
├── app/
│   ├── app.config.ts                 # bootstrapApplication + providers
│   ├── app.routes.ts                 # rutas raíz
│   ├── app.component.ts              # shell: landing vs layout principal
│   │
│   ├── core/                         # infraestructura transversal, sin UI
│   │   ├── services/
│   │   │   ├── content.service.ts        # carga y cachea JSON de páginas
│   │   │   ├── navigation.service.ts     # construye el árbol del sidebar
│   │   │   ├── search.service.ts         # índice + búsqueda fuzzy
│   │   │   ├── link-parser.service.ts    # [[Enlace]] → RouterLink
│   │   │   ├── favorites.service.ts
│   │   │   ├── history.service.ts
│   │   │   ├── theme.service.ts          # modo oscuro
│   │   │   └── unlockable-content.service.ts
│   │   ├── models/
│   │   │   ├── page.model.ts
│   │   │   ├── block.model.ts            # unión discriminada de bloques
│   │   │   ├── nav-node.model.ts
│   │   │   ├── marker.model.ts
│   │   │   └── search-index-entry.model.ts
│   │   └── guards/
│   │       └── unlockable-content.guard.ts
│   │
│   ├── layout/
│   │   ├── main-layout/
│   │   │   └── main-layout.component.ts   # sidebar + <router-outlet>
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   └── sidebar-node/
│   │   │       └── sidebar-node.component.ts   # recursivo, un nivel del árbol
│   │   ├── breadcrumb/
│   │   │   └── breadcrumb.component.ts
│   │   └── search-bar/
│   │       └── search-bar.component.ts
│   │
│   ├── landing/
│   │   └── landing.component.ts
│   │
│   ├── pages/
│   │   └── page-viewer/
│   │       └── page-viewer.component.ts   # resuelve slug → JSON → lista de bloques
│   │
│   ├── blocks/                        # un componente por tipo de bloque
│   │   ├── block-registry.ts          # mapa BlockType -> Component (ver sección 6)
│   │   ├── text-block/
│   │   ├── image-block/
│   │   ├── quote-block/
│   │   ├── info-block/
│   │   ├── table-block/
│   │   ├── separator-block/
│   │   ├── related-block/
│   │   └── map-block/                 # fase 2
│   │       ├── map-block.component.ts
│   │       └── map-pin/
│   │           └── map-pin.component.ts
│   │
│   └── shared/
│       ├── directives/
│       │   └── internal-link.directive.ts
│       ├── pipes/
│       │   └── parse-internal-links.pipe.ts
│       └── ui/                        # botones, chips, etc. (Angular Material wrappers)
│
├── assets/
│   ├── content/
│   │   ├── nav.json                   # árbol de navegación completo
│   │   ├── eberron/
│   │   │   ├── historia.json
│   │   │   └── geografia/
│   │   │       ├── khorvaire.json
│   │   │       ├── xendrik.json
│   │   │       └── aerenal.json
│   │   ├── personajes/
│   │   ├── objetos/
│   │   ├── localizaciones/
│   │   └── campanas/
│   └── images/
│       ├── landing/
│       ├── personajes/
│       └── mapas/
│
└── styles/
    ├── _tokens.scss                   # variables de tema (claro/oscuro)
    └── styles.scss
```

**Ventaja de este layout**: `core/` no importa nada de `blocks/` ni `pages/` — la dependencia va en un solo sentido (features → core). Esto hace que el proyecto sea escalable: añadir un tipo de bloque nuevo no toca `core/`, y añadir un servicio nuevo no toca `blocks/`.

---

## 3. Modelos e interfaces

### 3.1 Página y navegación

```typescript
// core/models/nav-node.model.ts
export interface NavNode {
  id: string;
  label: string;
  slug: string;           // usado para construir la ruta, ej. "eberron/geografia/khorvaire"
  children?: NavNode[];
  icon?: string;
  locked?: boolean;       // contenido desbloqueable (fase futura)
}

// core/models/page.model.ts
export interface PageContent {
  slug: string;
  title: string;
  tags?: string[];
  aliases?: string[];       // para búsqueda y enlaces internos
  unlockCondition?: string; // id de hito de campaña, null = siempre visible
  blocks: ContentBlock[];
}
```

### 3.2 Bloques — unión discriminada (la pieza más importante del modelo)

```typescript
// core/models/block.model.ts
export type ContentBlock =
  | TextBlock
  | ImageBlock
  | QuoteBlock
  | InfoBlock
  | TableBlock
  | SeparatorBlock
  | RelatedBlock
  | MapBlock;

interface BaseBlock {
  type: string;
  id: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;          // admite sintaxis [[Enlace]]
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  caption?: string;
  title?: string;
  align?: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'full';
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
  author?: string;
}

export interface InfoBlock extends BaseBlock {
  type: 'info';
  variant: 'note' | 'warning' | 'lore';
  content: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface SeparatorBlock extends BaseBlock {
  type: 'separator';
}

export interface RelatedBlock extends BaseBlock {
  type: 'related';
  items: { label: string; slug: string }[];
}

export interface MapBlock extends BaseBlock {
  type: 'map';
  image: string;
  pins: MapPin[];
}

export interface MapPin {
  id: string;
  x: number;      // porcentaje (0-100), no píxeles → responsive por diseño
  y: number;
  icon?: string;
  label: string;
  linkSlug?: string;
}
```

**Por qué unión discriminada y no herencia de clases**: TypeScript estrecha (`narrows`) el tipo automáticamente usando el campo `type` como discriminante, así el compilador te obliga a manejar cada caso en el registro de componentes (sección 6). Cero necesidad de `instanceof` ni casts manuales.

---

## 4. Servicios

| Servicio | Responsabilidad | Notas de implementación |
|---|---|---|
| `ContentService` | Carga un JSON de página por slug, cachea en un `Map<string, Signal<PageContent>>` | Usa `httpResource()`; expone `getPage(slug: string)` |
| `NavigationService` | Carga `nav.json` una vez al arrancar, expone el árbol como `Signal<NavNode[]>` | Singleton, `providedIn: 'root'` |
| `SearchService` | Construye índice Fuse.js a partir de todos los JSON (título, texto, tags, alias) | El índice se construye de forma **lazy** la primera vez que el usuario abre el buscador, no en el arranque |
| `LinkParserService` | Convierte `[[Sharn]]` → `{ label: 'Sharn', slug: 'sharn' }` usando `aliases` de `NavigationService` | Regex simple: `/\[\[(.+?)\]\]/g` |
| `FavoritesService` | CRUD de favoritos en `localStorage`, expuesto como signal | Interfaz agnóstica de storage (ver sección 9) |
| `HistoryService` | Registra últimas N páginas visitadas | Se engancha a eventos del `Router` (`NavigationEnd`) |
| `ThemeService` | Toggle claro/oscuro, persiste preferencia | Aplica clase en `<html>`, usa `prefers-color-scheme` como default |
| `UnlockableContentService` | Determina si una página/bloque está desbloqueado según el progreso de campaña actual | Progreso = un valor simple en `localStorage` (ej. `currentChapter: number`) comparado contra `unlockCondition` |

### Estrategia de carga de contenido (detalle)

```typescript
// core/services/content.service.ts
@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);

  getPage(slug: string) {
    return httpResource<PageContent>(() => `assets/content/${slug}.json`);
  }
}
```

- Cada `PageViewerComponent` pide su propio `httpResource` basado en el slug de la ruta activa — Angular gestiona loading/error state automáticamente vía `.isLoading()`, `.error()`, `.value()`.
- No hay un "cargar todo el contenido al arrancar": cada página se pide bajo demanda. Esto escala mejor cuanto más crezca la wiki (Eberron tiene *mucho* lore).
- Excepción: `nav.json` y los datos para el buscador sí se cargan de forma anticipada (son pequeños y necesarios globalmente).

---

## 5. Rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'wiki',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'eberron', pathMatch: 'full' },
      {
        path: ':slugPath',
        component: PageViewerComponent,
        // slugPath captura rutas tipo "eberron/geografia/khorvaire" via un
        // matcher custom (ver nota abajo), o se usa **un solo param wildcard**
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

**Nota sobre rutas anidadas de 2-3 niveles**: Angular Router no soporta directamente "un parámetro que capture múltiples segmentos" con `:slugPath` normal. Dos opciones limpias:

1. **Wildcard matcher** (recomendado): usar `**` como path y parsear `route.url` manualmente para reconstruir el slug completo. Más simple de mantener.
2. **Rutas generadas dinámicamente** desde `nav.json` en el arranque (recorres el árbol y generas un objeto `Route` por cada hoja). Más "correcto" desde el punto de vista de Angular, pero añade complejidad de bootstrap.

Para una wiki de 2-3 niveles como la tuya, recomiendo la **opción 1**: menos código, y el slug ya viene definido en el JSON de cada página de todos modos.

---

## 6. Patrón de diseño recomendado: registro de bloques + `NgComponentOutlet`

Esta es la decisión de arquitectura más importante de todo el proyecto, porque es lo que te permite decir "no quiero escribir HTML manualmente por página".

```typescript
// blocks/block-registry.ts
import { Type } from '@angular/core';
import { ContentBlock } from '../core/models/block.model';

export const BLOCK_REGISTRY: Record<ContentBlock['type'], Type<unknown>> = {
  text: TextBlockComponent,
  image: ImageBlockComponent,
  quote: QuoteBlockComponent,
  info: InfoBlockComponent,
  table: TableBlockComponent,
  separator: SeparatorBlockComponent,
  related: RelatedBlockComponent,
  map: MapBlockComponent,
};
```

```html
<!-- pages/page-viewer/page-viewer.component.html -->
@for (block of page.value()?.blocks ?? []; track block.id) {
  <ng-container
    *ngComponentOutlet="blockRegistry[block.type]; inputs: { block }"
  />
}
```

Cada componente de bloque (`TextBlockComponent`, `ImageBlockComponent`, etc.) declara un único `input<T>()` tipado con **su** variante específica de `ContentBlock`. Angular 22 permite pasar `inputs` directamente en `NgComponentOutlet`, así que no hace falta un wrapper manual con `ComponentFactoryResolver` (patrón obsoleto de versiones antiguas de Angular).

**Ventajas**:
- Añadir un tipo de bloque nuevo = crear el componente + una línea en `BLOCK_REGISTRY`. Cero cambios en `PageViewerComponent`.
- El JSON de contenido es la única fuente de verdad del orden y tipo de cada bloque.
- Totalmente compatible con lazy-loading de componentes de bloque si en el futuro la wiki crece mucho (`loadComponent` en vez de import directo).

**Inconveniente a tener en cuenta**: `NgComponentOutlet` pierde algo de type-safety en el `inputs` (es un `Record<string, unknown>` en tiempo de compilación). Si quieres máxima seguridad de tipos, la alternativa es un gran `@switch` en la plantilla:

```html
@switch (block.type) {
  @case ('text') { <app-text-block [block]="block" /> }
  @case ('image') { <app-image-block [block]="block" /> }
  <!-- ... -->
}
```

Esta segunda opción es más verbosa (hay que tocar el switch cada vez que añades un tipo) pero el compilador de Angular narrows correctamente el tipo de `block` en cada `@case` gracias a la unión discriminada. **Mi recomendación**: empieza con el `@switch` (más simple de depurar al principio) y migra a `NgComponentOutlet` + registro si el número de tipos de bloque crece mucho o quieres lazy-loading real.

---

## 7. Enlaces internos `[[Página]]`

```typescript
// shared/pipes/parse-internal-links.pipe.ts
@Pipe({ name: 'parseInternalLinks', pure: true })
export class ParseInternalLinksPipe implements PipeTransform {
  private linkParser = inject(LinkParserService);

  transform(text: string): { segments: (string | { label: string; slug: string })[] } {
    // divide el texto por el regex [[...]] y devuelve un array mixto
    // de strings planos y objetos { label, slug } para renderizar con @for + @switch
  }
}
```

En la plantilla del `TextBlockComponent`:

```html
@for (segment of (block().content | parseInternalLinks).segments; track $index) {
  @if (isLink(segment)) {
    <a [routerLink]="['/wiki', segment.slug]">{{ segment.label }}</a>
  } @else {
    {{ segment }}
  }
}
```

Esto evita `[innerHTML]` + sanitización manual, que sería la alternativa más simple pero menos segura y menos "Angular-idiomática" (pierdes `routerLink`, tendrías que interceptar clicks manualmente).

---

## 8. Mapas interactivos (arquitectura preparada para fase 2)

Aunque lo implementes después, el modelo de datos (`MapBlock`, `MapPin`, sección 3.2) ya está listo. Arquitectura recomendada:

- `MapBlockComponent` envuelve **Leaflet.js** en modo "imagen simple" (`L.CRS.Simple`), no mapas geográficos reales — es el patrón estándar para mapas de fantasía sobre una imagen.
- Los pines se renderizan como `L.marker` con `L.divIcon` (para poder usar iconos de Angular Material o SVG custom en vez de los iconos por defecto de Leaflet).
- El click en un pin navega usando el `Router` inyectado en el componente (no un `<a href>` plano), para mantener la navegación dentro de la SPA:
  ```typescript
  marker.on('click', () => this.router.navigate(['/wiki', pin.linkSlug]));
  ```
- Coordenadas en **porcentaje (0-100)** en vez de píxeles absolutos — así el mapa es responsive sin recalcular nada al cambiar el tamaño de imagen.

---

## 9. Funcionalidades futuras — cómo la arquitectura ya las soporta

| Funcionalidad | Cómo encaja sin refactor grande |
|---|---|
| **Modo oscuro** | `ThemeService` ya aislado; solo falta el toggle en la UI y las variables SCSS en `_tokens.scss` |
| **Favoritos** | `FavoritesService` con signal `favoriteSlug = signal<Set<string>>()`; cualquier componente puede inyectarlo |
| **Historial** | `HistoryService` enganchado a `Router.events`, independiente de las páginas |
| **Notas privadas** | Nuevo `PrivateNotesService` con la misma forma que `FavoritesService` (slug → texto libre en `localStorage`) |
| **Contenido desbloqueable** | Ya modelado (`unlockCondition` en `PageContent`, `UnlockableContentGuard` en rutas) |
| **Etiquetas** | Ya en el modelo (`tags?: string[]`); solo falta una vista de filtrado que lea `SearchService` |
| **Relaciones entre páginas** | `RelatedBlock` ya cubre el caso simple; para un grafo de relaciones más rico, se puede añadir un `relations.json` separado que no toque el modelo de bloques |
| **Cronologías** | Nuevo tipo de bloque `TimelineBlock` — se añade al registro sin tocar nada más (ver sección 6) |
| **Mapas interactivos** | Cubierto en sección 8 |

El principio de diseño que hace esto posible: **cada funcionalidad nueva es o (a) un servicio nuevo desacoplado, o (b) un tipo de bloque nuevo en el registro** — nunca un cambio transversal a `PageViewerComponent` o al modelo de rutas.

---

## 10. Librerías recomendadas

| Librería | Uso | Alternativa considerada | Por qué esta y no la otra |
|---|---|---|---|
| **Angular Material** | Componentes de UI (toolbar, sidenav, inputs) | Componentes custom desde cero | Pediste explícitamente Material; además el `MatSidenav` ya resuelve el layout de sidebar fijo gratis |
| **Fuse.js** | Búsqueda fuzzy en cliente | Lunr.js, Flexsearch | Fuse.js tiene mejor tolerancia a errores tipográficos (útil para nombres propios de Eberron) y API más simple |
| **Leaflet.js** | Mapas con pines (fase 2) | Construir con SVG/Canvas a mano | Leaflet resuelve zoom/pan/gestos táctiles gratis; usarlo en modo `CRS.Simple` es un patrón muy documentado para mapas de fantasía |
| **marked** o **ngx-markdown** (opcional) | Si quieres que `TextBlock.content` admita **negrita**, *cursiva*, listas, etc., además de `[[enlaces]]` | Parsear Markdown a mano | No reinventar un parser de Markdown; se combina bien parseando primero `[[enlaces]]` y pasando el resultado por el pipe de Markdown después |

**Nota sobre Angular Material y Signals**: Material 22 ya está adaptado a la arquitectura signal-first de Angular 22 (inputs/outputs como signals internamente), así que no hay fricción de integración.

---

## 11. Ventajas e inconvenientes del enfoque global

**Ventajas**
- Cero backend, cero base de datos → despliegue trivial (Netlify, Vercel, GitHub Pages, o incluso un ZIP servido por Foundry/un hosting estático cualquiera).
- Añadir contenido nuevo = escribir un JSON, no tocar código.
- El modelo de bloques hace que el "editor" de facto sea cualquier editor de texto/JSON — no necesitas construir un CMS.
- Escalable a features complejas (desbloqueables, relaciones, cronologías) sin romper lo ya construido.

**Inconvenientes / riesgos a vigilar**
- **Mantenimiento manual de JSON**: sin validación en tiempo de escritura, un JSON mal formado rompe una página en producción. Mitigación: generar un schema (JSON Schema o `zod`) y validar en build-time con un script de Node, no solo confiar en las interfaces de TypeScript (que no protegen datos externos en runtime).
- **Búsqueda no escala infinitamente**: Fuse.js en cliente con cientos de páginas grandes puede notarse. Para el tamaño de una campaña de D&D (probablemente decenas-bajas centenas de páginas) no debería ser problema.
- **Rutas con wildcard** (sección 5) son menos "type-safe" que rutas explícitas — hay que tener disciplina en cómo se construyen los slugs para que coincidan siempre con la estructura de carpetas de `assets/content/`.

---

## Próximos pasos sugeridos

1. Confirmar esta arquitectura o ajustar algún punto (¿prefieres `@switch` o `NgComponentOutlet` para bloques? ¿Fuse.js te parece bien o prefieres otra opción de búsqueda?).
2. Generar el proyecto base (`ng new`, configuración de Material, estructura de carpetas).
3. Implementar el "esqueleto" sin contenido real: landing → layout → sidebar (con `nav.json` de ejemplo) → una página con 2-3 tipos de bloque.
4. Añadir el resto de bloques y la búsqueda.
5. Fase 2: mapas con Leaflet.

¿Quieres que empecemos por el punto 2 (generar el proyecto) o prefieres primero afinar algún punto de esta propuesta?
