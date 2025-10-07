Title: User Interaction

URL Source: https://developers.openai.com/apps-sdk/concepts/user-interaction

Published Time: Mon, 06 Oct 2025 21:01:33 GMT

Markdown Content:
Discovery
---------

Discovery refers to the different ways a user or the model can find out about your app and the tools it provides: natural-language prompts, directory browsing, and proactive [entry points](https://developers.openai.com/apps-sdk/concepts/entry-points). Apps SDK leans on your tool metadata and past usage to make intelligent choices. Good discovery hygiene means your app appears when it should and stays quiet when it should not.

### Named mention

When a user mentions the name of your app at the beginning of a prompt, your app will be surfaced automatically in the response. The user must specify your app name at the beginning of their prompt. If they do not, your app can also appear as a suggestion through in-conversation discovery.

### In-conversation discovery

When a user sends a prompt, the model evaluates:

*   **Conversation context** – the chat history, including previous tool results, memories, and explicit tool preferences
*   **Conversation brand mentions and citations** - whether your brand is explicitly requested in the query or is surfaced as a source/citation in search results.
*   **Tool metadata** – the names, descriptions, and parameter documentation you provide in your MCP server.
*   **User linking state** – whether the user already granted access to your app, or needs to connect it before the tool can run.

You influence in-conversation discovery by:

1.   Writing action-oriented [tool descriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool) (“Use this when the user wants to view their kanban board”) rather than generic copy.
2.   Writing clear [component descriptions](https://developers.openai.com/apps-sdk/reference#add-component-descriptions) on the resource UI template metadata.
3.   Regularly testing your golden prompt set in ChatGPT developer mode and logging precision/recall.

If the assistant selects your tool, it handles arguments, displays confirmation if needed, and renders the component inline. If no linked tool is an obvious match, the model will default to built-in capabilities, so keep evaluating and improving your metadata.

### Directory

The directory will give users a browsable surface to find apps outside of a conversation. Your listing in this directory will include:

*   App name and icon
*   Short and long descriptions
*   Tags or categories (where supported)
*   Optional onboarding instructions or screenshots

Entry points
------------

Once a user links your app, ChatGPT can surface it through several entry points. Understanding each surface helps you design flows that feel native and discoverable.

### In-conversation entry

Linked tools are always on in the model’s context. When the user writes a prompt, the assistant decides whether to call your tool based on the conversation state and metadata you supplied. Best practices:

*   Keep tool descriptions action oriented so the model can disambiguate similar apps.
*   Return structured content that references stable IDs so follow-up prompts can mutate or summarise prior results.
*   Provide `_meta`[hints](https://developers.openai.com/apps-sdk/reference#tool-descriptor-parameters) so the client can streamline confirmation and rendering.

When a call succeeds, the component renders inline and inherits the current theme, composer, and confirmation settings.

### Launcher

The launcher (available from the + button in the composer) is a high-intent entry point where users can explicitly choose an app. Your listing should include a succinct label and icon. Consider:

*   **Deep linking** – include starter prompts or entry arguments so the user lands on the most useful tool immediately.
*   **Context awareness** – the launcher ranks apps using the current conversation as a signal, so keep metadata aligned with the scenarios you support.
