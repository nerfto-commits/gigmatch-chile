// ───────────────────────────────────────────────────────────────
// CONFIG LOCAL — Plantilla pública (sin keys reales)
// ───────────────────────────────────────────────────────────────
// 1) Copia este archivo a `config.local.js` (NO COMMITEAR — está en .gitignore)
// 2) Pega tus API keys reales abajo
// 3) Abre index.html en el navegador
//
// En PRODUCCIÓN (GitHub Pages) este archivo NO existe → la app lee
// data/concerts.json que es generado por el workflow de GitHub Actions.
// Esto significa que las keys SOLO viven en GitHub Secrets, NUNCA en el código.
// ───────────────────────────────────────────────────────────────

window.GIGMATCH_CONFIG = {
  // — Google Gemini (opcional, para fallback de búsqueda con IA) —
  // Obtén una key en https://aistudio.google.com/apikey
  GEMINI_KEY: '',

  // — SerpAPI (opcional, para búsqueda directa de Google Events) —
  // Obtén una key en https://serpapi.com/manage-api-key
  SERPAPI_KEY: '',

  // — Spotify OAuth (público por diseño OAuth, NO es secreto) —
  // https://developer.spotify.com/dashboard
  SPOTIFY_CLIENT_ID: '',

  // — Google OAuth (público por diseño OAuth, NO es secreto) —
  // https://console.cloud.google.com/apis/credentials
  GOOGLE_CLIENT_ID: '',
};
