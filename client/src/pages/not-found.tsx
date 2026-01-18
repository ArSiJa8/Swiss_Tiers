import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-red-950 px-4">
      <Card className="w-full max-w-md bg-zinc-900/90 border border-red-900 shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col items-center text-center py-12 gap-6">
          {/* Glitch 404 */}
          <h1
            className="glitch text-6xl font-extrabold text-red-600 relative"
            data-text="404"
            style={{
              animation: "glitch-skew 2s infinite linear alternate-reverse",
            }}
          >
            404
          </h1>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              Page Not Found
            </h2>
            <p className="text-sm text-red-400">
              This page doesn't exist or was removed.
            </p>
          </div>

          <p className="text-sm text-zinc-400 max-w-sm">
            The link may be broken, or you may have typed the address incorrectly.
          </p>

          <Button
            asChild
            className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
