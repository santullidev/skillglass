/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // ⚠️ DEUDA TECNICA: estos dos flags dejan pasar errores reales a produccion.
  // app/ y lib/ (todo el flujo de compra) ya estan limpios; lo que queda son
  // los schemas de Sanity, que usan `__experimental_actions` de la v2 y ya no
  // existe en la v3. Sacarlo cambia el comportamiento de los singletons en el
  // CMS, asi que es una tarea aparte. Mientras tanto: `npm run typecheck`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
