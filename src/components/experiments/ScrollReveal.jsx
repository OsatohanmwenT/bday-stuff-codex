import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  enableBlur = true,
  baseOpacity = 0.22,
  baseRotation = 1.5,
  blurStrength = 3,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom"
}) {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="rb-word" key={`${word}-${index}`}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: { trigger: el, start: "top bottom", end: rotationEnd, scrub: true }
        }
      );

      const wordElements = el.querySelectorAll(".rb-word");
      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.04,
          scrollTrigger: { trigger: el, start: "top bottom-=20%", end: wordAnimationEnd, scrub: true }
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: "none",
            filter: "blur(0px)",
            stagger: 0.04,
            scrollTrigger: { trigger: el, start: "top bottom-=20%", end: wordAnimationEnd, scrub: true }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <div ref={containerRef} className={`rb-scroll-reveal ${containerClassName}`}>
      <p className={`rb-scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </div>
  );
}
