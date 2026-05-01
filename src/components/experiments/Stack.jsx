import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [18, -18]);
  const rotateY = useTransform(x, [-100, 100], [-18, 18]);

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return <motion.div className="rb-card-rotate-disabled">{children}</motion.div>;
  }

  return (
    <motion.div
      className="rb-card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function Stack({
  randomRotation = false,
  sensitivity = 120,
  cards = [],
  animationConfig = { stiffness: 240, damping: 22 },
  sendToBackOnClick = true,
  mobileClickOnly = true,
  mobileBreakpoint = 768
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [stack, setStack] = useState(() => cards.map((content, index) => ({ id: index + 1, content })));

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mobileBreakpoint]);

  useEffect(() => {
    setStack(cards.map((content, index) => ({ id: index + 1, content })));
  }, [cards]);

  function sendToBack(id) {
    setStack((previous) => {
      const nextStack = [...previous];
      const index = nextStack.findIndex((card) => card.id === id);
      const [card] = nextStack.splice(index, 1);
      nextStack.unshift(card);
      return nextStack;
    });
  }

  return (
    <div className="rb-stack-container">
      {stack.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 4 - 2 : 0;
        const isTopCard = index === stack.length - 1;

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={mobileClickOnly && isMobile}
          >
            <motion.div
              className="rb-stack-card"
              onClick={() => (sendToBackOnClick || isMobile) && isTopCard && sendToBack(card.id)}
              animate={{
                rotateZ: (stack.length - index - 1) * 3 + randomRotate,
                scale: 1 + index * 0.045 - stack.length * 0.045,
                y: (stack.length - index - 1) * 6,
                transformOrigin: "92% 92%"
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
