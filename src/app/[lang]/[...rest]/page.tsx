import { notFound } from "next/navigation";

/**
 * Catches any path under a valid locale that doesn't match a real route
 * (e.g. /ar/some-made-up-page) and routes it through the same not-found.tsx
 * boundary as an explicit notFound() call, instead of an unstyled 404 with
 * no site chrome.
 */
export default function CatchAll() {
  notFound();
}
