"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import "./figures.css";
import "./crescimentoCompostoFigura.css";

type Linha = { label: string; valor: string; cor: string };
type TipContent = { tag: string; title: string; body?: string; linhas?: Linha[] };
type Cen = "conservador" | "base" | "agressivo";

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const fmt = (n: number) => n.toLocaleString("pt-BR");

/* Marcos do plano (mês → dia). Nesses meses os valores vêm da tabela do plano. */
const MARCOS: Record<number, string> = { 3: "D90", 4: "D120", 8: "D240", 12: "D365" };
const DIA: Record<number, number> = { 3: 90, 4: 120, 8: 240, 12: 365 };

/* Três cenários (atendimentos adicionais por mês). Meses 3, 4, 8 e 12 = tabela do plano;
   demais meses lidos do gráfico, ajustados para que a soma feche com o acumulado da tabela
   (698 / 1.396 / 2.233). */
const CENARIOS: { key: Cen; nome: string; mult: string; cor: string; v: number[] }[] = [
  { key: "conservador", nome: "Conservador", mult: "0,5", cor: "#9aa0bd", v: [0, 2, 11, 27, 34, 61, 69, 76, 92, 101, 109, 116] },
  { key: "base", nome: "Base", mult: "1,0", cor: "#0a1f8f", v: [0, 3, 22, 54, 69, 122, 138, 153, 185, 201, 217, 232] },
  { key: "agressivo", nome: "Agressivo", mult: "1,6", cor: "#a31621", v: [0, 5, 36, 86, 108, 195, 221, 245, 296, 322, 347, 372] },
];
const soma = (a: number[]) => a.reduce((s, x) => s + x, 0);
const BASE = CENARIOS[1].v;

/* Cenário base por origem (camadas empilhadas, de baixo para cima). Reconstruídas a partir do gráfico;
   a camada "Família e indicação" segue a regra do plano: 2,5% dos atendimentos acumulados até o mês anterior. */
const CAMADAS: { nome: string; cor: string; v: number[] }[] = [
  { nome: "Mídia paga", cor: "#0b1a40", v: [0, 0, 17, 38, 38, 78, 78, 78, 94, 94, 94, 94] },
  { nome: "Busca local e orgânico", cor: "#1d2fa0", v: [0, 2, 2, 7, 13, 19, 24, 29, 31, 34, 37, 40] },
  { nome: "Médicos parceiros (B2B2C)", cor: "#5361c4", v: [0, 1, 2, 5, 10, 13, 18, 22, 27, 31, 35, 39] },
  { nome: "Empresas e cooperativas", cor: "#c0832a", v: [0, 0, 1, 3, 6, 8, 11, 14, 19, 23, 27, 30] },
  { nome: "Família e indicação (loop)", cor: "#a31621", v: [0, 0, 0, 1, 2, 4, 7, 10, 14, 19, 24, 29] },
];
/* Topo acumulado de cada camada, mês a mês */
const TOPOS = CAMADAS.map((_, k) => MESES.map((_, i) => CAMADAS.slice(0, k + 1).reduce((s, c) => s + c.v[i], 0)));

const TABELA = [
  { mes: 3, rotulo: "Mês 3 (dia 90): atendimentos adicionais" },
  { mes: 4, rotulo: "Mês 4 (dia 120)" },
  { mes: 8, rotulo: "Mês 8 (dia 240)" },
  { mes: 12, rotulo: "Mês 12 (dia 365)" },
];
const ACUM = { conservador: 698, base: 1396, agressivo: 2233 } as const;

/* ---------- Geometria: gráfico da esquerda (área empilhada) ---------- */
const WL = 540, HL = 330, LX0 = 64, LX1 = 520, LTOP = 36, LBOT = 280, LMAX = 250;
const lx = (m: number) => LX0 + ((m - 0.4) / 12) * (LX1 - LX0);
const ly = (v: number) => LBOT - (v / LMAX) * (LBOT - LTOP);
/* ---------- Geometria: gráfico da direita (linhas) ---------- */
const WR = 420, HR = 330, RX0 = 50, RX1 = 372, RTOP = 36, RBOT = 280, RMAX = 350;
const rx = (m: number) => RX0 + ((m - 0.6) / 11.8) * (RX1 - RX0);
const ry = (v: number) => RBOT - (v / RMAX) * (RBOT - RTOP);

const nomeMes = (m: number) => (DIA[m] ? `Mês ${m} (dia ${DIA[m]})` : `Mês ${m}`);
const origemValor = (m: number) => (DIA[m] ? "Total confere com a tabela do plano." : "Valor aproximado, lido do gráfico do plano.");

type Ativo =
  | { t: "mes"; m: number; origem: "esq" | "dir" | "tabela" | "lista" }
  | { t: "camada"; k: number }
  | { t: "cen"; c: Cen; origem: "legenda" | "texto" }
  | { t: "acum" }
  | null;

function useTip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<(TipContent & { top: number; above: boolean }) | null>(null);
  const show = (el: HTMLElement, above: boolean, c: TipContent) => {
    const w = wrapRef.current; if (!w) return;
    const r = el.getBoundingClientRect(), wr = w.getBoundingClientRect();
    setTip({ ...c, above, top: above ? r.top - wr.top : r.bottom - wr.top });
  };
  return { wrapRef, tip, show, hide: () => setTip(null) };
}

function TipBody({ c }: { c: TipContent }) {
  return (
    <>
      <span className="ccp-tip-tag">{c.tag}</span>
      <strong className="ccp-tip-title">{c.title}</strong>
      {c.linhas && (
        <span className="ccp-tip-rows">
          {c.linhas.map((l) => (
            <span key={l.label} className="ccp-tip-row"><i style={{ background: l.cor }} />{l.label}<b>{l.valor}</b></span>
          ))}
        </span>
      )}
      {c.body && <span className="ccp-tip-body">{c.body}</span>}
    </>
  );
}

const Mes = () => <b className="ccp-mes">/mês</b>;

export default function CrescimentoComposto() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<Ativo>(null);
  const tbl = useTip();

  const limpar = () => { setAtivo(null); tbl.hide(); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };
  const entra = (e: PointerEvent, f: () => void) => { if (e.pointerType !== "touch") f(); };
  const toque = (e: PointerEvent, novo: NonNullable<Ativo>) => {
    if (e.pointerType !== "touch") return;
    setAtivo((a) => (JSON.stringify(a) === JSON.stringify(novo) ? null : novo));
  };

  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setAtivo(null); tbl.hide(); } };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mesAtivo = ativo?.t === "mes" ? ativo.m : -1;
  const camAtiva = ativo?.t === "camada" ? ativo.k : -1;
  const cenAtivo = ativo?.t === "cen" ? ativo.c : null;
  const linhaTabela = mesAtivo > 0 && DIA[mesAtivo] ? TABELA.findIndex((r) => r.mes === mesAtivo) : ativo?.t === "acum" ? TABELA.length : -1;

  /* Conteúdo dos tooltips */
  const tipEsq = (m: number): TipContent => ({
    tag: `${nomeMes(m)} · cenário base`,
    title: `${DIA[m] ? "" : "≈ "}${fmt(BASE[m - 1])} atendimentos adicionais/mês`,
    linhas: [...CAMADAS].reverse().map((c) => ({ label: c.nome, valor: `${DIA[m] ? "" : "≈"}${c.v[m - 1]}`, cor: c.cor })),
    body: `${origemValor(m)} Divisão por origem reconstruída a partir do gráfico.`,
  });
  const tipDir = (m: number): TipContent => ({
    tag: nomeMes(m),
    title: "Três cenários (por mês)",
    linhas: [...CENARIOS].reverse().map((c) => ({ label: `${c.nome} (${c.mult}×)`, valor: `${DIA[m] ? "" : "≈"}${fmt(c.v[m - 1])}`, cor: c.cor })),
    body: origemValor(m),
  });
  const tipCamada = (k: number): TipContent => {
    const c = CAMADAS[k];
    return {
      tag: "Origem dos atendimentos · cenário base",
      title: c.nome,
      body: k === 4
        ? `Termo exponencial: 2,5% dos atendimentos acumulados geram novos a cada mês. Chega a cerca de ${c.v[11]}/mês no mês 12.`
        : `Chega a cerca de ${c.v[11]} atendimentos adicionais/mês no mês 12 (${Math.round((c.v[11] / BASE[11]) * 100)}% do total base).`,
    };
  };
  const tipCen = (c: Cen): TipContent => {
    const s = CENARIOS.find((x) => x.key === c)!;
    return {
      tag: `Cenário · rampas × ${s.mult}`,
      title: s.nome,
      body: `${fmt(s.v[11])} atendimentos adicionais/mês no mês 12 e ${fmt(ACUM[c])} acumulados em 12 meses.`,
    };
  };
  const tipLinhaTabela = (m: number): TipContent => ({
    tag: "Marco do plano",
    title: nomeMes(m),
    body: `Base ${fmt(BASE[m - 1])}/mês. O conservador é a metade da base (0,5×) e o agressivo, cerca de 1,6 vez.`,
  });
  const TIP_ACUM: TipContent = {
    tag: "Soma dos 12 meses",
    title: "Acumulado em 12 meses",
    body: "Soma dos atendimentos adicionais de todos os meses do primeiro ano. Não são pacientes únicos.",
  };

  /* Tooltip de cada gráfico */
  let tipE: (TipContent & { x: number }) | null = null;
  let tipD: (TipContent & { x: number; y: number }) | null = null;
  if (ativo?.t === "mes" && ativo.origem === "esq") tipE = { ...tipEsq(ativo.m), x: lx(ativo.m) };
  if (ativo?.t === "mes" && ativo.origem === "dir") tipD = { ...tipDir(ativo.m), x: rx(ativo.m), y: RTOP };
  if (ativo?.t === "camada") tipE = { ...tipCamada(ativo.k), x: lx(9) };
  if (ativo?.t === "cen" && ativo.origem === "legenda") {
    const s = CENARIOS.find((x) => x.key === ativo.c)!;
    tipD = { ...tipCen(ativo.c), x: rx(9), y: Math.max(RTOP, ry(s.v[8]) + 12) };
  }

  const clsEsq = ["ccp-svg", camAtiva >= 0 ? "has-cam" : "", mesAtivo > 0 ? "has-mes" : ""].filter(Boolean).join(" ");
  const clsDir = ["ccp-svg", cenAtivo ? "has-cen" : "", mesAtivo > 0 ? "has-mes" : ""].filter(Boolean).join(" ");

  /* Trecho de texto ligado a um cenário */
  const ligaCen = (c: Cen, children: ReactNode) => (
    <span
      className={`ccp-link${cenAtivo === c ? " is-on" : ""}`} tabIndex={0}
      style={{ "--c": CENARIOS.find((x) => x.key === c)!.cor } as CSSProperties}
      data-tip={`${tipCen(c).body}`}
      onPointerEnter={(e) => entra(e, () => setAtivo({ t: "cen", c, origem: "texto" }))} onPointerLeave={sair}
      onPointerDown={(e) => toque(e, { t: "cen", c, origem: "texto" })}
      onFocus={() => setAtivo({ t: "cen", c, origem: "texto" })} onBlur={limpar} onKeyDown={esc}
    >{children}</span>
  );

  const pathArea = (k: number) => {
    const topo = TOPOS[k], baixo = k === 0 ? MESES.map(() => 0) : TOPOS[k - 1];
    const ida = MESES.map((m, i) => `${lx(m).toFixed(1)},${ly(topo[i]).toFixed(1)}`);
    const volta = [...MESES].reverse().map((m) => `${lx(m).toFixed(1)},${ly(baixo[m - 1]).toFixed(1)}`);
    return `M${ida.join(" L")} L${volta.join(" L")} Z`;
  };

  const colunas = (x: (m: number) => number, top: number, bot: number, origem: "esq" | "dir", passo: number) =>
    MESES.map((m) => (
      <rect
        key={m} className="ccp-col" x={x(m) - passo / 2} y={top} width={passo} height={bot - top} fill="transparent"
        tabIndex={0} role="button"
        aria-label={`${nomeMes(m)}: ${origem === "esq" ? tipEsq(m).title : CENARIOS.map((c) => `${c.nome} ${c.v[m - 1]}`).join(", ")}`}
        onPointerEnter={(e) => entra(e, () => setAtivo({ t: "mes", m, origem }))} onPointerLeave={sair}
        onPointerDown={(e) => toque(e, { t: "mes", m, origem })}
        onFocus={() => setAtivo({ t: "mes", m, origem })} onBlur={limpar} onKeyDown={esc}
      />
    ));

  const marcos = (x: (m: number) => number, top: number, bot: number) =>
    Object.entries(MARCOS).map(([m, lbl]) => (
      <g key={m} className={`ccp-marco${mesAtivo === Number(m) ? " is-on" : ""}`} aria-hidden="true">
        <line x1={x(Number(m))} y1={top} x2={x(Number(m))} y2={bot} stroke="#0b1a40" strokeWidth={1} strokeDasharray="2 3" />
        <text x={x(Number(m))} y={top - 7} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0b1a40" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">{lbl}</text>
      </g>
    ));

  return (
    <div className="ccp-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Modelo de crescimento composto</p>
        <p className="ccp-intro">
          A conta é explícita: atendimentos adicionais <Mes /> = mídia ÷ custo por contato qualificado × conversão para comparecimento + busca local + médicos parceiros + empresas + indicação.
          A indicação é o termo exponencial: assumimos que 2,5% dos atendimentos adicionais acumulados geram novo atendimento a cada mês{" "}
          <span className="ccp-chip ccp-tag" tabIndex={0} data-tip="Valor adotado pelo plano para fazer a conta; deve ser trocado por dado real assim que houver medição.">[PREMISSA]</span>.
          Os cenários multiplicam as rampas por {ligaCen("conservador", "0,5 (conservador)")}, {ligaCen("base", "1,0 (base)")} e {ligaCen("agressivo", "1,6 (agressivo)")}.
        </p>

        <div className="ccp-charts">
          {/* ---------- Esquerda: cenário base por origem ---------- */}
          <div className="ccp-chart">
            <p className="ccp-sub">Cenário base: origem dos atendimentos adicionais</p>
            <div className="ccp-chartwrap">
              <svg className={clsEsq} viewBox={`0 0 ${WL} ${HL}`} role="group" aria-label="Cenário base: atendimentos adicionais por mês, empilhados por origem, do mês 1 ao mês 12.">
                {[0, 50, 100, 150, 200, 250].map((v) => (
                  <g key={v} aria-hidden="true">
                    <line x1={LX0} y1={ly(v)} x2={LX1} y2={ly(v)} stroke="#eef0f8" strokeWidth={1} />
                    <text x={LX0 - 8} y={ly(v) + 4} textAnchor="end" fontSize={11} fill="#1c2240">{v}</text>
                  </g>
                ))}
                {CAMADAS.map((c, k) => (
                  <path
                    key={c.nome} className={`ccp-area${camAtiva === k ? " is-on" : ""}`} d={pathArea(k)} fill={c.cor} stroke="#ffffff" strokeWidth={0.6}
                    onPointerEnter={(e) => entra(e, () => setAtivo({ t: "camada", k }))} onPointerLeave={sair}
                  />
                ))}
                {marcos(lx, LTOP, LBOT)}
                <line x1={LX0} y1={LBOT} x2={LX1} y2={LBOT} stroke="#0b1a40" strokeWidth={1.2} />
                <line x1={LX0} y1={LTOP} x2={LX0} y2={LBOT} stroke="#0b1a40" strokeWidth={1.2} />
                {MESES.map((m) => (
                  <text key={m} className={`ccp-xlbl${mesAtivo === m ? " is-on" : ""}`} x={lx(m)} y={LBOT + 17} textAnchor="middle" fontSize={11} fill="#1c2240">{m}</text>
                ))}
                <text x={(LX0 + LX1) / 2} y={LBOT + 38} textAnchor="middle" fontSize={12} fill="#1c2240">mês do plano</text>
                <text transform={`translate(16 ${(LTOP + LBOT) / 2}) rotate(-90)`} textAnchor="middle" fontSize={11.5} fill="#1c2240">atendimentos adicionais por MÊS</text>

                {/* Guia do mês ativo (ligada ao gráfico da direita e à tabela) */}
                {mesAtivo > 0 && (
                  <g className="ccp-guia" aria-hidden="true">
                    <line x1={lx(mesAtivo)} y1={LTOP} x2={lx(mesAtivo)} y2={LBOT} stroke="#a31621" strokeWidth={1.5} />
                    {TOPOS.map((t, k) => <circle key={k} cx={lx(mesAtivo)} cy={ly(t[mesAtivo - 1])} r={3.5} fill={CAMADAS[k].cor} stroke="#ffffff" strokeWidth={1.5} />)}
                  </g>
                )}
                {colunas(lx, LTOP, LBOT, "esq", (LX1 - LX0) / 12)}
              </svg>
              {tipE && (
                <div className="ccp-tip" role="tooltip" style={{ top: `${((LTOP + 6) / HL) * 100}%`, "--left": `${(tipE.x / WL) * 100}%` } as CSSProperties}>
                  <TipBody c={tipE} />
                </div>
              )}
            </div>
            <div className="ccp-legend">
              {CAMADAS.map((c, k) => (
                <span
                  key={c.nome} className={`ccp-leg${camAtiva === k ? " is-on" : ""}`} tabIndex={0} role="button"
                  aria-label={`${c.nome}. ${tipCamada(k).body}`}
                  onPointerEnter={(e) => entra(e, () => setAtivo({ t: "camada", k }))} onPointerLeave={sair}
                  onPointerDown={(e) => toque(e, { t: "camada", k })}
                  onFocus={() => setAtivo({ t: "camada", k })} onBlur={limpar} onKeyDown={esc}
                ><i className="ccp-sw" style={{ background: c.cor }} />{c.nome}</span>
              ))}
            </div>
          </div>

          {/* ---------- Direita: três cenários ---------- */}
          <div className="ccp-chart">
            <p className="ccp-sub">Três cenários (por MÊS)</p>
            <div className="ccp-chartwrap">
              <svg className={clsDir} viewBox={`0 0 ${WR} ${HR}`} role="group" aria-label="Três cenários de atendimentos adicionais por mês: conservador, base e agressivo.">
                {[0, 50, 100, 150, 200, 250, 300, 350].map((v) => (
                  <g key={v} aria-hidden="true">
                    <line x1={RX0} y1={ry(v)} x2={RX1} y2={ry(v)} stroke="#eef0f8" strokeWidth={1} />
                    <text x={RX0 - 8} y={ry(v) + 4} textAnchor="end" fontSize={11} fill="#1c2240">{v}</text>
                  </g>
                ))}
                <line x1={RX0} y1={RBOT} x2={RX1} y2={RBOT} stroke="#0b1a40" strokeWidth={1.2} />
                <line x1={RX0} y1={RTOP} x2={RX0} y2={RBOT} stroke="#0b1a40" strokeWidth={1.2} />
                {[3, 6, 9, 12].map((m) => (
                  <text key={m} className={`ccp-xlbl${mesAtivo === m ? " is-on" : ""}`} x={rx(m)} y={RBOT + 17} textAnchor="middle" fontSize={11} fill="#1c2240">{m}</text>
                ))}
                <text x={(RX0 + RX1) / 2} y={RBOT + 38} textAnchor="middle" fontSize={12} fill="#1c2240">mês do plano</text>

                {mesAtivo > 0 && <line className="ccp-guia" x1={rx(mesAtivo)} y1={RTOP} x2={rx(mesAtivo)} y2={RBOT} stroke="#a31621" strokeWidth={1.5} aria-hidden="true" />}

                {CENARIOS.map((c) => (
                  <g key={c.key} className={`ccp-serie${cenAtivo === c.key ? " is-on" : ""}`}>
                    <polyline
                      points={c.v.map((v, i) => `${rx(i + 1).toFixed(1)},${ry(v).toFixed(1)}`).join(" ")}
                      fill="none" stroke={c.cor} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round"
                    />
                    {c.v.map((v, i) => (
                      <circle key={i} className={`ccp-pt${mesAtivo === i + 1 ? " is-on" : ""}`} cx={rx(i + 1)} cy={ry(v)} r={3.2} fill={c.cor} stroke="#ffffff" strokeWidth={1} />
                    ))}
                    <text x={rx(12) + 8} y={ry(c.v[11]) + 4} fontSize={12} fontWeight={700} fill="#0b1a40" stroke="#ffffff" strokeWidth={3} paintOrder="stroke">{c.v[11]}</text>
                  </g>
                ))}
                {colunas(rx, RTOP, RBOT, "dir", (RX1 - RX0) / 11.8)}
              </svg>
              {tipD && (
                <div className="ccp-tip" role="tooltip" style={{ top: `${((tipD.y + 6) / HR) * 100}%`, "--left": `${(tipD.x / WR) * 100}%` } as CSSProperties}>
                  <TipBody c={tipD} />
                </div>
              )}
            </div>
            <div className="ccp-legend">
              {CENARIOS.map((c) => (
                <span
                  key={c.key} className={`ccp-leg${cenAtivo === c.key ? " is-on" : ""}`} tabIndex={0} role="button"
                  aria-label={`${c.nome}. ${tipCen(c.key).body}`}
                  onPointerEnter={(e) => entra(e, () => setAtivo({ t: "cen", c: c.key, origem: "legenda" }))} onPointerLeave={sair}
                  onPointerDown={(e) => toque(e, { t: "cen", c: c.key, origem: "legenda" })}
                  onFocus={() => setAtivo({ t: "cen", c: c.key, origem: "legenda" })} onBlur={limpar} onKeyDown={esc}
                ><i className="ccp-ln" style={{ background: c.cor }} />{c.nome}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Celular: lista por mês com mini-barras empilhadas ---------- */}
        <ul className="ccp-list">
          {MESES.map((m) => {
            const on = mesAtivo === m;
            const total = BASE[m - 1];
            return (
              <li
                key={m} className={on ? "is-on" : ""} tabIndex={0}
                aria-label={`${nomeMes(m)}: base ${total}, conservador ${CENARIOS[0].v[m - 1]}, agressivo ${CENARIOS[2].v[m - 1]}.`}
                onClick={() => setAtivo((a) => (a?.t === "mes" && a.m === m ? null : { t: "mes", m, origem: "lista" }))}
                onKeyDown={(e) => { if (e.key === "Escape") limpar(); if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAtivo((a) => (a?.t === "mes" && a.m === m ? null : { t: "mes", m, origem: "lista" })); } }}
              >
                <p className="ccp-li-head"><span>{nomeMes(m)}{MARCOS[m] ? <em> · {MARCOS[m]}</em> : null}</span><b>{DIA[m] ? "" : "≈"}{fmt(total)}</b></p>
                <div className="ccp-li-track">
                  {CAMADAS.map((c) => <span key={c.nome} style={{ width: `${(c.v[m - 1] / BASE[11]) * 100}%`, background: c.cor }} />)}
                </div>
                <p className="ccp-li-cen">
                  {CENARIOS.map((c) => <span key={c.key}><i style={{ background: c.cor }} />{c.nome} <b>{fmt(c.v[m - 1])}</b></span>)}
                </p>
                {on && (
                  <p className="ccp-li-txt">
                    {[...CAMADAS].reverse().map((c) => <span key={c.nome}><i style={{ background: c.cor }} />{c.nome}: {c.v[m - 1]}</span>)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="ccp-cap">
          Atendimentos adicionais por mês (não são pacientes únicos). Mídia: R$ 4 mil no mês 3, 7 mil nos meses 4–5, 10 mil nos meses 6-8 e 12 mil a partir do mês 9, com custo por contato de R$ 70 a 45 e conversão de 25 a 35%{" "}
          <span className="ccp-chip ccp-tag" tabIndex={0} data-tip="Valores adotados pelo plano para fazer a conta; devem ser recalibrados a cada ciclo de 30 dias com dados reais.">[PREMISSA]</span>.
        </p>

        {/* ---------- Tabela dos marcos ---------- */}
        <div className="ccp-tblwrap" ref={tbl.wrapRef}>
          <div className="ccp-tblbox">
            <table className={`ccp-tbl${linhaTabela >= 0 ? " has-active" : ""}${cenAtivo ? ` col-${cenAtivo}` : ""}`}>
              <thead>
                <tr>
                  <th scope="col">Marco</th>
                  {CENARIOS.map((c) => <th scope="col" key={c.key} className={`ccp-c-${c.key}`}>{c.nome}</th>)}
                </tr>
              </thead>
              <tbody>
                {TABELA.map((r, i) => {
                  const c = tipLinhaTabela(r.mes);
                  const on = (el: HTMLElement) => { setAtivo({ t: "mes", m: r.mes, origem: "tabela" }); tbl.show(el, i >= TABELA.length - 1, c); };
                  return (
                    <tr
                      key={r.mes} className={linhaTabela === i ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": "#0a1f8f" } as CSSProperties}
                      aria-label={`${r.rotulo} por mês: ${CENARIOS.map((s) => `${s.nome} ${s.v[r.mes - 1]}`).join(", ")}.`}
                      onPointerEnter={(e) => on(e.currentTarget)} onPointerLeave={sair}
                      onFocus={(e) => on(e.currentTarget)} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Marco" className="ccp-td-first">{r.rotulo} <Mes /></td>
                      {CENARIOS.map((s) => <td key={s.key} data-label={s.nome} className={`ccp-num ccp-c-${s.key}`}>{fmt(s.v[r.mes - 1])}</td>)}
                    </tr>
                  );
                })}
                <tr
                  className={linhaTabela === TABELA.length ? "is-active" : ""} tabIndex={0}
                  style={{ "--c": "#a31621" } as CSSProperties}
                  aria-label={`Acumulado em 12 meses: ${CENARIOS.map((s) => `${s.nome} ${fmt(ACUM[s.key])}`).join(", ")}.`}
                  onPointerEnter={(e) => { setAtivo({ t: "acum" }); tbl.show(e.currentTarget, true, TIP_ACUM); }} onPointerLeave={sair}
                  onFocus={(e) => { setAtivo({ t: "acum" }); tbl.show(e.currentTarget, true, TIP_ACUM); }} onBlur={limpar} onKeyDown={esc}
                >
                  <td data-label="Marco" className="ccp-td-first">Acumulado em 12 meses</td>
                  {CENARIOS.map((s) => <td key={s.key} data-label={s.nome} className={`ccp-num ccp-c-${s.key}`}>{fmt(ACUM[s.key])}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          {tbl.tip && (
            <div className={`ccp-tbltip${tbl.tip.above ? " above" : ""}`} style={{ top: tbl.tip.top }} role="tooltip">
              <TipBody c={tbl.tip} />
            </div>
          )}
        </div>
      </figure>
    </div>
  );
}

/* Conferência: a soma mensal de cada cenário fecha com o acumulado da tabela. */
if (process.env.NODE_ENV !== "production") {
  CENARIOS.forEach((c) => { if (soma(c.v) !== ACUM[c.key]) console.warn(`[CrescimentoComposto] soma de ${c.nome} = ${soma(c.v)} ≠ ${ACUM[c.key]}`); });
}
