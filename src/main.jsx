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

  return (
    <div className="app-shell">
      <Header />
      <main className="route-stage">
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

function RoutePage({ children }) {
  const pageRef = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const ctx = gsap.context(() => {
      const items = page.querySelectorAll(".animate-in");
      const partyThread = document.querySelector(".party-thread");

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
        if (partyThread) {
          gsap.fromTo(partyThread, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 0.8, ease: "power3.out" });
        }
        gsap.to(page.querySelectorAll(".story-drift"), { y: -10, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return <section className="route-page" ref={pageRef}>{children}</section>;
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
