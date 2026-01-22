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
  {
    name: "Kettlebell runt om i världen",
    nameEn: "Kettlebell Around The Worlds",
    category: "isolation",
    exerciseId: "kettlebell_around_the_worlds",
    primaryMuscles: ["Core", "Shoulders"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Ryggsträckning (Hyperextension) med kettlebell",
    nameEn: "Kettlebell Back Extension",
    category: "strength",
    exerciseId: "kettlebell_back_extension",
    primaryMuscles: ["Lower Back"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    requiredEquipment: ["Kettlebell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Clean",
    nameEn: "Kettlebell Clean",
    category: "strength",
    exerciseId: "kettlebell_clean",
    primaryMuscles: ["Glutes", "Hamstrings", "Back"],
    secondaryMuscles: ["Shoulders", "Forearms"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Clean Press",
    nameEn: "Kettlebell Clean Press",
    category: "strength",
    exerciseId: "kettlebell_clean_press",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back", "Triceps"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Marklyft",
    nameEn: "Kettlebell Deadlift",
    category: "strength",
    exerciseId: "kettlebell_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    secondaryMuscles: ["Back", "Quads"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Hip Thrust",
    nameEn: "Kettlebell Hip Thrust",
    category: "strength",
    exerciseId: "kettlebell_hip_thrust",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Goodmornings",
    nameEn: "Kettlebell Good Morning",
    category: "strength",
    exerciseId: "kettlebell_good_morning",
    primaryMuscles: ["Hamstrings", "Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Halo",
    nameEn: "Kettlebell Halo",
    category: "isolation",
    exerciseId: "kettlebell_halo",
    primaryMuscles: ["Shoulders", "Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell utfall",
    nameEn: "Kettlebell Lunge",
    category: "strength",
    exerciseId: "kettlebell_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell rumänska marklyft",
    nameEn: "Kettlebell Romanian Deadlift",
    category: "strength",
    exerciseId: "kettlebell_romanian_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Rodd",
    nameEn: "Kettlebell Row",
    category: "strength",
    exerciseId: "kettlebell_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Axelpress",
    nameEn: "Kettlebell Shoulder Press",
    category: "strength",
    exerciseId: "kettlebell_shoulder_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Shrug",
    nameEn: "Kettlebell Shrug",
    category: "isolation",
    exerciseId: "kettlebell_shrug",
    primaryMuscles: ["Traps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Single-Leg Marklyft",
    nameEn: "Kettlebell Single-Leg Deadlift",
    category: "strength",
    exerciseId: "kettlebell_single_leg_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Core"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell enbens rumänsk marklyft",
    nameEn: "Kettlebell Single-Leg Romanian Deadlift",
    category: "strength",
    exerciseId: "kettlebell_single_leg_romanian_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Core"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Snatch",
    nameEn: "Kettlebell Snatch",
    category: "strength",
    exerciseId: "kettlebell_snatch",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back", "Hamstrings"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Knäböj",
    nameEn: "Kettlebell Squat",
    category: "strength",
    exerciseId: "kettlebell_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Hamstrings"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell sving",
    nameEn: "Kettlebell Swing",
    category: "strength",
    exerciseId: "kettlebell_swing",
    primaryMuscles: ["Glutes", "Hamstrings", "Core"],
    secondaryMuscles: ["Back", "Shoulders"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Thruster",
    nameEn: "Kettlebell Thruster",
    category: "strength",
    exerciseId: "kettlebell_thruster",
    primaryMuscles: ["Full Body", "Quads", "Shoulders"],
    secondaryMuscles: ["Glutes", "Triceps"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Bägare Bär",
    nameEn: "Kettlebell Goblet Carry",
    category: "strength",
    exerciseId: "kettlebell_goblet_carry",
    primaryMuscles: ["Core", "Full Body"],
    secondaryMuscles: ["Quads", "Forearms"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Bägare Omvänd Utfall",
    nameEn: "Kettlebell Goblet Reverse Lunge",
    category: "strength",
    exerciseId: "kettlebell_goblet_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Bägare Delad Knäböj",
    nameEn: "Kettlebell Goblet Split Squat",
    category: "strength",
    exerciseId: "kettlebell_goblet_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell sidoutfall",
    nameEn: "Kettlebell Lateral Lunge",
    category: "strength",
    exerciseId: "kettlebell_lateral_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell sidosving",
    nameEn: "Kettlebell Lateral Swing",
    category: "strength",
    exerciseId: "kettlebell_lateral_swing",
    primaryMuscles: ["Glutes", "Core", "Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Split Squat",
    nameEn: "Kettlebell Split Squat",
    category: "strength",
    exerciseId: "kettlebell_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Step-Up",
    nameEn: "Kettlebell Step-Up",
    category: "strength",
    exerciseId: "kettlebell_step_up",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Calves"],
    requiredEquipment: ["Kettlebell", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Sumo Deadlift",
    nameEn: "Kettlebell Sumo Deadlift",
    category: "strength",
    exerciseId: "kettlebell_sumo_deadlift",
    primaryMuscles: ["Glutes", "Hamstrings", "Adductors"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Swing Clean",
    nameEn: "Kettlebell Swing Clean",
    category: "strength",
    exerciseId: "kettlebell_swing_clean",
    primaryMuscles: ["Glutes", "Hamstrings", "Shoulders"],
    secondaryMuscles: ["Back", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Walking Lunge",
    nameEn: "Kettlebell Walking Lunge",
    category: "strength",
    exerciseId: "kettlebell_walking_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Bägare Sidoutfall",
    nameEn: "Goblet Lateral Lunge",
    category: "strength",
    exerciseId: "kettlebell_goblet_lateral_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Adductors"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Bägare Step-Up",
    nameEn: "Goblet Step-Up",
    category: "strength",
    exerciseId: "kettlebell_goblet_step_up",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Kettlebell", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Arm Bar",
    nameEn: "Kettlebell Arm Bar",
    category: "isolation",
    exerciseId: "kettlebell_arm_bar",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Core", "Chest"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Clean and Jerk",
    nameEn: "Kettlebell Clean and Jerk",
    category: "strength",
    exerciseId: "kettlebell_clean_and_jerk",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back", "Legs"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Clean och Push Press",
    nameEn: "Kettlebell Clean and Push Press",
    category: "strength",
    exerciseId: "kettlebell_clean_and_push_press",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Triceps", "Quads"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Bondens Marsch",
    nameEn: "Kettlebell Farmer's March",
    category: "strength",
    exerciseId: "kettlebell_farmers_march",
    primaryMuscles: ["Core", "Forearms"],
    secondaryMuscles: ["Glutes", "Hip Flexors"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Bondens Gång",
    nameEn: "Kettlebell Farmer's Walk",
    category: "strength",
    exerciseId: "kettlebell_farmers_walk",
    primaryMuscles: ["Forearms", "Traps", "Core"],
    secondaryMuscles: ["Full Body"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Front Rack Knäböj",
    nameEn: "Kettlebell Front Rack Squat",
    category: "strength",
    exerciseId: "kettlebell_front_rack_squat",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Shoulders", "Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Bägare Bulgarsk Delad Knäböj",
    nameEn: "Kettlebell Goblet Bulgarian Split Squat",
    category: "strength",
    exerciseId: "kettlebell_goblet_bulgarian_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell", "Bench"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell Turkish Get Up",
    nameEn: "Kettlebell Turkish Get Up",
    category: "strength",
    exerciseId: "kettlebell_turkish_get_up",
    primaryMuscles: ["Full Body", "Core", "Shoulders"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell väderkvarn",
    nameEn: "Kettlebell Windmill",
    category: "strength",
    exerciseId: "kettlebell_windmill",
    primaryMuscles: ["Shoulders", "Core", "Obliques"],
    secondaryMuscles: ["Hamstrings", "Glutes"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "advanced"
  },
  {
    name: "Kettlebell sidoböjning",
    nameEn: "Kettlebell Side Bend",
    category: "core",
    exerciseId: "kettlebell_side_bend",
    primaryMuscles: ["Obliques", "Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell upprätt rodd",
    nameEn: "Kettlebell Upright Row",
    category: "strength",
    exerciseId: "kettlebell_upright_row",
    primaryMuscles: ["Shoulders", "Traps"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell alternerande rodd",
    nameEn: "Kettlebell Alternating Row",
    category: "strength",
    exerciseId: "kettlebell_alternating_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Goblet Knäböj",
    nameEn: "Kettlebell Goblet Squat",
    category: "strength",
    exerciseId: "kettlebell_goblet_squat_alt",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Kettlebell Enarms Sving",
    nameEn: "Kettlebell Single-Arm Swing",
    category: "strength",
    exerciseId: "kettlebell_single_arm_swing",
    primaryMuscles: ["Glutes", "Hamstrings", "Core"],
    secondaryMuscles: ["Shoulders", "Back"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell Suitcase Carry",
    nameEn: "Kettlebell Suitcase Carry",
    category: "strength",
    exerciseId: "kettlebell_suitcase_carry",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Forearms", "Full Body"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  },
  {
    name: "Knästående bålrotation med kettlebell",
    nameEn: "Kettlebell Half Kneeling Chop",
    category: "core",
    exerciseId: "kettlebell_half_kneeling_chop",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "intermediate"
  },
  {
    name: "Kettlebell omvänd utfall",
    nameEn: "Kettlebell Reverse Lunge",
    category: "strength",
    exerciseId: "kettlebell_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Kettlebell"],
    difficulty: "beginner"
  }
];

async function run() {
  console.log(`🚀 Starting Multi-Batch Import (Kettlebells)...`);
  
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
