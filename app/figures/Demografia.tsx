"use client";

import { useState, type CSSProperties } from "react";
import "./figures.css";
import "./demografia.css";

/*
  Gráficos de Cacoal (SVG desenhado à mão, sem bibliotecas):
    1) composição etária da população (Censo 2022)
    2) renda domiciliar per capita, 2022
    3) cobertura de planos de saúde
  Passe o mouse (ou toque/Tab) em uma barra: o grupo dela se destaca, as demais esmaecem e um tooltip explica o número.
*/

type Bar = {
  id: string;
  label: string[];
  value: number;
  text: string;
  color: string;
  group: string;
  tag: string;
  title: string;
  body: string;
};

type ChartProps = {
  bars: Bar[];
  W: number; H: number;
  x0: number; x1: number; yTop: number; yBase: number;
  max: number; barW: number;
  ticks?: number[];
  yLabel?: string;
  valSize?: number; labelSize?: number;
  ariaLabel: string;
  tipOffset?: number;
};

const fmt1 = (v: number) => v.toFixed(1).replace(".", ",");

const RED = "#a31621", BLUE = "#0a1f8f", NAVY = "#0b1a40", GREY = "#c4c7da";

/* ---------- Gráfico de barras genérico ---------- */
function BarChart({ bars, W, H, x0, x1, yTop, yBase, max, barW, ticks, yLabel, valSize = 17, labelSize = 16, ariaLabel, tipOffset = 30 }: ChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const slot = (x1 - x0) / bars.length;
  const plotH = yBase - yTop;
  const activeBar = bars.find((b) => b.id === active) ?? null;
  const activeGroup = activeBar?.group ?? null;

  const geo = (b: Bar, i: number) => {
    const h = (b.value / max) * plotH;
    return { cx: x0 + slot * (i + 0.5), top: yBase - h, h };
  };
  const tipGeo = activeBar ? geo(activeBar, bars.indexOf(activeBar)) : null;

  return (
    <div className="dem-chart">
      <svg className={`dem-svg${active ? " has-active" : ""}`} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={ariaLabel}>
        {ticks && ticks.map((t) => {
          const y = yBase - (t / max) * plotH;
          return (
            <g key={t}>
              <line className="dem-grid" x1={x0} x2={x1} y1={y} y2={y} />
              <text className="dem-tick" x={x0 - 12} y={y + 5} textAnchor="end">{fmt1(t)}</text>
            </g>
          );
        })}
        {yLabel && <text className="dem-ylabel" transform={`translate(22 ${(yTop + yBase) / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>}

        {ticks && <line className="dem-axis" x1={x0} x2={x0} y1={yTop - 4} y2={yBase} />}
        <line className="dem-axis" x1={ticks ? x0 : x0 - 10} x2={ticks ? x1 : x1 + 10} y1={yBase} y2={yBase} />

        {bars.map((b, i) => {
          const g = geo(b, i);
          const on = () => setActive(b.id);
          const off = () => setActive((cur) => (cur === b.id ? null : cur));
          return (
            <g
              key={b.id}
              className={`dem-b${activeGroup === b.group ? " in-group" : ""}${active === b.id ? " is-active" : ""}`}
              tabIndex={0}
              role="img"
              aria-label={`${b.title}. ${b.body}`}
              onPointerEnter={on}
              onPointerLeave={off}
              onFocus={on}
              onBlur={off}
              onClick={() => setActive((cur) => (cur === b.id ? null : b.id))}
              onKeyDown={(e) => { if (e.key === "Escape") setActive(null); }}
            >
              {/* área de captura maior que a barra (facilita o hover em barras baixas) */}
              <rect className="dem-hit" x={g.cx - slot / 2} y={yTop - 30} width={slot} height={yBase - yTop + 30} />
              <rect className="dem-rect" x={g.cx - barW / 2} y={g.top} width={barW} height={g.h} fill={b.color} />
              <text className="dem-val" x={g.cx} y={g.top - 9} textAnchor="middle" style={{ fontSize: valSize }}>{b.text}</text>
              {b.label.map((l, k) => (
                <text key={k} className="dem-xlabel" x={g.cx} y={yBase + labelSize + 12 + k * (labelSize + 4)} textAnchor="middle" style={{ fontSize: labelSize }}>{l}</text>
              ))}
            </g>
          );
        })}
      </svg>

      {activeBar && tipGeo && (
        <div
          className="dem-tip"
          style={{ top: `${((tipGeo.top - tipOffset) / H) * 100}%`, "--left": `${(tipGeo.cx / W) * 100}%` } as CSSProperties}
          role="tooltip"
        >
          <span className="dem-tip-tag">{activeBar.tag}</span>
          <strong>{activeBar.title}</strong>
          <p>{activeBar.body}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Dados ---------- */
const idade: [string, number][] = [["0-9", 13.4], ["10-19", 14.0], ["20-29", 17.0], ["30-39", 16.1], ["40-49", 14.5], ["50-59", 11.7], ["60-69", 7.9], ["70+", 5.4]];

const idadeBars: Bar[] = idade.map(([faixa, v]) => {
  const first = parseInt(faixa, 10);
  let group = "g1", color = GREY, tag = "Até 19 anos", extra = "Crianças e adolescentes somam 27,4% da população.";
  if (first >= 20 && first < 40) { group = "g2"; color = RED; tag = "Famílias jovens (20-39)"; extra = "As faixas de 20 a 39 anos somam 33,1%: é o público da maternidade e da pediatria."; }
  else if (first >= 40 && first < 60) { group = "g3"; color = BLUE; tag = "Adultos maduros (40-69)"; extra = "As faixas de 40 a 69 anos somam 34,1%: cuidado recorrente e cirurgia eletiva."; }
  else if (first >= 60) { group = "g4"; color = NAVY; tag = first === 60 ? "Adultos maduros (40-69) e 60+" : "60+"; extra = "A população de 60+ passou de 8,2% (2010) para 13,3% (2022)."; }
  return {
    id: faixa,
    label: [faixa],
    value: v,
    text: `${fmt1(v)}%`,
    color, group, tag,
    title: `${faixa} anos: ${fmt1(v)}%`,
    body: `${extra} Censo 2022.`,
  };
});

const rendaBars: Bar[] = [
  { id: "norte", label: ["Norte"], value: 1107, text: "R$ 1.107", color: RED, group: "norte", tag: "Renda domiciliar per capita, 2022", title: "Norte: R$ 1.107 por mês", body: "Equivale a 68% da renda do Brasil, R$ 518 a menos por mês." },
  { id: "brasil", label: ["Brasil"], value: 1625, text: "R$ 1.625", color: GREY, group: "brasil", tag: "Renda domiciliar per capita, 2022", title: "Brasil: R$ 1.625 por mês", body: "Referência nacional para comparar a renda do Norte." },
];

const planosBars: Bar[] = [
  { id: "cacoal", label: ["Cacoal", "(ANS, 2026)"], value: 10.4, text: "10,4%", color: RED, group: "cacoal", tag: "Cobertura de planos de saúde", title: "Cacoal: 10,4% da população", body: "Cerca de 10.155 beneficiários, 15,0 pontos percentuais abaixo do Brasil." },
  { id: "brasil", label: ["Brasil", "(ANS, nov/2024)"], value: 25.4, text: "25,4%", color: GREY, group: "brasil", tag: "Cobertura de planos de saúde", title: "Brasil: 25,4% da população", body: "Cacoal tem menos da metade dessa cobertura: o mercado privado é mais estreito." },
];

const Estoque = () => <b className="dem-estoque">(estoque)</b>;
const Dado = () => <b className="dem-dado">[DADO]</b>;

/* ---------- Bloco completo ---------- */
export default function Demografia() {
  return (
    <div className="dem-block">
      {/* 1) Composição etária */}
      <figure className="fig fig-idade">
        <p className="fig-heading">Cacoal: composição etária da população</p>
        <p className="dem-sub">
          <span>Famílias jovens (20-39): <b>33,1%</b></span>
          <span>Adultos maduros (40-69): <b>34,1%</b></span>
          <span>60+: <b>8,2%</b> (2010) para <b>13,3%</b> (2022)</span>
        </p>

        <div className="dem-desktop">
          <BarChart
            bars={idadeBars}
            W={900} H={400} x0={92} x1={880} yTop={30} yBase={340}
            max={20} barW={70}
            ticks={[0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20]}
            yLabel="% da população (estoque, Censo 2022)"
            ariaLabel="Gráfico de barras: percentual da população de Cacoal por faixa etária, Censo 2022"
          />
        </div>

        {/* Lista para telas pequenas (as barras ficam ilegíveis abaixo de ~640px) */}
        <ul className="dem-list" aria-label="Composição etária de Cacoal, Censo 2022">
          {idadeBars.map((b) => (
            <li key={b.id}>
              <span className="dem-list-k">{b.id}</span>
              <span className="dem-list-track"><i style={{ width: `${(b.value / 20) * 100}%`, background: b.color }} /></span>
              <span className="dem-list-v">{b.text}</span>
            </li>
          ))}
        </ul>

        <figcaption>Fonte: IBGE, Censo 2022 <Dado />. Percentuais sobre a população total <Estoque />.</figcaption>
      </figure>

      {/* 2) e 3) Renda e cobertura */}
      <figure className="fig fig-renda">
        <div className="dem-pair">
          <div className="dem-mini">
            <p className="dem-title">Renda domiciliar per capita, 2022 (R$ por mês)</p>
            <BarChart
              bars={rendaBars}
              W={440} H={330} x0={30} x1={410} yTop={50} yBase={262}
              max={1625} barW={150}
              valSize={16} labelSize={15} tipOffset={34}
              ariaLabel="Gráfico de barras: renda domiciliar per capita em 2022, Norte e Brasil"
            />
          </div>
          <div className="dem-mini">
            <p className="dem-title">Cobertura de planos de saúde (% da população)</p>
            <BarChart
              bars={planosBars}
              W={440} H={330} x0={30} x1={410} yTop={50} yBase={262}
              max={25.4} barW={150}
              valSize={16} labelSize={15} tipOffset={34}
              ariaLabel="Gráfico de barras: cobertura de planos de saúde, Cacoal e Brasil"
            />
          </div>
        </div>
        <figcaption>Fonte: IBGE (renda, 2022) e ANS (cobertura) <Dado />. Cobertura: ≈10.155 beneficiários em Cacoal <Estoque />.</figcaption>
      </figure>
    </div>
  );
}
