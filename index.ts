#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// Create server instance
const server = new Server(
  {
    name: "website-analyzer",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_webpage",
        description:
          "Fetch and return the main content from a webpage. Extracts the text content, title, and meta description.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the webpage to fetch",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "analyze_structure",
        description:
          "Analyze the HTML structure of a webpage. Returns information about headings, links, images, forms, and other structural elements.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the webpage to analyze",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "extract_metadata",
        description:
          "Extract metadata from a webpage including Open Graph tags, Twitter Card tags, meta tags, and canonical URLs.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the webpage to extract metadata from",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "check_performance",
        description:
          "Check basic performance metrics of a webpage including response time, page size, and resource counts.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the webpage to check performance for",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

// Helper function to fetch HTML
async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0; +https://github.com/)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "fetch_webpage": {
        const url = String(args.url);
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        // Remove script and style elements
        $("script, style, nav, footer, aside").remove();

        // Extract main content
        const title = $("title").text().trim() || "No title found";
        const metaDescription =
          $('meta[name="description"]').attr("content") || "";
        const mainContent =
          $("main").text() || $("article").text() || $("body").text();

        // Clean up whitespace
        const cleanContent = mainContent
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 5000); // Limit content length

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  url,
                  title,
                  metaDescription,
                  content: cleanContent,
                  contentLength: mainContent.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "analyze_structure": {
        const url = String(args.url);
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        const headings = {
          h1: $("h1").length,
          h2: $("h2").length,
          h3: $("h3").length,
          h4: $("h4").length,
          h5: $("h5").length,
          h6: $("h6").length,
        };

        const links = {
          total: $("a").length,
          external: $('a[href^="http"]').not(`a[href*="${new URL(url).hostname}"]`).length,
          internal: $("a").length - $('a[href^="http"]').not(`a[href*="${new URL(url).hostname}"]`).length,
        };

        const images = {
          total: $("img").length,
          withAlt: $("img[alt]").length,
          withoutAlt: $("img:not([alt])").length,
        };

        const structure = {
          url,
          headings,
          links,
          images,
          forms: $("form").length,
          buttons: $("button").length,
          inputs: $("input").length,
          videos: $("video").length,
          iframes: $("iframe").length,
          tables: $("table").length,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(structure, null, 2),
            },
          ],
        };
      }

      case "extract_metadata": {
        const url = String(args.url);
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        const metadata: Record<string, any> = {
          url,
          title: $("title").text().trim(),
          description: $('meta[name="description"]').attr("content") || "",
          keywords: $('meta[name="keywords"]').attr("content") || "",
          author: $('meta[name="author"]').attr("content") || "",
          canonical: $('link[rel="canonical"]').attr("href") || "",
          robots: $('meta[name="robots"]').attr("content") || "",
          openGraph: {},
          twitter: {},
        };

        // Open Graph tags
        $('meta[property^="og:"]').each((_, elem) => {
          const property = $(elem).attr("property");
          const content = $(elem).attr("content");
          if (property && content) {
            metadata.openGraph[property.replace("og:", "")] = content;
          }
        });

        // Twitter Card tags
        $('meta[name^="twitter:"]').each((_, elem) => {
          const name = $(elem).attr("name");
          const content = $(elem).attr("content");
          if (name && content) {
            metadata.twitter[name.replace("twitter:", "")] = content;
          }
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      }

      case "check_performance": {
        const url = String(args.url);
        const startTime = Date.now();

        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0; +https://github.com/)",
          },
        });

        const responseTime = Date.now() - startTime;
        const html = await response.text();
        const $ = cheerio.load(html);

        const performance = {
          url,
          responseTime: `${responseTime}ms`,
          statusCode: response.status,
          contentType: response.headers.get("content-type") || "",
          pageSize: `${(html.length / 1024).toFixed(2)} KB`,
          resources: {
            scripts: $("script").length,
            stylesheets: $('link[rel="stylesheet"]').length,
            images: $("img").length,
            totalResources:
              $("script").length +
              $('link[rel="stylesheet"]').length +
              $("img").length,
          },
          headers: {
            server: response.headers.get("server") || "",
            cacheControl: response.headers.get("cache-control") || "",
            contentEncoding: response.headers.get("content-encoding") || "",
          },
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(performance, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Website Analyzer MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
