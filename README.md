# OpenAI App SDK Context

OpenAI famously does not serve any [llms.txt](https://llmstxt.org) (at least not that I know of) so I built this simple scraper using [Jina.ai](https://jina.ai) to easily get the new AI SDK docs as markdown.

To summarize, I also added a doc [whats-new.md](whats-new.md) that highlights what the OpenAI App SDK actually adds to the MCP spec.

Use it on uithub: https://uithub.com/janwilmake/openai-app-sdk-context

Feel free to send PRs to update this docs as they change. Just clone, run `bun run scraper.ts`, push, and send the PR. Thx!
