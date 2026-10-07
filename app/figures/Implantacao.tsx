"use client";

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./implantacaoFigura.css";

type TipContent = { tag: string; title: string; body: string };
const fmt1 = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* ---------- Cronograma (início e fim lidos no eixo do print) ---------- */
const FRENTES = [
  { nome: "Mapa de situação e oficinas", ini: 0, fim: 45, cor: "#0b1a40" },
  { nome: "Seleção de ferramentas e prova de conceito", ini: 30, fim: 90, cor: "#0b1a40" },
  { nome: "Governança: DPO, RIPD, contratos", ini: 0, fim: 90, cor: "#a31621" },
  { nome: "Banco de dados e API (núcleo)", ini: 45, fim: 150, cor: "#0a1f8f" },
  { nome: "CRM piloto e jornadas", ini: 75, fim: 150, cor: "#0a1f8f" },
  { nome: "WhatsApp Platform + IA (piloto)", ini: 100, fim: 180, cor: "#5361c4" },
  { nome: "Microsoft 365: Teams, SharePoint, Planner", ini: 60, fim: 150, cor: "#5361c4" },
  { nome: "Integração com HIS/agenda", ini: 120, fim: 240, cor: "#2f7a4b" },
  { nome: "Power BI: painéis em 3 camadas", ini: 90, fim: 240, cor: "#2f7a4b" },
  { nome: "IA em produção + automações", ini: 180, fim: 300, cor: "#c0832a" },
  { nome: "Otimização, previsão e auditoria externa", ini: 270, fim: 365, cor: "#c0832a" },
];

/* ---------- Fases (tabela) ---------- */
const FASES = [
  {
    ini: 0, fim: 90, dias: "Dias 1–90", nome: "Fundação e escolha",
    entregas: "Oficinas: (1) mapa de situação, (2) jornadas e indicadores, (3) dados, sistemas e LGPD, (4) seleção de ferramentas; DPO nomeado; RIPD v1; prova de conceito de 2 CRMs e 2 BSPs; contrato do programador; banco de dados e API (núcleo) iniciados; Microsoft 365 configurado; planilha-CRM no ar",
    reunioes: "Comitê quinzenal; decisão de ferramentas até o dia 60; contratos de operador até o dia 75",
    saida: "Ferramentas contratadas; ≥90% dos contatos com origem; núcleo de dados em homologação",
  },
  {
    ini: 90, fim: 120, dias: "Dias 91–120", nome: "Integração",
    entregas: "CRM piloto com jornadas; WhatsApp Platform + assistente de IA em piloto (FAQ administrativa); eventos do site no banco; intranet com 2 setores; primeiros painéis Power BI",
    reunioes: "Revisão de gates (semana 12-16); treinamento por setor",
    saida: "Piloto com 1ª resposta ≤5 min e handoff funcionando; sem incidente de dados",
  },
  {
    ini: 120, fim: 240, dias: "Dias 121–240", nome: "Escala",
    entregas: "Integração com HIS/agenda; painéis em 3 camadas; lembrete 24 h e NPS automáticos; intranet em todos os setores; Planner ligado ao CRM; IA em produção para FAQ e agendamento administrativo",
    reunioes: "Oficina de indicadores 2; revisão trimestral de OKRs",
    saida: "Painel da diretoria em uso semanal; no-show em queda; adoção ≥80%",
  },
  {
    ini: 240, fim: 365, dias: "Dias 241–365", nome: "Otimização",
    entregas: "Previsão de no-show e demanda com dados agregados; automações por jornada; auditoria externa de segurança; documentação completa; transferência de conhecimento; plano do ano 2",
    reunioes: "Revisão anual; decisão sobre módulos próprios de CRM",
    saida: "Maturidade 4; auditoria concluída; documentação e repositório sob guarda do hospital",
  },
];
const MARCOS = [
  { dia: 90, anchor: "end" as const, dx: 6, body: "Fecha a fase Fundação e escolha e abre a Integração." },
  { dia: 120, anchor: "start" as const, dx: -6, body: "Fecha a Integração e abre a Escala." },
  { dia: 240, anchor: "middle" as const, dx: 0, body: "Fecha a Escala e abre a Otimização." },
  { dia: 365, anchor: "middle" as const, dx: 0, body: "Fecha o primeiro ano: maturidade-alvo, auditoria e plano do ano 2." },
];

/* ---------- Trilha de maturidade (0 a 5) ---------- */
const MAT_COLS = ["Dia 90", "Dia 240", "Dia 365"];
const MAT_COL_MARCO = [0, 2, 3]; /* coluna → índice do marco/fase que termina nele */
const MATURIDADE: { nome: string; v: number[] }[] = [
  { nome: "Dados e analytics", v: [2, 3, 4] },
  { nome: "CRM e relacionamento", v: [2, 3, 4] },
  { nome: "Automação", v: [1, 2, 3] },
  { nome: "Conteúdo", v: [2, 3, 4] },
  { nome: "Gestão de equipe e projetos", v: [2, 3, 4] },
  { nome: "IA aplicada", v: [1, 2, 3] },
  { nome: "Segurança e LGPD", v: [2, 3, 4] },
];
const NIVEL_COR: Record<number, [string, string]> = { 1: ["#c4c7da", "#0b1a40"], 2: ["#5361c4", "#0b1a40"], 3: ["#0a1f8f", "#ffffff"], 4: ["#0b1a40", "#ffffff"] };
const mediaCol = (c: number) => MATURIDADE.reduce((s, m) => s + m.v[c], 0) / MATURIDADE.length;

/* ---------- Critérios de seleção (tabela única) ---------- */
const CRITERIOS = [
  { nome: "Conformidade LGPD (contrato de operador, hospedagem, logs)", peso: 25, como: "Questionário e contrato" },
  { nome: "API aberta e integração com WhatsApp, banco e BI", peso: 20, como: "Prova de conceito" },
  { nome: "Custo total em 12 meses", peso: 15, como: "Cotação por escopo" },
  { nome: "Suporte local e facilidade de uso pela equipe", peso: 15, como: "Teste com recepção" },
  { nome: "Escalabilidade e roadmap do fornecedor", peso: 15, como: "Referências" },
  { nome: "Portabilidade dos dados (exportação, propriedade)", peso: 10, como: "Cláusula contratual" },
];
const SOMA_PESOS = CRITERIOS.reduce((s, c) => s + c.peso, 0); /* = 100 */

/* ---------- Ligações ---------- */
const sobrepoe = (a: { ini: number; fim: number }, b: { ini: number; fim: number }) => a.ini < b.fim && a.fim > b.ini;
function relacionados(key: string): Set<string> {
  const s = new Set<string>([key]);
  const [t, a, b] = key.split(":");
  const i = Number(a);
  const addFase = (j: number) => {
    s.add(`fase:${j}`); s.add(`marco:${j}`);
    FRENTES.forEach((f, k) => { if (sobrepoe(f, FASES[j])) s.add(`bar:${k}`); });
    const c = MAT_COL_MARCO.indexOf(j); if (c >= 0) s.add(`matcol:${c}`);
  };
  if (t === "bar") {
    FASES.forEach((f, j) => { if (sobrepoe(FRENTES[i], f)) s.add(`fase:${j}`); });
    if (i === 1) CRITERIOS.forEach((_, k) => s.add(`crit:${k}`));
  }
  if (t === "fase" || t === "marco") addFase(i);
  if (t === "matcol" || t === "mat") {
    const c = t === "mat" ? Number(b) : i;
    s.add(`matcol:${c}`); s.add(`fase:${MAT_COL_MARCO[c]}`); s.add(`marco:${MAT_COL_MARCO[c]}`);
    if (t === "mat") s.add(`matrow:${i}`);
  }
  if (t === "crit") s.add("bar:1");
  return s;
}
const faseBanda = (rel: Set<string> | null) => {
  if (!rel) return -1;
  for (let j = 0; j < FASES.length; j++) if (rel.has(`fase:${j}`) && (rel.has(`marco:${j}`))) return j;
  return -1;
};

/* ---------- Tooltips ---------- */
function tipDe(key: string): TipContent {
  const [t, a, b] = key.split(":"); const i = Number(a);
  if (t === "bar") {
    const f = FRENTES[i];
    const fases = FASES.filter((x) => sobrepoe(f, x)).map((x) => x.nome);
    return { tag: `Frente de implantação · dias ${f.ini} a ${f.fim}`, title: f.nome, body: `${f.fim - f.ini} dias, cobrindo ${fases.length > 1 ? `${fases.slice(0, -1).join(", ")} e ${fases[fases.length - 1]}` : fases[0]}.${i === 1 ? " Usa os critérios de seleção da tabela abaixo." : ""}` };
  }
  if (t === "fase") {
    const f = FASES[i];
    const n = FRENTES.filter((x) => sobrepoe(x, f)).length;
    return { tag: `Fase · ${f.dias.toLowerCase()}`, title: f.nome, body: `${n} das 11 frentes do cronograma estão ativas nesta fase.` };
  }
  if (t === "marco") return { tag: "Marco do plano", title: `Dia ${MARCOS[i].dia}`, body: MARCOS[i].body };
  if (t === "matcol") return { tag: "Marco de maturidade", title: MAT_COLS[i], body: `Média dos 7 níveis-alvo: ${fmt1(mediaCol(i))} de 5.` };
  if (t === "mat") {
    const c = Number(b), m = MATURIDADE[i], v = m.v[c];
    return {
      tag: "Trilha de maturidade · nível-alvo (0 a 5)",
      title: `${m.nome} no ${MAT_COLS[c]}: nível ${v}`,
      body: c === 0 ? "Primeiro nível-alvo da trilha." : `Sobe de ${m.v[c - 1]} para ${v} desde o ${MAT_COLS[c - 1]}.`,
    };
  }
  const c = CRITERIOS[i];
  return { tag: `Critério · peso ${c.peso}%`, title: c.nome, body: `Como verificar: ${c.como.toLowerCase()}. Usado na seleção de ferramentas (dias 30 a 90 do cronograma).` };
}

/* ---------- Geometria do cronograma (viewBox 790 × 400) ---------- */
const W = 790, H = 400, X0 = 300, X1 = 760, DIAS = 365, TOP = 40, LIN = 28, BAR = 16;
const xd = (d: number) => X0 + (d / DIAS) * (X1 - X0);
const yRow = (i: number) => TOP + i * LIN;
const EIXO = TOP + FRENTES.length * LIN + 2;

export default function Implantacao() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const faseRef = useRef<HTMLDivElement>(null);
  const matRef = useRef<HTMLDivElement>(null);
  const critRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<string | null>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; left: number; above: boolean; onde: string }) | null>(null);

  const limpar = () => { setAtivo(null); setTip(null); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setAtivo(null); setTip(null); } };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, []);

  const ligar = (el: Element, key: string) => {
    const t = key.split(":")[0];
    const onde = t === "fase" ? "fase" : t === "crit" ? "crit" : t === "mat" || t === "matcol" ? "mat" : "gantt";
    const ref = { gantt: ganttRef, fase: faseRef, mat: matRef, crit: critRef }[onde];
    const w = ref.current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const idx = Number(key.split(":")[1]);
    const above = onde === "fase" ? idx >= 2 : onde === "crit" ? idx >= 4 : r.top - wr.top > 170;
    setAtivo(key);
    setTip({ ...tipDe(key), onde, above, top: above ? r.top - wr.top : r.bottom - wr.top, left: r.left + r.width / 2 - wr.left });
  };
  const props = (key: string, role = "button") => {
    const tc = tipDe(key);
    return {
      tabIndex: 0,
      role,
      "aria-label": `${tc.title}. ${tc.body}`,
      onPointerEnter: (e: PointerEvent<Element>) => { if (e.pointerType !== "touch") ligar(e.currentTarget, key); },
      onPointerDown: (e: PointerEvent<Element>) => { if (e.pointerType === "touch") { if (ativo === key) limpar(); else ligar(e.currentTarget, key); } },
      onPointerLeave: sair,
      onFocus: (e: FocusEvent<Element>) => { if (e.target === e.currentTarget) ligar(e.currentTarget, key); },
      onBlur: limpar,
      onKeyDown: esc,
    };
  };

  const rel = ativo ? relacionados(ativo) : null;
  const on = (k: string) => rel?.has(k) ?? false;
  const banda = faseBanda(rel);
  const temBar = rel ? FRENTES.some((_, i) => rel.has(`bar:${i}`)) : false;

  const Tip = ({ onde, classe }: { onde: string; classe: string }) =>
    tip && tip.onde === onde ? (
      <div className={`${classe}${tip.above ? " above" : ""}`} role="tooltip" style={{ top: tip.top, "--left": `${tip.left}px` } as CSSProperties}>
        <span className="imp-tip-tag">{tip.tag}</span>
        <strong className="imp-tip-title">{tip.title}</strong>
        <span className="imp-tip-body">{tip.body}</span>
      </div>
    ) : null;

  return (
    <div className="imp-root" ref={rootRef}>
      {/* ================= Cronograma + fases ================= */}
      <figure className="fig">
        <p className="fig-heading">Cronograma de implantação do ecossistema</p>

        <div className="imp-gantt" ref={ganttRef}>
          <svg className={`imp-svg${temBar ? " has-bar" : ""}`} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Cronograma de implantação com 11 frentes ao longo de 365 dias e marcos nos dias 90, 120, 240 e 365.">
            {banda >= 0 && (
              <rect x={xd(FASES[banda].ini)} y={TOP - 6} width={xd(FASES[banda].fim) - xd(FASES[banda].ini)} height={FRENTES.length * LIN + 4} fill="rgba(163,22,33,0.07)" />
            )}
            <line x1={X0} y1={EIXO} x2={X1} y2={EIXO} stroke="#0b1a40" strokeWidth={1.2} />
            <line x1={X0} y1={TOP - 8} x2={X0} y2={EIXO} stroke="#0b1a40" strokeWidth={1.2} />
            {[0, 50, 100, 150, 200, 250, 300, 350].map((t) => (
              <g key={t} aria-hidden="true">
                <line x1={xd(t)} y1={EIXO} x2={xd(t)} y2={EIXO + 5} stroke="#0b1a40" strokeWidth={1} />
                <text x={xd(t)} y={EIXO + 18} textAnchor="middle" fontSize={11.5} fill="#1c2240">{t}</text>
              </g>
            ))}
            <text x={(X0 + X1) / 2} y={EIXO + 40} textAnchor="middle" fontSize={12.5} fill="#1c2240">dias a partir do início do plano</text>

            {FRENTES.map((f, i) => {
              const y = yRow(i);
              return (
                <g key={f.nome} className={`imp-bar${on(`bar:${i}`) ? " is-on" : ""}`} {...props(`bar:${i}`)}>
                  <rect x={0} y={y - 4} width={X1} height={LIN - 4} fill="transparent" />
                  <text x={X0 - 12} y={y + BAR / 2 + 4} textAnchor="end" fontSize={12} fill="#1c2240">{f.nome}</text>
                  <rect className="imp-bar-rect" x={xd(f.ini)} y={y} width={xd(f.fim) - xd(f.ini)} height={BAR} fill={f.cor} />
                </g>
              );
            })}

            {MARCOS.map((m, i) => {
              const x = xd(m.dia);
              return (
                <g key={m.dia} className={`imp-marco${on(`marco:${i}`) ? " is-on" : ""}`} {...props(`marco:${i}`)}>
                  <line x1={x} y1={14} x2={x} y2={EIXO} stroke="transparent" strokeWidth={14} pointerEvents="stroke" />
                  <line className="imp-marco-line" x1={x} y1={28} x2={x} y2={EIXO} stroke="#a31621" strokeWidth={1.6} strokeDasharray="5 4" />
                  <text className="imp-marco-lbl" x={x + m.dx} y={22} textAnchor={m.anchor} fontSize={12} fontWeight={700} fill="#a31621" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">Dia {m.dia}</text>
                </g>
              );
            })}
          </svg>

          {/* Celular: lista com mini-barras */}
          <div className="imp-li-scale" aria-hidden="true">
            {([[0, "0", "none"], [90, "Dia 90", "translateX(calc(-100% - 3px))"], [120, "Dia 120", "translateX(3px)"], [240, "Dia 240", "translateX(-50%)"], [365, "Dia 365", "translateX(-100%)"]] as const).map(([d, txt, tr]) => (
              <span key={d} style={{ left: `${(d / DIAS) * 100}%`, transform: tr }}>{txt}</span>
            ))}
          </div>
          <ul className="imp-list">
            {FRENTES.map((f, i) => (
              <li key={f.nome} className={on(`bar:${i}`) ? "is-on" : ""} {...props(`bar:${i}`, "listitem")}>
                <p className="imp-li-nome">{f.nome} <span>dias {f.ini}–{f.fim}</span></p>
                <div className="imp-li-track">
                  {[90, 120, 240].map((d) => <i key={d} className="imp-li-mark" style={{ left: `${(d / DIAS) * 100}%` }} />)}
                  <span style={{ left: `${(f.ini / DIAS) * 100}%`, width: `${((f.fim - f.ini) / DIAS) * 100}%`, background: f.cor }} />
                </div>
              </li>
            ))}
          </ul>
          <Tip onde="gantt" classe="imp-tip" />
        </div>

        <p className="imp-cap">Cronograma de implantação do ecossistema. As fases se sobrepõem de propósito para encurtar o prazo.</p>

        <div className="imp-tblwrap" ref={faseRef}>
          <div className="imp-tblbox">
            <table className={`imp-tbl imp-tbl-fase${rel && FASES.some((_, j) => on(`fase:${j}`)) ? " has-active" : ""}`}>
              <thead><tr><th scope="col">Fase</th><th scope="col">Entregas</th><th scope="col">Reuniões e decisões</th><th scope="col">Critério de saída</th></tr></thead>
              <tbody>
                {FASES.map((f, j) => (
                  <tr key={f.nome} className={on(`fase:${j}`) ? "is-active" : ""} style={{ "--c": "#a31621" } as CSSProperties} {...props(`fase:${j}`, "row")}
                    aria-label={`${f.dias}, ${f.nome}. Entregas: ${f.entregas}. Reuniões e decisões: ${f.reunioes}. Critério de saída: ${f.saida}.`}>
                    <td data-label="Fase" className="imp-td-first">{f.dias}<br />{f.nome}</td>
                    <td data-label="Entregas">{f.entregas}</td>
                    <td data-label="Reuniões e decisões">{f.reunioes}</td>
                    <td data-label="Critério de saída" className="imp-td-saida">{f.saida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Tip onde="fase" classe="imp-tbltip" />
        </div>
      </figure>

      {/* ================= Trilha de maturidade ================= */}
      <figure className="fig">
        <p className="fig-heading">Trilha de maturidade digital: nível-alvo (0 a 5)</p>
        <div className={`imp-mat${rel && MAT_COLS.some((_, c) => on(`matcol:${c}`)) ? " has-active" : ""}`} ref={matRef}>
          <div className="imp-mat-grid" role="table" aria-label="Trilha de maturidade digital por camada, nos dias 90, 240 e 365.">
            <div className="imp-mat-row imp-mat-head" role="row">
              <span role="columnheader" className="imp-mat-lbl" />
              {MAT_COLS.map((c, k) => (
                <span key={c} className={`imp-mat-col${on(`matcol:${k}`) ? " is-on" : ""}`} {...props(`matcol:${k}`, "columnheader")}>{c}</span>
              ))}
            </div>
            {MATURIDADE.map((m, r) => (
              <div key={m.nome} role="row" className={`imp-mat-row${on(`matrow:${r}`) ? " is-row" : ""}`}>
                <span role="rowheader" className="imp-mat-lbl">{m.nome}</span>
                {m.v.map((v, c) => (
                  <span
                    key={c}
                    className={`imp-cell${ativo === `mat:${r}:${c}` ? " is-on" : on(`matcol:${c}`) ? " is-col" : ""}`}
                    style={{ background: NIVEL_COR[v][0], color: NIVEL_COR[v][1] }}
                    {...props(`mat:${r}:${c}`, "cell")}
                  >{v}</span>
                ))}
              </div>
            ))}
          </div>
          <Tip onde="mat" classe="imp-tip" />
        </div>
        <figcaption>Trilha de maturidade por camada.</figcaption>
      </figure>

      {/* ================= Critérios de seleção (tabela única) ================= */}
      <figure className="fig">
        <p className="fig-heading imp-red">Critérios de seleção de ferramentas (pesos)</p>
        <div className="imp-tblwrap" ref={critRef}>
          <div className="imp-tblbox">
            <table className={`imp-tbl imp-tbl-crit${rel && CRITERIOS.some((_, k) => on(`crit:${k}`)) ? " has-active" : ""}`}>
              <thead><tr><th scope="col">Critério</th><th scope="col">Peso</th><th scope="col">Como verificar</th></tr></thead>
              <tbody>
                {CRITERIOS.map((c, k) => (
                  <tr key={c.nome} className={ativo === `crit:${k}` ? "is-active" : on(`crit:${k}`) ? "is-linked" : ""} style={{ "--c": "#0a1f8f" } as CSSProperties} {...props(`crit:${k}`, "row")}
                    aria-label={`${c.nome}. Peso ${c.peso}%. Como verificar: ${c.como}.`}>
                    <td data-label="Critério" className="imp-td-first">{c.nome}</td>
                    <td data-label="Peso" className="imp-td-peso">
                      <span className="imp-peso">{c.peso}%</span>
                      <span className="imp-peso-bar" aria-hidden="true"><i style={{ width: `${(c.peso / 25) * 100}%` }} /></span>
                    </td>
                    <td data-label="Como verificar">{c.como}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Tip onde="crit" classe="imp-tbltip" />
        </div>
        {SOMA_PESOS !== 100 && <p className="imp-cap">Atenção: os pesos somam {SOMA_PESOS}%.</p>}
      </figure>
    </div>
  );
}
