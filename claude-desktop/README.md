# Claude Desktop + Toolstem

Add Toolstem as an MCP server in Claude Desktop so Claude can fetch stock data, company metrics, and company comparisons directly in conversation.

## Setup

1. Find your Claude Desktop config file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Toolstem server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "toolstem": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=toolstem/toolstem-mcp-server",
        "--header",
        "Authorization:${APIFY_TOKEN_HEADER}"
      ],
      "env": {
        "APIFY_TOKEN_HEADER": "Bearer your_apify_token_here"
      }
    }
  }
}
```

3. Replace `your_apify_token_here` with your Apify API token from [console.apify.com/account/integrations](https://console.apify.com/account/integrations). Keep the `Bearer ` prefix — the full value of `APIFY_TOKEN_HEADER` must be `Bearer <your_token>`.

> **Why this structure:** Claude Desktop's `env` block only injects environment variables into the `mcp-remote` subprocess, not into HTTP requests. The `--header` flag is what forwards the token as an `Authorization` header to the Apify MCP endpoint. The `Authorization:${APIFY_TOKEN_HEADER}` form (no space between `:` and `${`) is cross-platform safe on macOS, Windows, and Cursor.

4. Restart Claude Desktop.

## Try it

Open a new Claude Desktop conversation and ask:

> Compare AAPL, MSFT, and GOOGL on valuation and growth.

Claude will invoke `compare_companies`, get a flat JSON response with all three companies side-by-side, and synthesize an answer. Each invocation costs $0.005 on your Apify account.

## What's available

- **`get_stock_snapshot`** — price, DCF valuation, rating, and fundamentals for one ticker
- **`get_company_metrics`** — annual or quarterly income statement, ratios, and growth metrics
- **`compare_companies`** — side-by-side comparison of 2–5 tickers with derived rankings

## Full example prompts

- "Pull Tesla's latest quarterly metrics and tell me if revenue is accelerating."
- "Is NVDA undervalued based on its DCF signal?"
- "Compare the P/E and market cap of Amazon, Google, and Microsoft."
