"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./forcaMarcaFigura.css";

type TipContent = { tag: string; title: string; body: string };
type Confianca = "Baixa" | "Média";
type Dim = { nome: string; linhas: string[]; proxy: string; nota: number; confianca: Confianca; leitura: string };
type Serie = "meta" | "partida";
type Origem = "grafico" | "tabela" | "lista";
type Ativo = { tipo: "dim"; i: number; origem: Origem } | { tipo: "serie"; s: Serie } | null;

/* Índice composto de partida = média simples das seis notas: 34 ÷ 6 = 5,67 → 5,7 (confere com o print). */
const META = 7.5;
const INDICE_PARTIDA = 5.7;

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

const COR_CONF: Record<Confianca, string> = { Baixa: "#a31621", "Média": "#0a1f8f" };
const TIP_CONF: Record<Confianca, string> = {
  Baixa: "Confiança baixa: poucos sinais públicos; a nota deve ser confirmada na próxima medição.",
  "Média": "Confiança média: a nota se apoia em ativos que podem ser observados e conferidos.",
};

const DIMS: Dim[] = [
  {
    nome: "Consciência e saliência", linhas: ["Consciência e", "saliência"],
    proxy: "Mais de 50 anos; presença em Maps; buscas de marca a medir", nota: 7, confianca: "Baixa",
    leitura: "Mais de 50 anos de história e presença no Maps; o volume de buscas pela marca ainda precisa ser medido.",
  },
  {
    nome: "Associações", linhas: ["Associações"],
    proxy: "Positivas: zelo, família. A desenvolver: especialidade âncora, rapidez, transparência de plano", nota: 6, confianca: "Baixa",
    leitura: "Zelo e família já aparecem como associações positivas; especialidade âncora, rapidez e transparência de plano ainda precisam ser construídas.",
  },
  {
    nome: "Qualidade percebida", linhas: ["Qualidade", "percebida"],
    proxy: "Maps 3,9/5 (137 avaliações); Reclame Aqui não acessado", nota: 5, confianca: "Baixa",
    leitura: "Nota pública no Maps de 3,9/5 em 137 avaliações; o Reclame Aqui não foi acessado nesta rodada.",
  },
  {
    nome: "Lealdade e ressonância", linhas: ["Lealdade e", "ressonância"],
    proxy: "Gerações de famílias (premissa); afeto nas redes", nota: 6, confianca: "Baixa",
    leitura: "Gerações de famílias atendidas (premissa a confirmar) e afeto visível nas redes sociais.",
  },
  {
    nome: "Ativos proprietários", linhas: ["Ativos", "proprietários"],
    proxy: "Nome, coração, fundador, 1996, corpo clínico com CRM/RQE, Parto Humanizado", nota: 7, confianca: "Média",
    leitura: "Nome, coração, fundador, 1996, corpo clínico com CRM/RQE e Parto Humanizado: ativos próprios, difíceis de copiar.",
  },
  {
    nome: "Padronização dos pontos de contato", linhas: ["Padronização dos", "pontos de contato"],
    proxy: "Telefone, CTA, horários e narrativa histórica em formato único: a dimensão de maior alavancagem e menor custo", nota: 3, confianca: "Média",
    leitura: "Maior distância até a meta. Unificar telefone, CTA, horários e narrativa histórica é a dimensão de maior alavancagem e menor custo.",
  },
];

const SOMA = DIMS.reduce((s, d) => s + d.nota, 0);

/* Geometria do radar (viewBox 660 × 450, recortado 38 px no topo). Escala 0–10, anéis a cada 2 pontos. */
const W = 660, H = 450, TOPO = 38, CX = 330, CY = 240, R = 150, ESCALA = R / 10;
const ANG = [0, 60, 120, 180, 240, 300];
function ponto(i: number, v: number): [number, number] {
  const a = (ANG[i] * Math.PI) / 180;
  return [CX + v * ESCALA * Math.cos(a), CY - v * ESCALA * Math.sin(a)];
}
const toPts = (vals: number[]) => vals.map((v, i) => ponto(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
const ROTULOS: { x: number; y: number[]; anchor: "start" | "middle" | "end" }[] = [
  { x: 492, y: [234, 250], anchor: "start" },
  { x: 418, y: [78], anchor: "middle" },
  { x: 242, y: [62, 78], anchor: "middle" },
  { x: 168, y: [234, 250], anchor: "end" },
  { x: 242, y: [412, 428], anchor: "middle" },
  { x: 418, y: [412, 428], anchor: "middle" },
];
const ANEIS = [2, 4, 6, 8, 10];

const tipDim = (d: Dim): TipContent => ({
  tag: `Nota ${fmt(d.nota)} · confiança ${d.confianca.toLowerCase()}`,
  title: d.nome,
  body: `Partida ${fmt(d.nota)} → meta ${fmt(META)} (+${fmt(META - d.nota)}). ${d.leitura}`,
});
const TIP_SERIE: Record<Serie, TipContent> = {
  partida: {
    tag: "Ponto de partida · estimativa-método",
    title: `Índice composto ${fmt(INDICE_PARTIDA)} de 10`,
    body: `Média simples das seis notas: ${SOMA} ÷ 6 = ${fmt(Math.round((SOMA / 6) * 100) / 100)}, arredondado para ${fmt(INDICE_PARTIDA)}. A medição se repete em 90 dias.`,
  },
  meta: {
    tag: "Meta em 12 meses",
    title: `Índice composto ${fmt(META)} de 10`,
    body: `+${fmt(Math.round((META - INDICE_PARTIDA) * 10) / 10)} ponto sobre a partida. A maior distância está em Padronização dos pontos de contato (3 → ${fmt(META)}).`,
  },
};

function useTip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; above: boolean }) | null>(null);
  const show = (el: HTMLElement, above: boolean, c: TipContent) => {
    const w = wrapRef.current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    setTip({ ...c, above, top: above ? r.top - wr.top : r.bottom - wr.top });
  };
  return { wrapRef, tip, show, hide: () => setTip(null) };
}

export default function ForcaMarca() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);
  const tbl = useTip();

  const limpar = () => { setAtivo(null); tbl.hide(); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };
  /* Mouse: destaca ao passar. Toque: cada toque liga/desliga (o pointerleave do toque é ignorado). */
  const entra = (e: PointerEvent, f: () => void) => { if (e.pointerType !== "touch") f(); };
  const toque = (e: PointerEvent, f: () => void) => { if (e.pointerType === "touch") f(); };
  const alternarSerie = (s: Serie) => setAtivo((a) => (a?.tipo === "serie" && a.s === s ? null : { tipo: "serie", s }));

  /* Toque fora da figura fecha o destaque. */
  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setAtivo(null); tbl.hide(); } };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dimAtiva = ativo?.tipo === "dim" ? ativo.i : -1;
  const serieAtiva = ativo?.tipo === "serie" ? ativo.s : null;

  /* Tooltip do gráfico: aparece quando a origem é o próprio radar ou a legenda. */
  let chartTip: (TipContent & { x: number; y: number; dir: "up" | "down" }) | null = null;
  if (ativo?.tipo === "dim" && ativo.origem === "grafico") {
    const [x, y] = ponto(ativo.i, META);
    chartTip = { ...tipDim(DIMS[ativo.i]), x, y, dir: ativo.i === 1 || ativo.i === 2 ? "down" : "up" };
  } else if (ativo?.tipo === "serie") {
    chartTip = { ...TIP_SERIE[ativo.s], x: CX, y: CY, dir: "up" };
  }

  const ligarDim = (i: number, origem: Origem) => setAtivo({ tipo: "dim", i, origem });
  const alternarDim = (i: number, origem: Origem) => setAtivo((a) => (a?.tipo === "dim" && a.i === i ? null : { tipo: "dim", i, origem }));

  const svgCls = ["fmc-svg", dimAtiva >= 0 ? "has-dim" : "", serieAtiva ? `serie-${serieAtiva}` : ""].filter(Boolean).join(" ");
  const anelLbl = (v: number) => { const a = (30 * Math.PI) / 180; return [CX + v * ESCALA * Math.cos(a) + 3, CY - v * ESCALA * Math.sin(a) + 4]; };

  return (
    <div className="fmc-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Scorecard de marca: seis dimensões</p>

        <div className="fmc-chartwrap">
          <svg className={svgCls} viewBox={`0 ${TOPO} ${W} ${H - TOPO}`} role="group" aria-label={`Radar de brand equity: ponto de partida ${fmt(INDICE_PARTIDA)} e meta em 12 meses ${fmt(META)}, em seis dimensões.`}>
            {ANEIS.map((v) => (
              <circle key={v} className="fmc-ring" cx={CX} cy={CY} r={v * ESCALA} fill="none" stroke="#d6d8e2" strokeWidth={1} />
            ))}
            {ANG.map((_, i) => {
              const [x, y] = ponto(i, 10);
              return <line key={i} className={`fmc-spoke${dimAtiva === i ? " is-on" : ""}`} x1={CX} y1={CY} x2={x} y2={y} stroke="#d6d8e2" strokeWidth={1} />;
            })}

            <polygon
              className="fmc-area fmc-area-meta" points={toPts(DIMS.map(() => META))}
              fill="rgba(83,97,196,0.18)" stroke="#0a1f8f" strokeWidth={2.5} strokeLinejoin="round"
              onPointerEnter={(e) => entra(e, () => setAtivo({ tipo: "serie", s: "meta" }))} onPointerLeave={sair}
              onPointerDown={(e) => toque(e, () => alternarSerie("meta"))}
            />
            <polygon
              className="fmc-area fmc-area-partida" points={toPts(DIMS.map((d) => d.nota))}
              fill="rgba(163,22,33,0.2)" stroke="#a31621" strokeWidth={2.5} strokeLinejoin="round"
              onPointerEnter={(e) => entra(e, () => setAtivo({ tipo: "serie", s: "partida" }))} onPointerLeave={sair}
              onPointerDown={(e) => toque(e, () => alternarSerie("partida"))}
            />

            {ANEIS.map((v) => {
              const [x, y] = anelLbl(v);
              return <text key={v} className="fmc-ringlbl" x={x} y={y} fontSize={10} fontWeight={600} fill="#9aa0bd" stroke="#ffffff" strokeWidth={3} paintOrder="stroke" aria-hidden="true">{v}</text>;
            })}

            {DIMS.map((d, i) => {
              const [hx, hy] = ponto(i, 10.6);
              const [mx, my] = ponto(i, META);
              const [px, py] = ponto(i, d.nota);
              const rot = ROTULOS[i];
              const t = tipDim(d);
              return (
                <g
                  key={d.nome} className={`fmc-axis${dimAtiva === i ? " is-on" : ""}`} tabIndex={0} role="button"
                  aria-label={`${t.title}. ${t.body}`}
                  onPointerEnter={(e) => entra(e, () => ligarDim(i, "grafico"))} onPointerLeave={sair}
                  onPointerDown={(e) => toque(e, () => alternarDim(i, "grafico"))}
                  onFocus={() => ligarDim(i, "grafico")} onBlur={limpar} onKeyDown={esc}
                >
                  <line className="fmc-hit" x1={CX} y1={CY} x2={hx} y2={hy} stroke="transparent" strokeWidth={30} pointerEvents="stroke" />
                  <circle className="fmc-pt fmc-pt-meta" cx={mx} cy={my} r={4} fill="#0a1f8f" stroke="#ffffff" strokeWidth={1.5} />
                  <circle className="fmc-pt fmc-pt-partida" cx={px} cy={py} r={4} fill="#a31621" stroke="#ffffff" strokeWidth={1.5} />
                  <text className="fmc-lbl" textAnchor={rot.anchor} fontSize={13} fontWeight={700} fill="#0b1a40">
                    {d.linhas.map((l, k) => <tspan key={l} x={rot.x} y={rot.y[k]}>{l}</tspan>)}
                  </text>
                </g>
              );
            })}
          </svg>

          {chartTip && (
            <div
              className={`fmc-tip ${chartTip.dir}`} role="tooltip"
              style={{ top: `${((chartTip.y - TOPO) / (H - TOPO)) * 100}%`, "--left": `${(chartTip.x / W) * 100}%` } as CSSProperties}
            >
              <span className="fmc-tip-tag">{chartTip.tag}</span>
              <strong className="fmc-tip-title">{chartTip.title}</strong>
              <span className="fmc-tip-body">{chartTip.body}</span>
            </div>
          )}
        </div>

        {/* Versão para telas pequenas: lista com mini-barras (o radar fica ilegível abaixo de 640px). */}
        <ul className="fmc-list">
          {DIMS.map((d, i) => (
            <li
              key={d.nome} className={dimAtiva === i ? "is-on" : ""} tabIndex={0}
              style={{ "--c": COR_CONF[d.confianca] } as CSSProperties}
              aria-label={`${d.nome}. Partida ${fmt(d.nota)}, meta ${fmt(META)}. ${d.leitura}`}
              onClick={() => alternarDim(i, "lista")}
              onKeyDown={(e) => { if (e.key === "Escape") limpar(); if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternarDim(i, "lista"); } }}
            >
              <p className="fmc-li-nome">{d.nome}</p>
              <div className="fmc-li-bar"><span className="fmc-li-lbl">Partida</span><span className="fmc-li-track"><i className="fmc-li-p" style={{ width: `${d.nota * 10}%` }} /></span><b className="fmc-li-v p">{fmt(d.nota)}</b></div>
              <div className="fmc-li-bar"><span className="fmc-li-lbl">Meta</span><span className="fmc-li-track"><i className="fmc-li-m" style={{ width: `${META * 10}%` }} /></span><b className="fmc-li-v m">{fmt(META)}</b></div>
              {dimAtiva === i && <p className="fmc-li-txt">{d.leitura}</p>}
            </li>
          ))}
        </ul>

        <div className="fmc-legend">
          {(["meta", "partida"] as Serie[]).map((s) => (
            <span
              key={s} className={`fmc-leg${serieAtiva === s ? " is-on" : ""}`} tabIndex={0} role="button"
              aria-label={`${TIP_SERIE[s].title}. ${TIP_SERIE[s].body}`}
              onPointerEnter={(e) => entra(e, () => setAtivo({ tipo: "serie", s }))} onPointerLeave={sair}
              onPointerDown={(e) => toque(e, () => alternarSerie(s))}
              onFocus={() => setAtivo({ tipo: "serie", s })} onBlur={limpar} onKeyDown={esc}
            >
              <i className={`fmc-leg-line ${s}`} aria-hidden="true" />
              {s === "meta" ? "Meta em 12 meses" : <>Ponto de partida <b className="fmc-tag">[ESTIMATIVA-MÉTODO]</b></>}
            </span>
          ))}
        </div>

        <p className="fmc-cap">
          Scorecard de marca (Aaker e Keller): índice composto de partida {fmt(INDICE_PARTIDA)}/10{" "}
          <span className="fmc-chip fmc-tag" tabIndex={0} data-tip="Estimativa feita por método próprio do plano, com dados públicos; precisa ser validada com medição real.">[ESTIMATIVA-MÉTODO]</span>;
          meta de 12 meses {fmt(META)}. Repetir em 90 dias com Maps, Instagram e 15 a 25 entrevistas. Não criar NPS nem equity score a partir de reviews.
        </p>

        <div className="fmc-tblwrap" ref={tbl.wrapRef}>
          <div className="fmc-tblbox">
            <table className={`fmc-tbl${dimAtiva >= 0 ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Dimensão</th><th scope="col">Proxy e evidência</th><th scope="col">Nota</th><th scope="col">Confiança</th></tr>
              </thead>
              <tbody>
                {DIMS.map((d, i) => {
                  const above = i >= DIMS.length - 2;
                  const c: TipContent = {
                    tag: `Nota ${fmt(d.nota)} · confiança ${d.confianca.toLowerCase()}`,
                    title: d.nome,
                    body: `Partida ${fmt(d.nota)} → meta ${fmt(META)} (+${fmt(META - d.nota)}). ${TIP_CONF[d.confianca]}`,
                  };
                  const on = (el: HTMLElement) => { ligarDim(i, "tabela"); tbl.show(el, above, c); };
                  return (
                    <tr
                      key={d.nome} className={dimAtiva === i ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": COR_CONF[d.confianca] } as CSSProperties}
                      aria-label={`${c.title}. ${c.body}`}
                      onPointerEnter={(e) => on(e.currentTarget)} onPointerLeave={sair}
                      onFocus={(e) => on(e.currentTarget)} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Dimensão" className="fmc-td-dim">{d.nome}</td>
                      <td data-label="Proxy e evidência">{d.proxy}</td>
                      <td data-label="Nota" className="fmc-td-nota">{fmt(d.nota)}</td>
                      <td data-label="Confiança"><span className={`fmc-conf ${d.confianca === "Baixa" ? "baixa" : "media"}`}>{d.confianca}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tbl.tip && (
            <div className={`fmc-tbltip${tbl.tip.above ? " above" : ""}`} style={{ top: tbl.tip.top }} role="tooltip">
              <span className="fmc-tip-tag">{tbl.tip.tag}</span>
              <strong className="fmc-tip-title">{tbl.tip.title}</strong>
              <span className="fmc-tip-body">{tbl.tip.body}</span>
            </div>
          )}
        </div>
      </figure>
    </div>
  );
}
