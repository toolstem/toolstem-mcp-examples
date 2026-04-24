"""
LangChain + Toolstem MCP example.

Loads Toolstem's tools via langchain-mcp-adapters, binds them to an
OpenAI-compatible LLM, and runs an agent that compares companies.

Usage:
    pip install langchain langchain-openai langchain-mcp-adapters
    export OPENAI_API_KEY="sk-..."
    export APIFY_TOKEN="apify_api_..."
    python compare_companies.py
"""

import asyncio
import os

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent


TOOLSTEM_MCP_URL = "https://mcp.apify.com/?tools=toolstem/toolstem-mcp-server"


async def main() -> None:
    apify_token = os.environ["APIFY_TOKEN"]

    # MultiServerMCPClient manages the connection to one or more MCP servers
    # and exposes their tools as LangChain-compatible tool objects.
    client = MultiServerMCPClient(
        {
            "toolstem": {
                "url": TOOLSTEM_MCP_URL,
                "transport": "streamable_http",
                "headers": {"Authorization": f"Bearer {apify_token}"},
            }
        }
    )

    tools = await client.get_tools()

    agent = create_react_agent(
        ChatOpenAI(model="gpt-4o-mini"),
        tools,
        prompt=(
            "You are a financial analyst. Use the compare_companies tool "
            "when asked to evaluate multiple tickers. Cite specific numeric "
            "fields (P/E, market cap, DCF signal) in your response."
        ),
    )

    result = await agent.ainvoke(
        {
            "messages": [
                (
                    "user",
                    "Compare AAPL, MSFT, and GOOGL on valuation and DCF "
                    "signal. Which looks most attractive?",
                )
            ]
        }
    )
    # Last message is the agent's final answer after tool calls
    print(result["messages"][-1].content)


if __name__ == "__main__":
    asyncio.run(main())
