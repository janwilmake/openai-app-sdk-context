Title: Reference

URL Source: https://developers.openai.com/apps-sdk/reference

Published Time: Sat, 11 Oct 2025 09:27:03 GMT

Markdown Content:
`window.openai` component bridge
--------------------------------

See [build a custom UX](https://developers.openai.com/apps-sdk/build/custom-ux)

Tool descriptor parameters
--------------------------

By default, a tool description should include the fields listed [here](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool).

### `_meta` fields on tool descriptor

We have also require the following `_meta` fields on the tool descriptor:

| Key | Placement | Type | Limits | Purpose |
| --- | --- | --- | --- | --- |
| `_meta["securitySchemes"]` | Tool descriptor | array | — | Back-compat mirror for clients that only read `_meta`. |
| `_meta["openai/outputTemplate"]` | Tool descriptor | string (URI) | — | Resource URI for component HTML template (`text/html+skybridge`). |
| `_meta["openai/widgetAccessible"]` | Tool descriptor | boolean | default `false` | Allow component→tool calls through the client bridge. |
| `_meta["openai/toolInvocation/invoking"]` | Tool descriptor | string | ≤ 64 chars | Short status text while the tool runs. |
| `_meta["openai/toolInvocation/invoked"]` | Tool descriptor | string | ≤ 64 chars | Short status text after the tool completes. |

Example:

```
server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"]
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] }
    ],
    _meta: {
      securitySchemes: [
        { type: "noauth" },
        { type: "oauth2", scopes: ["search.read"] }
      ],
      "openai/outputTemplate": "ui://widget/story.html",
      "openai/toolInvocation/invoking": "Searching…",
      "openai/toolInvocation/invoked": "Results ready"
    }
  },
  async ({ q }) => performSearch(q)
);
```

### Annotations

To label a tool as “read-only”, please use the following [annotation](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) on the tool descriptor:

| Key | Type | Required | Notes |
| --- | --- | --- | --- |
| `readOnlyHint` | boolean | Optional | Signal that the tool is read-only (helps model planning). |

Example:

```
server.registerTool(
  "list_saved_recipes",
  {
    title: "List saved recipes",
    description: "Returns the user’s saved recipes without modifying them.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true }
  },
  async () => fetchSavedRecipes()
);
```

Set these keys on the resource template that serves your component (`registerResource`). They help ChatGPT describe and frame the rendered iframe without leaking metadata to other clients.

| Key | Placement | Type | Purpose |
| --- | --- | --- | --- |
| `_meta["openai/widgetDescription"]` | Resource contents | string | Human-readable summary surfaced to the model when the component loads, reducing redundant assistant narration. |
| `_meta["openai/widgetPrefersBorder"]` | Resource contents | boolean | Hint that the component should render inside a bordered card when supported. |
| `_meta["openai/widgetCSP"]` | Resource contents | object | Define `connect_domains` and `resource_domains` arrays for the component’s CSP snapshot. |
| `_meta["openai/widgetDomain"]` | Resource contents | string (origin) | Optional dedicated subdomain for hosted components (defaults to `https://web-sandbox.oaiusercontent.com`). |

Example:

```
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Renders an interactive UI showcasing the zoo animals returned by get_zoo_animals.",
        "openai/widgetPrefersBorder": true,
        "openai/widgetCSP": {
          connect_domains: [],
          resource_domains: ["https://persistent.oaistatic.com"],
        },
        "openai/widgetDomain": "https://chatgpt.com",
      },
    },
  ],
}));
```

Tool results
------------

Tool results can contain the following [fields](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result). Notably:

| Key | Type | Required | Notes |
| --- | --- | --- | --- |
| `structuredContent` | object | Optional | Surfaced to the model and the component. Must match the declared `outputSchema`, when provided. |
| `content` | string or `Content[]` | Optional | Surfaced to the model and the component. |
| `_meta` | object | Optional | Delivered only to the component. Hidden from the model. |

Only `structuredContent` and `content` appear in the conversation transcript. `_meta` is forwarded to the component so you can hydrate UI without exposing the data to the model.

Example:

```
server.registerTool(
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    _meta: { "openai/outputTemplate": "ui://widget/widget.html" }
  },
  async ({ count = 10 }) => {
    const animals = generateZooAnimals(count);

    return {
      structuredContent: { animals },
      content: [{ type: "text", text: `Here are ${animals.length} animals.` }],
      _meta: {
        allAnimalsById: Object.fromEntries(animals.map((animal) => [animal.id, animal]))
      }
    };
  }
);
```

### Error tool result

To return an error on the tool result, use the following `_meta` key:

| Key | Purpose | Type | Notes |
| --- | --- | --- | --- |
| `_meta["mcp/www_authenticate"]` | Error result | string or string[] | RFC 7235 `WWW-Authenticate` challenges to trigger OAuth. |

| Key | When provided | Type | Purpose |
| --- | --- | --- | --- |
| `_meta["openai/locale"]` | Initialize + tool calls | string (BCP 47) | Requested locale (older clients may send `_meta["webplus/i18n"]`). |
| `_meta["openai/userAgent"]` | Tool calls | string | User agent hint for analytics or formatting. |
| `_meta["openai/userLocation"]` | Tool calls | object | Coarse location hint (`city`, `region`, `country`, `timezone`, `longitude`, `latitude`). |

Operation-phase `_meta["openai/userAgent"]` and `_meta["openai/userLocation"]` are hints only; servers should never rely on them for authorization decisions and must tolerate their absence.

Example:

```
server.registerTool(
  "recommend_cafe",
  {
    title: "Recommend a cafe",
    inputSchema: { type: "object" }
  },
  async (_args, { _meta }) => {
    const locale = _meta?.["openai/locale"] ?? "en";
    const location = _meta?.["openai/userLocation"]?.city;

    return {
      content: [{ type: "text", text: formatIntro(locale, location) }],
      structuredContent: await findNearbyCafes(location)
    };
  }
);
```
