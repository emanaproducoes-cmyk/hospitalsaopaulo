"use client";

import { useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import "./figures.css";
import "./pracaMapa.css";
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


type Tip = { x: number; y: number; tag: string; title: string; body: string } | null;

type Props = {
  activeReg: RegionId | null;
  setActiveReg: Dispatch<SetStateAction<RegionId | null>>;
};

export default function PracaMapa({ activeReg, setActiveReg }: Props) {
  const [activeMun, setActiveMun] = useState<Mun | null>(null);

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
                  stroke="#fff"
                  strokeWidth={1.1}
                  strokeLinejoin="round"
                  className={`pra-mun${region === m.region ? " in-region" : ""}${activeMun?.name === m.name ? " is-active" : ""}`}
                  style={{ fill: regionById[m.region].color }}
                  onPointerEnter={() => setActiveMun(m)}
                  onPointerLeave={() => setActiveMun((cur) => (cur && cur.name === m.name ? null : cur))}
                  onClick={() => toggleMun(m)}
                >
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
                    <line className="pra-leader" stroke="#0b1a40" strokeWidth={1.4} x1={x} y1={y} x2={tx + (p.anchor === "start" ? -3 : p.anchor === "end" ? 3 : 0)} y2={ty + 4} />
                    {p.hmsp
                      ? <><circle className="pra-hmsp-halo" fill="rgba(246,201,69,0.28)" stroke="#f6c945" cx={x} cy={y} r={14} /><circle className="pra-hmsp" fill="#f6c945" stroke="#0b1a40" strokeWidth={2.6} cx={x} cy={y} r={8} /></>
                      : <circle className="pra-dot" fill="#fff" stroke="#0b1a40" strokeWidth={2.2} cx={x} cy={y} r={5} />}
                    <text className="pra-label" fill="#0b1a40" fontSize={14.5} fontWeight={700} stroke="#fff" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke" x={tx} y={ty} textAnchor={p.anchor}>{p.label}</text>
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
  );
}
