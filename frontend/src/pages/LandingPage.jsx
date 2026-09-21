import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { useRef } from "react";
import ContainerVisual from "../components/landing/ContainerVisual";
import SetbyNav from "../components/landing/SetbyNav";

const STATS = [
  { value: "768d", label: "Semantic embeddings" },
  { value: "4+", label: "Scoring dimensions" },
  { value: "24/7", label: "Match pipeline" },
];

const PLATFORM_FEATURES = {
  client: [
    "Submit requirements with budget & timeline",
    "Run AI matching in one click",
    "Review scores and explanations",
  ],
  supplier: [
    "Publish offerings and pricing",
    "Get email alerts on new matches",
    "Track inbound client opportunities",
  ],
};

const HOW_IT_WORKS = [
  { title: "Semantic search", text: "Embeddings find similar products—not just keywords." },
  { title: "LLM product fit", text: "AI judges whether an offering truly matches the ask." },
  { title: "Rules engine", text: "Quantity, budget, and delivery scored transparently." },
  { title: "Notifications", text: "Clients and suppliers emailed when matches land." },
];

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28 });

  const visualY = useTransform(smooth, [0, 1], [0, 48]);
  const copyY = useTransform(smooth, [0, 1], [0, -24]);

  return (
    <div className="setby-landing">
      <section className="setby-hero" ref={heroRef}>
        <SetbyNav />

        <div className="setby-hero__bg-words" aria-hidden="true">
          <span>Precision</span>
          <span>Matching</span>
        </div>

        <div className="setby-hero__inner">
          <motion.div className="setby-hero__copy" style={{ y: copyY }}>
            <p className="setby-hero__eyebrow">AI-powered client–supplier matchmaking</p>
            <h1 className="setby-hero__title">
              Precision <span>matching</span> for modern procurement
            </h1>
            <p className="setby-hero__lead">
              Post requirements or offerings. Our engine scores semantic fit, quantity,
              budget, and delivery—then notifies both sides instantly.
            </p>
            <div className="setby-hero__actions">
              <Link to="/register" className="setby-btn setby-btn--orange">
                Start matching →
              </Link>
              <Link to="/login" className="setby-btn setby-btn--outline">
                Log in
              </Link>
            </div>
            <ul className="setby-hero__stats-row">
              {STATS.map((s) => (
                <li key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="setby-hero__visual-wrap"
            style={{ y: visualY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <ContainerVisual label="Matchmaking Enhanced" large />
            <div className="setby-hero__chip">
              <span className="setby-hero__chip-dot" />
              Client · Supplier · AI
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="setby-split">
        <div className="setby-split__orange">
          <div className="setby-split__orange-inner">
            <Reveal className="setby-split__copy">
              <p className="setby-kicker setby-kicker--light">About Wisdom Match</p>
              <h2>Procurement with clarity, speed, and explainable AI.</h2>
              <p className="setby-split__lead">
                We help buyers and suppliers connect through structured requirements,
                ranked matches, and transparent scoring—not opaque black boxes.
              </p>
              <a href="#platform" className="setby-btn setby-btn--dark">
                See the platform →
              </a>
            </Reveal>
            <Reveal delay={0.08} className="setby-split__visual">
              <ContainerVisual label="Logistics Enhanced" />
            </Reveal>
          </div>
        </div>

        <div id="platform" className="setby-split__white">
          <div className="setby-split__white-inner">
            <Reveal className="setby-split__platform-head">
              <p className="setby-kicker setby-kicker--dark">Platform</p>
              <h2>One platform. Two portals. Infinite connections.</h2>
              <p>
                Clients submit requirements. Suppliers list offerings. Our engine scores
                semantic fit, quantity, budget, and delivery—then notifies both sides.
              </p>
            </Reveal>

            <div className="setby-split__cards">
              <Reveal delay={0.05} className="portal-card">
                <span className="portal-card__tag">Client</span>
                <h3>Buyer portal</h3>
                <p>Post needs, run matching, and open full analysis on every result.</p>
                <ul className="portal-card__list">
                  {PLATFORM_FEATURES.client.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to="/register?role=CLIENT" className="setby-btn setby-btn--outline portal-card__btn">
                  Sign up as client
                </Link>
              </Reveal>

              <Reveal delay={0.12} className="portal-card portal-card--dark">
                <span className="portal-card__tag portal-card__tag--light">Supplier</span>
                <h3>Supplier portal</h3>
                <p>List catalog, receive match alerts, and grow qualified leads.</p>
                <ul className="portal-card__list portal-card__list--light">
                  {PLATFORM_FEATURES.supplier.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to="/register?role=SUPPLIER" className="setby-btn setby-btn--orange portal-card__btn">
                  Sign up as supplier
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="setby-features">
        <div className="setby-features__inner">
          <Reveal className="setby-features__head">
            <p className="setby-kicker setby-kicker--dark">Mission</p>
            <h2>How our matching engine works</h2>
            <p>
              Every match is stored with scores and reasons—so procurement teams can trust
              the recommendation and act faster.
            </p>
          </Reveal>
          <div className="setby-features__grid">
            {HOW_IT_WORKS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06} className="feature-tile">
                <span className="feature-tile__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="setby-outcomes">
        <div className="setby-outcomes__inner">
          <Reveal className="setby-outcomes__panel">
            <div className="setby-outcomes__copy">
              <p className="setby-kicker setby-kicker--dark">Results</p>
              <h2>Built for real B2B outcomes</h2>
              <p>
                Transparent scores, stored matches, and explainable AI—so procurement
                decisions are fast and defensible.
              </p>
            </div>
            <div className="setby-outcomes__metrics">
              {[
                { n: "99%", t: "Structured scoring", d: "Multi-factor rank" },
                { n: "AI", t: "LLM product fit", d: "Human-readable reasons" },
                { n: "100%", t: "Audit trail", d: "Every match in Postgres" },
              ].map((item) => (
                <div key={item.t} className="setby-outcomes__metric">
                  <strong>{item.n}</strong>
                  <span className="setby-outcomes__metric-title">{item.t}</span>
                  <span className="setby-outcomes__metric-desc">{item.d}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="setby-footer">
        <Reveal>
          <h2>Ready to match smarter?</h2>
          <p>Create your account or log in with a secure email OTP.</p>
          <div className="setby-footer__actions">
            <Link to="/register" className="setby-btn setby-btn--orange setby-btn--wide">
              Sign up free
            </Link>
            <Link to="/login" className="setby-btn setby-btn--outline setby-btn--wide">
              Log in
            </Link>
          </div>
          <p className="setby-footer__admin">
            Operator access: <Link to="/login?role=ADMIN">Admin console</Link>
          </p>
        </Reveal>
      </footer>
    </div>
  );
}
