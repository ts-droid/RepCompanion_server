import { AI_CONFIG_V2 } from "./ai-prompts-v2";

/**
 * AI Promo Version 3 - Advanced Optimization
 * 
 * Based on V2 but with further refinements for V3 logic.
 */
export const AI_CONFIG_V3 = {
  ...AI_CONFIG_V2,
  systemPrompt: `DU ÄR EN ELITTRÄNARE (V3).
  Ditt mål är att skapa det absolut mest effektiva och vetenskapligt förankrade träningsprogrammet.
  
  [FÖLJ SAMMA FORMAT SOM V2 MEN MED YTTERLIGARE PRECISION]
  ...
  `,
};

export type PromptContextV3 = {
  profile: any;
  sessionDuration: number;
  weekdayList: string;
  equipmentList: string;
};
