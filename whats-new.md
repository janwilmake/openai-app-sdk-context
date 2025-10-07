<!-- https://letmeprompt.com/rules-httpsuithu-nom3xm8yfapsrl -->

# OpenAI Apps SDK Extensions to MCP

This document covers all the OpenAI-specific features and extensions that go beyond the standard MCP specification. If you already understand MCP, this guide shows what additional features you need to implement to create apps for ChatGPT.

## Component System (Skybridge)

### HTML Templates with Skybridge Runtime

OpenAI extends MCP resources to support interactive UI components that run in a sandboxed iframe.

**Resource Registration:**

```json
{
  "uri": "ui://widget/widget.html",
  "mimeType": "text/html+skybridge",
  "text": "<div id=\"widget-root\"></div>\n<link rel=\"stylesheet\" href=\"https://example.com/widget.css\">\n<script type=\"module\" src=\"https://example.com/widget.js\"></script>",
  "_meta": {
    "openai/widgetDescription": "Interactive UI showing user's tasks",
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": {
      "connect_domains": ["https://api.example.com"],
      "resource_domains": ["https://cdn.example.com"]
    }
  }
}
```

**Key Points:**

- Use `mimeType: "text/html+skybridge"` for interactive components
- URI pattern: `ui://widget/[name].html`
- HTML should include a root element and your bundled JavaScript/CSS
- Components run in a sandboxed iframe with restricted APIs

### Component Bridge API (`window.openai`)

OpenAI injects a global `window.openai` object for component-host communication:

#### Data Access Properties

```javascript
// Tool input/output data (read-only)
window.openai.toolInput; // Arguments passed to the tool
window.openai.toolOutput; // Structured data returned by tool
window.openai.widgetState; // Persistent component state
```

#### Host Environment Properties

```javascript
// Layout and theming (read-only)
window.openai.displayMode; // "inline", "pip", "fullscreen"
window.openai.maxHeight; // Maximum container height in pixels
window.openai.theme; // "light" or "dark"
window.openai.locale; // BCP 47 format (e.g., "en-US")
```

#### Component Actions

```javascript
// State persistence
await window.openai.setWidgetState(stateObject);

// Tool invocation from component
await window.openai.callTool("tool_name", { param: "value" });

// Conversation integration
await window.openai.sendFollowupTurn({ prompt: "Create a summary" });

// Layout requests
await window.openai.requestDisplayMode({ mode: "fullscreen" });
```

#### Event Handling

```javascript
// Listen for host updates
window.addEventListener("openai:set_globals", (event) => {
  // Triggered when globals change (theme, layout, toolOutput, etc.)
  const { globals } = event.detail;
});

window.addEventListener("openai:tool_response", (event) => {
  // Triggered after callTool completes
  const { tool } = event.detail; // { name, args }
});
```

## Tool Extensions

### OpenAI-Specific `_meta` Fields

Standard MCP tools are extended with OpenAI-specific metadata in the `_meta` object:

```json
{
  "name": "tool_name",
  "title": "Tool Title",
  "description": "Standard MCP description",
  "inputSchema": {
    "type": "object",
    "properties": {}
  },
  "_meta": {
    "openai/outputTemplate": "ui://widget/widget.html",
    "openai/widgetAccessible": true,
    "openai/toolInvocation/invoking": "Processing...",
    "openai/toolInvocation/invoked": "Complete",
    "openai/locale": "en-US"
  }
}
```

**Field Definitions:**

| Field                            | Type               | Purpose                              |
| -------------------------------- | ------------------ | ------------------------------------ |
| `openai/outputTemplate`          | string (URI)       | Links to UI component resource       |
| `openai/widgetAccessible`        | boolean            | Allow component-initiated tool calls |
| `openai/toolInvocation/invoking` | string (≤64 chars) | Status text while tool runs          |
| `openai/toolInvocation/invoked`  | string (≤64 chars) | Status text after completion         |
| `openai/locale`                  | string (BCP 47)    | Resolved locale for this response    |

### Enhanced Tool Results

OpenAI extends standard MCP tool results with additional fields:

```json
{
  "content": [{ "type": "text", "text": "Human-readable result" }],
  "structuredContent": {
    "items": [],
    "metadata": {}
  },
  "_meta": {
    "fullDataset": [],
    "internalIds": [],
    "renderingHints": {}
  }
}
```

**Field Definitions:**

| Field               | Visibility        | Purpose                                   |
| ------------------- | ----------------- | ----------------------------------------- |
| `content`           | Model + Component | Standard MCP content                      |
| `structuredContent` | Model + Component | Structured data for both consumers        |
| `_meta`             | Component only    | Component-specific data hidden from model |

### Security Schemes (Per-Tool Authentication)

OpenAI extends MCP with per-tool authentication requirements using both standard and `_meta` fields:

```json
{
  "name": "protected_tool",
  "title": "Protected Tool",
  "securitySchemes": [{ "type": "oauth2", "scopes": ["read", "write"] }],
  "_meta": {
    "securitySchemes": [{ "type": "oauth2", "scopes": ["read", "write"] }]
  }
}
```

**Supported Security Types:**

- `"noauth"` - Callable anonymously
- `"oauth2"` - Requires OAuth 2.0 with optional scopes

## Component Resource Metadata

### Widget Configuration

Configure component behavior through resource `_meta` fields:

```json
{
  "uri": "ui://widget/widget.html",
  "mimeType": "text/html+skybridge",
  "text": "<html content>",
  "_meta": {
    "openai/widgetDescription": "Interactive UI showing user's tasks",
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": {
      "connect_domains": ["https://api.example.com"],
      "resource_domains": ["https://cdn.example.com"]
    },
    "openai/widgetDomain": "https://myapp.com"
  }
}
```

**Field Definitions:**

| Field                        | Type            | Purpose                                           |
| ---------------------------- | --------------- | ------------------------------------------------- |
| `openai/widgetDescription`   | string          | Description shown to model when component renders |
| `openai/widgetPrefersBorder` | boolean         | Request bordered card layout                      |
| `openai/widgetCSP`           | object          | Content Security Policy configuration             |
| `openai/widgetDomain`        | string (origin) | Custom subdomain for component                    |

### Content Security Policy

The `openai/widgetCSP` object defines allowed network access:

```json
{
  "openai/widgetCSP": {
    "connect_domains": [
      "https://api.myservice.com",
      "https://auth.myservice.com"
    ],
    "resource_domains": [
      "https://cdn.myservice.com",
      "https://fonts.googleapis.com"
    ]
  }
}
```

This maps to CSP directives:

- `connect-src 'self' ${connect_domains.join(' ')}`
- `script-src 'self' ${resource_domains.join(' ')}`
- `img-src 'self' data: ${resource_domains.join(' ')}`
- `font-src 'self' ${resource_domains.join(' ')}`

## Authentication Extensions

### OAuth 2.1 with MCP Integration

OpenAI requires specific OAuth 2.1 endpoints for authentication:

**Required OAuth Discovery Endpoints:**

```
/.well-known/oauth-protected-resource
{
  "authorization_servers": ["https://auth.example.com"],
  "resource_server": "https://api.example.com",
  "scopes": ["read", "write"]
}

/.well-known/openid-configuration
{
  "authorization_endpoint": "https://auth.example.com/oauth/authorize",
  "token_endpoint": "https://auth.example.com/oauth/token",
  "jwks_uri": "https://auth.example.com/.well-known/jwks.json",
  "registration_endpoint": "https://auth.example.com/oauth/register"
}
```

### Token Verification

Protected MCP endpoints must verify JWT tokens:

1. Validate JWT signature using `jwks_uri`
2. Check issuer, audience, expiration
3. Verify required scopes are present
4. Return `401 Unauthorized` with `WWW-Authenticate` header on failure

### Error Handling for Auth

On authentication failures, include specific `_meta` fields:

```json
{
  "content": [{ "type": "text", "text": "Authentication required" }],
  "_meta": {
    "mcp/www_authenticate": "Bearer realm=\"api\", error=\"invalid_token\""
  }
}
```

## Context and Hints

### Request Context

OpenAI provides additional context in MCP request `_meta` fields:

```json
{
  "_meta": {
    "openai/locale": "en-US",
    "openai/userAgent": "ChatGPT/1.0",
    "openai/userLocation": {
      "city": "San Francisco",
      "region": "California",
      "country": "US",
      "timezone": "America/Los_Angeles",
      "longitude": -122.4194,
      "latitude": 37.7749
    }
  }
}
```

**Field Definitions:**

| Field                 | When Present            | Purpose                         |
| --------------------- | ----------------------- | ------------------------------- |
| `openai/locale`       | Initialize + tool calls | User's preferred locale         |
| `openai/userAgent`    | Tool calls              | Client identification           |
| `openai/userLocation` | Tool calls              | Coarse location hint (optional) |

**Note:** These are advisory only. Never rely on them for authorization decisions.

## Localization Support

### Locale Negotiation

OpenAI handles locale negotiation during MCP initialization:

**Initialize Request:**

```json
{
  "method": "initialize",
  "params": {
    "_meta": {
      "openai/locale": "en-GB"
    }
  }
}
```

**Server Response:**

```json
{
  "_meta": {
    "openai/locale": "en"
  }
}
```

### Localized Tool Responses

Include resolved locale in tool responses:

```json
{
  "content": [{ "type": "text", "text": "Localized greeting" }],
  "_meta": {
    "openai/locale": "en"
  }
}
```

## Display Modes

### Mode-Specific Behavior

Components can adapt to three display contexts:

| Mode         | Purpose             | Characteristics                                |
| ------------ | ------------------- | ---------------------------------------------- |
| `inline`     | Default embed       | Limited height, appears in conversation flow   |
| `fullscreen` | Rich interactions   | Full screen, composer overlay, back navigation |
| `pip`        | Persistent sessions | Floating window, stays visible during chat     |

### Requesting Mode Changes

Components can request layout changes:

```javascript
// Request fullscreen for detailed content
await window.openai.requestDisplayMode({ mode: "fullscreen" });

// Request PiP for ongoing sessions
await window.openai.requestDisplayMode({ mode: "pip" });
```

**Note:** Host decides whether to honor the request.

## Component Development Requirements

### Bundle Format

Components must be self-contained ES modules:

- Bundle all dependencies (no external imports)
- Use ES2020+ syntax
- Include all CSS and assets inline or from declared CSP domains
- Mount to a specific DOM element ID

### State Management

```javascript
// Initialize from host state or tool output
const initialState = window.openai.widgetState || window.openai.toolOutput || defaultState;

// Persist changes back to host
await window.openai.setWidgetState({
  selectedItems: [...],
  filters: {...},
  __v: 1  // Version for migration
});
```

### Navigation Integration

Standard History API works - ChatGPT mirrors iframe history:

```javascript
// Standard browser navigation
history.pushState(state, title, url);
history.replaceState(state, title, url);

// ChatGPT shows back button and handles navigation
```

### Error Handling

```javascript
// Handle missing bridge API
if (!window.openai) {
  // Fallback or error state
  return;
}

// Handle tool call failures
try {
  await window.openai.callTool("refresh", {});
} catch (error) {
  // Show error state in UI
}
```

## Production Considerations

### Performance Requirements

- Components should render in <300ms
- Use `structuredContent` for data the model needs
- Use `_meta` for component-only data
- Keep `widgetState` payloads small

### Security Restrictions

Components run in strict sandbox:

- No access to `window.alert`, `window.prompt`, `window.confirm`
- No access to `navigator.clipboard`
- No access to parent window or other frames
- Network requests limited by CSP declarations

### Testing with MCP Inspector

1. Point MCP Inspector to your server: `http://localhost:3000/mcp`
2. Inspector renders components with `window.openai` bridge
3. Test tool calls, state persistence, and display modes
4. Validate CSP compliance and error handling

This covers all major OpenAI-specific extensions to MCP needed to build ChatGPT apps. The key additions are the component system with `window.openai` bridge, enhanced tool metadata, OAuth 2.1 authentication patterns, and display mode management.
