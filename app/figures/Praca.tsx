"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import "./figures.css";
import "./Pracamapa.css";
import "./pracaTabelas.css";
import Demografia from "./Demografia";
import { MAP_W, MAP_H, municipios, cidades, type Mun, type RegionId } from "./rondoniaPaths";

/*
  "Nossa praça": mapa de Rondônia (52 municípios) + tabelas + gráficos de Cacoal.
  Mapa e tabelas conversam: passar o mouse (ou focar com Tab) em uma região, área de influência
  ou município destaca o mesmo grupo no mapa e na tabela.
*/

/* ---------- Dados ---------- */
const COLOR: Record<RegionId, string> = {
  cafe: "#a31621", mata: "#0a1f8f", cone: "#0b1a40", central: "#5865cc", guapore: "#e8c4c4", outro: "#dadbe3",
};
const NAME: Record<RegionId, string> = {
  cafe: "Região Café", mata: "Região Zona da Mata", cone: "Região Cone Sul",
  central: "Região Central", guapore: "Região Vale do Guaporé", outro: "Macrorregião I e demais",
};
/* Nº de municípios por região, conforme a tabela do plano (34 na Macro II + 18 fora = 52) */
const N_MUN: Record<RegionId, number> = { cafe: 6, mata: 8, cone: 7, central: 10, guapore: 3, outro: 18 };
const LEGEND: RegionId[] = ["cafe", "mata", "cone", "central", "guapore", "outro"];

type AreaKind = "primaria" | "secundaria" | "terciaria";
type AreaId = AreaKind | "ativo";
const AREA_COLOR: Record<AreaId, string> = { primaria: COLOR.cafe, secundaria: COLOR.mata, terciaria: COLOR.central, ativo: COLOR.cone };
const PRIMARIA = ["Cacoal", "Ministro Andreazza"];
const SECUNDARIA = ["Rolim de Moura", "Pimenta Bueno", "Espigão d'Oeste"];
const AREA_TXT: Record<AreaKind, string> = {
  primaria: "Área de influência primária do HMSP (12,7% da população da Macro II).",
  secundaria: "Área de influência secundária do HMSP (16,4% da população da Macro II).",
  terciaria: "Área de influência terciária: restante da Macrorregião II.",
};

const areaOf = (m: Mun): AreaKind | null =>
  PRIMARIA.includes(m.name) ? "primaria" : SECUNDARIA.includes(m.name) ? "secundaria" : m.region !== "outro" ? "terciaria" : null;

type Focus = { kind: "region"; id: RegionId } | { kind: "area"; id: AreaId } | null;

const inFocus = (m: Mun, f: Focus) => {
  if (!f) return false;
  if (f.kind === "region") return m.region === f.id;
  const a = areaOf(m);
  return f.id === "ativo" ? a === "primaria" || a === "secundaria" : a === f.id;
};

const BY_NAME: Record<string, Mun> = Object.fromEntries(municipios.map((m) => [m.name, m]));
/* Municípios de fora da Macro II primeiro, para os contornos brancos da Macro II ficarem por cima */
const ORDERED = [...municipios].sort((a, b) => (a.region === "outro" ? 0 : 1) - (b.region === "outro" ? 0 : 1));

function munInfo(m: Mun) {
  if (m.region === "outro") return { tag: NAME.outro, body: "Fora da área de leitura territorial do HMSP." };
  const extra = m.name === "Cacoal" ? "Sede do HMSP. 86.887 habitantes (IBGE, Censo 2022). " : "";
  return { tag: NAME[m.region], body: extra + AREA_TXT[areaOf(m)!] };
}

/* Cidades de referência. (lx, ly) = canto superior esquerdo do rótulo; o conector é calculado sozinho. */
type City = { id: string; name: string; mun: string; at: readonly [number, number]; lx: number; ly: number; tag: string; text: string };
const CITIES: City[] = [
  { id: "portoVelho", name: "Porto Velho", mun: "Porto Velho", at: cidades.portoVelho, lx: 330, ly: 72, tag: "Capital", text: "Capital de Rondônia. Fica fora da Macrorregião II." },
  { id: "ariquemes", name: "Ariquemes", mun: "Ariquemes", at: cidades.ariquemes, lx: 412, ly: 188, tag: "Macrorregião I e demais", text: "Município de referência fora da Macrorregião II." },
  { id: "jiParana", name: "Ji-Paraná", mun: "Ji-Paraná", at: cidades.jiParana, lx: 566, ly: 252, tag: "Região Central", text: "Município de referência da Região Central, com polo próprio. Área de influência terciária." },
  { id: "ouroPreto", name: "Ouro Preto", mun: "Ouro Preto do Oeste", at: cidades.ouroPreto, lx: 334, ly: 272, tag: "Região Central", text: "Ouro Preto do Oeste, na Região Central. Área de influência terciária." },
  { id: "cacoal", name: "Cacoal", mun: "Cacoal", at: cidades.cacoal, lx: 560, ly: 291, tag: "Sede do HMSP", text: "Hospital e Maternidade São Paulo. Polo da Região Café e referência materno-infantil para os municípios vizinhos." },
  { id: "rolim", name: "Rolim de Moura", mun: "Rolim de Moura", at: cidades.rolim, lx: 362, ly: 392, tag: "Região Zona da Mata", text: "Município de referência da Zona da Mata. Área de influência secundária." },
  { id: "pimenta", name: "Pimenta Bueno", mun: "Pimenta Bueno", at: cidades.pimenta, lx: 588, ly: 398, tag: "Região Café", text: "Município da Região Café. Área de influência secundária." },
  { id: "vilhena", name: "Vilhena", mun: "Vilhena", at: cidades.vilhena, lx: 655, ly: 520, tag: "Região Cone Sul", text: "Município de referência da Região Cone Sul, com polo próprio. Área de influência terciária." },
];
const labelW = (name: string) => Math.round(name.length * 8.3 + 14);

/* ---------- Tabelas ---------- */
const REGION_ROWS: { id: RegionId; k: string; muni: string; n: number }[] = [
  { id: "cafe", k: "Café", muni: "Cacoal (sede do HMSP), Espigão d’Oeste, Ministro Andreazza, Pimenta Bueno, Primavera de Rondônia, São Felipe d’Oeste", n: 6 },
  { id: "mata", k: "Zona da Mata", muni: "Rolim de Moura, Alta Floresta d’Oeste, Alto Alegre dos Parecis, Castanheiras, Nova Brasilândia d’Oeste, Novo Horizonte do Oeste, Santa Luzia d’Oeste, Parecis", n: 8 },
  { id: "cone", k: "Cone Sul", muni: "Vilhena, Colorado do Oeste, Cerejeiras, Cabixi, Corumbiara, Pimenteiras do Oeste, Chupinguaia", n: 7 },
  { id: "central", k: "Central (parte)", muni: "Ji-Paraná, Ouro Preto do Oeste, Presidente Médici, Urupá, Nova União, Teixeirópolis, Vale do Paraíso, Mirante da Serra, Alvorada d’Oeste e demais", n: 10 },
  { id: "guapore", k: "Vale do Guaporé", muni: "São Miguel do Guaporé, Seringueiras, São Francisco do Guaporé", n: 3 },
];

const AREA_ROWS: { id: AreaId; k: string; muni: string; pop: string; pct: number; total?: boolean }[] = [
  { id: "primaria", k: "Primária", muni: "Cacoal e Ministro Andreazza", pop: "93.353", pct: 12.7 },
  { id: "secundaria", k: "Secundária", muni: "Rolim de Moura, Pimenta Bueno e Espigão d’Oeste", pop: "120.899", pct: 16.4 },
  { id: "terciaria", k: "Terciária", muni: "Restante da Macro II (inclui Ji-Paraná e Vilhena, com polos próprios)", pop: "521.600", pct: 70.9 },
  { id: "ativo", k: "Alcance ativo", muni: "Primária + secundária: base de SAM e SOM", pop: "214.252", pct: 29.1, total: true },
];

const Tag = ({ children }: { children: string }) => <b className="pra-tag">[{children}]</b>;
const Est = () => <b className="pra-estoque">(estoque)</b>;

type Tip = { left: number; top: number; below: boolean; tag: string; title: string; body: string };

export default function Praca() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<Focus>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const clear = useCallback(() => { setFocus(null); setHover(null); setTip(null); }, []);

  /* Toque fora do mapa fecha o tooltip (no celular o tooltip fica até o próximo toque) */
  useEffect(() => {
    const off = (e: globalThis.PointerEvent) => { if (!mapRef.current?.contains(e.target as Node)) clear(); };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [clear]);

  const place = (e: PointerEvent) => {
    const box = mapRef.current?.getBoundingClientRect();
    if (!box) return { left: 50, top: 0, below: false };
    const top = e.clientY - box.top;
    return { left: ((e.clientX - box.left) / box.width) * 100, top, below: top < 130 };
  };
  const leave = (e: PointerEvent) => { if (e.pointerType !== "touch") clear(); };
  const moveTip = (e: PointerEvent) => setTip((t) => (t ? { ...t, ...place(e) } : t));

  const enterMun = (e: PointerEvent, m: Mun) => {
    const info = munInfo(m);
    setHover(m.name);
    setFocus({ kind: "region", id: m.region });
    setTip({ ...place(e), tag: info.tag, title: m.name, body: info.body });
  };
  const enterCity = (e: PointerEvent, c: City) => {
    const m = BY_NAME[c.mun];
    setHover(m.name);
    setFocus({ kind: "region", id: m.region });
    setTip({ ...place(e), tag: c.tag, title: c.name, body: c.text });
  };

  const rowProps = (f: NonNullable<Focus>) => ({
    tabIndex: 0,
    onPointerEnter: () => setFocus(f),
    onPointerLeave: leave,
    onFocus: () => setFocus(f),
    onBlur: clear,
  });

  const focusRegion = focus?.kind === "region" ? focus.id : null;
  const focusArea = focus?.kind === "area" ? focus.id : null;
  const hoverMun = hover ? BY_NAME[hover] : undefined;

  return (
    <div className="pra-stack" style={{ display: "grid", gap: 28 }}>
      {/* ================= MAPA ================= */}
      <figure className="fig fig-praca">
        <p className="fig-heading">Rondônia: 52 municípios e as regiões de saúde da Macrorregião II</p>

        <div className="pra-wrap">
          <div className="pra-map" ref={mapRef}>
            <svg
              className={`pra-svg${focus ? " has-active" : ""}`}
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              role="group"
              aria-label="Mapa de Rondônia por regiões de saúde, com a Macrorregião II e a sede do HMSP em Cacoal. As tabelas abaixo trazem as mesmas informações em texto."
            >
              {/* Municípios */}
              {ORDERED.map((m) => (
                <path
                  key={m.name}
                  d={m.d}
                  fill={COLOR[m.region]}
                  className={`pra-mun${inFocus(m, focus) ? " in-region" : ""}${hover === m.name ? " is-active" : ""}`}
                  onPointerEnter={(e) => enterMun(e, m)}
                  onPointerMove={moveTip}
                  onPointerLeave={leave}
                />
              ))}

              {/* Contorno do município sob o cursor (fica por cima dos vizinhos) */}
              {hoverMun && (
                <path
                  d={hoverMun.d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  pointerEvents="none"
                  style={{ filter: "drop-shadow(0 4px 8px rgba(11,26,64,.45))" }}
                />
              )}

              {/* Cidades de referência */}
              {CITIES.map((c) => {
                const [x, y] = c.at;
                const w = labelW(c.name);
                const h = 22;
                const ex = Math.min(Math.max(x, c.lx), c.lx + w);
                const ey = Math.min(Math.max(y, c.ly), c.ly + h);
                const hq = c.id === "cacoal";
                const dim = focus !== null && !inFocus(BY_NAME[c.mun], focus);
                return (
                  <g key={c.id} className={`pra-city${dim ? " is-dim" : ""}`}>
                    <line className="pra-leader" x1={x} y1={y} x2={ex} y2={ey} pointerEvents="none" />
                    <rect x={c.lx} y={c.ly} width={w} height={h} rx={4} fill="#fff" fillOpacity={0.95} stroke="#0b1a40" strokeOpacity={hq ? 0.9 : 0.18} pointerEvents="none" />
                    <text className="pra-label" x={c.lx + w / 2} y={c.ly + 15.5} textAnchor="middle" pointerEvents="none">{c.name}</text>
                    {hq && <circle className="pra-hmsp-halo" cx={x} cy={y} r={14} pointerEvents="none" />}
                    <circle className={hq ? "pra-hmsp" : "pra-dot"} cx={x} cy={y} r={hq ? 7.5 : 5} pointerEvents="none" />
                    <circle
                      className="pra-hit"
                      cx={x} cy={y} r={13}
                      fill="transparent"
                      onPointerEnter={(e) => enterCity(e, c)}
                      onPointerMove={moveTip}
                      onPointerLeave={leave}
                    />
                  </g>
                );
              })}
            </svg>

            {tip && (
              <div
                className={`pra-tip ${tip.below ? "is-below" : "is-above"}`}
                style={{ top: tip.top, "--left": `${tip.left}%` } as CSSProperties}
                role="status"
              >
                <span className="pra-tip-tag">{tip.tag}</span>
                <strong>{tip.title}</strong>
                <p>{tip.body}</p>
              </div>
            )}
          </div>

          {/* Legenda (clicável: destaca a região no mapa) */}
          <div className="pra-legend">
            <p className="pra-legend-title">Legenda</p>
            <ul>
              <li>
                <button
                  type="button"
                  className={`pra-leg-btn${focusRegion === "cafe" ? " is-active" : ""}`}
                  onPointerEnter={() => setFocus({ kind: "region", id: "cafe" })}
                  onPointerLeave={leave}
                  onFocus={() => setFocus({ kind: "region", id: "cafe" })}
                  onBlur={clear}
                >
                  <i className="pra-swatch pra-swatch-hmsp" />
                  <span>Sede do HMSP (Cacoal)</span>
                </button>
              </li>
              {LEGEND.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className={`pra-leg-btn${focusRegion === id ? " is-active" : ""}`}
                    onPointerEnter={() => setFocus({ kind: "region", id })}
                    onPointerLeave={leave}
                    onFocus={() => setFocus({ kind: "region", id })}
                    onBlur={clear}
                  >
                    <i className="pra-swatch" style={{ background: COLOR[id] }} />
                    <span>{NAME[id]}</span>
                    <em>{N_MUN[id]}</em>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <figcaption>
          Rondônia por regiões de saúde. Agrupamento por região conforme o Plano Regional e o RDQA da SESAU/RO <Tag>DADO</Tag>; pequenas diferenças de enquadramento devem ser conferidas com a SESAU.
        </figcaption>
      </figure>

      {/* ================= TABELAS ================= */}
      <div className="pra-tables">
        <div className="pra-tbl-wrap">
          <table className={`pra-tbl${focusRegion ? " has-active" : ""}`}>
            <thead>
              <tr>
                <th scope="col">Região de saúde (Macro II)</th>
                <th scope="col">Municípios</th>
                <th scope="col" className="pra-num">Nº</th>
              </tr>
            </thead>
            <tbody>
              {REGION_ROWS.map((r) => (
                <tr
                  key={r.id}
                  className={focusRegion === r.id ? "is-active" : ""}
                  style={{ "--c": COLOR[r.id] } as CSSProperties}
                  {...rowProps({ kind: "region", id: r.id })}
                >
                  <th scope="row">{r.k}</th>
                  <td data-label="Municípios">{r.muni}</td>
                  <td className="pra-num" data-label="Nº">{r.n}</td>
                </tr>
              ))}
              <tr className="pra-total">
                <th scope="row">Total da Macrorregião II</th>
                <td data-label="Municípios">735.852 habitantes <Est /> (IBGE 2022, SESAU/RO)</td>
                <td className="pra-num" data-label="Nº">34</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pra-tbl-wrap">
          <table className={`pra-tbl pra-tbl-inf${focusArea ? " has-active" : ""}`}>
            <thead>
              <tr>
                <th scope="col">Área de influência</th>
                <th scope="col">Municípios</th>
                <th scope="col">População <span className="pra-muted-h">(estoque)</span></th>
                <th scope="col">% Macro II</th>
              </tr>
            </thead>
            <tbody>
              {AREA_ROWS.map((r) => (
                <tr
                  key={r.id}
                  className={`${r.total ? "pra-total " : ""}${focusArea === r.id ? "is-active" : ""}`}
                  style={{ "--c": AREA_COLOR[r.id] } as CSSProperties}
                  {...rowProps({ kind: "area", id: r.id })}
                >
                  <th scope="row">{r.k}</th>
                  <td data-label="Municípios">{r.muni}</td>
                  <td className="pra-num" data-label="População (estoque)">{r.pop}</td>
                  <td data-label="% Macro II">
                    <span className="pra-pct">{String(r.pct).replace(".", ",")}%</span>
                    <span className="pra-bar"><b style={{ width: `${r.pct}%` }} /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= GRÁFICOS DE CACOAL ================= */}
      <Demografia />

      {/* ================= INDICADORES + LEITURA ================= */}
      <div className="pra-tables">
        <div className="pra-tbl-wrap">
          <table className="pra-tbl">
            <thead>
              <tr>
                <th scope="col">Indicador de Cacoal</th>
                <th scope="col">Valor</th>
                <th scope="col">Fonte e rótulo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">População (2022) <Est /></th>
                <td data-label="Valor">86.887 hab.; 22,91 hab/km²</td>
                <td data-label="Fonte e rótulo">IBGE Censo 2022 <Tag>DADO</Tag></td>
              </tr>
              <tr>
                <th scope="row">Mortalidade infantil (2023, por ano)</th>
                <td data-label="Valor">8,94 por mil nascidos vivos</td>
                <td data-label="Fonte e rótulo">IBGE, com base em DATASUS <Tag>DADO</Tag></td>
              </tr>
              <tr>
                <th scope="row">PIB per capita (2023, por ano)</th>
                <td data-label="Valor">R$ 44.292,79</td>
                <td data-label="Fonte e rótulo">IBGE Cidades <Tag>DADO</Tag></td>
              </tr>
              <tr>
                <th scope="row">Região Geográfica Imediata</th>
                <td data-label="Valor">14 municípios; 293.682 hab. <Est /></td>
                <td data-label="Fonte e rótulo">IBGE <Tag>DADO</Tag>; recorte geográfico, não fluxo de pacientes</td>
              </tr>
              <tr>
                <th scope="row">Café</th>
                <td data-label="Valor">IG “Matas de Rondônia” cobre Cacoal e mais 14 municípios; Lei 5.958/2025 define a Rota do Café</td>
                <td data-label="Fonte e rótulo">INPI; Governo de RO <Tag>FATO</Tag></td>
              </tr>
              <tr>
                <th scope="row">Valor adicionado (2013)</th>
                <td data-label="Valor">Serviços 77,5%; agropecuária 11,1%; indústria 11,4%</td>
                <td data-label="Fonte e rótulo">IBGE via IFRO <Tag>DADO, dado antigo</Tag></td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside className="pra-leitura">
          <p className="pra-leitura-k">Leitura da praça</p>
          <p>
            Cacoal é a terceira maior cidade da Macrorregião II, polo da Região Café e referência materno-infantil para vizinhos. A população envelhece e a renda é sensível, o que estreita o mercado privado alcançável: o crescimento virá de convênios corporativos, alcance regional e eficiência, mais do que de volume genérico.
          </p>
        </aside>
      </div>
    </div>
  );
}
