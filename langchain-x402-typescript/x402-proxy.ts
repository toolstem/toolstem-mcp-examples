/**
 * x402 reverse proxy.
 *
 * Why this exists:
 *   @langchain/mcp-adapters connects to MCP servers over plain HTTP and
 *   doesn't accept a custom fetch implementation. Toolstem's hosted MCP
 *   endpoint replies with HTTP 402 to force payment. To bridge the two,
 *   we run a tiny local proxy that wraps fetch with x402-fetch, signs
 *   USDC payments from the agent's wallet, and forwards transparently
 *   to mcp.toolstem.com.
 *
 * LangChain points at http://localhost:4021/mcp/finance instead of
 * https://mcp.toolstem.com/mcp/finance — same MCP protocol, payment
 * handled out-of-band.
 *
 * Usage:
 *   export X402_PRIVATE_KEY=0x...   # Base mainnet wallet with $0.10+ USDC
 *   npm run proxy                    # listens on :4021
 *   npm run finance                  # in another terminal
 */

import { createServer } from "node:http";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";

const PORT = Number(process.env.X402_PROXY_PORT ?? 4021);
const UPSTREAM = process.env.TOOLSTEM_UPSTREAM ?? "https://mcp.toolstem.com";
const MAX_PAYMENT_USD = Number(process.env.X402_MAX_PAYMENT_USD ?? 1.0);

const pk = process.env.X402_PRIVATE_KEY;
if (!pk) {
  console.error("Missing X402_PRIVATE_KEY (Base mainnet wallet, fund with $0.10+ USDC).");
  process.exit(1);
}

// x402-fetch accepts either a viem WalletClient (full SignerWallet, with
// PublicActions extended) or a LocalAccount. The LocalAccount path is
// simpler and sufficient for signing — chain id is read from the 402
// payment-required payload, not from the wallet, when the wallet is a
// LocalAccount. See x402-fetch/dist/esm/index.mjs.
const account = privateKeyToAccount(pk as `0x${string}`);

// Drop-in fetch that auto-signs x402 payments up to MAX_PAYMENT_USD per call.
// 1 USDC = 1_000_000 atomic units (6 decimals).
const fetchWithPay = wrapFetchWithPayment(
  fetch,
  account,
  BigInt(Math.floor(MAX_PAYMENT_USD * 1_000_000))
);

const server = createServer(async (req, res) => {
  try {
    const upstreamUrl = `${UPSTREAM}${req.url ?? "/"}`;
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      // Strip hop-by-hop and proxy-internal headers; let fetch set Host.
      if (["host", "connection", "content-length"].includes(k.toLowerCase())) continue;
      if (typeof v === "string") headers[k] = v;
      else if (Array.isArray(v)) headers[k] = v.join(", ");
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const upstream = await fetchWithPay(upstreamUrl, {
      method: req.method,
      headers,
      body: body && req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
    });

    // Forward status + headers + body back to LangChain.
    res.statusCode = upstream.status;
    upstream.headers.forEach((v, k) => {
      // Skip hop-by-hop headers and ones Node will set.
      if (["transfer-encoding", "connection"].includes(k.toLowerCase())) return;
      res.setHeader(k, v);
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (err: any) {
    console.error("[x402-proxy]", err?.message ?? err);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "x402_proxy_failure", message: String(err?.message ?? err) }));
  }
});

server.listen(PORT, () => {
  console.log(`[x402-proxy] listening on http://localhost:${PORT}`);
  console.log(`[x402-proxy] forwarding -> ${UPSTREAM}`);
  console.log(`[x402-proxy] wallet ${account.address} (max $${MAX_PAYMENT_USD}/call)`);
});
