"use client";

import { useState, type CSSProperties } from "react";
import "./pracaTabelas.css";
import type { RegionId } from "./rondoniaPaths";

/*
  Tabelas da seção "Nossa praça": regiões de saúde da Macro II e áreas de influência.
  Passe o mouse (ou use Tab) em uma linha: ela se destaca, as outras esmaecem e, na primeira tabela,
  a região correspondente também se acende no mapa acima.
*/

type RegRow = { reg: RegionId; nome: string; muns: string; n: string; color: string };
const regRows: RegRow[] = [
  { reg: "cafe", nome: "Café", muns: "Cacoal (sede do HMSP), Espigão d’Oeste, Ministro Andreazza, Pimenta Bueno, Primavera de Rondônia, São Felipe d’Oeste", n: "6", color: "#a31621" },
  { reg: "mata", nome: "Zona da Mata", muns: "Rolim de Moura, Alta Floresta d’Oeste, Alto Alegre dos Parecis, Castanheiras, Nova Brasilândia d’Oeste, Novo Horizonte do Oeste, Santa Luzia d’Oeste, Parecis", n: "8", color: "#0a1f8f" },
  { reg: "cone", nome: "Cone Sul", muns: "Vilhena, Colorado do Oeste, Cerejeiras, Cabixi, Corumbiara, Pimenteiras do Oeste, Chupinguaia", n: "7", color: "#0b1a40" },
  { reg: "central", nome: "Central (parte)", muns: "Ji-Paraná, Ouro Preto do Oeste, Presidente Médici, Urupá, Nova União, Teixeirópolis, Vale do Paraíso, Mirante da Serra, Alvorada d’Oeste e demais", n: "10", color: "#4f5fc4" },
  { reg: "guapore", nome: "Vale do Guaporé", muns: "São Miguel do Guaporé, Seringueiras, São Francisco do Guaporé", n: "3", color: "#d99a9a" },
];

type InfRow = { nome: string; muns: string; pop: string; pct: number; pctTxt: string; color: string; total?: boolean };
const infRows: InfRow[] = [
  { nome: "Primária", muns: "Cacoal e Ministro Andreazza", pop: "93.353", pct: 12.7, pctTxt: "12,7%", color: "#a31621" },
  { nome: "Secundária", muns: "Rolim de Moura, Pimenta Bueno e Espigão d’Oeste", pop: "120.899", pct: 16.4, pctTxt: "16,4%", color: "#0a1f8f" },
  { nome: "Terciária", muns: "Restante da Macro II (inclui Ji-Paraná e Vilhena, com polos próprios)", pop: "521.600", pct: 70.9, pctTxt: "70,9%", color: "#9aa0bd" },
  { nome: "Alcance ativo", muns: "Primária + secundária: base de SAM e SOM", pop: "214.252", pct: 29.1, pctTxt: "29,1%", color: "#0b1a40", total: true },
];

export default function PracaTabelas({ activeReg, setActiveReg }: { activeReg: RegionId | null; setActiveReg: (r: RegionId | null) => void }) {
  const [activeInf, setActiveInf] = useState<string | null>(null);
  return (
    <div className="pra-tables">
      <div className="pra-tbl-wrap">
        <table className={`pra-tbl${activeReg ? " has-active" : ""}`}>
          <thead>
            <tr><th scope="col">Região de saúde (Macro II)</th><th scope="col">Municípios</th><th scope="col" className="pra-num">Nº</th></tr>
          </thead>
          <tbody>
            {regRows.map((r) => (
              <tr
                key={r.reg}
                className={activeReg === r.reg ? "is-active" : ""}
                style={{ "--c": r.color } as CSSProperties}
                tabIndex={0}
                onPointerEnter={() => setActiveReg(r.reg)}
                onPointerLeave={() => setActiveReg(null)}
                onFocus={() => setActiveReg(r.reg)}
                onBlur={() => setActiveReg(null)}
              >
                <th scope="row">{r.nome}</th>
                <td data-label="Municípios">{r.muns}</td>
                <td data-label="Nº" className="pra-num">{r.n}</td>
              </tr>
            ))}
            <tr className="pra-total" style={{ "--c": "#0b1a40" } as CSSProperties}>
              <th scope="row">Total da Macrorregião II</th>
              <td data-label="População">735.852 habitantes <b className="pra-muted">(estoque)</b> (IBGE 2022, SESAU/RO)</td>
              <td data-label="Nº" className="pra-num">34</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pra-tbl-wrap">
        <table className={`pra-tbl pra-tbl-inf${activeInf ? " has-active" : ""}`}>
          <thead>
            <tr>
              <th scope="col">Área de influência</th>
              <th scope="col">Municípios</th>
              <th scope="col" className="pra-num">População <span className="pra-muted-h">(estoque)</span></th>
              <th scope="col" className="pra-num">% Macro II</th>
            </tr>
          </thead>
          <tbody>
            {infRows.map((r) => (
              <tr
                key={r.nome}
                className={`${activeInf === r.nome ? "is-active" : ""}${r.total ? " pra-total" : ""}`}
                style={{ "--c": r.color } as CSSProperties}
                tabIndex={0}
                onPointerEnter={() => setActiveInf(r.nome)}
                onPointerLeave={() => setActiveInf((cur) => (cur === r.nome ? null : cur))}
                onFocus={() => setActiveInf(r.nome)}
                onBlur={() => setActiveInf((cur) => (cur === r.nome ? null : cur))}
              >
                <th scope="row">{r.nome}</th>
                <td data-label="Municípios">{r.muns}</td>
                <td data-label="População (estoque)" className="pra-num">{r.pop}</td>
                <td data-label="% Macro II" className="pra-num">
                  <span className="pra-pct">{r.pctTxt}</span>
                  <i className="pra-bar" aria-hidden="true"><b style={{ width: `${r.pct}%` }} /></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

