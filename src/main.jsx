import gsap from "gsap";
import { ChevronLeft, ChevronRight, Gift, Mail, Paperclip, Play, Sparkles, Star, X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Expandable, ExpandableContent, ExpandableTrigger } from "./components/experiments/Expandable";
import { ExpandableScreen, ExpandableScreenContent, ExpandableScreenTrigger } from "./components/experiments/ExpandableScreen";
import HoverVideoPlayer from "./components/experiments/HoverVideoPlayer";
import ScrollReveal from "./components/experiments/ScrollReveal";
import { content } from "./content";
import "./styles.css";

const pages = [
  { name: "Envelope", path: "/envelope" },
  { name: "Letter", path: "/letter" },
  { name: "Memories", path: "/memories" },
  { name: "Surprises", path: "/surprises" }
];

const pageByPath = new Map(pages.map((page) => [page.path, page.name]));

function pageForPath(pathname) {
  return pageByPath.get(pathname) || (pathname === "/soundtrack" ? "Memories" : "Envelope");
}

function routeKeyForPath(pathname) {
  if (pathname === "/soundtrack") return "memories";
  return pageForPath(pathname).toLowerCase();
}

const routeMotion = {
  envelope: {
    stage: ".envelope-stage",
    focus: ".envelope-card",
    accents: ".gift-ribbon, .gift-bow, .party-tag, .seal, .delivery-note"
  },
  letter: {
    stage: ".letter-paper",
    focus: ".date-line, .letter-paper h1, .letter-reveal-line, .signoff, .letter-action",
    accents: ".tape, .bottom-tape, .sticky-note, .paperclip"
  },
  memories: {
    stage: ".memory-experiment-board",
    focus: ".memory-carousel-wrap",
    accents: ".memory-bounce-copy, .carousel-polaroid, .carousel-dots button, .memories-action"
  },
  surprises: {
    stage: ".page-intro",
    focus: ".birthday-video-card",
    accents: ".finale-note, .surprises-action"
  }
};

function App() {
  return (
    <BrowserRouter>
      <BirthdayRoutes />
    </BrowserRouter>
  );
}

function BirthdayRoutes() {
  const location = useLocation();
  const activePage = pageForPath(location.pathname);
  const activeRoute = routeKeyForPath(location.pathname);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRouteTransitioning, setIsRouteTransitioning] = React.useState(false);
  const [transitionPageLabel, setTransitionPageLabel] = React.useState(activePage);
  const previousPathRef = React.useRef(location.pathname);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setIsLoading(false), prefersReducedMotion ? 700 : 1900);
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  React.useEffect(() => {
    if (!isLoading) document.body.style.overflow = "";
  }, [isLoading]);

  React.useEffect(() => {
    if (isLoading) {
      previousPathRef.current = location.pathname;
      return undefined;
    }

    if (previousPathRef.current === location.pathname) return undefined;

    previousPathRef.current = location.pathname;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTransitionPageLabel(pageForPath(location.pathname));
    setIsRouteTransitioning(true);

    const timeout = window.setTimeout(() => {
      setIsRouteTransitioning(false);
    }, prefersReducedMotion ? 220 : 640);

    return () => window.clearTimeout(timeout);
  }, [isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="app-shell">
        <BirthdayLoader />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      {isRouteTransitioning && <RouteTransition label={transitionPageLabel} />}
      <main className={`route-stage route-${activeRoute}`}>
        <PartyDecorations />
        <StoryProgress activePage={activePage} />
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/envelope" replace />} />
          <Route
            path="/envelope"
            element={
              <RoutePage>
                <Envelope />
              </RoutePage>
            }
          />
          <Route
            path="/letter"
            element={
              <RoutePage>
                <Letter />
              </RoutePage>
            }
          />
          <Route
            path="/memories"
            element={
              <RoutePage>
                <Memories />
              </RoutePage>
            }
          />
          <Route
            path="/surprises"
            element={
              <RoutePage>
                <Surprises />
              </RoutePage>
            }
          />
          <Route path="/soundtrack" element={<Navigate to="/memories" replace />} />
          <Route path="*" element={<Navigate to="/envelope" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function RouteTransition({ label }) {
  return (
    <div className="route-transition" aria-hidden="true">
      <div className="route-transition-panel route-transition-panel-left" />
      <div className="route-transition-panel route-transition-panel-right" />
      <div className="route-transition-card">
        <Gift size={36} strokeWidth={1.8} />
        <span>{label}</span>
      </div>
    </div>
  );
}

function BirthdayLoader() {
  return (
    <main className="birthday-loader" aria-label="Loading birthday surprise" aria-live="polite">
      <div className="loader-confetti" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <section className="loader-card">
        <div className="loader-gift" aria-hidden="true">
          <span className="loader-ribbon loader-ribbon-vertical" />
          <span className="loader-ribbon loader-ribbon-horizontal" />
          <Gift size={48} strokeWidth={1.7} />
        </div>
        <p>Wrapping the birthday magic</p>
        <h1>{content.siteTitle}</h1>
        <div className="loader-progress" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}

function RoutePage({ children }) {
  const pageRef = React.useRef(null);
  const location = useLocation();
  const routeKey = routeKeyForPath(location.pathname);
  const motionConfig = routeMotion[routeKey];

  React.useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const ctx = gsap.context(() => {
      const items = page.querySelectorAll(".animate-in");
      const partyThread = document.querySelector(".party-thread");
      const routeStage = motionConfig?.stage ? page.querySelector(motionConfig.stage) : null;
      const routeFocus = motionConfig?.focus ? page.querySelectorAll(motionConfig.focus) : [];
      const routeAccents = motionConfig?.accents ? page.querySelectorAll(motionConfig.accents) : [];

      gsap.fromTo(
        page,
        { opacity: prefersReducedMotion ? 1 : 0 },
        {
          opacity: 1,
          duration: prefersReducedMotion ? 0 : 0.42,
          ease: "power2.out"
        }
      );

      if (items.length) {
        gsap.fromTo(
          items,
          prefersReducedMotion ? { opacity: 1 } : { y: 28, rotate: "-=1", opacity: 0 },
          {
            y: 0,
            rotate: "+=1",
            opacity: 1,
            duration: prefersReducedMotion ? 0 : 0.86,
            stagger: prefersReducedMotion ? 0 : 0.07,
            ease: "power3.out"
          }
        );
      }

      if (!prefersReducedMotion) {
        const routeTimeline = gsap.timeline({ delay: 0.05 });

        if (partyThread) {
          gsap.fromTo(partyThread, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 0.8, ease: "power3.out" });
        }

        if (routeStage) {
          routeTimeline.fromTo(
            routeStage,
            { opacity: 0, scale: routeKey === "letter" ? 0.96 : 0.92, rotate: routeKey === "letter" ? -4 : -2 },
            { opacity: 1, scale: 1, rotate: 0, duration: 0.72, ease: "back.out(1.45)" },
            0
          );
        }

        if (routeFocus.length) {
          routeTimeline.fromTo(
            routeFocus,
            { opacity: 0, y: routeKey === "envelope" ? 18 : 28, scale: routeKey === "memories" ? 0.9 : 1 },
            { opacity: 1, y: 0, scale: 1, duration: 0.64, stagger: 0.06, ease: "power3.out" },
            routeKey === "envelope" ? 0.08 : 0.18
          );
        }

        if (routeAccents.length) {
          routeTimeline.fromTo(
            routeAccents,
            { opacity: 0, y: 18, rotate: routeKey === "surprises" ? -5 : 4, scale: 0.94 },
            { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.52, stagger: 0.045, ease: "back.out(1.7)" },
            routeKey === "surprises" ? 0.22 : 0.3
          );
        }

        if (routeKey === "envelope") {
          routeTimeline.fromTo(".hero-confetti-burst span", { opacity: 0, scale: 0.2 }, { opacity: 0.55, scale: 0.8, duration: 0.2, stagger: 0.008, yoyo: true, repeat: 1 }, 0.28);
        }

        gsap.to(page.querySelectorAll(".story-drift"), { y: -10, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return <section className={`route-page route-page-${routeKey}`} ref={pageRef}>{children}</section>;
}

function PartyDecorations() {
  return (
    <div className="party-decorations" aria-hidden="true">
      <span className="balloon balloon-coral story-drift" />
      <span className="balloon balloon-gold story-drift" />
      <span className="balloon balloon-sky story-drift" />
      <div className="party-thread" aria-hidden="true" />
      <span className="streamer streamer-one" />
      <span className="streamer streamer-two" />
      <span className="streamer streamer-three" />
      {Array.from({ length: 18 }).map((_, index) => (
        <span className={`confetti-bit confetti-${index + 1}`} key={index} />
      ))}
    </div>
  );
}

function StoryProgress({ activePage }) {
  const navigate = useNavigate();

  return (
    <nav className="story-progress" aria-label="Birthday pages">
      {pages.map((page) => (
        <button
          className={activePage === page.name ? "active" : ""}
          key={page.name}
          onClick={() => navigate(page.path)}
          type="button"
          aria-label={`Go to ${page.name}`}
          aria-current={activePage === page.name ? "page" : undefined}
          title={page.name}
        >
          {activePage === page.name && <Sparkles size={18} />}
        </button>
      ))}
    </nav>
  );
}

function Header() {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("/envelope")}>{content.siteTitle}</button>
      <button className="heart-mark" onClick={() => navigate("/envelope")} aria-label="Return to the birthday invite">
        <Gift size={26} strokeWidth={1.8} />
      </button>
    </header>
  );
}

function Envelope() {
  const [opening, setOpening] = React.useState(false);
  const navigate = useNavigate();

  function openLetter() {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => navigate("/letter"), 680);
  }

  return (
    <section className={`envelope-page ${opening ? "is-celebrating" : ""}`}>
      <div className="hero-confetti-burst" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="envelope-stage animate-in story-drift">
        <p className="birthday-badge">{content.heroBadge}</p>
        <div
          className={`envelope-card ${opening ? "opening" : ""}`}
          onClick={openLetter}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") openLetter();
          }}
          role="button"
          tabIndex="0"
        >
          <div className="gift-wrap-texture" />
          <div className="gift-ribbon gift-ribbon-vertical" />
          <div className="gift-ribbon gift-ribbon-horizontal" />
          <div className="gift-bow">
            <span />
            <span />
          </div>
          <div className="party-tag">
            <Sparkles size={18} />
            <span>{content.cakeWishLabel}</span>
          </div>
          <div className="envelope-cover-copy">
            <span>{content.heroKicker}</span>
            <strong>Happy birthday</strong>
            <small>{content.heroSubline}</small>
          </div>
          <button className="seal" aria-label="Open birthday wish">
            <Gift size={32} strokeWidth={1.7} />
            <span>Open</span>
          </button>
        </div>
        <p className="delivery-note">{content.envelopeNote}</p>
      </div>
    </section>
  );
}

function Letter() {
  const navigate = useNavigate();

  return (
    <section className="paper-page letter-page">
        <article className="letter-paper animate-in story-drift">
        <div className="tape tape-top" />
        <img className="letter-flower letter-flower-top" alt="" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC4jbMzpBmue_MR_J1gP-8MsN_JEEUvbROc7wAn8gqOOnUcNQ5y337AmF7qH4CQb_Ku7VZtF5ZtEWz4HnW-jmNMDl_XWqBTav7bI6joeYwZZR6jIEoxYKG8VGkwK1n0u0vKpIGmduPKWnKEyBuklFgXdyjoz_A7198cpJ3wsYj708cWO5fWTWjRoiwm4E9frxAEDFM5nf9cTqJWdme6HzKaMB9ETYlZIbVX1Ho6zCwHEETf3y_4PZswJ3SMPQU1FMgw_JrvKo2HEb8" />
        <img className="letter-flower letter-flower-bottom" alt="" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaTMNCuGBsk_hZscnwbc28j6VnOyqWhjPwh9Ykm36sQqT6TfaHZC2so5coQ_6zUlDoa9XlKk8_t3HwlSj48mRyBBkc93jMya9RxtpyXc-NZIAVzH0jzc_MeI8E7LAwRtxiU_UW_8zSPH4ajlSsR-Wy8vOxHpE5XKgy3jUznm3oodANfMmXNYOjEXik3_CR2EslfEQx7mcHaa0pFCt3u7Gnr-k47zbIgPSQjh04A1hJCc-KO1S8RKMzGWrS0LSyt18PAWG0g5PwAB_y" />
        <aside className="sticky-note">{content.letter.sideNote}</aside>
        <Paperclip className="paperclip" size={34} />
        <p className="date-line">{content.letter.date}</p>
        <h1>{content.letter.greeting}</h1>
        {content.letter.paragraphs.map((text) => (
          <ScrollReveal containerClassName="letter-reveal-line" textClassName="letter-reveal-text" key={text}>
            {text}
          </ScrollReveal>
        ))}
        <div className="signoff">
          <span>{content.letter.signoffLine}</span>
          <strong>{content.letter.signature}</strong>
        </div>
        <div className="bottom-tape" />
        <img className="pressed-letter-flower" alt="" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn-pI_mQ807094KzX68p8L_H_0B4J38I8B00v2N_n2V7H4U8r7k8yX" />
        <button className="story-action letter-action animate-in" onClick={() => navigate("/memories")}>
          <span>Start the memory party</span>
          <Sparkles size={20} />
        </button>
      </article>
    </section>
  );
}

function Memories() {
  const navigate = useNavigate();

  return (
    <section className="paper-page memories-page">
      <PageIntro title="Memory Party" text={content.memoriesIntro} />
      <div className="memory-experiment-board animate-in">
        <div className="memory-bounce-copy memory-note-card">
          <span>Snapshots worth celebrating</span>
          <small>{content.memoryNote}</small>
        </div>
        <MemoryCarousel memories={content.memoryCarousel} />
        <button className="story-action memories-action animate-in" onClick={() => navigate("/surprises")}>
          <span>{content.openSurprisesLabel}</span>
          <Gift size={20} />
        </button>
      </div>
    </section>
  );
}

function MemoryCarousel({ memories }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [expandedIndex, setExpandedIndex] = React.useState(null);
  const carouselRef = React.useRef(null);

  React.useEffect(() => {
    const card = carouselRef.current?.querySelector(`[data-memory-index="${activeIndex}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  React.useEffect(() => {
    if (expandedIndex === null) return undefined;

    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") setExpandedIndex(null);
      if (event.key === "ArrowLeft") previousMemory();
      if (event.key === "ArrowRight") nextMemory();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expandedIndex]);

  function previousMemory() {
    setActiveIndex((index) => (index - 1 + memories.length) % memories.length);
  }

  function nextMemory() {
    setActiveIndex((index) => (index + 1) % memories.length);
  }

  const expandedMemory = expandedIndex === null ? null : memories[expandedIndex];

  return (
    <div className="memory-carousel-wrap animate-in">
      <button className="carousel-button carousel-button-left" onClick={previousMemory} aria-label="Previous memory">
        <ChevronLeft size={22} />
      </button>
      <div className="memory-carousel" ref={carouselRef}>
        {memories.map((memory, index) => (
          <motion.figure
            className={`carousel-polaroid ${activeIndex === index ? "is-active" : ""}`}
            data-memory-index={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) nextMemory();
              if (info.offset.x > 70) previousMemory();
            }}
            onClick={() => {
              if (activeIndex === index) {
                setExpandedIndex(index);
              } else {
                setActiveIndex(index);
              }
            }}
            key={memory.caption}
          >
            <span className="washi washi-top" />
            <img src={memory.image} alt={memory.alt} draggable="false" />
            <figcaption>
              <strong>{memory.caption}</strong>
              <span>
                {index + 1} / {memories.length}
              </span>
            </figcaption>
            <span className="washi washi-bottom" />
          </motion.figure>
        ))}
      </div>
      <button className="carousel-button carousel-button-right" onClick={nextMemory} aria-label="Next memory">
        <ChevronRight size={22} />
      </button>
      <div className="carousel-dots" aria-label="Memory slides">
        {memories.map((memory, index) => (
          <button
            className={activeIndex === index ? "active" : ""}
            key={memory.caption}
            onClick={() => setActiveIndex(index)}
            type="button"
            aria-label={`Show memory ${index + 1}: ${memory.caption}`}
            aria-current={activeIndex === index ? "true" : undefined}
          />
        ))}
      </div>
      {expandedMemory && (
        <div className="memory-lightbox" role="dialog" aria-modal="true" aria-label={expandedMemory.caption} onClick={() => setExpandedIndex(null)}>
          <figure className="memory-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setExpandedIndex(null)} aria-label="Close enlarged memory">
              <X size={20} />
            </button>
            <img src={expandedMemory.image} alt={expandedMemory.alt} />
            <figcaption>{expandedMemory.caption}</figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

function Surprises() {
  const [openSurprise, setOpenSurprise] = React.useState(null);
  const navigate = useNavigate();

  return (
    <section className="paper-page surprises-page">
      <PageIntro title="Make a Wish" text={content.surprisesIntro} />
      <BirthdayReveal video={content.video} />
      <p className="finale-note animate-in">{content.finaleNote}</p>
      <div className="surprise-board experiment-surprise-board">
        {content.surprises.map((surprise, index) => (
          <ExpandableSurprise
            surprise={surprise}
            index={index}
            openSurprise={openSurprise}
            setOpenSurprise={setOpenSurprise}
            key={surprise.title}
          />
        ))}
        <button className="story-action surprises-action animate-in" onClick={() => navigate("/envelope")}>
          <span>Replay the party</span>
          <Mail size={20} />
        </button>
      </div>
    </section>
  );
}

function BirthdayReveal({ video }) {
  return (
    <ExpandableScreen layoutId="birthday-video-reveal" triggerRadius="4px" contentRadius="6px" animationDuration={0.34}>
      <div className="birthday-video-card animate-in">
        <ExpandableScreenTrigger>
          <button className="video-note-trigger">
            <span>Birthday Wish</span>
            <small>{video.caption}</small>
            <Play size={22} fill="currentColor" />
          </button>
        </ExpandableScreenTrigger>
        <div className="video-note-screen">
          <HoverVideoPlayer videoSrc={video.videoSrc} thumbnailSrc={video.thumbnailSrc} caption={video.caption} />
        </div>
      </div>
      <ExpandableScreenContent className="birthday-reveal-screen">
        <div className="birthday-reveal-inner">
          <HoverVideoPlayer videoSrc={video.videoSrc} thumbnailSrc={video.thumbnailSrc} caption={video.caption} />
          <p>{video.videoSrc ? video.caption : "This space is ready for a birthday wishes video when you have one."}</p>
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
}

function ExpandableSurprise({ surprise, index, openSurprise, setOpenSurprise }) {
  const isOpen = openSurprise === index;

  return (
    <Expandable
      expanded={isOpen}
      onToggle={() => setOpenSurprise(isOpen ? null : index)}
      className={`surprise-card surprise-${index + 1} ${isOpen ? "is-open" : ""} animate-in`}
      transitionDuration={0.34}
    >
      <ExpandableTrigger className="surprise-card-button">
        <span className="surprise-pop" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, burstIndex) => (
            <span key={burstIndex} />
          ))}
        </span>
        {surprise.icon === "gift" && <Gift size={44} />}
        {surprise.icon === "heart" && <Sparkles size={44} />}
        {surprise.icon === "star" && <Star size={44} />}
        {surprise.icon === "photo" && <img className="surprise-photo" src={surprise.message} alt={surprise.title} draggable="false" />}
        <h2>{surprise.title}</h2>
        {surprise.icon !== "photo" && <p>{isOpen ? "Close this wish" : "Open this wish"}</p>}
      </ExpandableTrigger>
      <ExpandableContent className="surprise-expanded-message">
        <p>{surprise.icon === "photo" ? surprise.title : surprise.message}</p>
      </ExpandableContent>
    </Expandable>
  );
}

function PageIntro({ title, text }) {
  return (
    <div className="page-intro animate-in">
      <Sparkles className="intro-star" size={34} />
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <strong>{content.siteTitle}</strong>
      <p>Made with love for your special day</p>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
