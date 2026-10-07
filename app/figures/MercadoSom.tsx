"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./figures.css";
import "./mercadoSom.css";

/*
  Continuação do "Mercado dimensionado":
    1) Triangulação do SOM: duas abordagens, uma faixa
    2) Por linha de serviço: anual e mensal lado a lado
    3) Leitura de decisão e limites
  Hover, foco (Tab) ou toque: o item se destaca, os demais esmaecem e um tooltip explica o número.
*/

const NAVY = "#0b1a40", BLUE = "#0a1f8f", RED = "#a31621", GREY = "#9aa0bd";

type TipContent = { tag: string; title: string; body: string };

/* ============ 1) Gráfico de triangulação ============ */
const W = 760, H = 300;
const X0 = 96, X1 = 724, YTOP = 26, YBASE = 214, MAXV = 8000;
const sx = (v: number) => X0 + (v / MAXV) * (X1 - X0);
const fmt = (v: number) => v.toLocaleString("pt-BR");

type Row = { id: "bu" | "td"; label: string; y: number; min: number; max: number; base: number; color: string; tip: TipContent };
const rows: Row[] = [
  {
    id: "bu", label: "Bottom-up", y: 96, min: 1330, max: 6770, base: 3450, color: BLUE,
    tip: { tag: "Bottom-up · SOM por ano", title: "1.330 a 6.770 pacientes únicos", body: "Base de 3.450 (cerca de 288 por mês): soma das áreas primária e secundária captadas." },
  },
  {
    id: "td", label: "Top-down", y: 164, min: 1540, max: 7070, base: 3640, color: NAVY,
    tip: { tag: "Top-down · SOM por ano", title: "1.540 a 7.070 pacientes únicos", body: "Base de 3.640 (cerca de 303 por mês): SAM-2 × captura de 6%, 10% ou 15%." },
  },
];
const BAND = { from: 1540, to: 6770 };
const bandTip: TipContent = {
  tag: "Faixa de planejamento",
  title: "1.540 a 6.770 por ano (128 a 564 por mês)",
  body: "É onde as duas abordagens se sobrepõem. Adotada como SOM de planejamento, com confiança baixa.",
};
const ticks = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

function Triangulacao() {
  const [active, setActive] = useState<"bu" | "td" | "band" | null>(null);

  const tipInfo = (() => {
    if (!active) return null;
    if (active === "band") return { x: (sx(BAND.from) + sx(BAND.to)) / 2, y: 60, c: bandTip };
    const r = rows.find((q) => q.id === active)!;
    return { x: sx(r.base), y: r.y + 46, c: r.tip };
  })();

  const bind = (id: "bu" | "td" | "band") => ({
    onPointerEnter: () => setActive(id),
    onPointerLeave: () => setActive((cur) => (cur === id ? null : cur)),
    onFocus: () => setActive(id),
    onBlur: () => setActive((cur) => (cur === id ? null : cur)),
    onClick: () => setActive((cur) => (cur === id ? null : id)),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Escape") setActive(null); },
  });

  return (
    <figure className="fig som-fig">
      <p className="fig-heading">Triangulação do SOM: duas abordagens, uma faixa</p>

      <div className="som-desktop">
        <div className="som-chart">
          <svg className={`som-svg${active === "bu" || active === "td" ? " has-row" : ""}`} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Gráfico: faixas de SOM anual nas abordagens bottom-up e top-down, com a faixa de planejamento">
            {/* faixa de planejamento */}
            <g className={`som-band${active === "band" ? " is-active" : ""}`} tabIndex={0} role="img" aria-label={`${bandTip.title}. ${bandTip.body}`} {...bind("band")}>
              <rect className="som-band-rect" x={sx(BAND.from)} y={YTOP} width={sx(BAND.to) - sx(BAND.from)} height={YBASE - YTOP} fill="#e1e3f1" />
              <text className="som-band-txt" x={(sx(BAND.from) + sx(BAND.to)) / 2} y={YTOP + 20} textAnchor="middle" fill="#0b1a40" fontSize={13.5} fontWeight={700}>
                faixa de planejamento: 1.540 a 6.770 por ano
              </text>
            </g>

            {/* eixos */}
            {ticks.map((t) => (
              <g key={t} pointerEvents="none">
                <line x1={sx(t)} x2={sx(t)} y1={YBASE} y2={YBASE + 6} stroke="#0b1a40" strokeWidth={1.6} />
                <text className="som-tick" x={sx(t)} y={YBASE + 24} textAnchor="middle" fill="#2b3150" fontSize={14}>{t}</text>
              </g>
            ))}
            <line x1={X0} x2={X1} y1={YBASE} y2={YBASE} stroke="#0b1a40" strokeWidth={2} pointerEvents="none" />
            <line x1={X0} x2={X0} y1={YTOP} y2={YBASE} stroke="#0b1a40" strokeWidth={2} pointerEvents="none" />
            <text x={(X0 + X1) / 2} y={YBASE + 56} textAnchor="middle" fill="#2b3150" fontSize={14.5} pointerEvents="none">pacientes únicos privados por ANO</text>

            {/* linhas: bottom-up e top-down */}
            {rows.map((r) => (
              <g key={r.id} className={`som-row${active === r.id ? " is-active" : ""}`} tabIndex={0} role="img" aria-label={`${r.tip.title}. ${r.tip.body}`} {...bind(r.id)}>
                <rect x={X0} y={r.y - 32} width={X1 - X0 + 40} height={78} fill="transparent" />
                <text x={X0 - 14} y={r.y + 5} textAnchor="end" fill="#0b1a40" fontSize={15}>{r.label}</text>
                <line className="som-line" x1={sx(r.min)} x2={sx(r.max)} y1={r.y} y2={r.y} stroke={r.color} strokeWidth={14} strokeLinecap="round" />
                <text x={sx(r.min)} y={r.y - 20} textAnchor="middle" fill="#0b1a40" fontSize={14.5}>{fmt(r.min)}</text>
                <text x={sx(r.max)} y={r.y - 20} textAnchor="middle" fill="#0b1a40" fontSize={14.5}>{fmt(r.max)}</text>
                <circle className="som-dot" cx={sx(r.base)} cy={r.y} r={10} fill={RED} stroke="#fff" strokeWidth={2} />
                <text className="som-base" x={sx(r.base)} y={r.y + 36} textAnchor="middle" fill={RED} fontSize={15} fontWeight={700}>base {fmt(r.base)}</text>
              </g>
            ))}
          </svg>

          {tipInfo && (
            <div
              className="som-tip"
              style={{ top: `${(tipInfo.y / H) * 100}%`, "--left": `${(tipInfo.x / W) * 100}%` } as CSSProperties}
              role="tooltip"
            >
              <span className="som-tip-tag">{tipInfo.c.tag}</span>
              <strong>{tipInfo.c.title}</strong>
              <p>{tipInfo.c.body}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista para telas pequenas */}
      <ul className="som-list" aria-label="Faixas de SOM anual">
        {rows.map((r) => (
          <li key={r.id}>
            <div className="som-list-head"><b>{r.label}</b><span>{fmt(r.min)} a {fmt(r.max)}</span></div>
            <span className="som-list-track">
              <i style={{ left: `${(r.min / MAXV) * 100}%`, width: `${((r.max - r.min) / MAXV) * 100}%`, background: r.color }} />
              <u style={{ left: `${(r.base / MAXV) * 100}%` }} />
            </span>
            <em>base {fmt(r.base)}</em>
          </li>
        ))}
        <li className="som-list-band"><b>Faixa de planejamento</b><span>1.540 a 6.770 por ano (128 a 564 por mês)</span></li>
      </ul>

      <figcaption>
        A faixa top-down (1.540 a 7.070 por ano) e a bottom-up (1.330 a 6.770 por ano) se sobrepõem entre 1.540 e 6.770 por ano (128 a 564 por mês), adotada como SOM de planejamento com confiança baixa.
      </figcaption>
    </figure>
  );
}

/* ============ 2) Tabela por linha de serviço ============ */
type Tag = { t: string; tip: string };
const Chip = ({ t, tip }: Tag) => <span className="som-chip" tabIndex={0} data-tip={tip}>{t}</span>;
const Ano = () => <b className="som-ano">/ano</b>;
const Mes = () => <b className="som-mes">/mês</b>;

const BENCH = "Referência externa usada como ponto de partida; precisa ser calibrada com os dados do hospital.";
const SEM = "Sem acesso a dado público confiável nesta rodada.";

type Linha = { id: string; label: ReactNode; premissas: ReactNode; tam: ReactNode; sam: ReactNode; som: ReactNode; color: string; tip: TipContent };
const linhas: Linha[] = [
  {
    id: "partos-ano", label: <>Partos <Ano /></>, color: RED,
    premissas: "Pop. x natalidade 14,0, 15,0, 15,6 por mil; participação privada 15, 20, 25%; captura 15, 25, 35%",
    tam: "10.300 / 11.040 / 11.480", sam: "450 / 640 / 840", som: "67 / 161 / 292 (top-down); 29 / 70 / 127 (bottom-up)",
    tip: { tag: "Partos · por ano", title: "Cenário base: 161 partos captados (top-down)", body: "De 11.040 partos na Macro II, 640 são do mercado privado. O HMSP capta 161 pelo top-down ou 70 pelo bottom-up." },
  },
  {
    id: "partos-mes", label: <>Partos <Mes /></>, color: BLUE,
    premissas: "Anual dividido por 12", tam: "858 / 920 / 957", sam: "38 / 53 / 70", som: "6 / 13 / 24 (top-down); 2 / 6 / 11 (bottom-up)",
    tip: { tag: "Partos · por mês", title: "Cenário base: 13 partos por mês (top-down)", body: "De 920 partos por mês na Macro II, 53 são privados. O HMSP capta 13 pelo top-down ou 6 pelo bottom-up." },
  },
  {
    id: "int-ano", label: <>Internações, exceto partos <Ano /></>, color: RED,
    premissas: <>Taxa 3,5, 4,5, 5,5% da população <Chip t="[BENCHMARK a calibrar]" tip={BENCH} />; SOM 8, 12, 18% do SAM</>,
    tam: "25.800 / 33.100 / 40.500", sam: "900 / 1.640 / 2.590", som: "72 / 197 / 467",
    tip: { tag: "Internações · por ano", title: "Cenário base: 197 internações captadas", body: "De 33.100 internações na Macro II, 1.640 são do mercado privado. O HMSP capta 12% desse SAM." },
  },
  {
    id: "int-mes", label: <>Internações, exceto partos <Mes /></>, color: BLUE,
    premissas: "Anual dividido por 12", tam: "2.150 / 2.758 / 3.375", sam: "75 / 137 / 216", som: "6 / 16 / 39",
    tip: { tag: "Internações · por mês", title: "Cenário base: 16 internações por mês", body: "Mesmo no cenário otimista são 39 por mês: poucas dezenas, como lembra a leitura de decisão abaixo." },
  },
  {
    id: "urgencia", label: <>Urgência, diagnóstico e ambulatório</>, color: GREY,
    premissas: "Sem taxa pública confiável de uso privado nesta rodada",
    tam: <Chip t="[SEM ACESSO]" tip={SEM} />, sam: <Chip t="[SEM ACESSO]" tip={SEM} />, som: "Dimensionar com agenda e PA dos últimos 12 meses",
    tip: { tag: "Urgência, diagnóstico e ambulatório", title: "Ainda sem número público", body: "O dimensionamento virá da agenda e do pronto atendimento dos últimos 12 meses do próprio hospital." },
  },
];

function TabelaServico() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; above: boolean }) | null>(null);

  const enter = (r: Linha, i: number, el: HTMLElement) => {
    const w = wrapRef.current;
    if (!w) return;
    const a = el.getBoundingClientRect(), b = w.getBoundingClientRect();
    const above = i >= linhas.length - 2;
    setActive(r.id);
    setTip({ ...r.tip, above, top: above ? a.top - b.top : a.bottom - b.top });
  };
  const leave = () => { setActive(null); setTip(null); };

  return (
    <div className="som-tbl-block">
      <h3 className="som-h3">Por linha de serviço: anual e mensal lado a lado</h3>
      <div className="som-tbl-box" ref={wrapRef}>
        <div className="som-tbl-wrap">
          <table className={`som-tbl${active ? " has-active" : ""}`}>
            <thead>
              <tr>
                <th scope="col">Linha</th>
                <th scope="col">Premissas</th>
                <th scope="col">TAM Macro II</th>
                <th scope="col">SAM privado</th>
                <th scope="col">SOM HMSP</th>
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
                  <td data-label="Premissas">{r.premissas}</td>
                  <td data-label="TAM Macro II">{r.tam}</td>
                  <td data-label="SAM privado">{r.sam}</td>
                  <td data-label="SOM HMSP" className="som-som">{r.som}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tip && (
          <div className={`som-tip som-tip-tbl ${tip.above ? "is-above" : "is-below"}`} style={{ top: tip.top }} role="tooltip">
            <span className="som-tip-tag">{tip.tag}</span>
            <strong>{tip.title}</strong>
            <p>{tip.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ 3) Leitura de decisão e limites ============ */
function Leitura() {
  return (
    <aside className="som-callout" aria-label="Leitura de decisão e limites">
      <p className="som-callout-k">LEITURA DE DECISÃO E LIMITES</p>
      <p className="som-callout-p">
        Mesmo na faixa otimista, o SOM privado de internações é de poucas dezenas por mês. A diretoria precisa responder primeiro: qual a participação de contratos e de convênios institucionais na receita (por ciclo de 30 dias)? Sem essa resposta, qualquer meta de volume é arriscada. Premissas de acesso privado, captura e taxa de internação são{" "}
        <Chip t="[ESTIMATIVA-MÉTODO]" tip="Valor calculado pelo método do plano a partir de dados públicos." /> ou{" "}
        <Chip t="[BENCHMARK]" tip={BENCH} />. Cobertura de planos: 25,37% no Brasil (nov/2024) e cerca de 10,4% em Cacoal, com 10.155 beneficiários{" "}
        <span className="som-chip som-chip-est" tabIndex={0} data-tip="Contagem de pessoas em um momento, não um fluxo por período.">(estoque)</span>{" "}
        <Chip t="[DADO: ANS]" tip="Dado oficial da ANS (Agência Nacional de Saúde Suplementar)." />.
      </p>
    </aside>
  );
}

/* ============ Bloco completo ============ */
export default function MercadoSom() {
  return (
    <div className="som-root">
      <Triangulacao />
      <TabelaServico />
      <Leitura />
    </div>
  );
}
