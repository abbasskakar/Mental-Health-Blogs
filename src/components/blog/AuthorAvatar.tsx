import { cn } from "@/lib/utils";

interface AuthorAvatarProps {
  name: string;
  src?: string | null;
  /** Size, shape and text size, e.g. "w-16 h-16 rounded-2xl text-2xl". */
  className?: string;
}

/**
 * The author's photo when one is set, otherwise their initial on the accent
 * colour — the look every byline had before photos existed.
 */
export default function AuthorAvatar({ name, src, className }: AuthorAvatarProps) {
  if (src) {
    return (
      // A plain <img>: photos can be any pasted URL, which next/image would
      // refuse unless its host were whitelisted in next.config.ts.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        className={cn("object-cover flex-shrink-0 bg-surface-alt", className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center text-white font-bold flex-shrink-0 bg-accent", className)}
    >
      {name.charAt(0)}
    </div>
  );
}
