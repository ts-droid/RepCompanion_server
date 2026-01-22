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
    name: "Hantel Arnold Press",
    nameEn: "Dumbbell Arnold Press",
    category: "strength",
    exerciseId: "dumbbell_arnold_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Bänkpress med hantlar",
    nameEn: "Dumbbell Bench Press",
    category: "strength",
    exerciseId: "dumbbell_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Dumbbell Single-Arm Row",
    nameEn: "Dumbbell Single-Arm Row",
    category: "strength",
    exerciseId: "dumbbell_single_arm_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Hantel enkelarmad böjd överkroppsrodd",
    nameEn: "Dumbbell Single-Arm Bent Over Row",
    category: "strength",
    exerciseId: "dumbbell_single_arm_bent_over_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Bicep Curl",
    nameEn: "Dumbbell Bicep Curl",
    category: "isolation",
    exerciseId: "dumbbell_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Reverse-Grip Bicep Curl",
    nameEn: "Dumbbell Reverse-Grip Bicep Curl",
    category: "isolation",
    exerciseId: "dumbbell_reverse_grip_bicep_curl",
    primaryMuscles: ["Forearms", "Biceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Bulgarian Split Squat",
    nameEn: "Dumbbell Bulgarian Split Squat",
    category: "strength",
    exerciseId: "dumbbell_bulgarian_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "advanced"
  },
  {
    name: "Sittande vadpress med hantel",
    nameEn: "Dumbbell Seated Calf Raise",
    category: "isolation",
    exerciseId: "dumbbell_seated_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Stående vadpress med hantel",
    nameEn: "Dumbbell Standing Calf Raise",
    category: "isolation",
    exerciseId: "dumbbell_standing_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Clean",
    nameEn: "Dumbbell Clean",
    category: "strength",
    exerciseId: "dumbbell_clean",
    primaryMuscles: ["Full Body", "Glutes", "Shoulders"],
    secondaryMuscles: ["Hamstrings", "Back"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Koncentration Curl",
    nameEn: "Dumbbell Concentration Curl",
    category: "isolation",
    exerciseId: "dumbbell_concentration_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Cross-Body Hammer Curl",
    nameEn: "Dumbbell Cross-Body Hammer Curl",
    category: "isolation",
    exerciseId: "dumbbell_cross_body_hammer_curl",
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Marklyft",
    nameEn: "Dumbbell Deadlift",
    category: "strength",
    exerciseId: "dumbbell_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    secondaryMuscles: ["Back", "Quads"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Decline Bänkpress",
    nameEn: "Dumbbell Decline Bench Press",
    category: "strength",
    exerciseId: "dumbbell_decline_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantelbondens gång",
    nameEn: "Dumbbell Farmer's Walk",
    category: "strength",
    exerciseId: "dumbbell_farmers_walk",
    primaryMuscles: ["Forearms", "Core", "Traps"],
    secondaryMuscles: ["Glutes", "Quads"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Golvpress med hantlar",
    nameEn: "Dumbbell Floor Press",
    category: "strength",
    exerciseId: "dumbbell_floor_press",
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Flyes",
    nameEn: "Dumbbell Fly",
    category: "isolation",
    exerciseId: "dumbbell_fly",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Underarm Curl",
    nameEn: "Dumbbell Forearm Curl",
    category: "isolation",
    exerciseId: "dumbbell_forearm_curl",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Hantel fronthöjning",
    nameEn: "Dumbbell Front Raise",
    category: "isolation",
    exerciseId: "dumbbell_front_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Chest"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Hammar Bänkpress",
    nameEn: "Dumbbell Hammer Bench Press",
    category: "strength",
    exerciseId: "dumbbell_hammer_bench_press",
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Hammer Curl",
    nameEn: "Dumbbell Hammer Curl",
    category: "isolation",
    exerciseId: "dumbbell_hammer_curl",
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel höftlyft",
    nameEn: "Dumbbell Hip Thrust",
    category: "strength",
    exerciseId: "dumbbell_hip_thrust",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Lutande Bänkpress",
    nameEn: "Dumbbell Incline Bench Press",
    category: "strength",
    exerciseId: "dumbbell_incline_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Incline Bench Reverse Fly",
    nameEn: "Dumbbell Incline Bench Reverse Fly",
    category: "isolation",
    exerciseId: "dumbbell_incline_bench_reverse_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Dumbbell Chest-Supported Row",
    nameEn: "Dumbbell Chest-Supported Row",
    category: "strength",
    exerciseId: "dumbbell_chest_supported_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Incline Bicep Curl",
    nameEn: "Dumbbell Incline Bicep Curl",
    category: "isolation",
    exerciseId: "dumbbell_incline_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Incline Fly",
    nameEn: "Dumbbell Incline Fly",
    category: "isolation",
    exerciseId: "dumbbell_incline_fly",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantellyft i sidled",
    nameEn: "Dumbbell Lateral Raise",
    category: "isolation",
    exerciseId: "dumbbell_lateral_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Sidoutfall",
    nameEn: "Dumbbell Lateral Lunge",
    category: "strength",
    exerciseId: "dumbbell_lateral_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Utfall med hantel",
    nameEn: "Dumbbell Lunge",
    category: "strength",
    exerciseId: "dumbbell_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Overhead Squat",
    nameEn: "Dumbbell Overhead Squat",
    category: "strength",
    exerciseId: "dumbbell_overhead_squat",
    primaryMuscles: ["Quads", "Glutes", "Shoulders"],
    secondaryMuscles: ["Core", "Hamstrings"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Enarms hantel tricepsextension över huvudet",
    nameEn: "Single Dumbbell Overhead Tricep Extension",
    category: "isolation",
    exerciseId: "single_dumbbell_overhead_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Preacher Curl",
    nameEn: "Dumbbell Preacher Curl",
    category: "isolation",
    exerciseId: "dumbbell_preacher_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Pullover",
    nameEn: "Dumbbell Pullover",
    category: "isolation",
    exerciseId: "dumbbell_pullover",
    primaryMuscles: ["Chest", "Lats"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel bakre axel flys",
    nameEn: "Dumbbell Rear Delt (Reverse) Fly",
    category: "isolation",
    exerciseId: "dumbbell_rear_delt_reverse_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Bakre Delt Row",
    nameEn: "Dumbbell Rear Delt Row",
    category: "strength",
    exerciseId: "dumbbell_rear_delt_row",
    primaryMuscles: ["Back", "Shoulders"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Renegade Row",
    nameEn: "Dumbbell Renegade Row",
    category: "strength",
    exerciseId: "dumbbell_renegade_row",
    primaryMuscles: ["Back", "Core"],
    secondaryMuscles: ["Shoulders", "Biceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Renegade Row med Armhävning",
    nameEn: "Dumbbell Renegade Row with Push-Up",
    category: "strength",
    exerciseId: "dumbbell_renegade_row_pushup",
    primaryMuscles: ["Chest", "Back", "Core"],
    secondaryMuscles: ["Shoulders", "Triceps", "Biceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Rumänsk marklyft med hantel",
    nameEn: "Dumbbell Romanian Deadlift",
    category: "strength",
    exerciseId: "dumbbell_romanian_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back", "Forearms"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantelrodd",
    nameEn: "Dumbbell Row",
    category: "strength",
    exerciseId: "dumbbell_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Dumbbell sittande Shrug",
    nameEn: "Dumbbell Seated Shrug",
    category: "isolation",
    exerciseId: "dumbbell_seated_shrug",
    primaryMuscles: ["Traps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Hantelaxelpress",
    nameEn: "Dumbbell Shoulder Press",
    category: "strength",
    exerciseId: "dumbbell_shoulder_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantelaxelryck",
    nameEn: "Dumbbell Shrug",
    category: "isolation",
    exerciseId: "dumbbell_shrug",
    primaryMuscles: ["Traps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel sidolyft till fronthöjning",
    nameEn: "Dumbbell Side Raise to Front Raise",
    category: "isolation",
    exerciseId: "dumbbell_side_raise_to_front_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Dumbbell Single-Arm Overhead Tricep Extension",
    nameEn: "Dumbbell Single-Arm Overhead Tricep Extension",
    category: "isolation",
    exerciseId: "dumbbell_single_arm_overhead_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Enarms Axelpress",
    nameEn: "Dumbbell Single-Arm Shoulder Press",
    category: "strength",
    exerciseId: "dumbbell_single_arm_shoulder_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Skull Crusher",
    nameEn: "Dumbbell Skull Crusher",
    category: "isolation",
    exerciseId: "dumbbell_skull_crusher",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Snatch",
    nameEn: "Dumbbell Snatch",
    category: "strength",
    exerciseId: "dumbbell_snatch",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back", "Hamstrings"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Split Squat",
    nameEn: "Dumbbell Split Squat",
    category: "strength",
    exerciseId: "dumbbell_split_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Step-Up",
    nameEn: "Dumbbell Step-Up",
    category: "strength",
    exerciseId: "dumbbell_step_up",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Calves"],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Thruster",
    nameEn: "Dumbbell Thruster",
    category: "strength",
    exerciseId: "dumbbell_thruster",
    primaryMuscles: ["Full Body", "Quads", "Shoulders"],
    secondaryMuscles: ["Glutes", "Triceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Tricep Kickback",
    nameEn: "Dumbbell Tricep Kickback",
    category: "isolation",
    exerciseId: "dumbbell_tricep_kickback",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Dumbbell uppresning rodd",
    nameEn: "Dumbbell Upright Row",
    category: "strength",
    exerciseId: "dumbbell_upright_row",
    primaryMuscles: ["Shoulders", "Traps"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel V Sit",
    nameEn: "Dumbbell V Sit",
    category: "core",
    exerciseId: "dumbbell_v_sit",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Gångutfall med hantel",
    nameEn: "Dumbbell Walking Lunge",
    category: "strength",
    exerciseId: "dumbbell_walking_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Zottman Curls",
    nameEn: "Dumbbell Zottman Curls",
    category: "isolation",
    exerciseId: "dumbbell_zottman_curl",
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Knäböj",
    nameEn: "Dumbbell Goblet Squat",
    category: "strength",
    exerciseId: "dumbbell_goblet_squat_alt",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Hamstrings"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Rysk vridning med hantel",
    nameEn: "Dumbbell Russian Twist",
    category: "core",
    exerciseId: "dumbbell_russian_twist",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "beginner"
  },
  {
    name: "Hantel Tate Press",
    nameEn: "Dumbbell Tate Press",
    category: "isolation",
    exerciseId: "dumbbell_tate_press",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Reverse-Grip Underarm Curl",
    nameEn: "Dumbbell Reverse-Grip Forearm Curl",
    category: "isolation",
    exerciseId: "dumbbell_reverse_grip_forearm_curl",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Enbensmarklyft med hantel",
    nameEn: "Dumbbell Single-Leg Deadlift",
    category: "strength",
    exerciseId: "dumbbell_single_leg_deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Core"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel omvänd utfall",
    nameEn: "Dumbbell Reverse Lunge",
    category: "strength",
    exerciseId: "dumbbell_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Hammer Underarmscurl",
    nameEn: "Dumbbell Hammer Forearm Curl",
    category: "isolation",
    exerciseId: "dumbbell_hammer_forearm_curl",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel stående världen runt",
    nameEn: "Dumbbell Standing Around the World",
    category: "isolation",
    exerciseId: "dumbbell_standing_around_world",
    primaryMuscles: ["Shoulders", "Chest"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Dumbbell Forearm Twist",
    nameEn: "Dumbbell Forearm Twist",
    category: "isolation",
    exerciseId: "dumbbell_forearm_twist",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantelpress",
    nameEn: "Dumbbell Push Press",
    category: "strength",
    exerciseId: "dumbbell_push_press",
    primaryMuscles: ["Shoulders", "Quads"],
    secondaryMuscles: ["Triceps", "Glutes"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Dragcurl med hantlar",
    nameEn: "Dumbbell Drag Curl",
    category: "isolation",
    exerciseId: "dumbbell_drag_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Dumbbell Burpee",
    nameEn: "Dumbbell Burpee",
    category: "strength",
    exerciseId: "dumbbell_burpee",
    primaryMuscles: ["Full Body", "Chest", "Quads"],
    secondaryMuscles: ["Core", "Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Clean and Jerk",
    nameEn: "Dumbbell Clean and Jerk",
    category: "strength",
    exerciseId: "dumbbell_clean_and_jerk",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back", "Legs"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Clean and Press",
    nameEn: "Dumbbell Clean and Press",
    category: "strength",
    exerciseId: "dumbbell_clean_and_press",
    primaryMuscles: ["Full Body", "Shoulders", "Glutes"],
    secondaryMuscles: ["Back", "Triceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Devil Press",
    nameEn: "Dumbbell Devil Press",
    category: "strength",
    exerciseId: "dumbbell_devil_press",
    primaryMuscles: ["Full Body", "Shoulders", "Chest"],
    secondaryMuscles: ["Back", "Legs", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel front rack bakåtlunge",
    nameEn: "Dumbbell Front Rack Reverse Lunge",
    category: "strength",
    exerciseId: "dumbbell_front_rack_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Hamstrings", "Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel front rack knäböj",
    nameEn: "Dumbbell Front Rack Squat",
    category: "strength",
    exerciseId: "dumbbell_front_rack_squat",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Hamstrings", "Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel goblet bakåtlunge",
    nameEn: "Dumbbell Goblet Reverse Lunge",
    category: "strength",
    exerciseId: "dumbbell_goblet_reverse_lunge",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel good morning",
    nameEn: "Dumbbell Good Morning",
    category: "strength",
    exerciseId: "dumbbell_good_morning",
    primaryMuscles: ["Hamstrings", "Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel ipsilateral utfall",
    nameEn: "Dumbbell Ipsilateral Lunge",
    category: "strength",
    exerciseId: "dumbbell_ipsilateral_lunge",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Man Maker",
    nameEn: "Dumbbell Man Maker",
    category: "strength",
    exerciseId: "dumbbell_man_maker",
    primaryMuscles: ["Full Body", "Shoulders", "Chest", "Back"],
    secondaryMuscles: ["Legs", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Överhuvud Tracepssträck",
    nameEn: "Dumbbell Overhead Tricep Extension",
    category: "isolation",
    exerciseId: "dumbbell_overhead_tricep_extension_alt",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Plank Drag Genom",
    nameEn: "Dumbbell Plank Pull Through",
    category: "core",
    exerciseId: "dumbbell_plank_pull_through",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Shoulders", "Back"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Knäböj med hantel och hammarcurl",
    nameEn: "Dumbbell Squat with Hammer Curl",
    category: "strength",
    exerciseId: "dumbbell_squat_with_hammer_curl",
    primaryMuscles: ["Quads", "Biceps", "Glutes"],
    secondaryMuscles: ["Core", "Forearms"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Stiff-Leg Marklyft",
    nameEn: "Dumbbell Stiff-Leg Deadlift",
    category: "strength",
    exerciseId: "dumbbell_stiff_leg_deadlift",
    primaryMuscles: ["Hamstrings", "Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Sumo Marklyft",
    nameEn: "Dumbbell Sumo Deadlift",
    category: "strength",
    exerciseId: "dumbbell_sumo_deadlift",
    primaryMuscles: ["Glutes", "Hamstrings", "Adductors"],
    secondaryMuscles: ["Lower Back", "Forearms"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Sumo Squat",
    nameEn: "Dumbbell Sumo Squat",
    category: "strength",
    exerciseId: "dumbbell_sumo_squat",
    primaryMuscles: ["Glutes", "Quads", "Adductors"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "intermediate"
  },
  {
    name: "Hantel Sumo Thruster",
    nameEn: "Dumbbell Sumo Thruster",
    category: "strength",
    exerciseId: "dumbbell_sumo_thruster",
    primaryMuscles: ["Full Body", "Glutes", "Shoulders"],
    secondaryMuscles: ["Quads", "Triceps"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Swing Lunge",
    nameEn: "Dumbbell Swing Lunge",
    category: "strength",
    exerciseId: "dumbbell_swing_lunge",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  },
  {
    name: "Hantel Vindmölla",
    nameEn: "Dumbbell Windmill",
    category: "strength",
    exerciseId: "dumbbell_windmill",
    primaryMuscles: ["Shoulders", "Core", "Obliques"],
    secondaryMuscles: ["Hamstrings", "Glutes"],
    requiredEquipment: ["Dumbbell"],
    difficulty: "advanced"
  }
];

async function run() {
  console.log(`🚀 Starting Multi-Batch Import (Dumbbells)...`);
  
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
        // Update if missing exerciseId or other fields? Nah, skip for safety and speed.
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
