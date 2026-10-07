"use client";

import { useRef, useState, type CSSProperties } from "react";
import "./figures.css";
import "./envolvidos.css";

/*
  Mapa de partes interessadas do HMSP — tabela interativa (HTML + CSS, sem bibliotecas).
  Passe o mouse (ou use Tab) em uma linha: as demais esmaecem e um tooltip resume o papel daquele público.
  Em telas pequenas, a tabela vira uma lista de cartões com rótulo em cada campo.
*/

type Row = {
  id: string;
  parte: string;
  valoriza: string;
  atende: string;
  canal: string;
  tip: string;
  color: string;
};

const rows: Row[] = [
  {
    id: "pacientes",
    parte: "Pacientes e famílias",
    valoriza: "Acolhimento, clareza, proximidade",
    atende: "Linguagem única, jornada clara, pós-atendimento",
    canal: "WhatsApp, recepção, redes",
    tip: "Famílias procuram segurança e acolhimento.",
    color: "#a31621",
  },
  {
    id: "medicos",
    parte: "Médicos parceiros",
    valoriza: "Estrutura, agenda, retorno de informação",
    atende: "Programa Médico Parceiro, página “Para médicos”",
    canal: "Reuniões, portal, WhatsApp médico",
    tip: "Médicos parceiros ampliam a confiança que o hospital já tem.",
    color: "#0a1f8f",
  },
  {
    id: "empresas",
    parte: "Empresas e cooperativas",
    valoriza: "Previsibilidade de custo, saúde ocupacional",
    atende: "Pacote empresarial e proposta única",
    canal: "Visita, reunião, proposta",
    tip: "Empresas ampliam a confiança existente e trazem previsibilidade de cuidado.",
    color: "#0a1f8f",
  },
  {
    id: "operadoras",
    parte: "Operadoras e planos",
    valoriza: "Rede credenciada e informação atualizada",
    atende: "Lista textual de convênios, mensal",
    canal: "Gestão de contratos",
    tip: "Operadoras dão sustentação ao sistema: a informação precisa estar sempre atualizada.",
    color: "#5b6180",
  },
  {
    id: "equipe",
    parte: "Equipe e corpo clínico",
    valoriza: "Reconhecimento, ferramentas, clareza",
    atende: "Intranet, treinamento, endomarketing",
    canal: "Teams, SharePoint, reuniões",
    tip: "Equipe e corpo clínico dão sustentação ao sistema todos os dias.",
    color: "#5b6180",
  },
  {
    id: "orgaos",
    parte: "Órgãos reguladores",
    valoriza: "Conformidade e segurança da informação",
    atende: "Fluxo de revisão CFM/LGPD",
    canal: "Diretor técnico, encarregado",
    tip: "Reguladores dão sustentação ao sistema: tudo passa por revisão de conformidade.",
    color: "#5b6180",
  },
];

type Tip = { id: string; top: number; above: boolean } | null;

export default function Envolvidos() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip>(null);

  const show = (row: Row, index: number, el: HTMLElement) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = el.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const above = index >= rows.length - 2; // as duas últimas linhas abrem o tooltip para cima
    setActive(row.id);
    setTip({ id: row.id, top: above ? r.top - w.top : r.bottom - w.top, above });
  };
  const hide = (id: string) => {
    setActive((cur) => (cur === id ? null : cur));
    setTip((cur) => (cur && cur.id === id ? null : cur));
  };

  const current = tip ? rows.find((r) => r.id === tip.id) : null;

  return (
    <figure className="fig fig-envolvidos">
      <p className="fig-heading">Mapa de partes interessadas</p>

      <div className="env-wrap" ref={wrapRef}>
        <div className="env-table-wrap">
          <table className={`env-table${active ? " has-active" : ""}`}>
            <thead>
              <tr>
                <th scope="col">Parte interessada</th>
                <th scope="col">O que valoriza</th>
                <th scope="col">Como o plano a atende</th>
                <th scope="col">Canal de relação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={active === row.id ? "is-active" : ""}
                  style={{ "--c": row.color } as CSSProperties}
                  tabIndex={0}
                  aria-label={`${row.parte}: ${row.tip}`}
                  onPointerEnter={(e) => show(row, i, e.currentTarget)}
                  onPointerLeave={() => hide(row.id)}
                  onFocus={(e) => show(row, i, e.currentTarget)}
                  onBlur={() => hide(row.id)}
                  onKeyDown={(e) => { if (e.key === "Escape") hide(row.id); }}
                >
                  <th scope="row">{row.parte}</th>
                  <td data-label="O que valoriza">{row.valoriza}</td>
                  <td data-label="Como o plano a atende">{row.atende}</td>
                  <td data-label="Canal de relação">{row.canal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tip && current && (
          <div
            className={`env-tip ${tip.above ? "is-above" : "is-below"}`}
            style={{ top: tip.top }}
            role="tooltip"
          >
            <span className="env-tip-tag">Parte interessada</span>
            <strong>{current.parte}</strong>
            <p>{current.tip}</p>
          </div>
        )}
      </div>

      <figcaption>Mapa de partes interessadas do HMSP: elaboração própria a partir do plano de marketing.</figcaption>
    </figure>
  );
}
