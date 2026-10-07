"use client";

import { useState, type CSSProperties } from "react";
import "./figures.css";
import "./praca.css";
import Demografia from "./Demografia";
import { MAP_H, MAP_W, cidades, municipios, type Mun, type RegionId } from "./rondoniaPaths";

/*
  Rondônia: 52 municípios e as regiões de saúde da Macrorregião II — SVG a partir da malha municipal real.
  Passe o mouse (ou toque) em um município: a região inteira se destaca, as demais esmaecem e um tooltip aparece.
  A legenda também é interativa (hover, foco por Tab ou toque).
*/

type Region = { id: RegionId; label: string; color: string };

const REGIONS: Region[] = [
  { id: "cafe", label: "Região Café", color: "#a31621" },
  { id: "mata", label: "Região Zona da Mata", color: "#0a1f8f" },
  { id: "cone", label: "Região Cone Sul", color: "#0b1a40" },
  { id: "central", label: "Região Central", color: "#4f5fc4" },
  { id: "guapore", label: "Região Vale do Guaporé", color: "#e8bcbc" },
  { id: "outro", label: "Macrorregião I e demais", color: "#d6d8e2" },
];

const regionById = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<RegionId, Region>;
const countByRegion = municipios.reduce((acc, m) => { acc[m.region] = (acc[m.region] ?? 0) + 1; return acc; }, {} as Record<RegionId, number>);

/* Rótulos das cidades de referência: (dx, dy) = posição do texto em relação ao ponto; anchor = alinhamento. */
type Pin = { id: keyof typeof cidades; label: string; dx: number; dy: number; anchor: "start" | "middle" | "end"; hmsp?: boolean };
const PINS: Pin[] = [
  { id: "portoVelho", label: "Porto Velho", dx: 16, dy: -14, anchor: "start" },
  { id: "ariquemes", label: "Ariquemes", dx: 16, dy: -14, anchor: "start" },
  { id: "jiParana", label: "Ji-Paraná", dx: 24, dy: -20, anchor: "start" },
  { id: "ouroPreto", label: "Ouro Preto", dx: -22, dy: 26, anchor: "end" },
  { id: "cacoal", label: "Cacoal", dx: 0, dy: -24, anchor: "middle", hmsp: true },
  { id: "rolim", label: "Rolim de Moura", dx: -22, dy: 34, anchor: "end" },
  { id: "pimenta", label: "Pimenta Bueno", dx: 6, dy: 46, anchor: "middle" },
  { id: "vilhena", label: "Vilhena", dx: 0, dy: 34, anchor: "middle" },
];


/* ---------- Tabelas abaixo do mapa ---------- */
type RegRow = { reg: RegionId; nome: string; muns: string; n: string; color: string };
const regRows: RegRow[] = [
  { reg: "cafe", nome: "Café", muns: "Cacoal (sede do HMSP), Espigão d’Oeste, Ministro Andreazza, Pimenta Bueno, Primavera de Rondônia, São Felipe d’Oeste", n: "6", color: "#a31621" },
  { reg: "mata", nome: "Zona da Mata", muns: "Rolim de Moura, Alta Floresta d’Oeste, Alto Alegre dos Parecis, Castanheiras, Nova Brasilândia d’Oeste, Novo Horizonte do Oeste, Santa Luzia d’Oeste, Parecis", n: "8", color: "#0a1f8f" },
  { reg: "cone", nome: "Cone Sul", muns: "Vilhena, Colorado do Oeste, Cerejeiras, Cabixi, Corumbiara, Pimenteiras do Oeste, Chupinguaia", n: "7", color: "#0b1a40" },
  { reg: "central", nome: "Central (parte)", muns: "Ji-Paraná, Ouro Preto do Oeste, Presidente Médici, Urupá, Nova União, Teixeirópolis, Vale do Paraíso, Mirante da Serra, Alvorada d’Oeste e demais", n: "10", color: "#4f5fc4" },
  { reg: "guapore", nome: "Vale do Guaporé", muns: "São Miguel do Guaporé, Seringueiras, São Francisco do Guaporé", n: "3", color: "#d99a9a" },
];

type InfRow = { nome: string; muns: string; pop: string; pct: number; pctTxt: string; color: string; total?: boolean };
const infRows: InfRow[] = [
  { nome: "Primária", muns: "Cacoal e Ministro Andreazza", pop: "93.353", pct: 12.7, pctTxt: "12,7%", color: "#a31621" },
  { nome: "Secundária", muns: "Rolim de Moura, Pimenta Bueno e Espigão d’Oeste", pop: "120.899", pct: 16.4, pctTxt: "16,4%", color: "#0a1f8f" },
  { nome: "Terciária", muns: "Restante da Macro II (inclui Ji-Paraná e Vilhena, com polos próprios)", pop: "521.600", pct: 70.9, pctTxt: "70,9%", color: "#9aa0bd" },
  { nome: "Alcance ativo", muns: "Primária + secundária: base de SAM e SOM", pop: "214.252", pct: 29.1, pctTxt: "29,1%", color: "#0b1a40", total: true },
];

function PracaTabelas({ activeReg, setActiveReg }: { activeReg: RegionId | null; setActiveReg: (r: RegionId | null) => void }) {
  const [activeInf, setActiveInf] = useState<string | null>(null);
  return (
    <div className="pra-tables">
      <div className="pra-tbl-wrap">
        <table className={`pra-tbl${activeReg ? " has-active" : ""}`}>
          <thead>
            <tr><th scope="col">Região de saúde (Macro II)</th><th scope="col">Municípios</th><th scope="col" className="pra-num">Nº</th></tr>
          </thead>
          <tbody>
            {regRows.map((r) => (
              <tr
                key={r.reg}
                className={activeReg === r.reg ? "is-active" : ""}
                style={{ "--c": r.color } as CSSProperties}
                tabIndex={0}
                onPointerEnter={() => setActiveReg(r.reg)}
                onPointerLeave={() => setActiveReg(null)}
                onFocus={() => setActiveReg(r.reg)}
                onBlur={() => setActiveReg(null)}
              >
                <th scope="row">{r.nome}</th>
                <td data-label="Municípios">{r.muns}</td>
                <td data-label="Nº" className="pra-num">{r.n}</td>
              </tr>
            ))}
            <tr className="pra-total" style={{ "--c": "#0b1a40" } as CSSProperties}>
              <th scope="row">Total da Macrorregião II</th>
              <td data-label="População">735.852 habitantes <b className="pra-muted">(estoque)</b> (IBGE 2022, SESAU/RO)</td>
              <td data-label="Nº" className="pra-num">34</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pra-tbl-wrap">
        <table className={`pra-tbl pra-tbl-inf${activeInf ? " has-active" : ""}`}>
          <thead>
            <tr>
              <th scope="col">Área de influência</th>
              <th scope="col">Municípios</th>
              <th scope="col" className="pra-num">População <span className="pra-muted-h">(estoque)</span></th>
              <th scope="col" className="pra-num">% Macro II</th>
            </tr>
          </thead>
          <tbody>
            {infRows.map((r) => (
              <tr
                key={r.nome}
                className={`${activeInf === r.nome ? "is-active" : ""}${r.total ? " pra-total" : ""}`}
                style={{ "--c": r.color } as CSSProperties}
                tabIndex={0}
                onPointerEnter={() => setActiveInf(r.nome)}
                onPointerLeave={() => setActiveInf((cur) => (cur === r.nome ? null : cur))}
                onFocus={() => setActiveInf(r.nome)}
                onBlur={() => setActiveInf((cur) => (cur === r.nome ? null : cur))}
              >
                <th scope="row">{r.nome}</th>
                <td data-label="Municípios">{r.muns}</td>
                <td data-label="População (estoque)" className="pra-num">{r.pop}</td>
                <td data-label="% Macro II" className="pra-num">
                  <span className="pra-pct">{r.pctTxt}</span>
                  <i className="pra-bar" aria-hidden="true"><b style={{ width: `${r.pct}%` }} /></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type Tip = { x: number; y: number; tag: string; title: string; body: string } | null;

export default function Praca() {
  const [activeMun, setActiveMun] = useState<Mun | null>(null);
  const [activeReg, setActiveReg] = useState<RegionId | null>(null);

  const region: RegionId | null = activeMun ? activeMun.region : activeReg;

  const tip: Tip = activeMun
    ? {
        x: activeMun.cx,
        y: activeMun.cy,
        tag: regionById[activeMun.region].label,
        title: activeMun.name,
        body: activeMun.name === "Cacoal"
          ? "Sede do Hospital e Maternidade São Paulo (HMSP)."
          : `${countByRegion[activeMun.region]} municípios nesta região.`,
      }
    : null;

  const below = tip ? tip.y < 220 : false;
  const px = tip ? (tip.x / MAP_W) * 100 : 0;
  const py = tip ? (tip.y / MAP_H) * 100 : 0;

  const toggleMun = (m: Mun) => setActiveMun((cur) => (cur && cur.name === m.name ? null : m));
  const toggleReg = (id: RegionId) => setActiveReg((cur) => (cur === id ? null : id));

  return (
    <>
    <figure className="fig fig-praca">
      <p className="fig-heading">Rondônia: 52 municípios e as regiões de saúde da Macrorregião II</p>

      <div className="pra-wrap">
        <div className="pra-map">
          <svg
            className={`pra-svg${region ? " has-active" : ""}`}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            role="img"
            aria-label="Mapa de Rondônia com os 52 municípios agrupados por região de saúde. A sede do HMSP fica em Cacoal, na Região Café."
          >
            <g>
              {municipios.map((m) => (
                <path
                  key={m.name}
                  d={m.d}
                  fillRule="evenodd"
                  className={`pra-mun${region === m.region ? " in-region" : ""}${activeMun?.name === m.name ? " is-active" : ""}`}
                  style={{ fill: regionById[m.region].color }}
                  onPointerEnter={() => setActiveMun(m)}
                  onPointerLeave={() => setActiveMun((cur) => (cur && cur.name === m.name ? null : cur))}
                  onClick={() => toggleMun(m)}
                >
                  <title>{m.name}</title>
                </path>
              ))}
            </g>

            {/* Cidades de referência: pontos, linhas-guia e rótulos (não captam o mouse) */}
            <g className="pra-pins" pointerEvents="none">
              {PINS.map((p) => {
                const [x, y] = cidades[p.id];
                const tx = x + p.dx;
                const ty = y + p.dy;
                return (
                  <g key={p.id}>
                    <line className="pra-leader" x1={x} y1={y} x2={tx + (p.anchor === "start" ? -3 : p.anchor === "end" ? 3 : 0)} y2={ty + 4} />
                    {p.hmsp
                      ? <><circle className="pra-hmsp-halo" cx={x} cy={y} r={14} /><circle className="pra-hmsp" cx={x} cy={y} r={8} /></>
                      : <circle className="pra-dot" cx={x} cy={y} r={5} />}
                    <text className="pra-label" x={tx} y={ty} textAnchor={p.anchor}>{p.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>

          {tip && (
            <div
              className={`pra-tip ${below ? "is-below" : "is-above"}`}
              style={{ top: `${py}%`, "--left": `${px}%` } as CSSProperties}
              role="tooltip"
            >
              <span className="pra-tip-tag">{tip.tag}</span>
              <strong>{tip.title}</strong>
              <p>{tip.body}</p>
            </div>
          )}
        </div>

        <div className="pra-legend" role="group" aria-label="Legenda das regiões de saúde">
          <p className="pra-legend-title">Legenda</p>
          <ul>
            <li>
              <button
                type="button"
                className="pra-leg-btn"
                onPointerEnter={() => setActiveReg("cafe")}
                onPointerLeave={() => setActiveReg(null)}
                onFocus={() => setActiveReg("cafe")}
                onBlur={() => setActiveReg(null)}
              >
                <i className="pra-swatch pra-swatch-hmsp" aria-hidden="true" />
                <span>Sede do HMSP (Cacoal)</span>
              </button>
            </li>
            {REGIONS.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`pra-leg-btn${activeReg === r.id ? " is-active" : ""}`}
                  aria-pressed={activeReg === r.id}
                  onPointerEnter={() => setActiveReg(r.id)}
                  onPointerLeave={() => setActiveReg((cur) => (cur === r.id ? null : cur))}
                  onFocus={() => setActiveReg(r.id)}
                  onBlur={() => setActiveReg((cur) => (cur === r.id ? null : cur))}
                  onClick={() => toggleReg(r.id)}
                >
                  <i className="pra-swatch" style={{ background: r.color }} aria-hidden="true" />
                  <span>{r.label}</span>
                  <em>{countByRegion[r.id]}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption>
        Rondônia por regiões de saúde. Agrupamento por região conforme o Plano Regional e o RDQA da SESAU/RO <b className="pra-tag">[DADO]</b>; pequenas diferenças de enquadramento devem ser conferidas com a SESAU.
      </figcaption>
    </figure>

    <PracaTabelas activeReg={activeReg} setActiveReg={setActiveReg} />
    <Demografia />
    </>
  );
}
