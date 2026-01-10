import { db } from "./db";
import { exercises, unmappedExercises } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Exercise Matching System
 * Strategy B: Fuzzy matching with admin review for unmapped exercises
 * 
 * This service matches AI-generated exercise names to our catalog using:
 * 1. Name normalization (lowercase, remove punctuation)
 * 2. Alias mapping (common variations)
 * 3. Levenshtein distance (edit distance)
 * 4. Logging unmapped exercises for admin review
 */

// Normalize exercise name for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Calculate Levenshtein distance (edit distance) between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first column and row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Common exercise name aliases (AI might generate these variations)
// Keys are canonical English names, values are common variations
const exerciseAliases: Record<string, string[]> = {
  "Back Squat": ["squat", "barbell squat", "back squat", "backsquat", "knäböj"],
  "Bench Press": ["bench press", "barbell bench press", "flat bench press", "bänkpress"],
  "Deadlift": ["deadlift", "conventional deadlift", "barbell deadlift", "marklyft"],
  "Overhead Press": ["overhead press", "shoulder press", "military press", "standing press", "axelpress", "ohp"],
  "Lat Pulldown": ["lat pulldown", "lat pull down", "wide grip pulldown", "latsdrag", "pulldown"],
  "Barbell Row": ["barbell row", "bent over row", "pendlay row", "bb row", "rodd"],
  "Barbell Curl": ["barbell curl", "bicep curl", "ez bar curl", "bicepscurl"],
  "Triceps Pushdown": ["triceps pushdown", "cable pushdown", "tricep pushdown", "rope pushdown"],
  "Leg Press": ["leg press", "benpress"],
  "Leg Curl": ["leg curl", "lying leg curl", "hamstring curl", "bencurl"],
  "Leg Extension": ["leg extension", "quad extension", "benförlängning", "bensträck"],
  "Calf Raise": ["calf raise", "standing calf raise", "seated calf raise", "vadpress"],
  "Push Up": ["push up", "pushup", "push-up", "armhävning"],
  "Pull Up": ["pull up", "pullup", "pull-up", "chin up", "chins"],
  "Dip": ["dip", "dips", "parallel bar dip", "tricep dip"],
  "Plank": ["plank", "front plank", "plankan"],
  "Crunch": ["crunch", "ab crunch", "abdominal crunch", "sit up"],
  "Hip Thrust": ["hip thrust", "barbell hip thrust", "glute bridge", "höftlyft"],
  "Lateral Raise": ["lateral raise", "side raise", "dumbbell lateral raise", "lat raise", "sidan lyft"],
  "Front Raise": ["front raise", "dumbbell front raise", "framåtlyft"],
  "Rear Delt Fly": ["rear delt fly", "rear delt raise", "reverse fly", "bakåtlyft"],
  "Incline Bench Press": ["incline bench", "incline press", "incline barbell bench"],
  "Dumbbell Bench Press": ["dumbbell bench", "dumbbell press", "db bench press", "hantelpress"],
  "Romanian Deadlift": ["romanian deadlift", "rdl", "stiff leg deadlift", "rumänsk marklyft"],
  "Walking Lunge": ["walking lunge", "lunges", "forward lunge", "utfallssteg"],
  "Bulgarian Split Squat": ["bulgarian split squat", "split squat", "rear foot elevated split squat", "bulgariska splitknäböj"],
  "Hammer Curl": ["hammer curl", "neutral grip curl"],
  "Preacher Curl": ["preacher curl", "scott curl"],
  "Face Pull": ["face pull", "face pulls", "rear delt pull", "cable face pull"],
  "Farmer Walk": ["farmers walk", "farmer walk", "farmer carry", "farmers carry"],
  "Kettlebell Swing": ["kettlebell swing", "kb swing", "russian swing"],
};

// Build reverse alias map for faster lookup
const aliasToCanonical: Map<string, string> = new Map();
for (const [canonical, aliases] of Object.entries(exerciseAliases)) {
  for (const alias of aliases) {
    aliasToCanonical.set(normalizeName(alias), canonical);
  }
}

interface MatchResult {
  matched: boolean;
  exerciseName: string | null;
  confidence: 'exact' | 'alias' | 'fuzzy' | 'none';
  distance?: number;
}

/**
 * Match an AI-generated exercise name to our catalog
 * Returns the canonical English name if found, or null if no match
 */
export async function matchExercise(aiGeneratedName: string): Promise<MatchResult> {
  const normalized = normalizeName(aiGeneratedName);
  
  // Step 1: Try exact match on normalized nameEn (ENGLISH ONLY - nameEn must exist)
  const exactMatch = await db
    .select()
    .from(exercises)
    .where(
      sql`${exercises.nameEn} IS NOT NULL 
       AND (LOWER(REGEXP_REPLACE(${exercises.nameEn}, '[^\\w\\s]', '', 'g')) = ${normalized}
         OR LOWER(REGEXP_REPLACE(${exercises.name}, '[^\\w\\s]', '', 'g')) = ${normalized})`
    )
    .limit(1);

  if (exactMatch.length > 0) {
    return {
      matched: true,
      exerciseName: exactMatch[0].nameEn!, // Always exists due to WHERE clause
      confidence: 'exact',
    };
  }

  // Step 2: Try alias matching (ENGLISH ONLY - nameEn must exist)
  const canonicalFromAlias = aliasToCanonical.get(normalized);
  if (canonicalFromAlias) {
    const aliasMatch = await db
      .select()
      .from(exercises)
      .where(
        sql`${exercises.nameEn} IS NOT NULL AND ${exercises.nameEn} = ${canonicalFromAlias}`
      )
      .limit(1);

    if (aliasMatch.length > 0) {
      return {
        matched: true,
        exerciseName: aliasMatch[0].nameEn!, // Always exists due to WHERE clause
        confidence: 'alias',
      };
    }
  }

  // Step 3: Try fuzzy matching (Levenshtein distance) - ENGLISH ONLY
  const allExercises = await db
    .select()
    .from(exercises)
    .where(sql`${exercises.nameEn} IS NOT NULL`); // Only exercises with English names
  
  let bestMatch: typeof allExercises[0] | null = null;
  let bestDistance = Infinity;
  const threshold = 5; // Max edit distance to accept

  for (const exercise of allExercises) {
    // Match against English name (nameEn guaranteed to exist)
    const distanceEnglish = levenshteinDistance(normalized, normalizeName(exercise.nameEn!));
    
    if (distanceEnglish < bestDistance && distanceEnglish <= threshold) {
      bestDistance = distanceEnglish;
      bestMatch = exercise;
    }
  }

  if (bestMatch) {
    return {
      matched: true,
      exerciseName: bestMatch.nameEn!, // Always exists due to WHERE clause
      confidence: 'fuzzy',
      distance: bestDistance,
    };
  }

  // Step 4: No match found - auto-expand catalog
  const newExerciseName = await createExerciseFromAI(aiGeneratedName);
  
  if (newExerciseName) {
    return {
      matched: true,
      exerciseName: newExerciseName,
      confidence: 'none', // Auto-created, no prior match
    };
  }

  // Fallback: log as unmapped if creation fails
  await logUnmappedExercise(aiGeneratedName, null);

  return {
    matched: false,
    exerciseName: null,
    confidence: 'none',
  };
}

/**
 * Auto-expand catalog: Create new exercise from AI-generated name
 * Tries to determine if name is Swedish or English and populates accordingly
 */
async function createExerciseFromAI(aiGeneratedName: string): Promise<string | null> {
  try {
    // Check if exercise already exists (avoid duplicates)
    const existing = await db
      .select()
      .from(exercises)
      .where(
        sql`${exercises.nameEn} = ${aiGeneratedName} OR ${exercises.name} = ${aiGeneratedName}`
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0].nameEn || existing[0].name;
    }

    // Determine if name is likely Swedish or English based on character set
    const hasSwedishChars = /[åäöÅÄÖ]/.test(aiGeneratedName);
    const isSwedish = hasSwedishChars || aiGeneratedName.toLowerCase().includes('böj') || 
                      aiGeneratedName.toLowerCase().includes('lyft');

    // CRITICAL: Reject Swedish names - we only accept English exercises
    if (isSwedish) {
      console.warn(`[AUTO-EXPAND] Rejected Swedish exercise name: ${aiGeneratedName}`);
      await logUnmappedExercise(aiGeneratedName, 'Rejected: Swedish name (English-only policy)');
      return null;
    }

    // Create new exercise with English name
    // Always populate nameEn for auto-created exercises (English-only policy)
    const [newExercise] = await db.insert(exercises).values({
      name: aiGeneratedName, // Fallback for display
      nameEn: aiGeneratedName, // CRITICAL: Always populate nameEn
      category: 'strength', // Default category
      difficulty: 'intermediate',
      primaryMuscles: ['unknown'], // Placeholder
      secondaryMuscles: [],
      requiredEquipment: ['unknown'], // Placeholder
      isCompound: false,
      youtubeUrl: null, // No video yet - admin can add later
      videoType: null,
    }).returning();

    console.log(`[AUTO-EXPAND] Created new exercise: ${newExercise.nameEn || newExercise.name} (AI-generated)`);

    return newExercise.nameEn || newExercise.name;
  } catch (error) {
    console.error(`[AUTO-EXPAND] Failed to create exercise "${aiGeneratedName}":`, error);
    return null;
  }
}

/**
 * Log an unmapped exercise for admin review
 * Increments count if already exists, creates new entry otherwise
 */
async function logUnmappedExercise(aiName: string, suggestedMatch: string | null) {
  try {
    // Try to find existing unmapped exercise
    const existing = await db
      .select()
      .from(unmappedExercises)
      .where(eq(unmappedExercises.aiName, aiName))
      .limit(1);

    if (existing.length > 0) {
      // Increment count and update lastSeen
      await db
        .update(unmappedExercises)
        .set({
          count: sql`${unmappedExercises.count} + 1`,
          lastSeen: new Date(),
        })
        .where(eq(unmappedExercises.aiName, aiName));
    } else {
      // Create new entry
      await db.insert(unmappedExercises).values({
        aiName,
        suggestedMatch,
        count: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
      });
    }
  } catch (error) {
    console.error(`Failed to log unmapped exercise "${aiName}":`, error);
  }
}

/**
 * Get all unmapped exercises sorted by count (most frequent first)
 * Used by admin endpoint
 */
export async function getUnmappedExercises() {
  return await db
    .select()
    .from(unmappedExercises)
    .orderBy(sql`${unmappedExercises.count} DESC`);
}

/**
 * Helper to serialize exercise with guaranteed nameEn fallback
 * Ensures nameEn is never undefined in AI prompts
 */
function serializeExercise(ex: any): { id: number; nameEn: string; name: string; youtubeUrl: string | null } {
  return {
    id: ex.id,
    nameEn: ex.nameEn || ex.name || 'Unknown Exercise',
    name: ex.name || 'Unknown Exercise',
    youtubeUrl: ex.youtubeUrl,
  };
}

/**
 * Filter exercises based on user's available equipment at a specific gym
 * Returns only exercises that can be performed with the user's equipment
 * @param userId - User ID
 * @param gymId - Gym ID (optional, uses selected gym if not provided)
 * @returns Array of exercises with English names that match available equipment
 */
export async function filterExercisesByUserEquipment(
  userId: string, 
  gymId?: string
): Promise<Array<{ id: number; nameEn: string; name: string; youtubeUrl: string | null }>> {
  try {
    // Get user's selected gym if gymId not provided
    let targetGymId = gymId;
    if (!targetGymId) {
      const { userProfiles } = await import("@shared/schema");
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);
      
      targetGymId = profile?.selectedGymId || undefined;
    }

    // Get user's equipment (gym-specific or all if no gym selected)
    const { userEquipment } = await import("@shared/schema");
    let userEq;
    
    if (targetGymId) {
      // Get equipment for specific gym
      userEq = await db
        .select()
        .from(userEquipment)
        .where(
          sql`${userEquipment.userId} = ${userId} AND ${userEquipment.gymId} = ${targetGymId}`
        );
      console.log(`[EXERCISE FILTER] Filtering for gym ${targetGymId}`);
    } else {
      // Fallback: Get all equipment for user across all gyms
      userEq = await db
        .select()
        .from(userEquipment)
        .where(sql`${userEquipment.userId} = ${userId}`);
      console.log(`[EXERCISE FILTER] No gym selected - using aggregate equipment`);
    }

    if (userEq.length === 0) {
      console.warn(`[EXERCISE FILTER] No equipment found for user ${userId}`);
      console.warn(`[EXERCISE FILTER] Fallback: returning all bodyweight exercises with English names`);
      
      // Fallback: Return only bodyweight exercises with English names
      const allExercises = await db.select().from(exercises);
      const bodyweightExercises = allExercises.filter(ex => 
        ex.nameEn && (!ex.requiredEquipment || ex.requiredEquipment.length === 0)
      );
      
      return bodyweightExercises.map(serializeExercise);
    }

    // Extract equipment names (normalize for matching)
    const availableEquipment = userEq.map(eq => 
      normalizeName(eq.equipmentName)
    );

    console.log(`[EXERCISE FILTER] User has ${availableEquipment.length} pieces of equipment at gym ${targetGymId}`);

    // Get all exercises from catalog
    const allExercises = await db.select().from(exercises);

    // Filter exercises where ALL required equipment is available
    // AND exercise has English name (nameEn is not null)
    const matchingExercises = allExercises.filter(exercise => {
      // CRITICAL: Only include exercises with English names
      if (!exercise.nameEn) {
        return false;
      }
      
      // If requiredEquipment is null/empty, it means bodyweight exercise - always available
      if (!exercise.requiredEquipment || exercise.requiredEquipment.length === 0) {
        return true;
      }

      // Normalize required equipment
      const required = exercise.requiredEquipment.map(eq => normalizeName(eq));
      
      // Allow 'unknown' equipment (from auto-created exercises) - treat as available
      // Admin can review and update later via unmapped_exercises table
      const filteredRequired = required.filter(req => req !== 'unknown');
      
      // If only 'unknown' equipment, treat as available
      if (filteredRequired.length === 0) {
        return true;
      }

      // Check if ALL required equipment (excluding 'unknown') is available
      const allAvailable = filteredRequired.every(req => 
        availableEquipment.some(avail => 
          avail.includes(req) || req.includes(avail)
        )
      );

      return allAvailable;
    });

    console.log(`[EXERCISE FILTER] ${matchingExercises.length} exercises match user's equipment`);

    // Ultimate fallback: If no exercises match, return bodyweight exercises with English names
    if (matchingExercises.length === 0) {
      console.warn(`[EXERCISE FILTER] No exercises matched equipment - falling back to bodyweight exercises`);
      const allExercises = await db.select().from(exercises);
      const bodyweightExercises = allExercises.filter(ex => 
        ex.nameEn && (!ex.requiredEquipment || ex.requiredEquipment.length === 0)
      );
      console.log(`[EXERCISE FILTER] Returning ${bodyweightExercises.length} bodyweight exercises as fallback`);
      
      return bodyweightExercises.map(serializeExercise);
    }

    // Return exercises with English names (using centralized serialization)
    return matchingExercises.map(serializeExercise);
  } catch (error) {
    console.error(`[EXERCISE FILTER] Failed to filter exercises:`, error);
    // Emergency fallback: Return empty array (AI will use equipment list only)
    return [];
  }
}
