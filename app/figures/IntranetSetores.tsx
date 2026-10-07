"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "./figures.css";
import "./intranetSetoresFigura.css";

type TipContent = { tag: string; title: string; body: string };
type Setor = { nome: string; linhas: string[]; x: number; y: number; body: string; w?: number };

/* Geometria (viewBox 760 × 410): núcleo no centro, 8 setores ao redor, como no plano. */
const W = 760, H = 410, CX = 380, CY = 222, RAIO = 68, BW = 146, BH = 48;

const SETORES: Setor[] = [
  { nome: "Recepção e atendimento", linhas: ["Recepção e", "atendimento"], x: 122, y: 80, body: "Registra contatos e agendamentos no CRM e recebe alerta quando um contato espera resposta." },
  { nome: "Enfermagem e maternidade", linhas: ["Enfermagem e", "maternidade"], x: 282, y: 46, body: "Acompanha a jornada das gestantes, o curso de gestantes e as visitas guiadas." },
  { nome: "Corpo clínico e médicos parceiros", linhas: ["Corpo clínico e", "médicos parceiros"], x: 482, y: 46, body: "Recebe e devolve encaminhamentos do Programa Médico Parceiro pelo mesmo canal." },
  { nome: "Faturamento e convênios", linhas: ["Faturamento e", "convênios"], x: 640, y: 80, body: "Confere convênio e valor dos atendimentos, sem dado clínico, e alimenta os painéis." },
  { nome: "RH e treinamento", linhas: ["RH e", "treinamento"], x: 110, y: 334, body: "Publica políticas, scripts e treinamentos na intranet." },
  { nome: "Qualidade e ouvidoria", linhas: ["Qualidade e", "ouvidoria"], x: 300, y: 364, body: "Acompanha satisfação, NPS e reclamações para corrigir a jornada." },
  { nome: "TI e programação", linhas: ["TI e", "programação"], x: 462, y: 364, body: "Mantém integrações, acessos (SSO + MFA) e o núcleo de dados funcionando." },
  { nome: "Direção e inteligência de marketing", linhas: ["Direção e", "inteligência de marketing"], x: 650, y: 334, w: 198, body: "Lê os painéis e decide na reunião semanal de funil." },
];

/* Ferramentas da camada de trabalho (texto do próprio plano, card "Intranet"). */
const FERRAMENTAS: { nome: string; body: string }[] = [
  { nome: "Teams (canais e reuniões)", body: "Canais por setor, reunião semanal de funil e plantão de dúvidas." },
  { nome: "SharePoint (documentos e indicadores)", body: "Intranet com políticas, scripts e biblioteca de marca." },
  { nome: "Planner (tarefas)", body: "Tarefas por setor e, com o Power Automate, alertas quando um contato espera resposta." },
];

const NUCLEO_TIP: TipContent = {
  tag: "Centro do sistema",
  title: "Núcleo de dados e CRM (fonte única)",
  body: "Os 8 setores leem e gravam no mesmo lugar, então cada informação existe uma única vez.",
};

/* Seta entre a borda do setor e a borda do núcleo (com folga de 5 px nas duas pontas). */
function seta(s: Setor) {
  const dx = CX - s.x, dy = CY - s.y, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const bw = s.w ?? BW;
  const tBox = Math.min(Math.abs((bw / 2) / (ux || 1e-9)), Math.abs((BH / 2) / (uy || 1e-9)));
  const a = tBox + 5, b = len - RAIO - 5;
  return { x1: s.x + ux * a, y1: s.y + uy * a, x2: s.x + ux * b, y2: s.y + uy * b };
}

type Ativo = { t: "setor"; i: number } | { t: "nucleo" } | { t: "ferr"; i: number } | null;

export default function IntranetSetores() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);

  const limpar = () => setAtivo(null);
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setAtivo(null); };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, []);

  const props = (novo: NonNullable<Ativo>, c: TipContent) => ({
    tabIndex: 0,
    role: "button",
    "aria-label": `${c.title}. ${c.body}`,
    onPointerEnter: (e: PointerEvent) => { if (e.pointerType !== "touch") setAtivo(novo); },
    onPointerDown: (e: PointerEvent) => { if (e.pointerType === "touch") setAtivo((a) => (JSON.stringify(a) === JSON.stringify(novo) ? null : novo)); },
    onPointerLeave: sair,
    onFocus: () => setAtivo(novo),
    onBlur: limpar,
    onKeyDown: esc,
  });

  const tipSetor = (i: number): TipContent => ({ tag: `Setor ${i + 1} de 8 · ligado ao núcleo`, title: SETORES[i].nome, body: SETORES[i].body });
  const tipFerr = (i: number): TipContent => ({ tag: "Camada de trabalho cotidiano · todos os setores", title: FERRAMENTAS[i].nome, body: FERRAMENTAS[i].body });

  /* Tooltip do diagrama */
  let tip: (TipContent & { x: number; y: number; dir: "up" | "down" }) | null = null;
  if (ativo?.t === "setor") {
    const s = SETORES[ativo.i], embaixo = s.y < CY;
    tip = { ...tipSetor(ativo.i), x: s.x, y: embaixo ? s.y + BH / 2 + 4 : s.y - BH / 2 - 4, dir: embaixo ? "down" : "up" };
  } else if (ativo?.t === "nucleo") {
    tip = { ...NUCLEO_TIP, x: CX, y: CY - RAIO - 4, dir: "up" };
  }

  const setorAtivo = ativo?.t === "setor" ? ativo.i : -1;
  const todos = ativo?.t === "nucleo" || ativo?.t === "ferr";
  const svgCls = ["itn-svg", setorAtivo >= 0 ? "has-setor" : "", todos ? "is-fluxo" : ""].filter(Boolean).join(" ");

  return (
    <div className="itn-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Intranet, tarefas e comunicação entre setores</p>

        <p className="itn-tools">
          {FERRAMENTAS.map((f, i) => (
            <span key={f.nome} className="itn-tool-wrap">
              {i > 0 && <span className="itn-sep" aria-hidden="true">|</span>}
              <span
                className={`itn-tool${ativo?.t === "ferr" && ativo.i === i ? " is-on" : ""}`} data-tip={f.body}
                {...props({ t: "ferr", i }, tipFerr(i))}
              >{f.nome}</span>
            </span>
          ))}
        </p>

        {/* ---------- Diagrama (desktop e tablet) ---------- */}
        <div className="itn-wrap">
          <svg className={svgCls} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Oito setores do hospital ligados, em mão dupla, ao núcleo de dados e CRM.">
            <defs>
              <marker id="itn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#0a1f8f" />
              </marker>
              <marker id="itn-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#a31621" />
              </marker>
            </defs>

            {SETORES.map((s, i) => {
              const l = seta(s), on = setorAtivo === i;
              return (
                <line
                  key={s.nome} className={`itn-arrow${on ? " is-on" : ""}`}
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke={on ? "#a31621" : "#0a1f8f"} strokeWidth={on ? 2.6 : 1.6}
                  markerStart={`url(#${on ? "itn-arrow-on" : "itn-arrow"})`} markerEnd={`url(#${on ? "itn-arrow-on" : "itn-arrow"})`}
                />
              );
            })}

            <g className={`itn-nucleo${ativo?.t === "nucleo" ? " is-on" : ""}`} {...props({ t: "nucleo" }, NUCLEO_TIP)}>
              <circle cx={CX} cy={CY} r={RAIO} fill="#0b1a40" stroke="#ffffff" strokeWidth={3} />
              <text textAnchor="middle" fontSize={14} fontWeight={700} fill="#ffffff">
                <tspan x={CX} y={CY - 14}>Núcleo de</tspan>
                <tspan x={CX} y={CY + 4}>dados e CRM</tspan>
                <tspan x={CX} y={CY + 22}>(fonte única)</tspan>
              </text>
            </g>

            {SETORES.map((s, i) => {
              const on = setorAtivo === i;
              return (
                <g key={s.nome} className={`itn-setor${on ? " is-on" : ""}`} {...props({ t: "setor", i }, tipSetor(i))}>
                  <rect x={s.x - (s.w ?? BW) / 2} y={s.y - BH / 2} width={s.w ?? BW} height={BH} rx={6} fill="#f4f5fa" stroke="#0b1a40" strokeWidth={2} />
                  <text textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#0b1a40">
                    {s.linhas.map((ln, k) => <tspan key={ln} x={s.x} y={s.y - 3 + k * 15 - (s.linhas.length - 1) * 4}>{ln}</tspan>)}
                  </text>
                </g>
              );
            })}
          </svg>

          {tip && (
            <div
              className={`itn-tip ${tip.dir}`} role="tooltip"
              style={{ top: `${(tip.y / H) * 100}%`, "--left": `${(tip.x / W) * 100}%` } as CSSProperties}
            >
              <span className="itn-tip-tag">{tip.tag}</span>
              <strong className="itn-tip-title">{tip.title}</strong>
              <span className="itn-tip-body">{tip.body}</span>
            </div>
          )}
        </div>

        {/* ---------- Celular: núcleo em cima e setores em lista ---------- */}
        <div className={`itn-mobile${todos ? " is-fluxo" : ""}`}>
          <div className={`itn-m-nucleo${ativo?.t === "nucleo" ? " is-on" : ""}`} {...props({ t: "nucleo" }, NUCLEO_TIP)}>
            <strong>Núcleo de dados e CRM (fonte única)</strong>
            {ativo?.t === "nucleo" && <span>{NUCLEO_TIP.body}</span>}
          </div>
          <ul>
            {SETORES.map((s, i) => (
              <li key={s.nome} className={setorAtivo === i ? "is-on" : ""} {...props({ t: "setor", i }, tipSetor(i))}>
                <span className="itn-m-seta" aria-hidden="true">↕</span>
                <span className="itn-m-nome">{s.nome}</span>
                {setorAtivo === i && <span className="itn-m-txt">{s.body}</span>}
              </li>
            ))}
          </ul>
        </div>

        <figcaption>Todos os setores se conectam ao núcleo de dados; Teams, SharePoint e Planner são a camada de trabalho cotidiano.</figcaption>
      </figure>
    </div>
  );
}
