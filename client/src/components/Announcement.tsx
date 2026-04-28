import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Megaphone, X } from "lucide-react";

export function Announcement() {
  const [dismissed, setDismissed] = useState(false);
  const [seenKey, setSeenKey] = useState<string | null>(null);

  const { data: configData } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch config");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  const isEnabled = configData?.announcementEnabled === "true";
  const title = (configData?.announcementTitle ?? "").trim();
  const message = (configData?.announcementMessage ?? "").trim();

  const currentKey = `${title}::${message}`;

  useEffect(() => {
    if (!isEnabled || !message) return;
    try {
      const stored = localStorage.getItem("swisstiers:announcement-seen");
      setSeenKey(stored);
    } catch {
      setSeenKey(null);
    }
  }, [isEnabled, message]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("swisstiers:announcement-seen", currentKey);
    } catch {
      // ignore
    }
  };

  const visible =
    isEnabled &&
    message.length > 0 &&
    !dismissed &&
    seenKey !== currentKey;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="announcement-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={handleDismiss}
          data-testid="overlay-announcement"
        >
          <motion.div
            key="announcement-card"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-primary/20 bg-card/90 backdrop-blur-xl p-8 shadow-2xl shadow-primary/20"
            data-testid="card-announcement"
          >
            <button
              onClick={handleDismiss}
              aria-label="Schließen"
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
              data-testid="button-announcement-close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <div className="text-xs uppercase tracking-widest font-bold text-primary">
                Ankündigung
              </div>
            </div>

            {title && (
              <h2
                className="text-2xl md:text-3xl font-display font-black tracking-tight text-white mb-3"
                data-testid="text-announcement-title"
              >
                {title}
              </h2>
            )}

            <div
              className="prose prose-invert max-w-none text-base [&>*]:text-white/90"
              data-testid="text-announcement-message"
            >
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline font-semibold hover:opacity-80"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message}
              </ReactMarkdown>
            </div>

            <button
              onClick={handleDismiss}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-primary/20"
              data-testid="button-announcement-confirm"
            >
              Verstanden
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
