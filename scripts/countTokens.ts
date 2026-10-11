// One-off: prints how many tokens SYSTEM_PROMPT costs on the chat model, so we
// know whether it clears Haiku 4.5's 4,096-token minimum for prompt caching.
//
// Run with: node --env-file=.env.local scripts/countTokens.ts
// (Node 24 strips the TypeScript types natively; no extra tooling needed.)
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../lib/chat/systemPrompt.ts";

const MODEL = "claude-haiku-4-5-20251001";
const CACHE_MINIMUM = 4096;

const client = new Anthropic();

// count_tokens needs at least one message, so count once with the system
// block and once without, and subtract to isolate the system prompt.
const messages: Anthropic.MessageParam[] = [{ role: "user", content: "Hi" }];

const [withSystem, withoutSystem] = await Promise.all([
  client.messages.countTokens({
    model: MODEL,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  }),
  client.messages.countTokens({ model: MODEL, messages }),
]);

const systemTokens = withSystem.input_tokens - withoutSystem.input_tokens;

console.log(`Model:                 ${MODEL}`);
console.log(`System prompt tokens:  ${systemTokens}`);
console.log(`Request total ("Hi"):  ${withSystem.input_tokens}`);
console.log(
  systemTokens >= CACHE_MINIMUM
    ? `Above the ${CACHE_MINIMUM}-token cache minimum: caching will apply.`
    : `Below the ${CACHE_MINIMUM}-token cache minimum by ${CACHE_MINIMUM - systemTokens}: nothing will be cached.`
);
