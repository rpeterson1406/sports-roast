type StandingEntry = {
  teamName: string;
  overall: string;
  clincherNote?: string;
  playoffSeed?: string;
};

type StandingsCache = {
  fetchedAt: number;
  seasonLabel: string;
  entries: StandingEntry[];
};

type SuperBowlResult = {
  winner: string;
  loser: string;
  winnerScore: string;
  loserScore: string;
};

const CACHE_MS = 60 * 60 * 1000;
let nflCache: StandingsCache | null = null;
let nbaCache: StandingsCache | null = null;
let superBowlCache: { fetchedAt: number; result: SuperBowlResult | null } | null =
  null;

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teamsMatch(teamInput: string, teamName: string) {
  const normalized = normalizeTeamName(teamInput);
  const candidate = normalizeTeamName(teamName);
  if (!normalized || !candidate) return false;

  const tokens = normalized.split(" ").filter(Boolean);
  const lastWord = tokens[tokens.length - 1] ?? normalized;

  return (
    normalized === candidate ||
    candidate.includes(normalized) ||
    normalized.includes(candidate) ||
    candidate.includes(lastWord) ||
    (lastWord.length > 3 && candidate.endsWith(lastWord))
  );
}

function getStatDisplay(
  stats: { name: string; displayValue?: string }[] | undefined,
  statName: string,
) {
  return stats?.find((stat) => stat.name === statName)?.displayValue;
}

function parseEspnStandings(data: {
  season?: { displayName?: string };
  children?: {
    standings?: {
      seasonDisplayName?: string;
      entries?: {
        team?: { displayName?: string };
        stats?: { name: string; displayValue?: string; description?: string }[];
      }[];
    };
  }[];
}): StandingsCache {
  const entries: StandingEntry[] = [];

  for (const child of data.children ?? []) {
    for (const entry of child.standings?.entries ?? []) {
      const teamName = entry.team?.displayName;
      if (!teamName) continue;

      entries.push({
        teamName,
        overall: getStatDisplay(entry.stats, "overall") ?? "unknown",
        clincherNote: getStatDisplay(entry.stats, "clincher")
          ? entry.stats?.find((stat) => stat.name === "clincher")?.description
          : undefined,
        playoffSeed: getStatDisplay(entry.stats, "playoffSeed"),
      });
    }
  }

  const seasonLabel =
    data.children?.[0]?.standings?.seasonDisplayName ??
    data.season?.displayName ??
    "most recent";

  return {
    fetchedAt: Date.now(),
    seasonLabel,
    entries,
  };
}

async function fetchStandings(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Standings request failed: ${response.status}`);
  }

  return response.json();
}

async function getNflStandings() {
  if (nflCache && Date.now() - nflCache.fetchedAt < CACHE_MS) {
    return nflCache;
  }

  const data = await fetchStandings(
    "https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=2025",
  );
  nflCache = parseEspnStandings(data);
  return nflCache;
}

async function getNbaStandings() {
  if (nbaCache && Date.now() - nbaCache.fetchedAt < CACHE_MS) {
    return nbaCache;
  }

  const data = await fetchStandings(
    "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2025",
  );
  nbaCache = parseEspnStandings(data);
  return nbaCache;
}

async function getSuperBowlResult(): Promise<SuperBowlResult | null> {
  if (superBowlCache && Date.now() - superBowlCache.fetchedAt < CACHE_MS) {
    return superBowlCache.result;
  }

  const dates = ["20260208", "20260209", "20260207", "20260201"];

  for (const date of dates) {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date}`,
        { signal: AbortSignal.timeout(8000) },
      );

      if (!response.ok) continue;

      const data = (await response.json()) as {
        events?: {
          season?: { type?: number };
          competitions?: {
            competitors?: {
              winner?: boolean;
              score?: string;
              team?: { displayName?: string };
            }[];
          }[];
        }[];
      };

      for (const event of data.events ?? []) {
        if (event.season?.type !== 3) continue;

        const competitors = event.competitions?.[0]?.competitors ?? [];
        const winner = competitors.find((team) => team.winner);
        const loser = competitors.find((team) => !team.winner);

        if (winner?.team?.displayName && loser?.team?.displayName) {
          const result: SuperBowlResult = {
            winner: winner.team.displayName,
            loser: loser.team.displayName,
            winnerScore: winner.score ?? "",
            loserScore: loser.score ?? "",
          };
          superBowlCache = { fetchedAt: Date.now(), result };
          return result;
        }
      }
    } catch {
      continue;
    }
  }

  superBowlCache = { fetchedAt: Date.now(), result: null };
  return null;
}

function findStandingMatch(teamInput: string, cache: StandingsCache) {
  const normalized = normalizeTeamName(teamInput);
  if (!normalized) return null;

  let best: { entry: StandingEntry; score: number } | null = null;

  for (const entry of cache.entries) {
    const candidate = normalizeTeamName(entry.teamName);
    const tokens = normalized.split(" ").filter(Boolean);
    const lastWord = tokens[tokens.length - 1] ?? normalized;

    let score = 0;
    if (normalized === candidate) score = 100;
    else if (candidate.includes(normalized) || normalized.includes(candidate)) score = 80;
    else if (candidate.includes(lastWord) || (lastWord.length > 3 && candidate.endsWith(lastWord))) {
      score = 60;
    }

    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  return best && best.score >= 60 ? best.entry : null;
}

function formatContext(
  league: string,
  cache: StandingsCache,
  entry: StandingEntry,
  teamInput: string,
  superBowl: SuperBowlResult | null,
) {
  const lines = [
    `VERIFIED TEAM CONTEXT (${cache.seasonLabel} ${league} season — use ONLY this block for records, standings, and playoff results):`,
    `- Team: ${entry.teamName}`,
    `- Regular season record: ${entry.overall}`,
  ];

  if (entry.playoffSeed) {
    lines.push(`- Playoff seed: ${entry.playoffSeed}`);
  }

  if (entry.clincherNote) {
    lines.push(`- Regular season note: ${entry.clincherNote}`);
  }

  if (superBowl && teamsMatch(teamInput, superBowl.winner)) {
    lines.push(
      `- Postseason: WON Super Bowl (defeated ${superBowl.loser} ${superBowl.winnerScore}-${superBowl.loserScore}).`,
      "- Roast angle: acknowledge the title briefly (one short clause max), then pivot to fan arrogance, future regression, rival resentment, or offseason pressure.",
      "- FORBIDDEN: claiming a losing record, early playoff exit, or mediocre season (e.g. NEVER say 9-8 or 'playoff exit').",
    );
  } else if (superBowl && teamsMatch(teamInput, superBowl.loser)) {
    lines.push(
      `- Postseason: Lost Super Bowl to ${superBowl.winner} (${superBowl.loserScore}-${superBowl.winnerScore}).`,
    );
  }

  lines.push(
    "- Do NOT cite win-loss records, standings, or playoff results from memory/training data.",
    "- If this block contradicts your instincts, trust this block.",
    "- If this block lacks a detail, do not guess — use fan/rivalry humor instead.",
  );

  return lines.join("\n");
}

export async function getVerifiedTeamContext(teamInput: string) {
  const trimmed = teamInput.trim();
  if (!trimmed) {
    return "VERIFIED TEAM CONTEXT: No team provided. Do not cite specific records or standings.";
  }

  try {
    const superBowl = await getSuperBowlResult();
    const nfl = await getNflStandings();
    const nflMatch = findStandingMatch(trimmed, nfl);
    if (nflMatch) {
      return formatContext("NFL", nfl, nflMatch, trimmed, superBowl);
    }

    const nba = await getNbaStandings();
    const nbaMatch = findStandingMatch(trimmed, nba);
    if (nbaMatch) {
      return formatContext("NBA", nba, nbaMatch, trimmed, null);
    }
  } catch (error) {
    console.error("Failed to load live standings:", error);
  }

  return `VERIFIED TEAM CONTEXT: Live standings could not be loaded for "${trimmed}".
- Do NOT cite specific win-loss records, standings, playoff finishes, trades, or headlines.
- Use fan behavior, rivalry energy, and broad humor without invented stats.`;
}
