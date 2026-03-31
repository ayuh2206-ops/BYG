import { readFile } from "node:fs/promises";
import path from "node:path";

const JS_ROOT = path.resolve(/* turbopackIgnore: true */ process.cwd(), "js");
const CONTENT_TYPES = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8"
};

function isWithinJsRoot(absolutePath) {
  return absolutePath === JS_ROOT || absolutePath.startsWith(`${JS_ROOT}${path.sep}`);
}

export async function GET(_request, context) {
  const params = await Promise.resolve(context.params || {});
  const fileParts = Array.isArray(params.file) ? params.file : [];
  const requestedPath = path.resolve(JS_ROOT, ...fileParts);

  if (!isWithinJsRoot(requestedPath)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileContents = await readFile(requestedPath);
    const extension = path.extname(requestedPath).toLowerCase();

    return new Response(fileContents, {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
