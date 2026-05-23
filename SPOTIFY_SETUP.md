# Spotify en GigMatch Chile

GigMatch usa Spotify OAuth PKCE. Este flujo funciona en GitHub Pages y no necesita `SPOTIFY_CLIENT_SECRET` en el navegador.

## 1. Entra a Spotify Developer

https://developer.spotify.com/dashboard

Abre tu aplicación de Spotify.

## 2. Agrega Redirect URIs

En la app de Spotify, entra a **Settings** y en **Redirect URIs** agrega las URLs exactas:

```text
https://nerfto-commits.github.io/gigmatch-chile/index.html
```

Guarda los cambios.

Si quieres probar localmente, agrega también:

```text
http://localhost:8080/index.html
```

No pruebes Spotify abriendo el archivo con doble clic (`file:///...`), porque Spotify no acepta `file://` como redirect OAuth.

## 3. Qué subir a GitHub

Sube estos archivos:

```text
index.html
config.local.example.js
SPOTIFY_SETUP.md
```

No subas `config.local.js` si tiene keys privadas.

## 4. Qué NO usar en GitHub Pages

No uses `SPOTIFY_CLIENT_SECRET` dentro de `index.html`.

El secret solo sirve en un backend como Express, Render, Railway, Vercel, Netlify Function o Supabase Edge Function. Para esta demo estática, el flujo correcto es PKCE con `SPOTIFY_CLIENT_ID`.

## 5. Cómo probar

1. Abre la app.
2. Pulsa **Iniciar sesión con Spotify**.
3. Acepta permisos.
4. Spotify vuelve a `index.html`.
5. GigMatch importa artistas top y géneros al perfil.

URL recomendada para probar en GitHub Pages:

```text
https://nerfto-commits.github.io/gigmatch-chile/index.html
```
