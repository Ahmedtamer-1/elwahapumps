"use client";

import React, { useEffect, useRef, useState } from "react";
// maplibre-gl v6 is ESM with named exports only — there is no default export
// to namespace-import, unlike the `maplibregl.Map` form in older examples.
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  LngLatBounds,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  ScaleControl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { internationalPhone, whatsAppLink, type Distributor } from "@/data/distributors";

/**
 * The distributor map.
 *
 * Raster basemap, not vector. The first build used CARTO's vector Positron
 * style and rendered a blank white canvas — markers and attribution appeared
 * (both plain DOM) while no tile ever painted, which is the signature of the
 * vector pipeline failing somewhere between the worker, the glyph fetch and
 * the sprite fetch. Raster tiles are just PNGs the browser decodes: no
 * glyphs, no sprite sheet, no vector parsing, nothing in that chain to break.
 *
 * Voyager is also much closer to what people mean by "looks like Google Maps"
 * than Positron, which is a deliberately near-blank cartographic backdrop.
 */

interface DistributorMapProps {
  distributors: Distributor[];
  lang: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * CARTO Voyager raster tiles — free, no API key, four subdomains.
 * `@2x` serves retina tiles, which is what stops the labels looking soft on
 * a phone or a high-DPI laptop.
 */
const RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      // 256, not 512, even though the @2x images are 512px: tileSize is the
      // geographic footprint of a tile, and an @2x tile covers the same
      // ground as its 1x counterpart at twice the resolution. Setting 512
      // here would offset every zoom level by one.
      tileSize: 256,
      maxzoom: 20,
      attribution:
        '© <a href="https://carto.com/attributions">CARTO</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    // A ground colour under the tiles, so a slow tile load shows land rather
    // than a white flash.
    { id: "background", type: "background", paint: { "background-color": "#e8e4da" } },
    { id: "carto", type: "raster", source: "carto" },
  ],
};

/** Egypt, as a fallback frame when there is nothing to fit to. */
const EGYPT_CENTER: [number, number] = [30.0, 27.6];

/**
 * MapLibre v6 requires WebGL2 and paints nothing without it — no error on
 * screen, just an empty box. Locked-down work machines, remote desktop
 * sessions and blocked GPU drivers all hit this, so it is worth detecting
 * rather than serving a blank rectangle nobody can explain.
 */
function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

/** A teardrop pin, so it reads as a map marker rather than a dot. */
function createPinElement(): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "elw-pin";
  el.innerHTML = `
    <svg viewBox="0 0 24 32" width="28" height="37" aria-hidden="true">
      <path class="elw-pin__body"
            d="M12 0C5.4 0 0 5.4 0 12c0 8.5 10.4 18.9 10.9 19.3a1.6 1.6 0 0 0 2.2 0C13.6 30.9 24 20.5 24 12 24 5.4 18.6 0 12 0z"/>
      <circle class="elw-pin__eye" cx="12" cy="12" r="4.4"/>
    </svg>
  `;
  return el;
}

/**
 * Popup contents, built with textContent rather than an HTML string.
 *
 * Distributor names and cities are typed into the admin, so interpolating
 * them into innerHTML would be an injection route straight onto the public
 * page. Building nodes and assigning text keeps that impossible.
 */
function createPopupContent(
  d: Distributor,
  lang: string,
): HTMLElement {
  const isAr = lang === "ar";
  const root = document.createElement("div");
  root.className = "elw-popup";
  root.setAttribute("dir", isAr ? "rtl" : "ltr");

  const name = document.createElement("p");
  name.className = "elw-popup__name";
  name.textContent = d.name;
  root.appendChild(name);

  const city = document.createElement("p");
  city.className = "elw-popup__city";
  city.textContent = isAr ? d.city.ar : d.city.en;
  root.appendChild(city);

  const actions = document.createElement("div");
  actions.className = "elw-popup__actions";

  const call = document.createElement("a");
  call.className = "elw-popup__btn elw-popup__btn--primary";
  call.href = `tel:${internationalPhone(d.phone)}`;
  call.textContent = d.phone;
  call.setAttribute("dir", "ltr");
  actions.appendChild(call);

  const wa = document.createElement("a");
  wa.className = "elw-popup__btn";
  wa.href = whatsAppLink(d.phone, lang);
  wa.target = "_blank";
  wa.rel = "noopener noreferrer";
  wa.textContent = isAr ? "واتساب" : "WhatsApp";
  actions.appendChild(wa);

  const maps = document.createElement("a");
  maps.className = "elw-popup__btn";
  maps.href = d.mapUrl;
  maps.target = "_blank";
  maps.rel = "noopener noreferrer";
  maps.textContent = isAr ? "الاتجاهات" : "Directions";
  actions.appendChild(maps);

  root.appendChild(actions);
  return root;
}

export default function DistributorMap({
  distributors,
  lang,
  selectedId,
  onSelect,
}: DistributorMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  // The click handler changes on every render; hold it in a ref so the effect
  // that builds the map can stay dependency-free and run once.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [unsupported, setUnsupported] = useState(false);

  const isAr = lang === "ar";

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (!hasWebGL2()) {
      setUnsupported(true);
      return;
    }

    const map = new MapLibreMap({
      container: containerRef.current,
      style: RASTER_STYLE,
      center: EGYPT_CENTER,
      zoom: 4.6,
      // A flat road map, not a globe to tilt and spin.
      pitchWithRotate: false,
      dragRotate: false,
      touchZoomRotate: true,
      // Ctrl/⌘ + wheel to zoom, two fingers on touch. Without this the map
      // swallows the page scroll the moment the cursor crosses it.
      cooperativeGestures: true,
      attributionControl: { compact: true },
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new FullscreenControl(), "top-right");
    map.addControl(
      new GeolocateControl({ trackUserLocation: false, showAccuracyCircle: true }),
      "top-right",
    );
    map.addControl(new ScaleControl({ maxWidth: 90, unit: "metric" }), "bottom-left");

    // Surfaced rather than swallowed: v6 requires WebGL2, and a machine
    // without it fails here with a message worth seeing in the console.
    map.on("error", (e) => {
      console.error("[DistributorMap]", e.error?.message ?? e);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // The map instance is created once and torn down on unmount. The pins on
    // it are a separate concern, handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pins and their popups, rebuilt whenever the distributor list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const marker of Object.values(markersRef.current)) marker.remove();
    markersRef.current = {};

    for (const d of distributors) {
      const el = createPinElement();
      el.setAttribute("aria-label", `${d.name} — ${isAr ? d.city.ar : d.city.en}`);
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current(d.id);
      });

      const popup = new Popup({
        offset: 34,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "260px",
        className: "elw-popup-shell",
      }).setDOMContent(createPopupContent(d, lang));

      markersRef.current[d.id] = new Marker({ element: el, anchor: "bottom" })
        .setLngLat(d.coords)
        .setPopup(popup)
        .addTo(map);
    }

    // Frame every pin rather than trusting a hardcoded zoom — the network can
    // grow from the admin, and a fixed frame would eventually cut pins off.
    if (distributors.length > 0) {
      const bounds = new LngLatBounds();
      for (const d of distributors) bounds.extend(d.coords);
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 50, right: 50 },
        maxZoom: 9,
        duration: 0,
      });
    }

    return () => {
      for (const marker of Object.values(markersRef.current)) marker.remove();
      markersRef.current = {};
    };
  }, [distributors, isAr, lang]);

  // Fly to whichever distributor the list selected, mark its pin, open its card.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, marker] of Object.entries(markersRef.current)) {
      const active = id === selectedId;
      marker.getElement().classList.toggle("elw-pin--active", active);
      if (!active && marker.getPopup()?.isOpen()) marker.togglePopup();
    }

    if (!selectedId) return;
    const target = distributors.find((d) => d.id === selectedId);
    const marker = markersRef.current[selectedId];
    if (!target || !marker) return;

    map.flyTo({ center: target.coords, zoom: 11, duration: 900, essential: true });
    if (!marker.getPopup()?.isOpen()) marker.togglePopup();
  }, [selectedId, distributors]);

  if (unsupported) {
    // The list beside this map still carries every phone number, so the page
    // stays usable — say plainly what happened instead of showing a void.
    return (
      <div className="flex h-[460px] w-full flex-col items-center justify-center border border-rule bg-bone p-8 text-center sm:h-[560px]">
        <p className="text-[15px] font-semibold text-ink">
          {isAr
            ? "تعذّر عرض الخريطة على هذا المتصفح"
            : "The map can't be displayed in this browser"}
        </p>
        <p className="mt-2 max-w-md text-[13px] leading-5 text-stone">
          {isAr
            ? "الخريطة تحتاج WebGL2، وهو غير متاح هنا. قائمة الموزّعين بالكامل بأرقام الهواتف موجودة بجانب هذا الإطار، ويفتح زر «الخريطة» موقع كل موزّع على خرائط جوجل."
            : "The map needs WebGL2, which isn't available here. The full distributor list with phone numbers is beside this panel, and each “Maps” button opens that distributor on Google Maps."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[460px] w-full border border-rule bg-bone sm:h-[560px]"
        // MapLibre renders its own canvas; this label is what a screen reader
        // gets, since the pin buttons sit inside the canvas overlay.
        role="application"
        aria-label={isAr ? "خريطة موزّعي شركة الواحة" : "Map of El Waha distributors"}
      />

      <p className="mt-2 font-mono text-[11px] leading-4 text-stone">
        {isAr
          ? "اسحب للتحريك، و Ctrl + عجلة الفأرة للتكبير (أو إصبعين على الجوال). اضغط على أي علامة لعرض بيانات الموزّع."
          : "Drag to pan, Ctrl + scroll to zoom (two fingers on mobile). Tap a pin for the distributor's details."}
      </p>

      {/* Scoped to this component: pins and popup contents are DOM nodes
          created outside React, so they cannot carry Tailwind classes. */}
      <style>{`
        .elw-pin {
          display: block;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          line-height: 0;
        }
        .elw-pin__body {
          fill: var(--color-pine);
          stroke: var(--color-bone);
          stroke-width: 1.5;
          transition: fill 160ms ease;
        }
        .elw-pin__eye { fill: var(--color-bone); }
        .elw-pin svg {
          filter: drop-shadow(0 2px 3px rgba(20, 20, 20, 0.4));
          transition: transform 160ms ease;
          transform-origin: 50% 100%;
        }
        .elw-pin:hover svg { transform: scale(1.12); }
        .elw-pin--active svg { transform: scale(1.25); }
        .elw-pin--active .elw-pin__body { fill: var(--color-brass); }
        .elw-pin--active .elw-pin__eye { fill: var(--color-pine); }
        @media (prefers-reduced-motion: reduce) {
          .elw-pin svg, .elw-pin__body { transition: none; }
        }

        /* Popup, in the site's palette rather than MapLibre's default white
           rounded bubble. */
        .elw-popup-shell .maplibregl-popup-content {
          padding: 14px;
          border: 1px solid var(--color-rule);
          border-top: 3px solid var(--color-pine);
          border-radius: 0;
          box-shadow: 0 6px 20px rgba(20, 20, 20, 0.16);
          background: #fff;
        }
        .elw-popup-shell .maplibregl-popup-tip { display: none; }
        .elw-popup-shell .maplibregl-popup-close-button {
          font-size: 18px;
          color: var(--color-stone);
          padding: 2px 7px;
        }
        .elw-popup__name {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0;
        }
        .elw-popup__city {
          font-size: 12px;
          color: var(--color-stone);
          margin: 2px 0 0;
        }
        .elw-popup__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--color-rule-light);
        }
        .elw-popup__btn {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          font-size: 11.5px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid var(--color-rule);
          color: var(--color-stone);
          transition: border-color 160ms ease, color 160ms ease;
        }
        .elw-popup__btn:hover {
          border-color: var(--color-pine);
          color: var(--color-pine);
        }
        .elw-popup__btn--primary {
          background: var(--color-pine);
          border-color: var(--color-pine);
          color: var(--color-bone);
          font-family: var(--font-mono), monospace;
        }
        .elw-popup__btn--primary:hover {
          background: var(--color-field);
          color: var(--color-bone);
        }

        /* MapLibre's chrome, brought into the palette. */
        .maplibregl-ctrl-group {
          border-radius: 0 !important;
          border: 1px solid var(--color-rule) !important;
          box-shadow: none !important;
        }
        .maplibregl-ctrl-attrib, .maplibregl-ctrl-scale {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
