export type TeamTheme = {
  primary: string;
  secondary: string;
  primaryRgb: string;
  secondaryRgb: string;
  primaryText: string;
  secondaryText: string;
  /** Text on primary→secondary gradients (logos, buttons) */
  gradientText: string;
  matched: boolean;
  matchedName?: string;
};

const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#111827";

type TeamEntry = {
  name: string;
  primary: string;
  secondary: string;
  aliases: string[];
};

const DEFAULT_THEME = buildTheme("#3f3f46", "#52525b", false);

const TEAM_DATABASE: TeamEntry[] = [
  { name: "Arizona Cardinals", primary: "#97233F", secondary: "#000000", aliases: ["cardinals", "arizona cardinals"] },
  { name: "Atlanta Falcons", primary: "#A71930", secondary: "#000000", aliases: ["falcons", "atlanta falcons"] },
  { name: "Baltimore Ravens", primary: "#241773", secondary: "#9E7C0C", aliases: ["ravens", "baltimore ravens"] },
  { name: "Buffalo Bills", primary: "#00338D", secondary: "#C60C30", aliases: ["bills", "buffalo bills"] },
  { name: "Carolina Panthers", primary: "#0085CA", secondary: "#101820", aliases: ["panthers", "carolina panthers"] },
  { name: "Chicago Bears", primary: "#0B162A", secondary: "#C83803", aliases: ["bears", "chicago bears"] },
  { name: "Cincinnati Bengals", primary: "#FB4F14", secondary: "#000000", aliases: ["bengals", "cincinnati bengals"] },
  { name: "Cleveland Browns", primary: "#311D00", secondary: "#FF3C00", aliases: ["browns", "cleveland browns"] },
  { name: "Dallas Cowboys", primary: "#041E42", secondary: "#869397", aliases: ["cowboys", "dallas cowboys", "dallas"] },
  { name: "Denver Broncos", primary: "#FB4F14", secondary: "#002244", aliases: ["broncos", "denver broncos"] },
  { name: "Detroit Lions", primary: "#0076B6", secondary: "#B0B7BC", aliases: ["lions", "detroit lions"] },
  { name: "Green Bay Packers", primary: "#203731", secondary: "#FFB612", aliases: ["packers", "green bay packers", "green bay"] },
  { name: "Houston Texans", primary: "#03202F", secondary: "#A71930", aliases: ["texans", "houston texans"] },
  { name: "Indianapolis Colts", primary: "#002C5F", secondary: "#A2AAAD", aliases: ["colts", "indianapolis colts"] },
  { name: "Jacksonville Jaguars", primary: "#101820", secondary: "#D7A22A", aliases: ["jaguars", "jacksonville jaguars"] },
  { name: "Kansas City Chiefs", primary: "#E31837", secondary: "#FFB612", aliases: ["chiefs", "kansas city chiefs", "kc chiefs"] },
  { name: "Las Vegas Raiders", primary: "#000000", secondary: "#A5ACAF", aliases: ["raiders", "las vegas raiders", "oakland raiders"] },
  { name: "Los Angeles Chargers", primary: "#0080C6", secondary: "#FFC20E", aliases: ["chargers", "la chargers", "los angeles chargers"] },
  { name: "Los Angeles Rams", primary: "#003594", secondary: "#FFA300", aliases: ["rams", "la rams", "los angeles rams"] },
  { name: "Miami Dolphins", primary: "#008E97", secondary: "#FC4C02", aliases: ["dolphins", "miami dolphins"] },
  { name: "Minnesota Vikings", primary: "#4F2683", secondary: "#FFC62F", aliases: ["vikings", "minnesota vikings"] },
  { name: "New England Patriots", primary: "#002244", secondary: "#C60C30", aliases: ["patriots", "new england patriots", "pats"] },
  { name: "New Orleans Saints", primary: "#101820", secondary: "#D3BC8D", aliases: ["saints", "new orleans saints"] },
  { name: "New York Giants", primary: "#0B2265", secondary: "#A71930", aliases: ["giants", "ny giants", "new york giants"] },
  { name: "New York Jets", primary: "#125740", secondary: "#000000", aliases: ["jets", "ny jets", "new york jets"] },
  { name: "Philadelphia Eagles", primary: "#004C54", secondary: "#A5ACAF", aliases: ["eagles", "philadelphia eagles", "philly eagles"] },
  { name: "Pittsburgh Steelers", primary: "#101820", secondary: "#FFB612", aliases: ["steelers", "pittsburgh steelers"] },
  { name: "San Francisco 49ers", primary: "#AA0000", secondary: "#B3995D", aliases: ["49ers", "niners", "san francisco 49ers", "sf 49ers"] },
  { name: "Seattle Seahawks", primary: "#002244", secondary: "#69BE28", aliases: ["seahawks", "seattle seahawks"] },
  { name: "Tampa Bay Buccaneers", primary: "#D50A0A", secondary: "#FF7900", aliases: ["buccaneers", "bucs", "tampa bay buccaneers"] },
  { name: "Tennessee Titans", primary: "#0C2340", secondary: "#4B92DB", aliases: ["titans", "tennessee titans"] },
  { name: "Washington Commanders", primary: "#5A1414", secondary: "#FFB612", aliases: ["commanders", "washington commanders", "redskins", "washington football team"] },
  { name: "Los Angeles Lakers", primary: "#552583", secondary: "#FDB927", aliases: ["lakers", "la lakers", "los angeles lakers"] },
  { name: "Boston Celtics", primary: "#007A33", secondary: "#BA9653", aliases: ["celtics", "boston celtics"] },
  { name: "Golden State Warriors", primary: "#1D428A", secondary: "#FFC72C", aliases: ["warriors", "golden state warriors", "gsw"] },
  { name: "Chicago Bulls", primary: "#CE1141", secondary: "#000000", aliases: ["bulls", "chicago bulls"] },
  { name: "New York Knicks", primary: "#006BB6", secondary: "#F58426", aliases: ["knicks", "new york knicks", "ny knicks"] },
  { name: "Miami Heat", primary: "#98002E", secondary: "#F9A01B", aliases: ["heat", "miami heat"] },
  { name: "Dallas Mavericks", primary: "#00538C", secondary: "#002B5E", aliases: ["mavericks", "mavs", "dallas mavericks"] },
  { name: "New York Yankees", primary: "#003087", secondary: "#E4002B", aliases: ["yankees", "new york yankees", "ny yankees"] },
  { name: "Boston Red Sox", primary: "#BD3039", secondary: "#0C2340", aliases: ["red sox", "boston red sox"] },
  { name: "Los Angeles Dodgers", primary: "#005A9C", secondary: "#EF3E42", aliases: ["dodgers", "la dodgers", "los angeles dodgers"] },
  { name: "Chicago Cubs", primary: "#0E3386", secondary: "#CC3433", aliases: ["cubs", "chicago cubs"] },
  { name: "Detroit Red Wings", primary: "#CE1126", secondary: "#FFFFFF", aliases: ["red wings", "detroit red wings"] },
  { name: "Toronto Maple Leafs", primary: "#00205B", secondary: "#FFFFFF", aliases: ["maple leafs", "toronto maple leafs", "leafs"] },
  { name: "Montreal Canadiens", primary: "#AF1E2D", secondary: "#192168", aliases: ["canadiens", "habs", "montreal canadiens"] },
  { name: "Manchester United", primary: "#DA291C", secondary: "#FBE122", aliases: ["manchester united", "man united", "man utd"] },
  { name: "Liverpool", primary: "#C8102E", secondary: "#00B2A9", aliases: ["liverpool", "liverpool fc", "lfc"] },
  { name: "Real Madrid", primary: "#FEBE10", secondary: "#00529F", aliases: ["real madrid", "madrid"] },
  { name: "FC Barcelona", primary: "#A50044", secondary: "#004D98", aliases: ["barcelona", "barca", "fc barcelona"] },
  { name: "Arsenal", primary: "#EF0107", secondary: "#FFFFFF", aliases: ["arsenal", "arsenal fc"] },
  { name: "Chelsea", primary: "#034694", secondary: "#FFFFFF", aliases: ["chelsea", "chelsea fc"] },
];

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseHexChannels(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function hexToRgb(hex: string) {
  const { r, g, b } = parseHexChannels(hex);
  return `${r}, ${g}, ${b}`;
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = parseHexChannels(hex);
  const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  const red = toLinear(r);
  const green = toLinear(g);
  const blue = toLinear(b);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrastRatio(luminanceA: number, luminanceB: number) {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pick white or near-black text by WCAG contrast (handles light greys, silver, gold). */
export function getContrastTextColor(hex: string) {
  const background = getRelativeLuminance(hex);
  const whiteContrast = getContrastRatio(background, 1);
  const darkContrast = getContrastRatio(background, getRelativeLuminance(DARK_TEXT));

  return whiteContrast >= darkContrast ? LIGHT_TEXT : DARK_TEXT;
}

/** Gradient buttons/logos span both swatches — contrast against the lighter one. */
export function getOnGradientTextColor(primary: string, secondary: string) {
  const primaryLuminance = getRelativeLuminance(primary);
  const secondaryLuminance = getRelativeLuminance(secondary);
  const lighterSwatch =
    primaryLuminance >= secondaryLuminance ? primary : secondary;
  return getContrastTextColor(lighterSwatch);
}

function hslToHex(h: number, s: number, l: number) {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (huePrime >= 0 && huePrime < 1) [r, g, b] = [chroma, x, 0];
  else if (huePrime < 2) [r, g, b] = [x, chroma, 0];
  else if (huePrime < 3) [r, g, b] = [0, chroma, x];
  else if (huePrime < 4) [r, g, b] = [0, x, chroma];
  else if (huePrime < 5) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];

  const m = lightness - chroma / 2;
  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function buildTheme(primary: string, secondary: string, matched: boolean, matchedName?: string): TeamTheme {
  return {
    primary,
    secondary,
    primaryRgb: hexToRgb(primary),
    secondaryRgb: hexToRgb(secondary),
    primaryText: getContrastTextColor(primary),
    secondaryText: getContrastTextColor(secondary),
    gradientText: getOnGradientTextColor(primary, secondary),
    matched,
    matchedName,
  };
}

function findTeamColors(teamName: string) {
  const normalized = normalizeTeamName(teamName);
  if (!normalized) return null;

  let bestMatch: { entry: TeamEntry; alias: string } | null = null;

  for (const entry of TEAM_DATABASE) {
    for (const alias of entry.aliases) {
      const normalizedAlias = normalizeTeamName(alias);
      const isMatch =
        normalized === normalizedAlias ||
        normalized.includes(normalizedAlias) ||
        normalizedAlias.includes(normalized);

      if (!isMatch) continue;

      if (!bestMatch || normalizedAlias.length > bestMatch.alias.length) {
        bestMatch = { entry, alias: normalizedAlias };
      }
    }
  }

  if (!bestMatch) return null;

  return buildTheme(
    bestMatch.entry.primary,
    bestMatch.entry.secondary,
    true,
    bestMatch.entry.name,
  );
}

function generateThemeFromName(teamName: string): TeamTheme {
  const normalized = normalizeTeamName(teamName);
  if (!normalized) return DEFAULT_THEME;

  const hash = hashString(normalized);
  const primaryHue = hash % 360;
  const secondaryHue = (primaryHue + 35 + (hash % 90)) % 360;
  const primary = hslToHex(primaryHue, 72, 46);
  const secondary = hslToHex(secondaryHue, 68, 38);

  return buildTheme(primary, secondary, false);
}

export function getTeamTheme(teamName: string): TeamTheme {
  const trimmed = teamName.trim();
  if (!trimmed) return DEFAULT_THEME;

  return findTeamColors(trimmed) ?? generateThemeFromName(trimmed);
}

export function getTeamThemeStyle(theme: TeamTheme): Record<string, string> {
  return {
    "--team-primary": theme.primary,
    "--team-secondary": theme.secondary,
    "--team-primary-rgb": theme.primaryRgb,
    "--team-secondary-rgb": theme.secondaryRgb,
    "--team-primary-text": theme.primaryText,
    "--team-secondary-text": theme.secondaryText,
    "--team-gradient-text": theme.gradientText,
  };
}
