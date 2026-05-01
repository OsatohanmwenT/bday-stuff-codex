import React, { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const ExpandableContext = createContext(null);

export function useExpandable() {
  return useContext(ExpandableContext);
}

export function Expandable({ children, expanded, onToggle, className = "", transitionDuration = 0.32 }) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  function toggleExpand() {
    if (onToggle) {
      onToggle();
      return;
    }
    setInternalExpanded((value) => !value);
  }

  return (
    <ExpandableContext.Provider value={{ isExpanded, toggleExpand, transitionDuration }}>
      <motion.div className={className} layout transition={{ duration: transitionDuration, ease: "easeInOut" }}>
        {typeof children === "function" ? children({ isExpanded }) : children}
      </motion.div>
    </ExpandableContext.Provider>
  );
}

export function ExpandableTrigger({ children, className = "" }) {
  const { toggleExpand } = useExpandable();

  return (
    <div
      className={className}
      role="button"
      tabIndex="0"
      onClick={toggleExpand}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleExpand();
        }
      }}
    >
      {children}
    </div>
  );
}

export function ExpandableContent({ children, className = "" }) {
  const { isExpanded, transitionDuration } = useExpandable();

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          transition={{ duration: transitionDuration, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
