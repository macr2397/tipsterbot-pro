import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Safari - PWA nativa */}
        <meta name="apple-mobile-web-app-capable"          content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"            content="TipsterBot" />
        <link rel="apple-touch-icon"                       href="/apple-touch-icon.png" />

        {/* Splash screens iOS (iPhone 14 / 13 / 12) */}
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 390px) and (device-height: 844px)"
          href="/icons/icon-512x512.png"
        />

        {/* Android / general */}
        <meta name="theme-color"          content="#0a0c10" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name"     content="TipsterBot" />

        {/* Tipografía Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
