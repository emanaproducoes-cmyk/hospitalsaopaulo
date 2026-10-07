"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import "./figures.css";
import "./posicionamentoFigura.css";

type TipContent = { tag: string; title: string; body: string };
type Alt = { nome: string; atributo: string; pros: string; trade: string; cor: string; chip: string; tip: TipContent };
type Elemento = { nome: string; proposta?: string; tip: TipContent };

const ALTS: Alt[] = [
  {
    nome: "A. Maternidade e família",
    atributo: "Parto humanizado, pediatria e ginecologia; ICP-1",
    pros: "Emoção forte; ativo existente; lealdade familiar",
    trade: "Capacidade e UTI neonatal precisam estar claras",
    cor: "#a31621",
    chip: "Alternativa A: a camada que diz o que a marca é.",
    tip: {
      tag: "Camada 1 · âncora emocional",
      title: "A. Maternidade e família",
      body: "Define o que a marca é e fala com o ICP-1 (família do primeiro filho). Antes de comunicar, capacidade e UTI neonatal precisam estar claras.",
    },
  },
  {
    nome: "B. Cirurgia segura com os médicos da região",
    atributo: "Centro cirúrgico e especialistas; ICP-2 e ICP-4",
    pros: "Volume e margem; explora a gestão médica",
    trade: "Depende de médicos parceiros; ortopedia é disputada",
    cor: "#0a1f8f",
    chip: "Alternativa B: a camada que explica como o hospital cresce.",
    tip: {
      tag: "Camada 2 · motor de volume",
      title: "B. Cirurgia segura com os médicos da região",
      body: "Cirurgias eletivas com a rede de médicos, para o ICP-2 (adulto maduro) e o ICP-4 (médico que interna). Depende de parceiros; ortopedia é disputada.",
    },
  },
  {
    nome: "C. Pronto atendimento claro",
    atributo: "Informação de fluxo e acesso",
    pros: "Alta demanda e visibilidade",
    trade: "Promessa 24H exige prova; urgência regulada fora do alvo",
    cor: "#4f5fc4",
    chip: "Alternativa C: a camada por onde o paciente chega.",
    tip: {
      tag: "Camada 3 · porta de entrada",
      title: "C. Pronto atendimento claro",
      body: "Informar fluxo e acesso traz demanda e visibilidade. A promessa de 24 h precisa de prova, e a urgência regulada fica fora do alvo.",
    },
  },
];

const PILARES = ["1. Família e maternidade.", "2. Médicos da região.", "3. Clareza no atendimento."];
const ASSINATURAS: { texto: string; nota?: string }[] = [
  { texto: "1) “Há mais de 50 anos, médicos cuidando de famílias de Cacoal.”", nota: "(recomendada, após validar a data)" },
  { texto: "2) “Você não está sozinho.”" },
  { texto: "3) “Cuidado de família, estrutura de hospital.”" },
  { texto: "4) “Do primeiro choro ao cuidado de toda a vida.”" },
];

const ELEMENTOS: Elemento[] = [
  { nome: "Propósito", proposta: "Cuidar de cada família de Cacoal e da região, do primeiro choro ao cuidado de toda a vida.", tip: { tag: "Plataforma · por que existimos", title: "Propósito", body: "A razão de ser do hospital. Orienta todas as outras linhas da plataforma." } },
  { nome: "Visão", proposta: "Ser o hospital em que as famílias e os médicos da região escolhem confiar, por gestão próxima, clareza e resultado medido.", tip: { tag: "Plataforma · aonde queremos chegar", title: "Visão", body: "Ser escolhido por famílias e por médicos, com resultado que pode ser medido." } },
  { nome: "Missão", proposta: "Oferecer assistência segura e humana, com corpo clínico identificado e processos claros do primeiro contato ao pós-atendimento.", tip: { tag: "Plataforma · o que fazemos todo dia", title: "Missão", body: "Como o propósito vira rotina: assistência segura e humana, do primeiro contato ao pós-atendimento." } },
  { nome: "Valores praticados", proposta: "Zelo, proximidade, clareza, responsabilidade técnica, respeito ao paciente.", tip: { tag: "Plataforma · como nos comportamos", title: "Valores praticados", body: "Cinco comportamentos que a equipe pratica e que o paciente consegue perceber no atendimento." } },
  { nome: "Promessa", proposta: "Você sabe com quem, onde e como será atendido, e não está sozinho.", tip: { tag: "Plataforma · o que o paciente recebe", title: "Promessa", body: "Um compromisso de clareza: quem atende, onde e como, sem deixar a família sozinha." } },
  { nome: "Pilares", tip: { tag: "Plataforma · ligação com as camadas", title: "Pilares", body: "Cada pilar corresponde a uma alternativa da tabela de cima: 1 ↔ A, 2 ↔ B, 3 ↔ C." } },
  { nome: "Assinaturas possíveis", tip: { tag: "Plataforma · frases de assinatura", title: "Assinaturas possíveis", body: "Quatro opções de assinatura; a primeira é a recomendada, depois de validar a data." } },
];

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

function Tip({ tip }: { tip: (TipContent & { top: number; above: boolean }) | null }) {
  if (!tip) return null;
  return (
    <div className={`psc-tip${tip.above ? " above" : ""}`} style={{ top: tip.top }} role="tooltip">
      <span className="psc-tip-tag">{tip.tag}</span>
      <strong className="psc-tip-title">{tip.title}</strong>
      <span className="psc-tip-body">{tip.body}</span>
    </div>
  );
}

export default function Posicionamento() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [alt, setAlt] = useState<number | null>(null);
  const [elem, setElem] = useState<number | null>(null);
  const tipA = useTip();
  const tipB = useTip();

  const limpar = () => { setAlt(null); setElem(null); tipA.hide(); tipB.hide(); };
  const sair = (e: PointerEvent) => { if (e.pointerType !== "touch") limpar(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") limpar(); };

  /* Toque fora da figura fecha o destaque. */
  useEffect(() => {
    const fora = (e: globalThis.PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) limpar(); };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Trecho do texto ligado a uma alternativa: acende a linha correspondente da tabela. */
  const liga = (i: number, children: ReactNode) => (
    <span
      className={`psc-link${alt === i ? " is-on" : ""}`} tabIndex={0} data-tip={ALTS[i].chip}
      style={{ "--c": ALTS[i].cor } as CSSProperties}
      onPointerEnter={() => { setAlt(i); tipA.hide(); }} onPointerLeave={sair}
      onFocus={() => { setAlt(i); tipA.hide(); }} onBlur={limpar} onKeyDown={esc}
    >{children}</span>
  );

  return (
    <div className="psc-root" ref={rootRef}>
      <figure className="fig">
        <p className="fig-heading">Posicionamento em camadas</p>

        {/* Tabela 1: alternativas */}
        <div className="psc-tblwrap" ref={tipA.wrapRef}>
          <div className="psc-tblbox">
            <table className={`psc-tbl psc-tbl-alt${alt !== null ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Alternativa</th><th scope="col">Atributo e segmento</th><th scope="col">Prós</th><th scope="col">Trade-offs</th></tr>
              </thead>
              <tbody>
                {ALTS.map((a, i) => {
                  const on = (el: HTMLElement) => { setAlt(i); setElem(null); tipB.hide(); tipA.show(el, i >= ALTS.length - 2, a.tip); };
                  return (
                    <tr
                      key={a.nome} className={alt === i ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": a.cor } as CSSProperties}
                      aria-label={`${a.tip.title}. ${a.tip.body}`}
                      onPointerEnter={(e) => on(e.currentTarget)} onPointerLeave={sair}
                      onFocus={(e) => on(e.currentTarget)} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Alternativa" className="psc-td-first">{a.nome}</td>
                      <td data-label="Atributo e segmento">{a.atributo}</td>
                      <td data-label="Prós">{a.pros}</td>
                      <td data-label="Trade-offs">{a.trade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Tip tip={tipA.tip} />
        </div>

        {/* Frase central e plataforma */}
        <div className="psc-box">
          <p className="psc-box-title">Frase central e plataforma</p>
          <p>
            Combinar em camadas:{" "}
            {liga(0, "maternidade e família como âncora emocional (o que a marca é)")},{" "}
            {liga(1, "rede de médicos e cirurgias eletivas como motor de volume (como cresce)")} e{" "}
            {liga(2, "pronto atendimento claro como porta de entrada")}. Frase central:{" "}
            <strong>“O hospital da família de Cacoal, conduzido por médicos da região desde 1996”.</strong>
          </p>
          <p>
            Opção a testar internamente:{" "}
            <span className="psc-chip" tabIndex={0} data-tip="Assinatura interna em teste: só vai a público depois dos testes de compreensão, anterioridade e revisão jurídica.">“Hospital São Paulo. Próximo passo, com clareza.”</span>{" "}
            (princípio: cada peça diz o serviço, o canal, o limite e o próximo passo; testar compreensão, anterioridade e revisão jurídica antes de publicar).
          </p>
        </div>

        {/* Tabela 2: plataforma de marca */}
        <div className="psc-tblwrap" ref={tipB.wrapRef}>
          <div className="psc-tblbox">
            <table className={`psc-tbl psc-tbl-elem${elem !== null ? " has-active" : ""}`}>
              <thead>
                <tr><th scope="col">Elemento</th><th scope="col">Proposta</th></tr>
              </thead>
              <tbody>
                {ELEMENTOS.map((el, i) => {
                  const on = (node: HTMLElement) => { setElem(i); tipA.hide(); if (el.nome !== "Pilares") setAlt(null); tipB.show(node, i >= ELEMENTOS.length - 2, el.tip); };
                  return (
                    <tr
                      key={el.nome} className={elem === i ? "is-active" : ""} tabIndex={0}
                      style={{ "--c": "#0a1f8f" } as CSSProperties}
                      aria-label={`${el.tip.title}. ${el.tip.body}`}
                      onPointerEnter={(e) => on(e.currentTarget)} onPointerLeave={sair}
                      onFocus={(e) => on(e.currentTarget)} onBlur={limpar} onKeyDown={esc}
                    >
                      <td data-label="Elemento" className="psc-td-first">{el.nome}</td>
                      <td data-label="Proposta">
                        {el.proposta}
                        {el.nome === "Pilares" && PILARES.map((p, k) => (
                          <span
                            key={p} className={`psc-pilar${alt === k ? " is-on" : ""}`}
                            style={{ "--c": ALTS[k].cor } as CSSProperties}
                            onPointerEnter={() => setAlt(k)} onPointerLeave={() => setAlt(null)}
                          >{p}{k < PILARES.length - 1 ? " " : ""}</span>
                        ))}
                        {el.nome === "Assinaturas possíveis" && ASSINATURAS.map((a, k) => (
                          <span key={a.texto} className={`psc-sig${k === 0 ? " is-rec" : ""}`}>
                            {a.texto}{a.nota && <> <em>{a.nota}</em></>}
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Tip tip={tipB.tip} />
        </div>
      </figure>
    </div>
  );
}
