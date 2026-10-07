"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./planoDiretorFigura.css";

type TipContent = { tag: string; title: string; body: string };
/* Segmento: [dia inicial, dia final, cor, tom]. Tom 0 = fase de implantação; tom 1 ou 2 = escala e manutenção (cores mais claras). */
type Seg = [number, number, string, number];
type Pilar = { n: number; nome: string; segs: Seg[] };
type Horizonte = { ini: number; fim: number; dias: string; nome: string; foco: string; acoes: string; meta: string };

/* Início e fim de cada barra lidos no eixo do print (0 a 365 dias). */
const PILARES: Pilar[] = [
  { n: 1, nome: "Fundação de dados e captura", segs: [[0, 90, "#0b1a40", 0], [90, 240, "#5361c4", 1]] },
  { n: 2, nome: "Marca, identidade e linguagem", segs: [[0, 90, "#a31621", 0], [90, 240, "#d98088", 1], [240, 365, "#ecc4c8", 2]] },
  { n: 3, nome: "Maternidade e família (ICP-1)", segs: [[30, 120, "#a31621", 0], [120, 365, "#d98088", 1]] },
  { n: 4, nome: "Médicos parceiros (B2B2C)", segs: [[30, 120, "#0a1f8f", 0], [120, 365, "#5361c4", 1]] },
  { n: 5, nome: "Empresas e cooperativas", segs: [[90, 240, "#c0832a", 0], [240, 365, "#e3c174", 1]] },
  { n: 6, nome: "Conteúdo e produção audiovisual", segs: [[60, 240, "#2f7a4b", 0], [240, 365, "#8cc5a1", 1]] },
  { n: 7, nome: "Mídia paga e performance", segs: [[60, 120, "#7a7f99", 0], [120, 365, "#b8bacb", 1]] },
  { n: 8, nome: "Relacionamento, retenção e reputação", segs: [[60, 240, "#5361c4", 0], [240, 365, "#c4c7da", 1]] },
];

const HORIZONTES: Horizonte[] = [
  {
    ini: 0, fim: 90, dias: "Dias 1 a 90", nome: "Fundação", foco: "Medir, padronizar e montar o time",
    acoes: "Números e links por intenção; GA4/GTM; Perfil da Empresa; planilha-CRM; brand book v1 e glossário de voz; 15 entrevistas; oficinas do mapa de situação; contratação de coordenação, social media, design e filmmaker; páginas de convênios e pronto atendimento; reunião inicial com médicos; mídia só ao fim, com gates",
    meta: "≥90% dos contatos com origem; 1ª resposta ≤5 min; 100 gestantes com contato (acumulado); 10 médicos em reunião (acumulado)",
  },
  {
    ini: 90, fim: 120, dias: "Dias 91 a 120", nome: "Ativação", foco: "Ligar o que foi montado",
    acoes: "CRM piloto; WhatsApp triado com IA administrativa em piloto; aplicação da marca em site e uniformes; curso de gestantes (1ª turma); visita guiada; proposta a 5 empresas/cooperativas; vídeo curto de pré-natal; mídia local de teste (R$ 4 a 7 mil/mês)",
    meta: "Primeiros 38 atendimentos adicionais/mês; 3 propostas B2B; NPS baseline",
  },
  {
    ini: 120, fim: 240, dias: "Dias 121 a 240", nome: "Escala", foco: "Escalar canais com gates verdes",
    acoes: "Programa Médico Parceiro completo; portal “Para médicos”; Google Ads local e Meta Ads (R$ 10 mil/mês); série “médicos da região”; pacote ocupacional para a colheita; rádio/OOH regionais; eventos e palestras; lembrete 24 h e NPS; painéis Power BI; sinalização e enxoval",
    meta: "≈150 atendimentos adicionais/mês no mês 8; 3 turmas do curso; 5 empresas com contrato ou piloto; no-show em queda",
  },
  {
    ini: 240, fim: 365, dias: "Dias 241 a 365", nome: "Composição", foco: "Crescimento composto e previsível",
    acoes: "Loops de família e empresas em produção; indicação estruturada; IA em produção; previsão de no-show e demanda; brand book v2; pesquisa de marca (rodada 2); planejamento do ano 2 com margem por linha",
    meta: "≈230 atendimentos adicionais/mês no mês 12 (base); scorecard de marca ≥7,5; retorno em 90 dias medido",
  },
];

/* "Dia 90" e "Dia 120" ficam a 30 dias um do outro: um rótulo abre para a esquerda e o outro para a direita, como no print. */
const MARCOS: { dia: number; body: string; anchor: "start" | "middle" | "end"; dx: number }[] = [
  { dia: 90, anchor: "end", dx: 6, body: "Fecha a Fundação (dias 1 a 90) e abre a Ativação." },
  { dia: 120, anchor: "start", dx: -6, body: "Fecha a Ativação (dias 91 a 120) e abre a Escala." },
  { dia: 240, anchor: "middle", dx: 0, body: "Fecha a Escala (dias 121 a 240) e abre a Composição." },
  { dia: 365, anchor: "middle", dx: 0, body: "Fecha o primeiro ano e a Composição; abre o planejamento do ano 2." },
];

const fase = (tom: number) => (tom === 0 ? "fase de implantação" : "fase de escala e manutenção");
const sobrepoe = (s: Seg, h: Horizonte) => s[0] < h.fim && s[1] > h.ini;
const pilaresAtivos = (h: Horizonte) => PILARES.filter((p) => p.segs.some((s) => sobrepoe(s, h))).length;
const nomesHorizontes = (a: number, b: number) => HORIZONTES.filter((h) => a < h.fim && b > h.ini).map((h) => h.nome);
const juntar = (l: string[]) => (l.length <= 1 ? l.join("") : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`);

/* Destaques tipográficos do plano: /mês em azul e (acumulado) em cinza. */
function marcar(texto: string) {
  return texto.split(/(\/mês|\(acumulado\))/g).map((parte, i) => {
    if (parte === "/mês") return <b key={i} className="pdg-mes">/mês</b>;
    if (parte === "(acumulado)") return <b key={i} className="pdg-acum">(acumulado)</b>;
    return <Fragment key={i}>{parte}</Fragment>;
  });
}

/* Geometria do Gantt (viewBox 790 × 372). */
const W = 790, H = 372, X0 = 310, X1 = 750, DIAS = 365;
const TOP = 44, LINHA = 34, BARRA = 20;
const xd = (d: number) => X0 + (d / DIAS) * (X1 - X0);
const yRow = (i: number) => TOP + i * LINHA;
const EIXO_Y = TOP + PILARES.length * LINHA + 2;
const TICKS = [0, 50, 100, 150, 200, 250, 300, 350];

type Ativo =
  | { t: "seg"; p: number; s: number }
  | { t: "pil"; p: number }
  | { t: "hor"; h: number; origem: "grafico" | "tabela" }
  | null;

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

export default function PlanoDiretor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);
  const tbl = useTip();

  const limpar = () => { setAtivo(null); tbl.hide(); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };
  const entra = (e: PointerEvent, f: () => void) => { if (e.pointerType !== "touch") f(); };
  const toque = (e: PointerEvent, novo: NonNullable<Ativo>) => {
    if (e.pointerType !== "touch") return;
    setAtivo((a) => (JSON.stringify(a) === JSON.stringify(novo) ? null : novo));
  };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setAtivo(null); tbl.hide(); } };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pilAtivo = ativo?.t === "pil" || ativo?.t === "seg" ? ativo.p : -1;
  const horAtivo = ativo?.t === "hor" ? ativo.h : -1;

  /* Conteúdo dos tooltips do gráfico */
  const tipSeg = (p: Pilar, s: Seg): TipContent => ({
    tag: `Pilar ${p.n} · ${fase(s[3])}`,
    title: p.nome,
    body: `Do dia ${s[0]} ao dia ${s[1]} (${s[1] - s[0]} dias), cobrindo ${juntar(nomesHorizontes(s[0], s[1]))}.`,
  });
  const tipPil = (p: Pilar): TipContent => {
    const ini = p.segs[0][0], fim = p.segs[p.segs.length - 1][1], imp = p.segs[0];
    return {
      tag: `Pilar ${p.n} de 8`,
      title: p.nome,
      body: `Começa no dia ${ini} e vai até o dia ${fim}. A fase de implantação vai até o dia ${imp[1]}; depois, cores mais claras indicam escala e manutenção.`,
    };
  };
  const tipMarco = (m: (typeof MARCOS)[number]): TipContent => ({ tag: "Marco do plano", title: `Dia ${m.dia}`, body: m.body });
  const tipHor = (h: Horizonte): TipContent => ({
    tag: `${h.dias} · ${h.nome}`,
    title: h.foco,
    body: `${pilaresAtivos(h)} de 8 pilares em andamento neste horizonte. No gráfico, é a faixa do dia ${h.ini} ao dia ${h.fim}.`,
  });

  let chartTip: (TipContent & { x: number; y: number; dir: "up" | "down" }) | null = null;
  if (ativo?.t === "seg") {
    const p = PILARES[ativo.p], s = p.segs[ativo.s];
    const down = ativo.p < 2;
    chartTip = { ...tipSeg(p, s), x: (xd(s[0]) + xd(s[1])) / 2, y: down ? yRow(ativo.p) + BARRA + 4 : yRow(ativo.p) - 2, dir: down ? "down" : "up" };
  } else if (ativo?.t === "pil") {
    const p = PILARES[ativo.p];
    const down = ativo.p < 2;
    chartTip = { ...tipPil(p), x: xd(p.segs[0][0]) + 60, y: down ? yRow(ativo.p) + BARRA + 4 : yRow(ativo.p) - 2, dir: down ? "down" : "up" };
  } else if (ativo?.t === "hor" && ativo.origem === "grafico") {
    const m = MARCOS[ativo.h];
    chartTip = { ...tipMarco(m), x: xd(m.dia), y: 30, dir: "down" };
  }

  const svgCls = ["pdg-svg", pilAtivo >= 0 ? "has-pil" : "", horAtivo >= 0 ? "has-hor" : ""].filter(Boolean).join(" ");

  return (
    <div className="pdg-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Plano diretor: oito pilares em 365 dias</p>

        <div className="pdg-chartwrap">
          <svg className={svgCls} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Cronograma dos oito pilares do plano diretor ao longo de 365 dias, com marcos nos dias 90, 120, 240 e 365.">
            {/* Faixa do horizonte em destaque (ligada à tabela) */}
            {horAtivo >= 0 && (
              <rect
                className="pdg-band" x={xd(HORIZONTES[horAtivo].ini)} y={TOP - 8}
                width={xd(HORIZONTES[horAtivo].fim) - xd(HORIZONTES[horAtivo].ini)} height={PILARES.length * LINHA + 6}
                fill="rgba(163,22,33,0.07)"
              />
            )}

            {/* Eixo X */}
            <line x1={X0} y1={EIXO_Y} x2={X1} y2={EIXO_Y} stroke="#0b1a40" strokeWidth={1.2} />
            {TICKS.map((t) => (
              <g key={t} aria-hidden="true">
                <line x1={xd(t)} y1={EIXO_Y} x2={xd(t)} y2={EIXO_Y + 5} stroke="#0b1a40" strokeWidth={1} />
                <text className="pdg-tick" x={xd(t)} y={EIXO_Y + 19} textAnchor="middle" fontSize={11.5} fill="#1c2240">{t}</text>
              </g>
            ))}
            <text className="pdg-axis-title" x={(X0 + X1) / 2} y={EIXO_Y + 40} textAnchor="middle" fontSize={12.5} fill="#1c2240">dias a partir do início do plano</text>

            {/* Pilares */}
            {PILARES.map((p, i) => {
              const y = yRow(i);
              const t = tipPil(p);
              return (
                <g key={p.n} className={`pdg-row${pilAtivo === i ? " is-on" : ""}`}>
                  <text
                    className="pdg-lbl" x={X0 - 12} y={y + BARRA / 2 + 4} textAnchor="end" fontSize={12} fontWeight={700} fill="#0b1a40"
                    tabIndex={0} role="button" aria-label={`${t.title}. ${t.body}`}
                    onPointerEnter={(e) => entra(e, () => setAtivo({ t: "pil", p: i }))} onPointerLeave={sair}
                    onPointerDown={(e) => toque(e, { t: "pil", p: i })}
                    onFocus={() => setAtivo({ t: "pil", p: i })} onBlur={limpar} onKeyDown={esc}
                  >{p.n} {p.nome}</text>
                  {p.segs.map((s, k) => {
                    const ts = tipSeg(p, s);
                    const fora = horAtivo >= 0 && !sobrepoe(s, HORIZONTES[horAtivo]);
                    const on = ativo?.t === "seg" && ativo.p === i && ativo.s === k;
                    return (
                      <rect
                        key={k} className={`pdg-seg${on ? " is-on" : ""}${fora ? " is-out" : ""}`}
                        x={xd(s[0])} y={y} width={xd(s[1]) - xd(s[0])} height={BARRA} fill={s[2]}
                        tabIndex={0} role="button" aria-label={`${ts.title}, ${ts.tag}. ${ts.body}`}
                        onPointerEnter={(e) => entra(e, () => setAtivo({ t: "seg", p: i, s: k }))} onPointerLeave={sair}
                        onPointerDown={(e) => toque(e, { t: "seg", p: i, s: k })}
                        onFocus={() => setAtivo({ t: "seg", p: i, s: k })} onBlur={limpar} onKeyDown={esc}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Marcos: Dia 90, 120, 240 e 365 */}
            {MARCOS.map((m, i) => {
              const x = xd(m.dia);
              const t = tipMarco(m);
              return (
                <g
                  key={m.dia} className={`pdg-marco${horAtivo === i ? " is-on" : ""}`} tabIndex={0} role="button"
                  aria-label={`${t.title}. ${t.body}`}
                  onPointerEnter={(e) => entra(e, () => setAtivo({ t: "hor", h: i, origem: "grafico" }))} onPointerLeave={sair}
                  onPointerDown={(e) => toque(e, { t: "hor", h: i, origem: "grafico" })}
                  onFocus={() => setAtivo({ t: "hor", h: i, origem: "grafico" })} onBlur={limpar} onKeyDown={esc}
                >
                  <line className="pdg-marco-hit" x1={x} y1={14} x2={x} y2={EIXO_Y} stroke="transparent" strokeWidth={14} pointerEvents="stroke" />
                  <line className="pdg-marco-line" x1={x} y1={28} x2={x} y2={EIXO_Y} stroke="#a31621" strokeWidth={1.6} strokeDasharray="5 4" />
                  <text className="pdg-marco-lbl" x={x + m.dx} y={22} textAnchor={m.anchor} fontSize={12} fontWeight={700} fill="#a31621" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">Dia {m.dia}</text>
                </g>
              );
            })}
          </svg>

          {chartTip && (
            <div
              className={`pdg-tip ${chartTip.dir}`} role="tooltip"
              style={{ top: `${(chartTip.y / H) * 100}%`, "--left": `${(chartTip.x / W) * 100}%` } as CSSProperties}
            >
              <span className="pdg-tip-tag">{chartTip.tag}</span>
              <strong className="pdg-tip-title">{chartTip.title}</strong>
              <span className="pdg-tip-body">{chartTip.body}</span>
            </div>
          )}
        </div>

        {/* Celular: lista com mini-barras (o Gantt fica ilegível abaixo de 640px) */}
        <div className="pdg-list">
          <div className="pdg-li-scale" aria-hidden="true">
            {([[0, "0", "none"], [90, "Dia 90", "translateX(calc(-100% - 3px))"], [120, "Dia 120", "translateX(3px)"], [240, "Dia 240", "translateX(-50%)"], [365, "Dia 365", "translateX(-100%)"]] as const).map(([d, txt, tr]) => (
              <span key={d} style={{ left: `${(d / DIAS) * 100}%`, transform: tr }}>{txt}</span>
            ))}
          </div>
          <ul>
            {PILARES.map((p, i) => {
              const on = pilAtivo === i;
              return (
                <li
                  key={p.n} className={on ? "is-on" : ""} tabIndex={0}
                  aria-label={`${p.nome}. ${tipPil(p).body}`}
                  onClick={() => setAtivo((a) => (a?.t === "pil" && a.p === i ? null : { t: "pil", p: i }))}
                  onKeyDown={(e) => { if (e.key === "Escape") limpar(); if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAtivo((a) => (a?.t === "pil" && a.p === i ? null : { t: "pil", p: i })); } }}
                >
                  <p className="pdg-li-nome">{p.n} {p.nome}</p>
                  <div className="pdg-li-track">
                    {[90, 120, 240].map((d) => <i key={d} className="pdg-li-mark" style={{ left: `${(d / DIAS) * 100}%` }} />)}
                    {p.segs.map((s, k) => (
                      <span key={k} className="pdg-li-seg" style={{ left: `${(s[0] / DIAS) * 100}%`, width: `${((s[1] - s[0]) / DIAS) * 100}%`, background: s[2] }} />
                    ))}
                  </div>
                  {on && <p className="pdg-li-txt">{tipPil(p).body}</p>}
                </li>
              );
            })}
          </ul>
        </div>

        <figcaption>Oito pilares do plano diretor ao longo de 365 dias. Cores mais claras indicam fase de escala e manutenção.</figcaption>

        {/* Tabela de horizontes, ligada às faixas do gráfico */}
        <div className="pdg-tblwrap" ref={tbl.wrapRef}>
          <div className="pdg-tblbox">
            <table className={`pdg-tbl${horAtivo >= 0 ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Horizonte</th><th scope="col">Foco</th><th scope="col">Ações-chave por pilar</th><th scope="col">Meta (por mês, salvo indicação)</th></tr>
              </thead>
              <tbody>
                {HORIZONTES.map((h, i) => {
                  const c = tipHor(h);
                  const on = (el: HTMLElement) => { setAtivo({ t: "hor", h: i, origem: "tabela" }); tbl.show(el, i >= HORIZONTES.length - 2, c); };
                  return (
                    <tr
                      key={h.nome} className={horAtivo === i ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": "#a31621" } as CSSProperties}
                      aria-label={`${h.dias}, ${h.nome}. ${c.title}. ${c.body}`}
                      onPointerEnter={(e) => on(e.currentTarget)} onPointerLeave={sair}
                      onFocus={(e) => on(e.currentTarget)} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Horizonte" className="pdg-td-first">{h.dias}<br />{h.nome}</td>
                      <td data-label="Foco">{h.foco}</td>
                      <td data-label="Ações-chave por pilar">{marcar(h.acoes)}</td>
                      <td data-label="Meta (por mês, salvo indicação)" className="pdg-td-meta">{marcar(h.meta)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tbl.tip && (
            <div className={`pdg-tbltip${tbl.tip.above ? " above" : ""}`} style={{ top: tbl.tip.top }} role="tooltip">
              <span className="pdg-tip-tag">{tbl.tip.tag}</span>
              <strong className="pdg-tip-title">{tbl.tip.title}</strong>
              <span className="pdg-tip-body">{tbl.tip.body}</span>
            </div>
          )}
        </div>
      </figure>
    </div>
  );
}
