"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./figures.css";
import "./mercadoFigura.css";

/*
  Mercado dimensionado: TAM, SAM e SOM.
    1) funil de mercado, cenário base
    2) tabela top-down (TAM → SAM-1 → SAM-2 → SOM)
    3) tabela bottom-up (primária + secundária)
  Hover, foco (Tab) ou toque em qualquer linha: ela se destaca, as demais esmaecem e um tooltip explica o cálculo.
  O funil e a primeira tabela são ligados: passar em uma barra acende a linha correspondente da tabela, e vice-versa.
*/

type Src = "funnel" | "t1" | "t2";
type Active = { src: Src; id: string } | null;
type TipContent = { tag: string; title: string; body: string };
type TipState = (TipContent & { top: number; above: boolean }) | null;

const NAVY = "#0b1a40", BLUE = "#0a1f8f", LIGHT = "#5361c4", RED = "#a31621", GREY = "#9aa0bd";

/* ---------- Tooltip: posição relativa ao contêiner da figura ---------- */
function useTip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState>(null);
  const show = (el: HTMLElement, above: boolean, c: TipContent) => {
    const w = wrapRef.current;
    if (!w) return;
    const r = el.getBoundingClientRect();
    const wr = w.getBoundingClientRect();
    setTip({ ...c, above, top: above ? r.top - wr.top : r.bottom - wr.top });
  };
  const hide = () => setTip(null);
  return { wrapRef, tip, show, hide };
}

function Tip({ tip, left }: { tip: TipState; left: string }) {
  if (!tip) return null;
  return (
    <div className={`mer-tip ${tip.above ? "is-above" : "is-below"}`} style={{ top: tip.top, left }} role="tooltip">
      <span className="mer-tip-tag">{tip.tag}</span>
      <strong>{tip.title}</strong>
      <p>{tip.body}</p>
    </div>
  );
}

/* ---------- Dados: funil ---------- */
type Funil = { id: string; w: number; color: string; titulo: string; valor: string; faixa?: string; tip: TipContent };
const funil: Funil[] = [
  {
    id: "tam", w: 100, color: NAVY, titulo: "TAM | população da Macro II (estoque)", valor: "735.852",
    tip: { tag: "TAM · população", title: "735.852 pessoas na Macrorregião II", body: "Estoque de pessoas (IBGE 2022): o ponto de partida do funil. As barras mostram a ordem do funil e não estão em escala." },
  },
  {
    id: "sam1", w: 56, color: BLUE, titulo: "SAM-1 | com acesso privado (12/17/22%)", valor: "125.100", faixa: "(88.300 a 161.900)",
    tip: { tag: "SAM-1 · estoque", title: "125.100 pessoas com acesso privado", body: "TAM × acesso privado de 12% (conservador), 17% (base) ou 22% (otimista). Faixa: 88.300 a 161.900." },
  },
  {
    id: "sam2", w: 29, color: LIGHT, titulo: "SAM-2 | no alcance ativo (29,1%)", valor: "36.400", faixa: "(25.700 a 47.100)",
    tip: { tag: "SAM-2 · estoque", title: "36.400 pessoas no alcance ativo", body: "29,1% do SAM-1: as áreas primária e secundária, onde o hospital atua de forma ativa. Faixa: 25.700 a 47.100." },
  },
  {
    id: "som", w: 13, color: RED, titulo: "SOM | pacientes únicos privados por ANO", valor: "3.640", faixa: "(1.540 a 7.070)",
    tip: { tag: "SOM · fluxo por ano", title: "3.640 pacientes únicos por ano", body: "SAM-2 × captura de 6%, 10% (base) ou 15%. É fluxo, não estoque: cerca de 303 pacientes únicos por mês." },
  },
];

/* ---------- Dados: tabelas ---------- */
type Linha = { id: string; label: ReactNode; formula: string; c: string; b: string; o: string; color: string; funnel?: string; tip: TipContent };

const Est = () => <i className="mer-est">(estoque)</i>;
const Ano = () => <b className="mer-ano">/ano</b>;
const Mes = () => <b className="mer-mes">/mês</b>;

const topDown: Linha[] = [
  {
    id: "tam", label: <>TAM <Est /></>, formula: "População da Macro II (IBGE 2022)", c: "735.852", b: "735.852", o: "735.852", color: NAVY, funnel: "tam",
    tip: { tag: "TAM · estoque", title: "735.852 pessoas nos três cenários", body: "É a população inteira da Macrorregião II (IBGE 2022). Todo o funil parte desse número." },
  },
  {
    id: "acesso", label: <>Acesso privado <Est /></>, formula: "Plano 8, 11, 14% + particular 4, 6, 8%", c: "12%", b: "17%", o: "22%", color: GREY,
    tip: { tag: "Acesso privado · estoque", title: "12% · 17% · 22% da população", body: "Plano de saúde (8%, 11% e 14%) somado ao atendimento particular (4%, 6% e 8%). Define o tamanho do SAM-1." },
  },
  {
    id: "sam1", label: <>SAM-1 <Est /></>, formula: "TAM x acesso", c: "88.300", b: "125.100", o: "161.900", color: BLUE, funnel: "sam1",
    tip: { tag: "SAM-1 · estoque", title: "125.100 pessoas no cenário base", body: "TAM × acesso privado. Vai de 88.300 (conservador) a 161.900 (otimista)." },
  },
  {
    id: "sam2", label: <>SAM-2 <Est /></>, formula: "SAM-1 x 29,1% (alcance ativo)", c: "25.700", b: "36.400", o: "47.100", color: LIGHT, funnel: "sam2",
    tip: { tag: "SAM-2 · estoque", title: "36.400 pessoas no cenário base", body: "29,1% do SAM-1: o alcance ativo (primária + secundária). Vai de 25.700 a 47.100." },
  },
  {
    id: "som-ano", label: <>SOM <Ano /> (captura 6, 10, 15%)</>, formula: "SAM-2 x captura, pacientes únicos", c: "1.540", b: "3.640", o: "7.070", color: RED, funnel: "som",
    tip: { tag: "SOM · fluxo por ano", title: "3.640 pacientes únicos por ano", body: "SAM-2 × captura de 6%, 10% ou 15%. Faixa de 1.540 a 7.070 pacientes únicos." },
  },
  {
    id: "som-mes", label: <>SOM <Mes /> (equivalente)</>, formula: "SOM anual dividido por 12", c: "128", b: "303", o: "589", color: BLUE, funnel: "som",
    tip: { tag: "SOM · fluxo por mês", title: "Cerca de 303 pacientes únicos por mês", body: "SOM anual dividido por 12: de 128 a 589 por mês, o ritmo que o hospital acompanha em ciclos de 30 dias." },
  },
];

const bottomUp: Linha[] = [
  {
    id: "prim", label: <>Primária captada <Ano /></>, formula: "Pop. primária x acesso x captura 8, 14, 20%", c: "900", b: "2.220", o: "4.110", color: RED,
    tip: { tag: "Bottom-up · primária", title: "2.220 pacientes únicos por ano (base)", body: "População da área primária × acesso × captura de 8%, 14% ou 20%. Faixa de 900 a 4.110." },
  },
  {
    id: "sec", label: <>Secundária captada <Ano /></>, formula: "Pop. secundária x acesso x captura 3, 6, 10%", c: "440", b: "1.230", o: "2.660", color: BLUE,
    tip: { tag: "Bottom-up · secundária", title: "1.230 pacientes únicos por ano (base)", body: "População da área secundária × acesso × captura de 3%, 6% ou 10%. Faixa de 440 a 2.660." },
  },
  {
    id: "bu-ano", label: <>SOM bottom-up <Ano /></>, formula: "Soma (pacientes únicos)", c: "1.330", b: "3.450", o: "6.770", color: RED,
    tip: { tag: "Bottom-up · SOM por ano", title: "3.450 pacientes únicos por ano (base)", body: "Soma de primária e secundária, em pacientes únicos. Fica perto dos 3.640 do cálculo de cima para baixo." },
  },
  {
    id: "bu-mes", label: <>SOM bottom-up <Mes /> (equivalente)</>, formula: "Soma anual dividida por 12", c: "111", b: "288", o: "564", color: BLUE,
    tip: { tag: "Bottom-up · SOM por mês", title: "Cerca de 288 pacientes únicos por mês (base)", body: "Soma anual dividida por 12: de 111 a 564 por mês." },
  },
];

/* ---------- Tabela ---------- */
function Tabela({
  head, rows, src, active, setActive, isOn,
}: {
  head: string; rows: Linha[]; src: Src; active: Active; setActive: (a: Active) => void; isOn: (r: Linha) => boolean;
}) {
  const { wrapRef, tip, show, hide } = useTip();
  const anyOn = rows.some(isOn);
  const enter = (r: Linha, i: number, el: HTMLElement) => {
    setActive({ src, id: r.id });
    show(el, i >= rows.length - 2, r.tip);
  };
  const leave = () => {
    setActive(null);
    hide();
  };
  return (
    <div className="mer-tbl-box" ref={wrapRef}>
      <div className="mer-tbl-wrap">
        <table className={`mer-tbl${anyOn ? " has-active" : ""}`}>
          <thead>
            <tr>
              <th scope="col">{head}</th>
              <th scope="col">Fórmula</th>
              <th scope="col" className="mer-n">Conserv.</th>
              <th scope="col" className="mer-n">Base</th>
              <th scope="col" className="mer-n">Otimista</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                className={isOn(r) ? "is-active" : ""}
                style={{ "--c": r.color } as CSSProperties}
                tabIndex={0}
                aria-label={`${r.tip.title}. ${r.tip.body}`}
                onPointerEnter={(e) => enter(r, i, e.currentTarget)}
                onPointerLeave={leave}
                onFocus={(e) => enter(r, i, e.currentTarget)}
                onBlur={leave}
                onKeyDown={(e) => { if (e.key === "Escape") leave(); }}
              >
                <th scope="row">{r.label}</th>
                <td data-label="Fórmula">{r.formula}</td>
                <td data-label="Conserv." className="mer-n">{r.c}</td>
                <td data-label="Base" className="mer-n mer-base">{r.b}</td>
                <td data-label="Otimista" className="mer-n">{r.o}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Tip tip={tip} left="28%" />
    </div>
  );
}

/* ---------- Componente principal ---------- */
export default function Mercado() {
  const [active, setActive] = useState<Active>(null);
  const funnelTip = useTip();

  const t1 = (r: Linha) => !!active && ((active.src === "t1" && active.id === r.id) || (active.src === "funnel" && r.funnel === active.id));
  const t2 = (r: Linha) => !!active && active.src === "t2" && active.id === r.id;
  const funnelOn = (f: Funil) =>
    !!active && ((active.src === "funnel" && active.id === f.id) || (active.src === "t1" && topDown.find((r) => r.id === active.id)?.funnel === f.id));
  const funnelAny = funil.some(funnelOn);

  return (
    <div className="mer-root">
      {/* 1) Funil */}
      <figure className="fig fig-mercado">
        <p className="fig-heading">Funil de mercado, cenário base [ESTIMATIVA-MÉTODO]</p>

        <div className="mer-funnel-box" ref={funnelTip.wrapRef}>
          <ul className={`mer-funnel${funnelAny ? " has-active" : ""}`}>
            {funil.map((f, i) => (
              <li
                key={f.id}
                className={`mer-frow${funnelOn(f) ? " is-active" : ""}`}
                style={{ "--c": f.color } as CSSProperties}
                tabIndex={0}
                aria-label={`${f.tip.title}. ${f.tip.body}`}
                onPointerEnter={(e) => { setActive({ src: "funnel", id: f.id }); funnelTip.show(e.currentTarget, i >= funil.length - 1, f.tip); }}
                onPointerLeave={() => { setActive(null); funnelTip.hide(); }}
                onFocus={(e) => { setActive({ src: "funnel", id: f.id }); funnelTip.show(e.currentTarget, i >= funil.length - 1, f.tip); }}
                onBlur={() => { setActive(null); funnelTip.hide(); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setActive(null); funnelTip.hide(); } }}
              >
                <div className="mer-bar-col">
                  <span className="mer-bar" style={{ width: `${f.w}%`, background: f.color }} />
                </div>
                <div className="mer-ftext">
                  <strong>{f.titulo}</strong>
                  <span>{f.valor}{f.faixa ? <em>{f.faixa}</em> : null}</span>
                </div>
              </li>
            ))}
          </ul>
          <Tip tip={funnelTip.tip} left="46%" />
        </div>

        <figcaption>
          Cenário base <b className="mer-tag">[ESTIMATIVA-MÉTODO]</b>. TAM e SAM são populações <b className="mer-estb">(estoque)</b>; SOM é fluxo de pacientes únicos por ano.
        </figcaption>
      </figure>

      {/* 2) e 3) Tabelas */}
      <div className="mer-tables">
        <Tabela head="Camada (top-down)" rows={topDown} src="t1" active={active} setActive={setActive} isOn={t1} />
        <Tabela head="Camada (bottom-up)" rows={bottomUp} src="t2" active={active} setActive={setActive} isOn={t2} />
      </div>
    </div>
  );
}
