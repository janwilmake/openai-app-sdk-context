<!-- https://letmeprompt.com/httpsuithubcomj-6o8zhogvfwqo70 -->

# OpenAI Apps SDK Extensions to MCP

This document covers all the OpenAI-specific features and extensions that go beyond the standard MCP specification. If you already understand MCP, this guide shows what additional features you need to implement to create apps for ChatGPT.

## Component System (Skybridge)

### HTML Templates with Skybridge Runtime

OpenAI extends MCP resources to support interactive UI components that run in a sandboxed iframe.

**Resource Registration:**

```typescript
server.registerResource(
  "widget-name",
  "ui://widget/widget.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/widget.html",
        mimeType: "text/html+skybridge", // OpenAI-specific MIME type
        text: `
<div id="widget-root"></div>
<link rel="stylesheet" href="https://example.com/widget.css">
<script type="module" src="https://example.com/widget.js"></script>
        `.trim(),
      },
    ],
  })
);
```

**Key Points:**

- Use `mimeType: "text/html+skybridge"` for interactive components
- URI pattern: `ui://widget/[name].html`
- HTML should include a root element and your bundled JavaScript/CSS
- Components run in a sandboxed iframe with restricted APIs

### Component Bridge API (`window.openai`)

OpenAI injects a global `window.openai` object for component-host communication:

#### Data Access

```typescript
// Tool input/output data
const toolInput = window.openai?.toolInput as YourInputType;
const toolOutput = window.openai?.toolOutput as YourOutputType;

// Persistent component state
const widgetState = window.openai?.widgetState as YourStateType;
```

#### State Persistence

```typescript
// Save component state (persists across conversation)
await window.openai?.setWidgetState?.({
  selectedItems: [...],
  filters: {...},
  __v: 1 // version for migration
});
```

#### Tool Calls from Components

```typescript
// Call tools from within the component
await window.openai?.callTool("refresh_data", { param: "value" });
```

#### Conversational Integration

```typescript
// Send follow-up messages to the conversation
await window.openai?.sendFollowupTurn({
  prompt: "Create a summary of the selected items",
});
```

#### Layout Management

```typescript
// Request different display modes
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Options: "inline", "pip", "fullscreen"

// Read current layout constraints
const maxHeight = window.openai?.maxHeight;
const displayMode = window.openai?.displayMode;
```

#### Theming and Localization

```typescript
// Access user's theme and locale
const theme = window.openai?.theme; // "light" or "dark"
const locale = window.openai?.locale; // BCP 47 format
```

#### Event Handling

```typescript
// Listen for host updates
window.addEventListener("openai:set_globals", (event) => {
  // Globals changed (theme, layout, etc.)
});

window.addEventListener("openai:tool_response", (event) => {
  // Tool call completed
  const { tool } = event.detail;
});
```

## Tool Extensions

### OpenAI-Specific `_meta` Fields

Standard MCP tools are extended with OpenAI-specific metadata:

```typescript
server.registerTool(
  "tool_name",
  {
    title: "Tool Title",
    description: "Standard MCP description",
    inputSchema: {
      /* standard JSON schema */
    },

    // OpenAI extensions in _meta
    _meta: {
      // Link to UI component
      "openai/outputTemplate": "ui://widget/widget.html",

      // Allow component-initiated calls
      "openai/widgetAccessible": true,

      // Status messages during execution
      "openai/toolInvocation/invoking": "Processing...",
      "openai/toolInvocation/invoked": "Complete",

      // Locale support
      "openai/locale": "en-US",
    },
  },
  async (input, context) => {
    // Implementation
  }
);
```

### Enhanced Tool Results

OpenAI extends MCP tool results with additional fields:

```typescript
return {
  // Standard MCP fields
  content: [{ type: "text", text: "Human-readable result" }],

  // OpenAI extension: structured data for both model and component
  structuredContent: {
    items: [...],
    metadata: {...}
  },

  // OpenAI extension: component-only data (hidden from model)
  _meta: {
    fullDataset: [...], // Component needs this, but model doesn't
    internalIds: [...],
    renderingHints: {...}
  }
};
```

### Security Schemes (Per-Tool Auth)

OpenAI extends MCP with per-tool authentication requirements:

```typescript
server.registerTool(
  "protected_tool",
  {
    title: "Protected Tool",
    description: "Requires authentication",
    inputSchema: {
      /* schema */
    },

    // Standard MCP field, enhanced by OpenAI
    securitySchemes: [{ type: "oauth2", scopes: ["read", "write"] }],

    // OpenAI also mirrors this in _meta for compatibility
    _meta: {
      securitySchemes: [{ type: "oauth2", scopes: ["read", "write"] }],
    },
  },
  async (input) => {
    /* implementation */
  }
);
```

## Component Metadata

### Widget Configuration

Configure component behavior through resource metadata:

```typescript
server.registerResource("widget", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html+skybridge",
      text: componentHtml,
      _meta: {
        // Description shown to the model when component renders
        "openai/widgetDescription": "Interactive UI showing user's tasks",

        // Request bordered card layout
        "openai/widgetPrefersBorder": true,

        // Content Security Policy configuration
        "openai/widgetCSP": {
          connect_domains: ["https://api.example.com"],
          resource_domains: ["https://cdn.example.com"],
        },

        // Custom subdomain (optional)
        "openai/widgetDomain": "https://myapp.com",
      },
    },
  ],
}));
```

### Content Security Policy

OpenAI requires explicit CSP declaration for security:

```typescript
"openai/widgetCSP": {
  // Domains component can make network requests to
  connect_domains: [
    "https://api.myservice.com",
    "https://auth.myservice.com"
  ],

  // Domains for static resources (CSS, JS, images, fonts)
  resource_domains: [
    "https://cdn.myservice.com",
    "https://fonts.googleapis.com"
  ]
}
```

This maps to CSP rules:

- `connect-src 'self' ${connect_domains}`
- `script-src 'self' ${resource_domains}`
- `img-src 'self' data: ${resource_domains}`
- `font-src 'self' ${resource_domains}`

## Authentication Extensions

### OAuth 2.1 with MCP Integration

OpenAI extends MCP's auth support with specific OAuth 2.1 requirements:

**Required OAuth Endpoints:**

```typescript
// Your authorization server must provide:
// /.well-known/oauth-protected-resource
{
  "authorization_servers": ["https://auth.example.com"],
  "resource_server": "https://api.example.com",
  "scopes": ["read", "write"]
}

// /.well-known/openid-configuration
{
  "authorization_endpoint": "https://auth.example.com/oauth/authorize",
  "token_endpoint": "https://auth.example.com/oauth/token",
  "jwks_uri": "https://auth.example.com/.well-known/jwks.json",
  "registration_endpoint": "https://auth.example.com/oauth/register"
}
```

**Server-Side Auth Configuration:**

```python
# Using FastMCP (Python)
from mcp.server.auth.settings import AuthSettings

mcp = FastMCP(
    auth=AuthSettings(
        issuer_url="https://your-tenant.auth0.com",
        resource_server_url="https://api.example.com/mcp",
        required_scopes=["user"]
    )
)
```

### Token Verification

OpenAI expects proper JWT verification on protected endpoints:

```python
class MyVerifier(TokenVerifier):
    async def verify_token(self, token: str) -> AccessToken | None:
        payload = validate_jwt(token, jwks_url)
        if "user" not in payload.get("permissions", []):
            return None
        return AccessToken(
            token=token,
            client_id=payload["azp"],
            subject=payload["sub"],
            scopes=payload.get("permissions", []),
            claims=payload
        )
```

## Context and Hints

### Request Context

OpenAI provides additional context in MCP requests:

```typescript
// Available in _meta of tool calls
const context = {
  "openai/locale": "en-US", // User's locale
  "openai/userAgent": "ChatGPT/1.0", // Client identifier
  "openai/userLocation": {
    // Coarse location (optional)
    city: "San Francisco",
    region: "California",
    country: "US",
    timezone: "America/Los_Angeles",
    longitude: -122.4194,
    latitude: 37.7749,
  },
};
```

### Error Handling

OpenAI-specific error responses for auth failures:

```typescript
// On 401 errors, include WWW-Authenticate header
return {
  content: [{ type: "text", text: "Authentication required" }],
  _meta: {
    "mcp/www_authenticate": 'Bearer realm="api", error="invalid_token"',
  },
};
```

## Localization Support

### Locale Negotiation

OpenAI handles locale negotiation during MCP initialization:

```typescript
// In initialize request
{
  "_meta": {
    "openai/locale": "en-GB"
  }
}

// Server should respond with supported locale
{
  "_meta": {
    "openai/locale": "en" // Closest match
  }
}
```

### Localized Responses

```typescript
server.registerTool(
  "localized_tool",
  {
    title: "Localized Tool",
    description: "Returns localized content",
  },
  async (input, { _meta }) => {
    const locale = _meta?.["openai/locale"] ?? "en";

    return {
      content: [
        {
          type: "text",
          text: getLocalizedText(locale, "greeting"),
        },
      ],
      _meta: {
        "openai/locale": locale,
      },
    };
  }
);
```

## Component Development

### React Integration Patterns

OpenAI provides React hooks for common patterns:

```typescript
// Hook for accessing OpenAI globals
function useOpenAiGlobal<K extends keyof OpenAiGlobals>(key: K) {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event) => onChange();
      window.addEventListener("openai:set_globals", handleSetGlobal);
      return () =>
        window.removeEventListener("openai:set_globals", handleSetGlobal);
    },
    () => window.openai[key]
  );
}

// Hook for widget state management
function useWidgetState<T>(defaultState: T) {
  const widgetStateFromWindow = useOpenAiGlobal("widgetState") as T;
  const [widgetState, _setWidgetState] = useState(() => {
    return widgetStateFromWindow ?? defaultState;
  });

  const setWidgetState = useCallback((state: T) => {
    _setWidgetState(state);
    window.openai.setWidgetState(state);
  }, []);

  return [widgetState, setWidgetState] as const;
}
```

### Navigation Integration

OpenAI mirrors iframe history to ChatGPT UI:

```typescript
// Use standard React Router
function MyComponent() {
  const navigate = useNavigate();

  function openDetails(id: string) {
    navigate(`/details/${id}`); // ChatGPT will show back button
  }

  return <BrowserRouter>{/* your routes */}</BrowserRouter>;
}
```

## Display Modes

### Mode-Specific Behavior

Components can adapt to different display contexts:

```typescript
function MyComponent() {
  const displayMode = useOpenAiGlobal("displayMode");
  const maxHeight = useOpenAiGlobal("maxHeight");

  return (
    <div
      style={{
        maxHeight,
        height: displayMode === "fullscreen" ? maxHeight : 400,
      }}
    >
      {displayMode === "inline" && <CompactView />}
      {displayMode === "fullscreen" && <DetailedView />}
      {displayMode === "pip" && <MinimalView />}
    </div>
  );
}
```

### Requesting Mode Changes

```typescript
// Request fullscreen for rich content
if (displayMode === "inline") {
  await window.openai?.requestDisplayMode({ mode: "fullscreen" });
}

// Request PiP for persistent sessions
await window.openai?.requestDisplayMode({ mode: "pip" });
```

## Development and Testing

### MCP Inspector Integration

OpenAI components work with MCP Inspector for testing:

1. Point Inspector to your MCP server: `http://localhost:3000/mcp`
2. Inspector renders components inline with `window.openai` bridge
3. Test tool calls, state persistence, and display modes

### Bundle Requirements

Components must be self-contained bundles:

```typescript
// esbuild configuration
{
  format: "esm",
  bundle: true,
  minify: true,
  target: "es2020",
  outfile: "dist/component.js"
}
```

Include all dependencies - no external imports allowed in the sandbox.

## Production Considerations

### Content Security Policy

Components are sandboxed with strict CSP. Declare all required domains upfront:

```typescript
"openai/widgetCSP": {
  connect_domains: [], // API endpoints
  resource_domains: [] // CDNs, fonts, images
}
```

### Performance

- Components should render in <300ms
- Use `structuredContent` for data the model needs to reason about
- Use `_meta` for component-only data
- Persist UI state with `setWidgetState` for conversation continuity

### Error Handling

```typescript
// Graceful degradation when window.openai unavailable
const toolOutput = window.openai?.toolOutput ?? fallbackData;

// Handle tool call failures
try {
  await window.openai?.callTool("refresh", {});
} catch (error) {
  // Show error state in UI
}
```

This covers all the major OpenAI-specific extensions to MCP needed to build ChatGPT apps. The key additions are the component system, enhanced tool metadata, authentication patterns, and the `window.openai` bridge API.
