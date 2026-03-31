import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

const PROJECT_ROOT = path.resolve(/* turbopackIgnore: true */ process.cwd());
const PAGES_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "pages");
const DEFAULT_PAGE = "index.html";
const NOT_FOUND_PAGE = "404.html";
const SCRIPT_TAG_REGEX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const ATTRIBUTE_REGEX = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const GLOBAL_SCRIPT_SOURCES = [
  "/js/env.config.js",
  "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
  "/js/shared.js",
  "/js/navigation.js",
  "/js/brand-enforcer.js"
];

function isWithinRoot(absolutePath) {
  return absolutePath === PROJECT_ROOT || absolutePath.startsWith(`${PROJECT_ROOT}${path.sep}`);
}

function toRouteParts(params) {
  const slug = params?.slug;
  if (!slug) return [];
  return Array.isArray(slug) ? slug : [slug];
}

function parseAttributes(attributeText = "") {
  const attributes = {};
  ATTRIBUTE_REGEX.lastIndex = 0;

  let match;
  while ((match = ATTRIBUTE_REGEX.exec(attributeText)) !== null) {
    const name = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? true;
    attributes[name.toLowerCase()] = value;
  }

  return attributes;
}

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractScripts(html = "") {
  const scripts = [];
  const strippedHtml = html.replace(SCRIPT_TAG_REGEX, (_raw, attributeText, content) => {
    scripts.push({
      attributes: parseAttributes(attributeText),
      content: content || ""
    });
    return "";
  });

  return {
    html: strippedHtml.trim(),
    scripts
  };
}

function resolveUrlFromFile(relativeUrl, relativeFilePath) {
  if (!relativeUrl) return "";
  if (/^(https?:)?\/\//i.test(relativeUrl)) return relativeUrl;
  if (relativeUrl.startsWith("/")) return relativeUrl;

  const baseDir = path.posix.dirname(`/${relativeFilePath}`);
  const baseUrl = `https://beforeyougo.local${baseDir.endsWith("/") ? baseDir : `${baseDir}/`}`;
  const resolvedUrl = new URL(relativeUrl, baseUrl);

  return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
}

function isGlobalScriptSource(src, relativeFilePath) {
  return GLOBAL_SCRIPT_SOURCES.includes(resolveUrlFromFile(src, relativeFilePath));
}

function normalizeScript(script, relativeFilePath) {
  const attributes = { ...script.attributes };
  if (attributes.src) {
    attributes.src = resolveUrlFromFile(attributes.src, relativeFilePath);
  }

  return {
    attributes,
    content: script.content
  };
}

function getAbsoluteTemplatePath(relativeFilePath) {
  const normalizedPath = relativeFilePath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (normalizedPath === DEFAULT_PAGE || normalizedPath === NOT_FOUND_PAGE) {
    return path.resolve(PROJECT_ROOT, normalizedPath);
  }

  if (normalizedPath.startsWith("pages/")) {
    return path.resolve(PAGES_ROOT, normalizedPath.slice("pages/".length));
  }

  return null;
}

async function fileExists(relativeFilePath) {
  const absoluteFilePath = getAbsoluteTemplatePath(relativeFilePath);
  if (!absoluteFilePath || !isWithinRoot(absoluteFilePath)) return false;

  try {
    await access(absoluteFilePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveLegacyFile(routeParts = []) {
  if (!routeParts.length) {
    return DEFAULT_PAGE;
  }

  const joinedPath = routeParts.join("/").replace(/^\/+|\/+$/g, "");
  const candidates = [joinedPath];

  if (!path.posix.extname(joinedPath)) {
    candidates.push(`${joinedPath}.html`);
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

const loadLegacyPageByFile = cache(async (relativeFilePath) => {
  const absoluteFilePath = getAbsoluteTemplatePath(relativeFilePath);
  if (!absoluteFilePath || !isWithinRoot(absoluteFilePath)) {
    throw new Error(`Unsupported legacy template path: ${relativeFilePath}`);
  }

  const rawHtml = await readFile(absoluteFilePath, "utf8");
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = rawHtml.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);
  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const bodyAttributes = parseAttributes(bodyMatch?.[1] || "");
  const headInner = (headMatch?.[1] || "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .trim();
  const bodyInner = bodyMatch?.[2] || "";
  const { html: headHtml, scripts: headScripts } = extractScripts(headInner);
  const { html: bodyHtml, scripts: bodyScripts } = extractScripts(bodyInner);

  return {
    relativeFilePath,
    routePath: relativeFilePath === DEFAULT_PAGE ? "/" : `/${relativeFilePath}`,
    title: decodeHtmlEntities((titleMatch?.[1] || "BeforeYouGo").trim()),
    bodyClassName: bodyAttributes.class || "",
    headHtml,
    headScripts: headScripts.map((script) => normalizeScript(script, relativeFilePath)),
    bodyHtml,
    pageScripts: bodyScripts
      .filter((script) => !(script.attributes.src && isGlobalScriptSource(script.attributes.src, relativeFilePath)))
      .map((script) => normalizeScript(script, relativeFilePath))
  };
});

export async function getLegacyPageByParams(params) {
  const resolvedParams = await Promise.resolve(params || {});
  const relativeFilePath = await resolveLegacyFile(toRouteParts(resolvedParams));
  if (!relativeFilePath) return null;
  return loadLegacyPageByFile(relativeFilePath);
}

export async function getLegacyPageByFile(relativeFilePath = NOT_FOUND_PAGE) {
  return loadLegacyPageByFile(relativeFilePath);
}

export { NOT_FOUND_PAGE };
