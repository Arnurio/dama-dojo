"use client";

/**
 * SiteBackground — global, calming, thematic background.
 *
 * Layers (all fixed, all pointer-events-none, all very low opacity):
 *   1. Subtle 8x8 checker grid — barely visible, gives "dama" texture
 *   2. Faded ♟️ glyphs at corners — thematic anchor without noise
 *   3. Two soft radial glows (indigo + purple) — spec-mandated calm warmth
 *
 * Designed to be dropped onto any page once. Stack-safe (z-0, pointer-events:none).
 */
export default function SiteBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1: subtle checker pattern — very faint */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #ffffff 25%, transparent 25%), " +
            "linear-gradient(-45deg, #ffffff 25%, transparent 25%), " +
            "linear-gradient(45deg, transparent 75%, #ffffff 75%), " +
            "linear-gradient(-45deg, transparent 75%, #ffffff 75%)",
          backgroundSize: "64px 64px",
          backgroundPosition: "0 0, 0 32px, 32px -32px, -32px 0px",
        }}
      />

      {/* Layer 2: brand glows */}
      <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-indigo-600/[0.06] blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-purple-600/[0.05] blur-3xl" />

      {/* Layer 3: thematic glyph anchors — large faded pawns */}
      <div
        className="absolute -top-12 -left-16 select-none"
        style={{
          fontSize: "20rem",
          lineHeight: 1,
          opacity: 0.025,
          transform: "rotate(-12deg)",
          filter: "blur(1px)",
        }}
      >
        ♟
      </div>
      <div
        className="absolute -bottom-20 -right-16 select-none"
        style={{
          fontSize: "24rem",
          lineHeight: 1,
          opacity: 0.025,
          transform: "rotate(8deg)",
          filter: "blur(1px)",
        }}
      >
        ♛
      </div>
    </div>
  );
}
