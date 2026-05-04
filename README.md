# Toolstem MCP — Examples

Working, minimal examples of calling the [Toolstem MCP Server](https://apify.com/toolstem/toolstem-mcp-server) from common AI agent frameworks.

Toolstem exposes three tools — `get_stock_snapshot`, `get_company_metrics`, and `compare_companies` — as a hosted Model Context Protocol server with pay-per-call billing. No subscription, no API keys to manage, no glue code between vendor endpoints.

**Hosted endpoints:**
- Direct x402 (no signup, agent's wallet pays per call): `https://mcp.toolstem.com/mcp/finance` and `https://mcp.toolstem.com/mcp/sec`
- Apify-hosted (Apify token): `https://mcp.apify.com/?tools=toolstem/toolstem-mcp-server`

## What's in this repo

| Directory | What it shows | Auth | Language |
|---|---|---|---|
| [`langchain-x402-typescript/`](langchain-x402-typescript/) | LangChain.js + Toolstem via **x402 micropayments** — agent's own wallet pays $0.01/call. Runnable in 60 seconds. | x402 (USDC on Base) | TypeScript |
| [`langchain/`](langchain/) | LangChain (Python) using `langchain-mcp-adapters` via Apify-hosted endpoint | Apify token | Python |
| [`openai-agents-sdk/`](openai-agents-sdk/) | OpenAI Agents SDK calling `compare_companies` as a hosted tool | Apify token | Python |
| [`claude-desktop/`](claude-desktop/) | Claude Desktop configuration to add Toolstem as an MCP server | x402 or Apify | JSON config |

Each example is self-contained: one file, runs as-is after setting environment variables, no framework configuration beyond what the framework itself requires.

## Quick start

```bash
git clone https://github.com/toolstem/toolstem-mcp-examples.git
cd toolstem-mcp-examples
```

Then follow the README in whichever directory matches your stack.

## What Toolstem returns

Each tool returns one flat JSON response with derived signals pre-computed — no nested arrays to walk, no cross-endpoint stitching:

```json
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "price": {
    "current": 178.52,
    "distance_from_52w_high_percent": -10.57,
    ...
  },
  "valuation": {
    "market_cap_readable": "2.75T",
    "dcf_upside_percent": 8.4,
    "dcf_signal": "FAIRLY VALUED",
    ...
  },
  "rating": {
    "recommendation": "Buy",
    "score": 4,
    ...
  }
}
```

## Pricing

Pay-per-call via Apify: `$0.005` per tool call. No subscription. You're billed only when a tool actually returns data.

## Links

- **Live MCP endpoint:** https://mcp.apify.com/?tools=toolstem/toolstem-mcp-server
- **Apify Store listing:** https://apify.com/toolstem/toolstem-mcp-server
- **Source (server):** https://github.com/toolstem/toolstem-mcp-server
- **npm:** https://www.npmjs.com/package/toolstem-mcp-server

## License

MIT. Use the examples freely in your own projects.
