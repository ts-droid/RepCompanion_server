/**
 * V4 - Step B: Program Blueprint prompt (EN-only, IDs-only).
 *
 * Key constraints:
 * - The model MUST choose exercises only from the provided candidate pool buckets.
 * - The model MUST return exercise_id only (no localized names).
 * - Deterministic time fitting will be applied in code (server/utils/timeFitting.ts).
 */

export type LoadType = "percentage_1rm" | "rpe" | "bodyweight" | "fixed";
export type BlockType = "warmup" | "main" | "accessory" | "cardio" | "cooldown";

export interface V4TimeModel {
  work_seconds_per_10_reps: number;
  rest_between_sets_seconds: number;
  rest_between_exercises_seconds: number;
  warmup_minutes_default: number;
  cooldown_minutes_default: number;
}

export interface V4CandidatePools {
  // Bucketed lists to keep token usage low and selection constrained.
  // Keep each bucket small (e.g. 8-25 items).
  [bucket: string]: string[];
}

export interface V4BlueprintInput {
  schedule: {
    sessions_per_week: number;
    target_minutes: number;
    allowed_duration_minutes: { min: number; max: number };
    weekdays: string[];
  };
  focus_distribution: {
    strength: number;
    hypertrophy: number;
    endurance: number;
    cardio: number;
  };
  sport?: string | null;
  time_model: V4TimeModel;
  candidate_pools: V4CandidatePools;
  // Optional: pool hash/version for debugging.
  candidate_pool_hash?: string;
}

export function buildBlueprintSystemPromptV4(): string {
  return [
    "Role: You are an elite Strength & Conditioning coach.",
    "",
    "You must output STRICT JSON only (no markdown, no commentary).",
    "",
    "Hard rules:",
    "- You may ONLY use exercise_id values present in candidate_pools buckets.",
    "- Return exercise_id only (no exercise names).",
    "- Use English only for all text fields.",
    "- Provide priority per exercise: 1=protect, 2=adjustable, 3=remove first.",
    "- For EVERY exercise, provide complete metadata (category, required_equipment, primary_muscles, secondary_muscles, difficulty).",
    "- Keep sessions balanced across the week (~48h recovery for the same primary muscle groups where possible).",
    "- Respect the time_model. Try to land within allowed_duration_minutes, but the server will enforce final fitting.",
  ].join("\n");
}

export function buildBlueprintUserPromptV4(input: V4BlueprintInput): string {
  return JSON.stringify(
    {
      schedule: input.schedule,
      focus_distribution: input.focus_distribution,
      sport: input.sport ?? null,
      time_model: input.time_model,
      candidate_pool_hash: input.candidate_pool_hash ?? null,
      candidate_pools: input.candidate_pools,
      output_schema: {
        program_name: "string",
        duration_weeks: 2,
        sessions: [
          {
            session_index: 1,
            weekday: "Mon",
            name: "string",
            blocks: [
              {
                type: "warmup|main|accessory|cardio|cooldown",
                exercises: [
                  {
                    exercise_id: "string",
                    sets: 3,
                    reps: "8-12|30-45s|6 min",
                    rest_seconds: 90,
                    load_type: "percentage_1rm|rpe|bodyweight|fixed",
                    load_value: 8,
                    priority: 2,
                    notes: null,
                    category: "string",
                    required_equipment: ["string"],
                    primary_muscles: ["string"],
                    secondary_muscles: ["string"],
                    difficulty: "Nybörjare|Medel|Avancerad"
                  }
                ]
              }
            ]
          }
        ]
      },
      constraints: {
        ids_only: true,
        must_use_candidate_pool_only: true
      }
    },
    null,
    2
  );
}
