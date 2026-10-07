"use client";

import { useState } from "react";
import "./figures.css";

/*
  Mapa de ambiente do HMSP — SVG desenhado à mão, sem bibliotecas.
  Geometria validada: nenhum texto ultrapassa o anel ou o setor onde está.
  As posições (x, y) são o centro de cada bloco de texto no sistema de coordenadas do SVG.
*/

const CX = 500, CY = 500, R_OUT = 430, R_IN = 245, R_CORE = 100;
const VIEW = { x: 50, y: 50, w: 900, h: 900 }; // enquadra só o círculo

type Ring = "outer" | "inner";
type Node = {
  id: string; ring: Ring; angle: number; x: number; y: number;
  title: string[]; desc?: string[]; tooltip: string; tip?: string;
};

const OUTER_TAG = "Macroambiente · anel externo";
const INNER_TAG = "Microambiente · anel interno";

const nodes: Node[] = [
  // ----- Anel externo (macroambiente) -----
  { id: "economico", ring: "outer", angle: -25.71, x: 353.8, y: 196.4, title: ["Econômico"], desc: ["renda do Norte = 68%", "do Brasil; agro e café"], tooltip: "Econômico", tip: "renda do Norte = 68% do Brasil; agro e café" },
  { id: "demografico", ring: "outer", angle: 25.71, x: 646.2, y: 196.4, title: ["Demográfico"], desc: ["envelhecimento 60+:", "8,2% a 13,3%;", "natalidade em queda"], tooltip: "Demográfico", tip: "envelhecimento 60+: 8,2% a 13,3%; natalidade em queda" },
  { id: "concorrencial", ring: "outer", angle: 77.14, x: 828.5, y: 425.0, title: ["Concorrencial"], desc: ["oferta privada de", "urgência, cirurgia", "e imagem"], tooltip: "Concorrencial", tip: "oferta privada de urgência, cirurgia e imagem" },
  { id: "ambiental", ring: "outer", angle: 128.57, x: 763.5, y: 710.1, title: ["Ambiental e", "territorial"], desc: ["distâncias; Rota", "do Café; IG Matas", "de Rondônia"], tooltip: "Ambiental e territorial", tip: "distâncias; Rota do Café; IG Matas de Rondônia" },
  { id: "regulatorio", ring: "outer", angle: 180, x: 500, y: 837, title: ["Regulatório"], desc: ["CFM 2.336/2023,", "LGPD, ANS"], tooltip: "Regulatório", tip: "CFM 2.336/2023, LGPD, ANS" },
  { id: "tecnologico", ring: "outer", angle: 231.43, x: 236.5, y: 710.1, title: ["Tecnológico"], desc: ["WhatsApp como canal", "principal; IA e dados"], tooltip: "Tecnológico", tip: "WhatsApp como canal principal; IA e dados" },
  { id: "social", ring: "outer", angle: 282.86, x: 171.5, y: 425.0, title: ["Social"], desc: ["cultura de indicação", "e confiança local"], tooltip: "Social", tip: "cultura de indicação e confiança local" },
  // ----- Anel interno (microambiente) -----
  { id: "medicos", ring: "inner", angle: 0, x: 500, y: 328, title: ["Médicos", "parceiros"], tooltip: "Médicos parceiros", tip: "Médicos parceiros e empresas ampliam a confiança existente." },
  { id: "pacientes", ring: "inner", angle: 45, x: 621.6, y: 378.4, title: ["Pacientes", "e famílias"], tooltip: "Pacientes e famílias", tip: "Famílias procuram segurança e acolhimento." },
  { id: "equipe", ring: "inner", angle: 90, x: 672, y: 500, title: ["Equipe e", "corpo clínico"], tooltip: "Equipe e corpo clínico", tip: "Equipe, operadoras e reguladores dão sustentação ao sistema." },
  { id: "orgaos", ring: "inner", angle: 135, x: 621.6, y: 621.6, title: ["Órgãos", "reguladores", "(CFM, ANVISA,", "ANPD)"], tooltip: "Órgãos reguladores (CFM, ANVISA, ANPD)", tip: "Equipe, operadoras e reguladores dão sustentação ao sistema." },
  { id: "fornecedores", ring: "inner", angle: 180, x: 500, y: 672, title: ["Fornecedores", "e tecnologia"], tooltip: "Fornecedores e tecnologia" },
  { id: "concorrentes", ring: "inner", angle: 225, x: 378.4, y: 621.6, title: ["Concorrentes", "e substitutos"], tooltip: "Concorrentes e substitutos", tip: "Concorrentes são referência de leitura, não de cópia." },
  { id: "operadoras", ring: "inner", angle: 270, x: 328, y: 500, title: ["Operadoras", "e planos"], tooltip: "Operadoras e planos", tip: "Equipe, operadoras e reguladores dão sustentação ao sistema." },
  { id: "empresas", ring: "inner", angle: 315, x: 378.4, y: 378.4, title: ["Empresas e", "cooperativas"], tooltip: "Empresas e cooperativas", tip: "Médicos parceiros e empresas ampliam a confiança existente." },
];

const CORE = { id: "core", x: CX, y: CY, tooltip: "HMSP, hospital de família", tag: "Centro do mapa", tip: "“O hospital da família de Cacoal, conduzido por médicos da região desde 1996”." };

/* ---------- geometria ---------- */
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (r: number, a: number) => [CX + r * Math.sin(rad(a)), CY - r * Math.cos(rad(a))];
function wedge(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r1} ${r1} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${r0} ${r0} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`;
}

/* Alturas de linha (mesmas usadas na validação do layout) */
const SIZE = { title: 17, desc: 13.5, inner: 15 };
const LH = { title: 21, desc: 17.5, inner: 19 };

type Line = { text: string; kind: "title" | "desc" | "inner"; y: number };
function layoutLines(n: Node): Line[] {
  const rows: { text: string; kind: Line["kind"] }[] = n.ring === "outer"
    ? [...n.title.map((t) => ({ text: t, kind: "title" as const })), ...(n.desc ?? []).map((t) => ({ text: t, kind: "desc" as const }))]
    : n.title.map((t) => ({ text: t, kind: "inner" as const }));
  const total = rows.reduce((s, r) => s + LH[r.kind], 0);
  let y = n.y - total / 2;
  return rows.map((r) => {
    const base = y + LH[r.kind] / 2 + SIZE[r.kind] * 0.34;
    y += LH[r.kind];
    return { ...r, y: base };
  });
}

const half = { outer: 180 / 7, inner: 22.5 };

export default function Ambiente() {
  const [active, setActive] = useState<string | null>(null);
  const toggle = (id: string) => setActive((cur) => (cur === id ? null : id));

  const tip = active === "core"
    ? { x: CORE.x, y: CORE.y, title: CORE.tooltip, tag: CORE.tag, body: CORE.tip }
    : (() => {
        const n = nodes.find((m) => m.id === active);
        return n ? { x: n.x, y: n.y, title: n.tooltip, tag: n.ring === "outer" ? OUTER_TAG : INNER_TAG, body: n.tip } : null;
      })();

  const px = tip ? ((tip.x - VIEW.x) / VIEW.w) * 100 : 0;
  const py = tip ? ((tip.y - VIEW.y) / VIEW.h) * 100 : 0;
  const below = tip ? tip.y < 330 : false; // blocos do topo abrem o tooltip para baixo

  const handlers = (id: string) => ({
    onPointerEnter: () => setActive(id),
    onPointerLeave: () => setActive((cur) => (cur === id ? null : cur)),
    onFocus: () => setActive(id),
    onBlur: () => setActive((cur) => (cur === id ? null : cur)),
    onClick: () => toggle(id),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(id); } if (e.key === "Escape") setActive(null); },
  });

  return (
    <figure className="fig fig-ambiente">
      <p className="fig-heading">Microambiente (anel interno) <span aria-hidden="true">|</span> Macroambiente (anel externo)</p>

      <div className="amb-wrap">
        <svg
          className={`amb-svg${active ? " has-active" : ""}`}
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          role="group"
          aria-label="Mapa de ambiente do HMSP: hospital no centro, microambiente no anel interno e macroambiente no anel externo"
        >
          {nodes.map((n) => {
            const h = half[n.ring];
            const [r0, r1] = n.ring === "outer" ? [R_IN, R_OUT] : [R_CORE, R_IN];
            const aria = `${n.tooltip}${n.tip ? ": " + n.tip : ""}`;
            return (
              <g key={n.id} className={`amb-node amb-${n.ring}${active === n.id ? " is-active" : ""}`} tabIndex={0} role="button" aria-label={aria} aria-pressed={active === n.id} {...handlers(n.id)}>
                <path className="amb-wedge" d={wedge(r0, r1, n.angle - h, n.angle + h)} />
                {layoutLines(n).map((l, i) => (
                  <text key={i} className={`amb-text amb-t-${l.kind}`} x={n.x} y={l.y} textAnchor="middle">{l.text}</text>
                ))}
              </g>
            );
          })}

          <g className={`amb-core${active === "core" ? " is-active" : ""}`} tabIndex={0} role="button" aria-label={`${CORE.tooltip}: ${CORE.tip}`} aria-pressed={active === "core"} {...handlers("core")}>
            <circle className="amb-core-halo" cx={CX} cy={CY} r={R_CORE + 10} />
            <circle className="amb-core-disc" cx={CX} cy={CY} r={R_CORE} />
            {["HMSP", "hospital", "de família"].map((t, i) => (
              <text key={t} className="amb-core-text" x={CX} y={CY - 26 + i * 30 + 7} textAnchor="middle">{t}</text>
            ))}
          </g>
        </svg>

        {tip && (
          <div className={`amb-tip ${below ? "is-below" : "is-above"}`} style={{ top: `${py}%`, "--left": `${px}%` } as React.CSSProperties} role="tooltip">
            <span className="amb-tip-tag">{tip.tag}</span>
            <strong>{tip.title}</strong>
            {tip.body && <p>{tip.body}</p>}
          </div>
        )}
      </div>

      {/* Versão em lista para telas pequenas (o desenho fica ilegível abaixo de ~640px) */}
      <div className="amb-list">
        <div>
          <h4>{INNER_TAG}</h4>
          <ul>{nodes.filter((n) => n.ring === "inner").map((n) => <li key={n.id}><strong>{n.tooltip}</strong>{n.tip ? <span>{n.tip}</span> : null}</li>)}</ul>
        </div>
        <div>
          <h4>{OUTER_TAG}</h4>
          <ul>{nodes.filter((n) => n.ring === "outer").map((n) => <li key={n.id}><strong>{n.tooltip}</strong><span>{n.tip}</span></li>)}</ul>
        </div>
      </div>

      <figcaption>Mapa de ambiente do HMSP: elaboração própria a partir de fontes públicas.</figcaption>
    </figure>
  );
}
