---
title: Website Analyzer API
emoji: 🔍
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# Website Analyzer API

A REST API for analyzing websites - fetch content, extract metadata, analyze structure, and check performance metrics.

## API Endpoints

- **GET /fetch?url={url}** - Fetch webpage content
- **GET /analyze?url={url}** - Analyze HTML structure
- **GET /metadata?url={url}** - Extract metadata
- **GET /performance?url={url}** - Check performance

## Usage

Once deployed, you can access the API at:

```
https://your-username-website-analyzer-api.hf.space
```

### Example Request

```bash
curl "https://your-username-website-analyzer-api.hf.space/fetch?url=https://example.com"
```

## Use with ChatGPT

1. Copy the OpenAPI specification from `openapi.yaml`
2. In ChatGPT, create a Custom GPT
3. Add an Action using the OpenAPI spec
4. Update the server URL to your Hugging Face Spaces URL
5. Start analyzing websites!

## Features

- ✅ Fetch and clean webpage content
- ✅ Analyze HTML structure (headings, links, images, etc.)
- ✅ Extract SEO metadata (Open Graph, Twitter Cards)
- ✅ Check performance metrics (response time, page size)
- ✅ CORS enabled for browser access
- ✅ OpenAPI 3.0 compliant

## License

MIT
