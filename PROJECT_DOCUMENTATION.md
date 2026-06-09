# SKILGLASS - Documentación del Proyecto

Este documento detalla la arquitectura, tecnologías y características principales de la plataforma de e-commerce y exhibición de SKILGLASS.

## 🛠️ Stack Tecnológico

El proyecto está construido con un enfoque moderno y altamente performante:

- **Framework Core**: Next.js 15 (App Router)
- **Librería UI**: React 19
- **Estilos y UI**: Tailwind CSS 4 (PostCSS) con un sistema de diseño customizado (tokens de color, tipografía de alta gama) y Styled Components.
- **CMS Headless**: Sanity Studio v3 (integrado dentro del mismo repositorio en `/sanity`).
- **Pasarela de Pagos**: MercadoPago SDK v2.
- **Logística/Envíos**: Integración con API de Andreani para cotización de envíos.
- **Envío de Emails**: Resend.
- **Generación de PDFs**: `pdf-lib` (usado para la generación automatizada de Certificados de Unicidad).

## ✨ Features Principales del E-commerce

1. **Diseño Premium y Responsive (Mobile-First)**:
   - Interfaz con estética editorial, uso de fuentes serifa (Playfair Display) y palo seco modernas (Manrope, Space Grotesk).
   - Animaciones fluidas, glassmorphism sutil y fondos atmosféricos ("horno glow", refracciones).
2. **Catálogo y Cápsulas Conceptuales**:
   - Visualización de productos únicos ("Pieza Única") y series.
   - Galerías de imágenes optimizadas con `next/image`.
3. **Carrito de Compras Global**:
   - Manejado globalmente mediante un `CartContext` personalizado de React.
4. **Checkout e Integración de Pagos**:
   - Integración nativa con MercadoPago y sistema de Webhooks para confirmación de órdenes de compra.
5. **Generador de Certificados de Unicidad**:
   - Generación dinámica en HTML y PDF (`scripts/generate-certificate.js` y `public/certificado.html`) para acompañar las piezas físicas de alto valor.
6. **SEO y GEO (Generative Engine Optimization)**:
   - Generación de `sitemap.xml` dinámico.
   - Datos estructurados JSON-LD inyectados a nivel global en el layout para mejorar la visibilidad ante buscadores y motores de IA.
7. **Atención al Cliente Integrada**:
   - Botón flotante de WhatsApp dinámico gestionado desde el CMS.
8. **Diario del Taller**:
   - Simulación de feed de Instagram / actualizaciones en video e imagen directo en la home.

## 🗃️ Arquitectura de Contenido (Sanity CMS)

El backend de Sanity está estructurado para permitir un control total y granular de la web sin necesidad de tocar código. Se divide en Modelos de Datos (Documentos Múltiples) y Configuración de Secciones (Singletons).

### Documentos Principales (Schemas)
- **`product.ts` (Producto)**: Contiene la información técnica y comercial de la joya (nombre, slug, precio, imágenes, categoría, stock, metadatos técnicos para la pieza).
- **`collection.ts` (Cápsula/Colección)**: Agrupa productos bajo un concepto artístico.
- **`order.ts` (Órdenes)**: Registro interno de compras realizadas a través de la pasarela.
- **`settings.ts` (Ajustes del Sitio)**: Configuración global, SEO por defecto, teléfono de WhatsApp, redes sociales.
- **`soporte.ts`**: Contenido para la página de atención al cliente, devoluciones, cuidados de las piezas, etc.

### Landing Page Dinámica (Singletons)
La página de inicio es modular y se alimenta enteramente de Sanity a través de los siguientes schemas:
- **`heroConfig`**: Textos de cabecera, llamados a la acción (CTA) y videos/imágenes de fondo tipo carrusel (HeroSlider).
- **`productosSectionConfig`**: Configuración de la grilla de piezas destacadas (títulos, descripciones).
- **`alquimiaSectionConfig`**: Sección editorial que destaca el aspecto técnico de una pieza maestra (especificaciones de temperatura, masa, proceso).
- **`fraseSectionConfig`**: Sección de cita editorial con fondo radial.
- **`capsulasSectionConfig`**: Módulo que destaca las colecciones conceptuales con imagen y enlace.
- **`procesoSectionConfig`**: Explicación del manifiesto y la técnica ("El Caos Controlado", Soplado a la flama).
- **`homeEstudioSectionConfig`**: Banner de acceso visual a "El Estudio".
- **`diarioTaller`**: Gestión del feed multimedia que imita redes sociales en el footer de la home.

### Otras Páginas
- **`estudioPageConfig`**: Modela el contenido profundo de la página "El Estudio" (manifiesto extendido, historia del fundador).
- **`productoConfig`**: Opciones globales que aplican a las páginas de producto individuales.
