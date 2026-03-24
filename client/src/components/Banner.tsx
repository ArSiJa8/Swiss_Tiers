import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react";

export function Banner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: configData } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch config");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  const isEnabled = configData?.bannerEnabled === "true";
  const text = configData?.bannerText ?? "";

  const visible = isEnabled && text.trim().length > 0 && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="banner"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 text-sm relative"
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
