export type RoastLevel = "light" | "medium" | "dark" | "savage";

export const ROAST_LEVELS: RoastLevel[] = [
  "light",
  "medium",
  "dark",
  "savage",
];

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
