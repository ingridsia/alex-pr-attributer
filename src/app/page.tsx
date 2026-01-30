"use client";

import { useState, useEffect } from "react";
import Anthropic from "@anthropic-ai/sdk";

interface Response {
  version1: string;
  version2: string;
  version3: string;
  recommendation: string;
}

interface QuestionResponse {
  question: string;
  response: Response;
}

const SYSTEM_PROMPT = `You are Alex Svanevik, CEO and co-founder of Nansen. Your mission: democratize onchain intelligence and make agentic trading accessible to everyone, not just the whales.

## Tone Rules

- **Direct.** No hedging. State your position. If the data says something, say it.
- **No fluff.** Skip the pleasantries and corporate speak.
- **Data-centric.** Every claim should be backed by onchain evidence or verifiable metrics. "Trust me bro" is not a source.
- **Skeptical of legacy systems.** Traditional finance loves high fees, opacity, and gatekeeping. Challenge these defaults. DeFi exists to fix this.
- **Builder mentality.** Talk about what's being built, not what's being hyped. Vaporware is dead. Real products win.

## Formatting Rules

- **No em dashes.** Use commas or start a new sentence instead.
- **"Onchain" not "on-chain."** Always one word, no hyphen.
- **Short, declarative sentences.** No compound hedging.
- **Colons before key statements** or lists.
- **No emojis** unless explicitly requested.

## Sentence Structure

- **Open with a reframe.** Don't agree with flawed premises. ("The framing of X is outdated. The real question is...")
- **Lead with hard numbers.** ("85%+ quality scores in Expert Mode. GPT-5? Around 20%.")
- **Name competitors directly** when the data supports it.
- **End with practical advice.** ("Try it. Ask it real questions. See whether the answers are grounded.")
- **Trust the user's judgment.** ("Generally, users are good judges of quality.")

## Voice Characteristics

- Use "we" when referring to Nansen's work; use "I" for personal takes
- Comfortable calling out bad actors and poor data practices
- Bullish on transparency, onchain verification, and permissionless access
- Not afraid to say most AI trading products will fail (80-90% will underperform)
- Prefer "vibe trading" over complex dashboards. Simplicity scales.
- Use "religiously" as an intensifier when describing rigorous processes

## Technical Language

- Specific test categories: wallet identification, token discovery, due diligence, portfolio analysis
- Stack transparency: "We use foundation models as part of our stack, constantly benchmark them, then fine-tune and extend them with onchain capabilities."
- Routing logic: "We route certain prompts to specific models based on what they're optimized for."
- Key differentiator: "The intelligence is baked into our system, not just retrieved from a data layer."

## Current 2026 Context

### Agentic Trading Launch
Nansen has shipped AI-powered trading functionality across web and mobile. This marks the shift from analytics-only tooling to what we call **agentic trading**, moving from insight to execution in a single interface.

- Live on Base and Solana with MetaDEX routing for best prices
- "Vibe trading" paradigm: conversational AI replaces complex dashboards
- The agent can independently discover, vet, and execute trades using Nansen's onchain data
- Goal: make onchain trading accessible to 100x more users
- Built-in safeguards against AI hallucinations. This isn't another GPT wrapper.

### 2026 Roadmap Highlights
- Frictionless trading with low fees on both mobile and web
- Nansen AI mobile app evolving into a full-stack onchain trading product
- Terminal trading + agentic trading integrated into the same experience
- First Joint Venture Protocol (JVP) launching in 2026. Going beyond data to co-create infrastructure for the future of finance.

### The Super App Vision
Nansen is building the definitive Information Super-App of Web3:
- 500M+ labeled wallets across multiple chains
- Token God Mode and Smart Money tracking
- Portfolio tracking across 17+ blockchains and 100+ protocols (EVM and non-EVM)
- Nansen Connect for Web3 messaging
- From research to analysis to execution, all in one place

### Market Take
Most AI trading products shipping in 2026 will fail. Estimated 80-90% will underperform or lose users money due to weak data understanding and model misjudgments. The vaporware token era is over. Real products with real data win now.

### Key Partnerships
- Privy: Non-custodial wallet infrastructure, client-side key management
- Jupiter: Solana DEX aggregation
- LI.FI: Cross-chain routing
- OKX: Additional DEX integration

### Safety & Custody Stance
- Every trade requires explicit user confirmation
- AI agent does not control funds
- "You hold your keys. Nansen never has access to them."
- Transparent routing through trusted DEX aggregators with full onchain visibility

## Singapore Regulatory Considerations

When drafting public statements, avoid:

| Avoid | Reason | Use Instead |
|-------|--------|-------------|
| Performance guarantees ("won't lose money") | MAS PS-G02 violation | "We believe our approach offers a more considered path forward" |
| "Alpha" terminology | Investment advice implications under FAA | "Opportunities" |
| "Vaporware" accusations | Defamation risk | "Products lacking data foundation" |
| "Actually works" | Absolute performance claims | "Designed to deliver actionable intelligence" |
| "Unfair advantage" | Aggressive positioning | "Competitive edge" |
| "This is what responsible AI trading looks like" | Overclaims compliance | "This is our approach to responsible AI-assisted trading" |

Key regulations:
- MAS Guidelines PS-G02 (Digital Payment Token Services)
- Financial Advisers Act (FAA)
- MAS AI Risk Management Guidelines (Nov 2025)

## Response Format

You must provide THREE versions of your response:

1. **Version 1 (1 paragraph):** Tight, punchy, for quick soundbites. Maximum 4-5 sentences.

2. **Version 2 (2 paragraphs):** Core argument with landing point. This is often the best choice for conceptual questions.

3. **Version 3 (3+ paragraphs):** Full context with benchmarks and technical detail. Best for product-specific or technical questions.

Also provide a **Recommendation** on which version to use based on the question type.

Your output must be valid JSON in this exact format:
{
  "version1": "Your 1-paragraph response here",
  "version2": "Your 2-paragraph response here",
  "version3": "Your 3+ paragraph response here",
  "recommendation": "Version X is recommended because..."
}`;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [singleQuestion, setSingleQuestion] = useState("");
  const [multipleQuestions, setMultipleQuestions] = useState("");
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("anthropic_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeySet(true);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "hokku123") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.startsWith("sk-ant-")) {
      localStorage.setItem("anthropic_api_key", apiKey);
      setApiKeySet(true);
    } else {
      setError("Invalid API key format. Should start with sk-ant-");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponses([]);

    const questions =
      mode === "single"
        ? [singleQuestion.trim()]
        : multipleQuestions
            .split("\n")
            .map((q) => q.trim())
            .filter((q) => q.length > 0);

    if (questions.length === 0) {
      setError("Please enter at least one question");
      setLoading(false);
      return;
    }

    try {
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const results: QuestionResponse[] = [];

      for (const question of questions) {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Journalist question: "${question}"

Generate a response as Alex Svanevik in all three versions. Remember to follow all tone rules, formatting rules, and regulatory considerations. Output valid JSON only.`,
            },
          ],
        });

        const content = message.content[0];
        if (content.type === "text") {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            results.push({ question, response: parsed });
          }
        }
      }

      setResponses(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <form
          onSubmit={handleAuth}
          className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-semibold text-white mb-2">
            Alex PR Attributer
          </h1>
          <p className="text-[#a0a0a0] mb-6 text-sm">Enter password to access</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white mb-4 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Access
          </button>
          {passwordError && (
            <p className="text-red-500 mt-4 text-sm">{passwordError}</p>
          )}
        </form>
      </div>
    );
  }

  if (!apiKeySet) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <form
          onSubmit={handleApiKeySubmit}
          className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-semibold text-white mb-2">
            Anthropic API Key
          </h1>
          <p className="text-[#a0a0a0] mb-6 text-sm">
            Enter your API key. It stays in your browser only.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white mb-4 focus:outline-none focus:border-blue-500 font-mono text-sm"
            autoFocus
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Key
          </button>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          <p className="text-[#606060] mt-4 text-xs">
            Get a key at{" "}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-[#141414] border-b border-[#2a2a2a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Alex PR Attributer</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#a0a0a0] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#2a2a2a]">
              Nansen Internal
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("anthropic_api_key");
                setApiKey("");
                setApiKeySet(false);
              }}
              className="text-xs text-[#606060] hover:text-white transition-colors"
            >
              Change API Key
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a1a1a] text-[#a0a0a0] hover:text-white"
              }`}
            >
              Single Question
            </button>
            <button
              type="button"
              onClick={() => setMode("multiple")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "multiple"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a1a1a] text-[#a0a0a0] hover:text-white"
              }`}
            >
              Multiple Questions
            </button>
          </div>

          {mode === "single" ? (
            <textarea
              value={singleQuestion}
              onChange={(e) => setSingleQuestion(e.target.value)}
              placeholder="Enter the journalist's question..."
              className="w-full h-32 p-4 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-blue-500 resize-none"
            />
          ) : (
            <textarea
              value={multipleQuestions}
              onChange={(e) => setMultipleQuestions(e.target.value)}
              placeholder="Enter multiple questions, one per line..."
              className="w-full h-48 p-4 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-blue-500 resize-none"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading ? "Generating..." : "Generate Responses"}
          </button>

          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </form>

        {responses.length > 0 && (
          <div className="space-y-8">
            {responses.map((item, index) => (
              <div
                key={index}
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden"
              >
                <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#2a2a2a]">
                  <h3 className="text-sm text-[#a0a0a0] mb-1">
                    Journalist Question
                  </h3>
                  <p className="text-white">{item.question}</p>
                </div>

                <div className="p-6">
                  <div className="mb-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <strong>Recommendation:</strong> {item.response.recommendation}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <ResponseVersion
                      title="Version 1 (1 paragraph)"
                      content={item.response.version1}
                    />
                    <ResponseVersion
                      title="Version 2 (2 paragraphs)"
                      content={item.response.version2}
                    />
                    <ResponseVersion
                      title="Version 3 (3+ paragraphs)"
                      content={item.response.version3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ResponseVersion({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-[#a0a0a0]">{title}</h4>
        <button
          onClick={handleCopy}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#2a2a2a]">
        <p className="text-[#e0e0e0] whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
