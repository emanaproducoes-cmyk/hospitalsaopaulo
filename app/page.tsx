"use client";

import { useEffect, useRef, useState } from "react";
import "./globals.css";
import "./hero-soft.css";
import "./dossie.css";

type CardKind = "timeline" | "rings" | "quadrants" | "stakeholders" | "map" | "bars" | "funnel" | "line" | "radar" | "palette" | "position" | "voice" | "growth" | "loops" | "layers" | "tools" | "journey" | "assistant" | "hub" | "dashboard" | "gantt" | "org" | "steps" | "training" | "scale";
type CardData = { id: string; title: string; benefit: string; kind: CardKind; eyebrow?: string; sentence: string; read: string; bullets: string[]; technical: string; tag: string };
type SectionData = { id: string; number: string; eyebrow: string; title: string; message: string; cards: CardData[] };

const sections: SectionData[] = [
  {
    id: "hospital", number: "01", eyebrow: "PRIMEIRO, ENTENDER O HOSPITAL", title: "O próximo passo começa por escutar o que já existe.", message: "Antes de propor qualquer coisa, mapeamos quem é o São Paulo, onde ele atua e o que o cerca.",
    cards: [
      { id: "origem", title: "Dossiê de compreensão", benefit: "Você vê o fio que conecta passado e próximo passo.", kind: "timeline", sentence: "O Hospital e Maternidade São Paulo (HMSP) tem mais de quatro décadas de presença em Cacoal e é conduzido desde 1996 por um grupo de médicos sócios. A vantagem do hospital não é tamanho: é ser a casa de médicos locais e de famílias da praça. Este PLANO DE MARKETING organiza esse capital em um sistema de crescimento: marca de família com linguagem única, rede de médicos e empresas parceiras, equipe interna de marketing e um ecossistema digital de inteligência que coloca toda a informação diante da diretoria.", read: "Cada marco representa uma mudança de capacidade, gestão ou presença. O hoje nasce de decisões que atravessaram gerações.", bullets: ["1975: fundação com 8 leitos e 3 médicos.", "1983: 15 leitos, UTI de 3 leitos, laboratório e endoscopia.", "1996: médicos da região assumem a gestão; hoje, 33 especialidades."], technical: " Datas e marcos consolidados no dossiê do plano.", tag: "Dossiê + linha do tempo" },
      { id: "ambiente", title: "Mapa de ambiente", benefit: "Você entende as forças que mexem com cada decisão.", kind: "rings", sentence: "O HMSP nasceu pequeno (8 leitos, 3 médicos) e cresceu junto com Cacoal até se tornar um hospital regional conduzido por médicos sócios. Sua comunicação é afetiva (“zelo”, “Conte com a gente. Você não está sozinho”) e seu ativo mais raro é a confiança construída por médicos da região. Este dossiê reúne, em um só lugar, quem é o hospital, de onde vem, o ambiente em que atua, a situação em que está e a praça que serve, como base comum para todas as decisões do plano.", read: "O anel interno mostra relações diretas. O anel externo reúne movimentos demográficos, econômicos, sociais, tecnológicos e regulatórios.", bullets: ["Pacientes, médicos, empresas, operadoras e equipe formam o entorno direto.", "Cacoal conecta a Macrorregião II e áreas de influência.", "O plano transforma contexto em escolha, não em complexidade."], technical: "[DADO] Estrutura de ambiente e stakeholders do plano v3.0.", tag: "Mapa de ambiente" },
      { id: "situacao", title: "Mapa de situação", benefit: "Você separa força, oportunidade e atenção.", kind: "quadrants", sentence: "A história do HMSP combina duas forças: um fundador que abriu a porta em 1975 e, desde 1996, um médico de formação que assumiu a gestão. Isso coloca a decisão clínica e a decisão comercial próximas, um traço de proximidade e relacionamento que o plano trata como diferencial de marca.", read: "O quadrante não julga o hospital. Ele ajuda a equipe a priorizar conversas, evidências e próximos movimentos.", bullets: ["Forças: confiança local, história e corpo clínico.", "Oportunidades: maternidade, pediatria, médicos e empresas.", "Espaço de evolução: linguagem, dados e integração de canais."], technical: " Mapa qualitativo para validar nas oficinas.", tag: "Mapa de situação" },
      { id: "envolvidos", title: "Mapa de partes interessadas", benefit: "Você vê quem precisa estar na mesma conversa.", kind: "stakeholders", sentence: "Cada público tem uma necessidade e uma forma própria de criar confiança.", read: "O mapa dá nome às relações que sustentam jornadas mais claras, do primeiro contato à continuidade.", bullets: ["Famílias procuram segurança e acolhimento.", "Médicos parceiros e empresas ampliam a confiança existente.", "Equipe, operadoras e reguladores dão sustentação ao sistema."], technical: " Stakeholders listados no dossiê e no plano de crescimento.", tag: "Partes interessadas" },
      { id: "praca", title: "Nossa praça", benefit: "Você enxerga o território que o plano quer alcançar.", kind: "map", sentence: "Cacoal é a terceira maior cidade da Macrorregião II, polo da Região Café e referência materno-infantil para vizinhos. A população envelhece e a renda é sensível, o que estreita o mercado privado alcançável: o crescimento virá de convênios corporativos, alcance regional e eficiência, mais do que de volume genérico.", read: "A leitura territorial combina população, acesso privado e áreas de influência. O objetivo é escolher melhor onde cada esforço faz sentido.", bullets: ["735.852 habitantes na Macrorregião II (população, foto de 2022).", "214.252 de alcance ativo são uma hipótese de planejamento.", "Cacoal atrai nascimentos de outras localidades da região."], technical: "[DADO] SESAU/RO e Censo 2022;  alcance ativo.", tag: "Macrorregião II" },
      { id: "competicao", title: "Concorrência privada na praça", benefit: "Você posiciona o São Paulo sem imitar ninguém.", kind: "position", sentence: "O HMSP compete na praça com prestadores privados, por jornada e por serviço. O concorrente mais visível em urgência e maternidade é o Hospital dos Acidentados e Maternidade São Lucas. O São Paulo vence onde é diferente: gestão médica, corpo clínico-cirúrgico amplo e proximidade com famílias e empresas.", read: "O mapa de posicionamento cruza proximidade de marca e amplitude de cuidado. Ele orienta diferenciação com responsabilidade.", bullets: ["Maternidade e pediatria ancoram a marca de família.", "Urgência regulada não é a arena prioritária.", "Concorrentes são referência de leitura, não de cópia."], technical: "[DADO] Concorrência privada observada em fontes públicas; validar em oficina.", tag: "Mapa de posicionamento" },
    ]
  },
  {
    id: "mercado", number: "02", eyebrow: "MERCADO E PACIENTE", title: "Precisão antes de alcance.", message: "O mercado privado de Cacoal é menor do que parece. É por isso que precisamos ser mais precisos.",
    cards: [
      { id: "mercado", title: "Mercado dimensionado: TAM, SAM e SOM", benefit: "Você vê a oportunidade em uma leitura só.", kind: "funnel", sentence: "Com dados públicos, o dimensionamento é uma triangulação em duas abordagens e três faixas. O resultado mais importante é uma forma: o mercado privado acessível ao HMSP tem milhares de pessoas (estoque) e dezenas de partos por mês. Como o hospital planeja em ciclos de 30 dias, cada grandeza anual vem com o equivalente mensal.", read: "O funil parte de 735.852 pessoas e chega a uma oportunidade base de 3.640 pacientes únicos por ano, cerca de 303 por mês.", bullets: ["735.852 habitantes na Macro II.", "125.100 pessoas em alcance de planejamento.", "3.640 pacientes únicos por ano ≈ 303 por mês, cenário base."], technical: "[ESTIMATIVA-MÉTODO] Faixas: 1.540 a 6.770 pacientes únicos por ano.", tag: "Funil TAM / SAM / SOM" },
      { id: "natalidade", title: "Natalidade na Macrorregião II", benefit: "Você identifica a força local da maternidade.", kind: "line", sentence: "Rondônia registrou 24.738 nascidos vivos em 2022 (por ano), taxa bruta de 15,6 por mil, acima da brasileira [FONTE: IBGE, Registro Civil; cálculo próprio]. A série do SINASC mostra queda contínua: 23.830 (2023), 21.518 (2024) e 20.227 (2025) por ano, ou cerca de 1.986, 1.793 e 1.686 por mês. Cacoal funciona como polo materno-infantil: em 2024 nasceram 1.798 bebês no município (150/mês) contra 1.258 filhos de mães residentes (105/mês).", read: "A linha mostra uma oportunidade de entender atração regional sem prometer demanda automática.", bullets: ["1.798 nascimentos em Cacoal em 2024 (150/mês), contra 1.258 de mães residentes (105/mês).", "A cidade recebe famílias de fora da residência local.", "A maternidade é uma âncora para linguagem de família."], technical: "[DADO] Nascimentos e atração de Cacoal, plano v3.0.", tag: "Janela de oportunidade" },
      { id: "paciente-ideal", title: "ICP, consumidor e jornada", benefit: "Você sabe para quem falar primeiro.", kind: "bars", sentence: "O hospital atende quatro públicos que decidem de formas diferentes: a família do primeiro filho, o adulto maduro com cuidado recorrente ou cirurgia eletiva, a empresa ou cooperativa e o médico que interna. O ICP prioritário é a família jovem de Cacoal e da Região Café com plano ou renda para particular, porque casa três coisas verificadas: especialidades listadas, estrutura etária e natalidade.", read: "Quatro perfis orientam mensagens e parcerias: família do primeiro filho, adulto 40–69, empresa/cooperativa e médico parceiro.", bullets: ["Família do primeiro filho: maternidade e pediatria.", "Adulto 40–69: linhas de cuidado e continuidade.", "Empresas e médicos: confiança que chega ao paciente."], technical: " Perfis a validar com entrevistas e dados do CRM.", tag: "4 perfis prioritários" },
      { id: "jornada", title: "Jornada do paciente", benefit: "Você encontra o melhor momento para ajudar.", kind: "journey", sentence: "A jornada em saúde é decidida em dois momentos: o primeiro contato (a resposta chega em minutos e resolve?) e a primeira recepção (o prometido é o que acontece?). A prioridade é desenhar e medir esses dois momentos ao ampliar o alcance.", read: "Um caminho claro permite medir origem, intenção e passagem para uma pessoa, sempre respeitando CFM e LGPD.", bullets: ["Descobrir, considerar e conversar.", "Agendar, comparecer e continuar.", "Cada etapa recebe uma mensagem e um dado."], technical: "[RECOMENDAÇÃO] Jornadas qualificadas concluídas por mês como número que mais importa.", tag: "6 etapas" },
    ]
  },
  {
    id: "marca", number: "03", eyebrow: "MARCA", title: "Fazer os ativos raros aparecerem do mesmo jeito.", message: "O São Paulo já tem história, médicos e vínculos. O passo seguinte é dar unidade a cada ponto de contato.",
    cards: [
      { id: "forca-marca", title: "Brand equity, identidade e posicionamento", benefit: "Você transforma percepção em conversa objetiva.", kind: "radar", sentence: "A marca do HMSP tem ativos raros (nome estabelecido, símbolo de coração em azul e vermelho, fundador, gestão médica, corpo clínico identificado). A recomendação é fortalecer a distinção (médicos da região, família) e padronizar a expressão da marca em todos os pontos de contato.", read: "A partida 5,7 e a meta 7,5 são hipóteses de trabalho. O número só ganha sentido ao ser medido com pessoas reais.", bullets: ["Seis dimensões formam o ponto de partida.", "5,7 → 7,5 é uma meta de planejamento, não promessa.", "Entrevistas e sinais digitais recalibram a leitura."], technical: " Brand equity inicial 5,7 e meta 7,5.", tag: "Radar 6 dimensões" },
      { id: "posicionamento", title: "Posicionamento", benefit: "Você diz em uma frase por que o São Paulo existe.", kind: "position", sentence: "“O hospital da família de Cacoal, conduzido por médicos da região desde 1996”. Há mais de 40 anos, cuidando das famílias de Cacoal. Posicionamento: O CUIDADOR.", read: "A frase une proximidade, história e liderança médica. Ela orienta campanhas, parcerias e atendimento sem usar superlativos.", bullets: ["Família: proximidade e acolhimento.", "Cacoal: presença e praça de atuação.", "Médicos da região: confiança e continuidade."], technical: "[RECOMENDAÇÃO] Posicionamento defendido no plano v3.0.", tag: "Frase de posicionamento" },
    ]
  },
  {
    id: "crescimento", number: "04", eyebrow: "PLANO DE CRESCIMENTO", title: "Crescer em etapas, medindo cada passo.", message: "Investimento avança quando os freios de segurança estão verdes e o próximo movimento está claro.",
    cards: [
      { id: "gerar", title: "Plano diretor de growth", benefit: "Você compara cenários antes de liberar investimento.", kind: "growth", sentence: "Crescimento exponencial, escalável e alcançável nasce de sistemas que se alimentam: processos, integrações e tecnologias. O plano diretor integra marca, linguagem, relacionamento, conteúdo, eventos, mídia e dados em oito pilares, com quatro horizontes e metas verificáveis.", read: "São atendimentos adicionais por mês, não pacientes únicos. A estimativa é recalibrada a cada ciclo de 30 dias.", bullets: ["Oito pilares do plano diretor ao longo de 365 dias.", "O Plano Diretor está planejado para um ciclo de 30, 90, 120, 240 e 365 dias.", "Os processos são bem definidos e estruturados."], technical: " Faixa de projeção do plano; não representa pacientes únicos.", tag: "3 cenários / mês" },
    ]
  },
  {
    id: "digital", number: "05", eyebrow: "ECOSSISTEMA DIGITAL", title: "Uma informação chega, se conecta e aparece para decidir.", message: "Um único lugar onde toda informação chega, se conecta e vai parar no painel da diretoria.",
    cards: [
      { id: "camadas", title: "Transformação do Ecossistema Digital", benefit: "Você enxerga o sistema sem precisar ser técnico.", kind: "layers", sentence: "O Ecossistema Digital de Inteligência de Marketing é o ambiente onde informação, dados e comunicação se encontram: canais de entrada alimentam um núcleo de dados único; CRM, atendimento remoto com IA, intranet, tarefas e reuniões trabalham sobre essa base; e o BI entrega à diretoria, em tempo quase real, o retrato do funil, da operação e dos guard-rails. Assim, nenhuma informação relevante deixa de chegar à diretoria e ao setor de Inteligência de Marketing. O programa é executado por um programador fullstack externo, em parceria com a equipe interna.", read: "Não é trocar tudo de uma vez. É fazer cada peça conversar com a próxima e deixar rastros úteis.", bullets: ["Canais: site, Perfil da Empresa e WhatsApp.", "Dados: agenda inteligente de contatos e origem.", "Painel de controle da diretoria: leitura para decisão."], technical: "[RECOMENDAÇÃO] CRM, GA4, GTM, IA, intranet e BI com guard-rails.", tag: "5 camadas" },
      { id: "ferramentas", title: "Componentes e softwares", benefit: "Você sabe para que serve cada investimento.", kind: "tools", sentence: "Cada ferramenta entra por uma função simples: captar, organizar, entender ou decidir.", read: "A tabela traduz o stack para o cotidiano do hospital e permite escolher por etapa.", bullets: ["CRM: todo o histórico em um só lugar.", "BI: painel de controle da diretoria.", "Assistente virtual: dúvidas administrativas; clínica vai para uma pessoa."], technical: "[RECOMENDAÇÃO] Ferramentas sugeridas no ecossistema digital.", tag: "Tabela traduzida" },
      { id: "intranet", title: "Intranet, tarefas e comunicação", benefit: "Você conecta setores, tarefas e indicadores em uma rotina comum.", kind: "hub", sentence: "Teams, SharePoint, Planner e Power Automate dão um lugar para cada setor trabalhar e devolver informação ao núcleo de dados.", read: "A intranet organiza políticas, playbooks e calendário; os canais de Teams aproximam setores; tarefas e alertas fecham o ciclo.", bullets: ["Teams: canais por setor, reunião semanal de funil e plantão de dúvidas.", "SharePoint: intranet com políticas, scripts e biblioteca de marca.", "Planner e Power Automate: tarefas por setor e alertas quando um contato espera resposta."], technical: "[RECOMENDAÇÃO] Microsoft 365; alternativa de tarefas: ClickUp ou Trello. Fonte: plano v3.0, p. 36.", tag: "Trabalho entre setores" },
      { id: "contato", title: "Jornada de um contato no ecossistema", benefit: "Você acompanha cada passagem sem perder o contexto.", kind: "journey", sentence: "Oito passos levam uma intenção registrada até a continuidade do relacionamento.", read: "O fluxo trata contato como pessoa: mede, orienta e passa para uma pessoa quando a dúvida pede cuidado humano.", bullets: ["Origem → intenção → triagem → resposta.", "Agendamento → comparecimento → continuidade.", "Indicação fecha o ciclo e alimenta o próximo."], technical: "[RECOMENDAÇÃO] Fluxo de contato com handoff humano.", tag: "8 etapas" },
      { id: "assistente", title: "Assistente virtual", benefit: "Você oferece resposta rápida sem automatizar o cuidado clínico.", kind: "assistant", sentence: "O assistente responde dúvidas administrativas. Urgência ou dúvida clínica vai direto a uma pessoa.", read: "O limite é parte do desenho: guard-rails, base legal, revisão humana e passagem clara protegem a jornada.", bullets: ["Horários, documentos e orientações gerais.", "Urgência: encaminhamento imediato para pessoa.", "Dúvida clínica: nunca é respondida por automação."], technical: "[RECOMENDAÇÃO] CFM, LGPD e revisão humana como cuidados do plano.", tag: "Fluxo com cuidado" },
      { id: "painel", title: "Painéis para a diretoria", benefit: "Você decide com uma visão comum do mês.", kind: "dashboard", sentence: "Um painel simples reúne origem, intenção, resposta e jornadas concluídas.", read: "O exemplo é ilustrativo e usa dados fictícios. O valor está na cadência de decisão, não em um número solto.", bullets: ["Contatos qualificados por origem.", "Tempo mediano de primeira resposta.", "Jornadas concluídas por mês como métrica-guia."], technical: "[EXEMPLO ILUSTRATIVO] Dados fictícios para demonstrar a interface.", tag: "Exemplo ilustrativo" },
      { id: "implantacao", title: "Plano de implantação: 90, 120, 240 dias e 1 ano", benefit: "Você sabe o que entra em cada etapa.", kind: "gantt", sentence: "A implantação começa por base e dados, depois integra equipe, marca e escala.", read: "Os marcos Dia 90, 120, 240 e 365 protegem foco e permitem liberar o próximo investimento com evidência.", bullets: ["Dia 90: instrumentação e primeiras rotinas.", "Dia 120: rede de médicos e empresas.", "Dia 240–365: inteligência, equipe e escala responsável."], technical: "[RECOMENDAÇÃO] Plano diretor de 90, 120, 240 dias e 1 ano.", tag: "90 / 120 / 240 / 365" },
    ]
  },
  {
    id: "equipe", number: "06", eyebrow: "EQUIPE INTERNA", title: "Uma equipe própria, que conhece o hospital por dentro.", message: "Só o programador de sistemas é externo. O restante aprende, executa e evolui dentro do São Paulo.",
    cards: [
      { id: "organograma", title: "Equipe interna de marketing", benefit: "Você vê a responsabilidade de cada papel.", kind: "org", sentence: "O plano internaliza a inteligência e a produção de marketing. A equipe é composta por coordenação, social media, designers gráficos, filmmaker, editor e analista de dados e CRM; o único profissional externo é o programador fullstack, responsável por CRM, dashboards, integrações e IA. A contratação é escalonada, com gates, para que a estrutura cresça no ritmo dos resultados. Coordenação e analista de dados são recomendações do plano para sustentar a gestão e o uso dos dados.", read: "A estrutura aproxima decisão, execução e conhecimento do hospital, sem criar camadas desnecessárias.", bullets: ["Coordenação guarda o ritmo e os objetivos.", "Conteúdo e relacionamento conhecem o tom.", "Dados e tecnologia dão visibilidade ao sistema."], technical: "[RECOMENDAÇÃO] Organograma e núcleo de equipe do plano.", tag: "Organograma" },
    ]
  }
];

const icons: Record<CardKind, string> = { timeline: "⌁", rings: "◎", quadrants: "✦", stakeholders: "◌", map: "⌖", bars: "▥", funnel: "▽", line: "⌁", radar: "✧", palette: "◒", position: "↗", voice: "“", growth: "↗", loops: "∞", layers: "▤", tools: "⚙", journey: "→", assistant: "✦", hub: "⌘", dashboard: "▦", gantt: "☷", org: "⌘", steps: "1·", training: "↗", scale: "▥" };

function useCountUp(target: number, active: boolean, duration = 1300) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setValue(target); return; }
    const start = performance.now();
    const tick = (now: number) => { const progress = Math.min(1, (now - start) / duration); const eased = 1 - Math.pow(1 - progress, 3); setValue(Math.round(target * eased)); if (progress < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return value;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const macro = useCountUp(735852, heroVisible);
  const specialties = useCountUp(33, heroVisible, 800);
  const years = useCountUp(30, heroVisible, 900);

  useEffect(() => { const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.2 }); if (heroRef.current) observer.observe(heroRef.current); return () => observer.disconnect(); }, []);
  useEffect(() => { const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? (window.scrollY / max) * 100 : 0); }; window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); return () => window.removeEventListener("scroll", onScroll); }, []);
  const anchors = [{ href: "#hospital", label: "O hospital" }, { href: "#mercado", label: "Mercado e marca" }, { href: "#crescimento", label: "Crescimento" }, { href: "#digital", label: "Ecossistema digital" }, { href: "#decisoes", label: "Equipe e decisões" }];

  return <main>
    <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
    <header className="site-header sweep-trigger">
      <a className="brand" href="#top" aria-label="Hospital e Maternidade São Paulo — início"><img src="/assets/logo-mark-transparent.png" alt="" /><span><strong>Hospital e Maternidade</strong><b>São Paulo</b></span></a>
      <nav className={menuOpen ? "nav-open" : ""} aria-label="Navegação principal">{anchors.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}<a className="header-cta" href="#decisoes" onClick={() => setMenuOpen(false)}>Aprovar proposta <span>↗</span></a></nav>
      <button className="menu-toggle" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i /><i /><i /></button>
    </header>

    <section id="top" ref={heroRef} className="hero sweep-trigger">
      <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
      <div className="hero-inner">
        <div className="hero-copy"><p className="eyebrow light">PROPOSTA DE TRABALHO <span /> OUTUBRO DE 2026</p><h1>Plano de Marketing, Branding e Growth do <span className="hero-highlight">Hospital São Paulo.</span></h1><p className="hero-lead">Marketing organizado em um sistema simples: conhecer bem a praça, fortalecer a marca de família e enxergar tudo em um painel.</p><div className="hero-actions"><a className="button button-primary" href="#hospital">Ver a proposta em 3 minutos <span>↓</span></a><a className="button button-ghost" href="#saulo">Falar com o Saulo <span>↗</span></a></div><div className="hero-proof"><div><strong>{macro.toLocaleString("pt-BR")}</strong><span>habitantes na região<br /><small>população · foto de 2022</small></span></div><div><strong>{specialties}</strong><span>especialidades<br /><small>atuação atual</small></span></div><div><strong>desde 1996</strong><span>conduzido por<br />médicos da região</span></div></div></div>
        <div className="hero-side"><div className="hero-logo-card"><img src="/assets/HMSP_LOGO.png" alt="Hospital e Maternidade São Paulo" /><div className="hero-logo-name"><strong>Hospital e Maternidade</strong><b>São Paulo</b></div></div></div>
      </div><div className="hero-bottom"><span>Hospital e Maternidade São Paulo</span><span>Cacoal, Rondônia</span><span>role para explorar <b>↓</b></span></div>
    </section>

    {sections.map((section) => <SectionBlock key={section.id} section={section} />)}


    <section className="saulo-section" id="saulo"><div className="saulo-inner"><div className="portrait-frame"><div className="portrait-ring" /><img src="/assets/saulo.webp" alt="Saulo Rosa, Gerente de Marketing" /><span className="portrait-tag">QUEM VAI EXECUTAR</span></div><div className="saulo-copy"><p className="eyebrow">07 · QUEM VAI EXECUTAR</p><h2>Saulo Rosa: experiência<br />para colocar o plano em <em>movimento.</em></h2><p><strong>Publicitário Carioca</strong>, formado pela FACHA — Faculdades Integradas Hélio Alonso — em Comunicação Social, com especialização em Publicidade e Propaganda.</p><p>Saulo Rosa atua no Marketing desde 2015, com experiência e expertise comprovadas. Atuou em diversas campanhas de Marketing para setores educacionais de ensino superior e incorporadoras que atuam fora do país, como a INARCO.</p><p>Atua como Gestor de Marketing da AF Consultoria e Projetos, em Cacoal, empresa do ramo de consultoria de viabilidade técnico-financeira para acesso a créditos.</p><div className="signature"><strong>Saulo Rosa</strong><span>Gerente de Marketing · Cacoal-RO · desde 2015</span></div><a className="text-link" href="https://wa.me/556992865915?text=Olá%20Saulo,%20gostaria%20de%20conversar%20sobre%20a%20proposta%20do%20HMSP" target="_blank" rel="noreferrer">Falar com Saulo no WhatsApp · (69) 9286-5915 <span>↗</span></a></div></div></section>

    <section className="decisions section-shell" id="decisoes"><div className="section-intro"><p className="eyebrow">CONCLUSÃO E DECISÕES</p><h2>O plano está pronto.<br /><em>O próximo passo é com vocês.</em></h2><p>Quatro decisões simples colocam a primeira oficina em movimento.</p></div><div className="decision-grid">{["Analisar a Proposta", "Reunião Propositiva", "Implantação das Equipes", "Início dos Trabalhos"].map((d, i) => <div className="decision-card" key={d}><span>0{i + 1}</span><strong>{d}</strong></div>)}</div><div className="final-cta" id="contact"><div><p className="eyebrow light">A ASSINATURA DO PLANO</p><h3>Gestão de Marketing profissional.<br /><em>Gestão para Crescimento.</em></h3></div><div className="final-actions"><a className="button button-primary" href="mailto:saulo@hmsaopaulo.com.br?subject=HMSP%20—%20Aprovar%20proposta">Aprovar e agendar a primeira oficina <span>↗</span></a><a className="button button-outline-light" href="/Plano_Marketing_Branding_Growth_HMSP_v3.pdf">Baixar o plano completo (PDF) <span>↓</span></a></div></div></section>

    <footer className="site-footer"><div className="footer-brand"><img src="/assets/logo-mark-transparent.png" alt="" /><div><strong>Hospital e Maternidade</strong><b>São Paulo</b></div></div><div><span>Cacoal, Rondônia</span><a href="https://www.hmsaopaulo.com.br">www.hmsaopaulo.com.br</a></div><p>Este material não substitui parecer jurídico, avaliação clínica, auditoria de segurança da informação nem validação financeira.</p><small>Proposta de trabalho · Outubro de 2026</small></footer>

  </main>;
}

const pdfCropByCard: Record<string, string> = {
  origem: "origem", ambiente: "ambiente", situacao: "situacao", envolvidos: "envolvidos", praca: "praca", competicao: "competicao",
  mercado: "mercado", natalidade: "natalidade", "paciente-ideal": "paciente-ideal", jornada: "jornada",
  "forca-marca": "forca-marca", posicionamento: "posicionamento",
  gerar: "gerar", camadas: "camadas", ferramentas: "ferramentas", intranet: "intranet",
  contato: "contato", assistente: "assistente", painel: "painel", implantacao: "implantacao",
  organograma: "organograma",
};
function PlanFigure({ card }: { card: CardData }) {
  const crop = pdfCropByCard[card.id] ?? "origem";
  return <figure className="pdf-visual"><img src={`/assets/plan-crops/${crop}.webp`} alt={`Gráfico ou mapa do Plano de Marketing, Branding e Growth: ${card.title}`} loading="lazy" /></figure>;
}
const fichaInstitucional: { dim: string; info: string }[] = [
  { dim: "Natureza", info: "Hospital geral privado, conduzido por grupo de médicos sócios" },
  { dim: "Localização", info: "Cacoal, Rondônia: Região de Saúde Café, Macrorregião de Saúde II" },
  { dim: "Cadastro", info: "CNES 2784637; 23 leitos existentes no módulo consultado (fotografia cadastral)" },
  { dim: "Serviços", info: "Consultas, centro cirúrgico (eletivas, urgência e emergência), internação, pronto atendimento, maternidade e tomografia" },
  { dim: "Especialidades", info: "33 listadas, incluindo cardiologia, nefrologia, cirurgia vascular, ortopedia, obstetrícia, pediatria, cardiopediatria, genética e psiquiatria" },
  { dim: "Corpo clínico", info: "Profissionais identificados com fotos, CRM e, em geral, RQE" },
  { dim: "Transparência de acesso", info: "Informa os limites do pronto atendimento ao lado da oferta (sem check-up eletivo, sem observação acima de 24 h, sem garantia de vaga)" },
  { dim: "Reputação pública (referência de partida)", info: "Google Maps 3,9/5 em 137 avaliações; Doctoralia 5/5 em 19 opiniões. São universos diferentes: nunca somar médias; exibir n, plataforma e janela" },
  { dim: "Redes sociais", info: "Instagram e Facebook ativos; métricas não acessadas nesta rodada" },
];

function DossieCard({ card }: { card: CardData }) {
  return <article className="editorial-session dossie">
    <div className="session-copy">
      <div className="session-kicker"><span>{card.tag}</span><span className="session-icon" aria-hidden="true">{icons[card.kind]}</span></div>
      <h3>{card.title}</h3>
      <p className="session-benefit">{card.benefit}</p>

      <div className="dossie-tese">
        <p className="dossie-label">TESE</p>
        <p className="dossie-lead">O Hospital e Maternidade São Paulo (HMSP) tem mais de <strong>quatro décadas</strong> de presença em Cacoal e é conduzido <strong>desde 1996</strong> por um <strong>grupo de médicos sócios</strong>.</p>
        <p className="dossie-statement">A vantagem do hospital <span className="dossie-caps">não é tamanho</span>: é ser <strong>a casa de médicos locais e de famílias da praça</strong>.</p>
        <p className="dossie-intro">Este <span className="dossie-caps">Plano de Marketing</span> organiza esse capital em um <strong>sistema de crescimento</strong>:</p>
        <div className="dossie-pillars">
          <div className="dossie-pillar"><b>Marca de família</b><span>com linguagem única</span></div>
          <div className="dossie-pillar"><b>Rede de médicos</b><span>e empresas parceiras</span></div>
          <div className="dossie-pillar"><b>Equipe interna</b><span>de marketing</span></div>
          <div className="dossie-pillar"><b>Ecossistema digital</b><span>de inteligência que coloca toda a informação diante da diretoria</span></div>
        </div>
      </div>

      <p className="session-reading">{card.read}</p>
      <ul>{card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
      <p className="session-technical">{card.technical}</p>
    </div>

    <div className="dossie-ficha">
      <h4 className="dossie-ficha-title">Ficha institucional</h4>
      <div className="dossie-table-wrap">
        <table className="dossie-table">
          <thead><tr><th scope="col">Dimensão</th><th scope="col">Informação</th></tr></thead>
          <tbody>{fichaInstitucional.map((row) => <tr key={row.dim}><th scope="row">{row.dim}</th><td>{row.info}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </article>;
}

function SectionBlock({ section }: { section: SectionData }) {
  return <section className={`content-section section-shell ${section.id === "hospital" ? "first-section" : ""}`} id={section.id}>
    <div className="section-intro"><div className="section-number">{section.number}</div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2><p>{section.message}</p></div>
    <div className="editorial-sessions">{section.cards.map((card) => card.id === "origem" ? <DossieCard key={card.id} card={card} /> : <article className="editorial-session" key={card.id}>
      <div className="session-copy"><div className="session-kicker"><span>{card.tag}</span><span className="session-icon" aria-hidden="true">{icons[card.kind]}</span></div><h3>{card.title}</h3><p className="session-benefit">{card.benefit}</p><p className="session-sentence"><strong>TESE</strong>{card.sentence}</p><p className="session-reading">{card.read}</p><ul>{card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul><p className="session-technical">{card.technical}</p></div>
      <PlanFigure card={card} />
    </article>)}</div>
  </section>;
}
