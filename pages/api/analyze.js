// pages/api/analyze.js
// Backend seguro: API-Football + Claude Anthropic
// Las keys NUNCA llegan al navegador del usuario

const FOOTBALL_KEY  = process.env.FOOTBALL_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const FOOTBALL_BASE = "https://v3.football.api-sports.io";

/* ── Helper fetch API-Football ─────────────────────────── */
async function footApi(endpoint, params = {}) {
  const url = new URL(FOOTBALL_BASE + endpoint);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": FOOTBALL_KEY }
  });
  if (!res.ok) throw new Error("API-Football " + res.status);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length)
    throw new Error(JSON.stringify(json.errors));
  return json.response;
}

/* ── Buscar equipo por nombre ──────────────────────────── */
async function searchTeam(name) {
  const data = await footApi("/teams", { search: name });
  return data && data[0] ? data[0].team : null;
}

/* ── Buscar liga por nombre ────────────────────────────── */
async function searchLeague(name) {
  const data = await footApi("/leagues", { search: name, current: "true" });
  return data && data[0] ? data[0] : null;
}

/* ── Estadísticas del equipo en la temporada ───────────── */
async function teamStats(teamId, leagueId, season) {
  try {
    const data = await footApi("/teams/statistics", {
      team: teamId, league: leagueId, season
    });
    return data;
  } catch { return null; }
}

/* ── Últimos 5 partidos del equipo ─────────────────────── */
async function lastFive(teamId) {
  try {
    const data = await footApi("/fixtures", { team: teamId, last: 5 });
    return (data || []).map(f => {
      const home   = f.teams.home.id === teamId;
      const winH   = f.teams.home.winner;
      const winA   = f.teams.away.winner;
      let res = "D";
      if (home && winH)  res = "W";
      if (!home && winA) res = "W";
      if (home && winA)  res = "L";
      if (!home && winH) res = "L";
      return {
        rival:  home ? f.teams.away.name : f.teams.home.name,
        score:  f.goals.home + "-" + f.goals.away,
        loc:    home ? "L" : "V",
        res,
        fecha:  f.fixture.date ? f.fixture.date.split("T")[0] : ""
      };
    });
  } catch { return []; }
}

/* ── Buscar fixture entre dos equipos ──────────────────── */
async function findFixture(leagueId, season, id1, id2) {
  try {
    const upcoming = await footApi("/fixtures", {
      league: leagueId, season, team: id1, next: 20
    });
    const match = (upcoming || []).find(f => {
      const ids = [f.teams.home.id, f.teams.away.id];
      return ids.includes(id1) && ids.includes(id2);
    });
    if (match) return match;
    const last = await footApi("/fixtures", {
      league: leagueId, season, team: id1, last: 20
    });
    return (last || []).find(f => {
      const ids = [f.teams.home.id, f.teams.away.id];
      return ids.includes(id1) && ids.includes(id2);
    }) || null;
  } catch { return null; }
}

/* ── Predicción API-Football ───────────────────────────── */
async function getPrediction(fixtureId) {
  try {
    const data = await footApi("/predictions", { fixture: fixtureId });
    return data && data[0] ? data[0] : null;
  } catch { return null; }
}

/* ── Cuotas API-Football ───────────────────────────────── */
async function getOdds(fixtureId) {
  try {
    const data = await footApi("/odds", { fixture: fixtureId });
    return data || [];
  } catch { return []; }
}

/* ── Análisis con Claude ───────────────────────────────── */
async function claudeAnalysis(payload) {
  const system =
    "Eres un tipster profesional con 15 anos de experiencia en apuestas deportivas. " +
    "Respondes UNICAMENTE con un objeto JSON valido, sin texto extra, sin markdown, sin backticks.";

  const schema = {
    resumen:          "Resumen narrativo del partido en 2-3 frases.",
    pick:             "Pick recomendado",
    confianza:        72,
    nivel:            "strong",
    stake:            "3/5 unidades",
    razon:            "Razonamiento detallado basado en los datos reales.",
    ev:               "+EV moderado",
    alertas:          ["Verificar alineaciones 1h antes"],
    picks_alt:        [{ mercado: "Over 2.5 goles", cuota: 1.85, conf: 60 }],
    analisis_mercado: "Analisis del movimiento de cuotas y valor de mercado."
  };

  const userMsg =
    "Analiza este partido con los datos reales y devuelve el JSON.\n\n" +
    "DATOS REALES:\n" + JSON.stringify(payload, null, 2) + "\n\n" +
    "Esquema a completar:\n" + JSON.stringify(schema, null, 2) + "\n\n" +
    "IMPORTANTE: Basa TODO en los datos reales. nivel puede ser strong, medium o risky.";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: userMsg }]
    })
  });
  if (!res.ok) const errBody = await res.json().catch(() => ({})); throw new Error("Anthropic error: " + res.status + " — " + JSON.stringify(errBody));
  const data = await res.json();
  const raw  = (data.content || []).map(b => b.text || "").join("").trim();
  const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
  if (s === -1) throw new Error("Claude no devolvio JSON");
  return JSON.parse(raw.slice(s, e + 1));
}

/* ── Extraer estadísticas formateadas ──────────────────── */
function extractStats(st, last5) {
  return {
    partidos:  st ? st.fixtures.played.total      : 0,
    ganados:   st ? st.fixtures.wins.total         : 0,
    empatados: st ? st.fixtures.draws.total        : 0,
    perdidos:  st ? st.fixtures.loses.total        : 0,
    goles_a:   st ? st.goals.for.total.total       : 0,
    goles_c:   st ? st.goals.against.total.total   : 0,
    prom_a:    st ? st.goals.for.average.total     : "0.0",
    prom_c:    st ? st.goals.against.average.total : "0.0",
    forma:     last5.slice(0, 5).map(m => m.res),
    ultimos5:  last5
  };
}

/* ══ HANDLER PRINCIPAL ════════════════════════════════════ */
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Metodo no permitido" });

  if (!FOOTBALL_KEY)  return res.status(500).json({ error: "FOOTBALL_API_KEY no configurada" });
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY no configurada" });

  const { team1, team2, league: leagueName, market, cuota, ctx } = req.body;
  if (!team1 || !team2)
    return res.status(400).json({ error: "Faltan equipos" });

  try {
    /* 1. Buscar equipos en paralelo */
    const [t1, t2] = await Promise.all([searchTeam(team1), searchTeam(team2)]);
    if (!t1) return res.status(404).json({ error: "Equipo no encontrado: " + team1 });
    if (!t2) return res.status(404).json({ error: "Equipo no encontrado: " + team2 });

    /* 2. Liga y temporada */
    let leagueData = null;
    if (leagueName) leagueData = await searchLeague(leagueName).catch(() => null);
    const leagueId = leagueData ? leagueData.league.id : 39;
    const now      = new Date();
    const season   = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;

    /* 3. Datos en paralelo */
    const [stats1, stats2, last1, last2, fixture] = await Promise.all([
      teamStats(t1.id, leagueId, season),
      teamStats(t2.id, leagueId, season),
      lastFive(t1.id),
      lastFive(t2.id),
      findFixture(leagueId, season, t1.id, t2.id)
    ]);

    /* 4. Prediccion y cuotas si hay fixture */
    let prediction = null, oddsRaw = [];
    if (fixture) {
      [prediction, oddsRaw] = await Promise.all([
        getPrediction(fixture.fixture.id),
        getOdds(fixture.fixture.id)
      ]);
    }

    /* 5. Formatear cuotas */
    const BOOKS = { 8: "Bet365", 6: "Bwin", 4: "Betway", 1: "1xBet", 3: "Betfair", 11: "Unibet" };
    const cuotasFmt = {};
    oddsRaw.forEach(item => {
      (item.bookmakers || []).forEach(bm => {
        const name = BOOKS[bm.id] || bm.name;
        const bet  = (bm.bets || []).find(b => b.name === "Match Winner");
        if (!bet) return;
        const odds = {};
        (bet.values || []).forEach(v => {
          if (v.value === "Home") odds["1"] = parseFloat(v.odd);
          if (v.value === "Draw") odds["X"] = parseFloat(v.odd);
          if (v.value === "Away") odds["2"] = parseFloat(v.odd);
        });
        if (Object.keys(odds).length === 3) cuotasFmt[name] = odds;
      });
    });

    /* 6. Mejor cuota */
    let mejor = null;
    Object.entries(cuotasFmt).forEach(([casa, odds]) => {
      ["1","X","2"].forEach(col => {
        if (!mejor || odds[col] > mejor.valor)
          mejor = { casa, col, valor: odds[col] };
      });
    });

    /* 7. Prediccion formateada */
    const predFmt = prediction ? {
      ganador:     prediction.predictions?.winner?.name,
      consejo:     prediction.predictions?.advice,
      porc_local:  prediction.predictions?.percent?.home,
      porc_empate: prediction.predictions?.percent?.draw,
      porc_vis:    prediction.predictions?.percent?.away
    } : null;

    /* 8. Payload para Claude */
    const payload = {
      partido:   t1.name + " vs " + t2.name,
      liga:      leagueData ? leagueData.league.name : (leagueName || "Liga no especificada"),
      temporada: season,
      fecha:     fixture ? fixture.fixture.date : "Proximo partido no encontrado",
      estadio:   fixture ? fixture.fixture.venue?.name : null,
      mercado:   market || "1X2",
      cuota_obj: cuota || null,
      contexto:  ctx   || null,
      local:     { nombre: t1.name, ...extractStats(stats1, last1) },
      visitante: { nombre: t2.name, ...extractStats(stats2, last2) },
      prediccion_api: predFmt,
      cuotas:    cuotasFmt,
      mejor
    };

    /* 9. Analisis Claude */
    const analisis = await claudeAnalysis(payload);

    /* 10. Respuesta */
    return res.status(200).json({
      local: {
        nombre:  t1.name,
        logo:    t1.logo,
        pais:    t1.country,
        ...extractStats(stats1, last1)
      },
      visitante: {
        nombre:  t2.name,
        logo:    t2.logo,
        pais:    t2.country,
        ...extractStats(stats2, last2)
      },
      partido: {
        fecha:   fixture ? fixture.fixture.date?.split("T")[0] : null,
        hora:    fixture ? fixture.fixture.date?.split("T")[1]?.slice(0,5) : null,
        estadio: fixture ? fixture.fixture.venue?.name : null,
        liga:    leagueData ? {
          nombre: leagueData.league.name,
          logo:   leagueData.league.logo
        } : { nombre: leagueName || "Liga", logo: null }
      },
      prediccion_api: predFmt,
      cuotas:  cuotasFmt,
      mejor,
      analisis
    });

  } catch (err) {
    console.error("Error en /api/analyze:", err);
    return res.status(500).json({ error: err.message || "Error interno del servidor" });
  }
}
