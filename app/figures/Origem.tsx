"use client";

import { useEffect, useRef, useState } from "react";
import "./figures.css";
import "./origem.css";

/*
  Linha do tempo institucional (card "Dossiê de compreensão").
  HTML + CSS, sem bibliotecas. No celular vira uma linha do tempo vertical.
*/

type Milestone = {
  id: string; year: string; text: string; side: "up" | "down";
  color: string; soft: string; tip: string;
};

const milestones: Milestone[] = [
  { id: "m1975", year: "1975", side: "up", color: "#0b1a40", soft: "rgba(11,26,64,0.16)", text: "Fundação por médico paranaense: 8 leitos e 3 médicos", tip: "O fundador abriu a porta em 1975, com 8 leitos e 3 médicos." },
  { id: "m1983", year: "1983", side: "down", color: "#0a1f8f", soft: "rgba(10,31,143,0.16)", text: "Ampliação: 15 leitos, UTI de 3 leitos, laboratório e endoscopia", tip: "Mudança de capacidade: 15 leitos, UTI de 3 leitos, laboratório e endoscopia." },
  { id: "m1996", year: "1996", side: "up", color: "#a31621", soft: "rgba(163,22,33,0.16)", text: "Grupo de nove médicos e um bioquímico assume a gestão", tip: "Desde 1996, o hospital é conduzido por médicos da região; hoje, 33 especialidades." },
  { id: "hoje", year: "Hoje", side: "down", color: "#4a5bc4", soft: "rgba(74,91,196,0.18)", text: "Hospital regional: 33 especialidades, centro cirúrgico, tomografia, maternidade e internação", tip: "Hospital regional conduzido por médicos sócios, com 33 especialidades listadas." },
];

export default function Origem() {
  const [active, setActive] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Revela a linha do tempo quando ela entra na tela
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (id: string) => setActive((cur) => (cur === id ? null : id));
  const idx = milestones.findIndex((m) => m.id === active);
  const current = idx >= 0 ? milestones[idx] : null;

  return (
    <figure className="fig fig-origem">
      <h4 className="fig-title">Histórico</h4>
      <p className="fig-heading">Linha do tempo institucional (marcos a validar com a diretoria para uso oficial)</p>

      <div ref={wrapRef} className={`tl-wrap${seen ? " is-seen" : ""}`}>
        <ol className={`tl${active ? " has-active" : ""}`}>
          {milestones.map((m, i) => (
            <li
              key={m.id}
              className={`tl-item is-${m.side}${active === m.id ? " is-active" : ""}`}
              style={{ "--c": m.color, "--soft": m.soft, "--i": i } as React.CSSProperties}
            >
              <button
                type="button"
                className="tl-btn"
                aria-pressed={active === m.id}
                aria-label={`${m.year}: ${m.text}`}
                onPointerEnter={() => setActive(m.id)}
                onPointerLeave={() => setActive((cur) => (cur === m.id ? null : cur))}
                onFocus={() => setActive(m.id)}
                onBlur={() => setActive((cur) => (cur === m.id ? null : cur))}
                onClick={() => toggle(m.id)}
                onKeyDown={(e) => { if (e.key === "Escape") setActive(null); }}
              >
                <span className="tl-arm">
                  <span className="tl-stem" aria-hidden="true" />
                  <span className="tl-year">{m.year}</span>
                  <span className="tl-text">{m.text}</span>
                </span>
                <span className="tl-dot" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>

        {current && (
          <div
            className={`tl-tip ${current.side === "up" ? "is-below" : "is-above"}`}
            style={{ "--left": `${((idx + 0.5) / milestones.length) * 100}%` } as React.CSSProperties}
            role="tooltip"
          >
            <span className="tl-tip-tag">Marco · {current.year}</span>
            <p>{current.tip}</p>
          </div>
        )}
      </div>

      <figcaption>
        Fonte: site institucional, 02/10/2026 <b className="fig-tag">[FATO]</b>. Marcos a confirmar com a diretoria para uso oficial em peças de marca.
      </figcaption>
    </figure>
  );
}
