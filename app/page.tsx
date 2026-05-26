"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, RoastLevel } from "@/lib/types";
import {
  getTeamTheme,
  getTeamThemeStyle,
  type TeamTheme,
} from "@/lib/teamColors";

const ROAST_LEVELS: { value: RoastLevel; label: string; description: string }[] =
  [
    { value: "light", label: "Light", description: "Playful ribbing" },
    { value: "medium", label: "Medium", description: "Classic trash talk" },
    { value: "dark", label: "Dark", description: "Harsh rivalry · taunting burns" },
    { value: "savage", label: "Savage", description: "NSFW · profanity · roasts you too" },
  ];

const INITIAL_PROMPT =
  "Start the conversation with your best opening roast of my favorite team. Use the most recently completed season (record, playoff finish, key storylines) — nothing dated from years ago. Make it funny and set the tone for this rivalry.";

function getTeamInitials(team: string) {
  const words = team.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getRoastBadgeClass(level: RoastLevel) {
  if (level === "light") return "bg-emerald-700/80 text-emerald-100 ring-emerald-500/30";
  if (level === "medium") return "bg-orange-600 text-white ring-orange-400/40";
  if (level === "dark") return "bg-red-600 text-white ring-red-400/40";
  return "bg-zinc-900 text-red-300 ring-red-500/50";
}

export default function Home() {
  const [team, setTeam] = useState("");
  const [activeTeam, setActiveTeam] = useState("");
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("medium");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const visibleMessages = messages.filter(
    (message) =>
      !(message.role === "user" && message.content === INITIAL_PROMPT),
  );

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages.length, loading]);

  const sendToApi = useCallback(
    async (history: ChatMessage[]) => {
      const teamForApi = activeTeam || team.trim();
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team: teamForApi,
            roastLevel,
            messages: history,
          }),
          signal: controller.signal,
        });

        const data = (await response.json()) as {
          message?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to get a roast.");
        }

        if (!data.message) {
          throw new Error("Empty response from the roast bot.");
        }

        return data.message;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("Request timed out. Check your connection and try again.");
        }
        throw err;
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [activeTeam, team, roastLevel],
  );

  const handleStart = async () => {
    const trimmedTeam = team.trim();
    if (!trimmedTeam) {
      setError("Enter your favorite team to get roasted.");
      return;
    }

    setError(null);
    setLoading(true);
    setStarted(true);
    setActiveTeam(trimmedTeam);

    const openingHistory: ChatMessage[] = [
      { role: "user", content: INITIAL_PROMPT },
    ];

    try {
      const reply = await sendToApi(openingHistory);
      setMessages([
        ...openingHistory,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setStarted(false);
      setActiveTeam("");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const reply = await sendToApi(nextHistory);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(messages);
      setInput(trimmed);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setTeam("");
    setActiveTeam("");
    setRoastLevel("medium");
    setMessages([]);
    setInput("");
    setError(null);
    setStarted(false);
    setLoading(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const themeTeam = activeTeam;
  const previewTheme = useMemo(() => getTeamTheme(team), [team]);
  const teamTheme = useMemo(() => getTeamTheme(themeTeam), [themeTeam]);
  const teamThemeStyle = useMemo(
    () => getTeamThemeStyle(teamTheme),
    [teamTheme],
  );
  const teamInitials = getTeamInitials(started ? activeTeam : team);

  return (
    <div
      className="team-themed flex min-h-dvh flex-col"
      style={teamThemeStyle}
    >
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 px-4 py-4 shadow-lg shadow-black/30 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="team-header-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ring-1 ring-white/20">
            🔥
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black tracking-tight text-white sm:text-2xl">
              Sports Roast
            </h1>
            <p className="truncate text-sm text-zinc-400">
              Dark mode trash talk arena
            </p>
          </div>
        </div>
      </header>

      {!started ? (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-6 sm:px-6">
          <div className="team-panel-accent rounded-3xl border bg-zinc-900/70 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <TeamLogoPlaceholder initials={teamInitials} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Pick your team. Brace for impact.
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Enter any team and choose how savage you want the roasts.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-zinc-300">
                  Favorite team
                </span>
                <input
                  type="text"
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleStart();
                  }}
                  placeholder="e.g. Dallas Cowboys, Lakers, Manchester United"
                  className="team-input rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-white placeholder:text-zinc-500 transition"
                  disabled={loading}
                />
              </label>

              {team.trim() && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2">
                  <div className="flex gap-1.5">
                    <span
                      className="team-color-chip h-6 w-6 rounded-full"
                      style={{ backgroundColor: previewTheme.primary }}
                      title="Primary team color"
                    />
                    <span
                      className="team-color-chip h-6 w-6 rounded-full"
                      style={{ backgroundColor: previewTheme.secondary }}
                      title="Secondary team color"
                    />
                  </div>
                  <p className="text-xs text-zinc-400">
                    {previewTheme.matched
                      ? `Colors matched: ${previewTheme.matchedName}`
                      : "Custom colors generated for your team"}
                  </p>
                </div>
              )}

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-zinc-300">
                  Roast level
                </span>
                <select
                  value={roastLevel}
                  onChange={(event) =>
                    setRoastLevel(event.target.value as RoastLevel)
                  }
                  className="team-select rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-white transition"
                  disabled={loading}
                >
                  {ROAST_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label} — {level.description}
                    </option>
                  ))}
                </select>
              </label>

              {roastLevel === "savage" && (
                <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-200/90">
                  Savage mode is unfiltered: profanity, personal fan roasts, and recent
                  headline burns. Not safe for work.
                </p>
              )}

              {error && <ErrorBanner message={error} />}

              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={loading || !team.trim()}
                className="team-gradient-btn mt-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoadingDots />
                    Warming up the burns...
                  </>
                ) : (
                  "Start the roast"
                )}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-zinc-900/60 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <TeamLogoPlaceholder initials={teamInitials} size="sm" pulse />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Your team
                </p>
                <p className="truncate font-bold text-white">{activeTeam}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${getRoastBadgeClass(roastLevel)}`}
              >
                {roastLevel}
              </span>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="team-hover-reset rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-zinc-300 transition disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div
            ref={chatScrollRef}
            className="chat-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {visibleMessages.length === 0 && !loading && (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-zinc-500">Waiting for the first roast...</p>
              </div>
            )}

            {visibleMessages.map((message, index) => (
              <ChatBubble
                key={`${message.role}-${index}`}
                message={message}
                teamInitials={teamInitials}
                teamTheme={teamTheme}
              />
            ))}

            {loading && <TypingIndicator teamTheme={teamTheme} />}
          </div>

          <div className="sticky bottom-0 z-10 border-t border-white/10 bg-zinc-950/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-6 sm:py-4">
            {error && (
              <div className="mb-3">
                <ErrorBanner message={error} />
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Talk trash back..."
                rows={2}
                disabled={loading}
                aria-label="Message input"
                className="team-textarea min-h-[52px] flex-1 resize-none rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-base text-white placeholder:text-zinc-500 transition disabled:opacity-60 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading || !input.trim()}
                className="team-gradient-btn flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-6 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Send
              </button>
            </div>
            <p className="mt-2 hidden text-center text-xs text-zinc-500 sm:block">
              Press Enter to send · Shift+Enter for a new line
            </p>
            <p className="mt-2 text-center text-xs text-zinc-500 sm:hidden">
              Enter to send
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamLogoPlaceholder({
  initials,
  size = "sm",
  pulse = false,
}: {
  initials: string;
  size?: "sm" | "lg";
  pulse?: boolean;
}) {
  const sizeClass =
    size === "lg"
      ? "h-20 w-20 text-2xl rounded-3xl"
      : "h-11 w-11 text-sm rounded-2xl";

  return (
    <div
      className={`team-logo flex shrink-0 items-center justify-center font-black ring-2 ring-white/10 ${sizeClass} ${pulse ? "logo-pulse" : ""}`}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}

function ChatBubble({
  message,
  teamInitials,
  teamTheme,
}: {
  message: ChatMessage;
  teamInitials: string;
  teamTheme: TeamTheme;
}) {
  const isUser = message.role === "user";
  const bubbleBackground = isUser ? teamTheme.primary : teamTheme.secondary;
  const bubbleText = isUser ? teamTheme.primaryText : teamTheme.secondaryText;

  return (
    <div
      className={`message-in flex items-end gap-2 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-white/15 sm:h-9 sm:w-9"
        style={{
          backgroundColor: bubbleBackground,
          color: bubbleText,
        }}
        aria-hidden="true"
      >
        {isUser ? teamInitials : "🤖"}
      </div>

      <div
        className={`relative max-w-[82%] sm:max-w-[72%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span
          className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: bubbleBackground,
            textAlign: isUser ? "right" : "left",
          }}
        >
          {isUser ? "You" : "Roast Bot"}
        </span>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md sm:text-[15px] ${
            isUser ? "rounded-br-md" : "rounded-bl-md"
          }`}
          style={{
            backgroundColor: bubbleBackground,
            color: bubbleText,
            boxShadow: `0 4px 14px rgba(${isUser ? teamTheme.primaryRgb : teamTheme.secondaryRgb}, 0.35)`,
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({
  teamTheme,
}: {
  teamTheme: TeamTheme;
}) {
  return (
    <div className="message-in flex items-end gap-2 sm:gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ring-1 ring-white/15 sm:h-9 sm:w-9"
        style={{
          backgroundColor: teamTheme.secondary,
          color: teamTheme.secondaryText,
        }}
        aria-hidden="true"
      >
        🤖
      </div>
      <div>
        <span
          className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: teamTheme.secondary }}
        >
          Roast Bot
        </span>
        <div
          className="flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3 shadow-md"
          style={{
            backgroundColor: teamTheme.secondary,
            color: teamTheme.secondaryText,
            boxShadow: `0 4px 14px rgba(${teamTheme.secondaryRgb}, 0.35)`,
          }}
          role="status"
          aria-label="Roast bot is typing"
        >
          <LoadingDots dotColor={teamTheme.secondaryText} />
          <span className="text-sm opacity-85">Cooking up a comeback...</span>
        </div>
      </div>
    </div>
  );
}

function LoadingDots({ dotColor = "#ffffff" }: { dotColor?: string }) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      <span
        className="typing-dot h-2 w-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span
        className="typing-dot h-2 w-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span
        className="typing-dot h-2 w-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
    </span>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200"
    >
      {message}
    </div>
  );
}
