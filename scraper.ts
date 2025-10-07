#!/usr/bin/env bun

import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";

interface ScrapedContent {
  url: string;
  content: string;
  filePath: string;
}

async function fetchContent(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

function extractMarkdownLinks(content: string): string[] {
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Only include links that start with the target domain
    if (
      url.startsWith("https://developers.openai.com/apps-sdk/") ||
      url.startsWith("/apps-sdk/")
    ) {
      // Normalize relative URLs
      const fullUrl = url.startsWith("/")
        ? `https://developers.openai.com${url}`
        : url;
      links.push(fullUrl);
    }
  }

  // Remove duplicates
  return [...new Set(links)];
}

function urlToFilePath(url: string): string {
  // Extract path after /apps-sdk/
  const match = url.match(/\/apps-sdk\/(.*)$/);

  if (!match || !match[1]) {
    // This is the base apps-sdk page
    return "index.md";
  }

  let path = match[1];

  // Remove trailing slash
  path = path.replace(/\/$/, "");

  // If path is empty after removing slash, it's the index
  if (!path) {
    return "index.md";
  }

  // Add .md extension if not present
  if (!path.endsWith(".md")) {
    path += ".md";
  }

  return path;
}

async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  if (dir && dir !== ".") {
    await mkdir(dir, { recursive: true });
  }
}

async function scrapeAndSave(url: string): Promise<ScrapedContent> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const content = await fetchContent(jinaUrl);
  const filePath = urlToFilePath(url);

  await ensureDirectoryExists(filePath);
  await writeFile(filePath, content, "utf-8");

  console.log(`✓ Saved: ${filePath}`);

  return {
    url,
    content,
    filePath,
  };
}

async function main() {
  try {
    console.log("🚀 Starting OpenAI Apps SDK documentation scraper...\n");

    // Fetch the main page
    const baseUrl = "https://r.jina.ai/https://developers.openai.com/apps-sdk/";
    const mainContent = await fetchContent(baseUrl);

    // Extract all relevant links
    console.log("\n📋 Extracting markdown links...");
    const links = extractMarkdownLinks(mainContent);

    // Add the base URL to the list
    const allUrls = ["https://developers.openai.com/apps-sdk/", ...links];
    const uniqueUrls = [...new Set(allUrls)];

    console.log(`Found ${uniqueUrls.length} unique URLs to scrape:`);
    uniqueUrls.forEach((url) => console.log(`  - ${url}`));

    console.log("\n📥 Starting to scrape pages...");

    // Scrape all pages
    const results: ScrapedContent[] = [];

    for (const url of uniqueUrls) {
      try {
        const result = await scrapeAndSave(url);
        results.push(result);

        // Add a small delay to be respectful
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to scrape ${url}:`, error);
      }
    }

    console.log(`\n✅ Successfully scraped ${results.length} pages!`);
    console.log("\nFiles created:");
    results.forEach((result) => console.log(`  - ${result.filePath}`));
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  main();
}
