import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function BounceCards({
  className = "",
  images = [],
  containerWidth = 620,
  containerHeight = 340,
  animationDelay = 0.25,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.75)",
  transformStyles = [
    "rotate(-9deg) translate(-210px, 18px)",
    "rotate(5deg) translate(-105px, -16px)",
    "rotate(-2deg)",
    "rotate(7deg) translate(108px, 10px)",
    "rotate(-5deg) translate(214px, -8px)"
  ],
  enableHover = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".rb-bounce-card",
        { scale: 0, y: 22, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [animationStagger, easeType, animationDelay]);

  function getNoRotationTransform(transformStr) {
    return /rotate\([\s\S]*?\)/.test(transformStr)
      ? transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)")
      : `${transformStr} rotate(0deg)`;
  }

  function getPushedTransform(baseTransform, offsetX) {
    const translateRegex = /translate\(([-0-9.]+)px(?:,\s*([-0-9.]+)px)?\)/;
    const match = baseTransform.match(translateRegex);
    if (!match) return `${baseTransform} translate(${offsetX}px, 0)`;

    const currentX = parseFloat(match[1]);
    const currentY = match[2] ? parseFloat(match[2]) : 0;
    return baseTransform.replace(translateRegex, `translate(${currentX + offsetX}px, ${currentY}px)`);
  }

  function pushSiblings(hoveredIdx) {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const target = q(`.rb-bounce-card-${i}`);
      const baseTransform = transformStyles[i] || "none";
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: i === hoveredIdx ? getNoRotationTransform(baseTransform) : getPushedTransform(baseTransform, i < hoveredIdx ? -90 : 90),
        duration: 0.38,
        ease: "back.out(1.35)",
        overwrite: "auto"
      });
    });
  }

  function resetSiblings() {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const target = q(`.rb-bounce-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: transformStyles[i] || "none",
        duration: 0.38,
        ease: "back.out(1.35)",
        overwrite: "auto"
      });
    });
  }

  return (
    <div
      className={`rb-bounce-cards ${className}`}
      ref={containerRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((image, index) => (
        <figure
          className={`rb-bounce-card rb-bounce-card-${index}`}
          style={{ transform: transformStyles[index] ?? "none" }}
          onMouseEnter={() => pushSiblings(index)}
          onMouseLeave={resetSiblings}
          key={image.src || image}
        >
          <img src={image.src || image} alt={image.alt || `memory ${index + 1}`} draggable="false" />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
