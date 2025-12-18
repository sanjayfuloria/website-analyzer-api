# Website Analyzer API

A REST API server for analyzing websites that works with ChatGPT Actions. This API can fetch webpage content, analyze HTML structure, extract metadata, and check performance metrics.

## Features

### API Endpoints

1. **GET /fetch?url={url}** - Fetch and extract the main content from any webpage

   - Returns title, meta description, and cleaned text content
   - Removes navigation, scripts, and styling for cleaner output

2. **GET /analyze?url={url}** - Analyze the HTML structure of a webpage

   - Count headings (H1-H6)
   - Analyze links (internal vs external)
   - Image statistics (with/without alt text)
   - Count forms, buttons, inputs, videos, iframes, and tables

3. **GET /metadata?url={url}** - Extract all metadata from a webpage

   - Standard meta tags (description, keywords, author, robots)
   - Open Graph tags for social sharing
   - Twitter Card metadata
   - Canonical URLs

4. **GET /performance?url={url}** - Check basic performance metrics
   - Response time
   - Page size
   - Resource counts (scripts, stylesheets, images)
   - HTTP headers

## Installation

```bash
npm install
npm run build
```

## Running the Server

Start the API server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

To use a different port:

```bash
PORT=8080 npm start
```

## Using with ChatGPT

### Option 1: Local Testing (Development)

1. Start the server locally: `npm start`
2. The API will be available at `http://localhost:3000`
3. Note: ChatGPT can only access publicly available URLs, so you'll need to deploy this for production use

### Option 2: Deploy and Use with ChatGPT Actions (Production)

1. **Deploy the API** to a cloud service:

   - Deploy to Railway, Render, Fly.io, Heroku, or any Node.js hosting
   - Make sure it's publicly accessible via HTTPS
   - Note your deployment URL (e.g., `https://your-app.railway.app`)

2. **Create a Custom GPT**:

   - Go to [ChatGPT](https://chat.openai.com)
   - Click your profile → "My GPTs" → "Create a GPT"
   - Configure the GPT:
     - **Name**: Website Analyzer
     - **Description**: "Analyze websites, fetch content, extract metadata, and check performance"
     - **Instructions**: "You are a website analyzer. Use the available actions to help users analyze websites. When a user asks to analyze a website, fetch its content, structure, metadata, or performance metrics as appropriate."

3. **Add Actions**:

   - Click "Configure" tab
   - Scroll to "Actions" section
   - Click "Create new action"
   - Import the OpenAPI schema:
     - Click "Import from URL" or paste the contents of `openapi.yaml`
     - Update the server URL to your deployed URL
   - Authentication: None (or add API key if you implement it)

4. **Test and Save**:
   - Test the GPT with queries like "Analyze https://example.com"
   - Save your GPT (private or public)

### Example Deployment to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

## API Usage Examples

### Fetch webpage content:

```bash
curl "http://localhost:3000/fetch?url=https://example.com"
```

### Analyze structure:

```bash
curl "http://localhost:3000/analyze?url=https://github.com"
```

### Extract metadata:

```bash
curl "http://localhost:3000/metadata?url=https://wikipedia.org"
```

### Check performance:

```bash
curl "http://localhost:3000/performance?url=https://google.com"
```

## Example ChatGPT Prompts

Once configured, you can ask ChatGPT:

- "Analyze the structure of https://example.com"
- "What's the SEO metadata for https://github.com?"
- "Fetch the main content from https://news.ycombinator.com"
- "Check the performance metrics for https://stackoverflow.com"

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

## Requirements

- Node.js 18 or higher
- npm or yarn

## Dependencies

- `express` - Web framework
- `cors` - Enable CORS for API access
- `cheerio` - HTML parsing and manipulation
- `node-fetch` - HTTP client for fetching webpages

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available in [openapi.yaml](openapi.yaml), which can be imported directly into ChatGPT Actions or used with tools like Swagger UI.

## Security Notes

- This is a basic implementation without authentication
- For production use, consider adding:
  - API key authentication
  - Rate limiting
  - Request validation
  - HTTPS enforcement
  - Monitoring and logging

## License

MIT
