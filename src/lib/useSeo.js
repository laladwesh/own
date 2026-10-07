import { useEffect } from "react";
import { SITE } from "./seo.js";

// Sets <title> and the description / Open Graph / Twitter tags for the current route, and puts
// the old ones back when the route changes. (The build also writes the same tags into the
// prerendered HTML so crawlers that don't run JavaScript see them.)
const upsert = (selector, make) => {
  let el = document.head.querySelector(selector);
  const created = !el;
  if (!el) {
    el = make();
    document.head.appendChild(el);
  }
  return { el, created };
};

export const useSeo = (seo) => {
  useEffect(() => {
    if (!seo) return undefined;
    const undo = [];

    const prevTitle = document.title;
    document.title = seo.title;
    undo.push(() => {
      document.title = prevTitle;
    });

    const setMeta = (attr, key, content) => {
      const { el, created } = upsert(`meta[${attr}="${key}"]`, () => {
        const m = document.createElement("meta");
        m.setAttribute(attr, key);
        return m;
      });
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      undo.push(() => (created ? el.remove() : el.setAttribute("content", prev ?? "")));
    };

    const url = `${SITE}${seo.path}`;
    if (seo.noindex) {
      setMeta("name", "robots", "noindex");
    } else if (seo.descriptionOnly) {
      setMeta("name", "description", seo.description);
    } else {
      setMeta("name", "description", seo.description);
      setMeta("property", "og:type", "article");
      setMeta("property", "og:site_name", "Avinash Gupta");
      setMeta("property", "og:title", seo.title);
      setMeta("property", "og:description", seo.description);
      setMeta("property", "og:url", url);
      setMeta("property", "og:image", seo.image);
      setMeta("property", "og:image:width", "1200");
      setMeta("property", "og:image:height", "630");
      setMeta("property", "og:image:alt", seo.imageAlt);
      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:title", seo.title);
      setMeta("name", "twitter:description", seo.description);
      setMeta("name", "twitter:image", seo.image);

      const { el, created } = upsert('link[rel="canonical"]', () => {
        const l = document.createElement("link");
        l.rel = "canonical";
        return l;
      });
      const prev = el.getAttribute("href");
      el.setAttribute("href", url);
      undo.push(() => (created ? el.remove() : el.setAttribute("href", prev ?? "")));
    }

    return () => undo.reverse().forEach((fn) => fn());
  }, [seo]);
};
