import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function About() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
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
  );
}
