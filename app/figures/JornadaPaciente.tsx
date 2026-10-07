"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type SyntheticEvent } from "react";
import "./figures.css";
import "./jornadaPacienteFigura.css";

type Tip = { tag: string; title: string; body: string };
type TipPos = Tip & { top: number; left: number; above: boolean };

const NAVY = "#0b1a40";
const BLUE = "#0a1f8f";
const RED = "#a31621";

type Step = { n: number; name: string; sub: string; action: string; color: string };
const STEPS: Step[] = [
  { n: 1, name: "Descoberta", sub: "Busca, Maps, indicação", action: "Número-mãe por intenção; Perfil da Empresa", color: NAVY },
  { n: 2, name: "Adequação", sub: "O que o canal atende", action: "Bloco “qual canal usar”", color: NAVY },
  { n: 3, name: "Cobertura e agenda", sub: "Plano, preparo, autorização", action: "Lista textual com data", color: BLUE },
  { n: 4, name: "Chegada e atendimento", sub: "Documentos, recepção, triagem", action: "Checklist versionado", color: BLUE },
  { n: 5, name: "Depois", sub: "Resultado, retorno", action: "Horário de resposta publicado", color: RED },
  { n: 6, name: "Indicação", sub: "Avaliação ética, recomendação", action: "Protocolo de resposta", color: RED },
];

type Moment = { name: string; attention: string; decision: ReactNode; decisionText: string; steps: number[]; color: string };
const MOMENTS: Moment[] = [
  {
    name: "Antes: descoberta e dúvida",
    attention: "Informação de convênios e canais por intenção",
    decision: <>Páginas de serviço e convênios em texto. Métrica: cliques em WhatsApp por serviço <b className="jp-m">/mês</b></>,
    decisionText: "Páginas de serviço e convênios em texto. Métrica: cliques em WhatsApp por serviço por mês",
    steps: [0, 1, 2],
    color: NAVY,
  },
  {
    name: "Durante: chegada, espera e atendimento",
    attention: "Fluxo e sinalização de espera",
    decision: <>Tempo até o 1º atendimento (amostra, minutos)</>,
    decisionText: "Tempo até o 1º atendimento (amostra, minutos)",
    steps: [3],
    color: BLUE,
  },
  {
    name: "Depois: resultado, cobrança e retorno",
    attention: "Clareza de cobrança e retorno agendado",
    decision: <>NPS por WhatsApp (opt-in) e lembrete de retorno. Métrica: taxa de retorno em 90 dias</>,
    decisionText: "NPS por WhatsApp (opt-in) e lembrete de retorno. Métrica: taxa de retorno em 90 dias",
    steps: [4],
    color: RED,
  },
  {
    name: "Indicação",
    attention: "Pedido ético e sistemático de avaliação",
    decision: <>Avaliações novas <b className="jp-m">/mês</b> e % respondidas</>,
    decisionText: "Avaliações novas por mês e % respondidas",
    steps: [5],
    color: RED,
  },
];
const ROW_OF_STEP = [0, 0, 0, 1, 2, 3];

const rangeTxt = (s: number[]) => (s.length === 1 ? `Etapa ${s[0] + 1}` : `Etapas ${s[0] + 1} a ${s[s.length - 1] + 1}`);

type Active = { kind: "step"; i: number } | { kind: "row"; r: number } | null;

export default function JornadaPaciente() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipPos | null>(null);
  const [act, setAct] = useState<Active>(null);

  const show = (el: HTMLElement, above: boolean, c: Tip) => {
    const w = wrapRef.current;
    if (!w) return;
    const r = el.getBoundingClientRect();
    const wr = w.getBoundingClientRect();
    setTip({ ...c, above, top: above ? r.top - wr.top : r.bottom - wr.top, left: r.left - wr.left + r.width / 2 });
  };
  const hide = () => { setTip(null); setAct(null); };

  const stepsOn: number[] = act === null ? [] : act.kind === "step" ? [act.i] : MOMENTS[act.r].steps;
  const rowOn = act === null ? -1 : act.kind === "row" ? act.r : ROW_OF_STEP[act.i];

  return (
    <div className="jp-root" ref={wrapRef}>
      <figure className="fig">
        <ol className={`jp-steps${act ? " has-active" : ""}`} aria-label="Jornada do paciente em seis etapas">
          {STEPS.map((s, i) => {
            const on = stepsOn.includes(i);
            const enter = (e: SyntheticEvent<HTMLElement>) => {
              setAct({ kind: "step", i });
              const chip = e.currentTarget.firstElementChild as HTMLElement | null;
              show(chip ?? e.currentTarget, false, {
                tag: `ETAPA ${s.n}`,
                title: s.name,
                body: `${s.sub}. Ação de marketing e growth: ${s.action}.`,
              });
            };
            return (
              <li
                key={s.n}
                className={`jp-step${on ? " is-on" : ""}`}
                style={{ "--c": s.color, gridColumn: s.n } as CSSProperties}
                tabIndex={0}
                aria-label={`Etapa ${s.n}, ${s.name}: ${s.sub}. Ação de marketing e growth: ${s.action}.`}
                onPointerEnter={enter}
                onFocus={enter}
                onPointerLeave={hide}
                onBlur={hide}
                onKeyDown={(e: KeyboardEvent<HTMLElement>) => { if (e.key === "Escape") hide(); }}
              >
                <span className="jp-chip">{s.n} {s.name}</span>
                <span className="jp-sub">{s.sub}</span>
                <span className="jp-gap" aria-hidden="true" />
                <span className="jp-act">
                  <span className="jp-act-lbl">Ação de marketing e growth</span>
                  {s.action}
                </span>
              </li>
            );
          })}
          <li className="jp-label" aria-hidden="true">Ação de marketing e growth</li>
        </ol>

        <figcaption className="jp-cap">Jornada em seis etapas e a ação de marketing e growth correspondente.</figcaption>

        <div className="jp-tablewrap">
          <table className={`jp-tbl${act ? " has-active" : ""}`}>
            <caption className="jp-sr">Momentos da jornada, pontos de atenção, decisão e métrica</caption>
            <thead>
              <tr>
                <th scope="col">Momento</th>
                <th scope="col">Ponto de atenção</th>
                <th scope="col">Decisão e métrica</th>
              </tr>
            </thead>
            <tbody>
              {MOMENTS.map((m, r) => {
                const above = r >= MOMENTS.length - 2;
                const enter = (e: SyntheticEvent<HTMLElement>) => {
                  setAct({ kind: "row", r });
                  show(e.currentTarget, above, {
                    tag: "MOMENTO",
                    title: m.name,
                    body: `Atenção: ${m.attention}. Decisão: ${m.decisionText}. ${rangeTxt(m.steps)} da jornada.`,
                  });
                };
                return (
                  <tr
                    key={m.name}
                    className={rowOn === r ? "is-active" : ""}
                    style={{ "--c": m.color } as CSSProperties}
                    tabIndex={0}
                    aria-label={`${m.name}. Ponto de atenção: ${m.attention}. Decisão e métrica: ${m.decisionText}.`}
                    onPointerEnter={enter}
                    onFocus={enter}
                    onPointerLeave={hide}
                    onBlur={hide}
                    onKeyDown={(e: KeyboardEvent<HTMLElement>) => { if (e.key === "Escape") hide(); }}
                  >
                    <th scope="row">{m.name}</th>
                    <td data-label="Ponto de atenção">{m.attention}</td>
                    <td data-label="Decisão e métrica">{m.decision}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </figure>

      {tip ? (
        <div
          className={`jp-tip${tip.above ? " is-above" : ""}`}
          style={{ top: tip.top, "--left": `${tip.left}px` } as CSSProperties}
          role="tooltip"
        >
          <span className="jp-tip-tag">{tip.tag}</span>
          <strong className="jp-tip-tit">{tip.title}</strong>
          <span className="jp-tip-body">{tip.body}</span>
        </div>
      ) : null}
    </div>
  );
}
