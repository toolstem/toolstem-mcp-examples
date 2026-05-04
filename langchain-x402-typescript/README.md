# LangChain.js + Toolstem via x402 — agent pays per call from its own wallet

The differentiated AI-to-AI revenue path: no Apify account, no API key, no signup. The agent funds its own wallet with USDC on Base mainnet and pays $0.01 per tool call.

## Why a local proxy?

`@langchain/mcp-adapters` doesn't accept a custom `fetch` implementation. We run a 60-line reverse proxy on `localhost:4021` that uses [`x402-fetch`](https://www.npmjs.com/package/x402-fetch) to sign payments transparently, then forwards to `mcp.toolstem.com`. LangChain talks to the proxy; the proxy talks to Toolstem.

```
LangChain agent  →  http://localhost:4021/mcp/finance
                            │
                            ▼  (x402-fetch auto-signs USDC)
                    https://mcp.toolstem.com/mcp/finance
```

## Setup (60 seconds)

```bash
git clone https://github.com/toolstem/toolstem-mcp-examples.git
cd toolstem-mcp-examples/langchain-x402-typescript
npm install

# Generate or import a Base mainnet wallet, fund with $0.10+ USDC.
# A burner private key for testing is fine — only fund what you'd spend on coffee.
export X402_PRIVATE_KEY=0xYOUR_BASE_MAINNET_PRIVATE_KEY
export OPENAI_API_KEY=sk-...
```

## Run

Terminal 1:

```bash
npm run proxy
# [x402-proxy] listening on http://localhost:4021
# [x402-proxy] forwarding -> https://mcp.toolstem.com
# [x402-proxy] wallet 0xAbC...123 (max $1.0/call)
```

Terminal 2:

```bash
npm run finance
# [demo] discovering tools...
# [demo] loaded 3 tools: get_stock_snapshot, get_company_metrics, compare_companies
# [demo] agent answer:
# AAPL trades at a P/E of ~32 with a $3.2T market cap...
```

Or for SEC filings:

```bash
npm run sec
# [demo] loaded 5 tools: get_company_filings_summary, get_insider_signal, ...
```

## Cost

Each tool call: $0.01 USDC standard, $0.05 for premium digest tools. The compare-3-companies query in `finance-demo.ts` typically costs $0.03 (the agent calls `get_company_metrics` once per ticker). The full SEC demo typically runs $0.04–0.10 depending on how many tools the agent chains.

## What you can swap

- **LLM:** Replace `ChatOpenAI` with `ChatAnthropic`, `ChatTogetherAI`, local Ollama, etc. Tools work identically.
- **Wallet:** Any viem-compatible signer. For production agents, use a dedicated agent wallet with strict daily limits.
- **Max payment:** Set `X402_MAX_PAYMENT_USD=0.05` to cap per-call spend. Defaults to $1.00.
- **Frameworks:** This proxy is framework-agnostic. Point any MCP client (Claude Desktop, Cursor, OpenAI Agents SDK) at `http://localhost:4021/mcp/finance` and it will work the same way.

## Production deployment

For agents running 24/7, deploy the proxy as a sidecar in the same VPC as the agent. The proxy is stateless — scale horizontally. Set `X402_MAX_PAYMENT_USD` low (e.g. `0.05`) and rotate the wallet weekly.

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `insufficient funds for gas` | Wallet has no ETH on Base | Bridge $0.10 ETH to Base via [bridge.base.org](https://bridge.base.org) |
| `payment amount exceeds max` | Tool costs more than `X402_MAX_PAYMENT_USD` | Increase the env var |
| `connection refused localhost:4021` | Proxy not running | Run `npm run proxy` first |
| `402 Payment Required` looped | Wallet has no USDC | Fund with USDC at [app.uniswap.org](https://app.uniswap.org) on Base |

## Source

[github.com/toolstem/toolstem-mcp-examples](https://github.com/toolstem/toolstem-mcp-examples)
