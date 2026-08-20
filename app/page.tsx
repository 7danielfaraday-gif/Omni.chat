import type { Metadata } from "next";
import GoogleReviews from "./components/GoogleReviews";

export const metadata: Metadata = {
  title: "Amanda Bergamasco | Massoterapia",
  description:
    "Massoterapia personalizada com destaque para a Liberação Miofascial Manual Instrumental pelo Método Flávio Salik.",
};

const whatsappUrl = "https://wa.me/5511936196324";
const instagramUrl = "https://www.instagram.com/bergamasco.massoterapeuta/";

const services = [
  {
    title: "Liberação Miofascial Manual Instrumental",
    eyebrow: "Grande diferencial",
    description:
      "Técnica precisa e profunda, com instrumentos e manobras manuais para reduzir tensões, melhorar a mobilidade e apoiar a recuperação muscular.",
    image: "/assets/miofascial-1.jpg",
    tone: "service-featured",
  },
  {
    title: "Massagem Relaxante",
    eyebrow: "Desacelerar",
    description:
      "Um cuidado acolhedor para aliviar o estresse, relaxar a musculatura e devolver leveza ao corpo e à rotina.",
    image: "/assets/relaxante.jpg",
    tone: "",
  },
  {
    title: "Massagem Terapêutica",
    eyebrow: "Cuidado direcionado",
    description:
      "Manobras adaptadas às necessidades de cada pessoa para cuidar de desconfortos, sobrecargas e limitações do dia a dia.",
    image: "/assets/miofascial-2.jpg",
    tone: "",
  },
  {
    title: "Drenagem Linfática Manual",
    eyebrow: "Leveza",
    description:
      "Movimentos suaves e ritmados que favorecem a circulação linfática e ajudam a reduzir a sensação de inchaço.",
    image: "/assets/drenagem.jpg",
    tone: "",
  },
  {
    title: "Reflexologia Podal",
    eyebrow: "Pausa para os pés",
    description:
      "Pressões e estímulos nos pés para relaxar, aliviar a sensação de cansaço e complementar o cuidado integral.",
    image: "/assets/reflexologia.jpg",
    tone: "",
  },
  {
    title: "Quick Massage",
    eyebrow: "Na empresa ou no evento",
    description:
      "Atendimento prático e revigorante para ações corporativas, SIPATs, feiras, ativações e eventos.",
    image: "/assets/corporativo.jpg",
    tone: "",
  },
];

const prices = [
  ["30 minutos", "R$ 90,00"],
  ["60 minutos", "R$ 135,00"],
  ["90 minutos", "R$ 202,50"],
  ["120 minutos", "R$ 270,00"],
];

const benefits = [
  "Alívio de dores musculares e crônicas",
  "Melhora da postura e da mobilidade",
  "Estímulo à circulação sanguínea",
  "Recuperação muscular mais confortável",
  "Relaxamento e bem-estar geral",
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Amanda Bergamasco Massoterapia">
          <img src="/assets/logo-original.png" alt="Amanda Bergamasco Massoterapia" />
          <span>
            Amanda Bergamasco
            <small>massoterapia</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#tratamentos">Tratamentos</a>
          <a href="#experiencia">Experiência</a>
          <a href="#parcerias">Parcerias</a>
          <a href="#avaliacoes">Avaliações</a>
        </nav>
        <a className="header-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
          Agendar horário <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-overlay" />
        <div className="hero-content shell">
          <p className="eyebrow light">Amanda Bergamasco · Massoterapia</p>
          <h1>
            Seu corpo merece um cuidado que <em>faz diferença.</em>
          </h1>
          <p className="hero-copy">
            Um atendimento autoral, acolhedor e preciso, com a Liberação Miofascial Manual Instrumental como nosso grande diferencial.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href={whatsappUrl} target="_blank" rel="noreferrer">
              Quero agendar <span aria-hidden="true">→</span>
            </a>
            <a className="text-link light-link" href="#tratamentos">
              Conheça os tratamentos <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-note">
            <span className="hero-note-mark" aria-hidden="true">01</span>
            <span>
              <strong>Método Flávio Salik</strong>
              <small>mobilidade, alívio e recuperação</small>
            </span>
          </div>
        </div>
        <div className="hero-side-label">Cuidado que se sente</div>
      </section>

      <section className="intro-band">
        <div className="shell intro-grid">
          <p className="section-kicker">Um espaço para voltar para si</p>
          <p className="intro-lede">
            Mais do que uma massagem, uma pausa com intenção. Cada sessão é pensada para entender o que seu corpo precisa hoje — com técnica, presença e respeito ao seu tempo.
          </p>
          <div className="intro-signature">AB <span>·</span> 2024</div>
        </div>
      </section>

      <section className="differential section-pad" id="diferencial">
        <div className="shell differential-grid">
          <div className="differential-media">
            <div className="image-frame frame-large">
              <img src="/assets/miofascial-1.jpg" alt="Aplicação de liberação miofascial com instrumento" />
              <span className="image-caption">Técnica manual e instrumental</span>
            </div>
            <div className="image-frame frame-small">
              <img src="/assets/miofascial-2.jpg" alt="Atendimento de liberação miofascial" />
              <a className="play-link" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Ver vídeos e bastidores no Instagram">
                <span className="play-icon" aria-hidden="true">▶</span> Ver vídeos e bastidores
              </a>
            </div>
            <span className="floating-stamp">feito<br />com presença</span>
          </div>
          <div className="differential-copy">
            <p className="eyebrow">Nosso principal diferencial</p>
            <h2>Liberação <span>miofascial</span></h2>
            <p className="method-line">Manual Instrumental · Método Flávio Salik</p>
            <p>
              Uma abordagem que combina a precisão dos instrumentos com a sensibilidade das mãos para liberar tensões acumuladas na fáscia, melhorar a mobilidade e devolver conforto ao movimento.
            </p>
            <p>
              É a técnica que mais representa o nosso trabalho — sem deixar de lado as outras possibilidades de cuidado que podem fazer sentido para você.
            </p>
            <ul className="check-list">
              {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
            <a className="button button-dark" href={whatsappUrl} target="_blank" rel="noreferrer">
              Conversar sobre meu objetivo <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="services section-pad" id="tratamentos">
        <div className="shell">
          <div className="section-heading heading-split">
            <div>
              <p className="eyebrow">Técnicas para diferentes necessidades</p>
              <h2>Escolha seu <span>cuidado</span></h2>
            </div>
            <p>
              Todas as técnicas são apresentadas com clareza para você entender o que combina com seu momento. A indicação final é sempre personalizada.
            </p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <article className={`service-card ${service.tone}`} key={service.title}>
                <div className="service-image-wrap">
                  <img src={service.image} alt={service.title} />
                  <span className="service-index">0{index + 1}</span>
                </div>
                <div className="service-card-body">
                  <p className="card-eyebrow">{service.eyebrow}</p>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a className="service-link" href={index === 0 ? "#diferencial" : instagramUrl} target={index === 0 ? undefined : "_blank"} rel={index === 0 ? undefined : "noreferrer"}>
                    {index === 0 ? "Entender a técnica" : "Ver experiência"} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="video-note">
            <span className="video-note-icon" aria-hidden="true">●</span>
            <p>Fotos e vídeos de cada técnica ajudam você a chegar mais seguro. <a href={instagramUrl} target="_blank" rel="noreferrer">Veja o nosso Instagram</a> para acompanhar movimentos, bastidores e resultados do atendimento.</p>
          </div>
        </div>
      </section>

      <section className="pricing section-pad" id="valores">
        <div className="shell pricing-grid">
          <div>
            <p className="eyebrow">Tudo claro antes de começar</p>
            <h2>Pacotes <span>e valores</span></h2>
            <p className="pricing-copy">Para deixar sua escolha mais simples, concentramos os valores em um único lugar. A duração e a técnica podem ser combinadas de acordo com a sua necessidade.</p>
            <a className="text-link dark-link" href={whatsappUrl} target="_blank" rel="noreferrer">Tirar dúvidas pelo WhatsApp <span aria-hidden="true">↗</span></a>
          </div>
          <div className="price-table" role="table" aria-label="Tabela de valores por duração">
            {prices.map(([duration, value]) => (
              <div className="price-row" role="row" key={duration}>
                <span role="cell">{duration}</span><strong role="cell">{value}</strong>
              </div>
            ))}
            <p className="price-footnote">Valores de referência para atendimento individual. Consulte disponibilidade e condições no agendamento.</p>
          </div>
        </div>
      </section>

      <section className="gift section-pad" id="presente">
        <div className="shell gift-grid">
          <div className="gift-copy">
            <p className="eyebrow">Um presente que vira memória</p>
            <h2>Vale-presente <span>com intenção</span></h2>
            <p>Você pode presentear alguém especial com um voucher de massoterapia personalizado, disponível nas versões física e digital.</p>
            <div className="gift-pills"><span>versão física</span><span>versão digital</span><span>mensagem personalizada</span></div>
            <a className="button button-dark" href={whatsappUrl} target="_blank" rel="noreferrer">Quero presentear <span aria-hidden="true">↗</span></a>
          </div>
          <div className="gift-visual">
            <div className="gift-card">
              <span className="gift-card-small">para você, com carinho</span>
              <strong>vale<br /><em>presente</em></strong>
              <span className="gift-card-mark">AB · massoterapia</span>
            </div>
            <span className="gift-orbit orbit-one" /><span className="gift-orbit orbit-two" />
          </div>
        </div>
      </section>

      <section className="experience section-pad" id="experiencia">
        <div className="shell">
          <div className="section-heading heading-split">
            <div>
              <p className="eyebrow">Seu momento, do seu jeito</p>
              <h2>Uma experiência que <span>celebra</span></h2>
            </div>
            <p>Além das técnicas, cuidamos dos detalhes. A sala pode ser preparada para aniversários, datas especiais e pequenos rituais de autocuidado.</p>
          </div>
          <div className="experience-card">
            <img src="/assets/occasion-room.png" alt="Sala de massoterapia preparada com balões, flores, toalhas e velas" />
            <div className="experience-overlay">
              <span className="experience-label">ocasiões especiais</span>
              <h3>Um atendimento<br /><em>com a sua cara.</em></h3>
              <p>Decoração, mensagem, aroma e pequenos detalhes podem ser combinados previamente.</p>
              <a className="text-link light-link" href={whatsappUrl} target="_blank" rel="noreferrer">Personalizar meu atendimento <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="corporate section-pad" id="empresas">
        <div className="shell corporate-card">
          <div className="corporate-image"><img src="/assets/corporativo.jpg" alt="Equipe reunida em ambiente corporativo" /></div>
          <div className="corporate-copy">
            <p className="eyebrow">Para cuidar de quem faz acontecer</p>
            <h2>Quick Massage para <span>empresas e eventos</span></h2>
            <p>Leve uma pausa de bem-estar para sua equipe ou para o seu público, com atendimento organizado e adaptado ao ritmo da ação.</p>
            <div className="event-tags"><span>ações corporativas</span><span>SIPATs</span><span>feiras</span><span>ativações</span><span>eventos</span></div>
            <a className="button button-light" href={whatsappUrl} target="_blank" rel="noreferrer">Solicitar proposta <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className="partnerships section-pad" id="parcerias">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Benefícios para quem está por perto</p>
            <h2>Parcerias que <span>cuidam</span></h2>
            <p>Descontos exclusivos para comunidades que valorizam saúde, bem-estar e qualidade de vida.</p>
          </div>
          <div className="partnership-grid">
            <article className="partner-card">
              <span className="partner-number">01</span>
              <div className="partner-logo">G<br /><small>ANCHIETA</small></div>
              <h3>Grupo Anchieta / Vivantagens</h3>
              <p>Desconto exclusivo para colaboradores, alunos e corpo docente.</p>
              <span className="partner-tag">benefício exclusivo</span>
            </article>
            <article className="partner-card partner-card-warm">
              <span className="partner-number">02</span>
              <div className="partner-logo logo-sv">SV<br /><small>SÃO VICENTE</small></div>
              <h3>Hospital São Vicente</h3>
              <p>Desconto exclusivo para colaboradores.</p>
              <span className="partner-tag">benefício exclusivo</span>
            </article>
          </div>
        </div>
      </section>

      <section className="reviews section-pad" id="avaliacoes">
        <div className="shell reviews-grid">
          <div className="reviews-intro">
            <p className="eyebrow">Palavras de quem já viveu</p>
            <h2>O cuidado que fica <span>na memória</span></h2>
            <p>Experiências reais ajudam quem está chegando a entender o nosso jeito de atender.</p>
            <a className="text-link dark-link" href="https://www.google.com/maps/search/?api=1&query=Amanda+Bergamasco+Massoterapia" target="_blank" rel="noreferrer">Ver avaliações no Google <span aria-hidden="true">↗</span></a>
          </div>
          <GoogleReviews />
        </div>
      </section>

      <section className="final-cta">
        <div className="shell final-cta-inner">
          <p className="eyebrow light">Seu próximo cuidado começa aqui</p>
          <h2>Vamos encontrar o melhor <em>caminho para você?</em></h2>
          <a className="button button-light" href={whatsappUrl} target="_blank" rel="noreferrer">Agendar pelo WhatsApp <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <a className="footer-brand" href="#inicio"><img src="/assets/logo-original.png" alt="" /><span>Amanda Bergamasco<small>massoterapia</small></span></a>
          <p>Atendimento personalizado<br />com hora marcada.</p>
          <a className="footer-instagram" href={instagramUrl} target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>
          <p className="footer-copy">© 2024 Amanda Bergamasco · Todos os direitos reservados</p>
        </div>
      </footer>

      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Agendar pelo WhatsApp">
        <img src="/assets/whatsapp-icon.svg" alt="" />
      </a>
    </main>
  );
}
