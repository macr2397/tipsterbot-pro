import { useState } from "react";

const SPORTS_OPTS  = ["Futbol","Baloncesto","Tenis","Beisbol","Hockey","Rugby","MMA/UFC","Americano"];
const MARKET_OPTS  = ["1X2 (Resultado)","Doble Oportunidad","BTTS","Over/Under 2.5","Over/Under 3.5","Handicap Asiatico","HT/FT","Primer Goleador"];
const LEAGUES_SUGG = ["Premier League","La Liga","Serie A","Bundesliga","Ligue 1","Champions League","Europa League","MLS"];

/* ─── Forma dots ─────────────────────────────────────────── */
function FormDots({ arr = [] }) {
  return (
    <div className="form-strip">
      {arr.map((r, i) => (
        <span key={i} className={"fdot " + (r === "W" ? "fw" : r === "D" ? "fd" : "fl")}>{r}</span>
      ))}
    </div>
  );
}

/* ─── Fila de estadística ────────────────────────────────── */
function SR({ k, v, col }) {
  return (
    <div className="sr">
      <span className="sk">{k}</span>
      <span className="sv" style={col ? { color: col } : {}}>{v}</span>
    </div>
  );
}

/* ─── Bloque de equipo ───────────────────────────────────── */
function TeamCard({ t, label }) {
  if (!t) return null;
  return (
    <div className="team-card">
      <div className="tc-head">
        {t.logo && <img src={t.logo} alt={t.nombre} width={28} height={28} style={{ objectFit:"contain" }} />}
        <div>
          <div className="tc-name">{t.nombre}</div>
          <div className="tc-sub">{label}</div>
        </div>
      </div>
      <FormDots arr={t.forma} />
      <div style={{ marginTop: 10 }}>
        <SR k="Partidos" v={t.partidos} />
        <div className="sr">
          <span className="sk">G / E / P</span>
          <span style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span className="sv" style={{ color:"var(--green)" }}>{t.ganados}</span>
            <span style={{ color:"var(--t3)" }}>/</span>
            <span className="sv">{t.empatados}</span>
            <span style={{ color:"var(--t3)" }}>/</span>
            <span className="sv" style={{ color:"var(--red)" }}>{t.perdidos}</span>
          </span>
        </div>
        <SR k="Goles anotados" v={t.goles_a + "  (" + t.prom_a + "/p)"} />
        <SR k="Goles recibidos" v={t.goles_c + "  (" + t.prom_c + "/p)"} />
      </div>
    </div>
  );
}

/* ─── Tabla últimos 5 ────────────────────────────────────── */
function Last5({ t }) {
  if (!t || !t.ultimos5) return null;
  return (
    <div className="team-card">
      <div className="tc-name" style={{ marginBottom:8 }}>{t.nombre}</div>
      <table className="t5">
        <thead><tr><th>Rival</th><th>Score</th><th>C/F</th><th>Res.</th></tr></thead>
        <tbody>
          {t.ultimos5.map((m, i) => (
            <tr key={i}>
              <td>{m.rival}</td>
              <td style={{ color:"var(--t1)" }}>{m.score}</td>
              <td style={{ color:"var(--t3)" }}>{m.loc}</td>
              <td className={"res-" + m.res}>{m.res}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══ COMPONENTE PRINCIPAL ════════════════════════════════════ */
export default function TipsterBot() {
  const [sport,   setSport]   = useState("Futbol");
  const [league,  setLeague]  = useState("");
  const [team1,   setTeam1]   = useState("");
  const [team2,   setTeam2]   = useState("");
  const [market,  setMarket]  = useState("1X2 (Resultado)");
  const [cuota,   setCuota]   = useState("");
  const [ctx,     setCtx]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [step,    setStep]    = useState(""); // estado de carga

  const STEPS = [
    "Buscando equipos en API-Football...",
    "Obteniendo estadísticas de la temporada...",
    "Consultando últimos 5 partidos...",
    "Buscando fixture y cuotas...",
    "Generando análisis con IA..."
  ];

  const analyze = async () => {
    if (!team1.trim() || !team2.trim()) { setError("Introduce ambos equipos."); return; }
    setError(""); setLoading(true); setResult(null);

    // Simular pasos de carga
    let stepIdx = 0;
    setStep(STEPS[0]);
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
      setStep(STEPS[stepIdx]);
    }, 1800);

    try {
      const res  = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, league, team1, team2, market, cuota, ctx })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error del servidor");
      setResult(data);
    } catch (err) {
      setError("Error: " + err.message);
    }
    clearInterval(stepTimer);
    setLoading(false);
    setStep("");
  };

  /* Colores según nivel de confianza */
  const rec   = result?.analisis;
  const nivel = rec?.nivel || "strong";
  const cc    = nivel === "strong" ? "var(--green)" : nivel === "medium" ? "var(--amber)" : "var(--red)";
  const cDim  = nivel === "strong" ? "var(--green-dim)" : nivel === "medium" ? "var(--amber-dim)" : "var(--red-dim)";
  const cIcon = (rec?.confianza || 0) >= 70 ? "🔥" : (rec?.confianza || 0) >= 55 ? "⚡" : "⚠️";

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <div className="logo-box">T</div>
        <div className="header-text">
          <h1>TipsterBot Pro</h1>
          <p>DATOS REALES · IA PROFESIONAL</p>
        </div>
        <div className="online">
          <div className="online-dot pulse" />
          EN LÍNEA
        </div>
      </header>

      {/* ── Formulario ── */}
      {!result && !loading && (
        <div className="card anim-in">
          <div className="sec">⚽ Partido a analizar</div>

          {/* Deporte */}
          <div className="field-group">
            <label className="lbl">Deporte</label>
            <div className="chip-row">
              {SPORTS_OPTS.map(s => (
                <button key={s}
                  className={"chip" + (sport === s ? " chip-on" : "")}
                  onClick={() => setSport(s)}>{s}
                </button>
              ))}
            </div>
          </div>

          {/* Liga */}
          <div className="field-group">
            <label className="lbl">Liga / Competición</label>
            <input className="inp" value={league} onChange={e => setLeague(e.target.value)}
              placeholder="Ej: Premier League, La Liga..." list="leagues-list" />
            <datalist id="leagues-list">
              {LEAGUES_SUGG.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>

          {/* Equipos */}
          <div className="two-col">
            <div className="field-group">
              <label className="lbl">🏠 Equipo Local</label>
              <input className="inp" value={team1} onChange={e => setTeam1(e.target.value)}
                placeholder="Ej: Manchester City" />
            </div>
            <div className="field-group">
              <label className="lbl">✈️ Equipo Visitante</label>
              <input className="inp" value={team2} onChange={e => setTeam2(e.target.value)}
                placeholder="Ej: Real Madrid" />
            </div>
          </div>

          {/* Mercado */}
          <div className="two-col">
            <div className="field-group">
              <label className="lbl">Mercado</label>
              <select className="inp" value={market} onChange={e => setMarket(e.target.value)}>
                {MARKET_OPTS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="lbl">Cuota objetivo</label>
              <input className="inp" value={cuota} onChange={e => setCuota(e.target.value)}
                placeholder="Ej: 1.85" inputMode="decimal" />
            </div>
          </div>

          {/* Contexto */}
          <div className="field-group">
            <label className="lbl">Contexto adicional</label>
            <textarea className="inp inp-ta" value={ctx} onChange={e => setCtx(e.target.value)}
              rows={3} placeholder="Lesiones, suspensiones, condiciones, noticias..." />
          </div>

          {error && <div className="err-box">{error}</div>}

          <button className="btn-primary" onClick={analyze}>
            ↗ Analizar partido ahora
          </button>
        </div>
      )}

      {/* ── Cargando ── */}
      {loading && (
        <div className="card" style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:16, color:"var(--green)", fontFamily:"Syne,sans-serif", fontWeight:700, marginBottom:8 }}>
            Analizando partido...
          </div>
          <div className="load-track"><div className="load-bar" /></div>
          <div style={{ fontSize:12, color:"var(--t3)", marginTop:8, minHeight:20 }}>{step}</div>
        </div>
      )}

      {/* ── Resultado ── */}
      {result && (
        <div className="anim-in">

          {/* Cabecera partido */}
          <div className="card">
            <div className="match-head">
              <div className="match-teams">
                {result.local?.logo && <img src={result.local.logo} alt="" width={24} height={24} style={{ objectFit:"contain" }} />}
                <span>{result.local?.nombre}</span>
                <span className="vs">vs</span>
                <span>{result.visitante?.nombre}</span>
                {result.visitante?.logo && <img src={result.visitante.logo} alt="" width={24} height={24} style={{ objectFit:"contain" }} />}
              </div>
              {result.partido?.liga?.nombre && (
                <div className="match-meta">
                  {result.partido.liga?.logo && <img src={result.partido.liga.logo} alt="" width={14} height={14} style={{ objectFit:"contain", marginRight:4 }} />}
                  {result.partido.liga.nombre}
                  {result.partido.fecha && " · " + result.partido.fecha}
                  {result.partido.hora  && " " + result.partido.hora}
                </div>
              )}
              {result.partido?.estadio && (
                <div className="match-meta">📍 {result.partido.estadio}</div>
              )}
            </div>

            {/* Badge confianza */}
            <div className="conf-badge" style={{ background: cc + "18", borderColor: cc + "50", color: cc }}>
              {cIcon} {(rec?.confianza || 0) >= 70 ? "ALTA CONFIANZA" : (rec?.confianza || 0) >= 55 ? "MEDIA CONFIANZA" : "RIESGO ELEVADO"}
              {rec?.confianza && <span style={{ marginLeft:8, opacity:.7 }}>{rec.confianza}%</span>}
            </div>

            {/* Predicción API-Football */}
            {result.prediccion_api && (
              <div className="pred-box">
                <div className="pred-title">📊 Predicción API-Football</div>
                {result.prediccion_api.consejo && (
                  <div className="pred-advice">{result.prediccion_api.consejo}</div>
                )}
                {(result.prediccion_api.porc_local || result.prediccion_api.porc_empate) && (
                  <div className="pred-pcts">
                    <div className="pct-item">
                      <div className="pct-val" style={{ color:"var(--green)" }}>{result.prediccion_api.porc_local}</div>
                      <div className="pct-lbl">Local</div>
                    </div>
                    <div className="pct-item">
                      <div className="pct-val">{result.prediccion_api.porc_empate}</div>
                      <div className="pct-lbl">Empate</div>
                    </div>
                    <div className="pct-item">
                      <div className="pct-val" style={{ color:"var(--red)" }}>{result.prediccion_api.porc_vis}</div>
                      <div className="pct-lbl">Visitante</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estadísticas equipos */}
          <div className="sec-outer">
            <div className="sec">📈 Rendimiento — Últimos 5</div>
            <div className="two-col">
              <TeamCard t={result.local}     label="Local" />
              <TeamCard t={result.visitante} label="Visitante" />
            </div>
          </div>

          {/* Detalle últimos 5 */}
          <div className="sec-outer">
            <div className="sec">📋 Detalle últimos 5 partidos</div>
            <div className="two-col">
              <Last5 t={result.local} />
              <Last5 t={result.visitante} />
            </div>
          </div>

          {/* Cuotas */}
          {result.cuotas && Object.keys(result.cuotas).length > 0 && (
            <div className="sec-outer">
              <div className="sec">💰 Cuotas de mercado (datos reales)</div>
              <div className="card">
                <div className="odds-header">
                  <div />
                  <div className="oh">1 (Local)</div>
                  <div className="oh">X (Empate)</div>
                  <div className="oh">2 (Visitante)</div>
                </div>
                {Object.entries(result.cuotas).map(([book, odds]) => {
                  const isBest = result.mejor?.casa?.toLowerCase() === book.toLowerCase();
                  return (
                    <div key={book} className={"odds-row" + (isBest ? " odds-row-best" : "")}>
                      <div className="book-name">{book}{isBest ? " ★" : ""}</div>
                      {["1","X","2"].map(k => (
                        <div key={k} className={"oc" + (isBest && result.mejor?.col === k ? " oc-best" : "")}>
                          {odds[k] ?? "—"}
                        </div>
                      ))}
                    </div>
                  );
                })}
                {result.mejor && (
                  <div className="best-tip">
                    ★ Mejor cuota: <strong>{result.mejor.casa}</strong> — mercado <strong>{result.mejor.col}</strong> → <strong>{result.mejor.valor}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recomendación */}
          {rec && (
            <div className="sec-outer">
              <div className="sec">🎯 Recomendación del Tipster</div>
              <div className="rec-box" style={{ background: cDim, borderColor: cc + "40" }}>
                <div className="rec-pick-row">
                  <div className="rec-pick" style={{ color: cc }}>{rec.pick}</div>
                  {rec.stake && <div className="rec-stake">{rec.stake}</div>}
                </div>
                <div className="conf-bar-wrap">
                  <div className="conf-bar" style={{ width:(rec.confianza||0)+"%", background: cc }} />
                </div>
                {rec.resumen && (
                  <div className="rec-resumen">{rec.resumen}</div>
                )}
                <div className="rec-razon">{rec.razon}</div>
                {rec.ev && <div className="rec-ev">{rec.ev}</div>}
                {(rec.alertas || []).map((a, i) => (
                  <div key={i} className="rec-alerta">⚡ {a}</div>
                ))}
              </div>
            </div>
          )}

          {/* Picks alternativos */}
          {rec?.picks_alt?.length > 0 && (
            <div className="sec-outer">
              <div className="sec">🔀 Picks alternativos</div>
              <div className="card">
                {rec.picks_alt.map((p, i) => (
                  <div key={i} className="alt-row" style={{ borderBottom: i < rec.picks_alt.length-1 ? "1px solid var(--bd)" : "none" }}>
                    <span className="alt-mercado">{p.mercado}</span>
                    <span className="alt-right">
                      <span className="alt-cuota">{p.cuota}</span>
                      <span className="alt-conf">{p.conf}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análisis de mercado */}
          {rec?.analisis_mercado && (
            <div className="sec-outer">
              <div className="sec">📉 Análisis de mercado</div>
              <div className="card" style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>
                {rec.analisis_mercado}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            ⚠ Las apuestas deportivas conllevan riesgo de pérdida económica. Este análisis es orientativo. Apuesta siempre de forma responsable.
          </div>

          <button className="btn-ghost" onClick={() => { setResult(null); setError(""); }}>
            ← Nuevo análisis
          </button>
        </div>
      )}
    </div>
  );
}
