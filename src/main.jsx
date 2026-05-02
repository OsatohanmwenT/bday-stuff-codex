import React from "react";
import { createRoot } from "react-dom/client";
import { ChevronLeft, ChevronRight, Gift, Mail, Paperclip, Play, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollReveal from "./components/experiments/ScrollReveal";
import { Expandable, ExpandableContent, ExpandableTrigger } from "./components/experiments/Expandable";
import { ExpandableScreen, ExpandableScreenContent, ExpandableScreenTrigger } from "./components/experiments/ExpandableScreen";
import HoverVideoPlayer from "./components/experiments/HoverVideoPlayer";
import { content } from "./content";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const pages = ["Envelope", "Letter", "Memories", "Surprises"];

function pathFor(page) {
  return page === "Envelope" ? "/envelope" : `/${page.toLowerCase()}`;
}

function currentPage() {
  const path = window.location.pathname.replace("/", "").toLowerCase();
  if (!path) return "Envelope";
  if (path === "soundtrack") return "Memories";
  return pages.find((page) => page.toLowerCase() === path) || "Envelope";
}

function App() {
  const [activePage, setActivePage] = React.useState(currentPage());
  const sectionRefs = React.useRef({});
  const activeRef = React.useRef(currentPage());
  const didInitialScroll = React.useRef(false);

  React.useEffect(() => {
    const onPop = () => scrollToChapter(currentPage(), false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initialPage = currentPage();

    if (!didInitialScroll.current) {
      didInitialScroll.current = true;
      if (window.location.pathname.replace("/", "").toLowerCase() === "soundtrack") {
        window.history.replaceState({}, "", pathFor("Memories"));
      }
      scrollToChapter(initialPage, false, "auto");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        const nextPage = visibleEntry.target.dataset.page;
        if (!nextPage || activeRef.current === nextPage) return;

        activeRef.current = nextPage;
        setActivePage(nextPage);
        window.history.replaceState({}, "", pathFor(nextPage));
      },
      { rootMargin: "-38% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    pages.forEach((page) => {
      if (sectionRefs.current[page]) observer.observe(sectionRefs.current[page]);
    });

    const ctx = gsap.context(() => {
      gsap.utils.toArray(".story-chapter").forEach((chapter) => {
        const items = chapter.querySelectorAll(".animate-in");
        gsap.fromTo(
          items,
          prefersReducedMotion ? { opacity: 1 } : { y: 28, rotate: "-=1", opacity: 0 },
          {
            y: 0,
            rotate: "+=1",
            opacity: 1,
            duration: prefersReducedMotion ? 0 : 0.86,
            stagger: prefersReducedMotion ? 0 : 0.07,
            ease: "power3.out",
            scrollTrigger: prefersReducedMotion
              ? undefined
              : {
                  trigger: chapter,
                  start: "top 68%",
                  once: true
                }
          }
        );
      });

      if (!prefersReducedMotion) {
        gsap.utils.toArray(".story-drift").forEach((item) => {
          gsap.to(item, {
            y: -24,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.85
            }
          });
        });

        gsap.fromTo(
          ".party-thread",
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".story-scroll-shell",
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7
            }
          }
        );
      }
    });

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  function setSectionRef(page, node) {
    if (node) sectionRefs.current[page] = node;
  }

  function scrollToChapter(nextPage, push = true, behavior = "smooth") {
    const nextSection = sectionRefs.current[nextPage];
    if (!nextSection) return;

    activeRef.current = nextPage;
    setActivePage(nextPage);
    if (push) window.history.pushState({}, "", pathFor(nextPage));
    nextSection.scrollIntoView({ behavior, block: "start" });
  }

  return (
    <div className="app-shell">
      <Header goTo={scrollToChapter} />
      <main>
        <div className="story-scroll-shell">
          <div className="party-thread" aria-hidden="true" />
          <PartyDecorations />
          <StoryProgress activePage={activePage} />
          <section className="story-chapter" data-page="Envelope" ref={(node) => setSectionRef("Envelope", node)}>
            <Envelope goTo={scrollToChapter} />
          </section>
          <section className="story-chapter" data-page="Letter" ref={(node) => setSectionRef("Letter", node)}>
            <Letter goTo={scrollToChapter} />
          </section>
          <section className="story-chapter" data-page="Memories" ref={(node) => setSectionRef("Memories", node)}>
            <Memories goTo={scrollToChapter} />
          </section>
          <section className="story-chapter" data-page="Surprises" ref={(node) => setSectionRef("Surprises", node)}>
            <Surprises goTo={scrollToChapter} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PartyDecorations() {
  return (
    <div className="party-decorations" aria-hidden="true">
      <span className="balloon balloon-coral story-drift" />
      <span className="balloon balloon-gold story-drift" />
      <span className="balloon balloon-sky story-drift" />
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
  return (
    <div className="story-progress" aria-hidden="true">
      {pages.map((page) => (
        <span className={activePage === page ? "active" : ""} key={page}>
          {activePage === page && <Sparkles size={18} />}
        </span>
      ))}
    </div>
  );
}

function Header({ goTo }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => goTo("Envelope")}>{content.siteTitle}</button>
      <button className="heart-mark" onClick={() => goTo("Envelope")} aria-label="Return to the birthday invite">
        <Gift size={26} strokeWidth={1.8} />
      </button>
    </header>
  );
}

function Envelope({ goTo }) {
  const [opening, setOpening] = React.useState(false);

  function openLetter() {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => goTo("Letter"), 680);
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

function Letter({ goTo }) {
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
        <button className="story-action letter-action animate-in" onClick={() => goTo("Memories")}>
          <span>Start the memory party</span>
          <Sparkles size={20} />
        </button>
      </article>
    </section>
  );
}

function Memories({ goTo }) {
  return (
    <section className="paper-page memories-page">
      <PageIntro title="Memory Party" text={content.memoriesIntro} />
      <div className="memory-experiment-board animate-in">
        <div className="memory-bounce-copy memory-note-card">
          <span>Snapshots worth celebrating</span>
          <small>{content.memoryNote}</small>
        </div>
        <MemoryCarousel memories={content.memoryCarousel} />
        <button className="story-action memories-action animate-in" onClick={() => goTo("Surprises")}>
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
      {expandedMemory && (
        <div className="memory-lightbox" role="dialog" aria-modal="true" aria-label={expandedMemory.caption} onClick={() => setExpandedIndex(null)}>
          <figure className="memory-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setExpandedIndex(null)} aria-label="Close enlarged memory">
              X
            </button>
            <img src={expandedMemory.image} alt={expandedMemory.alt} />
            <figcaption>{expandedMemory.caption}</figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

function Surprises({ goTo }) {
  const [openSurprise, setOpenSurprise] = React.useState(null);

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
        <button className="story-action surprises-action animate-in" onClick={() => goTo("Envelope")}>
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

