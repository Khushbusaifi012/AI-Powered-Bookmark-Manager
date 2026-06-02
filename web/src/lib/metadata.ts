export type PageMetadata = {
  title: string;
  description?: string;
  favicon?: string;
  imageUrl?: string;
};

function getMetaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }

  return undefined;
}

function getLinkHref(html: string, rel: string): string | undefined {
  const pattern = new RegExp(
    `<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["']`,
    "i",
  );
  const reversePattern = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${rel}[^"']*["']`,
    "i",
  );

  return (
    html.match(pattern)?.[1] ?? html.match(reversePattern)?.[1]
  )?.trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : undefined;
}

function resolveUrl(base: string, value?: string): string | undefined {
  if (!value) return undefined;

  try {
    return new URL(value, base).href;
  } catch {
    return undefined;
  }
}

function googleFavicon(hostname: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`;
}

export async function fetchPageMetadata(url: string): Promise<PageMetadata> {
  const pageUrl = new URL(url);
  const hostname = pageUrl.hostname.replace(/^www\./, "");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MindMarkBot/1.0; +https://mindmark.local)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        title: hostname,
        favicon: googleFavicon(hostname),
      };
    }

    const html = await response.text();
    const finalUrl = response.url || url;

    const title =
      getMetaContent(html, "og:title") ??
      getMetaContent(html, "twitter:title") ??
      getTitle(html) ??
      hostname;

    const description =
      getMetaContent(html, "og:description") ??
      getMetaContent(html, "description") ??
      getMetaContent(html, "twitter:description");

    const imageUrl =
      resolveUrl(finalUrl, getMetaContent(html, "og:image")) ??
      resolveUrl(finalUrl, getMetaContent(html, "twitter:image")) ??
      resolveUrl(finalUrl, getLinkHref(html, "apple-touch-icon"));

    const iconFromLink =
      resolveUrl(finalUrl, getLinkHref(html, "icon")) ??
      resolveUrl(finalUrl, getLinkHref(html, "shortcut icon"));

    const favicon = iconFromLink ?? googleFavicon(hostname);

    return {
      title,
      description,
      favicon,
      imageUrl,
    };
  } catch {
    return {
      title: hostname,
      favicon: googleFavicon(hostname),
    };
  }
}
