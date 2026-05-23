// ─────────────────────────────────────────────────────────────────────
// refresh-concerts.mjs
// ─────────────────────────────────────────────────────────────────────
// Corre dentro de GitHub Actions 1× al día.
// 1) Llama a SerpAPI (server-side, sin CORS) para buscar conciertos en Chile
// 2) Filtra/normaliza/deduplica
// 3) Escribe data/concerts.json (que la app lee desde el browser)
//
// Si no hay SERPAPI_KEY en secrets, conserva el JSON existente y termina OK.
// ─────────────────────────────────────────────────────────────────────

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT_PATH = resolve('data/concerts.json');
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';

const OFFICIAL_HOSTS = [
  'ticketmaster.cl','puntoticket.com','passline.com','eventrid.cl',
  'ticketplus.cl','portaltickets.cl','movistararena.cl','movistarareanchile.cl',
  'teatrocaupolican.cl','clubchocolate.cl','enjoy.cl','monticello.cl'
];

const QUERIES = [
  'conciertos Santiago Chile 2026 entradas',
  'conciertos Movistar Arena Santiago 2026',
  'conciertos Teatro Caupolicán Chile',
  'conciertos Estadio Nacional Chile 2026',
  'music concerts Chile 2026 tickets',
  'conciertos Viña del Mar Chile 2026',
];

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function isOfficialUrl(u){
  if(!u||typeof u!=='string') return false;
  try{
    const url=new URL(u);
    const host=url.hostname.replace(/^www\./,'').toLowerCase();
    return OFFICIAL_HOSTS.some(h=>host===h||host.endsWith('.'+h));
  }catch{return false;}
}

function normalizeDate(raw){
  if(!raw) return '';
  const txt=String(raw).toLowerCase()
    .replace(/\bene\.?/g,'Jan').replace(/\bfeb\.?/g,'Feb').replace(/\bmar\.?/g,'Mar')
    .replace(/\babr\.?/g,'Apr').replace(/\bmay\.?/g,'May').replace(/\bjun\.?/g,'Jun')
    .replace(/\bjul\.?/g,'Jul').replace(/\bago\.?/g,'Aug').replace(/\bsep\.?/g,'Sep')
    .replace(/\boct\.?/g,'Oct').replace(/\bnov\.?/g,'Nov').replace(/\bdic\.?/g,'Dec');
  const year = new Date().getFullYear();
  for(const y of [year, year+1]){
    const t = Date.parse(txt+' '+y);
    if(Number.isFinite(t) && t > Date.now() - 86400000){
      return new Date(t).toISOString().slice(0,10);
    }
  }
  const t = Date.parse(txt);
  if(Number.isFinite(t)) return new Date(t).toISOString().slice(0,10);
  return '';
}

function detectPlatform(host){
  const h=host.toLowerCase();
  if(h.includes('ticketmaster')) return 'ticketmaster';
  if(h.includes('puntoticket')) return 'puntoticket';
  if(h.includes('passline')) return 'passline';
  if(h.includes('eventrid')) return 'eventrid';
  if(h.includes('ticketplus')) return 'ticketplus';
  if(h.includes('portaltickets')) return 'portaltickets';
  if(h.includes('movistararena')||h.includes('movistarareanchile')) return 'movistar';
  return 'oficial';
}

async function fetchSerpQuery(q){
  const url=`https://serpapi.com/search.json?engine=google_events&q=${encodeURIComponent(q)}&location=Chile&gl=cl&hl=es&api_key=${encodeURIComponent(SERPAPI_KEY)}`;
  const r=await fetch(url);
  if(!r.ok) throw new Error(`SerpAPI ${r.status}`);
  return r.json();
}

function loadExisting(){
  if(!existsSync(OUT_PATH)) return null;
  try{ return JSON.parse(readFileSync(OUT_PATH,'utf8')); }catch{return null;}
}

async function main(){
  if(!SERPAPI_KEY){
    console.warn('⚠️ SERPAPI_KEY no configurada — manteniendo concerts.json existente.');
    const existing = loadExisting();
    if(existing){
      console.log('ℹ️ Cartelera existente conservada con', (existing.concerts||[]).length, 'eventos.');
      process.exit(0);
    } else {
      console.error('❌ No hay concerts.json existente y no hay key. Abortando.');
      process.exit(1);
    }
  }

  const all=[], seen=new Set();
  for(const q of QUERIES){
    try{
      console.log('🔍 Query:', q);
      const json=await fetchSerpQuery(q);
      for(const ev of (json.events_results||[])){
        const title=String(ev.title||'').trim();
        const date=normalizeDate(ev?.date?.start_date || ev?.date?.when || '');
        if(!title||!date) continue;

        const ticketArr = Array.isArray(ev.ticket_info)?ev.ticket_info:[];
        const officialTicket = ticketArr.find(t=>isOfficialUrl(t.link));
        const sourceUrl = officialTicket?.link || (isOfficialUrl(ev.link)?ev.link:'') || '';
        if(!sourceUrl) continue;

        const address = Array.isArray(ev.address)?ev.address:[];
        const venue = ev?.venue?.name || address[0] || 'Por confirmar';
        const city  = (address[1]||address[0]||'Santiago').split(',')[0].trim();

        const key = (title+'|'+venue+'|'+date).toLowerCase();
        if(seen.has(key)) continue;
        seen.add(key);

        const host = (()=>{ try{return new URL(sourceUrl).hostname.replace(/^www\./,'');}catch{return '';} })();

        all.push({
          artist: title,
          event: title,
          venue,
          city,
          region: 'Región Metropolitana',
          date,
          platform: detectPlatform(host),
          url: sourceUrl,
          minPrice: 0,
          maxPrice: 0,
          status: 'general_sale',
          genre: 'música',
          hot: false,
          festival: /festival|fest\b/i.test(title)
        });
      }
    }catch(e){
      console.warn('❌ Falló query', q, '·', e.message);
    }
  }

  if(!all.length){
    console.warn('⚠️ SerpAPI no devolvió eventos — conservando concerts.json existente.');
    const existing = loadExisting();
    if(existing) process.exit(0);
    process.exit(1);
  }

  // Ordenar por fecha
  all.sort((a,b)=>String(a.date).localeCompare(String(b.date)));

  const payload = {
    lastUpdate: new Date().toISOString(),
    source: 'SerpAPI Google Events (Chile) — automated daily refresh',
    count: all.length,
    concerts: all
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`✅ Escritos ${all.length} eventos en ${OUT_PATH}`);
}

main().catch(e=>{ console.error('💥 Falla fatal:', e); process.exit(1); });
