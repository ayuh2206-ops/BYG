const BOOLEAN_ATTRIBUTES = new Set([
  "async",
  "defer",
  "nomodule"
]);

const ATTRIBUTE_NAME_MAP = {
  class: "className",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
  nomodule: "noModule",
  referrerpolicy: "referrerPolicy"
};

function scriptPropsFromAttributes(attributes = {}) {
  return Object.entries(attributes).reduce((props, [name, value]) => {
    const propName = ATTRIBUTE_NAME_MAP[name] || name;

    if (BOOLEAN_ATTRIBUTES.has(name)) {
      props[propName] = value === true || value === "" || value === name;
      return props;
    }

    props[propName] = value === true ? "" : value;
    return props;
  }, {});
}

function ScriptTag({ script, scriptKey }) {
  const props = scriptPropsFromAttributes(script.attributes);

  if (props.src) {
    return <script key={scriptKey} {...props} />;
  }

  return (
    <script
      key={scriptKey}
      {...props}
      dangerouslySetInnerHTML={{ __html: script.content }}
    />
  );
}

export default function LegacyPageRenderer({ page }) {
  const bodyBootstrap = [
    `document.body.className = ${JSON.stringify(page.bodyClassName || "")};`,
    `document.body.setAttribute("data-legacy-file", ${JSON.stringify(page.relativeFilePath)});`
  ].join("");

  return (
    <>
      {page.headHtml ? (
        <div
          data-legacy-head-assets=""
          dangerouslySetInnerHTML={{ __html: page.headHtml }}
          suppressHydrationWarning
        />
      ) : null}
      {page.headScripts.map((script, index) => (
        <ScriptTag key={`head-script-${index}`} script={script} scriptKey={`head-script-${index}`} />
      ))}
      <script dangerouslySetInnerHTML={{ __html: bodyBootstrap }} />
      <div
        data-legacy-render-root=""
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        suppressHydrationWarning
      />
      {page.pageScripts.map((script, index) => (
        <ScriptTag key={`page-script-${index}`} script={script} scriptKey={`page-script-${index}`} />
      ))}
      <script src="/js/env.config.js" />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      <script src="/js/shared.js" />
      <script src="/js/navigation.js" />
      <script src="/js/brand-enforcer.js" />
    </>
  );
}
