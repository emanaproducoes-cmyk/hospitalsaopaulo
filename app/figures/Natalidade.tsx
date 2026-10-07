"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./figures.css";
import "./natalidadeFigura.css";

/*
  Natalidade na Macrorregião II:
    1) Rondônia: nascidos vivos por ano (linha)   e   Cacoal, 2024: nascimentos por ano (barras)
    2) Tabela de indicadores (conservador, base, otimista)
    3) Parágrafo de leitura e card "Teste que derruba a premissa"
  Hover, foco (Tab) ou toque: o item se destaca, os demais esmaecem e um tooltip explica o número.
*/

const NAVY = "#0b1a40", BLUE = "#0a1f8f", RED = "#a31621", GREY = "#c4c7da", MUTED = "#9aa0bd";
const fmt = (v: number) => v.toLocaleString("pt-BR");

type TipContent = { tag: string; title: string; body: string };
type ChartTip = { x: number; y: number; above: boolean; c: TipContent } | null;

/* ============ Gráfico 1: linha de Rondônia ============ */
const LW = 440, LH = 330;
const L = { x0: 66, x1: 420, top: 44, base: 270, min: 18000, max: 26000 };
const ly = (v: number) => L.base - ((v - L.min) / (L.max - L.min)) * (L.base - L.top);
const pontos = [
  { ano: 2023, v: 23830, x: L.x0 + 22, above: false, tip: { tag: "SINASC · 2023", title: "23.830 nascidos vivos", body: "Ponto de partida da série: cerca de 1.986 nascimentos por mês em Rondônia (mães residentes)." } },
  { ano: 2024, v: 21518, x: (L.x0 + L.x1) / 2, above: true, tip: { tag: "SINASC · 2024", title: "21.518 nascidos vivos", body: "2.312 a menos que em 2023 (−9,7%): cerca de 1.793 por mês." } },
  { ano: 2025, v: 20227, x: L.x1 - 22, above: true, tip: { tag: "SINASC · 2025", title: "20.227 nascidos vivos", body: "1.291 a menos que em 2024 (−6,0%) e 3.603 a menos que em 2023 (−15,1%): cerca de 1.686 por mês." } },
];
const yTicksL = [18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 26000];

function GraficoLinha() {
  const [active, setActive] = useState<number | null>(null);
  const cur = pontos.find((p) => p.ano === active) ?? null;
  const tip: ChartTip = cur ? { x: cur.x, y: ly(cur.v) + (cur.above ? -38 : 26), above: cur.above, c: cur.tip } : null;
  const bind = (ano: number) => ({
    onPointerEnter: () => setActive(ano),
    onPointerLeave: () => setActive((c) => (c === ano ? null : c)),
    onFocus: () => setActive(ano),
    onBlur: () => setActive((c) => (c === ano ? null : c)),
    onClick: () => setActive((c) => (c === ano ? null : ano)),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Escape") setActive(null); },
  });
  return (
    <div className="nat-chart-box">
      <p className="nat-title">Rondônia: nascidos vivos por ANO<br />(SINASC, mães residentes)</p>
      <div className="nat-chart">
        <svg className={`nat-svg${active ? " has-active" : ""}`} viewBox={`0 0 ${LW} ${LH}`} role="group" aria-label="Gráfico de linha: nascidos vivos em Rondônia por ano, 2023 a 2025">
          {yTicksL.map((t) => (
            <g key={t} pointerEvents="none">
              <line x1={L.x0} x2={L.x1} y1={ly(t)} y2={ly(t)} stroke="#eceef6" strokeWidth={1} />
              <text x={L.x0 - 10} y={ly(t) + 4.5} textAnchor="end" fill="#2b3150" fontSize={13}>{t}</text>
            </g>
          ))}
          <line x1={L.x0} x2={L.x0} y1={L.top - 6} y2={L.base} stroke="#0b1a40" strokeWidth={1.8} pointerEvents="none" />
          <line x1={L.x0} x2={L.x1} y1={L.base} y2={L.base} stroke="#0b1a40" strokeWidth={1.8} pointerEvents="none" />

          <polyline className="nat-poly" points={pontos.map((p) => `${p.x},${ly(p.v)}`).join(" ")} fill="none" stroke={RED} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" pointerEvents="none" />

          {pontos.map((p) => (
            <g key={p.ano} className={`nat-pt${active === p.ano ? " is-active" : ""}`} tabIndex={0} role="img" aria-label={`${p.tip.title}. ${p.tip.body}`} {...bind(p.ano)}>
              <rect x={p.x - 56} y={L.top - 20} width={112} height={L.base - L.top + 40} fill="transparent" />
              <line x1={p.x} x2={p.x} y1={L.base} y2={L.base + 6} stroke="#0b1a40" strokeWidth={1.6} />
              <text x={p.x} y={L.base + 24} textAnchor="middle" fill="#2b3150" fontSize={13.5}>{p.ano}</text>
              <circle className="nat-dot" cx={p.x} cy={ly(p.v)} r={7.5} fill={RED} stroke="#fff" strokeWidth={2} />
              <text className="nat-val" x={p.x} y={ly(p.v) - 14} textAnchor="middle" fill={NAVY} fontSize={15} fontWeight={700}>{fmt(p.v)}</text>
            </g>
          ))}
        </svg>
        <Tip tip={tip} />
      </div>
    </div>
  );
}

/* ============ Gráfico 2: barras de Cacoal ============ */
const B = { x0: 70, x1: 420, top: 44, base: 270, max: 2000 };
const by = (v: number) => B.base - (v / B.max) * (B.base - B.top);
const barras = [
  { id: "res", label: ["Mães", "residentes"], v: 1258, cx: B.x0 + 90, color: GREY, tip: { tag: "Cacoal · 2024", title: "1.258 nascimentos de mães residentes", body: "Cerca de 105 por mês: bebês de mulheres que moram em Cacoal." } },
  { id: "cac", label: ["Nascidos", "em Cacoal"], v: 1798, cx: B.x1 - 90, color: BLUE, tip: { tag: "Cacoal · 2024", title: "1.798 bebês nasceram em Cacoal", body: "Cerca de 150 por mês: o município funciona como polo materno-infantil e recebe nascimentos de outras localidades." } },
];
const deltaTip: TipContent = { tag: "Atração regional", title: "+540 por ano (+45 por mês)", body: "Diferença líquida entre os bebês que nascem em Cacoal e os filhos de mães residentes: 43% a mais." };
const yTicksB = [0, 500, 1000, 1500, 2000];

function GraficoBarras() {
  const [active, setActive] = useState<string | null>(null);
  let tip: ChartTip = null;
  if (active === "delta") tip = { x: (B.x0 + B.x1) / 2, y: 78, above: false, c: deltaTip };
  else {
    const b = barras.find((q) => q.id === active);
    if (b) tip = { x: b.cx, y: by(b.v) + 36, above: false, c: b.tip };
  }
  const bind = (id: string) => ({
    onPointerEnter: () => setActive(id),
    onPointerLeave: () => setActive((c) => (c === id ? null : c)),
    onFocus: () => setActive(id),
    onBlur: () => setActive((c) => (c === id ? null : c)),
    onClick: () => setActive((c) => (c === id ? null : id)),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Escape") setActive(null); },
  });
  return (
    <div className="nat-chart-box">
      <p className="nat-title">Cacoal, 2024: nascimentos por ANO</p>
      <div className="nat-chart">
        <svg className={`nat-svg${active ? " has-active" : ""}`} viewBox={`0 0 ${LW} ${LH}`} role="group" aria-label="Gráfico de barras: nascimentos em Cacoal em 2024, mães residentes e nascidos em Cacoal">
          {yTicksB.map((t) => (
            <g key={t} pointerEvents="none">
              <line x1={B.x0} x2={B.x1} y1={by(t)} y2={by(t)} stroke="#eceef6" strokeWidth={1} />
              <text x={B.x0 - 10} y={by(t) + 4.5} textAnchor="end" fill="#2b3150" fontSize={13}>{t}</text>
            </g>
          ))}
          <line x1={B.x0} x2={B.x0} y1={B.top - 6} y2={B.base} stroke="#0b1a40" strokeWidth={1.8} pointerEvents="none" />
          <line x1={B.x0} x2={B.x1} y1={B.base} y2={B.base} stroke="#0b1a40" strokeWidth={1.8} pointerEvents="none" />

          {barras.map((b) => (
            <g key={b.id} className={`nat-bar${active === b.id ? " is-active" : ""}`} tabIndex={0} role="img" aria-label={`${b.tip.title}. ${b.tip.body}`} {...bind(b.id)}>
              <rect x={b.cx - 85} y={B.top - 10} width={170} height={B.base - B.top + 10} fill="transparent" />
              <rect className="nat-rect" x={b.cx - 60} y={by(b.v)} width={120} height={B.base - by(b.v)} fill={b.color} />
              <text className="nat-val" x={b.cx} y={by(b.v) - 9} textAnchor="middle" fill={NAVY} fontSize={15} fontWeight={700}>{fmt(b.v)}</text>
              {b.label.map((l, i) => (
                <text key={i} x={b.cx} y={B.base + 22 + i * 17} textAnchor="middle" fill="#2b3150" fontSize={13.5}>{l}</text>
              ))}
            </g>
          ))}

          <g className={`nat-delta${active === "delta" ? " is-active" : ""}`} tabIndex={0} role="img" aria-label={`${deltaTip.title}. ${deltaTip.body}`} {...bind("delta")}>
            <rect x={(B.x0 + B.x1) / 2 - 62} y={B.top - 34} width={124} height={44} fill="transparent" />
            <text className="nat-delta-t" x={(B.x0 + B.x1) / 2} y={B.top - 14} textAnchor="middle" fill={RED} fontSize={14} fontWeight={700}>+540 por ano</text>
            <text className="nat-delta-t" x={(B.x0 + B.x1) / 2} y={B.top + 4} textAnchor="middle" fill={RED} fontSize={14} fontWeight={700}>(+45 por mês)</text>
          </g>
        </svg>
        <Tip tip={tip} />
      </div>
    </div>
  );
}

/* ============ Tooltip do gráfico (posição em % do SVG) ============ */
function Tip({ tip }: { tip: ChartTip }) {
  if (!tip) return null;
  return (
    <div
      className={`nat-tip ${tip.above ? "is-above" : "is-below"}`}
      style={{ top: `${(tip.y / LH) * 100}%`, "--left": `${(tip.x / LW) * 100}%` } as CSSProperties}
      role="tooltip"
    >
      <span className="nat-tip-tag">{tip.c.tag}</span>
      <strong>{tip.c.title}</strong>
      <p>{tip.c.body}</p>
    </div>
  );
}

/* ============ Etiquetas com tooltip ============ */
const Chip = ({ t, tip, est }: { t: string; tip: string; est?: boolean }) => (
  <span className={`nat-chip${est ? " nat-chip-est" : ""}`} tabIndex={0} data-tip={tip}>{t}</span>
);
const Ano = () => <b className="nat-ano">/ano</b>;
const Mes = () => <b className="nat-mes">/mês</b>;

/* ============ Tabela ============ */
type Linha = { id: string; label: ReactNode; c: string; b: string; o: string; metodo: ReactNode; color: string; tip: TipContent };
const linhas: Linha[] = [
  {
    id: "taxa", label: <>Taxa bruta (por mil habitantes, ano)</>, c: "14,0", b: "15,0", o: "15,6", color: NAVY,
    metodo: <>RO 2022 = 24.738 / 1.581.196 <Chip t="[ESTIMATIVA-MÉTODO]" tip="Valor calculado pelo método do plano a partir de dados públicos." /></>,
    tip: { tag: "Taxa bruta de natalidade", title: "14,0 · 15,0 · 15,6 por mil", body: "Rondônia teve 24.738 nascidos vivos em 2022 para 1.581.196 habitantes, ou 15,6 por mil. É a taxa usada no cenário otimista." },
  },
  {
    id: "macro-ano", label: <>Nascimentos <Ano />, Macro II</>, c: "10.300", b: "11.040", o: "11.480", color: RED,
    metodo: "735.852 x taxa",
    tip: { tag: "Macro II · por ano", title: "11.040 nascimentos no cenário base", body: "População da Macrorregião II (735.852) × taxa de 15,0 por mil. Vai de 10.300 a 11.480." },
  },
  {
    id: "macro-mes", label: <>Nascimentos <Mes />, Macro II</>, c: "858", b: "920", o: "957", color: BLUE,
    metodo: "Anual dividido por 12",
    tip: { tag: "Macro II · por mês", title: "920 nascimentos por mês (base)", body: "Anual dividido por 12. Vai de 858 a 957 por mês." },
  },
  {
    id: "cac-ano", label: <>Nascimentos <Ano />, Cacoal (residentes)</>, c: "1.220", b: "1.300", o: "1.360", color: RED,
    metodo: "86.887 x taxa; partos ocorridos são maiores pela atração regional",
    tip: { tag: "Cacoal · mães residentes", title: "1.300 nascimentos por ano (base)", body: "População de Cacoal (86.887) × taxa. Os partos que acontecem na cidade são mais numerosos (1.798 em 2024), pela atração regional." },
  },
  {
    id: "cac-mes", label: <>Nascimentos <Mes />, Cacoal (residentes)</>, c: "102", b: "108", o: "113", color: BLUE,
    metodo: "Anual dividido por 12",
    tip: { tag: "Cacoal · mães residentes", title: "108 nascimentos por mês (base)", body: "Anual dividido por 12. Vai de 102 a 113 por mês." },
  },
  {
    id: "priv-ano", label: <>Partos privados no alcance ativo <Ano /></>, c: "450", b: "640", o: "840", color: RED,
    metodo: "Nascimentos x 15, 20, 25% x 29,1%",
    tip: { tag: "Alcance ativo · por ano", title: "640 partos privados (base)", body: "Nascimentos × participação privada de 15%, 20% ou 25% × 29,1% (alcance ativo). Vai de 450 a 840." },
  },
  {
    id: "priv-mes", label: <>Partos privados no alcance ativo <Mes /></>, c: "38", b: "53", o: "70", color: BLUE,
    metodo: "Anual dividido por 12",
    tip: { tag: "Alcance ativo · por mês", title: "53 partos privados por mês (base)", body: "Anual dividido por 12. Vai de 38 a 70 por mês." },
  },
  {
    id: "som-ano", label: <>Partos HMSP (SOM) <Ano /></>, c: "67", b: "161", o: "292", color: RED,
    metodo: "Captura 15, 25, 35%; confiança baixa",
    tip: { tag: "SOM · por ano", title: "161 partos do HMSP (base)", body: "Partos privados no alcance ativo × captura de 15%, 25% ou 35%. Vai de 67 a 292, com confiança baixa." },
  },
  {
    id: "som-mes", label: <>Partos HMSP (SOM) <Mes /></>, c: "6", b: "13", o: "24", color: BLUE,
    metodo: "Anual dividido por 12",
    tip: { tag: "SOM · por mês", title: "13 partos do HMSP por mês (base)", body: "Anual dividido por 12. Vai de 6 a 24 por mês: o ritmo que o hospital acompanha em ciclos de 30 dias." },
  },
];

function Tabela() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; above: boolean }) | null>(null);
  const enter = (r: Linha, i: number, el: HTMLElement) => {
    const w = wrapRef.current;
    if (!w) return;
    const a = el.getBoundingClientRect(), b = w.getBoundingClientRect();
    const above = i >= linhas.length - 3;
    setActive(r.id);
    setTip({ ...r.tip, above, top: above ? a.top - b.top : a.bottom - b.top });
  };
  const leave = () => { setActive(null); setTip(null); };
  return (
    <div className="nat-tbl-box" ref={wrapRef}>
      <div className="nat-tbl-wrap">
        <table className={`nat-tbl${active ? " has-active" : ""}`}>
          <thead>
            <tr>
              <th scope="col">Indicador</th>
              <th scope="col" className="nat-n">Conserv.</th>
              <th scope="col" className="nat-n">Base</th>
              <th scope="col" className="nat-n">Otimista</th>
              <th scope="col">Método e rótulo</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((r, i) => (
              <tr
                key={r.id}
                className={active === r.id ? "is-active" : ""}
                style={{ "--c": r.color } as CSSProperties}
                tabIndex={0}
                aria-label={`${r.tip.title}. ${r.tip.body}`}
                onPointerEnter={(e) => enter(r, i, e.currentTarget)}
                onPointerLeave={leave}
                onFocus={(e) => enter(r, i, e.currentTarget)}
                onBlur={leave}
                onKeyDown={(e) => { if (e.key === "Escape") leave(); }}
              >
                <th scope="row">{r.label}</th>
                <td data-label="Conserv." className="nat-n">{r.c}</td>
                <td data-label="Base" className="nat-n nat-base">{r.b}</td>
                <td data-label="Otimista" className="nat-n">{r.o}</td>
                <td data-label="Método e rótulo">{r.metodo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tip && (
        <div className={`nat-tip nat-tip-tbl ${tip.above ? "is-above" : "is-below"}`} style={{ top: tip.top }} role="tooltip">
          <span className="nat-tip-tag">{tip.tag}</span>
          <strong>{tip.title}</strong>
          <p>{tip.body}</p>
        </div>
      )}
    </div>
  );
}

/* ============ Componente principal ============ */
export default function Natalidade() {
  return (
    <div className="nat-root">
      <figure className="fig nat-fig">
        <div className="nat-pair">
          <GraficoLinha />
          <GraficoBarras />
        </div>
        <figcaption>
          Fonte: SINASC/DATASUS <Chip t="[DADO]" tip="Dado oficial, extraído do SINASC (Sistema de Informações sobre Nascidos Vivos, do DATASUS)." />. Valores anuais; equivalentes mensais no texto.
        </figcaption>
      </figure>

      <Tabela />

      <p className="nat-text">
        No Brasil em 2023, mulheres de 30 anos ou mais responderam por 39% dos nascimentos, as de 25 a 29 por 25,5% e as adolescentes por 11,8%{" "}
        <Chip t="[DADO: IBGE]" tip="Dado oficial do IBGE (Estatísticas do Registro Civil)." />. Em Cacoal, cerca de 14.400 mulheres de 20 a 39 anos{" "}
        <Chip t="(estoque)" est tip="Contagem de pessoas em um momento, não um fluxo por período." />{" "}
        <Chip t="[PREMISSA: metade de 28.762]" tip="Premissa de planejamento: cerca de metade de 28.762, o que dá aproximadamente 14.400 mulheres." />{" "}
        somam 1.220 a 1.360 nascimentos <Ano />: de 8,5 a 9,4 partos por 100 mulheres nessa idade, por ano.
      </p>

      <aside className="nat-callout" aria-label="Teste que derruba a premissa">
        <p className="nat-callout-k">TESTE QUE DERRUBA A PREMISSA</p>
        <p className="nat-callout-p">
          Se, nos primeiros 100 contatos de maternidade, mais de 40% das gestantes tiverem menos de 25 anos ou não tiverem fonte pagadora privada, o{" "}
          <Chip t="ICP-1" est tip="ICP-1: o perfil de paciente prioritário do plano." /> deve ser recalibrado e a oferta redesenhada. Fonte de calibração:{" "}
          <Chip t="SINASC" est tip="Sistema de Informações sobre Nascidos Vivos, do DATASUS (Ministério da Saúde)." /> por município de residência e de ocorrência.
        </p>
      </aside>
    </div>
  );
}
