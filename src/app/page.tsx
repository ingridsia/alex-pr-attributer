"use client";

import { useState } from "react";

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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [singleQuestion, setSingleQuestion] = useState("");
  const [multipleQuestions, setMultipleQuestions] = useState("");
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "hokku123") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
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
      const results: QuestionResponse[] = [];

      for (const question of questions) {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to generate response");
        }

        const data = await res.json();
        results.push({ question, response: data });
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-[#141414] border-b border-[#2a2a2a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Alex PR Attributer</h1>
          <span className="text-xs text-[#a0a0a0] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#2a2a2a]">
            Nansen Internal
          </span>
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
