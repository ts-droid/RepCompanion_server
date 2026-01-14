import type { UserProfile, UserEquipment } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { AI_CONFIG_V2, type PromptContextV2 } from "./ai-prompts-v2";
import { AI_CONFIG_V3, type PromptContextV3 } from "./ai-prompts-v3";
import * as V4Prompts from "./prompts/v4";
import { estimateSessionSeconds, fitProgramSessions } from "./utils/timeFitting";
import { storage } from "./storage";

// OpenAI client using Replit AI Integrations (no API key needed, billed to credits)
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// DeepSeek client (cheapest option)
const deepseek = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
  apiKey: process.env.AI_INTEGRATIONS_DEEPSEEK_API_KEY
});

// Gemini client (mid-tier pricing)
const gemini = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai",
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY
});

// Provider priority: DeepSeek (cheapest) → Gemini → OpenAI (most expensive)
// Set AI_PROVIDER_PRIORITY to override (e.g., "openai,gemini,deepseek")
const DEFAULT_PROVIDER_PRIORITY = ["gemini", "deepseek", "openai"];
const PROVIDER_PRIORITY = (process.env.AI_PROVIDER_PRIORITY || DEFAULT_PROVIDER_PRIORITY.join(","))
  .split(",")
  .map(p => p.trim().toLowerCase());

console.log(`[AI PROVIDER] Priority order: ${PROVIDER_PRIORITY.join(" → ")}`);

// Helper to get the first available AI client based on priority
function getAIClient(): { client: OpenAI; provider: string; model: string } {
  for (const provider of PROVIDER_PRIORITY) {
    if (provider === "deepseek" && process.env.AI_INTEGRATIONS_DEEPSEEK_API_KEY) {
      return { client: deepseek, provider: "DeepSeek", model: "deepseek-chat" };
    }
    if (provider === "gemini" && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      return { client: gemini, provider: "Gemini", model: "gemini-2.0-flash-exp" };
    }
    if (provider === "openai" && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      return { client: openai, provider: "OpenAI", model: "gpt-4o" };
    }
  }
  
  // Fallback to OpenAI if nothing else is available
  console.warn("[AI PROVIDER] No preferred provider available, falling back to OpenAI");
  return { client: openai, provider: "OpenAI (fallback)", model: "gpt-4o" };
}

// Version control: AI_PROMPT_VERSION env variable controls which prompt system to use
// Default: 'v4' (IDs-only blueprint with deterministic time fitting)
const AI_PROMPT_VERSION = process.env.AI_PROMPT_VERSION || 'v4';
console.log(`[AI VERSION] Using prompt version: ${AI_PROMPT_VERSION}`);

// ... (rest of file)

// Helper to get configuration for a specific provider name
function getClientConfig(provider: string): { client: OpenAI; provider: string; model: string } | null {
  const p = provider.toLowerCase().trim();
  if (p === "deepseek" && process.env.AI_INTEGRATIONS_DEEPSEEK_API_KEY) {
    return { client: deepseek, provider: "DeepSeek", model: "deepseek-chat" };
  }
  if (p === "gemini" && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    // Default to stable 1.5 Flash. Use AI_GEMINI_MODEL to override (e.g. "gemini-1.5-pro" or "gemini-2.0-flash-exp")
    const model = process.env.AI_GEMINI_MODEL || "gemini-1.5-flash";
    return { client: gemini, provider: "Gemini", model: model };
  }
  if (p === "openai" && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return { client: openai, provider: "OpenAI", model: "gpt-4o" };
  }
  return null;
}

// Execute an AI request with fallback to other providers
async function executeWithFallback(
  messages: any[],
  responseFormat: any,
  logPrefix: string
): Promise<{ content: string; provider: string }> {
  let lastError: any;
  const attemptedProviders: string[] = [];

  for (const providerName of PROVIDER_PRIORITY) {
    const config = getClientConfig(providerName);
    
    // Skip unconfigured providers
    if (!config) continue;
    
    try {
      console.log(`[${logPrefix}] 🔄 Attempting generation with ${config.provider} (${config.model})...`);
      
      // Strict timeout to allow fallback rotation within client's 5-minute window
      // Gemini Flash is usually < 10s. DeepSeek can be 30-60s.
      // Set to 45s to be aggressive on stalls.
      const timeoutMs = 45000; 
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out (stalled)")), timeoutMs);
      });

      const apiPromise = config.client.chat.completions.create({
        model: config.model,
        messages,
        response_format: responseFormat,
      });
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      const content = response.choices[0].message.content || "{}";
      
      console.log(`[${logPrefix}] ✅ Success with ${config.provider}`);
      return { content, provider: config.provider };
      
    } catch (error: any) {
      console.warn(`[${logPrefix}] ⚠️ ${config.provider} failed: ${error.message}`);
      if (error.response) {
        console.warn(`[${logPrefix}] Details:`, error.response.data);
      }
      lastError = error;
      attemptedProviders.push(config.provider);
      // Continue to next provider...
    }
  }

  console.error(`[${logPrefix}] ❌ All providers failed. Tried: ${attemptedProviders.join(", ")}`);
  throw lastError || new Error("No AI providers available or configured");
}

// Provider priority: DeepSeek (cheapest) → Gemini → OpenAI (most expensive)
// Set AI_PROVIDER_PRIORITY to override (e.g., "openai,gemini,deepseek")
const DEFAULT_PROVIDER_PRIORITY = ["gemini", "deepseek", "openai"];
const PROVIDER_PRIORITY = (process.env.AI_PROVIDER_PRIORITY || DEFAULT_PROVIDER_PRIORITY.join(","))
  .split(",")
  .map(p => p.trim().toLowerCase());

console.log(`[AI PROVIDER] Priority order: ${PROVIDER_PRIORITY.join(" → ")}`);

// Helper to get the first available AI client based on priority
function getAIClient(): { client: OpenAI; provider: string; model: string } {
  for (const provider of PROVIDER_PRIORITY) {
    if (provider === "deepseek" && process.env.AI_INTEGRATIONS_DEEPSEEK_API_KEY) {
      return { client: deepseek, provider: "DeepSeek", model: "deepseek-chat" };
    }
    if (provider === "gemini" && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      return { client: gemini, provider: "Gemini", model: "gemini-2.0-flash-exp" };
    }
    if (provider === "openai" && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      return { client: openai, provider: "OpenAI", model: "gpt-4o" };
    }
  }
  
  // Fallback to OpenAI if nothing else is available
  console.warn("[AI PROVIDER] No preferred provider available, falling back to OpenAI");
  return { client: openai, provider: "OpenAI (fallback)", model: "gpt-4o" };
}

// Version control: AI_PROMPT_VERSION env variable controls which prompt system to use
// Default: 'v4' (IDs-only blueprint with deterministic time fitting)
const AI_PROMPT_VERSION = process.env.AI_PROMPT_VERSION || 'v4';
console.log(`[AI VERSION] Using prompt version: ${AI_PROMPT_VERSION}`);

const exerciseSchema = z.object({
  exerciseKey: z.string(),
  exerciseTitle: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string(),
  restSeconds: z.number().int().min(0).max(600),
  notes: z.string().optional(),
  equipment: z.array(z.string()).min(0),
  muscleGroups: z.array(z.string()).optional(),
});

const sessionSchema = z.object({
  sessionName: z.string(),
  muscleFocus: z.string().optional(), // Muscle group focus (e.g., "Överkropp - Push", "Ben & Rumpa")
  sessionType: z.string(),
  weekday: z.string(),
  exercises: z.array(exerciseSchema).min(1).max(15),
});

const phaseSchema = z.object({
  phaseName: z.string(),
  weekRange: z.string(),
  sessions: z.array(sessionSchema).min(1).max(10),
});

const workoutProgramSchema = z.object({
  programName: z.string(),
  duration: z.string(),
  phases: z.array(phaseSchema).min(1).max(10),
});

export type WorkoutProgram = z.infer<typeof workoutProgramSchema>;

// Schema for DeepSeek Reasoner workout generation (user's template)
const weeklySessionSchema = z.object({
  session_number: z.number(),
  weekday: z.string().optional(), // Optional weekday from optimized prompt
  session_name: z.string(),
  muscle_focus: z.string().optional(), // Muscle group focus (e.g., "Överkropp - Push", "Ben & Rumpa")
  session_type: z.string(),
  estimated_duration_minutes: z.number(),
  warmup: z.array(z.object({
    exercise_name: z.string(),
    sets: z.number(),
    reps_or_duration: z.string(),
    notes: z.string(),
  })),
  main_work: z.array(z.object({
    exercise_name: z.string(),
    sets: z.number(),
    reps: z.string(),
    rest_seconds: z.number(),
    tempo: z.string(),
    suggested_weight_kg: z.number().nullable(),
    suggested_weight_notes: z.string().nullable(),
    target_muscles: z.array(z.string()),
    required_equipment: z.array(z.string()),
    technique_cues: z.array(z.string()),
  })),
  cooldown: z.array(z.object({
    exercise_name: z.string(),
    duration_or_reps: z.string(),
    notes: z.string(),
  })),
});

const deepSeekWorkoutProgramSchema = z.object({
  user_profile: z.object({
    gender: z.string(),
    age: z.number(),
    weight_kg: z.number(),
    height_cm: z.number(),
    training_level: z.string(),
    main_goal: z.string(),
    distribution: z.object({
      strength_percent: z.number(),
      hypertrophy_percent: z.number(),
      endurance_percent: z.number(),
      cardio_percent: z.number(),
    }),
    sessions_per_week: z.number(),
    session_length_minutes: z.number(),
    available_equipment: z.array(z.string()),
  }),
  program_overview: z.object({
    week_focus_summary: z.string(),
    expected_difficulty: z.string(),
    notes_on_progression: z.string(),
  }),
  weekly_sessions: z.array(weeklySessionSchema),
});

export type DeepSeekWorkoutProgram = z.infer<typeof deepSeekWorkoutProgramSchema>;

// Export schema for regression testing
export { deepSeekWorkoutProgramSchema };

// Schema for V2 Ultrafast/Compact workout generation (simplified structure)
const exerciseSchemaV2 = z.object({
  name: z.string(),
  equipment: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string(),
  restSeconds: z.number().int().min(0).max(600),
  intensity: z.string().optional(), // Only in compact mode
  estimatedExerciseDurationMinutes: z.number().optional(), // Only in compact mode
});

const sessionSchemaV2 = z.object({
  name: z.string(),
  muscleFocus: z.string().optional(), // Muscle group focus (e.g., "Överkropp - Push", "Ben & Rumpa")
  day: z.string(),
  focus: z.string(),
  targetDurationMinutes: z.number(),
  estimatedDurationMinutes: z.number(),
  exercises: z.array(exerciseSchemaV2).min(1).max(15),
});

const workoutProgramSchemaV2 = z.object({
  meta: z.object({
    sessionsPerWeek: z.number(),
    targetSessionDurationMinutes: z.number(),
    allowedDurationRangeMinutes: z.object({
      min: z.number(),
      max: z.number(),
    }),
    totalPlannedWeeklyMinutes: z.number(),
    notes: z.string().optional(), // Only in compact mode
  }),
  sessions: z.array(sessionSchemaV2).min(1).max(10),
});

export type WorkoutProgramV2 = z.infer<typeof workoutProgramSchemaV2>;

// Schema for V4 Analysis Step A
const v4AnalysisSchema = z.object({
  analysis_summary: z.string(),
  focus_distribution: z.object({
    strength: z.number(),
    hypertrophy: z.number(),
    endurance: z.number(),
    cardio: z.number(),
  }),
  recommendations: z.object({
    sets_per_session_min: z.number(),
    sets_per_session_max: z.number(),
    weekly_volume_sets_min: z.number(),
    weekly_volume_sets_max: z.number(),
  }),
});

export type V4Analysis = z.infer<typeof v4AnalysisSchema>;

// Schema for V4 Blueprint Step B (IDs-only)
const v4BlueprintSchema = z.object({
  program_name: z.string(),
  duration_weeks: z.number(),
  sessions: z.array(z.object({
    session_index: z.number(),
    weekday: z.string(),
    name: z.string(),
    blocks: z.array(z.object({
      type: z.enum(["warmup", "main", "accessory", "cardio", "cooldown"]),
      exercises: z.array(z.object({
        exercise_id: z.string(),
        sets: z.number(),
        reps: z.string(),
        rest_seconds: z.number().nullable(),
        load_type: z.string(),
        load_value: z.number(),
        priority: z.number().min(1).max(3),
        notes: z.string().nullable(),
      }))
    }))
  }))
});

export type V4Blueprint = z.infer<typeof v4BlueprintSchema>;

/**
 * Validate that AI-generated session durations match user's target (V2)
 * Throws error if any session is outside ±10% tolerance
 */
function validateSessionDurationsV2(
  program: WorkoutProgramV2,
  targetDuration: number
): void {
  const tolerancePercent = 0.10; // ±10% allowed variance
  const minDuration = Math.floor(targetDuration * (1 - tolerancePercent));
  const maxDuration = Math.ceil(targetDuration * (1 + tolerancePercent));
  
  const invalidSessions: string[] = [];
  
  program.sessions.forEach((session, idx) => {
    const duration = session.estimatedDurationMinutes;
    if (duration < minDuration || duration > maxDuration) {
      invalidSessions.push(
        `Pass ${idx + 1} (${session.name}): ${duration} min ` +
        `ligger utanför acceptabelt intervall ${minDuration}-${maxDuration} min`
      );
    }
  });
  
  if (invalidSessions.length > 0) {
    console.warn("[V2 Duration Validation] Failed sessions:", invalidSessions);
    throw new Error(
      `Programmet kunde inte genereras med rätt passlängd. ` +
      `Målet är ${targetDuration} min ±10% (${minDuration}-${maxDuration} min). Försök igen.`
    );
  }
}

/**
 * Validate that AI-generated session durations match user's target
 * Throws error if any session is outside ±10% tolerance
 */
function validateSessionDurations(
  program: DeepSeekWorkoutProgram,
  targetDuration: number
): void {
  const tolerancePercent = 0.10; // ±10% allowed variance
  const minDuration = Math.floor(targetDuration * (1 - tolerancePercent));
  const maxDuration = Math.ceil(targetDuration * (1 + tolerancePercent));
  
  const invalidSessions: string[] = [];
  
  program.weekly_sessions.forEach((session, idx) => {
    const duration = session.estimated_duration_minutes;
    if (duration < minDuration || duration > maxDuration) {
      invalidSessions.push(
        `Pass ${idx + 1} (${session.session_name}): ${duration} min ` +
        `ligger utanför acceptabelt intervall ${minDuration}-${maxDuration} min`
      );
    }
  });
  
  if (invalidSessions.length > 0) {
    console.warn("[Duration Validation] Failed sessions:", invalidSessions);
    throw new Error(
      `Programmet kunde inte genereras med rätt passlängd. ` +
      `Målet är ${targetDuration} min ±10% (${minDuration}-${maxDuration} min). Försök igen.`
    );
  }
}

/**
 * Generate workout program using OpenAI (via Replit AI Integrations)
 * Primary provider with best adherence to numeric constraints
 */
async function generateWorkoutProgramWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  targetDuration: number
): Promise<DeepSeekWorkoutProgram> {
  try {
    console.log("Calling OpenAI API (GPT-5)...");
    
    // Create hard timeout promise that rejects after 120 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, 120000);
    });
    
    // Race between API call and timeout
    const apiCallPromise = openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 16000, // Increased from 8192 to support longer programs
    });
    
    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    // Check if response was cut off due to token limit
    const finishReason = response.choices?.[0]?.finish_reason;
    if (finishReason === 'length') {
      console.error("[OpenAI] Response truncated - hit max_tokens limit");
      throw new Error("Programmet blev för långt. Försök igen med färre pass eller kortare passlängd.");
    }

    const content = response.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      console.error("[OpenAI] Invalid response:", response);
      throw new Error("AI-tjänsten returnerade ogiltigt svar. Försök igen.");
    }

    // Parse and validate
    let rawProgram;
    try {
      rawProgram = JSON.parse(content);
    } catch (parseError) {
      console.error("OpenAI JSON parse failed:", parseError);
      console.error("Raw content (first 1000 chars):", content.substring(0, 1000));
      throw new Error("AI-tjänsten returnerade ogiltigt format. Försök igen.");
    }
    
    const validatedProgram = deepSeekWorkoutProgramSchema.parse(rawProgram);
    console.log("[OpenAI] Successfully validated program schema");
    
    // Validate session durations (±10% tolerance) - throws on failure
    validateSessionDurations(validatedProgram, targetDuration);
    
    console.log("[OpenAI] Program passed all validation ✓");
    return validatedProgram;
  } catch (error: any) {
    console.error("[OpenAI] Error:", error.message);
    
    if (error.message === 'TIMEOUT') {
      throw new Error("AI-tjänsten svarade inte i tid. Försök igen.");
    }
    
    throw error;
  }
}

/**
 * Generate workout program using DeepSeek Reasoner model
 * Fallback provider when OpenAI fails or times out
 */
async function generateWorkoutProgramWithDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  targetDuration: number
): Promise<DeepSeekWorkoutProgram> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error("[DeepSeek] API key not configured");
    throw new Error("AI-tjänsten är inte konfigurerad. Kontakta support.");
  }

  try {
    console.log("Calling DeepSeek Reasoner API...");
    
    // Create AbortController to cancel request on timeout
    const abortController = new AbortController();
    
    // Create hard timeout promise that rejects after 120 seconds
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        abortController.abort(); // Cancel the fetch request
        console.error("[DeepSeek] Request aborted after 120s timeout");
        reject(new Error("TIMEOUT"));
      }, 120000);
    });
    
    // Race between API call and timeout
    const apiCallPromise = fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
      signal: abortController.signal, // Attach abort signal
    });
    
    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    
    // Clear timeout if request completed successfully
    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DeepSeek] API error:", errorText);
      throw new Error(`AI-tjänsten svarade med fel (${response.status}). Försök igen.`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      console.error("[DeepSeek] Invalid response:", data);
      throw new Error("AI-tjänsten returnerade ogiltigt svar. Försök igen.");
    }

    // Clean up the response - remove markdown and extra whitespace
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    
    let rawProgram;
    try {
      rawProgram = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Initial JSON parse failed:", parseError);
      console.error("Raw content (first 1000 chars):", cleanedContent.substring(0, 1000));
      
      // Attempt to fix common JSON issues
      const fixedContent = cleanedContent
        .replace(/([,\s])"(\w+)":/g, '$1"$2":')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .trim();
      
      try {
        rawProgram = JSON.parse(fixedContent);
        console.log("[DeepSeek] JSON repair successful");
      } catch (retryError) {
        console.error("[DeepSeek] JSON repair failed");
        throw new Error("AI-tjänsten returnerade ogiltigt format. Försök igen.");
      }
    }
    
    // Validate against schema
    const validatedProgram = deepSeekWorkoutProgramSchema.parse(rawProgram);
    console.log("[DeepSeek] Successfully validated program schema");
    
    // Validate session durations (±10% tolerance) - throws on failure
    validateSessionDurations(validatedProgram, targetDuration);
    
    console.log("[DeepSeek] Program passed all validation ✓");
    return validatedProgram;
  } catch (error: any) {
    console.error("[DeepSeek] Error:", error.message);
    
    if (error.message === 'TIMEOUT' || error.name === 'AbortError') {
      throw new Error("AI-tjänsten svarade inte i tid. Försök igen.");
    }
    
    throw error; // Don't retry here, let the main function handle fallback
  }
}

/**
 * Generate workout program using V2 Ultrafast/Compact prompts with auto-1RM
 * Uses simplified JSON structure for faster generation
 * EXPORTED for use with version switcher
 */
// Hydrate V4 Blueprint into DeepSeek format for frontend compatibility
async function hydrateV4Blueprint(
  blueprint: V4Blueprint, 
  profile: any,
  timeModel: any
): Promise<DeepSeekWorkoutProgram> {
  const exerciseIds = new Set<string>();
  blueprint.sessions.forEach(s => s.blocks.forEach(b => b.exercises.forEach(e => exerciseIds.add(e.exercise_id))));
  
  const catalogExercises = await storage.getExercisesByIds(Array.from(exerciseIds));
  const catalogMap = new Map(catalogExercises.map(ex => [ex.exerciseId, ex]));

  const weeklySessions = blueprint.sessions.map(s => {
    const warmup: any[] = [];
    const main_work: any[] = [];
    const cooldown: any[] = [];

    s.blocks.forEach(block => {
      block.exercises.forEach(ex => {
        const cat = catalogMap.get(ex.exercise_id);
        const hydratedEx = {
          exercise_name: cat?.nameEn || cat?.name || ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds ?? timeModel.restBetweenSetsSeconds,
          tempo: "3-0-1-0", // Default tempo
          suggested_weight_kg: null,
          suggested_weight_notes: null,
          target_muscles: cat?.primaryMuscles || [],
          required_equipment: cat?.requiredEquipment || [],
          technique_cues: cat?.description ? [cat.description] : [],
        };

        if (block.type === "warmup") {
          warmup.push({
            exercise_name: hydratedEx.exercise_name,
            sets: ex.sets,
            reps_or_duration: ex.reps,
            notes: ex.notes || "",
          });
        } else if (block.type === "cooldown") {
          cooldown.push({
            exercise_name: hydratedEx.exercise_name,
            duration_or_reps: ex.reps,
            notes: ex.notes || "",
          });
        } else {
          main_work.push({
            ...hydratedEx,
            tempo: "3-0-1-0",
            technique_cues: hydratedEx.technique_cues,
          });
        }
      });
    });

    const sessionDurationSeconds = estimateSessionSeconds(s as any, timeModel);

    return {
      session_number: s.session_index,
      weekday: s.weekday,
      session_name: s.name,
      session_type: "strength",
      estimated_duration_minutes: Math.ceil(sessionDurationSeconds / 60),
      warmup,
      main_work,
      cooldown,
    };
  });

  return {
    user_profile: {
      gender: profile.sex || "not_specified",
      age: profile.age || 30,
      weight_kg: profile.bodyWeight || 75,
      height_cm: profile.height || 175,
      training_level: profile.trainingLevel || "intermediate",
      main_goal: profile.trainingGoals || "general_fitness",
      distribution: {
        strength_percent: profile.goalStrength || 25,
        hypertrophy_percent: profile.goalVolume || 25,
        endurance_percent: profile.goalEndurance || 25,
        cardio_percent: profile.goalCardio || 25,
      },
      sessions_per_week: profile.sessionsPerWeek || 3,
      session_length_minutes: blueprint.sessions[0]?.blocks.length ? 60 : 60, // Fallback
      available_equipment: (profile.equipmentList || "").split(",").filter(Boolean),
    },
    program_overview: {
      week_focus_summary: `${blueprint.program_name} - V4 Generated`,
      expected_difficulty: "Moderate",
      notes_on_progression: "Progress by increasing weight or reps within the prescribed ranges.",
    },
    weekly_sessions: weeklySessions,
  };
}

// Helper to get configuration for a specific provider name
function getClientConfig(provider: string): { client: OpenAI; provider: string; model: string } | null {
  const p = provider.toLowerCase().trim();
  if (p === "deepseek" && process.env.AI_INTEGRATIONS_DEEPSEEK_API_KEY) {
    return { client: deepseek, provider: "DeepSeek", model: "deepseek-chat" };
  }
  if (p === "gemini" && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    // Default to stable 1.5 Flash. Use AI_GEMINI_MODEL to override (e.g. "gemini-1.5-pro" or "gemini-2.0-flash-exp")
    const model = process.env.AI_GEMINI_MODEL || "gemini-1.5-flash";
    return { client: gemini, provider: "Gemini", model: model };
  }
  if (p === "openai" && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return { client: openai, provider: "OpenAI", model: "gpt-4o" };
  }
  return null;
}

// Execute an AI request with fallback to other providers
async function executeWithFallback(
  messages: any[],
  responseFormat: any,
  logPrefix: string
): Promise<{ content: string; provider: string }> {
  let lastError: any;
  const attemptedProviders: string[] = [];

  for (const providerName of PROVIDER_PRIORITY) {
    const config = getClientConfig(providerName);
    
    // Skip unconfigured providers
    if (!config) continue;
    
    try {
      console.log(`[${logPrefix}] 🔄 Attempting generation with ${config.provider} (${config.model})...`);
      
      // Strict timeout to allow fallback rotation within client's 5-minute window
      // Gemini Flash is usually < 10s. DeepSeek can be 30-60s.
      // Set to 45s to be aggressive on stalls.
      const timeoutMs = 45000; 
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out (stalled)")), timeoutMs);
      });

      const apiPromise = config.client.chat.completions.create({
        model: config.model,
        messages,
        response_format: responseFormat,
      });
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      const content = response.choices[0].message.content || "{}";
      
      console.log(`[${logPrefix}] ✅ Success with ${config.provider}`);
      return { content, provider: config.provider };
      
    } catch (error: any) {
      console.warn(`[${logPrefix}] ⚠️ ${config.provider} failed: ${error.message}`);
      lastError = error;
      attemptedProviders.push(config.provider);
      // Continue to next provider...
    }
  }

  console.error(`[${logPrefix}] ❌ All providers failed. Tried: ${attemptedProviders.join(", ")}`);
  throw lastError || new Error("No AI providers available or configured");
}

export async function generateWorkoutProgramV4WithOpenAI(
  profileData: any,
  targetDuration: number
): Promise<DeepSeekWorkoutProgram> {
  // Use fallback mechanism instead of single client
  console.log(`[V4] Starting generation with provider priority: ${PROVIDER_PRIORITY.join(" → ")}`);
  console.log("[V4] Starting Step A: Analysis");
  
  const analysisInput: V4Prompts.V4AnalysisInput = {
    user: {
      age: profileData.age,
      sex: profileData.sex,
      weight_kg: profileData.bodyWeight,
      height_cm: profileData.height,
      training_level: profileData.trainingLevel,
      primary_goal: profileData.trainingGoals,
      sport: profileData.specificSport,
    }
  };

  const analysisResult = await executeWithFallback(
    [
      { role: "system", content: V4Prompts.buildAnalysisSystemPromptV4() },
      { role: "user", content: V4Prompts.buildAnalysisUserPromptV4(analysisInput) }
    ],
    { type: "json_object" },
    "V4 Analysis"
  );

  const analysis = v4AnalysisSchema.parse(JSON.parse(analysisResult.content));
  console.log(`[V4] Analysis complete (via ${analysisResult.provider}):`, analysis.analysis_summary);

  console.log("[V4] Starting Step B: Blueprint");
  
  const timeModel = await storage.getUserTimeModel(profileData.userId) || {
    workSecondsPer10Reps: 30,
    restBetweenSetsSeconds: 90,
    restBetweenExercisesSeconds: 120,
    warmupMinutesDefault: 8,
    cooldownMinutesDefault: 5,
  };

  const pools = await storage.getCandidatePools(profileData.userId, profileData.selectedGymId);
  const candidatePools: V4Prompts.V4CandidatePools = {};
  pools.forEach(p => {
    Object.assign(candidatePools, p.buckets);
  });

  if (Object.keys(candidatePools).length === 0) {
    console.warn("[V4] No candidate pools found, using minimal fallback");
  }

  const blueprintInput: V4Prompts.V4BlueprintInput = {
    schedule: {
      sessions_per_week: profileData.sessionsPerWeek || 3,
      target_minutes: targetDuration,
      allowed_duration_minutes: { min: targetDuration - 10, max: targetDuration + 10 },
      weekdays: (profileData.weekdayList || "Monday,Wednesday,Friday").split(","),
    },
    focus_distribution: analysis.focus_distribution,
    sport: profileData.specificSport,
    time_model: {
      work_seconds_per_10_reps: timeModel.workSecondsPer10Reps,
      rest_between_sets_seconds: timeModel.restBetweenSetsSeconds,
      rest_between_exercises_seconds: timeModel.restBetweenExercisesSeconds,
      warmup_minutes_default: timeModel.warmupMinutesDefault || 8,
      cooldown_minutes_default: timeModel.cooldownMinutesDefault || 5,
    },
    candidate_pools: candidatePools,
  };

  const blueprintResult = await executeWithFallback(
    [
      { role: "system", content: V4Prompts.buildBlueprintSystemPromptV4() },
      { role: "user", content: V4Prompts.buildBlueprintUserPromptV4(blueprintInput) }
    ],
    { type: "json_object" },
    "V4 Blueprint"
  );

  const blueprint = v4BlueprintSchema.parse(JSON.parse(blueprintResult.content));
  console.log(`[V4] Blueprint complete (via ${blueprintResult.provider}):`, blueprint.program_name);

  console.log("[V4] Starting Step C: Hydration & Time Fitting");
  
  // Apply deterministic time fitting across all sessions
  const fitResults = fitProgramSessions({
    sessions: blueprint.sessions as any,
    cfg: {
      workSecondsPer10Reps: timeModel.workSecondsPer10Reps,
      restBetweenSetsSeconds: timeModel.restBetweenSetsSeconds,
      restBetweenExercisesSeconds: timeModel.restBetweenExercisesSeconds,
      warmupMinutesDefault: timeModel.warmupMinutesDefault,
      cooldownMinutesDefault: timeModel.cooldownMinutesDefault,
    },
    targetMinutes: targetDuration,
    allowedMinMinutes: targetDuration - 5,
    allowedMaxMinutes: targetDuration + 5,
  });

  blueprint.sessions = fitResults.sessions as any;
  
  const hydrated = await hydrateV4Blueprint(blueprint, profileData, timeModel);
  console.log("[V4] Hydration complete");

  return hydrated;
}

export async function generateWorkoutBlueprintV4WithOpenAI(
  profileData: any,
  targetDuration: number
): Promise<V4Blueprint> {
  console.log(`[V4] Starting Blueprint generation with provider priority: ${PROVIDER_PRIORITY.join(" → ")}`);
  console.log("[V4] Starting Step A: Analysis (Blueprint Mode)");
  
  const analysisInput: V4Prompts.V4AnalysisInput = {
    user: {
      age: profileData.age,
      sex: profileData.sex,
      weight_kg: profileData.bodyWeight,
      height_cm: profileData.height,
      training_level: profileData.trainingLevel,
      primary_goal: profileData.trainingGoals,
      sport: profileData.specificSport,
    }
  };

  const analysisResult = await executeWithFallback(
    [
      { role: "system", content: V4Prompts.buildAnalysisSystemPromptV4() },
      { role: "user", content: V4Prompts.buildAnalysisUserPromptV4(analysisInput) }
    ],
    { type: "json_object" },
    "V4 Analysis"
  );

  const analysis = v4AnalysisSchema.parse(JSON.parse(analysisResult.content));

  console.log("[V4] Starting Step B: Blueprint");
  
  const timeModel = await storage.getUserTimeModel(profileData.userId) || {
    workSecondsPer10Reps: 30,
    restBetweenSetsSeconds: 90,
    restBetweenExercisesSeconds: 120,
    warmupMinutesDefault: 8,
    cooldownMinutesDefault: 5,
  };

  const pools = await storage.getCandidatePools(profileData.userId, profileData.selectedGymId);
  const candidatePools: V4Prompts.V4CandidatePools = {};
  pools.forEach(p => {
    Object.assign(candidatePools, p.buckets);
  });

  const blueprintInput: V4Prompts.V4BlueprintInput = {
    schedule: {
      sessions_per_week: profileData.sessionsPerWeek || 3,
      target_minutes: targetDuration,
      allowed_duration_minutes: { min: targetDuration - 10, max: targetDuration + 10 },
      weekdays: (profileData.weekdayList || "Monday,Wednesday,Friday").split(","),
    },
    focus_distribution: analysis.focus_distribution,
    sport: profileData.specificSport,
    time_model: {
      work_seconds_per_10_reps: timeModel.workSecondsPer10Reps,
      rest_between_sets_seconds: timeModel.restBetweenSetsSeconds,
      rest_between_exercises_seconds: timeModel.restBetweenExercisesSeconds,
      warmup_minutes_default: timeModel.warmupMinutesDefault || 8,
      cooldown_minutes_default: timeModel.cooldownMinutesDefault || 5,
    },
    candidate_pools: candidatePools,
  };

  const blueprintResult = await executeWithFallback(
    [
      { role: "system", content: V4Prompts.buildBlueprintSystemPromptV4() },
      { role: "user", content: V4Prompts.buildBlueprintUserPromptV4(blueprintInput) }
    ],
    { type: "json_object" },
    "V4 Blueprint"
  );

  const blueprint = v4BlueprintSchema.parse(JSON.parse(blueprintResult.content));

  console.log("[V4] Starting Step C: Time Fitting (Blueprint Mode)");
  
  const fitResults = fitProgramSessions({
    sessions: blueprint.sessions as any,
    cfg: {
      workSecondsPer10Reps: timeModel.workSecondsPer10Reps,
      restBetweenSetsSeconds: timeModel.restBetweenSetsSeconds,
      restBetweenExercisesSeconds: timeModel.restBetweenExercisesSeconds,
      warmupMinutesDefault: timeModel.warmupMinutesDefault,
      cooldownMinutesDefault: timeModel.cooldownMinutesDefault,
    },
    targetMinutes: targetDuration,
    allowedMinMinutes: targetDuration - 5,
    allowedMaxMinutes: targetDuration + 5,
  });

  blueprint.sessions = fitResults.sessions as any;
  
  console.log("[V4] Blueprint generation complete");
  return blueprint;
}

export async function generateWorkoutProgramV2WithOpenAI(
  context: PromptContextV2,
  mode: 'ultrafast' | 'compact' = 'ultrafast'
): Promise<WorkoutProgramV2> {
  const config = AI_CONFIG_V2[mode];
  const systemPrompt = config.buildSystemPrompt();
  const userPrompt = config.buildUserPrompt(context);
  const targetDuration = context.sessionDuration;

  try {
    console.log(`[V2 ${mode.toUpperCase()}] Calling OpenAI API (GPT-5)...`);
    console.log(`[V2 ${mode.toUpperCase()}] Max tokens: ${config.max_tokens}, Timeout: ${config.timeout_ms}ms`);
    
    // Create hard timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, config.timeout_ms);
    });
    
    // Race between API call and timeout
    const apiCallPromise = openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: config.max_tokens,
      temperature: 1,
    });
    
    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    // Check if response was cut off due to token limit
    const finishReason = response.choices?.[0]?.finish_reason;
    if (finishReason === 'length') {
      console.error(`[V2 ${mode.toUpperCase()}] Response truncated - hit max_tokens limit`);
      throw new Error("Programmet blev för långt. Försök igen med färre pass eller kortare passlängd.");
    }

    const content = response.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      console.error(`[V2 ${mode.toUpperCase()}] Invalid response:`, response);
      throw new Error("AI-tjänsten returnerade ogiltigt svar. Försök igen.");
    }

    // Parse and validate
    let rawProgram;
    try {
      rawProgram = JSON.parse(content);
    } catch (parseError) {
      console.error(`[V2 ${mode.toUpperCase()}] JSON parse failed:`, parseError);
      console.error("Raw content (first 1000 chars):", content.substring(0, 1000));
      throw new Error("AI-tjänsten returnerade ogiltigt format. Försök igen.");
    }
    
    const validatedProgram = workoutProgramSchemaV2.parse(rawProgram);
    console.log(`[V2 ${mode.toUpperCase()}] Successfully validated program schema`);
    
    // Validate session durations (±10% tolerance) - throws on failure
    validateSessionDurationsV2(validatedProgram, targetDuration);
    
    console.log(`[V2 ${mode.toUpperCase()}] Program passed all validation ✓`);
    
    // Log detailed program info
    console.log(`[V2 ${mode.toUpperCase()}] Generated ${validatedProgram.sessions.length} sessions:`);
    validatedProgram.sessions.forEach((session, idx) => {
      console.log(`  ${idx + 1}. ${session.name} (${session.day}): ${session.exercises.length} exercises, ${session.estimatedDurationMinutes} min`);
    });
    
    return validatedProgram;
  } catch (error: any) {
    console.error(`[V2 ${mode.toUpperCase()}] Error:`, error.message);
    
    if (error.message === 'TIMEOUT') {
      throw new Error("AI-tjänsten svarade inte i tid. Försök igen.");
    }
    
    throw error;
  }
}

/**
 * Generate workout program with smart provider selection
 * PRIMARY: OpenAI GPT-5 (better at following numeric constraints)
 * FALLBACK: DeepSeek Reasoner (cheaper but less reliable with durations)
 */
export async function generateWorkoutProgramWithReasoner(
  systemPrompt: string,
  userPrompt: string,
  targetDuration: number = 60
): Promise<DeepSeekWorkoutProgram> {
  const minDuration = Math.floor(targetDuration * 0.9);
  const maxDuration = Math.ceil(targetDuration * 1.1);
  console.log(`\n[AI GENERATION] ========================================`);
  console.log(`[AI GENERATION] Target session duration: ${targetDuration} min (±10% = ${minDuration}-${maxDuration} min)`);
  console.log(`[AI GENERATION] ========================================\n`);
  
  // Try OpenAI first (better at numeric constraints)
  try {
    console.log("[AI GENERATION] 🎯 PRIMARY: Attempting OpenAI GPT-5");
    const program = await generateWorkoutProgramWithOpenAI(systemPrompt, userPrompt, targetDuration);
    console.log("[AI GENERATION] ✅ Success with OpenAI GPT-5\n");
    return program;
  } catch (openaiError: any) {
    console.warn(`[AI GENERATION] ⚠️  OpenAI failed: ${openaiError.message}`);
    
    // Fallback to DeepSeek
    try {
      console.log("[AI GENERATION] 🔄 FALLBACK: Attempting DeepSeek Reasoner");
      const program = await generateWorkoutProgramWithDeepSeek(systemPrompt, userPrompt, targetDuration);
      console.log("[AI GENERATION] ✅ Success with DeepSeek Reasoner\n");
      return program;
    } catch (deepseekError: any) {
      console.error(`[AI GENERATION] ❌ DeepSeek also failed: ${deepseekError.message}`);
      console.error("[AI GENERATION] ❌ Both providers failed\n");
      
      // Both failed - give user meaningful Swedish error
      const userMessage = "Kunde inte generera träningsprogram just nu. Vänligen försök igen om en stund.";
      
      // Log details for debugging (server-side only)
      console.error("[AI GENERATION] Error details:", {
        openai: openaiError.message,
        deepseek: deepseekError.message
      });
      
      throw new Error(userMessage);
    }
  }
}

export async function generateWorkoutProgram(
  profile: UserProfile,
  equipment: UserEquipment[]
): Promise<WorkoutProgram> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error("[DeepSeek] API key not configured");
    throw new Error("AI-tjänsten är inte konfigurerad. Kontakta support.");
  }

  const equipmentList = equipment.map(e => e.equipmentName).join(", ");
  
  // Calculate mathematically consistent workout volume using intersection approach
  // Global bounds
  const MIN_SETS_PER_EX = 2;
  const MAX_SETS_PER_EX = 5;
  const MIN_EXERCISES = 2;
  const MAX_EXERCISES = 10;
  
  const sessionDuration = Math.max(15, profile.sessionDuration || 60);
  const workTime = sessionDuration - 5;
  const targetSets = Math.max(4, Math.floor(workTime / 2.5));
  
  // Step 1: Compute duration-derived total set window
  // CRITICAL: maxSets × 2.5 min + 5 min warmup must NOT exceed sessionDuration
  // Therefore: maxSets ≤ floor(workTime / 2.5) = targetSets
  const durationMinSets = Math.max(4, Math.floor(targetSets * 0.8)); // Allow 20% lower
  const durationMaxSets = targetSets; // Never exceed targetSets to stay within sessionDuration
  
  // Step 2: Initial exercise range from duration totals
  let minExercises = Math.max(MIN_EXERCISES, Math.ceil(durationMinSets / MAX_SETS_PER_EX));
  let maxExercises = Math.min(MAX_EXERCISES, Math.floor(durationMaxSets / MIN_SETS_PER_EX));
  
  // Ensure min ≤ max
  if (minExercises > maxExercises) {
    minExercises = maxExercises;
  }
  
  // Step 3: Initial sets per exercise range
  let minSetsPerExercise = Math.max(MIN_SETS_PER_EX, Math.floor(durationMinSets / maxExercises));
  let maxSetsPerExercise = Math.min(MAX_SETS_PER_EX, Math.ceil(durationMaxSets / minExercises));
  
  // Clamp to ensure min ≤ max
  minSetsPerExercise = Math.min(minSetsPerExercise, MAX_SETS_PER_EX);
  if (maxSetsPerExercise < minSetsPerExercise) {
    maxSetsPerExercise = minSetsPerExercise;
  }
  
  // Step 4: Compute feasible totals from exercise and per-exercise ranges
  const feasibleMinSets = minExercises * minSetsPerExercise;
  const feasibleMaxSets = maxExercises * maxSetsPerExercise;
  
  // Step 5: Intersect duration window with feasible window
  const finalMinSets = Math.max(durationMinSets, feasibleMinSets);
  const finalMaxSets = Math.min(durationMaxSets, feasibleMaxSets);
  
  // Step 6: If intersection is empty, tighten feasible range
  let adjustedMinSets = finalMinSets;
  let adjustedMaxSets = finalMaxSets;
  
  if (finalMinSets > finalMaxSets) {
    // Intersection is empty - use duration window but clamp to feasible range
    adjustedMinSets = Math.max(feasibleMinSets, Math.min(durationMinSets, feasibleMaxSets));
    adjustedMaxSets = Math.min(feasibleMaxSets, Math.max(durationMaxSets, feasibleMinSets));
  }
  
  const exerciseRange = `${minExercises}-${maxExercises}`;
  const setsPerExerciseRange = `${minSetsPerExercise}-${maxSetsPerExercise}`;
  const totalSetRange = `${adjustedMinSets}-${adjustedMaxSets}`;
  
  // Beräkna veckodagar baserat på antal pass per vecka
  // Tunga ben-/styrkepass separeras med ≥48h
  const weekdaySchedule: Record<number, string[]> = {
    2: ["Måndag", "Torsdag"],
    3: ["Måndag", "Onsdag", "Fredag"],
    4: ["Måndag", "Tisdag", "Torsdag", "Lördag"], // 48h mellan tunga leg days
    5: ["Måndag", "Tisdag", "Torsdag", "Fredag", "Lördag"], // 48h mellan tunga leg days
    6: ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"]
  };
  
  const sessionsCount = profile.sessionsPerWeek || 3;
  const weekdays = weekdaySchedule[sessionsCount] || weekdaySchedule[3];
  const weekdayList = weekdays.join(", ");
  
  const prompt = `Du är en expert-tränare med specialistkompetens inom tidsoptimering och träningsperiodisering. Generera ett personligt anpassat träningsprogram baserat på dessa preferenser:

**Träningsmål:**
- Styrka: ${profile.goalStrength}/100
- Volym: ${profile.goalVolume}/100
- Uthållighet: ${profile.goalEndurance}/100
- Kondition: ${profile.goalCardio}/100

**Schema:**
- Pass per vecka: ${profile.sessionsPerWeek}
- Passlängd: ${sessionDuration} minuter (MÅSTE efterföljas exakt ±10%)
- Träningsdagar: ${weekdayList}

**Tillgänglig utrustning:**
${equipmentList || "Endast kroppsvikt"}

**⚠️ KRITISK TIDSBERÄKNING (MÅSTE FÖLJAS EXAKT):**

VARJE pass MÅSTE ha en 'estimated_duration_minutes' som beräknas enligt denna formel:

1. **Standardtider:**
   - 1 set = 1.5 minuter (30 sekunder arbete + 60 sekunder vila)
   - Uppvärmning = EXAKT 10 minuter (FAST)
   - Nedvarvning = EXAKT 8 minuter (FAST)

2. **Matematisk formel för huvuddel:**
   - Tillgänglig tid för övningar = ${sessionDuration} - 10 (uppvärmning) - 8 (nedvarvning) = ${sessionDuration - 18} minuter
   - Antal set som ryms = ${sessionDuration - 18} min ÷ 1.5 min/set = ${Math.floor((sessionDuration - 18) / 1.5)} set

3. **Beräkna estimated_duration_minutes:**
   - Räkna totala set i main_work (summa av alla exercises.sets)
   - estimated_duration_minutes = (totala_set × 1.5) + 10 + 8
   - Exempel: 28 set → (28 × 1.5) + 18 = 60 minuter ✓

4. **Tolerans:**
   - MÅSTE vara inom ±10% av ${sessionDuration} min
   - Acceptabelt: ${Math.floor(sessionDuration * 0.9)}-${Math.ceil(sessionDuration * 1.1)} minuter
   - Om du hamnar utanför detta intervall, JUSTERA antalet set

**VOLYM-MÅL (baserat på tidsberäkning):**
- Sikta på ${exerciseRange} övningar per pass
- Varje övning ska ha ${setsPerExerciseRange} set
- Totala set per pass: ${totalSetRange} (justerat för ${sessionDuration} min passlängd)
- Denna volym säkerställer att estimated_duration_minutes = ${sessionDuration} min ±10%

**VIKTIGA PRINCIPER FÖR PROGRAMDESIGN:**
1. **Muskelgruppsfördelning:** Träna alla stora muskelgrupper så jämnt fördelat som möjligt över veckan
2. **48-timmarsregeln:** Minst 48 timmars vila innan samma muskelgrupp tränas igen
3. **Överlappning:** Undvik att träna samma muskelgrupp på närliggande träningsdagar
4. **Balans:** Se till att varje vecka totalt täcker alla huvudsakliga muskelgrupper (Bröst, Rygg, Ben, Axlar, Biceps, Triceps, Core)

**VECKODAGSSTRUKTUR FÖR ${sessionsCount} PASS/VECKA:**
${weekdays.map((day: string, i: number) => `- Pass ${i + 1}: ${day}`).join('\n')}

Generera ett komplett 4-veckors träningsprogram. Returnera ENDAST ett giltigt JSON-objekt med exakt denna struktur (ingen markdown, ingen förklaring):

{
  "programName": "Programnamn baserat på primära mål",
  "duration": "4 weeks",
  "phases": [
    {
      "phaseName": "Vecka 1-2: Grundläggande",
      "weekRange": "1-2",
      "sessions": [
        {
          "sessionName": "Överkropp Styrka",
          "sessionType": "strength",
          "weekday": "Måndag",
          "muscle_focus": "Överkropp - Push",
          "exercises": [
            {
              "exerciseKey": "barbell_bench_press",
              "exerciseTitle": "Bench Press",
              "sets": 4,
              "reps": "6-8",
              "restSeconds": 180,
              "notes": "Fokusera på kontrollerad nedåtgående fas",
              "equipment": ["Skivstång", "Bänk"],
              "muscleGroups": ["Bröst", "Triceps", "Axlar"]
            }
          ]
        }
      ]
    }
  ]
}

**KRITISKA REGLER:**
- Skapa exakt ${sessionsCount} olika pass per vecka
- Varje pass MÅSTE ha ett "weekday" fält med en av dessa dagar: ${weekdayList}
- **VIKTIGT**: Lägg till "muscle_focus" för varje session (t.ex. "Överkropp - Push", "Ben", "Överkropp - Pull", "Helkropp", etc) baserat på vilka muskelgrupper som tränas i passet
- Sikta på ${exerciseRange} övningar med ${setsPerExerciseRange} set vardera (totalt: ${totalSetRange} set per pass)
- Denna volym är designad för att fylla ${sessionDuration}-minuters passlängden
- Använd ENDAST övningar med tillgänglig utrustning: ${equipmentList || "kroppsvikt"}
- Varje övning MÅSTE ha "equipment" array (använd exakta namn: ${equipmentList}) och "muscleGroups" array
- Inkludera 2 faser: Vecka 1-2 och Vecka 3-4
- **MUSKELGRUPPSBALANS:** Se till att varje pass tränar olika muskelgrupper och att samma muskelgrupp inte tränas på pass som är närmare än 48 timmar
- För ${sessionsCount} pass/vecka:
  ${sessionsCount === 2 ? '  • Använd helkroppspass eller överkropp/underkropp split med minst 2 dagars vila mellan' : ''}
  ${sessionsCount === 3 ? '  • Använd push/pull/legs eller 3-vägs split (överkropp drag/tryck, ben)' : ''}
  ${sessionsCount >= 4 ? '  • Använd upper/lower split eller push/pull/legs med lämplig vila mellan samma muskelgrupper' : ''}
- **KRITISKT**: Använd ENDAST ENGELSKA namn för alla övningar (t.ex. "Bench Press", "Squat", "Deadlift")
- Svara ENDAST med giltig JSON, INGA förklaringar, INGEN markdown`;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Du är en professionell tränare. Du svarar ENDAST med giltig JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DeepSeek] API error:", errorText);
      throw new Error(`AI-tjänsten svarade med fel (${response.status}). Försök igen.`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      console.error("[DeepSeek] Invalid response:", data);
      throw new Error("AI-tjänsten returnerade ogiltigt svar. Försök igen.");
    }

    let cleanedContent = content.trim();
    
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    
    cleanedContent = cleanedContent.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    let rawProgram;
    try {
      rawProgram = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Initial JSON parse failed, attempting repair:", parseError);
      console.error("Raw content (first 500 chars):", cleanedContent.substring(0, 500));
      
      const fixedContent = cleanedContent
        .replace(/([,\s])"(\w+)":/g, '$1"$2":')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .trim();
      
      try {
        rawProgram = JSON.parse(fixedContent);
        console.log("JSON repair successful");
      } catch (retryError) {
        console.error("JSON repair failed, cannot parse AI response");
        throw new Error("AI-tjänsten returnerade ogiltigt format. Försök igen.");
      }
    }
    
    const validatedProgram = workoutProgramSchema.parse(rawProgram);

    return validatedProgram;
  } catch (error) {
    console.error("Error generating workout program:", error);
    throw error;
  }
}

/**
 * Convert WorkoutProgramV2 to DeepSeekWorkoutProgram format
 * This allows v2 programs to use existing storage functions
 * CRITICAL: Fabricates all required DeepSeek fields to pass schema validation
 * EXPORTED for regression testing
 */
export function convertV2ToDeepSeekFormat(
  programV2: WorkoutProgramV2,
  profile: { age?: number; sex?: string; bodyWeight?: number; height?: number; trainingLevel?: string; goalStrength?: number; goalVolume?: number; goalEndurance?: number; goalCardio?: number; sessionsPerWeek?: number; sessionDuration?: number; },
  equipmentList?: string
): DeepSeekWorkoutProgram {
  console.log(`[V2→V1 CONVERSION] Converting ${programV2.sessions.length} sessions to DeepSeek format`);
  
  const weekly_sessions = programV2.sessions.map((session, idx) => {
    console.log(`[V2→V1 CONVERSION] Session ${idx + 1}: ${session.name} (${session.estimatedDurationMinutes} min, ${session.exercises.length} exercises)`);
    
    return {
      session_number: idx + 1,
      weekday: session.day,
      session_name: session.name,
      muscle_focus: session.muscleFocus || undefined, // Include muscle group focus
      session_type: session.focus.toLowerCase(),
      estimated_duration_minutes: session.estimatedDurationMinutes, // Preserve V2 validated duration
      warmup: [
        // Synthetic warmup entry to satisfy DeepSeek schema
        {
          exercise_name: "Dynamic Warm-up",
          sets: 1,
          reps_or_duration: "5 min",
          notes: "General mobility and activation",
        }
      ],
      main_work: session.exercises.map(exercise => {
        // Parse equipment string into array (handle comma-separated values)
        const equipmentArray = exercise.equipment
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0);
        
        return {
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds,
          tempo: "2-0-2", // Default controlled tempo
          suggested_weight_kg: null, // V2 doesn't provide this
          suggested_weight_notes: exercise.intensity || "RPE 7-8", // Use intensity if available
          target_muscles: [], // V2 doesn't provide this
          required_equipment: equipmentArray.length > 0 ? equipmentArray : ["Bodyweight"],
          technique_cues: [], // V2 doesn't provide detailed cues
        };
      }),
      cooldown: [
        // Synthetic cooldown entry to satisfy DeepSeek schema
        {
          exercise_name: "Static Stretching",
          duration_or_reps: "5 min",
          notes: "Focus on worked muscle groups",
        }
      ],
    };
  });

  // Build comprehensive program_overview from V2 metadata
  const totalPlannedMinutes = programV2.meta.totalPlannedWeeklyMinutes;
  const avgSessionDuration = totalPlannedMinutes / programV2.sessions.length;
  
  // Parse equipment list to preserve user's available equipment
  const availableEquipment = equipmentList
    ? equipmentList.split(',').map(e => e.trim()).filter(e => e.length > 0)
    : [];
  
  console.log(`[V2→V1 CONVERSION] Available equipment: ${availableEquipment.join(', ') || 'none'}`);
  
  return {
    user_profile: {
      gender: profile.sex || 'man',
      age: profile.age || 30,
      weight_kg: profile.bodyWeight || 75,
      height_cm: profile.height || 175,
      training_level: profile.trainingLevel || 'Van',
      main_goal: 'Generell fitness',
      distribution: {
        strength_percent: profile.goalStrength || 50,
        hypertrophy_percent: profile.goalVolume || 50,
        endurance_percent: profile.goalEndurance || 50,
        cardio_percent: profile.goalCardio || 50,
      },
      sessions_per_week: profile.sessionsPerWeek || 3,
      session_length_minutes: profile.sessionDuration || 60,
      available_equipment: availableEquipment,
    },
    program_overview: {
      week_focus_summary: programV2.meta.notes || 
        `V2-genererat program: ${programV2.sessions.length} pass/vecka, ` +
        `${totalPlannedMinutes} min totalt, ` +
        `${Math.round(avgSessionDuration)} min/pass`,
      expected_difficulty: profile.trainingLevel || 'Van',
      notes_on_progression: "Programmet är genererat med auto-1RM-estimering. " +
        "Följ programmets progression och öka vikterna gradvis baserat på RPE.",
    },
    weekly_sessions,
  };
}

/**
 * Version switcher: Generate workout program using v1 or v2 based on AI_PROMPT_VERSION
 * This is the main entry point that routes.ts should use
 * HARDENED: Automatically falls back to V1 if V2 prerequisites are missing
 */
export async function generateWorkoutProgramWithVersionSwitch(
  systemPrompt: string,
  userPrompt: string,
  targetDuration: number,
  profileData?: {
    age?: number;
    sex?: string;
    bodyWeight?: number;
    height?: number;
    bodyFatPercent?: number;
    muscleMassPercent?: number;
    trainingLevel?: string;
    motivationType?: string;
    trainingGoals?: string;
    specificSport?: string;
    oneRmBench?: number | null;
    oneRmOhp?: number | null;
    oneRmDeadlift?: number | null;
    oneRmSquat?: number | null;
    oneRmLatpull?: number | null;
    currentPassNumber?: number;
    goalStrength: number;
    goalVolume: number;
    goalEndurance: number;
    goalCardio: number;
    sessionsPerWeek: number;
    weekdayList?: string;
    equipmentList?: string;
  }
): Promise<DeepSeekWorkoutProgram> {
  console.log(`[VERSION SWITCHER] Using AI prompt version: ${AI_PROMPT_VERSION}`);
  
  if (AI_PROMPT_VERSION === 'v2' || AI_PROMPT_VERSION === 'v3' || AI_PROMPT_VERSION === 'v4') {
    const versionLabel = AI_PROMPT_VERSION.toUpperCase();
    
    if (AI_PROMPT_VERSION === 'v4') {
      console.log(`[V4] Generating program with IDs-only blueprint and hydration`);
      const v4Program = await generateWorkoutProgramV4WithOpenAI(profileData, targetDuration);
      return v4Program;
    }

    // Comprehensive V2 prerequisites validation
    if (!profileData) {
      console.warn(`[VERSION SWITCHER] V2 requires profile data, falling back to V1`);
      return await generateWorkoutProgramWithReasoner(systemPrompt, userPrompt, targetDuration);
    }
    
    // Validate essential fields for V2 prompts
    const missingFields: string[] = [];
    if (!profileData.weekdayList) missingFields.push('weekdayList');
    if (!profileData.equipmentList) missingFields.push('equipmentList');
    if (!profileData.goalStrength && profileData.goalStrength !== 0) missingFields.push('goalStrength');
    if (!profileData.goalVolume && profileData.goalVolume !== 0) missingFields.push('goalVolume');
    if (!profileData.goalEndurance && profileData.goalEndurance !== 0) missingFields.push('goalEndurance');
    if (!profileData.goalCardio && profileData.goalCardio !== 0) missingFields.push('goalCardio');
    if (!profileData.sessionsPerWeek) missingFields.push('sessionsPerWeek');
    
    if (missingFields.length > 0) {
      console.warn(`[VERSION SWITCHER] V2 requires complete profile data, falling back to V1 (missing: ${missingFields.join(', ')})`);
      return await generateWorkoutProgramWithReasoner(systemPrompt, userPrompt, targetDuration);
    }
    
    const context: PromptContextV2 = {
      profile: {
        age: profileData.age,
        sex: profileData.sex,
        bodyWeight: profileData.bodyWeight,
        height: profileData.height,
        bodyFatPercent: profileData.bodyFatPercent,
        muscleMassPercent: profileData.muscleMassPercent,
        trainingLevel: profileData.trainingLevel,
        motivationType: profileData.motivationType,
        trainingGoals: profileData.trainingGoals,
        specificSport: profileData.specificSport,
        oneRmBench: profileData.oneRmBench,
        oneRmOhp: profileData.oneRmOhp,
        oneRmDeadlift: profileData.oneRmDeadlift,
        oneRmSquat: profileData.oneRmSquat,
        oneRmLatpull: profileData.oneRmLatpull,
        currentPassNumber: profileData.currentPassNumber,
        goalStrength: profileData.goalStrength,
        goalVolume: profileData.goalVolume,
        goalEndurance: profileData.goalEndurance,
        goalCardio: profileData.goalCardio,
        sessionsPerWeek: profileData.sessionsPerWeek,
      },
      sessionDuration: targetDuration,
      weekdayList: profileData.weekdayList || '',
      equipmentList: profileData.equipmentList || '',
    };
    
    console.log(`[${versionLabel}] Generating with ultrafast mode (900 tokens, 25s timeout)`);
    const programV2 = await generateWorkoutProgramV2WithOpenAI(context, 'ultrafast');
    
    // Convert V2 format to DeepSeek format for storage compatibility
    const converted = convertV2ToDeepSeekFormat(programV2, profileData, profileData.equipmentList);
    console.log(`[${versionLabel}] Successfully converted to DeepSeek format`);
    
    // CRITICAL: Validate converted output against DeepSeek schema before returning
    // This ensures V2→V1 conversion never produces invalid payloads in production
    try {
      deepSeekWorkoutProgramSchema.parse(converted);
      console.log(`[${versionLabel}] ✅ Schema validation passed - safe for storage`);
    } catch (validationError) {
      console.error(`[${versionLabel}] ❌ Schema validation FAILED:`, validationError);
      throw new Error(`${versionLabel}→V1 conversion produced invalid DeepSeek payload: ${validationError}`);
    }
    
    return converted;
  } else {
    // Use V1 standard prompts
    console.log(`[V1] Using standard generation (GPT-5 with fallback to DeepSeek)`);
    return await generateWorkoutProgramWithReasoner(systemPrompt, userPrompt, targetDuration);
  }
}
