"use client";

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./equipeMarketingFigura.css";

type TipContent = { tag: string; title: string; body: string };
const brl = (n: number) => `R$ ${n.toLocaleString("pt-BR")}`;
const FATOR = 1.7; /* custo total do empregador ≈ 1,7 × salário (premissa do plano) */

/* ---------- Tabela de cargos ---------- */
type Cargo = { cargo: string; missao: string; min: number; max: number; retainer?: boolean; inicio: number; cor: string };
const CARGOS: Cargo[] = [
  { cargo: "Coordenador(a) de Marketing e Inteligência", missao: "Estratégia, OKRs, orçamento, relação com médicos e empresas, governança de marca, liderança do time e do processo seletivo", min: 9500, max: 10000, inicio: 2, cor: "#a31621" },
  { cargo: "Social media e community manager", missao: "Calendário editorial, publicação, comunidade, reputação, atendimento em redes, relatórios", min: 2800, max: 4200, inicio: 3, cor: "#0a1f8f" },
  { cargo: "Designer gráfico (1)", missao: "Brand book, peças, sinalização, materiais impressos e digitais, templates", min: 3200, max: 4800, inicio: 3, cor: "#0a1f8f" },
  { cargo: "Filmmaker", missao: "Captação de vídeo e foto, cobertura de eventos, institucional, depoimentos autorizados (TCLE)", min: 3500, max: 5500, inicio: 4, cor: "#5361c4" },
  { cargo: "Editor(a) de vídeo", missao: "Edição, motion, cortes para redes, legendas, acervo", min: 3000, max: 4800, inicio: 4, cor: "#5361c4" },
  { cargo: "Analista de dados e CRM", missao: "Modelagem de dados, indicadores, painéis, ritos semanais, qualidade do CRM, interface com o programador", min: 4500, max: 7000, inicio: 5, cor: "#2f7a4b" },
  { cargo: "Designer gráfico (2) [gate]", missao: "Reforço de produção quando o gate de volume for atingido", min: 3200, max: 4800, inicio: 8, cor: "#0a1f8f" },
  { cargo: "Programador fullstack (externo, PJ)", missao: "CRM, banco de dados, API, dashboards, integrações de IA e segurança; documentação e transferência", min: 9000, max: 16000, retainer: true, inicio: 1, cor: "#c0832a" },
];

/* ---------- Organograma ---------- */
type Caixa = { id: string; linhas: string[]; rows: number[]; body: string };
type Ramo = { titulo: string; cor: string; caixas: Caixa[] };
const RAMOS: Ramo[] = [
  {
    titulo: "Conteúdo e marca", cor: "#0a1f8f",
    caixas: [
      { id: "social", linhas: ["Social media e", "community manager"], rows: [1], body: "Cuida do calendário editorial, das publicações e da reputação nas redes." },
      { id: "design", linhas: ["Designer gráfico (1)", "+ Designer (2) [gate]"], rows: [2, 6], body: "O segundo designer só entra quando o gate de volume for atingido." },
    ],
  },
  {
    titulo: "Audiovisual", cor: "#5361c4",
    caixas: [
      { id: "film", linhas: ["Filmmaker"], rows: [3], body: "Capta vídeo e foto, cobre eventos e grava depoimentos autorizados (TCLE)." },
      { id: "editor", linhas: ["Editor(a) de vídeo"], rows: [4], body: "Edita, faz motion, cortes para redes e legendas, e organiza o acervo." },
    ],
  },
  {
    titulo: "Dados e CRM", cor: "#2f7a4b",
    caixas: [
      { id: "analista", linhas: ["Analista de dados", "e CRM"], rows: [5], body: "Cuida dos indicadores, dos painéis e da qualidade do CRM." },
      { id: "campeoes", linhas: ["Atendimento e recepção", "(campeões internos)"], rows: [], body: "Pessoas do atendimento que já trabalham no hospital e puxam o uso do CRM no dia a dia; não é contratação nova." },
    ],
  },
  {
    titulo: "Sistemas (externo)", cor: "#c0832a",
    caixas: [
      { id: "prog", linhas: ["Programador fullstack", "(contrato PJ)"], rows: [7], body: "Único profissional externo da estrutura, contratado como PJ." },
      { id: "stack", linhas: ["CRM, API, BI e", "integrações de IA"], rows: [7], body: "Frentes técnicas sob responsabilidade do programador, com documentação e transferência ao hospital." },
    ],
  },
];
const TOPO = {
  diretoria: { linhas: ["Diretoria-sócia", "(patrocinador do plano)"], body: "Patrocina o plano e aprova as contratações escalonadas, com gates." },
  coord: { linhas: ["Coordenação de Marketing", "e Inteligência"], rows: [0], body: "Lidera os quatro núcleos e responde à diretoria." },
};

/* Totais da equipe interna (sem o PJ) */
const INTERNOS = CARGOS.filter((c) => !c.retainer);
const TOT_MIN = INTERNOS.reduce((s, c) => s + c.min, 0);
const TOT_MAX = INTERNOS.reduce((s, c) => s + c.max, 0);

/* Faixa exatamente como aparece na tabela (ex.: "R$ 9.500 a 10.000") */
const faixa = (c: Cargo) => `${brl(c.min)} a ${c.max.toLocaleString("pt-BR")}`;
const faixaTxt = (c: Cargo) => (c.retainer ? `Retainer: ${faixa(c)}/mês (contrato PJ).` : `Faixa salarial: ${faixa(c)}/mês.`);

function tipCargo(i: number): TipContent {
  const c = CARGOS[i];
  return {
    tag: `Início no mês ${c.inicio} · ${c.retainer ? "contrato PJ" : "CLT"}`,
    title: c.cargo,
    body: `${faixaTxt(c)} Início no mês ${c.inicio}.`,
  };
}
/* Texto salarial de uma caixa do organograma (uma ou mais linhas da tabela) */
function salarioCaixa(rows: number[]) {
  if (!rows.length) return "";
  if (rows.length === 1) return faixaTxt(CARGOS[rows[0]]);
  return rows.map((x) => `${CARGOS[x].cargo}: ${faixa(CARGOS[x])}/mês, a partir do mês ${CARGOS[x].inicio}`).join("; ") + ".";
}

type Ativo = { t: "row"; i: number } | { t: "caixa"; r: number; c: number } | { t: "ramo"; r: number } | { t: "topo"; k: "diretoria" | "coord" } | null;

export default function EquipeMarketing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  type Seta = { x1: number; y1: number; x2: number; y2: number; cor: string };
  const [conn, setConn] = useState<{ w: number; h: number; setas: Seta[] } | null>(null);

  /* Mede a posição real da coordenação e dos títulos dos núcleos para as setas saírem e chegarem no centro certo */
  useEffect(() => {
    const medir = () => {
      const o = orgRef.current, c = coordRef.current;
      if (!o || !c) return;
      const or = o.getBoundingClientRect(), cr = c.getBoundingClientRect();
      const x1 = cr.left + cr.width / 2 - or.left, y1 = cr.bottom - or.top + 2;
      const setas: Seta[] = [];
      titleRefs.current.forEach((t, i) => {
        if (!t) return;
        const tr = t.getBoundingClientRect();
        setas.push({ x1, y1, x2: tr.left + tr.width / 2 - or.left, y2: tr.top - or.top - 2, cor: RAMOS[i].cor });
      });
      setConn({ w: or.width, h: or.height, setas });
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (orgRef.current) ro.observe(orgRef.current);
    window.addEventListener("resize", medir);
    return () => { ro.disconnect(); window.removeEventListener("resize", medir); };
  }, []);
  const tblRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; left: number; above: boolean; onde: "org" | "tbl" }) | null>(null);

  const limpar = () => { setAtivo(null); setTip(null); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setAtivo(null); setTip(null); } };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, []);

  const ligar = (el: Element, novo: NonNullable<Ativo>, c: TipContent) => {
    const onde = novo.t === "row" ? "tbl" : "org";
    const w = (onde === "tbl" ? tblRef : orgRef).current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const above = onde === "tbl" ? (novo as { i: number }).i >= CARGOS.length - 3 : r.top - wr.top > 140;
    setAtivo(novo);
    setTip({ ...c, onde, above, top: above ? r.top - wr.top : r.bottom - wr.top, left: r.left + r.width / 2 - wr.left });
  };
  const props = (novo: NonNullable<Ativo>, c: TipContent) => ({
    tabIndex: 0,
    "aria-label": `${c.title}. ${c.body}`,
    onPointerEnter: (e: PointerEvent<Element>) => { if (e.pointerType !== "touch") ligar(e.currentTarget, novo, c); },
    onPointerDown: (e: PointerEvent<Element>) => { if (e.pointerType === "touch") { if (JSON.stringify(ativo) === JSON.stringify(novo)) limpar(); else ligar(e.currentTarget, novo, c); } },
    onPointerLeave: sair,
    onFocus: (e: FocusEvent<Element>) => { if (e.target === e.currentTarget) ligar(e.currentTarget, novo, c); },
    onBlur: limpar,
    onKeyDown: esc,
  });

  /* Linhas da tabela ligadas ao que está ativo, e caixas ligadas à linha ativa */
  const rowsOn = new Set<number>();
  if (ativo?.t === "row") rowsOn.add(ativo.i);
  if (ativo?.t === "caixa") RAMOS[ativo.r].caixas[ativo.c].rows.forEach((x) => rowsOn.add(x));
  if (ativo?.t === "ramo") RAMOS[ativo.r].caixas.forEach((cx) => cx.rows.forEach((x) => rowsOn.add(x)));
  if (ativo?.t === "topo" && ativo.k === "coord") rowsOn.add(0);
  const caixaOn = (r: number, c: number) =>
    (ativo?.t === "caixa" && ativo.r === r && ativo.c === c) ||
    (ativo?.t === "ramo" && ativo.r === r) ||
    (ativo?.t === "row" && RAMOS[r].caixas[c].rows.includes(ativo.i));
  const ramoOn = (r: number) => RAMOS[r].caixas.some((_, c) => caixaOn(r, c));
  const coordOn = (ativo?.t === "topo" && ativo.k === "coord") || (ativo?.t === "row" && ativo.i === 0);
  const dirOn = ativo?.t === "topo" && ativo.k === "diretoria";

  const TipBox = ({ onde, classe }: { onde: "org" | "tbl"; classe: string }) =>
    tip && tip.onde === onde ? (
      <div className={`${classe}${tip.above ? " above" : ""}`} role="tooltip" style={{ top: tip.top, "--left": `${tip.left}px` } as CSSProperties}>
        <span className="eqm-tip-tag">{tip.tag}</span>
        <strong className="eqm-tip-title">{tip.title}</strong>
        <span className="eqm-tip-body">{tip.body}</span>
      </div>
    ) : null;

  return (
    <div className="eqm-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Estrutura da equipe de marketing e inteligência</p>

        {/* ---------- Organograma ---------- */}
        <div className={`eqm-org${ativo ? " has-active" : ""}`} ref={orgRef}>
          {conn && (
            <svg className="eqm-conn" width={conn.w} height={conn.h} viewBox={`0 0 ${conn.w} ${conn.h}`} aria-hidden="true">
              <defs>
                {RAMOS.map((r, i) => (
                  <marker key={r.titulo} id={`eqm-ah-${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M0,0 L10,5 L0,10 z" fill={r.cor} />
                  </marker>
                ))}
              </defs>
              {conn.setas.map((l, i) => (
                <line
                  key={i} className={ramoOn(i) ? "is-on" : ""}
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke={l.cor} strokeWidth={2} markerEnd={`url(#eqm-ah-${i})`}
                />
              ))}
            </svg>
          )}
          <div
            className={`eqm-node eqm-dir${dirOn ? " is-on" : ""}`} role="button"
            {...props({ t: "topo", k: "diretoria" }, { tag: "Topo da estrutura", title: "Diretoria-sócia", body: TOPO.diretoria.body })}
          >{TOPO.diretoria.linhas.map((l) => <span key={l}>{l}</span>)}</div>
          <div className="eqm-down" aria-hidden="true" />
          <div
            ref={coordRef}
            className={`eqm-node eqm-coord${coordOn ? " is-on" : ""}`} role="button"
            {...props({ t: "topo", k: "coord" }, { tag: `Responde à diretoria · início no mês ${CARGOS[0].inicio}`, title: "Coordenação de Marketing e Inteligência", body: `${TOPO.coord.body} ${faixaTxt(CARGOS[0])}` })}
          >{TOPO.coord.linhas.map((l) => <span key={l}>{l}</span>)}</div>

          {/* Espaço das setas (desenhadas pela camada .eqm-conn, com posições medidas) */}
          <div className="eqm-gap" aria-hidden="true" />

          <div className="eqm-cols">
            {RAMOS.map((ramo, r) => (
              <div key={ramo.titulo} className={`eqm-col${ramoOn(r) ? " is-on" : ""}`} style={{ "--c": ramo.cor } as CSSProperties}>
                <p
                  ref={(el) => { titleRefs.current[r] = el; }}
                  className="eqm-col-title" role="button"
                  {...props({ t: "ramo", r }, {
                    tag: "Núcleo da equipe",
                    title: ramo.titulo,
                    body: ramo.caixas.map((c) => c.linhas.join(" ")).join("; ") + ".",
                  })}
                >{ramo.titulo}</p>
                {ramo.caixas.map((cx, c) => {
                  const nome = cx.linhas.join(" ");
                  return (
                    <div
                      key={cx.id} className={`eqm-node eqm-box${caixaOn(r, c) ? " is-on" : ""}`} role="button"
                      {...props({ t: "caixa", r, c }, {
                        tag: cx.rows.length ? `${ramo.titulo} · início no mês ${cx.rows.map((x) => CARGOS[x].inicio).join(" e ")}` : `${ramo.titulo} · equipe atual`,
                        title: nome,
                        body: cx.id === "stack" ? cx.body : `${cx.body} ${salarioCaixa(cx.rows)}`.trim(),
                      })}
                    >{cx.linhas.map((l) => <span key={l}>{l}</span>)}</div>
                  );
                })}
              </div>
            ))}
          </div>
          <TipBox onde="org" classe="eqm-tip" />
        </div>

        <p className="eqm-cap">Estrutura-alvo da equipe de marketing e inteligência.</p>

        {/* ---------- Tabela de cargos ---------- */}
        <div className="eqm-tblwrap" ref={tblRef}>
          <div className="eqm-tblbox">
            <table className={`eqm-tbl${rowsOn.size ? " has-active" : ""}`}>
              <thead>
                <tr>
                  <th scope="col">Cargo</th>
                  <th scope="col">Missão e entregas</th>
                  <th scope="col">Faixa salarial <b className="eqm-mes">/mês</b> <b className="eqm-tag">[PREMISSA]</b></th>
                  <th scope="col">Início</th>
                </tr>
              </thead>
              <tbody>
                {CARGOS.map((c, i) => {
                  const t = tipCargo(i);
                  return (
                    <tr
                      key={c.cargo} className={rowsOn.has(i) ? "is-active" : ""} style={{ "--c": c.cor } as CSSProperties}
                      {...props({ t: "row", i }, t)}
                      aria-label={`${c.cargo}. ${c.missao}. Faixa: ${brl(c.min)} a ${brl(c.max)}${c.retainer ? " de retainer" : ""}. Início no mês ${c.inicio}.`}
                    >
                      <td data-label="Cargo" className="eqm-td-first">{c.cargo}</td>
                      <td data-label="Missão e entregas">{c.missao}</td>
                      <td data-label="Faixa salarial /mês" className="eqm-td-faixa">{brl(c.min)} a {c.max.toLocaleString("pt-BR")}{c.retainer ? " de retainer" : ""}</td>
                      <td data-label="Início" className="eqm-td-ini">Mês {c.inicio}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TipBox onde="tbl" classe="eqm-tbltip" />
        </div>

        <p className="eqm-cap">
          Custo total do empregador estimado em 1,7 vez o salário (encargos, benefícios e provisões){" "}
          <span
            className="eqm-chip eqm-tag" tabIndex={0}
            data-tip={`Valor adotado pelo plano. Com ele, a equipe interna (7 cargos) custaria de ${brl(Math.round(TOT_MIN * FATOR))} a ${brl(Math.round(TOT_MAX * FATOR))}/mês quando completa.`}
          >[PREMISSA]</span>; valores a validar com o RH e o mercado local.
        </p>
      </figure>
    </div>
  );
}

