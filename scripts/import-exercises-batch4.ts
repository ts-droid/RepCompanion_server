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
  // Chest
  {
    name: "Cable Fly Hög",
    nameEn: "Cable Fly High",
    category: "isolation",
    exerciseId: "cable_fly_high",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabeldrag mitt",
    nameEn: "Cable Fly Mid",
    category: "isolation",
    exerciseId: "cable_fly_mid",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabeldrag låg",
    nameEn: "Cable Fly Low",
    category: "isolation",
    exerciseId: "cable_fly_low",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Bröstpress med kabel",
    nameEn: "Cable Chest Press",
    category: "strength",
    exerciseId: "cable_chest_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Stående bröstpress i kabelmaskin",
    nameEn: "Cable Standing Chest Press",
    category: "strength",
    exerciseId: "cable_standing_chest_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps", "Core"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },

  // Back
  {
    name: "Sittande rodd med kabelstång",
    nameEn: "Cable Bar Seated Row",
    category: "strength",
    exerciseId: "cable_bar_seated_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Cable Machine", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Latsdrag med kabel brett grepp",
    nameEn: "Cable Lat Pull Down Wide-Grip",
    category: "strength",
    exerciseId: "cable_lat_pull_down_wide_grip",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Sittande rodd med V-handtag i kabel",
    nameEn: "Cable V-Handle Seated Row",
    category: "strength",
    exerciseId: "cable_v_handle_seated_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Cable Machine", "Bench"],
    difficulty: "beginner"
  },
  {
    name: "Raka armdrag med kabelstång",
    nameEn: "Cable Bar Straight Arm Pull Down",
    category: "isolation",
    exerciseId: "cable_bar_straight_arm_pull_down",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Triceps", "Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Latsdrag med kabel och V-handtag (smalt grepp)",
    nameEn: "Cable Lat Pull Down V-Grip (Narrow Hammer)",
    category: "strength",
    exerciseId: "cable_lat_pull_down_v_grip",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Latsdrag med kabel (brett hammargrepp)",
    nameEn: "Cable Lat Pull Down Wide Hammer",
    category: "strength",
    exerciseId: "cable_lat_pull_down_wide_hammer",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabel med omvänd grepp, dra ner",
    nameEn: "Cable Reverse-Grip Pull Down",
    category: "strength",
    exerciseId: "cable_reverse_grip_pull_down",
    primaryMuscles: ["Lats", "Biceps"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enhands lastdrag",
    nameEn: "Cable Lat Pull Down Single-Arm",
    category: "strength",
    exerciseId: "cable_lat_pull_down_single_arm",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Raka armneddrag med kabelrep",
    nameEn: "Cable Rope Straight Arm Pull Down",
    category: "isolation",
    exerciseId: "cable_rope_straight_arm_pull_down",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Triceps", "Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel Hammargrepp Bred Sittande Rodd",
    nameEn: "Cable Hammer-Grip Wide Seated Row",
    category: "strength",
    exerciseId: "cable_hammer_grip_wide_seated_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Enarmad rodd med kabel",
    nameEn: "Cable Single-Arm Row",
    category: "strength",
    exerciseId: "cable_single_arm_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Sittande rodd med breda grepp med kabel",
    nameEn: "Cable Wide-Grip Seated Row",
    category: "strength",
    exerciseId: "cable_wide_grip_seated_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Kabellatsbönsdragning",
    nameEn: "Cable Lat Prayer Pull Down",
    category: "isolation",
    exerciseId: "cable_lat_prayer_pull_down",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Latsdrag bakom nacken",
    nameEn: "Cable Lat Pull Down Behind Head",
    category: "strength",
    exerciseId: "cable_lat_pull_down_behind_head",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Shoulders", "Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "advanced"
  },
  {
    name: "Kabel Lat Pull Down Dubbelt Handtag",
    nameEn: "Cable Lat Pull Down Double-Handle",
    category: "strength",
    exerciseId: "cable_lat_pull_down_double_handle",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },

  // Shoulders
  {
    name: "Facepulls med kabel",
    nameEn: "Cable Face Pull",
    category: "isolation",
    exerciseId: "cable_face_pull",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabel baksida axel flyes",
    nameEn: "Cable Bent Over Rear Delt Fly",
    category: "isolation",
    exerciseId: "cable_single_arm_bent_rear_delt_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enarms sidolyft med kabel",
    nameEn: "Cable Single-Arm Lateral Raise",
    category: "isolation",
    exerciseId: "cable_single_arm_lateral_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel upprätt bakre deltlyft",
    nameEn: "Cable Upright Rear Delt Fly",
    category: "isolation",
    exerciseId: "cable_upright_rear_delt_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Upprättstående rodd med kabel",
    nameEn: "Cable Upright Row",
    category: "strength",
    exerciseId: "cable_upright_row",
    primaryMuscles: ["Shoulders", "Traps"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enarmad fronthöjning med kabel",
    nameEn: "Cable Single-Arm Front Raise",
    category: "isolation",
    exerciseId: "cable_single_arm_front_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel Enarms Upprätt Bakre Delt Flyg",
    nameEn: "Cable Single-Arm Upright Rear Delt Fly",
    category: "isolation",
    exerciseId: "cable_single_arm_upright_rear_delt_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Sidolyft i kryssdrag",
    nameEn: "Cross Cable Lateral Raise",
    category: "isolation",
    exerciseId: "cross_cable_lateral_raise",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enarms omvända flyes i kabelmaskin",
    nameEn: "Cable Single-Arm Bent Over Rear Delt Fly",
    category: "isolation",
    exerciseId: "cable_single_arm_rear_delt_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Utåtrotation i kabel",
    nameEn: "Cable External Shoulder Rotation",
    category: "isolation",
    exerciseId: "cable_external_shoulder_rotation",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Inåtrotation för axel i kabel",
    nameEn: "Cable Internal Shoulder Rotation",
    category: "isolation",
    exerciseId: "cable_internal_shoulder_rotation",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Inåtrotation i kabel (90 grader)",
    nameEn: "Cable Internal Shoulder Rotation at 90 Degrees",
    category: "isolation",
    exerciseId: "cable_internal_shoulder_rotation_90",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Framåtlyft i kabel",
    nameEn: "Cable Front Raise Double Arm",
    category: "isolation",
    exerciseId: "cable_front_raise_double_arm",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },

  // Arms (Biceps & Triceps)
  {
    name: "Kabelstång Triceps Pushdown / Extension",
    nameEn: "Cable Bar Tricep Pushdown / Extension",
    category: "isolation",
    exerciseId: "cable_bar_tricep_pushdown",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Tricepspushdown/-förlängning med kabelrep",
    nameEn: "Cable Rope Tricep Pushdown / Extension",
    category: "isolation",
    exerciseId: "cable_rope_tricep_pushdown",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabelstång Biceps Curl",
    nameEn: "Cable Bar Bicep Curl",
    category: "isolation",
    exerciseId: "cable_bar_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Bicep scurl med kabelrep",
    nameEn: "Cable Rope Bicep Curl",
    category: "isolation",
    exerciseId: "cable_rope_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabelrep Överhuvud Trycepssträckning Hög",
    nameEn: "Cable Rope Overhead Tricep Extension High",
    category: "isolation",
    exerciseId: "cable_rope_oh_tricep_ext_high",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel V-Bar Tricep Pushdown / Extension",
    nameEn: "Cable V-Bar Tricep Pushdown / Extension",
    category: "isolation",
    exerciseId: "cable_v_bar_tricep_pushdown",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabel Enarms Tricep Kickback",
    nameEn: "Cable Single-Arm Tricep Kickback",
    category: "isolation",
    exerciseId: "cable_single_arm_tricep_kickback",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel Superman Bicep Curl",
    nameEn: "Cable Superman Bicep Curl",
    category: "isolation",
    exerciseId: "cable_superman_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "advanced"
  },
  {
    name: "Bicepscurl i kabelmaskin",
    nameEn: "Cable Handles Bicep Curl",
    category: "isolation",
    exerciseId: "cable_handles_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Hög Kabelstång Överhuvud Tricepssträckning",
    nameEn: "Cable Bar Overhead Tricep Extension High",
    category: "isolation",
    exerciseId: "cable_bar_oh_tricep_ext_high",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Tricepsextension över huvudet med stång från låg trissa",
    nameEn: "Cable Bar Overhead Tricep Extension Low",
    category: "isolation",
    exerciseId: "cable_bar_oh_tricep_ext_low",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Korsad tricepsextension i kabel",
    nameEn: "Cable Cross-Body Tricep Extension",
    category: "isolation",
    exerciseId: "cable_cross_body_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enarms tricepssträck över huvudet i kabel",
    nameEn: "Cable Single-Arm Overhead Tricep Extension High",
    category: "isolation",
    exerciseId: "cable_single_arm_oh_tricep_ext_high",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enarms tricepsnedpress med rep",
    nameEn: "Cable Single-Arm Rope Tricep Pushdown / Extension",
    category: "isolation",
    exerciseId: "cable_single_arm_rope_tricep_pushdown",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Tricepsextension över huvudet med V-handtag",
    nameEn: "Cable V-Bar Overhead Tricep Extension High",
    category: "isolation",
    exerciseId: "cable_v_bar_oh_tricep_ext_high",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel V-Bar Overhead Tricep Extension Låg",
    nameEn: "Cable V-Bar Overhead Tricep Extension Low",
    category: "isolation",
    exerciseId: "cable_v_bar_oh_tricep_ext_low",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Korslagd tricepspress",
    nameEn: "Cross Cable Tricep Extension",
    category: "isolation",
    exerciseId: "cross_cable_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enarms tricepsextension över huvudet i kabel",
    nameEn: "Cable Single-Arm Overhead Tricep Extension Low",
    category: "isolation",
    exerciseId: "cable_single_arm_oh_tricep_ext_low",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Sittande bicepscurl i kabelmaskin",
    nameEn: "Cable Seated Bicep Curls",
    category: "isolation",
    exerciseId: "cable_seated_bicep_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Cable Machine", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel Omvänd-Grepp Curlstång",
    nameEn: "Cable Reverse-Grip Curl Bar",
    category: "isolation",
    exerciseId: "cable_reverse_grip_curl_bar",
    primaryMuscles: ["Forearms", "Biceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Underarmscurl med omvänt grepp i kabelmaskin",
    nameEn: "Cable Reverse-Grip Forearm Curl",
    category: "isolation",
    exerciseId: "cable_reverse_grip_forearm_curl",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Underarmscurl med kabel",
    nameEn: "Cable Forearm Curl",
    category: "isolation",
    exerciseId: "cable_forearm_curl",
    primaryMuscles: ["Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },

  // Core
  {
    name: "Cable Chop (hög till låg)",
    nameEn: "Cable Chop (High to Low)",
    category: "core",
    exerciseId: "cable_chop_high_to_low",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel Crunch",
    nameEn: "Cable Crunch",
    category: "core",
    exerciseId: "cable_crunch",
    primaryMuscles: ["Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Sittande rysk twist med kabel",
    nameEn: "Cable Seated Russian Twist",
    category: "core",
    exerciseId: "cable_seated_russian_twist",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine", "Bench"],
    difficulty: "intermediate"
  },
  {
    name: "Kabel Pallof Press",
    nameEn: "Cable Pallof Press",
    category: "core",
    exerciseId: "cable_pallof_press",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabel Pallof Hold",
    nameEn: "Cable Pallof Hold",
    category: "core",
    exerciseId: "cable_pallof_hold",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Cable Chop (låg till hög)",
    nameEn: "Cable Chop (Low to High)",
    category: "core",
    exerciseId: "cable_chop_low_to_high",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Stående bålrotation i kabelmaskin",
    nameEn: "Cable Standing Russian Twist",
    category: "core",
    exerciseId: "cable_standing_russian_twist",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Stående knälyft i kabelmaskin",
    nameEn: "Cable Standing Hip Flexor Raise",
    category: "core",
    exerciseId: "cable_standing_hip_flexor_raise",
    primaryMuscles: ["Hip Flexors", "Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Liggande höftböjarlyft i kabel",
    nameEn: "Cable Laying Hip Flexor Raise",
    category: "core",
    exerciseId: "cable_laying_hip_flexor_raise",
    primaryMuscles: ["Hip Flexors", "Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },

  // Legs & Glutes
  {
    name: "Kabel Glute Kickback",
    nameEn: "Cable Glute Kickback",
    category: "isolation",
    exerciseId: "cable_glute_kickback",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Genomdragning av kabel",
    nameEn: "Cable Pull Through",
    category: "strength",
    exerciseId: "cable_pull_through",
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Stående vadpress i kabel",
    nameEn: "Cable Standing Calf Raise",
    category: "isolation",
    exerciseId: "cable_standing_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Musslan i kabelmaskin",
    nameEn: "Cable Clamshells",
    category: "isolation",
    exerciseId: "cable_clamshell",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabelhöftabduktion",
    nameEn: "Cable Hip Abduction",
    category: "isolation",
    exerciseId: "cable_hip_abduction",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabelhöftadduktion",
    nameEn: "Cable Hip Adduction",
    category: "isolation",
    exerciseId: "cable_hip_adduction",
    primaryMuscles: ["Adductors"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "beginner"
  },
  {
    name: "Kabelrodd med knäböj",
    nameEn: "Cable Row with Squat",
    category: "strength",
    exerciseId: "cable_row_with_squat",
    primaryMuscles: ["Full Body", "Back", "Quads"],
    secondaryMuscles: ["Glutes", "Biceps"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Overhead squat med kabel",
    nameEn: "Cable Overhead Squat",
    category: "strength",
    exerciseId: "cable_overhead_squat",
    primaryMuscles: ["Quads", "Glutes", "Shoulders"],
    secondaryMuscles: ["Core"],
    requiredEquipment: ["Cable Machine"],
    difficulty: "advanced"
  },
  {
    name: "Enbens vadpress i kabel",
    nameEn: "Cable Single-Leg Calf Raise",
    category: "isolation",
    exerciseId: "cable_single_leg_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Omvända tåhävningar i kabel",
    nameEn: "Cable Reverse Calf Raise",
    category: "isolation",
    exerciseId: "cable_reverse_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Cable Machine"],
    difficulty: "intermediate"
  }
];

async function run() {
  console.log(`🚀 Starting Multi-Batch Import (Cables)...`);
  
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
