import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react";

const HARDCODED_BANNER_TEXT =
  "The account of the Owner was hacked. He made a new Discord account now, it's called **arsija_net**. The Discord Link will switch soon, please switch as soon as possible!";

export function Banner() {
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const text = HARDCODED_BANNER_TEXT;
  const visible = text.trim().length > 0 && !dismissed;

  useEffect(() => {
    const el = ref.current;
    if (!visible || !el) {
      document.documentElement.style.setProperty("--banner-h", "0px");
      return;
    }
    const update = () => {
      document.documentElement.style.setProperty("--banner-h", `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      document.documentElement.style.setProperty("--banner-h", "0px");
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={ref}
          key="banner"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[70] bg-primary/95 backdrop-blur-sm text-primary-foreground px-4 py-2.5 text-sm shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 prose prose-sm prose-invert max-w-none [&>*]:my-0 [&>p]:leading-snug">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:opacity-80"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Banner schließen"
              className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
