"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A marquee row you can also scroll yourself.
 *
 * The three moving rows on the site — the home product teaser, the client
 * wall, the brand wall on /products — used to be a `w-max` track inside an
 * `overflow-hidden` box, driven by a CSS `translateX` keyframe. Nothing about
 * that is reachable: hovering paused it, and that was the whole of the
 * interaction. If a card had already gone past, you waited for the loop to
 * bring it back, and on a phone there is no hover at all, so the row just
 * slid away under your thumb.
 *
 * So the clip becomes a real scroll port and the keyframe becomes a
 * rAF-driven `scrollLeft`. The row drifts on its own at exactly the old speed
 * and never stops for a passing cursor — a wall that freezes whenever the
 * mouse crosses it reads as broken, and the row is the page's only sign of
 * life. Instead a wheel, a swipe, a trackpad, a drag, the arrow keys or the
 * two buttons on the ends move it, and the drift picks up from wherever you
 * left it rather than snapping back — it only ever holds still for a tab in
 * the background or an OS reduced-motion setting. The list is shown twice,
 * so the loop stays seamless: when the offset passes one full copy we
 * subtract that copy's width, which is the same position on screen.
 *
 * Only the first copy comes from the server. Callers pass the list once and
 * the second copy is cloned from the first's DOM after mount. Rendered
 * twice, every card went out twice in the HTML and twice more in the RSC
 * payload (these children cross into a client component, so they are
 * serialised as well as painted) — the product row alone was most of the
 * home page's ~470 KB. The clone is aria-hidden and out of the tab order,
 * so a screen reader or a keyboard meets each card once, not twice.
 *
 * Both writing directions are handled by one sign flip. Under `dir="rtl"` a
 * scroll port's `scrollLeft` runs from 0 at the right edge down into the
 * negatives, so `pos` below is always the distance travelled from the start
 * edge whichever way that edge is, and only the write flips.
 */

/** How much faster than the drift a held button runs. */
const BOOST = 9;
/** A press shorter than this counts as a tap... */
const TAP_MS = 250;
/** ...and is stretched to this, so a click moves a card or two rather than a
    few pixels. Holding just keeps going. */
const NUDGE_MS = 420;

export default function MarqueeRow({
  children,
  /** Seconds for one full copy of the list to pass — the old animation-duration. */
  durationSeconds,
  className = "",
  trackClassName = "",
  ariaLabel,
  /* Opt-in, and only the product row opts in. On the two logo walls the
     buttons were furniture: nobody goes hunting through a client list or a
     brand list for a particular mark, and two more controls on a page that
     already has a header full of them is noise. Those rows still take a
     wheel, a swipe and a drag. */
  controls = false,
  backLabel,
  forwardLabel,
}: {
  children: ReactNode;
  durationSeconds: number;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
  controls?: boolean;
  backLabel?: string;
  forwardLabel?: string;
}) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  /* Held across the rAF loop and the handlers so neither re-renders the row:
     a marquee that set state every frame would re-render the whole card list
     sixty times a second. */
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(0);
  /** -1 rewinding, 0 drifting, +1 racing forward. */
  const boostRef = useRef(0);
  const pressedAtRef = useRef(0);
  const nudgeTimerRef = useRef<number | null>(null);

  /* The one thing that does belong in state: whether there is anything to
     scroll at all. It changes on resize, not per frame, and it decides
     whether the two buttons are painted. */
  const [scrollable, setScrollable] = useState(false);

  /* The second copy. React renders the clone container empty and never
     touches its contents, so filling it here cannot fight reconciliation. */
  useEffect(() => {
    const copy = copyRef.current;
    const clone = cloneRef.current;
    if (!copy || !clone) return;
    const fill = () => {
      clone.replaceChildren(...Array.from(copy.childNodes, (n) => n.cloneNode(true)));
      clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      clone
        .querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]")
        .forEach((n) => n.setAttribute("tabindex", "-1"));
    };
    fill();
    /* Children can grow after mount — the home teaser's deferred cards do —
       and the clone has to follow or the loop would show a gap. Only child
       additions and removals are watched, not attributes, so an image
       finishing loading does not trigger a re-clone. */
    const mo = new MutationObserver(fill);
    mo.observe(copy, { childList: true });
    return () => mo.disconnect();
  }, [children]);

  /* Cloned links are plain anchors with no Next router behind them, so a
     click on one would be a full page load. Route it the way the original
     card's <Link> would; modified clicks (new tab, etc.) are left alone. */
  const onCloneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a");
    if (!a || a.target || a.origin !== window.location.origin) return;
    e.preventDefault();
    router.push(a.pathname + a.search + a.hash);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const rtl = getComputedStyle(el).direction === "rtl";
    const sign = rtl ? -1 : 1;

    /* One copy of the list. Everything below is measured off this, so it is
       re-read on resize — the cards are responsive and the row is not. */
    let copyWidth = 0;
    const measure = () => {
      /* Start of the first copy to the start of the second: one copy plus
         the gap between them, which is exactly one period of the loop. Read
         off the containers, so it holds even before the clone is filled. */
      const copy = copyRef.current;
      const clone = cloneRef.current;
      copyWidth =
        copy && clone ? Math.abs(clone.offsetLeft - copy.offsetLeft) : el.scrollWidth / 2;
      setScrollable(copyWidth > el.clientWidth);
    };
    measure();

    /* Fewer items than fit on screen: there is no seam to cross and nowhere
       to scroll, so leave the row alone entirely. */
    const loops = () => copyWidth > el.clientWidth;

    /* Fold an offset back into the first copy. Negative values wrap too, so
       rewinding past the start comes out at the far end. */
    const wrap = (p: number) => ((p % copyWidth) + copyWidth) % copyWidth;

    /*
     * The offset lives here, in a float, and the DOM is only ever written to.
     *
     * Reading `scrollLeft` back each frame and adding to it does not work at
     * this speed. The product row is 19 cards over 203 seconds — 32px/s, or
     * 0.54px in a 60fps frame. A browser snaps `scrollLeft` to a device pixel,
     * so that write lands on the pixel we were already on, the next read comes
     * back where we started, and the row sits still forever. It was the drift
     * alone that stalled: a held button runs at nine times the speed, 4.8px a
     * frame, which clears the rounding and moved fine. Keeping the real number
     * in JS and letting the fractions accumulate is the whole fix.
     */
    let pos = sign * el.scrollLeft;
    let written = pos;
    const writePos = (p: number) => {
      pos = p;
      written = p;
      el.scrollLeft = sign * p;
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let last = 0;
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (dt === 0 || !loops() || draggingRef.current) return;

      const drift = copyWidth / durationSeconds;
      let v: number;
      if (boostRef.current !== 0) {
        /* A button press is the reader asking for movement, so it runs even
           under reduced motion — nobody presses a button expecting nothing. */
        v = drift * BOOST * boostRef.current;
      } else if (document.hidden || reduceMotion.matches) {
        /* The only two holds left, and neither is something the reader did on
           purpose: a tab in the background (nothing to see) and an OS-level
           request for less motion. Focus used to hold it too — it doesn't now.
           Everything else keeps moving, which is what was asked for. */
        return;
      } else {
        v = drift;
      }
      writePos(wrap(pos + v * dt));
    };
    frame = requestAnimationFrame(step);

    /*
     * A scroll the row did not cause — a wheel, a swipe, a drag, a fling —
     * and `pos` has to adopt it or the next frame would yank the row back to
     * where the drift had got to.
     *
     * Told apart from our own writes by distance, not by a flag: scroll events
     * are delivered asynchronously and can coalesce, so a flag set before the
     * write is not reliably still standing when the event arrives. The browser
     * only ever rounds our write by under a pixel, and no real gesture moves
     * the row by two, so the gap is unambiguous.
     */
    const onScroll = () => {
      if (!loops()) return;
      const dom = sign * el.scrollLeft;
      if (Math.abs(dom - written) <= 2) return;
      /* Mid-drag and mid-fling the seam is left alone: rewriting scrollLeft
         under a moving finger kills the momentum. The next idle frame folds
         it back instead. */
      pos = draggingRef.current ? dom : wrap(dom);
      written = dom;
      if (!draggingRef.current && pos !== dom) writePos(pos);
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    /* The copy widens when deferred children mount, which changes the loop
       period without resizing the scroll port. */
    if (copyRef.current) ro.observe(copyRef.current);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (nudgeTimerRef.current !== null) clearTimeout(nudgeTimerRef.current);
    };
  }, [durationSeconds]);

  /* Click-and-drag, for a mouse with no horizontal wheel. Touch and trackpad
     already scroll natively, so pointerdown is only intercepted for a mouse —
     calling setPointerCapture on a touch would take the gesture away from the
     browser's own panning. */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    draggingRef.current = true;
    dragMovedRef.current = 0;
    const startX = e.clientX;
    const startScroll = el.scrollLeft;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      dragMovedRef.current = Math.max(dragMovedRef.current, Math.abs(dx));
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  /* A drag that ends on a card must not also open it. Caught on the way down
     so the card's own link never sees the click. */
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragMovedRef.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      dragMovedRef.current = 0;
    }
  };

  /* Both take the triggering event's `timeStamp` rather than reading a clock.
     It is the same high-resolution origin as performance.now(), it is data the
     handler was already handed, and the React compiler's purity rule rejects
     calling a clock from a function declared in render scope. */
  const startBoost = (dir: 1 | -1, at: number) => {
    if (nudgeTimerRef.current !== null) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
    boostRef.current = dir;
    pressedAtRef.current = at;
  };

  /* One button covers both jobs: hold it and the row races for as long as you
     hold, tap it and the press is stretched to NUDGE_MS — a real click lasts
     about 80ms and would otherwise twitch the row a few pixels and stop. */
  const endBoost = (at: number) => {
    if (boostRef.current === 0) return;
    const held = at - pressedAtRef.current;
    if (held >= TAP_MS) {
      boostRef.current = 0;
      return;
    }
    nudgeTimerRef.current = window.setTimeout(() => {
      boostRef.current = 0;
      nudgeTimerRef.current = null;
    }, NUDGE_MS - held);
  };

  const arrow = (dir: 1 | -1, label: string | undefined) => (
    <button
      type="button"
      aria-label={label}
      /* Pinned to the row's own ends, which `start`/`end` resolve per reading
         direction; the chevron is flipped with them, so in Arabic the button
         on the right is still the one that rewinds. */
      className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center
        w-10 h-10 bg-white/95 border border-rule text-pine
        hover:bg-pine hover:text-white active:bg-field active:text-white
        transition-colors ${dir === -1 ? "start-0" : "end-0"}`}
      /* The row scrolls on touch, so a finger held on the button would
         otherwise start panning it instead of driving it. */
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.preventDefault();
        startBoost(dir, e.timeStamp);
      }}
      onPointerUp={(e) => endBoost(e.timeStamp)}
      onPointerLeave={(e) => endBoost(e.timeStamp)}
      onPointerCancel={(e) => endBoost(e.timeStamp)}
      /* Space and Enter hold the same way a pointer does, so a keyboard can
         race the row too rather than only nudge it. */
      onKeyDown={(e) => {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (!e.repeat) startBoost(dir, e.timeStamp);
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") endBoost(e.timeStamp);
      }}
      onBlur={(e) => endBoost(e.timeStamp)}
    >
      {dir === -1 ? (
        <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
      ) : (
        <ChevronRight className="w-5 h-5 rtl:rotate-180" />
      )}
    </button>
  );

  return (
    <div className="relative w-full">
      <div
        ref={scrollerRef}
        /* Focusable and labelled: a scroll port that only a mouse or a finger
           can reach fails WCAG 2.1.1, and once it takes focus the arrow keys
           and Home/End drive it for free. */
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        /* The caller's mask rides on the scroll port itself rather than on the
           wrapper. On the wrapper it would fade the two buttons out along with
           the cards — they sit exactly at the 0% and 100% stops, where the
           gradient is fully transparent. */
        className={`marquee-scroller flex w-full overflow-x-auto cursor-grab active:cursor-grabbing ${className}`}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        <div className={`flex w-max ${trackClassName}`}>
          <div ref={copyRef} className={`flex shrink-0 ${trackClassName}`}>
            {children}
          </div>
          <div
            ref={cloneRef}
            aria-hidden="true"
            className={`flex shrink-0 ${trackClassName}`}
            onClick={onCloneClick}
          />
        </div>
      </div>

      {controls && scrollable && (
        <>
          {arrow(-1, backLabel)}
          {arrow(1, forwardLabel)}
        </>
      )}
    </div>
  );
}
