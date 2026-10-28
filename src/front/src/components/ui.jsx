/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, animate, useReducedMotion } from "framer-motion";

export const ease = [0.2, 0.7, 0.2, 1];

// Entra subindo quando aparece na tela (uma vez só)
export function Reveal({ children, delay = 0, y = 28, as = "div", className, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Título que revela palavra por palavra, de dentro de uma máscara
export function Words({ text, accent = [], className, delay = 0, as = "h1" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              className={`word ${accent.includes(i) ? "tick" : ""}`}
              initial={reduce ? false : { y: "115%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: delay + i * 0.07, ease }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

// Número que sobe até o valor quando entra na tela
export function Counter({ to, duration = 1.4, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, to, { duration, ease, onUpdate: (x) => setV(Math.round(x)) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return <span ref={ref}>{reduce ? to : v}{suffix}</span>;
}

export function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
