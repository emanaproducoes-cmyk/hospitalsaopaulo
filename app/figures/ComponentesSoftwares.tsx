"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./componentesSoftwaresFigura.css";

type TipContent = { tag: string; title: string; body: string };
type Linha = { camada: string; solucao: string; funcao: string; obs: string; cor: string };
type Etapa = { n: number; texto: string; cor: string; rows: number[]; body: string };

/* ---------- Tabela única (as duas páginas do Word viraram uma só) ---------- */
const LINHAS: Linha[] = [
  {
    camada: "Canais", cor: "#0b1a40",
    solucao: "WhatsApp Business Platform via BSP oficial (ex.: Blip, Zenvia, Twilio ou Gupshup); Google Perfil da Empresa; telefonia IP com número rastreável; site em CMS",
    funcao: "Entrada de contatos com origem e intenção registradas desde o primeiro clique",
    obs: "Cotar BSPs; tarifas de referência: utilidade ≈ R$ 0,04–0,05 e marketing ≈ R$ 0,31–0,38 por mensagem; serviço dentro de 24 h sem custo em 2026 [BENCHMARK, confirmar na Meta]",
  },
  {
    camada: "Integração", cor: "#0a1f8f",
    solucao: "n8n (orquestração) + API própria em Node/Python + fila de eventos",
    funcao: "Conecta canais, banco, CRM, agenda e IA; webhooks gravam cada evento",
    obs: "n8n Cloud a partir de € 20/mês [BENCHMARK]; alternativa self-hosted",
  },
  {
    camada: "Núcleo de dados", cor: "#5361c4",
    solucao: "PostgreSQL gerenciado em região Brasil (AWS São Paulo, Azure Brazil South ou Google Cloud São Paulo) + camada analítica",
    funcao: "Fonte única: contato, origem, intenção, consentimento, histórico administrativo; sem dado clínico",
    obs: "Backups, retenção, dicionário de dados e trilha de auditoria desde o dia 1",
  },
  {
    camada: "CRM", cor: "#a31621",
    solucao: "Fase 1: RD Station CRM (Basic R$ 65,70 ou Pro R$ 117,90 por usuário/mês) ou HubSpot Free; Fase 2: módulos próprios sobre o banco, feitos pelo programador",
    funcao: "Pipeline por jornada (consulta, cirurgia, internação, maternidade, B2B), etiquetas e SLA da 1ª resposta",
    obs: "Preços pesquisados em 02/10/2026; confirmar antes de contratar",
  },
  {
    camada: "Atendimento remoto com IA", cor: "#a31621",
    solucao: "Assistente virtual no WhatsApp com modelo de linguagem via API (ex.: Claude, da Anthropic) e RAG sobre base pública aprovada; handoff humano",
    funcao: "Responde horários, convênios, preparo, curso de gestantes e agendamento administrativo, 24 horas",
    obs: "Sem diagnóstico, triagem nem dado de saúde nos prompts; contrato de operador, RIPD e revisão humana",
  },
  {
    camada: "Intranet, tarefas e reuniões", cor: "#a31621",
    solucao: "Microsoft 365: SharePoint (intranet), Teams (canais por setor e reuniões), Planner e Power Automate (tarefas e rotinas), Entra ID (SSO + MFA)",
    funcao: "Comunicação integrada entre setores; tarefas ligadas a eventos do CRM; documentos e indicadores por setor",
    obs: "Licenciamento a cotar; alternativa de tarefas: ClickUp (US$ 7 por usuário/mês) ou Trello",
  },
  {
    camada: "BI e dashboards", cor: "#2f7a4b",
    solucao: "Power BI (conectado ao banco por DirectQuery e streaming) com Looker Studio como apoio gratuito; GA4, GTM e Search Console como fontes",
    funcao: "Painéis em três camadas, atualizados a cada 5 a 15 minutos; alertas de guard-rails",
    obs: "Preço de licença a cotar; “tempo real” significa atualização quase contínua",
  },
  {
    camada: "Integração com sistema hospitalar", cor: "#0a1f8f",
    solucao: "Conectores REST, HL7/FHIR ou arquivos, conforme o sistema vigente (HIS/ERP)",
    funcao: "Agenda, comparecimento, convênio e valor entram no CRM sem dado clínico",
    obs: "Mapear o fornecedor na oficina 3",
  },
  {
    camada: "Governança e segurança", cor: "#a31621",
    solucao: "Encarregado (DPO), RIPD, política de IA, contratos de operador, gerenciador de senhas, auditoria externa",
    funcao: "Garante conformidade com LGPD art. 11 e Resolução CFM 2.336/2023",
    obs: "Nenhuma ferramenta é integrada sem inventário, contrato e aprovação formal",
  },
];
const TODAS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ---------- Jornada de um contato (8 etapas) ---------- */
/* rows = linhas da tabela usadas em cada etapa. Toda etapa também grava no Núcleo de dados (linha 2). */
const ETAPAS: Etapa[] = [
  { n: 1, texto: "Contato chega via link, QR, Perfil ou telefone", cor: "#0b1a40", rows: [0], body: "Cada canal tem link, QR ou número próprio, então a origem fica registrada desde o primeiro clique." },
  { n: 2, texto: "Webhook grava origem e intenção (sem dado clínico)", cor: "#0b1a40", rows: [1], body: "O webhook grava no banco a origem e a intenção do contato. Nenhum dado clínico entra." },
  { n: 3, texto: "IA responde FAQ administrativa; nunca triagem", cor: "#0a1f8f", rows: [4], body: "O assistente responde só dúvidas administrativas, com conteúdo aprovado. Sintoma ou urgência vão direto a uma pessoa." },
  { n: 4, texto: "Handoff humano com etiqueta e SLA de 5 min", cor: "#0a1f8f", rows: [3, 5], body: "Uma pessoa assume a conversa com o histórico e a etiqueta da jornada; a meta de primeira resposta é de até 5 minutos." },
  { n: 5, texto: "Agendamento no sistema da agenda", cor: "#5361c4", rows: [7], body: "O horário marcado no sistema da agenda volta para o CRM pela integração com o sistema hospitalar." },
  { n: 6, texto: "Lembrete 24 h e orientações de preparo", cor: "#5361c4", rows: [1], body: "Um dia antes, o paciente recebe lembrete e orientações de preparo, o que ajuda a reduzir faltas." },
  { n: 7, texto: "Comparecimento registrado (sem dado clínico)", cor: "#a31621", rows: [7], body: "O sistema registra que o paciente compareceu, sem nenhum dado clínico." },
  { n: 8, texto: "NPS opt-in e pedido ético de avaliação", cor: "#a31621", rows: [3, 6], body: "A pesquisa NPS só vai com consentimento (opt-in), e o pedido de avaliação pública segue regras éticas." },
];
/* Linhas que valem para todas as etapas: Núcleo de dados (cada etapa gera um evento) e Governança. */
const etapasDaLinha = (r: number) => (r === 2 || r === 8 ? TODAS : ETAPAS.filter((e) => e.rows.includes(r)).map((e) => e.n));

const TAG_TIPS: Record<string, string> = {
  "[BENCHMARK, confirmar na Meta]": "Referência de mercado; o valor final deve ser confirmado na tabela oficial da Meta.",
  "[BENCHMARK]": "Referência de mercado pesquisada pelo plano; confirmar antes de contratar.",
};
function marcar(texto: string) {
  return texto.split(/(\/mês|\[BENCHMARK, confirmar na Meta\]|\[BENCHMARK\])/g).map((p, i) => {
    if (p === "/mês") return <b key={i} className="cps-mes">/mês</b>;
    if (TAG_TIPS[p]) return <span key={i} className="cps-chip cps-tag" tabIndex={0} data-tip={TAG_TIPS[p]}>{p}</span>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}
const listaEtapas = (ns: number[]) => (ns.length === 8 ? "todas as 8 etapas" : ns.length === 1 ? `etapa ${ns[0]}` : `etapas ${ns.slice(0, -1).join(", ")} e ${ns[ns.length - 1]}`);

type Ativo = { t: "row"; r: number } | { t: "etapa"; n: number } | null;
type Pos = TipContent & { top: number; left: number; above: boolean };
function useTip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Pos | null>(null);
  const show = (el: HTMLElement, above: boolean, c: TipContent) => {
    const w = wrapRef.current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    setTip({ ...c, above, top: above ? r.top - wr.top : r.bottom - wr.top, left: r.left + r.width / 2 - wr.left });
  };
  return { wrapRef, tip, show, hide: () => setTip(null) };
}

export default function ComponentesSoftwares() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);
  const tb = useTip();
  const jr = useTip();

  const limpar = () => { setAtivo(null); tb.hide(); jr.hide(); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) limpar(); };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Ligação tabela ↔ jornada */
  const rowsOn = new Set<number>();
  const etapasOn = new Set<number>();
  if (ativo?.t === "row") { rowsOn.add(ativo.r); etapasDaLinha(ativo.r).forEach((n) => etapasOn.add(n)); }
  if (ativo?.t === "etapa") { etapasOn.add(ativo.n); ETAPAS[ativo.n - 1].rows.forEach((r) => rowsOn.add(r)); rowsOn.add(2); }

  const ligarEtapa = (el: HTMLElement, n: number) => {
    const e = ETAPAS[n - 1];
    setAtivo({ t: "etapa", n }); tb.hide();
    jr.show(el, n >= 5, {
      tag: `Etapa ${n} de 8 · evento gravado no banco`,
      title: e.texto,
      body: `${e.body} Na tabela: ${e.rows.map((r) => LINHAS[r].camada).join(" e ")}, além do Núcleo de dados.`,
    });
  };

  return (
    <div className="cps-root" ref={rootRef}>
      {/* ---------- Tabela ---------- */}
      <figure className="fig">
        <p className="fig-heading">Componentes, softwares e como funcionam juntos</p>
        <div className="cps-tblwrap" ref={tb.wrapRef}>
          <div className="cps-tblbox">
            <table className={`cps-tbl${rowsOn.size ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Camada</th><th scope="col">Solução sugerida</th><th scope="col">Função no ecossistema</th><th scope="col">Observações</th></tr>
              </thead>
              <tbody>
                {LINHAS.map((ln, r) => {
                  const ns = etapasDaLinha(r);
                  const c: TipContent = {
                    tag: "Na jornada de um contato",
                    title: ns.length ? `Usada em ${listaEtapas(ns)}` : "Apoio a todas as etapas",
                    body: ns.length === 8
                      ? (r === 2 ? "Cada etapa grava um evento neste núcleo." : "Vale para todo o fluxo: nada é integrado sem inventário, contrato e aprovação.")
                      : `${ln.camada}: ${ln.funcao}.`,
                  };
                  const on = (el: HTMLElement) => { setAtivo({ t: "row", r }); jr.hide(); tb.show(el, r >= LINHAS.length - 3, c); };
                  return (
                    <tr
                      key={ln.camada} className={rowsOn.has(r) ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": ln.cor } as CSSProperties}
                      aria-label={`${ln.camada}. Solução: ${ln.solucao}. Função: ${ln.funcao}. Observações: ${ln.obs}.`}
                      onPointerEnter={(e) => { if (e.pointerType !== "touch") on(e.currentTarget); }} onPointerLeave={sair}
                      onFocus={(e) => { if (e.target === e.currentTarget) on(e.currentTarget); }} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Camada" className="cps-td-first">{ln.camada}</td>
                      <td data-label="Solução sugerida">{marcar(ln.solucao)}</td>
                      <td data-label="Função no ecossistema">{ln.funcao}</td>
                      <td data-label="Observações">{marcar(ln.obs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tb.tip && (
            <div className={`cps-tbltip${tb.tip.above ? " above" : ""}`} style={{ top: tb.tip.top }} role="tooltip">
              <span className="cps-tip-tag">{tb.tip.tag}</span>
              <strong className="cps-tip-title">{tb.tip.title}</strong>
              <span className="cps-tip-body">{tb.tip.body}</span>
            </div>
          )}
        </div>
      </figure>

      {/* ---------- Jornada de um contato ---------- */}
      <figure className="fig">
        <p className="fig-heading">Jornada de um contato dentro do ecossistema</p>
        <p className="cps-sub">Cada etapa gera um evento no banco de dados e alimenta o CRM e o painel da diretoria</p>
        <div className={`cps-journey${etapasOn.size ? " has-active" : ""}`} ref={jr.wrapRef}>
          {[ETAPAS.slice(0, 4), ETAPAS.slice(4)].map((linha, k) => (
            <Fragment key={k}>
              {k === 1 && <div className="cps-return" aria-hidden="true" />}
              <ol className="cps-row" start={linha[0].n}>
                {linha.map((e) => (
                  <li
                    key={e.n} className={`cps-step${etapasOn.has(e.n) ? " is-on" : ""}`} tabIndex={0}
                    style={{ "--c": e.cor } as CSSProperties}
                    aria-label={`Etapa ${e.n}: ${e.texto}. ${e.body}`}
                    onPointerEnter={(ev) => { if (ev.pointerType !== "touch") ligarEtapa(ev.currentTarget, e.n); }}
                    onPointerDown={(ev) => { if (ev.pointerType === "touch") { if (ativo?.t === "etapa" && ativo.n === e.n) limpar(); else ligarEtapa(ev.currentTarget, e.n); } }}
                    onPointerLeave={sair}
                    onFocus={(ev) => ligarEtapa(ev.currentTarget, e.n)} onBlur={limpar} onKeyDown={esc}
                  >
                    <span className="cps-num" aria-hidden="true">{e.n}</span>
                    <span className="cps-box">{e.texto}</span>
                    {ativo?.t === "etapa" && ativo.n === e.n && <span className="cps-step-txt">{e.body}</span>}
                  </li>
                ))}
              </ol>
            </Fragment>
          ))}
          {jr.tip && (
            <div
              className={`cps-tip${jr.tip.above ? " above" : ""}`} role="tooltip"
              style={{ top: jr.tip.top, "--left": `${jr.tip.left}px` } as CSSProperties}
            >
              <span className="cps-tip-tag">{jr.tip.tag}</span>
              <strong className="cps-tip-title">{jr.tip.title}</strong>
              <span className="cps-tip-body">{jr.tip.body}</span>
            </div>
          )}
        </div>
        <figcaption>Oito etapas; cada uma gera um evento no banco, alimenta o CRM e atualiza o painel da diretoria.</figcaption>
      </figure>
    </div>
  );
}
