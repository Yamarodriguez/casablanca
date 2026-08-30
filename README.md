# Casablanca Bellevue 131

Web de la villa turística **Casablanca Bellevue 131** (Marbella, Málaga).
Sitio estático: HTML, CSS y JavaScript sin dependencias ni proceso de compilación.

> **Estado: boceto de presentación.** Los textos, precios, distancias y opiniones
> son de muestra. La web lleva `noindex` hasta que se dé por buena.

---

## Estructura

```
.
├── index.html              Toda la web. Cinco vistas conmutables.
├── assets/
│   ├── css/styles.css      Estilos
│   ├── js/app.js           Conmutador de vistas, hero, galería, reserva
│   └── img/                Fotografías (49 archivos)
├── vista-previa.jpg        Imagen al compartir el enlace
├── favicon.png             Icono de pestaña
├── apple-touch-icon.png    Icono en iOS
├── netlify.toml            Cabeceras y caché
└── robots.txt
```

El logotipo va como SVG vectorial en línea dentro de `index.html`, definido una
sola vez en tres bloqueos que se reutilizan con `<use>`:

| Símbolo    | Uso                                          |
|------------|----------------------------------------------|
| `#cb-full` | Lockup completo: hero y pie de página         |
| `#cb-mark` | Solo monograma: barra de navegación, favicon  |
| `#cb-word` | Solo texto                                    |

**Cuidado:** el `<svg>` exterior no debe repetir el `viewBox` del símbolo o el
dibujo se sale de cuadro. Para `#cb-full` con `height:auto` sí hay que declararlo.

---

## Las cinco vistas

`index.html` contiene la web y el material de presentación al cliente. Se cambia
con la barra superior:

| Pestaña      | Qué es                                                      |
|--------------|-------------------------------------------------------------|
| **Definitiva** | La web propuesta. Es la que abre por defecto.             |
| Concepto     | Justificación de las decisiones de diseño                    |
| A, B, C      | Las tres direcciones iniciales, como referencia              |

### Para publicar solo la web definitiva

Cuando la propiedad dé el visto bueno, en `index.html`:

1. Borrar el `<header class="chrome">…</header>` (la barra de pestañas).
2. Borrar las secciones `#viewC`, `#viewA`, `#viewB` y `#viewH`.
3. En `assets/js/app.js`, quitar el bloque «conmutador de vistas» y los de las
   propuestas A, B y C.
4. En `assets/css/styles.css`, quitar los bloques marcados `PROPUESTA A`,
   `PROPUESTA B`, `PROPUESTA C` y `VISTA 0 — CONCEPTO`.
5. Quitar `--bar` de los `calc()` de altura y el `padding-top` de `.views`.

---

## Publicar en Netlify

### Desde GitHub (recomendado: cada `push` despliega solo)

```bash
git init
git add .
git commit -m "Web de Casablanca Bellevue 131"
git branch -M main
git remote add origin git@github.com:USUARIO/casablanca131.git
git push -u origin main
```

En Netlify: **Add new site → Import an existing project → GitHub**, elige el
repositorio y acepta. No hay que tocar nada: `netlify.toml` ya dice que no hay
build y que se publica la raíz.

### Sin GitHub

Arrastra la carpeta entera a <https://app.netlify.com/drop>.

### Dominio

En **Site configuration → Domain management** se cambia el subdominio
`.netlify.app` o se conecta un dominio propio. El certificado HTTPS es
automático.

---

## Antes de dar la web por buena

- [ ] Sustituir teléfono, correo y registro de turismo (`VFT/MA/00000`)
- [ ] Confirmar con la propiedad las distancias en coche y la redacción sobre
      las vistas al mar
- [ ] Tarifas reales por temporada
- [ ] Conectar las opiniones con Google y los portales
- [x] Galería de imágenes en altura (dron)
- [ ] Conectar los vídeos (Vimeo/YouTube: rellenar `data-embed`) y el tour 360°
- [ ] Conectar el formulario de reserva con el motor y una pasarela de pago
- [ ] Quitar `noindex`: la etiqueta de `index.html`, el bloque `X-Robots-Tag`
      de `netlify.toml` y el `Disallow` de `robots.txt`
- [ ] Aviso legal, política de privacidad, cookies y condiciones de reserva
- [ ] Versiones EN y DE (el selector de idioma está maquetado, no conectado)

---

## Notas técnicas

- **Fotografías**: se sirven como archivos, con `width`/`height` para que no
  salte el diseño al cargar, `loading="lazy"` salvo el hero, y `srcset` con una
  variante de 900 px para móvil en las imágenes a sangre.
- **Tipografías**: Cormorant Garamond y Archivo desde Google Fonts. Italiana,
  Jost y Newsreader solo las usan las propuestas A, B y C; si se borran esas
  vistas, se pueden quitar del `<link>` de `index.html`.
- **Vídeos**: no se guardan en el repositorio (GitHub rechaza archivos de más
  de 100 MB y Netlify ya no sirve Git LFS). Se alojan en **Vimeo o YouTube** y se
  incrustan en el visor a pantalla completa. Para conectar uno, ponga el enlace
  del vídeo en el atributo `data-embed` del botón correspondiente de la galería
  «En movimiento» o de las tarjetas «Véala entera» en `index.html`. Sirve el
  enlace normal (`vimeo.com/123…`, `youtu.be/…`, `youtube.com/watch?v=…`); el
  JavaScript lo convierte solo al formato de incrustar. Si el atributo queda
  vacío, el botón muestra la fotografía. Los archivos originales para subir a
  Vimeo/YouTube están en `assets/video/` (fuera de git).
- **Sin dependencias**: nada de frameworks ni de `npm install`.
- **Accesibilidad**: `prefers-reduced-motion` detiene el paso automático del
  hero y las apariciones al hacer scroll.
