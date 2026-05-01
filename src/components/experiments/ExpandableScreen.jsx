import { createContext, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const ExpandableScreenContext = createContext(null);

export function useExpandableScreen() {
  return useContext(ExpandableScreenContext);
}

export function ExpandableScreen({
  children,
  defaultExpanded = false,
  onExpandChange,
  layoutId = "birthday-reveal",
  triggerRadius = "6px",
  contentRadius = "8px",
  animationDuration = 0.36,
  lockScroll = true
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  function expand() {
    setIsExpanded(true);
    onExpandChange?.(true);
  }

  function collapse() {
    setIsExpanded(false);
    onExpandChange?.(false);
  }

  useEffect(() => {
    if (!lockScroll) return undefined;
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded, lockScroll]);

  return (
    <ExpandableScreenContext.Provider value={{ isExpanded, expand, collapse, layoutId, triggerRadius, contentRadius, animationDuration }}>
      {children}
    </ExpandableScreenContext.Provider>
  );
}

export function ExpandableScreenTrigger({ children, className = "" }) {
  const { isExpanded, expand, layoutId, triggerRadius } = useExpandableScreen();

  return (
    <AnimatePresence initial={false}>
      {!isExpanded && (
        <motion.div className={`rb-expandable-screen-trigger ${className}`}>
          <motion.div className="rb-screen-morph" style={{ borderRadius: triggerRadius }} layout layoutId={layoutId} />
          <motion.div className="rb-screen-trigger-content" onClick={expand} initial={{ opacity: 0.9 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ExpandableScreenContent({ children, className = "", closeButtonClassName = "" }) {
  const { isExpanded, collapse, layoutId, contentRadius, animationDuration } = useExpandableScreen();

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className="rb-screen-overlay">
          <motion.div
            layout
            layoutId={layoutId}
            transition={{ duration: animationDuration }}
            style={{ borderRadius: contentRadius }}
            className={`rb-screen-content ${className}`}
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12, duration: 0.3 }}>
              {children}
            </motion.div>
            <button className={`rb-screen-close ${closeButtonClassName}`} onClick={collapse} aria-label="Close reveal">
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
