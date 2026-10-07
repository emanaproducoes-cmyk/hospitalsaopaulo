"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type SyntheticEvent } from "react";
import "./figures.css";
import "./pacienteIdealFigura.css";

type Col = { code: string; name: string };
type Row = { key: string; label: string; color: string; cells: [string, string] };
type Block = { cols: [Col, Col]; rows: Row[] };
type Tip = { tag: string; title: string; body: string };
type TipPos = Tip & { top: number; left: number; above: boolean };

const NAVY = "#0b1a40";
const BLUE = "#0a1f8f";
const MID = "#4f5fc4";
const RED = "#a31621";

/* Explicação curta de cada tipo de linha (texto dos tooltips). */
const NOTA: Record<string, string> = {
  quem: "Descreve quem é a pessoa ou a organização e quem participa da decisão.",
  evid: "Dados do site e fontes públicas que sustentam a escolha deste perfil.",
  jtbd: "O resultado que a pessoa quer alcançar ao procurar o hospital.",
  barr: "O que pode fazer a pessoa adiar ou desistir da escolha.",
  canal: "Por onde este perfil é alcançado e a mensagem que o plano propõe.",
  oferta: "O que o hospital oferece a este perfil.",
  premissa: "Afirmação ainda não confirmada. Só vira decisão depois da pesquisa indicada entre parênteses.",
};

const BLOCKS: Block[] = [
  {
    cols: [
      { code: "ICP-1", name: "Família do primeiro filho (prioritário)" },
      { code: "ICP-2", name: "Adulto 40 a 69 anos, recorrente e cirúrgico" },
    ],
    rows: [
      { key: "quem", label: "Quem é", color: NAVY, cells: [
        "Mulher de 25 a 39 anos e parceiro, em Cacoal, Min. Andreazza e Região Café; plano ou particular; crianças 0 a 12.",
        "Homem ou mulher de 40 a 75 anos, com plano ou particular, condição crônica ou cirurgia indicada; decisão com família cuidador.",
      ] },
      { key: "evid", label: "Evidências", color: BLUE, cells: [
        "Obstetrícia, pediatria e Parto Humanizado no site; 20-39 anos = 33,1% da população; 15,6 nascimentos por mil.",
        "Nefrologia, cardiologia e vascular no corpo clínico; 40-69 = 34,1%; 60+ de 8,2% para 13,3%; tomografia em destaque.",
      ] },
      { key: "jtbd", label: "Job-to-be-done", color: MID, cells: [
        "Parto seguro e perto de casa; sentir-se acolhida; contar a família que escolheu bem.",
        "Resolver sem viajar a Porto Velho ou Ji-Paraná; ser tratado por médico que a família conhece.",
      ] },
      { key: "barr", label: "Barreiras", color: RED, cells: [
        "Preço, cobertura por procedimento, distância e percepção de capacidade da maternidade.",
        "Autorização do plano, tempo de espera, checklist administrativo.",
      ] },
      { key: "canal", label: "Canal e mensagem", color: NAVY, cells: [
        "Instagram, WhatsApp, indicação do obstetra, curso de gestantes. “Conheça a maternidade antes do parto.”",
        "Indicação médica, Google, WhatsApp. “Cuidado contínuo perto de casa, com os médicos que você conhece.”",
      ] },
      { key: "premissa", label: "Premissa a validar", color: RED, cells: [
        "Mais de 60% chegam por indicação do obstetra (100 conversas).",
        "O especialista é o principal gatilho de escolha (30 entrevistas).",
      ] },
    ],
  },
  {
    cols: [
      { code: "ICP-3", name: "Empresa ou cooperativa (B2B)" },
      { code: "ICP-4", name: "Médico parceiro (B2B2C)" },
    ],
    rows: [
      { key: "quem", label: "Quem é", color: NAVY, cells: [
        "Cooperativas e produtores do café, comércio e serviços; decisor: sócio ou RH.",
        "Médico clínico ou cirurgião da Região Café e Zona da Mata que interna ou opera no hospital.",
      ] },
      { key: "evid", label: "Evidências", color: BLUE, cells: [
        "IG Matas de Rondônia e Rota do Café; serviços = 77,5% do valor adicionado.",
        "Gestão por nove médicos desde 1996; CRM/RQE visíveis; centro cirúrgico.",
      ] },
      { key: "oferta", label: "Oferta", color: MID, cells: [
        "Check-up, saúde ocupacional e convênio empresarial com proposta única.",
        "Fluxo de encaminhamento, agenda do centro cirúrgico e retorno de informação.",
      ] },
      { key: "premissa", label: "Premissa a validar", color: RED, cells: [
        "Cooperativas valorizam pacote sazonal na colheita (5 reuniões).",
        "Mais de 30% não sabem a capacidade do centro cirúrgico (10 entrevistas).",
      ] },
    ],
  },
];

type Active = { b: number; r: number; c: number } | null;

export default function PacienteIdeal() {
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

  const cellProps = (b: number, r: number, c: number, above: boolean) => {
    const block = BLOCKS[b];
    const row = block.rows[r];
    const col = block.cols[c];
    const enter = (e: SyntheticEvent<HTMLElement>) => {
      setAct({ b, r, c });
      show(e.currentTarget, above, { tag: col.code, title: `${row.label} · ${col.name}`, body: NOTA[row.key] });
    };
    return {
      tabIndex: 0,
      onPointerEnter: enter,
      onFocus: enter,
      onPointerLeave: hide,
      onBlur: hide,
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => { if (e.key === "Escape") hide(); },
      "aria-label": `${col.code}, ${row.label}: ${row.cells[c]} ${NOTA[row.key]}`,
    };
  };

  const blockProps = (title: string, body: string, tag: string, above: boolean) => {
    const enter = (e: SyntheticEvent<HTMLElement>) => show(e.currentTarget, above, { tag, title, body });
    return {
      tabIndex: 0,
      onPointerEnter: enter,
      onFocus: enter,
      onPointerLeave: () => setTip(null),
      onBlur: () => setTip(null),
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => { if (e.key === "Escape") setTip(null); },
      "aria-label": `${title}. ${body}`,
    };
  };

  return (
    <div className="pai-root" ref={wrapRef}>
      <figure className="fig">
        {BLOCKS.map((block, b) => (
          <div className="pai-tablewrap" key={block.cols[0].code}>
            <table className={`pai-tbl${act && act.b === b ? " has-active" : ""}`}>
              <caption className="pai-sr">{block.cols.map((c) => `${c.code} ${c.name}`).join(" e ")}</caption>
              <thead>
                <tr>
                  <th scope="col" className="pai-corner"><span className="pai-sr">Dimensão</span></th>
                  {block.cols.map((c) => <th scope="col" key={c.code}>{c.code} {c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => {
                  const above = r >= block.rows.length - 2;
                  const on = act !== null && act.b === b && act.r === r;
                  return (
                    <tr key={row.key} className={on ? "is-active" : ""} style={{ "--c": row.color } as CSSProperties}>
                      <th scope="row"><span className={row.key === "jtbd" ? "pai-nb" : undefined}>{row.label}</span></th>
                      {row.cells.map((txt, c) => (
                        <td
                          key={c}
                          data-label={`${block.cols[c].code} ${block.cols[c].name}`}
                          className={on && act !== null && act.c === c ? "is-cell" : ""}
                          {...cellProps(b, r, c, above)}
                        >
                          {txt}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <p
          className="pai-note"
          {...blockProps(
            "Personas de pesquisa",
            "São descrições para orientar entrevistas e não presumem idade, renda ou diagnóstico.",
            "PREMISSA",
            true,
          )}
        >
          Personas de pesquisa (premissas, sem presumir idade, renda ou diagnóstico): pessoa de apoio à internação; responsável por criança; pessoa em demanda eletiva com cobertura a confirmar; pessoa que precisa distinguir serviço privado de deslocamento e transporte.
        </p>

        <div
          className="pai-alert"
          {...blockProps(
            "Fora do alvo de mídia",
            "Urgência regulada e demanda sem fonte pagadora definida não recebem mídia. O hospital apenas garante informação clara de acesso.",
            "FORA DO ICP",
            true,
          )}
        >
          <p className="pai-alert-tit">FORA DO ICP</p>
          <p className="pai-alert-txt">
            Demanda de urgência regulada e demanda sem fonte pagadora definida não são alvo de mídia. O hospital apenas garante informação clara de acesso.
          </p>
        </div>
      </figure>

      {tip ? (
        <div
          className={`pai-tip${tip.above ? " is-above" : ""}`}
          style={{ top: tip.top, "--left": `${tip.left}px` } as CSSProperties}
          role="tooltip"
        >
          <span className="pai-tip-tag">{tip.tag}</span>
          <strong className="pai-tip-tit">{tip.title}</strong>
          <span className="pai-tip-body">{tip.body}</span>
        </div>
      ) : null}
    </div>
  );
}
