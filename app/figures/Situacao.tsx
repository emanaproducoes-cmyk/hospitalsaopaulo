"use client";

import { useRef, useState } from "react";
import "./figures.css";
import "./situacao.css";

/*
  Mapa de situação: seis linhas de cuidado + tabela do perfil de marca.
  HTML + CSS, sem bibliotecas.
*/

type Care = { id: string; title: string; text: string; color: string; soft: string; tag: string; tip: string };

const care: Care[] = [
  { id: "materno", title: "Materno-infantil", color: "#a31621", soft: "rgba(163,22,33,0.28)", tag: "Linha de cuidado", text: "Obstetrícia, ginecologia, pediatria, Parto Humanizado, cardiopediatria", tip: "Maternidade e pediatria ancoram a marca de família." },
  { id: "cirurgia", title: "Cirurgia", color: "#0a1f8f", soft: "rgba(10,31,143,0.26)", tag: "Linha de cuidado", text: "Centro cirúrgico (eletivas, urgência e emergência), ortopedia, vascular", tip: "Corpo clínico-cirúrgico amplo é um dos diferenciais do São Paulo na praça." },
  { id: "cardio", title: "Cardiologia e nefrologia", color: "#0b1a40", soft: "rgba(11,26,64,0.26)", tag: "Linha de cuidado", text: "Consultas, exames e acompanhamento recorrente", tip: "Adulto 40–69: linhas de cuidado e continuidade." },
  { id: "pronto", title: "Pronto atendimento e internação", color: "#4a5bc4", soft: "rgba(74,91,196,0.28)", tag: "Linha de cuidado", text: "Fluxo e acesso claros; limites informados ao lado da oferta", tip: "Limites informados: sem check-up eletivo, sem observação acima de 24 h, sem garantia de vaga." },
  { id: "diagnostico", title: "Diagnóstico", color: "#2a7048", soft: "rgba(42,112,72,0.28)", tag: "Linha de cuidado", text: "Tomografia, laboratório, endoscopia", tip: "Tomografia está entre os serviços do hospital." },
  { id: "empresarial", title: "Saúde empresarial", color: "#c07f20", soft: "rgba(192,127,32,0.30)", tag: "Linha a desenvolver", text: "Check-up, saúde ocupacional e convênio empresarial (a desenvolver)", tip: "Empresas e cooperativas estão entre os públicos que decidem." },
];

const perfil: { el: string; read: string; tip: string }[] = [
  { el: "Personalidade de marca", read: "Cuidador (principal), com traço de Sábio: zelo, proximidade, clareza técnica.", tip: "Cuidador e Sábio são arquétipos de marca: orientam o tom de voz das campanhas e do atendimento." },
  { el: "Ativos proprietários", read: "Nome estabelecido, símbolo de coração em azul e vermelho, fundador, gestão médica desde 1996, corpo clínico identificado, Parto Humanizado.", tip: "Elementos que só o HMSP tem e que devem aparecer do mesmo jeito em todos os pontos de contato." },
  { el: "Públicos que decidem", read: "Famílias jovens, adultos de 40 a 69 anos, empresas e cooperativas, médicos que internam e operam.", tip: "Cada público decide de um jeito e pede uma mensagem própria." },
  { el: "Vantagem competitiva potencial", read: "“Conduzido por médicos da região desde 1996”: um argumento que concorrentes não replicam em uma semana.", tip: "A gestão médica local desde 1996 é difícil de copiar e vira argumento de marca." },
  { el: "Sensibilidade", read: "Concentração de decisão e relacionamento em poucas pessoas: o plano cria processos e equipe para que o conhecimento seja institucional.", tip: "O risco é depender de poucas pessoas; processos documentados e equipe própria reduzem esse risco." },
];

export default function Situacao() {
  const [active, setActive] = useState<string | null>(null);
  const toggle = (id: string) => setActive((cur) => (cur === id ? null : id));

  /* Tooltip da tabela: aparece colado à linha (8 px), abaixo ou acima dela */
  const tblRef = useRef<HTMLDivElement>(null);
  const [row, setRow] = useState<number | null>(null);
  const [rowTip, setRowTip] = useState<{ top: number; above: boolean } | null>(null);
  const showRow = (el: HTMLElement, i: number) => {
    const w = tblRef.current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const above = i >= perfil.length - 2;
    setRow(i);
    setRowTip({ above, top: above ? r.top - wr.top : r.bottom - wr.top });
  };
  const hideRow = () => { setRow(null); setRowTip(null); };

  return (
    <figure className="fig fig-situacao">
      <ul className={`sit-grid${active ? " has-active" : ""}`}>
        {care.map((c) => (
          <li
            key={c.id}
            className={`sit-card${active === c.id ? " is-active" : ""}`}
            style={{ "--c": c.color, "--soft": c.soft } as React.CSSProperties}
          >
            <button
              type="button"
              className="sit-btn"
              aria-pressed={active === c.id}
              aria-label={`${c.title}: ${c.text}`}
              onPointerEnter={() => setActive(c.id)}
              onPointerLeave={() => setActive((cur) => (cur === c.id ? null : cur))}
              onFocus={() => setActive(c.id)}
              onBlur={() => setActive((cur) => (cur === c.id ? null : cur))}
              onClick={() => toggle(c.id)}
              onKeyDown={(e) => { if (e.key === "Escape") setActive(null); }}
            >
              <span className="sit-head">{c.title}</span>
              <span className="sit-body">{c.text}</span>
            </button>
            {active === c.id && (
              <div className="sit-tip" role="tooltip">
                <span className="sit-tip-tag">{c.tag}</span>
                <p>{c.tip}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className="sit-caption">
        Mapa de linhas de cuidado derivado do portfólio público <b className="sit-tag">[FATO]</b>. “Saúde empresarial” é uma linha a desenvolver (ver Capítulo 11).
      </p>

      <div className="sit-table-box" ref={tblRef}>
        <div className="sit-table-wrap">
          <table className={`sit-table${row !== null ? " has-active" : ""}`}>
            <thead>
              <tr><th scope="col">Elemento do perfil</th><th scope="col">Leitura</th></tr>
            </thead>
            <tbody>
              {perfil.map((r, i) => (
                <tr
                  key={r.el} className={row === i ? "is-active" : ""} tabIndex={0}
                  aria-label={`${r.el}: ${r.read} ${r.tip}`}
                  onPointerEnter={(e) => { if (e.pointerType !== "touch") showRow(e.currentTarget, i); }}
                  onPointerLeave={(e) => { if (e.pointerType !== "touch") hideRow(); }}
                  onPointerDown={(e) => { if (e.pointerType === "touch") { if (row === i) hideRow(); else showRow(e.currentTarget, i); } }}
                  onFocus={(e) => showRow(e.currentTarget, i)} onBlur={hideRow}
                  onKeyDown={(e) => { if (e.key === "Escape") hideRow(); }}
                ><th scope="row">{r.el}</th><td>{r.read}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {row !== null && rowTip && (
          <div className={`sit-rowtip${rowTip.above ? " above" : ""}`} style={{ top: rowTip.top }} role="tooltip">
            <span className="sit-tip-tag">Perfil de marca</span>
            <strong>{perfil[row].el}</strong>
            <p>{perfil[row].tip}</p>
          </div>
        )}
      </div>
    </figure>
  );
}
