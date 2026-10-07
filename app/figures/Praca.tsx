"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "./praca.css";

/*
  Mapa "Nossa praça": Rondônia por regiões de saúde (Macrorregião II destacada).
  Os contornos são simplificados (desenho editorial), não cartografia oficial.
  Para limites exatos, troque os `d` por paths gerados a partir do GeoJSON do IBGE.
*/

type RegionId = "macro-i" | "vale-do-guapore" | "zona-da-mata" | "central" | "cone-sul" | "cafe";
type Sel = { kind: "region" | "city"; id: string };

type Region = {
  id: RegionId;
  name: string;
  legend: string;
  d: string;
  lines: string;
  anchor: [number, number];
  tag: string;
  text: string;
};

type City = {
  id: string;
  name: string;
  x: number; y: number;      // posição do ponto
  lx: number; ly: number;    // canto superior esquerdo do rótulo
  ex: number; ey: number;    // ponta do conector no rótulo
  region: RegionId;
  tag: string;
  text: string;
  hq?: boolean;
};

/* Área visível do SVG (viewBox) e conversão para % do contêiner */
const VB = { x: 80, y: 70, w: 960, h: 800 };
const pct = ([x, y]: [number, number]) => ({ x: ((x - VB.x) / VB.w) * 100, y: ((y - VB.y) / VB.h) * 100 });

const STATE_OUTLINE =
  "M535,97 L640,97 L665,128 L702,150 L742,185 L772,190 L790,224 L802,290 L797,316 L800,478 L935,478 L985,500 L1000,525 L985,570 L1002,600 L1018,640 L988,668 L985,705 L970,735 L945,742 L938,772 L918,800 L888,815 L848,806 L800,790 L760,790 L728,768 L742,744 L705,722 L660,716 L610,706 L560,680 L480,626 L478,660 L450,672 L420,645 L395,575 L375,482 L325,405 L322,345 L250,330 L165,322 L137,326 L180,296 L250,285 L332,262 L372,226 L430,216 L470,190 L500,160 Z";

const regions: Region[] = [
  {
    id: "macro-i", name: "Macrorregião I e demais", legend: "Macrorregião I e demais", d: STATE_OUTLINE,
    lines: "M575,205 L700,215 M610,290 L700,300 M520,270 L600,285 L690,330 M580,380 L650,400 M560,430 L620,420 M540,470 L640,470 M440,350 L520,330 M400,400 L470,420 L545,430 M690,150 L690,230 L720,300 M330,300 L400,310 L440,350",
    anchor: [470, 420], tag: "Fora da Macrorregião II", text: "Inclui Porto Velho e Ariquemes. Fica fora da área de leitura territorial do HMSP.",
  },
  {
    id: "vale-do-guapore", name: "Região Vale do Guaporé", legend: "Região Vale do Guaporé",
    d: "M540,485 L598,492 L650,520 L690,555 L650,615 L690,665 L660,716 L610,706 L560,680 L480,626 L520,600 L540,540 Z",
    lines: "M540,540 L600,555 L650,560 M598,492 L605,555 M560,620 L620,600 L650,615 M600,640 L640,680",
    anchor: [590, 600], tag: "Macrorregião II", text: "Região de saúde do sudoeste da Macrorregião II.",
  },
  {
    id: "zona-da-mata", name: "Região Zona da Mata", legend: "Região Zona da Mata",
    d: "M770,525 L772,560 L800,610 L850,605 L835,625 L820,660 L780,660 L770,720 L740,745 L705,722 L660,716 L690,665 L650,615 L690,555 L720,525 L750,515 Z",
    lines: "M720,525 L735,560 L690,580 M735,560 L770,560 M690,580 L710,630 L760,650 L780,660 M740,745 L750,700 L770,680 M690,665 L720,690 L750,700",
    anchor: [735, 640], tag: "Macrorregião II", text: "Referência no mapa: Rolim de Moura.",
  },
  {
    id: "central", name: "Região Central", legend: "Região Central",
    d: "M768,318 L798,314 L806,380 L803,475 L745,478 L725,500 L690,505 L650,520 L598,492 L650,478 L700,440 L728,400 L748,350 Z",
    lines: "M748,350 L775,400 L800,420 M728,400 L760,440 L790,445 M700,440 L715,470 L745,478 M650,500 L690,470 M690,505 L706,470",
    anchor: [770, 440], tag: "Macrorregião II", text: "Referência no mapa: Ji-Paraná e Ouro Preto do Oeste.",
  },
  {
    id: "cone-sul", name: "Região Cone Sul", legend: "Região Cone Sul",
    d: "M935,478 L985,500 L1000,525 L985,570 L1002,600 L1018,640 L988,668 L985,705 L970,735 L945,742 L938,772 L918,800 L888,815 L848,806 L800,790 L760,790 L728,768 L742,744 L770,720 L780,660 L820,660 L835,625 L850,605 L945,640 L952,610 L938,540 Z",
    lines: "M960,520 L950,570 L940,640 M850,605 L880,650 L945,640 M820,700 L880,690 L938,700 M880,690 L895,740 L945,742 M800,750 L860,745 L895,740 M900,745 L905,790",
    anchor: [900, 730], tag: "Macrorregião II", text: "Referência no mapa: Vilhena.",
  },
  {
    id: "cafe", name: "Região Café", legend: "Região Café",
    d: "M768,525 L800,478 L935,478 L938,540 L952,610 L945,640 L850,605 L800,610 L772,560 Z",
    lines: "M865,478 L862,525 L835,540 L800,555 M862,525 L935,540 M835,540 L840,575 L860,610 M815,570 L815,600 M880,610 L880,640 M862,525 L880,560 L938,580",
    anchor: [870, 545], tag: "Macrorregião II", text: "Região de saúde do HMSP. Polo: Cacoal, referência materno-infantil para os municípios vizinhos.",
  },
];

const cities: City[] = [
  { id: "porto-velho", name: "Porto Velho", x: 445, y: 249, lx: 458, ly: 222, ex: 464, ey: 244, region: "macro-i", tag: "Capital", text: "Capital de Rondônia. Fica fora da Macrorregião II." },
  { id: "ariquemes", name: "Ariquemes", x: 621, y: 343, lx: 634, ly: 316, ex: 640, ey: 338, region: "macro-i", tag: "Macrorregião I e demais", text: "Município de referência fora da Macrorregião II." },
  { id: "ji-parana", name: "Ji-Paraná", x: 769, y: 407, lx: 802, ly: 372, ex: 808, ey: 394, region: "central", tag: "Região Central", text: "Município de referência da Região Central, na Macrorregião II." },
  { id: "ouro-preto", name: "Ouro Preto", x: 732, y: 413, lx: 586, ly: 434, ex: 690, ey: 440, region: "central", tag: "Região Central", text: "Ouro Preto do Oeste, na Região Central da Macrorregião II." },
  { id: "cacoal", name: "Cacoal", x: 812, y: 535, lx: 790, ly: 486, ex: 812, ey: 508, region: "cafe", tag: "Sede do HMSP", text: "Sede do Hospital e Maternidade São Paulo. Polo da Região Café e referência materno-infantil para os vizinhos.", hq: true },
  { id: "rolim", name: "Rolim de Moura", x: 768, y: 569, lx: 543, ly: 596, ex: 686, ey: 602, region: "zona-da-mata", tag: "Região Zona da Mata", text: "Município de referência da Região Zona da Mata, na Macrorregião II." },
  { id: "pimenta", name: "Pimenta Bueno", x: 889, y: 573, lx: 793, ly: 618, ex: 880, ey: 618, region: "cafe", tag: "Região Café", text: "Município da Região Café, na Macrorregião II." },
  { id: "vilhena", name: "Vilhena", x: 957, y: 600, lx: 909, ly: 653, ex: 952, ey: 653, region: "cone-sul", tag: "Região Cone Sul", text: "Município de referência da Região Cone Sul, na Macrorregião II." },
];

const REGION_COLOR: Record<RegionId, string> = {
  "macro-i": "#9a9db3", "vale-do-guapore": "#d99a9a", "zona-da-mata": "#0a1fa0",
  central: "#5865cc", "cone-sul": "#0b1646", cafe: "#b01010",
};

const legendRegions: RegionId[] = ["cafe", "zona-da-mata", "cone-sul", "central", "vale-do-guapore", "macro-i"];
const labelWidth = (name: string) => Math.round(name.length * 8.9 + 18);

export default function Praca() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState<Sel | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const city = active?.kind === "city" ? cities.find((c) => c.id === active.id) : undefined;
  const region = active?.kind === "region" ? regions.find((r) => r.id === active.id) : undefined;
  const activeRegionId: RegionId | null = city ? city.region : region ? region.id : null;
  const activeRegion = regions.find((r) => r.id === activeRegionId);

  const info = city
    ? { tag: city.tag, title: city.name, text: city.text, color: REGION_COLOR[city.region] }
    : region
      ? { tag: region.tag, title: region.name, text: region.text, color: REGION_COLOR[region.id] }
      : null;

  const placeFromPointer = (e: PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 });
  };

  const selectRegion = (id: RegionId, e?: PointerEvent) => {
    setActive({ kind: "region", id });
    if (e) placeFromPointer(e); else setTip(pct(regions.find((r) => r.id === id)!.anchor));
  };
  const selectCity = (c: City) => {
    setActive({ kind: "city", id: c.id });
    setTip(pct([c.x, c.y]));
  };
  const clear = () => { setActive(null); setTip(null); };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") clear(); };

  const below = tip ? tip.y < 30 : false;
  const tipX = tip ? Math.min(86, Math.max(14, tip.x)) : 0;

  return (
    <div className="praca" data-in={inView ? "true" : "false"}>
      <h4 className="praca-title">Rondônia: 52 municípios e as regiões de saúde da Macrorregião II</h4>

      <div className="praca-scroll">
        <div className="praca-wrap" ref={wrapRef} onKeyDown={onKey} onPointerLeave={clear}>
          <svg
            className="praca-svg"
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            role="group"
            aria-label="Mapa de Rondônia por regiões de saúde, com a Macrorregião II e a sede do HMSP em Cacoal"
            data-active={activeRegionId ? "true" : "false"}
          >
            {/* Regiões */}
            {regions.map((r, i) => (
              <g
                key={r.id}
                className={`praca-region r-${r.id}${activeRegionId && activeRegionId !== r.id ? " is-dim" : ""}${activeRegionId === r.id ? " is-on" : ""}`}
                style={{ "--i": i } as CSSProperties}
                tabIndex={0}
                role="img"
                aria-label={`${r.name}. ${r.text}`}
                onPointerEnter={(e) => selectRegion(r.id, e)}
                onPointerMove={(e) => { if (active?.kind === "region" && active.id === r.id) placeFromPointer(e); }}
                onFocus={() => selectRegion(r.id)}
                onBlur={clear}
              >
                <path className="praca-shape" d={r.d} />
                <path className="praca-muni" d={r.lines} />
              </g>
            ))}

            {/* Contorno de destaque da região ativa */}
            {activeRegion && <path className="praca-hl" d={activeRegion.d} />}

            {/* Conectores */}
            <g className="praca-leaders">
              {cities.map((c) => (
                <g key={c.id} className={activeRegionId && c.region !== activeRegionId && active?.id !== c.id ? "is-dim" : ""}>
                  <line className="praca-leader-under" x1={c.x} y1={c.y} x2={c.ex} y2={c.ey} />
                  <line className="praca-leader" x1={c.x} y1={c.y} x2={c.ex} y2={c.ey} />
                </g>
              ))}
            </g>

            {/* Cidades: ponto + rótulo */}
            {cities.map((c, i) => {
              const w = labelWidth(c.name);
              const dim = activeRegionId !== null && c.region !== activeRegionId && active?.id !== c.id;
              const on = active?.kind === "city" && active.id === c.id;
              return (
                <g
                  key={c.id}
                  className={`praca-city${c.hq ? " is-hq" : ""}${dim ? " is-dim" : ""}${on ? " is-on" : ""}`}
                  style={{ "--i": i } as CSSProperties}
                  tabIndex={0}
                  role="img"
                  aria-label={`${c.name}. ${c.text}`}
                  onPointerEnter={() => selectCity(c)}
                  onFocus={() => selectCity(c)}
                  onBlur={clear}
                >
                  {c.hq && <circle className="praca-pulse" cx={c.x} cy={c.y} r={8} />}
                  <circle className="praca-hit" cx={c.x} cy={c.y} r={14} />
                  <circle className="praca-dot" cx={c.x} cy={c.y} r={c.hq ? 7.5 : 5} />
                  <rect className="praca-label-bg" x={c.lx} y={c.ly} width={w} height={22} rx={5} />
                  <text className="praca-label" x={c.lx + w / 2} y={c.ly + 15.5} textAnchor="middle">{c.name}</text>
                </g>
              );
            })}

            {/* Legenda */}
            <g className="praca-legend">
              <rect className="praca-legend-box" x={98} y={618} width={275} height={225} rx={6} />
              <text className="praca-legend-title" x={236} y={641} textAnchor="middle">Legenda</text>

              <g
                className={`praca-legend-row${active?.id === "cacoal" ? " is-on" : ""}`}
                tabIndex={0}
                onPointerEnter={() => selectCity(cities.find((c) => c.id === "cacoal")!)}
                onFocus={() => selectCity(cities.find((c) => c.id === "cacoal")!)}
                onBlur={clear}
              >
                <rect className="praca-row-hit" x={104} y={651} width={263} height={26} rx={4} />
                <circle className="praca-dot is-hq" cx={125} cy={664} r={7.5} />
                <text x={154} y={669.5}>Sede do HMSP (Cacoal)</text>
              </g>

              {legendRegions.map((id, i) => {
                const y = 691 + i * 27;
                const r = regions.find((x) => x.id === id)!;
                return (
                  <g
                    key={id}
                    className={`praca-legend-row${activeRegionId === id && active?.kind === "region" ? " is-on" : ""}`}
                    tabIndex={0}
                    onPointerEnter={() => selectRegion(id)}
                    onFocus={() => selectRegion(id)}
                    onBlur={clear}
                  >
                    <rect className="praca-row-hit" x={104} y={y - 13} width={263} height={26} rx={4} />
                    <rect className={`praca-swatch r-${id}`} x={107} y={y - 7} width={36} height={14} />
                    <text x={154} y={y + 5.5}>{r.legend}</text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Tooltip */}
          <div
            className={`praca-tip${info && tip ? " is-open" : ""}${below ? " is-below" : ""}`}
            style={info && tip ? ({ left: `${tipX}%`, top: `${tip.y}%`, "--c": info.color } as CSSProperties) : undefined}
            role="status"
            aria-live="polite"
          >
            {info && (
              <>
                <span className="praca-tip-tag">{info.tag}</span>
                <strong>{info.title}</strong>
                <p>{info.text}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="praca-note">
        Rondônia por regiões de saúde. Agrupamento por região conforme o Plano Regional e o RDQA da SESAU/RO <b className="praca-data">[DADO]</b>; pequenas diferenças de enquadramento devem ser conferidas com a SESAU.
      </p>
    </div>
  );
}
