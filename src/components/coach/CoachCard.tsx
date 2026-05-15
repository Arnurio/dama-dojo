"use client";
import { Coach } from "@/lib/coaches";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  coach: Coach;
  unlocked?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function CoachCard({ coach, unlocked = true, selected = false, onClick, size = "md" }: Props) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: { card: "p-2", img: "h-24", emoji: "text-4xl", name: "text-xs", rating: "text-xs" },
    md: { card: "p-3", img: "h-36", emoji: "text-6xl", name: "text-sm", rating: "text-sm" },
    lg: { card: "p-4", img: "h-48", emoji: "text-7xl", name: "text-base", rating: "text-base" },
  }[size];

  const locked = !unlocked && coach.isPro;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left w-full",
        selected
          ? "border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)] scale-105"
          : locked
          ? "border-white/10 hover:border-white/20"
          : "border-white/20 hover:border-white/40 hover:scale-[1.03]",
        onClick && "cursor-pointer",
        sizes.card,
      )}
    >
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", coach.bgGradient)} />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)`,
        }}
      />

      {/* PRO badge */}
      {coach.isPro && (
        <div className="absolute top-2 right-2 z-20 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider shadow-lg">
          PRO
        </div>
      )}

      {/* Portrait area */}
      <div className={cn("relative z-10 flex items-center justify-center", sizes.img)}>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coach.imagePath}
            alt={coach.name}
            className="h-full w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={cn("drop-shadow-2xl group-hover:scale-110 transition-transform duration-300", sizes.emoji)}>
            {coach.avatar}
          </div>
        )}

        {/* Locked overlay */}
        {locked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20">
              <LockIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10 mt-2">
        <div className="flex items-center justify-between mb-1">
          <div className={cn("font-black text-white tracking-tight truncate drop-shadow", sizes.name)}>
            {coach.shortName}
          </div>
          <div className={cn(
            "font-black tabular-nums px-2 py-0.5 rounded-md backdrop-blur-sm shrink-0",
            "bg-black/40 text-white shadow-md",
            sizes.rating,
          )}>
            {coach.rating}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold drop-shadow truncate">
          {coach.title}
        </div>
        {size !== "sm" && (
          <div className="text-[10px] text-white/70 font-medium drop-shadow truncate mt-0.5">
            {coach.company}
          </div>
        )}
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-yellow-400 text-yellow-900 text-center text-[10px] font-black py-1 rounded-md tracking-wider shadow-lg">
          ✓ SELECTED
        </div>
      )}
    </button>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
