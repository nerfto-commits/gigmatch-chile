# 🎵 GigMatch Chile

SPA de un solo archivo HTML que muestra la cartelera real de conciertos en Chile, actualizada automáticamente cada día vía GitHub Actions.

## 🚀 Cómo correr localmente

1. Copia `config.local.example.js` → `config.local.js`
2. (Opcional) Pega tus API keys reales
3. Abre `index.html` con doble clic, o sirve la carpeta con un servidor estático:
   ```bash
   python -m http.server 8080
   # luego: http://localhost:8080
   ```

**Credenciales demo:** `fan@gigmatch.cl` / `Fan123456` · `admin@gigmatch.cl` / `Admin123456`

---

## 🔐 Seguridad — qué hay en el repo y qué NO

| Archivo                 | ¿Va a GitHub? | Contiene                            |
|-------------------------|---------------|-------------------------------------|
| `index.html`            | ✅ Sí          | SPA, **sin keys**                   |
| `config.local.example.js` | ✅ Sí        | Plantilla pública sin keys          |
| `config.local.js`       | ❌ NO          | Tus keys reales (gitignored)        |
| `data/concerts.json`    | ✅ Sí          | Cartelera (escrita por la Action)   |
| `scripts/refresh-concerts.mjs` | ✅ Sí   | Llama a SerpAPI con secrets         |
| `.github/workflows/*.yml`| ✅ Sí         | Cron diario                         |

**Las keys reales SOLO viven en GitHub Secrets**, nunca en el código.

---

## 🤖 Auto-refresh diario (GitHub Actions)

El workflow `.github/workflows/refresh-concerts.yml`:

1. Se dispara cada día a las **12:00 UTC** (08:00 hrs Chile)
2. Corre `scripts/refresh-concerts.mjs` con `SERPAPI_KEY` desde GitHub Secrets
3. Llama a SerpAPI server-side (sin CORS) → obtiene conciertos reales de Google Events
4. Escribe `data/concerts.json`
5. Hace commit y push del JSON actualizado
6. La próxima vez que alguien abra la app, lee el JSON fresco

---

## 📦 Cómo desplegar — Paso a paso (Opción A · GitHub Pages)

### 1. Crear cuenta en GitHub
- Ir a https://github.com/signup
- Verificar email

### 2. Crear repositorio
- Click en el `+` arriba a la derecha → **New repository**
- Nombre: `gigmatch-chile`
- Visibilidad: **Public** (necesario para GitHub Pages gratis)
- NO marques "Initialize with README"
- **Create repository**

### 3. Subir los archivos
Tenés dos opciones:

**A. Via web (más fácil):**
- En la página del repo nuevo, click en **"uploading an existing file"**
- Arrastra TODO el contenido de esta carpeta (excepto `config.local.js` si existe)
- Commit: "Initial commit"

**B. Via terminal:**
```bash
cd "C:\Users\matyc\OneDrive\Desktop\Diplomado trabajo 4"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/gigmatch-chile.git
git push -u origin main
```

### 4. Configurar SECRETS (las API keys)
- En el repo: **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Crea estos secrets (cada uno con su valor real):

| Nombre        | Valor                          | Dónde conseguirla                                  |
|---------------|--------------------------------|----------------------------------------------------|
| `SERPAPI_KEY` | tu key 64-char hexadecimal     | https://serpapi.com/manage-api-key                 |
| `GEMINI_KEY`  | (opcional) tu key Google AI    | https://aistudio.google.com/apikey                 |

### 5. Activar GitHub Pages
- **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Save

Espera ~1 minuto. Tu app estará en:
```
https://TU-USUARIO.github.io/gigmatch-chile/
```

### 6. Dispara el primer refresh manual
- Ir a la pestaña **Actions** del repo
- Click en **🎵 Refresh Cartelera Chile**
- **Run workflow** → **Run workflow**
- Espera ~30 segundos
- El `data/concerts.json` se actualiza solo

Listo. A partir de mañana, cada día a las 08:00 hrs Chile, la cartelera se actualiza sola.

---

## 🛠️ Mantenimiento

- **Cambiar la hora del cron**: editar `.github/workflows/refresh-concerts.yml`, línea `cron:`
- **Forzar refresh manual**: tab Actions → Run workflow
- **Ver logs del último run**: tab Actions → último workflow → click en el step

---

## 📚 Tecnologías

- **Frontend**: HTML + React (CDN) + Babel Standalone + Tailwind (CDN) + Leaflet
- **Datos**: SerpAPI (Google Events) vía GitHub Actions → JSON estático
- **Auth opcional**: Spotify OAuth PKCE, Google Sign-In (Client IDs públicos)
- **Hosting**: GitHub Pages (gratis) + GitHub Actions (gratis hasta 2.000 min/mes)
