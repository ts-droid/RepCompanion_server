import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq, or } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.ts";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const db = drizzle(pool, { schema });

const exercises = [
  // Core / Abs
  {
    name: "Skivstångs Ab Rollout",
    nameEn: "Barbell Ab Rollout",
    category: "core",
    exerciseId: "barbell_ab_rollout",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders", "Lats"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },

  // Legs / Glutes
  {
    name: "Skivstång Back Squat",
    nameEn: "Barbell Back Squat",
    category: "strength",
    exerciseId: "barbell_back_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Lower Back", "Core"],
    requiredEquipment: ["Skivstång", "Rack"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Bulgarian Split Squat",
    nameEn: "Barbell Bulgarian Split Squat",
    category: "strength",
    exerciseId: "barbell_bulgarian_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "advanced"
  },
  {
    name: "Marklyft med skivstång",
    nameEn: "Barbell Deadlift",
    category: "strength",
    exerciseId: "barbell_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    secondaryMuscles: ["Back", "Forearms", "Traps"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång främre knäböj",
    nameEn: "Barbell Front Squat",
    category: "strength",
    exerciseId: "barbell_front_squat",
    primaryMuscles: ["Quads", "Core"],
    secondaryMuscles: ["Glutes", "Upper Back"],
    requiredEquipment: ["Skivstång", "Rack"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång rumänska marklyft",
    nameEn: "Barbell Romanian Deadlift",
    category: "strength",
    exerciseId: "barbell_romanian_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back", "Forearms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Sumo Marklyft",
    nameEn: "Barbell Sumo Deadlift",
    category: "strength",
    exerciseId: "barbell_sumo_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Adductors"],
    secondaryMuscles: ["Lower Back", "Traps"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Sumo Knäböj",
    nameEn: "Barbell Sumo Squat",
    category: "strength",
    exerciseId: "barbell_sumo_squat",
    primaryMuscles: ["Quads", "Adductors", "Glutes"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Zercher Knäböj",
    nameEn: "Barbell Zercher Squat",
    category: "strength",
    exerciseId: "barbell_zercher_squat",
    primaryMuscles: ["Quads", "Core", "Upper Back"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    requiredEquipment: ["Skivstång", "Rack"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång God morgon",
    nameEn: "Barbell Good Morning",
    category: "strength",
    exerciseId: "barbell_good_morning",
    primaryMuscles: ["Hamstrings", "Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Barbell Hip Thrust",
    nameEn: "Barbell Hip Thrust",
    category: "strength",
    exerciseId: "barbell_hip_thrust",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Box-Knäböj med skivstång",
    nameEn: "Barbell Back Box Squat",
    category: "strength",
    exerciseId: "barbell_box_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Lower Back"],
    requiredEquipment: ["Skivstång", "Rack", "Box (Plyobox)"],
    difficulty: "intermediate"
  },
  {
    name: "Utfall med skivstång",
    nameEn: "Barbell Lunge",
    category: "strength",
    exerciseId: "barbell_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Bakåtlutad utfall med skivstång",
    nameEn: "Barbell Reverse Lunge",
    category: "strength",
    exerciseId: "barbell_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Gångutfall med skivstång",
    nameEn: "Barbell Walking Lunge",
    category: "strength",
    exerciseId: "barbell_walking_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Enbens marklyft med skivstång",
    nameEn: "Barbell Single-Leg Deadlift",
    category: "strength",
    exerciseId: "barbell_single_leg_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Core"],
    secondaryMuscles: ["Lower Back", "Forearms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstångsmarklyft med ett ben",
    nameEn: "Barbell Single-Leg Romanian Deadlift",
    category: "strength",
    exerciseId: "barbell_single_leg_romanian_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Core"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Split Squat",
    nameEn: "Barbell Split Squat",
    category: "strength",
    exerciseId: "barbell_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstångsstepping",
    nameEn: "Barbell Step-Up",
    category: "strength",
    exerciseId: "barbell_step_up",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Calves"],
    requiredEquipment: ["Skivstång", "Box (Plyobox)"],
    difficulty: "intermediate"
  },
  {
    name: "Stående vadpress med skivstång",
    nameEn: "Barbell Standing Calf Raise",
    category: "isolation",
    exerciseId: "barbell_standing_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },

  // Upper Body - Pull
  {
    name: "Stångrodd",
    nameEn: "Barbell Bent Over Row",
    category: "strength",
    exerciseId: "barbell_bent_over_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Rear Delts", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Omvänd-Grepp Framåtlutad Rodd",
    nameEn: "Barbell Reverse-Grip Bent Over Row",
    category: "strength",
    exerciseId: "barbell_reverse_grip_row",
    primaryMuscles: ["Back", "Lats", "Biceps"],
    secondaryMuscles: ["Rear Delts", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Barbell T-Bar Rodd",
    nameEn: "Barbell T-Bar Row",
    category: "strength",
    exerciseId: "barbell_t_bar_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "intermediate"
  },
  {
    name: "Stång Bicepcurll",
    nameEn: "Barbell Bicep Curl",
    category: "isolation",
    exerciseId: "barbell_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "beginner"
  },
  {
    name: "Stångdragcurl",
    nameEn: "Barbell Drag Curl",
    category: "isolation",
    exerciseId: "barbell_drag_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Underarm Curl",
    nameEn: "Barbell Forearm Curl",
    category: "isolation",
    exerciseId: "barbell_forearm_curl",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "beginner"
  },
  {
    name: "Skivstång Curl med omvänt grepp",
    nameEn: "Barbell Reverse-Grip Curl",
    category: "isolation",
    exerciseId: "barbell_reverse_curl",
    primaryMuscles: ["Forearms", "Biceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "beginner"
  },
  {
    name: "Skivstång Preacher Curl",
    nameEn: "Barbell Preacher Curl",
    category: "isolation",
    exerciseId: "barbell_preacher_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstångshrug",
    nameEn: "Barbell Shrug",
    category: "isolation",
    exerciseId: "barbell_shrug",
    primaryMuscles: ["Traps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "beginner"
  },
  {
    name: "Upprättstående rodd med skivstång",
    nameEn: "Barbell Upright Row",
    category: "strength",
    exerciseId: "barbell_upright_row",
    primaryMuscles: ["Shoulders", "Traps"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },

  // Upper Body - Push
  {
    name: "Bänkpress med skivstång",
    nameEn: "Barbell Bench Press",
    category: "strength",
    exerciseId: "barbell_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Close-Grip Bänkpress",
    nameEn: "Barbell Close-Grip Bench Press",
    category: "strength",
    exerciseId: "barbell_close_grip_bench_press",
    primaryMuscles: ["Triceps", "Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Decline Bänkpress",
    nameEn: "Barbell Decline Bench Press",
    category: "strength",
    exerciseId: "barbell_decline_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Incline Bänkpress",
    nameEn: "Barbell Incline Bench Press",
    category: "strength",
    exerciseId: "barbell_incline_bench_press",
    primaryMuscles: ["Chest", "Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstångspress/Militärpress",
    nameEn: "Barbell Overhead Press / Military Press",
    category: "strength",
    exerciseId: "barbell_overhead_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Upper Back", "Core"],
    requiredEquipment: ["Skivstång"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstångspress/militärpress (bakom huvudet)",
    nameEn: "Barbell Overhead Press (Behind Head)",
    category: "strength",
    exerciseId: "barbell_overhead_press_behind_head",
    primaryMuscles: ["Shoulders", "Upper Back"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Sittande axelpress med skivstång",
    nameEn: "Barbell Seated Shoulder Press",
    category: "strength",
    exerciseId: "barbell_seated_shoulder_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },
  {
    name: "Fronthöjning med skivstång",
    nameEn: "Barbell Front Raise",
    category: "isolation",
    exerciseId: "barbell_front_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "beginner"
  },
  {
    name: "Skullcrusher med skivstång",
    nameEn: "Barbell Skull Crusher",
    category: "isolation",
    exerciseId: "barbell_skull_crusher",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  },

  // Olympic / Explosive
  {
    name: "Skivstång Clean",
    nameEn: "Barbell Clean",
    category: "strength",
    exerciseId: "barbell_clean",
    primaryMuscles: ["Full Body", "Glutes", "Hamstrings", "Back"],
    secondaryMuscles: ["Shoulders", "Forearms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Clean and Jerk",
    nameEn: "Barbell Clean and Jerk",
    category: "strength",
    exerciseId: "barbell_clean_and_jerk",
    primaryMuscles: ["Full Body"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Clean och press med skivstång",
    nameEn: "Barbell Clean and Press",
    category: "strength",
    exerciseId: "barbell_clean_and_press",
    primaryMuscles: ["Full Body", "Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Hang Clean",
    nameEn: "Barbell Hang Clean",
    category: "strength",
    exerciseId: "barbell_hang_clean",
    primaryMuscles: ["Full Body", "Glutes", "Hamstrings", "Back"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Muscle Clean med skivstång",
    nameEn: "Barbell Muscle Clean",
    category: "strength",
    exerciseId: "barbell_muscle_clean",
    primaryMuscles: ["Full Body", "Back", "Shoulders"],
    secondaryMuscles: ["Arms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Muscle Snatch",
    nameEn: "Barbell Muscle Snatch",
    category: "strength",
    exerciseId: "barbell_muscle_snatch",
    primaryMuscles: ["Full Body", "Shoulders", "Upper Back"],
    secondaryMuscles: ["Arms"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Power Clean",
    nameEn: "Barbell Power Clean",
    category: "strength",
    exerciseId: "barbell_power_clean",
    primaryMuscles: ["Full Body", "Glutes", "Hamstrings", "Back"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Power Clean och Press",
    nameEn: "Barbell Power Clean and Press",
    category: "strength",
    exerciseId: "barbell_power_clean_and_press_ex",
    primaryMuscles: ["Full Body", "Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Power Snatch",
    nameEn: "Barbell Power Snatch",
    category: "strength",
    exerciseId: "barbell_power_snatch",
    primaryMuscles: ["Full Body", "Glutes", "Shoulders"],
    secondaryMuscles: ["Upper Back"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Snatch",
    nameEn: "Barbell Snatch",
    category: "strength",
    exerciseId: "barbell_snatch",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Skivstång"],
    difficulty: "advanced"
  },
  {
    name: "Skivstång Rack Pull",
    nameEn: "Barbell Rack Pull",
    category: "strength",
    exerciseId: "barbell_rack_pull",
    primaryMuscles: ["Back", "Traps", "Lower Back"],
    secondaryMuscles: ["Glutes", "Hamstrings", "Forearms"],
    requiredEquipment: ["Skivstång", "Rack"],
    difficulty: "intermediate"
  },

  // Landmine Variations
  {
    name: "Skivstång Dubbelarmad Landmine Press",
    nameEn: "Barbell Double-Arm Landmine Press",
    category: "strength",
    exerciseId: "barbell_double_arm_landmine_press",
    primaryMuscles: ["Chest", "Shoulders", "Triceps"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "beginner"
  },
  {
    name: "Skivstång Landmine Deadlift",
    nameEn: "Barbell Landmine Deadlift",
    category: "strength",
    exerciseId: "barbell_landmine_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back", "Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "beginner"
  },
  {
    name: "Skivstång Landmine Dubbel Arm Knäböj Press",
    nameEn: "Barbell Landmine Double Arm Squat Press",
    category: "strength",
    exerciseId: "barbell_landmine_squat_press",
    primaryMuscles: ["Full Body", "Quads", "Shoulders"],
    secondaryMuscles: ["Glutes", "Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "intermediate"
  },
  {
    name: "Skivstång Enarmad Landminepress",
    nameEn: "Barbell Single-Arm Landmine Press",
    category: "strength",
    exerciseId: "barbell_single_arm_landmine_press",
    primaryMuscles: ["Shoulders", "Triceps", "Core"],
    secondaryMuscles: ["Chest"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "intermediate"
  },
  {
    name: "T-bar rodd med skivstång",
    nameEn: "Barbell Double-Arm Landmine Row",
    category: "strength",
    exerciseId: "barbell_landmine_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "beginner"
  },
  {
    name: "Skivstång Landmine Split Squat",
    nameEn: "Barbell Landmine Split Squat",
    category: "strength",
    exerciseId: "barbell_landmine_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "intermediate"
  },
  {
    name: "Landmine Squat med skivstång (med ansiktet utåt)",
    nameEn: "Barbell Landmine Squat (Facing Out)",
    category: "strength",
    exerciseId: "barbell_landmine_squat_facing_out",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "intermediate"
  },
  {
    name: "Landmine-knäböj med skivstång (framåtvänd)",
    nameEn: "Barbell Landmine Squat (Facing In)",
    category: "strength",
    exerciseId: "barbell_landmine_squat_facing_in",
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Quads", "Core"],
    requiredEquipment: ["Skivstång", "Landmine"],
    difficulty: "intermediate"
  },

  // Other
  {
    name: "Hantelöverdrag", // Misclassified as barbell in screen? English says Pullover. Usually dumbbell or barbell.
    nameEn: "Barbell Pull Over",
    category: "isolation",
    exerciseId: "barbell_pull_over",
    primaryMuscles: ["Chest", "Lats"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Skivstång", "Bänk"],
    difficulty: "intermediate"
  }
];

async function run() {
  console.log(`🚀 Starting Multi-Batch Import (Batch 7: Barbells)...`);
  
  let inserted = 0;
  let skipped = 0;

  for (const ex of exercises) {
    try {
      const existing = await db.select().from(schema.exercises).where(
        or(
          eq(schema.exercises.nameEn, ex.nameEn),
          eq(schema.exercises.exerciseId, ex.exerciseId)
        )
      ).limit(1);

      if (existing.length > 0) {
        console.log(`⏩ Skipping Existing: ${ex.nameEn}`);
        skipped++;
        continue;
      }

      await db.insert(schema.exercises).values(ex);
      console.log(`✅ Inserted: ${ex.nameEn}`);
      inserted++;
    } catch (e) {
      console.error(`❌ Error inserting ${ex.nameEn}:`, e);
    }
  }

  console.log(`\n✨ Finished!`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  
  await pool.end();
  process.exit(0);
}

run();
