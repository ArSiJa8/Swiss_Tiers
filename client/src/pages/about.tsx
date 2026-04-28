import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiDiscord } from "react-icons/si";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { config as siteConfig } from "@/lib/config";

export default function About() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const discordClickMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/analytics/discord-click"),
  });

  const { data: apiConfig } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      return res.json();
    }
  });

  const discordVisible = apiConfig ? apiConfig.discordInviteEnabled !== "false" : true;

  const handleDiscordClick = () => {
    discordClickMutation.mutate();
    const url = (apiConfig?.discordInviteUrl ?? "").trim() || siteConfig.socials.discord;
    window.open(url, "_blank");
  };

  useEffect(() => {
    fetch("/about-us.md")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load about-us.md", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logos/main-logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-black text-xl tracking-tighter text-white">SWISS TIERS</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/about" className="text-white text-sm font-bold transition-all border-b-2 border-primary pb-1">ABOUT</a>
          {discordVisible && (
            <button
              onClick={handleDiscordClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#5865F2]/20"
              data-testid="button-discord-nav-about"
            >
              <SiDiscord className="w-5 h-5" />
              <span className="hidden sm:inline">JOIN DISCORD</span>
            </button>
          )}
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 md:px-8">
        <Card className="max-w-4xl mx-auto bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-white/5 bg-white/5 p-8">
            <CardTitle className="text-4xl font-display font-black tracking-tighter text-white uppercase">
              About Us
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 prose prose-invert prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-primary max-w-none">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/3 bg-white/5" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-[90%] bg-white/5" />
                  <Skeleton className="h-4 w-[95%] bg-white/5" />
                </div>
                <Skeleton className="h-32 w-full bg-white/5" />
              </div>
            ) : (
              <ReactMarkdown>{content || ""}</ReactMarkdown>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
