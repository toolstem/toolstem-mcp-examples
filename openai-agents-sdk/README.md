# OpenAI Agents SDK + Toolstem

Use Toolstem as a hosted MCP server with the OpenAI Agents SDK.

## Setup

```bash
pip install openai-agents
export OPENAI_API_KEY="sk-..."
export APIFY_TOKEN="apify_api_..."
```

Get your Apify token at [console.apify.com/account/integrations](https://console.apify.com/account/integrations).

## Run

```bash
python compare_companies.py
```

The script creates an agent with the Toolstem MCP server attached, asks it to compare three companies, and prints the synthesized analysis.

## What's happening

1. `MCPServerStreamableHttp` connects to `https://mcp.apify.com/?tools=toolstem/toolstem-mcp-server` over streamable HTTP with your Apify token in the `Authorization` header.
2. The SDK discovers Toolstem's three tools automatically.
3. When the agent calls `compare_companies`, the request is forwarded to the hosted server on Apify, which fetches the data, derives signals, and returns one flat JSON response.
4. Your Apify account is charged $0.005 per tool call.

## Customizing

- Swap the model by passing `model="gpt-4o"` or any other OpenAI model to `Agent(...)`.
- Combine Toolstem with other MCP servers by adding more entries to `mcp_servers=[...]`.
- Use `compare_companies`, `get_stock_snapshot`, or `get_company_metrics` in your own prompts — the agent will pick the right tool.
