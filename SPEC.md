create a simple bun typescript script that :

- fetches https://r.jina.ai/developers.openai.com/apps-sdk
- extracts all unique markdown links linking to anything starting with https://developers.openai.com/apps-sdk/
- scrape each of them using https://r.jina.ai/{url}
- write all output files to {path/to/page}.md where path/to/page is the path after /apps-sdk. the apps-sdk itself can be called /index.md
