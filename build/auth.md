Title: Authentication

URL Source: https://developers.openai.com/apps-sdk/build/auth

Markdown Content:
Authenticate your users
-----------------------

Many Apps SDK apps can operate in a read-only, anonymous mode, but anything that exposes customer-specific data or write actions should authenticate users.

You can integrate with your own authorization server when you need to connect to an existing backend or share data between users.

Custom auth with OAuth 2.1
--------------------------

When you need to talk to an external system—CRM records, proprietary APIs, shared datasets—you can integrate a full OAuth 2.1 flow that conforms to the [MCP authorization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization).

### Components

*   **Resource server** – your MCP server, which exposes tools and verifies access tokens on each request.
*   **Authorization server** – your identity provider (Auth0, Okta, Cognito, or a custom implementation) that issues tokens and publishes discovery metadata.
*   **Client** – ChatGPT acting on behalf of the user. It supports dynamic client registration and PKCE.

### Required endpoints

Your authorization server must provide:

*   `/.well-known/oauth-protected-resource` – lists the authorization servers and required scopes for your MCP endpoint.
*   `/.well-known/openid-configuration` – discovery document. It must include: 
    *   `authorization_endpoint`
    *   `token_endpoint` (often `/oauth/token`)
    *   `jwks_uri`
    *   `registration_endpoint`

*   `token_endpoint` – accepts code+PKCE exchanges and returns access tokens.
*   `registration_endpoint` – accepts dynamic client registration requests and returns a `client_id`.

### Flow in practice

1.   ChatGPT queries your MCP server for protected resource metadata. You can configure this with `AuthSettings` in the official Python SDK’s FastMCP module.
2.   ChatGPT registers itself with your authorization server using the `registration_endpoint` and obtains a `client_id`.
3.   When the user first invokes a tool, the ChatGPT client launches the OAuth authorization code + PKCE flow. The user authenticates and consents to the requested scopes.
4.   ChatGPT exchanges the authorization code for an access token and attaches it to subsequent MCP requests (`Authorization: Bearer <token>`).
5.   Your server verifies the token on each request (issuer, audience, expiration, scopes) before executing the tool.

### Implementing verification

The official Python SDK’s FastMCP module ships with helpers for token verification. A simplified example:

File: `server.py`

```
from mcp.server.fastmcp import FastMCP
from mcp.server.auth.settings import AuthSettings
from mcp.server.auth.provider import TokenVerifier, AccessToken

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
            claims=payload,
        )

mcp = FastMCP(
    name="kanban-mcp",
    stateless_http=True,
    token_verifier=MyVerifier(),
    auth=AuthSettings(
        issuer_url="https://your-tenant.us.auth0.com",
        resource_server_url="https://example.com/mcp",
        required_scopes=["user"],
    ),
)
```

If verification fails, respond with `401 Unauthorized` and a `WWW-Authenticate` header that points back to your protected-resource metadata. This tells the client to run the OAuth flow again.

[Auth0](https://auth0.com/) is a popular option and supports dynamic client registration, RBAC, and token introspection out of the box. To configure it:

1.   Create an API in the Auth0 dashboard and record the identifier (used as the token audience).
2.   Enable RBAC and add permissions (for example `user`) so they are embedded in the access token.
3.   Turn on OIDC dynamic application registration so ChatGPT can create a client per connector.
4.   Ensure at least one login connection is enabled for dynamically created clients so users can sign in.

Okta, Azure AD, and custom OAuth 2.1 servers can follow the same pattern as long as they expose the required metadata.

Testing and rollout
-------------------

*   **Local testing** – start with a development tenant that issues short-lived tokens so you can iterate quickly.
*   **Dogfood** – once authentication works, gate access to trusted testers before rolling out broadly. You can require linking for specific tools or the entire connector.
*   **Rotation** – plan for token revocation, refresh, and scope changes. Your server should treat missing or stale tokens as unauthenticated and return a helpful error message.

With authentication in place you can confidently expose user-specific data and write actions to ChatGPT users.

Per‑tool authentication with `securitySchemes`
----------------------------------------------

Different tools often have different access requirements. Listing tools without auth improves discovery and developer ergonomics, but you should enforce authentication at call time for any tool that needs it. Declaring the requirement in metadata helps clients guide the user, while your server remains the source of truth for enforcement.

Our recommendation is to:

*   Keep your server discoverable (no auth required for listing)
*   Enforce auth per tool call

Scope and semantics:

*   Supported scheme types (initial): 
    *   “noauth” — callable anonymously
    *   “oauth2” — requires OAuth 2.0; optional scopes

*   Missing field: inherit the server default policy
*   Both “noauth” and “oauth2”: anonymous works, but authenticating in will unlock more behavior
*   Servers must enforce regardless of client hints

You should declare auth requirements in the first-class `securitySchemes` field on each tool. Clients use this to guide users; your server must still validate tokens/scopes on every invocation.

Example (public + optional auth) – TypeScript SDK

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

declare const server: McpServer;

server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"],
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] },
    ],
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Results for ${input.q}` }],
      structuredContent: {},
    };
  }
);
```

Example (auth required) – TypeScript SDK

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

declare const server: McpServer;

server.registerTool(
  "create_doc",
  {
    title: "Create Document",
    description: "Make a new doc in your account.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    },
    securitySchemes: [{ type: "oauth2", scopes: ["docs.write"] }],
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Created doc: ${input.title}` }],
      structuredContent: {},
    };
  }
);
```
