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
  // Balance Trainer (Bosu)
  {
    name: "Balanstränare Knäböj",
    nameEn: "Balance Trainer Squat",
    category: "Stability",
    exerciseId: "balance_trainer_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Hamstrings"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare planka",
    nameEn: "Balance Trainer Plank",
    category: "Stability",
    exerciseId: "balance_trainer_plank",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders", "Chest"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Bergsklättrare",
    nameEn: "Balance Trainer Mountain Climber",
    category: "Stability",
    exerciseId: "balance_trainer_mountain_climber",
    primaryMuscles: ["Core", "Shoulders"],
    secondaryMuscles: ["Quads", "Hip Flexors"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Omvänd Utfall",
    nameEn: "Balance Trainer Reverse Lunge",
    category: "Stability",
    exerciseId: "balance_trainer_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Russian Twist",
    nameEn: "Balance Trainer Russian Twist",
    category: "Stability",
    exerciseId: "balance_trainer_russian_twist",
    primaryMuscles: ["Obliques", "Core"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Goblet Squat",
    nameEn: "Balance Trainer Goblet Squat",
    category: "Stability",
    exerciseId: "balance_trainer_goblet_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Hamstrings"],
    requiredEquipment: ["Balance Trainer", "Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare sidoutfall",
    nameEn: "Balance Trainer Side Lunge",
    category: "Stability",
    exerciseId: "balance_trainer_side_lunge",
    primaryMuscles: ["Glutes", "Quads"],
    secondaryMuscles: ["Adductors", "Core"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Cykel Crunch",
    nameEn: "Balance Trainer Bicycle Crunch",
    category: "Stability",
    exerciseId: "balance_trainer_bicycle_crunch",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Step-Up",
    nameEn: "Balance Trainer Step-Up",
    category: "Stability",
    exerciseId: "balance_trainer_step_up",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Calves"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "intermediate"
  },
  {
    name: "Balanstränare Lateral Step Over",
    nameEn: "Balance Trainer Lateral Step Over",
    category: "Stability",
    exerciseId: "balance_trainer_lateral_step_over",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Adductors"],
    requiredEquipment: ["Balance Trainer"],
    difficulty: "beginner"
  },

  // EZ-Bar
  {
    name: "EZ-stång Bicepscurl",
    nameEn: "EZ-Bar Bicep Curl",
    category: "Isolation",
    exerciseId: "ez_bar_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["EZ-Bar"],
    difficulty: "beginner"
  },
  {
    name: "EZ-Bar Overhead Triceps Extension",
    nameEn: "EZ-Bar Overhead Tricep Extension",
    category: "Isolation",
    exerciseId: "ez_bar_overhead_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["EZ-Bar"],
    difficulty: "intermediate"
  },
  {
    name: "EZ-stång Preachercurl",
    nameEn: "EZ-Bar Preacher Curl",
    category: "Isolation",
    exerciseId: "ez_bar_preacher_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["EZ-Bar", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "EZ-Bar Bicepscurls med omvänt grepp",
    nameEn: "EZ-Bar Reverse-Grip Bicep Curls",
    category: "Isolation",
    exerciseId: "ez_bar_reverse_grip_bicep_curl",
    primaryMuscles: ["Forearms", "Biceps"],
    secondaryMuscles: [],
    requiredEquipment: ["EZ-Bar"],
    difficulty: "intermediate"
  },
  {
    name: "EZ-stång Skallkross",
    nameEn: "EZ-Bar Skull Crusher",
    category: "Isolation",
    exerciseId: "ez_bar_skull_crusher",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Chest"],
    requiredEquipment: ["EZ-Bar", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "EZ-Bar Upprätad rodd",
    nameEn: "EZ-Bar Upright Row",
    category: "compound",
    exerciseId: "ez_bar_upright_row",
    primaryMuscles: ["Shoulders", "Traps"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["EZ-Bar"],
    difficulty: "intermediate"
  },

  // Medicine Ball
  {
    name: "Medicinbollslams",
    nameEn: "Medicine Ball Slams",
    category: "cardio",
    exerciseId: "medicine_ball_slams",
    primaryMuscles: ["Core", "Shoulders"],
    secondaryMuscles: ["Back", "Glutes"],
    requiredEquipment: ["Medicine Ball"],
    difficulty: "beginner"
  },
  {
    name: "Medicinboll Väggbollar",
    nameEn: "Medicine Ball Wall Balls",
    category: "cardio",
    exerciseId: "medicine_ball_wall_balls",
    primaryMuscles: ["Quads", "Shoulders", "Glutes"],
    secondaryMuscles: ["Core", "Triceps"],
    requiredEquipment: ["Medicine Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Medicinboll Russian Twist",
    nameEn: "Medicine Ball Russian Twist",
    category: "Core",
    exerciseId: "medicine_ball_russian_twist",
    primaryMuscles: ["Obliques", "Core"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Medicine Ball"],
    difficulty: "beginner"
  },
  {
    name: "Utfall med medicinboll och vridning",
    nameEn: "Medicine Ball Lunge with Twist",
    category: "Stability",
    exerciseId: "medicine_ball_lunge_with_twist",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Hamstrings", "Obliques"],
    requiredEquipment: ["Medicine Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Dumbbell Glute Bridge",
    nameEn: "Dumbbell Glute Bridge",
    category: "Isolation",
    exerciseId: "dumbbell_glute_bridge",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },

  // Stability Ball (Swiss Ball)
  {
    name: "Stabilitetsboll Teaser Tåhopp",
    nameEn: "Stability Ball Teaser Toe Taps",
    category: "Stability",
    exerciseId: "stability_ball_teaser_toe_taps",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll för sätesbrygga",
    nameEn: "Stability Ball Glute Bridge",
    category: "Stability",
    exerciseId: "stability_ball_glute_bridge",
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "beginner"
  },
  {
    name: "Stabilitetsboll höftlyft",
    nameEn: "Stability Ball Hip Thrust",
    category: "Stability",
    exerciseId: "stability_ball_hip_thrust",
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll Deadbug",
    nameEn: "Stability Ball Deadbug",
    category: "Stability",
    exerciseId: "stability_ball_deadbug",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "beginner"
  },
  {
    name: "Stabilitetsboll Hyperextension",
    nameEn: "Stability Ball Hyperextension",
    category: "Stability",
    exerciseId: "stability_ball_hyperextension",
    primaryMuscles: ["Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll Ryggförlängning",
    nameEn: "Stability Ball Back Extension",
    category: "Stability",
    exerciseId: "stability_ball_back_extension",
    primaryMuscles: ["Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "beginner"
  },
  {
    name: "Stabilitetsboll Benlyft",
    nameEn: "Stability Ball Leg Raise",
    category: "Stability",
    exerciseId: "stability_ball_leg_raise",
    primaryMuscles: ["Core", "Hip Flexors"],
    secondaryMuscles: [],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsbollplanka",
    nameEn: "Stability Ball Plank",
    category: "Stability",
    exerciseId: "stability_ball_plank",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll Russian Twist",
    nameEn: "Stability Ball Russian Twist",
    category: "Stability",
    exerciseId: "stability_ball_russian_twist",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: [],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll Push-Up",
    nameEn: "Stability Ball Push-Up",
    category: "Stability",
    exerciseId: "stability_ball_push_up",
    primaryMuscles: ["Chest", "Shoulders", "Triceps"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "advanced"
  },
  {
    name: "Stabilitetsboll Crunch",
    nameEn: "Stability Ball Crunch",
    category: "Stability",
    exerciseId: "stability_ball_crunch",
    primaryMuscles: ["Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Stability Ball"],
    difficulty: "beginner"
  },
  {
    name: "Stabilitetsboll mot vägg",
    nameEn: "Stability Ball Wall Squat",
    category: "Stability",
    exerciseId: "stability_ball_wall_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "beginner"
  },
  {
    name: "Stability Ball Jackknife Sit-Up",
    nameEn: "Stability Ball Jackknife Sit-Up",
    category: "Stability",
    exerciseId: "stability_ball_jackknife_situp",
    primaryMuscles: ["Core", "Hip Flexors"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "advanced"
  },
  {
    name: "Stabilitetsboll Hamstringcurl",
    nameEn: "Stability Ball Hamstring Curl",
    category: "Stability",
    exerciseId: "stability_ball_hamstring_curl",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Glutes", "Core"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll Pike",
    nameEn: "Stability Ball Pike",
    category: "Stability",
    exerciseId: "stability_ball_pike",
    primaryMuscles: ["Core", "Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Stability Ball"],
    difficulty: "advanced"
  },
  {
    name: "Stabilitetsboll Magutrullning",
    nameEn: "Stability Ball Ab Rollout",
    category: "Stability",
    exerciseId: "stability_ball_ab_rollout",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders", "Lats"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "intermediate"
  },
  {
    name: "Stabilitetsboll Rör om i grytan",
    nameEn: "Stability Ball Stir The Pot",
    category: "Stability",
    exerciseId: "stability_ball_stir_the_pot",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "advanced"
  },
  {
    name: "Stabilitetsboll Bergsklättrare",
    nameEn: "Stability Ball Mountain Climbers",
    category: "Stability",
    exerciseId: "stability_ball_mountain_climber",
    primaryMuscles: ["Core", "Shoulders"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Stability Ball"],
    difficulty: "advanced"
  }
];

async function run() {
  console.log("🚀 Starting Import Batch 2...");
  
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
