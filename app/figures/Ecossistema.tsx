"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./ecossistemaFigura.css";

type TipContent = { tag: string; title: string; body: string };
type Chip = { nome: string; row: number; body: string };
type Camada = { num: number; titulo: string; cor: string; tint: string; chips: Chip[] };

/* Linhas da tabela (índices usados para ligar o diagrama à tabela) */
const R = { canais: 0, integracao: 1, nucleo: 2, crm: 3, ia: 4, intranet: 5, bi: 6, his: 7, gov: 8 };

const CAMADAS: Camada[] = [
  {
    num: 1, titulo: "Canais de entrada", cor: "#0b1a40", tint: "rgba(11,26,64,0.035)",
    chips: [
      { nome: "Site e Perfil da Empresa", row: R.canais, body: "Site em CMS e Google Perfil da Empresa: portas de entrada da busca local." },
      { nome: "WhatsApp Business (BSP)", row: R.canais, body: "WhatsApp Business Platform via BSP oficial (ex.: Blip, Zenvia, Twilio ou Gupshup)." },
      { nome: "Telefonia IP rastreável", row: R.canais, body: "Número rastreável para saber de qual canal ou campanha veio cada ligação." },
      { nome: "Instagram, FB e QR codes", row: R.canais, body: "Redes sociais e QR codes em materiais físicos, cada um com origem identificada." },
      { nome: "Portal de médicos e empresas", row: R.canais, body: "Entrada dedicada para médicos parceiros e empresas conveniadas." },
    ],
  },
  {
    num: 2, titulo: "Camada de integração e automação (API, webhooks, filas)", cor: "#0a1f8f", tint: "rgba(10,31,143,0.035)",
    chips: [
      { nome: "Orquestrador n8n", row: R.integracao, body: "Orquestra os fluxos entre canais, banco, CRM, agenda e IA." },
      { nome: "API própria Node/Python", row: R.integracao, body: "Código do programador para o que as ferramentas prontas não fazem." },
      { nome: "Conectores HIS (HL7/FHIR)", row: R.his, body: "Ligam o sistema hospitalar (HIS/ERP) ao CRM, sem dado clínico." },
      { nome: "Fila de eventos e logs", row: R.integracao, body: "Webhooks gravam cada evento, com registro para auditoria." },
    ],
  },
  {
    num: 3, titulo: "Núcleo de dados (fonte única, região Brasil)", cor: "#5361c4", tint: "rgba(83,97,196,0.09)",
    chips: [
      { nome: "PostgreSQL (operacional)", row: R.nucleo, body: "Banco gerenciado em região Brasil: AWS São Paulo, Azure Brazil South ou Google Cloud São Paulo." },
      { nome: "Data warehouse (analítico)", row: R.nucleo, body: "Camada analítica que alimenta os painéis sem pesar no banco operacional." },
      { nome: "Dicionário de dados", row: R.nucleo, body: "Define o significado de cada campo, desde o dia 1." },
      { nome: "Backups e retenção", row: R.nucleo, body: "Cópias de segurança e prazos de guarda dos dados, com trilha de auditoria." },
    ],
  },
  {
    num: 4, titulo: "Aplicações de trabalho", cor: "#a31621", tint: "rgba(163,22,33,0.035)",
    chips: [
      { nome: "CRM e pipeline de jornadas", row: R.crm, body: "Pipeline por jornada (consulta, cirurgia, internação, maternidade, B2B) e SLA da 1ª resposta." },
      { nome: "Atendimento IA + humano", row: R.ia, body: "Assistente no WhatsApp para dúvidas administrativas, 24 horas, com passagem para uma pessoa." },
      { nome: "Intranet e tarefas (SharePoint/Planner)", row: R.intranet, body: "Documentos, indicadores e tarefas por setor, ligadas a eventos do CRM." },
      { nome: "Teams: reuniões e canais", row: R.intranet, body: "Canais por setor e reuniões, para a comunicação entre setores." },
    ],
  },
  {
    num: 5, titulo: "Inteligência de marketing e gestão", cor: "#2f7a4b", tint: "rgba(47,122,75,0.06)",
    chips: [
      { nome: "Power BI: diretoria", row: R.bi, body: "Painel da diretoria, atualizado a cada 5 a 15 minutos." },
      { nome: "Painel de marketing", row: R.bi, body: "Leitura do funil e da origem dos contatos para a equipe de marketing." },
      { nome: "Painel de operação", row: R.bi, body: "Indicadores de atendimento e operação, com dados do CRM e do sistema hospitalar." },
      { nome: "Alertas e relatório semanal", row: R.bi, body: "Alertas de guard-rails e um resumo semanal para a gestão." },
    ],
  },
];

const GOV: { nome: string; body: string }[] = [
  { nome: "LGPD art. 11 Encarregado (DPO)", body: "Encarregado de dados responsável pela conformidade com a LGPD; o art. 11 trata de dados pessoais sensíveis." },
  { nome: "RIPD de cada fluxo", body: "Relatório de Impacto à Proteção de Dados para cada fluxo que trata dados pessoais." },
  { nome: "Allowlist de eventos", body: "Só eventos aprovados previamente podem circular entre os sistemas." },
  { nome: "SSO + MFA (Entra ID)", body: "Login único com autenticação em dois fatores." },
  { nome: "Perfis de acesso e trilha de auditoria", body: "Cada pessoa vê só o que precisa, e todo acesso fica registrado." },
  { nome: "Contratos de operador", body: "Contrato com cada fornecedor que trata dados em nome do hospital." },
  { nome: "Política de IA e revisão humana", body: "Regras de uso da IA, com revisão humana das respostas." },
  { nome: "Backup, DR e auditoria externa", body: "Cópias de segurança, plano de recuperação de desastres (DR) e auditoria independente." },
];

const TAG_TIPS: Record<string, string> = {
  "[BENCHMARK, confirmar na Meta]": "Referência de mercado; o valor final deve ser confirmado na tabela oficial da Meta.",
  "[BENCHMARK]": "Referência de mercado pesquisada pelo plano; confirmar antes de contratar.",
};

type Linha = { camada: string; solucao: string; funcao: string; obs: string; cor: string; diagrama: string };
const LINHAS: Linha[] = [
  {
    camada: "Canais", cor: "#0b1a40", diagrama: "1 · Canais de entrada",
    solucao: "WhatsApp Business Platform via BSP oficial (ex.: Blip, Zenvia, Twilio ou Gupshup); Google Perfil da Empresa; telefonia IP com número rastreável; site em CMS",
    funcao: "Entrada de contatos com origem e intenção registradas desde o primeiro clique",
    obs: "Cotar BSPs; tarifas de referência: utilidade ≈ R$ 0,04–0,05 e marketing ≈ R$ 0,31–0,38 por mensagem; serviço dentro de 24 h sem custo em 2026 [BENCHMARK, confirmar na Meta]",
  },
  {
    camada: "Integração", cor: "#0a1f8f", diagrama: "2 · Integração e automação",
    solucao: "n8n (orquestração) + API própria em Node/Python + fila de eventos",
    funcao: "Conecta canais, banco, CRM, agenda e IA; webhooks gravam cada evento",
    obs: "n8n Cloud a partir de € 20/mês [BENCHMARK]; alternativa self-hosted",
  },
  {
    camada: "Núcleo de dados", cor: "#5361c4", diagrama: "3 · Núcleo de dados",
    solucao: "PostgreSQL gerenciado em região Brasil (AWS São Paulo, Azure Brazil South ou Google Cloud São Paulo) + camada analítica",
    funcao: "Fonte única: contato, origem, intenção, consentimento, histórico administrativo; sem dado clínico",
    obs: "Backups, retenção, dicionário de dados e trilha de auditoria desde o dia 1",
  },
  {
    camada: "CRM", cor: "#a31621", diagrama: "4 · Aplicações de trabalho",
    solucao: "Fase 1: RD Station CRM (Basic R$ 65,70 ou Pro R$ 117,90 por usuário/mês) ou HubSpot Free; Fase 2: módulos próprios sobre o banco, feitos pelo programador",
    funcao: "Pipeline por jornada (consulta, cirurgia, internação, maternidade, B2B), etiquetas e SLA da 1ª resposta",
    obs: "Preços pesquisados em 02/10/2026; confirmar antes de contratar",
  },
  {
    camada: "Atendimento remoto com IA", cor: "#a31621", diagrama: "4 · Aplicações de trabalho",
    solucao: "Assistente virtual no WhatsApp com modelo de linguagem via API (ex.: Claude, da Anthropic) e RAG sobre base pública aprovada; handoff humano",
    funcao: "Responde horários, convênios, preparo, curso de gestantes e agendamento administrativo, 24 horas",
    obs: "Sem diagnóstico, triagem nem dado de saúde nos prompts; contrato de operador, RIPD e revisão humana",
  },
  {
    camada: "Intranet, tarefas e reuniões", cor: "#a31621", diagrama: "4 · Aplicações de trabalho",
    solucao: "Microsoft 365: SharePoint (intranet), Teams (canais por setor e reuniões), Planner e Power Automate (tarefas e rotinas), Entra ID (SSO + MFA)",
    funcao: "Comunicação integrada entre setores; tarefas ligadas a eventos do CRM; documentos e indicadores por setor",
    obs: "Licenciamento a cotar; alternativa de tarefas: ClickUp (US$ 7 por usuário/mês) ou Trello",
  },
  {
    camada: "BI e dashboards", cor: "#2f7a4b", diagrama: "5 · Inteligência de marketing e gestão",
    solucao: "Power BI (conectado ao banco por DirectQuery e streaming) com Looker Studio como apoio gratuito; GA4, GTM e Search Console como fontes",
    funcao: "Painéis em três camadas, atualizados a cada 5 a 15 minutos; alertas de guard-rails",
    obs: "Preço de licença a cotar; “tempo real” significa atualização quase contínua",
  },
  {
    camada: "Integração com sistema hospitalar", cor: "#0a1f8f", diagrama: "2 · Integração e automação (conectores HIS)",
    solucao: "Conectores REST, HL7/FHIR ou arquivos, conforme o sistema vigente (HIS/ERP)",
    funcao: "Agenda, comparecimento, convênio e valor entram no CRM sem dado clínico",
    obs: "Mapear o fornecedor na oficina 3",
  },
  {
    camada: "Governança e segurança", cor: "#a31621", diagrama: "Coluna de governança e segurança",
    solucao: "Encarregado (DPO), RIPD, política de IA, contratos de operador, gerenciador de senhas, auditoria externa",
    funcao: "Garante conformidade com LGPD art. 11 e Resolução CFM 2.336/2023",
    obs: "Nenhuma ferramenta é integrada sem inventário, contrato e aprovação formal",
  },
];

/* Destaques: /mês em azul; etiquetas do plano em vermelho, com tooltip curto. */
function marcar(texto: string) {
  return texto.split(/(\/mês|\[BENCHMARK, confirmar na Meta\]|\[BENCHMARK\])/g).map((p, i) => {
    if (p === "/mês") return <b key={i} className="eco-mes">/mês</b>;
    if (TAG_TIPS[p]) return <span key={i} className="eco-chip eco-tag" tabIndex={0} data-tip={TAG_TIPS[p]}>{p}</span>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

type Ativo =
  | { t: "chip"; l: number; c: number }
  | { t: "camada"; l: number }
  | { t: "gov"; i: number }
  | { t: "row"; r: number }
  | null;

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

export default function Ecossistema() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);
  const dg = useTip();
  const tb = useTip();

  const limpar = () => { setAtivo(null); dg.hide(); tb.hide(); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) limpar(); };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Linhas da tabela ligadas ao que está ativo no diagrama, e vice-versa */
  const rowsAtivas = new Set<number>();
  if (ativo?.t === "chip") rowsAtivas.add(CAMADAS[ativo.l].chips[ativo.c].row);
  if (ativo?.t === "camada") CAMADAS[ativo.l].chips.forEach((c) => rowsAtivas.add(c.row));
  if (ativo?.t === "gov") rowsAtivas.add(R.gov);
  if (ativo?.t === "row") rowsAtivas.add(ativo.r);

  const chipOn = (l: number, c: number) =>
    (ativo?.t === "chip" && ativo.l === l && ativo.c === c) ||
    (ativo?.t === "camada" && ativo.l === l) ||
    (ativo?.t === "row" && CAMADAS[l].chips[c].row === ativo.r);
  const camadaOn = (l: number) => CAMADAS[l].chips.some((_, c) => chipOn(l, c));
  const govOn = (i: number) => (ativo?.t === "gov" && ativo.i === i) || (ativo?.t === "row" && ativo.r === R.gov);
  const algumNoDiagrama = ativo !== null;

  /* Liga um elemento do diagrama: destaca, abre tooltip e acende a linha da tabela */
  const ligar = (el: HTMLElement, novo: NonNullable<Ativo>, c: TipContent) => { setAtivo(novo); tb.hide(); dg.show(el, false, c); };
  const props = (novo: NonNullable<Ativo>, c: TipContent) => ({
    tabIndex: 0,
    "aria-label": `${c.title}. ${c.body}`,
    onPointerEnter: (e: PointerEvent<HTMLElement>) => { if (e.pointerType !== "touch") ligar(e.currentTarget, novo, c); },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "touch") return;
      if (JSON.stringify(ativo) === JSON.stringify(novo)) limpar(); else ligar(e.currentTarget, novo, c);
    },
    onPointerLeave: sair,
    onFocus: (e: FocusEvent<HTMLElement>) => ligar(e.currentTarget, novo, c),
    onBlur: limpar,
    onKeyDown: esc,
  });

  return (
    <div className="eco-root" ref={rootRef}>
      {/* ---------- Diagrama em camadas ---------- */}
      <figure className="fig">
        <p className="fig-heading">Ecossistema digital em cinco camadas</p>
        <div className={`eco-diagram${algumNoDiagrama ? " has-active" : ""}`} ref={dg.wrapRef}>
          <div className="eco-stack">
            {CAMADAS.map((cam, l) => (
              <section
                key={cam.num} className={`eco-layer${camadaOn(l) ? " is-on" : ""}`}
                style={{ "--c": cam.cor, "--tint": cam.tint } as CSSProperties}
              >
                <p
                  className="eco-layer-title" role="button"
                  {...props({ t: "camada", l }, {
                    tag: `Camada ${cam.num} de 5`,
                    title: cam.titulo,
                    body: `${cam.chips.length} componentes: ${cam.chips.map((c) => c.nome).join("; ")}.`,
                  })}
                >{cam.num} {cam.titulo}</p>
                <div className="eco-chips" style={{ "--n": cam.chips.length } as CSSProperties}>
                  {cam.chips.map((ch, c) => (
                    <span
                      key={ch.nome} className={`eco-box${chipOn(l, c) ? " is-on" : ""}`} role="button"
                      {...props({ t: "chip", l, c }, { tag: `Camada ${cam.num} · ${cam.titulo.split(" (")[0]}`, title: ch.nome, body: ch.body })}
                    >{ch.nome}</span>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className={`eco-gov${GOV.some((_, i) => govOn(i)) ? " is-on" : ""}`}>
            <p className="eco-gov-title">Governança e segurança</p>
            <ul>
              {GOV.map((g, i) => (
                <li
                  key={g.nome} className={govOn(i) ? "is-on" : ""} role="button"
                  {...props({ t: "gov", i }, { tag: "Governança e segurança · vale para todas as camadas", title: g.nome, body: g.body })}
                >{g.nome}</li>
              ))}
            </ul>
          </aside>

          {dg.tip && (
            <div
              className={`eco-tip${dg.tip.above ? " above" : ""}`} role="tooltip"
              style={{ top: dg.tip.top, "--left": `${dg.tip.left}px` } as CSSProperties}
            >
              <span className="eco-tip-tag">{dg.tip.tag}</span>
              <strong className="eco-tip-title">{dg.tip.title}</strong>
              <span className="eco-tip-body">{dg.tip.body}</span>
            </div>
          )}
        </div>
      </figure>

      {/* ---------- Tabela única de componentes ---------- */}
      <figure className="fig">
        <p className="fig-heading">Componentes, softwares e como funcionam juntos</p>
        <div className="eco-tblwrap" ref={tb.wrapRef}>
          <div className="eco-tblbox">
            <table className={`eco-tbl${rowsAtivas.size ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Camada</th><th scope="col">Solução sugerida</th><th scope="col">Função no ecossistema</th><th scope="col">Observações</th></tr>
              </thead>
              <tbody>
                {LINHAS.map((ln, r) => {
                  const c: TipContent = { tag: "No diagrama acima", title: ln.diagrama, body: `${ln.camada}: ${ln.funcao}.` };
                  const on = (el: HTMLElement) => { setAtivo({ t: "row", r }); dg.hide(); tb.show(el, r >= LINHAS.length - 3, c); };
                  return (
                    <tr
                      key={ln.camada} className={rowsAtivas.has(r) ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": ln.cor } as CSSProperties}
                      aria-label={`${ln.camada}. Solução: ${ln.solucao}. Função: ${ln.funcao}. Observações: ${ln.obs}.`}
                      onPointerEnter={(e) => { if (e.pointerType !== "touch") on(e.currentTarget); }} onPointerLeave={sair}
                      onFocus={(e) => { if (e.target === e.currentTarget) on(e.currentTarget); }} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Camada" className="eco-td-first">{ln.camada}</td>
                      <td data-label="Solução sugerida">{marcar(ln.solucao)}</td>
                      <td data-label="Função no ecossistema">{ln.funcao}</td>
                      <td data-label="Observações" className="eco-td-obs">{marcar(ln.obs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tb.tip && (
            <div className={`eco-tbltip${tb.tip.above ? " above" : ""}`} style={{ top: tb.tip.top }} role="tooltip">
              <span className="eco-tip-tag">{tb.tip.tag}</span>
              <strong className="eco-tip-title">{tb.tip.title}</strong>
              <span className="eco-tip-body">{tb.tip.body}</span>
            </div>
          )}
        </div>
      </figure>
    </div>
  );
}
