/**
 * Toolstem Finance via LangChain.js — agent pays per call from its own wallet.
 *
 * Prereqs:
 *   - x402-proxy running (npm run proxy in another terminal)
 *   - OPENAI_API_KEY in env
 *
 * What this does:
 *   1. Connects @langchain/mcp-adapters to the local x402 proxy.
 *   2. Discovers Toolstem Finance tools (get_stock_snapshot, get_company_metrics, compare_companies).
 *   3. Wires them into a LangGraph ReAct agent.
 *   4. Asks: "Compare AAPL, MSFT, and GOOGL on valuation and growth."
 *   5. Each tool call costs $0.01 USDC, signed by the agent's wallet.
 */

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const PROXY = process.env.X402_PROXY_URL ?? "http://localhost:4021";

async function main() {
  const client = new MultiServerMCPClient({
    toolstem_finance: {
      transport: "http",
      url: `${PROXY}/mcp/finance`,
    },
  });

  console.log("[demo] discovering tools...");
  const tools = await client.getTools();
  console.log(`[demo] loaded ${tools.length} tools:`, tools.map((t) => t.name).join(", "));

  const agent = createReactAgent({
    llm: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
    tools,
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content:
          "Compare AAPL, MSFT, and GOOGL on price, P/E ratio, and market cap. Tell me which one looks most attractively valued.",
      },
    ],
  });

  const last = result.messages.at(-1);
  console.log("\n[demo] agent answer:\n");
  console.log(typeof last?.content === "string" ? last.content : JSON.stringify(last?.content, null, 2));

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
