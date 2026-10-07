"use client";

import { useState } from "react";
import "./concorrencia.css";

type Risco = "alto" | "medio" | "baixo-medio";

type Linha = {
  nome: string;
  sabe: string;
  fontes?: string[];
  posicionamento: string;
  risco: Risco;
  riscoTxt: string;
};

const RISCO_INFO: Record<Risco, { nivel: number; rotulo: string; dica: string }> = {
  alto: {
    nivel: 3,
    rotulo: "Risco alto",
    dica: "Disputa diretamente as jornadas de maior peso para o São Paulo. Exige resposta de posicionamento.",
  },
  medio: {
    nivel: 2,
    rotulo: "Risco médio",
    dica: "Atua em parte da jornada ou em um serviço específico. Acompanhar e diferenciar.",
  },
  "baixo-medio": {
    nivel: 1,
    rotulo: "Risco baixo a médio",
    dica: "Nicho próprio, com pouca sobreposição. Acompanhamento periódico.",
  },
};

const LINHAS: Linha[] = [
  {
    nome: "Hospital dos Acidentados e Maternidade São Lucas",
    sabe: "Privado; ativo desde 1990; CNAE principal em urgência, com diálise, laboratório, remoção e UTI móvel. Listado na Angels Initiative (AVC).",
    fontes: ["Receita Federal", "Fato"],
    posicionamento: "Urgência, trauma e maternidade",
    risco: "alto",
    riscoTxt: "Urgência e maternidade",
  },
  {
    nome: "Hospital Geral e Ortopédico (HGO)",
    sabe: "Privado. O nome indica ortopedia.",
    fontes: ["Sebrae/RO"],
    posicionamento: "Ortopedia e cirurgia",
    risco: "medio",
    riscoTxt: "Cirurgia eletiva",
  },
  {
    nome: "Hospital Samar / Samaritano",
    sabe: "Rede privada com urgência, cirurgia, internação e diagnóstico; denominação a confirmar.",
    fontes: ["Sem acesso"],
    posicionamento: "A confirmar",
    risco: "medio",
    riscoTxt: "A confirmar",
  },
  {
    nome: "Hospital do Servidor",
    sabe: "Privado.",
    fontes: ["Sebrae/RO"],
    posicionamento: "Convênios institucionais",
    risco: "medio",
    riscoTxt: "Convênios corporativos",
  },
  {
    nome: "Hospital São Daniel Comboni",
    sabe: "Privado, com nicho de prevenção oncológica.",
    posicionamento: "Nicho especializado",
    risco: "baixo-medio",
    riscoTxt: "Nicho oncológico",
  },
  {
    nome: "CEDIM e centros de imagem",
    sabe: "Substituto de diagnóstico eletivo.",
    posicionamento: "Imagem e apoio diagnóstico",
    risco: "medio",
    riscoTxt: "Tomografia e exames",
  },
];

export default function Concorrencia() {
  const [ativo, setAtivo] = useState<number | null>(null);

  return (
    <div className="conc-tables">
      <div className="conc-legend" aria-hidden="true">
        <span className="conc-legend-k">Risco ao HMSP</span>
        <span className="conc-legend-i is-alto">Alto</span>
        <span className="conc-legend-i is-medio">Médio</span>
        <span className="conc-legend-i is-baixo-medio">Baixo a médio</span>
      </div>

      <div className="conc-wrap">
        <table className={`conc-tbl ${ativo !== null ? "has-active" : ""}`}>
          <caption className="conc-sr">
            Concorrência privada na praça: o que se sabe, posicionamento e risco ao HMSP
          </caption>
          <thead>
            <tr>
              <th scope="col">Instituição</th>
              <th scope="col">O que se sabe</th>
              <th scope="col">Posicionamento na praça</th>
              <th scope="col">Risco ao HMSP</th>
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((l, i) => {
              const info = RISCO_INFO[l.risco];
              return (
                <tr
                  key={l.nome}
                  className={`is-${l.risco} ${ativo === i ? "is-active" : ""}`}
                  tabIndex={0}
                  onMouseEnter={() => setAtivo(i)}
                  onMouseLeave={() => setAtivo(null)}
                  onFocus={() => setAtivo(i)}
                  onBlur={() => setAtivo(null)}
                >
                  <th scope="row">{l.nome}</th>

                  <td data-label="O que se sabe">
                    {l.sabe}
                    {l.fontes?.map((f) => (
                      <span className="conc-tag" key={f}>{f}</span>
                    ))}
                  </td>

                  <td data-label="Posicionamento na praça">{l.posicionamento}</td>

                  <td data-label="Risco ao HMSP" className="conc-risk-cell">
                    <span className="conc-risk" aria-describedby={`tip-${i}`}>
                      <span className="conc-meter" aria-hidden="true">
                        {[1, 2, 3].map((n) => (
                          <i key={n} className={n <= info.nivel ? "on" : ""} />
                        ))}
                      </span>
                      <span className="conc-risk-txt">
                        <b>{info.rotulo.replace("Risco ", "")}</b>: {l.riscoTxt}
                      </span>
                      <span role="tooltip" id={`tip-${i}`} className="conc-tip">
                        <strong>{info.rotulo}</strong>
                        {info.dica}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
