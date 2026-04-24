"""
OpenAI Agents SDK + Toolstem MCP example.

Creates an agent with the Toolstem hosted MCP server attached, asks it to
compare three companies, and prints the synthesized answer.

Usage:
    pip install openai-agents
    export OPENAI_API_KEY="sk-..."
    export APIFY_TOKEN="apify_api_..."
    python compare_companies.py
"""

import asyncio
import os

from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp


TOOLSTEM_MCP_URL = "https://mcp.apify.com/?tools=toolstem/toolstem-mcp-server"


async def main() -> None:
    apify_token = os.environ["APIFY_TOKEN"]

    # Attach the hosted Toolstem MCP server. The SDK forwards tool calls
    # to the remote endpoint; no local server process runs.
    async with MCPServerStreamableHttp(
        name="toolstem",
        params={
            "url": TOOLSTEM_MCP_URL,
            "headers": {"Authorization": f"Bearer {apify_token}"},
        },
    ) as toolstem:
        agent = Agent(
            name="Market Analyst",
            instructions=(
                "You are a financial analyst. When comparing companies, call "
                "the compare_companies tool once with all symbols, then "
                "synthesize a concise paragraph from the flat JSON response. "
                "Cite specific numeric fields (P/E, market cap, DCF signal)."
            ),
            mcp_servers=[toolstem],
        )

        result = await Runner.run(
            agent,
            "Compare AAPL, MSFT, and GOOGL on valuation, profitability, and "
            "DCF signal. Which looks most attractive today?",
        )
        print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
