# TipsterBot Pro 🏆 — PWA Multi-Plataforma

Bot profesional de análisis de apuestas deportivas con **datos reales de API-Football** e **IA (Claude)**. Funciona como app nativa en **iPhone, Android y Windows** sin App Store ni Play Store.

---

## ✅ Lo que incluye

- Datos reales de equipos vía **API-Football** (estadísticas, últimos 5, fixture)
- Cuotas en tiempo real de Bet365, Betway, Bwin, 1xBet, Betfair
- Predicciones de la propia API-Football
- Análisis inteligente con **Claude (Anthropic)**
- Pick recomendado con % de confianza y stake
- Picks alternativos y análisis de movimiento de mercado
- **PWA instalable en iPhone, Android y Windows**

---

## 🚀 Despliegue en Vercel (10 minutos)

### PASO 1 — Consigue tu API Key de Anthropic

1. Ve a **https://console.anthropic.com**
2. Crea una cuenta gratuita
3. Ve a **API Keys → Create Key**
4. Copia la key (empieza con `sk-ant-...`)
5. Tienes **$5 USD gratis** → ~200 análisis

---

### PASO 2 — Sube el proyecto a GitHub

1. Instala **Git**: https://git-scm.com
2. Crea cuenta en **https://github.com**
3. Crea repositorio nuevo: `tipsterbot-pro`
4. Abre terminal en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "TipsterBot Pro PWA v2"
git remote add origin https://github.com/TU_USUARIO/tipsterbot-pro.git
git push -u origin main
```

---

### PASO 3 — Despliega en Vercel

1. Ve a **https://vercel.com** → entra con tu GitHub
2. Clic en **"Add New Project"**
3. Selecciona el repositorio `tipsterbot-pro`
4. En **"Environment Variables"** agrega las dos variables:

| Nombre | Valor |
|--------|-------|
| `FOOTBALL_API_KEY` | `ad46a41cb179fb1d09c56f8ccffa95d9` |
| `ANTHROPIC_API_KEY` | `sk-ant-...TU-KEY...` |

5. Clic en **"Deploy"** → listo en 2 minutos

Tu bot estará en una URL como: `https://tipsterbot-pro.vercel.app`

---

## 📱 Instalar como app nativa

### iPhone / iPad (Safari)
1. Abre la URL en **Safari** (importante: Safari, no Chrome)
2. Toca el botón **Compartir** (el cuadrado con flecha ↑)
3. Selecciona **"Agregar a pantalla de inicio"**
4. Ponle el nombre que quieras y toca **"Agregar"**
5. ¡Aparece en tu pantalla de inicio con ícono propio!

### Android (Chrome)
1. Abre la URL en **Chrome**
2. Toca los **3 puntos** (menú)
3. Selecciona **"Agregar a pantalla de inicio"**
4. Confirma → ícono instalado

### Windows (Chrome o Edge)
1. Abre la URL en **Chrome** o **Edge**
2. Busca el **ícono de instalación** en la barra de direcciones (⊕ o un monitor con flecha)
3. Clic en **"Instalar"**
4. Se abre como app de escritorio independiente

---

## 💻 Prueba local (opcional)

```bash
# Instalar Node.js desde https://nodejs.org (v18+)

# Instalar dependencias
npm install

# Crear variables de entorno
cp .env.example .env.local
# Edita .env.local con tus keys reales

# Iniciar servidor local
npm run dev

# Abre http://localhost:3000
```

---

## 📁 Estructura del proyecto

```
tipsterbot-pwa/
├── pages/
│   ├── api/
│   │   └── analyze.js        ← Backend: API-Football + Claude (keys seguras)
│   ├── _app.js               ← Registra el Service Worker
│   ├── _document.js          ← Meta tags iOS / Android
│   └── index.js              ← Página principal
├── components/
│   └── TipsterBot.jsx        ← Interfaz completa del bot
├── styles/
│   └── globals.css           ← Diseño mobile-first
├── public/
│   ├── manifest.json         ← Config PWA (nombre, iconos, colores)
│   ├── sw.js                 ← Service Worker (offline)
│   ├── apple-touch-icon.png  ← Ícono para iPhone
│   └── icons/                ← Iconos en todos los tamaños
├── .env.example              ← Plantilla de variables
├── .env.local                ← Tus keys reales (NO se sube a GitHub)
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

## 🔒 Seguridad

- Las API keys viven **solo en el servidor de Vercel**
- El navegador NUNCA ve las keys
- El `.env.local` está en `.gitignore` → no se sube a GitHub
- Todo el tráfico a APIs externas pasa por tu backend (`/api/analyze`)

---

## 💰 Costos estimados

| Servicio | Plan | Costo |
|---------|------|-------|
| Vercel | Free tier | $0/mes |
| API-Football | Free (100 req/día) | $0/mes |
| Anthropic Claude | Pay as you go | ~$0.01–0.03 por análisis |

---

## ⚠️ Aviso

Las apuestas deportivas conllevan riesgo de pérdida económica. Este bot es una herramienta orientativa y no garantiza resultados. Apuesta siempre de forma responsable.
