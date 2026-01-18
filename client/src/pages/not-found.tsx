import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-red-950 px-4">
      <Card className="w-full max-w-md bg-zinc-900/90 border border-red-900 shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col items-center text-center py-12 gap-6">
          {/* Glitch 404 */}
          <h1
            className="glitch text-6xl font-extrabold text-red-600"
            data-text="404"
          >
            404
          </h1>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              Page Not Found
            </h2>
            <p className="text-sm text-red-400">
              This page doesn’t exist or was removed.
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

      {/* Glitch CSS */}
      <style jsx>{`
        .glitch {
          position: relative;
          animation: glitch-skew 2s infinite linear alternate-reverse;
        }

        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
        }

        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 red;
          clip-path: inset(0 0 50% 0);
          animation: glitch-top 1.5s infinite linear alternate-reverse;
        }

        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 black;
          clip-path: inset(50% 0 0 0);
          animation: glitch-bottom 1s infinite linear alternate-reverse;
        }

        @keyframes glitch-top {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, -3px);
          }
          40% {
            transform: translate(3px, 3px);
          }
          60% {
            transform: translate(-3px, 3px);
          }
          80% {
            transform: translate(3px, -3px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes glitch-bottom {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(3px, 3px);
          }
          40% {
            transform: translate(-3px, -3px);
          }
          60% {
            transform: translate(3px, -3px);
          }
          80% {
            transform: translate(-3px, 3px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes glitch-skew {
          0% {
            transform: skew(0deg);
          }
          50% {
            transform: skew(1deg);
          }
          100% {
            transform: skew(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
