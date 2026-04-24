# LangChain + Toolstem

Use Toolstem as a hosted MCP server with LangChain via the `langchain-mcp-adapters` package.

## Setup

```bash
pip install langchain langchain-openai langchain-mcp-adapters langgraph
export OPENAI_API_KEY="sk-..."
export APIFY_TOKEN="apify_api_..."
```

Get your Apify token at [console.apify.com/account/integrations](https://console.apify.com/account/integrations).

## Run

```bash
python compare_companies.py
```

The script connects to Toolstem's hosted MCP endpoint over streamable HTTP, discovers its tools, builds a LangGraph ReAct agent, and runs a compare-companies query.

## What's happening

1. `MultiServerMCPClient` opens a streamable HTTP connection to Toolstem with your Apify token in the `Authorization` header.
2. `client.get_tools()` returns LangChain `BaseTool` instances for `get_stock_snapshot`, `get_company_metrics`, and `compare_companies`.
3. `create_react_agent(...)` wires those tools into a standard ReAct loop with `gpt-4o-mini`.
4. The agent picks `compare_companies`, the SDK forwards the call to Apify, the hosted server returns flat JSON, and the agent synthesizes an answer.
5. Your Apify account is charged $0.005 per tool call.

## Using with other LLMs

Swap `ChatOpenAI` for any LangChain chat model (Anthropic, local Llama via Ollama, Together, etc.) — the Toolstem tools work identically since they're exposed through the MCP adapter.
