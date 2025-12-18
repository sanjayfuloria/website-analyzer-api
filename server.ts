import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || "your_api_key_here";

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to fetch HTML using ScraperAPI
async function fetchHTML(url: string): Promise<string> {
  try {
    // Use ScraperAPI for robust scraping
    const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(
      url
    )}&render=true`;

    const response = await fetch(scraperUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
      timeout: 30000,
    });

    if (response.ok) {
      const html = await response.text();
      return html;
    } else {
      throw new Error(`ScraperAPI error: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch ${url}: ${errorMessage}`);
  }
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Website Analyzer API",
    version: "1.0.0",
    status: "running",
    endpoints: [
      "GET /fetch?url=<url>",
      "GET /analyze?url=<url>",
      "GET /metadata?url=<url>",
      "GET /performance?url=<url>",
    ],
  });
});

// Fetch webpage content
app.get("/fetch", async (req, res) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, footer, aside").remove();

    // Extract main content
    const title = $("title").text().trim() || "No title found";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const mainContent =
      $("main").text() || $("article").text() || $("body").text();

    // Clean up whitespace
    const cleanContent = mainContent
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000); // Limit content length

    res.json({
      url,
      title,
      metaDescription,
      content: cleanContent,
      contentLength: mainContent.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

// Analyze webpage structure
app.get("/analyze", async (req, res) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

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
      external: $('a[href^="http"]').not(`a[href*="${new URL(url).hostname}"]`)
        .length,
      internal:
        $("a").length -
        $('a[href^="http"]').not(`a[href*="${new URL(url).hostname}"]`).length,
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

    res.json(structure);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

// Extract metadata
app.get("/metadata", async (req, res) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

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

    res.json(metadata);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

// Check performance
app.get("/performance", async (req, res) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

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

    res.json(performance);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Website Analyzer API running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
});
