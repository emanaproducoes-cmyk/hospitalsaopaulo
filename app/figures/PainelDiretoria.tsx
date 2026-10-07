"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./painelDiretoriaFigura.css";

type TipContent = { tag: string; title: string; body: string };
const fmt = (n: number) => n.toLocaleString("pt-BR");
const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`;
const FICT = "dado fictício";

/* ---------- Dados do exemplo (fictícios, como no plano) ---------- */
const KPIS = [
  { rotulo: "Contatos qualificados", valor: "342", sub: "/ mês", cor: "#0b1a40", valorCor: "#0b1a40", mes: true },
  { rotulo: "Mediana 1ª resposta", valor: "3,8 min", sub: "horário comercial", cor: "#2f7a4b", valorCor: "#2f7a4b", mes: false },
  { rotulo: "Comparecimento", valor: "71%", sub: "contato > atendimento", cor: "#0a1f8f", valorCor: "#0a1f8f", mes: false },
  { rotulo: "Atend. adicionais", valor: "118", sub: "/ mês", cor: "#a31621", valorCor: "#a31621", mes: true },
];
const LINHA = [20, 35, 48, 70, 85, 97, 118, 130, 148, 168, 183, 205];
const ORIGENS = [
  { nome: "Indicação", v: 24, cor: "#a31621" },
  { nome: "Mídia paga", v: 38, cor: "#7a7f99" },
  { nome: "Busca local", v: 63, cor: "#0b1a40" },
  { nome: "Empresas", v: 22, cor: "#c0832a" },
  { nome: "Médicos", v: 41, cor: "#0a1f8f" },
];
const TOTAL_ORIG = ORIGENS.reduce((s, o) => s + o.v, 0);
const FUNIL = [
  { nome: "Contato", v: 342, cor: "#c4c7da" },
  { nome: "Agendado", v: 248, cor: "#5361c4" },
  { nome: "Compareceu", v: 176, cor: "#0a1f8f" },
  { nome: "Retorno 90d", v: 64, cor: "#0b1a40" },
];
const GUARD = [
  { nome: "Tempo de resposta", status: "verde" as const },
  { nome: "Satisfação (NPS)", status: "verde" as const },
  { nome: "Conformidade CFM/LGPD", status: "verde" as const },
  { nome: "Capacidade / ocupação", status: "amarelo" as const },
];
const LINHAS_TBL = [
  { camada: "Diretoria", publico: "Sócios e direção clínica", conteudo: "North Star, TRJA, atendimentos adicionais /mês, guard-rails, custo por atendimento, projeção de caixa em ciclos de 30 dias", atualizacao: "Quase contínua; resumo semanal", cor: "#a31621" },
  { camada: "Marketing e inteligência", publico: "Coordenação e time", conteudo: "Origem, conversão por etapa, campanhas, conteúdo, reputação, experimentos ICE", atualizacao: "Diária", cor: "#0a1f8f" },
  { camada: "Operação", publico: "Recepção, enfermagem, faturamento", conteudo: "Tempo de resposta, fila, no-show, lembretes, capacidade", atualizacao: "A cada 15 minutos", cor: "#2f7a4b" },
];

/* ---------- Ligações entre os blocos do painel e a tabela ---------- */
const GRUPOS: string[][] = [
  ["kpi:0", "fun:0"],
  ["kpi:1", "gr:0"],
  ["kpi:2", "fun:1", "fun:2"],
  ["kpi:3", "line"],
];
const ROWS: Record<string, string[]> = {
  "row:0": ["kpi:3", "line", "gr:0", "gr:1", "gr:2", "gr:3"],
  "row:1": ["orig:0", "orig:1", "orig:2", "orig:3", "orig:4", "fun:0", "fun:1", "fun:2", "fun:3"],
  "row:2": ["kpi:1", "gr:0", "gr:3", "fun:2"],
};
function relacionados(key: string): Set<string> {
  const base = key.startsWith("line:") ? "line" : key;
  const s = new Set<string>([key, base]);
  if (ROWS[base]) ROWS[base].forEach((k) => s.add(k));
  GRUPOS.filter((g) => g.includes(base)).forEach((g) => g.forEach((k) => s.add(k)));
  Object.entries(ROWS).forEach(([r, ks]) => { if (ks.includes(base)) s.add(r); });
  return s;
}

/* ---------- Conteúdo dos tooltips ---------- */
function tipDe(key: string): TipContent {
  const [tipo, i0] = key.split(":"); const i = Number(i0);
  if (tipo === "kpi") {
    const b = [
      "Contatos com origem e intenção registradas no mês. No funil, é a barra Contato.",
      "Metade dos contatos recebe a primeira resposta em até 3,8 minutos, dentro da meta de SLA de 5 min.",
      `No funil, ${FUNIL[2].v} compareceram de ${FUNIL[1].v} agendados (${pct(FUNIL[2].v, FUNIL[1].v)}).`,
      "Atendimentos a mais em relação à base, no mês. A linha ao lado mostra a evolução mês a mês.",
    ][i];
    return { tag: `Indicador · ${FICT}`, title: `${KPIS[i].rotulo}: ${KPIS[i].valor}${KPIS[i].mes ? "/mês" : ""}`, body: b };
  }
  if (tipo === "line") {
    const d = i > 0 ? LINHA[i] - LINHA[i - 1] : null;
    return { tag: `Mês ${i + 1} · ${FICT}`, title: `${fmt(LINHA[i])} atendimentos adicionais/mês`, body: d === null ? "Primeiro mês da série." : `Variação sobre o mês anterior: +${fmt(d)}.` };
  }
  if (tipo === "orig") {
    const o = ORIGENS[i];
    return { tag: `Origem · último ciclo de 30 dias · ${FICT}`, title: `${o.nome}: ${o.v} contatos`, body: `${pct(o.v, TOTAL_ORIG)} dos ${TOTAL_ORIG} contatos do gráfico de origem.` };
  }
  if (tipo === "fun") {
    const f = FUNIL[i];
    const b = [
      "Base do funil no ciclo de 30 dias.",
      `${pct(FUNIL[1].v, FUNIL[0].v)} dos contatos agendaram.`,
      `${pct(FUNIL[2].v, FUNIL[1].v)} dos agendados compareceram.`,
      `${pct(FUNIL[3].v, FUNIL[2].v)} de quem compareceu voltou em até 90 dias.`,
    ][i];
    return { tag: `Funil do ciclo · ${FICT}`, title: `${f.nome}: ${fmt(f.v)}`, body: b };
  }
  if (tipo === "gr") {
    const g = GUARD[i];
    return g.status === "verde"
      ? { tag: "Guard-rail · sinal verde", title: g.nome, body: "Dentro do limite combinado; o crescimento pode seguir." }
      : { tag: "Guard-rail · sinal amarelo", title: g.nome, body: "Perto do limite: a diretoria avalia antes de aumentar a demanda." };
  }
  const r = LINHAS_TBL[i];
  return { tag: `Camada do painel · atualização: ${r.atualizacao.toLowerCase()}`, title: `${r.camada}: ${r.publico.toLowerCase()}`, body: "Os blocos destacados no exemplo acima mostram o que esta camada acompanha." };
}

function marcar(texto: string) {
  return texto.split(/(\/mês)/g).map((p, i) => (p === "/mês" ? <b key={i} className="pdr-mes">/mês</b> : <Fragment key={i}>{p}</Fragment>));
}

/* ---------- Geometria dos gráficos (viewBox 420 × 230 cada) ---------- */
const W = 420, H = 230;
const L = { x0: 40, x1: 408, top: 12, bot: 196, max: 210 };
const lx = (m: number) => L.x0 + ((m - 0.5) / 12) * (L.x1 - L.x0);
const ly = (v: number) => L.bot - (v / L.max) * (L.bot - L.top);
const O = { x0: 92, x1: 408, top: 8, row: 36, bar: 22, max: 70, eixo: 192 };
const ox = (v: number) => O.x0 + (v / O.max) * (O.x1 - O.x0);
const F = { x0: 40, x1: 408, top: 10, bot: 196, max: 360 };
const fy = (v: number) => F.bot - (v / F.max) * (F.bot - F.top);
const fSlot = (F.x1 - F.x0) / 4;

export default function PainelDiretoria() {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tblRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<string | null>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; left: number; above: boolean; onde: "painel" | "tabela" }) | null>(null);

  const limpar = () => { setAtivo(null); setTip(null); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setAtivo(null); setTip(null); } };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, []);

  const ligar = (el: Element, key: string) => {
    const onde = key.startsWith("row:") ? "tabela" : "painel";
    const w = (onde === "tabela" ? tblRef : wrapRef).current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const above = onde === "tabela" ? Number(key.split(":")[1]) >= 1 : r.top - wr.top > 170;
    setAtivo(key);
    setTip({ ...tipDe(key), onde, above, top: above ? r.top - wr.top : r.bottom - wr.top, left: r.left + r.width / 2 - wr.left });
  };
  const props = (key: string) => {
    const t = tipDe(key);
    return {
      tabIndex: 0,
      role: "button",
      "aria-label": `${t.title}. ${t.body}`,
      onPointerEnter: (e: PointerEvent<Element>) => { if (e.pointerType !== "touch") ligar(e.currentTarget, key); },
      onPointerDown: (e: PointerEvent<Element>) => { if (e.pointerType === "touch") { if (ativo === key) limpar(); else ligar(e.currentTarget, key); } },
      onPointerLeave: sair,
      onFocus: (e: FocusEvent<Element>) => ligar(e.currentTarget, key),
      onBlur: limpar,
      onKeyDown: esc,
    };
  };

  const rel = ativo ? relacionados(ativo) : null;
  const st = (key: string) => (rel ? (rel.has(key) ? " is-on" : " is-dim") : "");
  const linhaOn = rel?.has("line") ?? false;

  const area = `M${lx(1)},${ly(0)} ` + LINHA.map((v, i) => `L${lx(i + 1).toFixed(1)},${ly(v).toFixed(1)}`).join(" ") + ` L${lx(12)},${ly(0)} Z`;

  return (
    <div className="pdr-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Painel da diretoria (EXEMPLO ILUSTRATIVO com dados fictícios)</p>

        <div className={`pdr-dash${rel ? " has-active" : ""}`} ref={wrapRef}>
          {/* KPIs */}
          <div className="pdr-kpis">
            {KPIS.map((k, i) => (
              <div key={k.rotulo} className={`pdr-kpi${st(`kpi:${i}`)}`} style={{ "--c": k.cor } as CSSProperties} {...props(`kpi:${i}`)}>
                <span className="pdr-kpi-rot">{k.rotulo}</span>
                <strong className="pdr-kpi-val" style={{ color: k.valorCor }}>{k.valor}</strong>
                <span className="pdr-kpi-sub">{k.mes ? <b className="pdr-mes">/ mês</b> : k.sub}</span>
              </div>
            ))}
          </div>

          <div className="pdr-grid">
            {/* Linha: atendimentos adicionais por mês */}
            <div className={`pdr-panel${linhaOn ? " is-on" : rel ? " is-dim" : ""}`}>
              <p className="pdr-ptitle">Atendimentos adicionais por MÊS</p>
              <svg className="pdr-svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Atendimentos adicionais por mês, do mês 1 ao 12 (dados fictícios).">
                {[0, 50, 100, 150, 200].map((v) => (
                  <g key={v} aria-hidden="true">
                    <line x1={L.x0} y1={ly(v)} x2={L.x1} y2={ly(v)} stroke="#eef0f8" strokeWidth={1} />
                    <text x={L.x0 - 6} y={ly(v) + 4} textAnchor="end" fontSize={11} fill="#1c2240">{v}</text>
                  </g>
                ))}
                <line x1={L.x0} y1={L.bot} x2={L.x1} y2={L.bot} stroke="#0b1a40" strokeWidth={1.2} />
                <line x1={L.x0} y1={L.top} x2={L.x0} y2={L.bot} stroke="#0b1a40" strokeWidth={1.2} />
                {[2, 4, 6, 8, 10, 12].map((m) => <text key={m} x={lx(m)} y={L.bot + 17} textAnchor="middle" fontSize={11} fill="#1c2240" aria-hidden="true">{m}</text>)}
                <path d={area} fill="rgba(163,22,33,0.15)" />
                <polyline className="pdr-line" points={LINHA.map((v, i) => `${lx(i + 1).toFixed(1)},${ly(v).toFixed(1)}`).join(" ")} fill="none" stroke="#a31621" strokeWidth={2.6} strokeLinejoin="round" />
                {LINHA.map((v, i) => (
                  <g key={i} className={`pdr-pt${ativo === `line:${i}` ? " is-on" : ""}`} {...props(`line:${i}`)}>
                    <rect x={lx(i + 1) - 14} y={L.top} width={28} height={L.bot - L.top} fill="transparent" />
                    <circle cx={lx(i + 1)} cy={ly(v)} r={3.4} fill="#a31621" stroke="#ffffff" strokeWidth={1.2} />
                  </g>
                ))}
              </svg>
            </div>

            {/* Barras: contatos por origem */}
            <div className={`pdr-panel${rel && ORIGENS.some((_, i) => rel.has(`orig:${i}`)) ? " is-on" : rel ? " is-dim" : ""}`}>
              <p className="pdr-ptitle">Contatos por origem (último ciclo de 30 dias)</p>
              <svg className="pdr-svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Contatos por origem no último ciclo de 30 dias (dados fictícios).">
                {[0, 10, 20, 30, 40, 50, 60].map((v) => (
                  <g key={v} aria-hidden="true">
                    <line x1={ox(v)} y1={O.top} x2={ox(v)} y2={O.eixo} stroke="#eef0f8" strokeWidth={1} />
                    <text x={ox(v)} y={O.eixo + 16} textAnchor="middle" fontSize={11} fill="#1c2240">{v}</text>
                  </g>
                ))}
                <line x1={O.x0} y1={O.eixo} x2={O.x1} y2={O.eixo} stroke="#0b1a40" strokeWidth={1.2} />
                <line x1={O.x0} y1={O.top} x2={O.x0} y2={O.eixo} stroke="#0b1a40" strokeWidth={1.2} />
                {ORIGENS.map((o, i) => {
                  const y = O.top + i * O.row + (O.row - O.bar) / 2;
                  return (
                    <g key={o.nome} className={`pdr-bar${st(`orig:${i}`)}`} {...props(`orig:${i}`)}>
                      <rect x={0} y={y - 6} width={O.x1} height={O.bar + 12} fill="transparent" />
                      <text x={O.x0 - 6} y={y + O.bar / 2 + 4} textAnchor="end" fontSize={11} fill="#1c2240">{o.nome}</text>
                      <rect x={O.x0} y={y} width={ox(o.v) - O.x0} height={O.bar} fill={o.cor} />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Funil do ciclo de 30 dias */}
            <div className={`pdr-panel${rel && FUNIL.some((_, i) => rel.has(`fun:${i}`)) ? " is-on" : rel ? " is-dim" : ""}`}>
              <p className="pdr-ptitle">Funil do ciclo de 30 dias</p>
              <svg className="pdr-svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Funil do ciclo de 30 dias: contato, agendado, compareceu e retorno em 90 dias (dados fictícios).">
                {[0, 100, 200, 300].map((v) => (
                  <g key={v} aria-hidden="true">
                    <line x1={F.x0} y1={fy(v)} x2={F.x1} y2={fy(v)} stroke="#eef0f8" strokeWidth={1} />
                    <text x={F.x0 - 6} y={fy(v) + 4} textAnchor="end" fontSize={11} fill="#1c2240">{v}</text>
                  </g>
                ))}
                <line x1={F.x0} y1={F.bot} x2={F.x1} y2={F.bot} stroke="#0b1a40" strokeWidth={1.2} />
                <line x1={F.x0} y1={F.top} x2={F.x0} y2={F.bot} stroke="#0b1a40" strokeWidth={1.2} />
                {FUNIL.map((f, i) => {
                  const x = F.x0 + i * fSlot + 8, w = fSlot - 16;
                  return (
                    <g key={f.nome} className={`pdr-bar${st(`fun:${i}`)}`} {...props(`fun:${i}`)}>
                      <rect x={x - 4} y={F.top} width={w + 8} height={F.bot - F.top + 22} fill="transparent" />
                      <rect x={x} y={fy(f.v)} width={w} height={F.bot - fy(f.v)} fill={f.cor} />
                      <text x={x + w / 2} y={F.bot + 17} textAnchor="middle" fontSize={11} fill="#1c2240">{f.nome}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Guard-rails */}
            <div className={`pdr-panel${rel && GUARD.some((_, i) => rel.has(`gr:${i}`)) ? " is-on" : rel ? " is-dim" : ""}`}>
              <p className="pdr-ptitle">Guard-rails (semáforo)</p>
              <ul className="pdr-guard">
                {GUARD.map((g, i) => (
                  <li key={g.nome} className={`pdr-gr ${g.status}${st(`gr:${i}`)}`} {...props(`gr:${i}`)}>
                    <i className="pdr-led" aria-hidden="true" />{g.nome}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {tip && tip.onde === "painel" && (
            <div className={`pdr-tip${tip.above ? " above" : ""}`} role="tooltip" style={{ top: tip.top, "--left": `${tip.left}px` } as CSSProperties}>
              <span className="pdr-tip-tag">{tip.tag}</span>
              <strong className="pdr-tip-title">{tip.title}</strong>
              <span className="pdr-tip-body">{tip.body}</span>
            </div>
          )}
        </div>

        <p className="pdr-cap">Exemplo ilustrativo com dados fictícios: o painel real será definido na oficina de indicadores.</p>

        {/* Tabela das camadas do painel */}
        <div className="pdr-tblwrap" ref={tblRef}>
          <div className="pdr-tblbox">
            <table className={`pdr-tbl${rel && LINHAS_TBL.some((_, i) => rel.has(`row:${i}`)) ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Camada</th><th scope="col">Público</th><th scope="col">Conteúdo</th><th scope="col">Atualização</th></tr>
              </thead>
              <tbody>
                {LINHAS_TBL.map((r, i) => (
                  <tr
                    key={r.camada} className={rel?.has(`row:${i}`) ? "is-active" : ""} style={{ "--c": r.cor } as CSSProperties}
                    {...props(`row:${i}`)} role={undefined}
                    aria-label={`${r.camada}. Público: ${r.publico}. Conteúdo: ${r.conteudo}. Atualização: ${r.atualizacao}.`}
                  >
                    <td data-label="Camada" className="pdr-td-first">{r.camada}</td>
                    <td data-label="Público">{r.publico}</td>
                    <td data-label="Conteúdo">{marcar(r.conteudo)}</td>
                    <td data-label="Atualização">{r.atualizacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tip && tip.onde === "tabela" && (
            <div className={`pdr-tbltip${tip.above ? " above" : ""}`} role="tooltip" style={{ top: tip.top }}>
              <span className="pdr-tip-tag">{tip.tag}</span>
              <strong className="pdr-tip-title">{tip.title}</strong>
              <span className="pdr-tip-body">{tip.body}</span>
            </div>
          )}
        </div>
      </figure>
    </div>
  );
}
