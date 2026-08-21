import Link from "next/link";
import { Home, ArrowLeft, Search, Brain } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[8rem] font-black text-accent leading-none select-none">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 rounded-full bg-accent-subtle flex items-center justify-center">
              <Brain className="w-10 h-10 text-accent" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-heading mb-3">
          Page Not Found
        </h1>
        <p className="text-body mb-8 leading-relaxed">
          Looks like this page took a mental health day! Don't worry — let's get you back on your wellness journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-line text-body font-semibold hover:border-accent hover:text-accent transition-colors"
          >
            <Search className="w-4 h-4" /> Browse Articles
          </Link>
        </div>

        {/* Popular links */}
        <div className="mt-10 p-5 rounded-2xl bg-surface-alt border border-line">
          <p className="text-sm font-semibold text-body mb-3">Popular Articles</p>
          <div className="space-y-2">
            {["Understanding Anxiety", "Mindfulness for Depression", "Setting Healthy Boundaries"].map((title) => (
              <Link
                key={title}
                href="/blog"
                className="flex items-center gap-2 text-sm text-faint hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-3 h-3 rotate-180" /> {title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
