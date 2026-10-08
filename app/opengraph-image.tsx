/* Imagem de compartilhamento (Open Graph) no formato 1200 × 630, com o conteúdo do HERO do site.
   O Next.js gera a imagem no build e coloca a tag og:image em todas as páginas automaticamente. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Plano de Marketing, Branding e Growth do Hospital e Maternidade São Paulo, Cacoal-RO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function logoDataUrl(): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", "assets", "HMSP_LOGO.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null; /* se o arquivo não existir, a imagem sai sem o logo, mas o build não quebra */
  }
}

export default async function Image() {
  const logo = await logoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", position: "relative",
          background: "linear-gradient(135deg, #0b1a40 0%, #0a1f8f 100%)",
          color: "#ffffff", padding: "64px 72px", fontFamily: "sans-serif",
        }}
      >
        {/* Círculos de luz, como os orbs do hero */}
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 9999, background: "rgba(83,97,196,0.35)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -200, left: 320, width: 460, height: 460, borderRadius: 9999, background: "rgba(163,22,33,0.28)", display: "flex" }} />

        {/* Texto do hero */}
        <div style={{ display: "flex", flexDirection: "column", width: 760, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 20, letterSpacing: 4, color: "#c4c7da", fontWeight: 700 }}>
            PROPOSTA DE TRABALHO
            <div style={{ width: 40, height: 2, background: "#ff9aa2", margin: "0 16px", display: "flex" }} />
            OUTUBRO DE 2026
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 30, fontSize: 56, fontWeight: 800, lineHeight: 1.12 }}>
            <div style={{ display: "flex" }}>Plano de Marketing, Branding</div>
            <div style={{ display: "flex" }}>e Growth do</div>
            <div style={{ display: "flex", color: "#ff9aa2" }}>Hospital São Paulo.</div>
          </div>

          <div style={{ display: "flex", marginTop: 24, fontSize: 24, lineHeight: 1.4, color: "#d6dbf2", width: 700 }}>
            Marketing organizado em um sistema simples: conhecer bem a praça, fortalecer a marca de família e enxergar tudo em um painel.
          </div>

          {/* Números do hero */}
          <div style={{ display: "flex", marginTop: 34 }}>
            {[
              { n: "735.852", l: "habitantes na região" },
              { n: "33", l: "especialidades" },
              { n: "desde 1996", l: "conduzido por médicos da região" },
            ].map((x, i) => (
              <div key={x.n} style={{ display: "flex", flexDirection: "column", paddingLeft: i ? 28 : 0, marginLeft: i ? 28 : 0, borderLeft: i ? "2px solid rgba(255,255,255,0.25)" : "none" }}>
                <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "#ffffff" }}>{x.n}</div>
                <div style={{ display: "flex", fontSize: 17, color: "#c4c7da", marginTop: 4 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cartão do logo, como no lado direito do hero */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end", position: "relative" }}>
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: 300, height: 340, background: "#ffffff", borderRadius: 28,
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)", padding: 28,
            }}
          >
            {logo ? (
              <img src={logo} width={230} height={200} style={{ objectFit: "contain" }} alt="" />
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 14 }}>
              <div style={{ display: "flex", fontSize: 18, color: "#0b1a40", fontWeight: 700 }}>Hospital e Maternidade</div>
              <div style={{ display: "flex", fontSize: 30, color: "#a31621", fontWeight: 800 }}>São Paulo</div>
            </div>
          </div>
        </div>

        {/* Rodapé, como a faixa inferior do hero */}
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 30, display: "flex", justifyContent: "space-between", fontSize: 17, color: "#c4c7da" }}>
          <div style={{ display: "flex" }}>Hospital e Maternidade São Paulo</div>
          <div style={{ display: "flex" }}>Cacoal, Rondônia</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
