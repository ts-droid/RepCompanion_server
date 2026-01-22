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

const equipmentToAdd = [
  { name: "Latsdragmaskin", nameEn: "Machine Lat Pull Down", equipmentKey: "machine_lat_pulldown", category: "Strength", type: "Machine" },
  { name: "Benpressmaskin", nameEn: "Leg Press Machine", equipmentKey: "machine_leg_press", category: "Strength", type: "Machine" },
  { name: "Roddmaskin (Styrka)", nameEn: "Machine Row", equipmentKey: "machine_row", category: "Strength", type: "Machine" },
  { name: "Bröstpressmaskin", nameEn: "Chest Press Machine", equipmentKey: "machine_chest_press", category: "Strength", type: "Machine" },
  { name: "Hack Squat-maskin", nameEn: "Hack Squat Machine", equipmentKey: "machine_hack_squat", category: "Strength", type: "Machine" },
  { name: "Pec Dec / Maskinflugor", nameEn: "Pec Dec Machine", equipmentKey: "machine_pec_dec", category: "Strength", type: "Machine" },
  { name: "Axelpressmaskin", nameEn: "Shoulder Press Machine", equipmentKey: "machine_shoulder_press", category: "Strength", type: "Machine" },
  { name: "Tricepspressmaskin", nameEn: "Tricep Press Machine", equipmentKey: "machine_tricep_press", category: "Strength", type: "Machine" },
  { name: "Magmaskin", nameEn: "Ab Crunch Machine", equipmentKey: "machine_ab_crunch", category: "Strength", type: "Machine" },
  { name: "Scottcurlmaskin", nameEn: "Preacher Curl Machine", equipmentKey: "machine_preacher_curl", category: "Strength", type: "Machine" },
  { name: "Sidolyftsmaskin", nameEn: "Lateral Raise Machine", equipmentKey: "machine_lateral_raise", category: "Strength", type: "Machine" },
  { name: "Ryggresningsmaskin", nameEn: "Back Extension Machine", equipmentKey: "machine_back_extension", category: "Strength", type: "Machine" },
  { name: "Vadpressmaskin", nameEn: "Calf Raise Machine", equipmentKey: "machine_calf_raise", category: "Strength", type: "Machine" },
  { name: "T-Bar-radmaskin", nameEn: "T-Bar Row Machine", equipmentKey: "machine_t_bar_row", category: "Strength", type: "Machine" },
  { name: "Bensparkmaskin", nameEn: "Leg Extension Machine", equipmentKey: "machine_leg_extension", category: "Strength", type: "Machine" },
  { name: "Lårcurlmaskin", nameEn: "Hamstring Curl Machine", equipmentKey: "machine_hamstring_curl", category: "Strength", type: "Machine" },
  { name: "Dipsmaskin med assistans", nameEn: "Assisted Dip Machine", equipmentKey: "machine_assisted_dip", category: "Strength", type: "Machine" },
  { name: "Nedåtlutande bröstpressmaskin", nameEn: "Decline Bench Press Machine", equipmentKey: "machine_decline_press", category: "Strength", type: "Machine" },
  { name: "Höftabduktionsmaskin", nameEn: "Hip Abduction Machine", equipmentKey: "machine_hip_abduction", category: "Strength", type: "Machine" },
  { name: "Höftadduktionsmaskin", nameEn: "Hip Adduction Machine", equipmentKey: "machine_hip_adduction", category: "Strength", type: "Machine" },
  { name: "Pendelknäböjsmaskin", nameEn: "Pendulum Squat Machine", equipmentKey: "machine_pendulum_squat", category: "Strength", type: "Machine" },
  { name: "Bältesknäböjsmaskin", nameEn: "Belt Squat Machine", equipmentKey: "machine_belt_squat", category: "Strength", type: "Machine" },
  { name: "GHR-maskin", nameEn: "Glute Ham Raise Machine", equipmentKey: "machine_glute_ham_raise", category: "Strength", type: "Machine" },
  { name: "Bålrotationsmaskin", nameEn: "Torso Rotation Machine", equipmentKey: "machine_torso_rotation", category: "Strength", type: "Machine" },
  { name: "Ab Coaster", nameEn: "Ab Coaster", equipmentKey: "ab_coaster", category: "Strength", type: "Machine" },
  { name: "Elliptisk maskin", nameEn: "Elliptical", equipmentKey: "elliptical", category: "Cardio", type: "Cardio" },
  { name: "Trappmaskin", nameEn: "Stair Climber", equipmentKey: "stair_climber", category: "Cardio", type: "Cardio" },
  { name: "Jacob's Ladder", nameEn: "Jacob's Ladder", equipmentKey: "jacobs_ladder", category: "Cardio", type: "Cardio" }
];

const exercises = [
  // Upper Body - Pull
  {
    name: "Maskin Lat Drag Bred-Grepp",
    nameEn: "Machine Lat Pull Down Wide-Grip",
    category: "strength",
    exerciseId: "machine_lat_pull_down_wide_grip",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Machine Lat Pull Down"],
    difficulty: "beginner"
  },
  {
    name: "Maskinrodd",
    nameEn: "Machine Row",
    category: "strength",
    exerciseId: "machine_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Machine Row"],
    difficulty: "beginner"
  },
  {
    name: "Maskinhammargrepp Rodd",
    nameEn: "Machine Hammer-Grip Row",
    category: "strength",
    exerciseId: "machine_hammer_grip_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Machine Row"],
    difficulty: "beginner"
  },
  {
    name: "Maskinhög rad (MTS-rad)",
    nameEn: "Machine High Row (MTS Row)",
    category: "strength",
    exerciseId: "machine_high_row",
    primaryMuscles: ["Back", "Traps"],
    secondaryMuscles: ["Biceps", "Shoulders"],
    requiredEquipment: ["Machine Row"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin T-Bar Rodd",
    nameEn: "Machine T-Bar Row",
    category: "strength",
    exerciseId: "machine_t_bar_row_ex",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps", "Lower Back"],
    requiredEquipment: ["T-Bar Row Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Latsdrag (Maskin)",
    nameEn: "Machine Front Pull Down",
    category: "strength",
    exerciseId: "machine_lat_pull_down_front",
    primaryMuscles: ["Lats", "Back"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Machine Lat Pull Down"],
    difficulty: "beginner"
  },
  {
    name: "Maskinrodd brett grepp",
    nameEn: "Machine Wide-Grip Row",
    category: "strength",
    exerciseId: "machine_wide_grip_row",
    primaryMuscles: ["Back", "Rear Delts"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["Machine Row"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin-T-stångsrad (45 grader)",
    nameEn: "Machine T-Bar Row (45 Deg)",
    category: "strength",
    exerciseId: "machine_t_bar_row_45",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["T-Bar Row Machine"],
    difficulty: "intermediate"
  },
  {
    name: "T-bar rodd i maskin",
    nameEn: "Machine Hammer-Grip T-Bar Row",
    category: "strength",
    exerciseId: "machine_hammer_grip_t_bar_row",
    primaryMuscles: ["Back", "Lats"],
    secondaryMuscles: ["Biceps"],
    requiredEquipment: ["T-Bar Row Machine"],
    difficulty: "intermediate"
  },

  // Upper Body - Push (Chest/Shoulders)
  {
    name: "Maskin Sittande Bröstpress",
    nameEn: "Machine Seated Chest Press",
    category: "strength",
    exerciseId: "machine_seated_chest_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Chest Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Machine Fly (Pec dec)",
    nameEn: "Machine Fly (Pec Dec)",
    category: "isolation",
    exerciseId: "machine_pec_dec_fly",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Pec Dec Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskinhammargrepp sittande bröstpress",
    nameEn: "Machine Hammer-Grip Seated Chest Press",
    category: "strength",
    exerciseId: "machine_hammer_grip_chest_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Chest Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskinhammargrepp axelpress",
    nameEn: "Machine Hammer-Grip Shoulder Press",
    category: "strength",
    exerciseId: "machine_hammer_grip_shoulder_press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Shoulder Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Bänkpressmaskin med lutning",
    nameEn: "Machine Incline Bench Press",
    category: "strength",
    exerciseId: "machine_incline_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
    requiredEquipment: ["Chest Press Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin Axelpress",
    nameEn: "Machine Shoulder Press",
    category: "strength",
    exerciseId: "machine_shoulder_press_ex",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    requiredEquipment: ["Shoulder Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Lateral Raise",
    nameEn: "Machine Lateral Raise",
    category: "isolation",
    exerciseId: "machine_lateral_raise_ex",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: [],
    requiredEquipment: ["Lateral Raise Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin bakre delt (omvänd) Fly",
    nameEn: "Machine Rear Delt (Reverse) Fly",
    category: "isolation",
    exerciseId: "machine_rear_delt_fly",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Back"],
    requiredEquipment: ["Pec Dec Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin assisterade dips",
    nameEn: "Machine Assisted Dip",
    category: "strength",
    exerciseId: "machine_assisted_dip_ex",
    primaryMuscles: ["Triceps", "Chest"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Assisted Dip Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Nedåtgående Bänkpress",
    nameEn: "Machine Decline Bench Press",
    category: "strength",
    exerciseId: "machine_decline_bench_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Decline Bench Press Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Bänkpress i maskin",
    nameEn: "Machine Supine Bench Press",
    category: "strength",
    exerciseId: "machine_supine_bench_press_ex",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Chest Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Supine press maskin",
    nameEn: "Machine Supine Press",
    category: "strength",
    exerciseId: "machine_supine_press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    requiredEquipment: ["Chest Press Machine"],
    difficulty: "beginner"
  },

  // Arms
  {
    name: "Maskin Tricep Press",
    nameEn: "Machine Tricep Press",
    category: "isolation",
    exerciseId: "machine_tricep_press_ex",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Tricep Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Machine Alternativ Arm Curl",
    nameEn: "Machine Alternate Arm Curl",
    category: "isolation",
    exerciseId: "machine_alternate_arm_curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Preacher Curl Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin för predikantcurl",
    nameEn: "Machine Preacher Curl",
    category: "isolation",
    exerciseId: "machine_preacher_curl_ex",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Preacher Curl Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Triceps Extension",
    nameEn: "Machine Tricep Extension",
    category: "isolation",
    exerciseId: "machine_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    requiredEquipment: ["Tricep Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Hammer-Grip Preacher Curl",
    nameEn: "Machine Hammer-Grip Preacher Curl",
    category: "isolation",
    exerciseId: "machine_hammer_grip_preacher_curl",
    primaryMuscles: ["Biceps", "Forearms"],
    secondaryMuscles: [],
    requiredEquipment: ["Preacher Curl Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin tricepsförlängning över huvudet",
    nameEn: "Machine Overhead Tricep Extension",
    category: "isolation",
    exerciseId: "machine_overhead_tricep_extension",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    requiredEquipment: ["Tricep Press Machine"],
    difficulty: "intermediate"
  },

  // Lower Body
  {
    name: "Benpressmaskin (Rörlig stol)",
    nameEn: "Machine Leg Press (Moving Chair)",
    category: "strength",
    exerciseId: "machine_leg_press_moving_chair",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
    requiredEquipment: ["Leg Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Hack Squat (Framåtvänd)",
    nameEn: "Hack Squat (Facing Out)",
    category: "strength",
    exerciseId: "hack_squat_facing_out",
    primaryMuscles: ["Quads"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    requiredEquipment: ["Hack Squat Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin Hip Thrust (Glute Bridge)",
    nameEn: "Machine Hip Thrust (Glute Bridge)",
    category: "strength",
    exerciseId: "machine_hip_thrust_glute_bridge",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    requiredEquipment: ["Leg Press Machine"], // Often done on leg press or specialized machine
    difficulty: "intermediate"
  },
  {
    name: "Maskin Sittande Vadpress",
    nameEn: "Machine Seated Calf Raise",
    category: "isolation",
    exerciseId: "machine_seated_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Calf Raise Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Stående Tåhävning",
    nameEn: "Machine Standing Calf Raise",
    category: "isolation",
    exerciseId: "machine_standing_calf_raise_ex",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Calf Raise Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin benspark",
    nameEn: "Machine Leg Extension",
    category: "isolation",
    exerciseId: "machine_leg_extension_ex",
    primaryMuscles: ["Quads"],
    secondaryMuscles: [],
    requiredEquipment: ["Leg Extension Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin benpress",
    nameEn: "Machine Leg Press",
    category: "strength",
    exerciseId: "machine_leg_press_ex",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
    requiredEquipment: ["Leg Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Ben / Hamstring Curl Sittande",
    nameEn: "Leg / Hamstring Curl Seated",
    category: "isolation",
    exerciseId: "seated_hamstring_curl_machine",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    requiredEquipment: ["Hamstring Curl Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskinliggande bencurl",
    nameEn: "Machine Leg Curl Prone",
    category: "isolation",
    exerciseId: "prone_hamstring_curl_machine",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    requiredEquipment: ["Hamstring Curl Machine"],
    difficulty: "beginner"
  },
  {
    name: "Benpress Vadpress",
    nameEn: "Leg Press Calf Raise",
    category: "isolation",
    exerciseId: "leg_press_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Leg Press Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Höftabduktion",
    nameEn: "Machine Hip Abduction",
    category: "isolation",
    exerciseId: "machine_hip_abduction_ex",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: [],
    requiredEquipment: ["Hip Abduction Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Höftadduktion",
    nameEn: "Machine Hip Adduction",
    category: "isolation",
    exerciseId: "machine_hip_adduction_ex",
    primaryMuscles: ["Adductors"],
    secondaryMuscles: [],
    requiredEquipment: ["Hip Adduction Machine"],
    difficulty: "beginner"
  },
  {
    name: "Maskin Pendel Knäböj",
    nameEn: "Machine Pendulum Squat",
    category: "strength",
    exerciseId: "machine_pendulum_squat_ex",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Pendulum Squat Machine"],
    difficulty: "advanced"
  },
  {
    name: "Enbent lårcurl i maskin",
    nameEn: "Machine Single-Leg Leg Curl",
    category: "isolation",
    exerciseId: "machine_single_leg_leg_curl",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: [],
    requiredEquipment: ["Hamstring Curl Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Enbens benpress",
    nameEn: "Machine Single-Leg Leg Press",
    category: "strength",
    exerciseId: "machine_single_leg_leg_press",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Leg Press Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin V Knäböj",
    nameEn: "Machine V Squat",
    category: "strength",
    exerciseId: "machine_v_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Lower Back"],
    requiredEquipment: ["Hack Squat Machine"], // Often the same machine
    difficulty: "advanced"
  },
  {
    name: "Vadpress i hacklift",
    nameEn: "Hack Squat Calf Raise",
    category: "isolation",
    exerciseId: "hack_squat_calf_raise_ex",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Hack Squat Machine"],
    difficulty: "beginner"
  },
  {
    name: "Gummi bandsassisterad Glute Ham Raise",
    nameEn: "Resistance Band Assisted Glute Ham Raise",
    category: "strength",
    exerciseId: "band_assisted_ghr",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back"],
    requiredEquipment: ["Glute Ham Raise Machine", "Gummiband (Långa)"],
    difficulty: "advanced"
  },
  {
    name: "Hack squat med gummiband",
    nameEn: "Resistance Band Machine Hack Squat",
    category: "strength",
    exerciseId: "band_hack_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Hack Squat Machine", "Gummiband (Långa)"],
    difficulty: "advanced"
  },
  {
    name: "Maskin bältesknäböj",
    nameEn: "Machine Belted Squat",
    category: "strength",
    exerciseId: "machine_belted_squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Lower Back", "Hamstrings"],
    requiredEquipment: ["Belt Squat Machine"],
    difficulty: "advanced"
  },
  {
    name: "Maskin Glute Kickback",
    nameEn: "Machine Glute Kickback",
    category: "isolation",
    exerciseId: "machine_glute_kickback",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Hip Abduction Machine"], // Or specialized
    difficulty: "beginner"
  },
  {
    name: "Sittande enbensvadpress",
    nameEn: "Machine Seated Single-Leg Calf Raise",
    category: "isolation",
    exerciseId: "machine_seated_single_leg_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Calf Raise Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin Enbens Bensträckning",
    nameEn: "Machine Single-Leg Leg Extension",
    category: "isolation",
    exerciseId: "machine_single_leg_leg_extension",
    primaryMuscles: ["Quads"],
    secondaryMuscles: [],
    requiredEquipment: ["Leg Extension Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Stående enbensvadpress i maskin",
    nameEn: "Machine Standing Single-Leg Calf Raise",
    category: "isolation",
    exerciseId: "machine_standing_single_leg_calf_raise",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    requiredEquipment: ["Calf Raise Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin V Knäböj (Vänd inåt / Bakåt)",
    nameEn: "Machine V Squat (Facing In / Reverse)",
    category: "strength",
    exerciseId: "machine_v_squat_reverse",
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Quads", "Lower Back"],
    requiredEquipment: ["Hack Squat Machine"],
    difficulty: "advanced"
  },
  {
    name: "Enbens Hack Squat",
    nameEn: "Hack Squat Single-Leg",
    category: "strength",
    exerciseId: "hack_squat_single_leg",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Hack Squat Machine"],
    difficulty: "advanced"
  },

  // Core
  {
    name: "Maskin Ab Crunch",
    nameEn: "Machine Ab Crunch",
    category: "core",
    exerciseId: "machine_ab_crunch_ex",
    primaryMuscles: ["Core"],
    secondaryMuscles: [],
    requiredEquipment: ["Ab Crunch Machine"],
    difficulty: "beginner"
  },
  {
    name: "Ryggförlängning sittande i maskin",
    nameEn: "Machine Seated Back Extension",
    category: "strength",
    exerciseId: "machine_seated_back_extension",
    primaryMuscles: ["Lower Back"],
    secondaryMuscles: ["Glutes"],
    requiredEquipment: ["Back Extension Machine"],
    difficulty: "beginner"
  },
  {
    name: "Omvänd ryggresning i maskin",
    nameEn: "Machine Reverse Hyperextension",
    category: "strength",
    exerciseId: "machine_reverse_hyperextension",
    primaryMuscles: ["Lower Back", "Glutes"],
    secondaryMuscles: ["Hamstrings"],
    requiredEquipment: ["Back Extension Machine"],
    difficulty: "intermediate"
  },
  {
    name: "Maskin Shrug",
    nameEn: "Machine Shrug",
    category: "isolation",
    exerciseId: "machine_shrug_ex",
    primaryMuscles: ["Traps"],
    secondaryMuscles: ["Forearms"],
    requiredEquipment: ["Shoulder Press Machine"], // Or specialized
    difficulty: "beginner"
  },
  {
    name: "Maskin Torso Rotation",
    nameEn: "Machine Torso Rotation",
    category: "core",
    exerciseId: "machine_torso_rotation_ex",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: [],
    requiredEquipment: ["Torso Rotation Machine"],
    difficulty: "beginner"
  },
  {
    name: "Sittande bålrotation",
    nameEn: "Seated Trunk Rotation",
    category: "core",
    exerciseId: "machine_seated_trunk_rotation",
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: [],
    requiredEquipment: ["Torso Rotation Machine"],
    difficulty: "beginner"
  },
  {
    name: "Ab Coaster",
    nameEn: "Ab Coaster",
    category: "core",
    exerciseId: "ab_coaster_ex",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip Flexors"],
    requiredEquipment: ["Ab Coaster"],
    difficulty: "intermediate"
  },

  // Cardio
  {
    name: "Elliptisk",
    nameEn: "Elliptical",
    category: "cardio",
    exerciseId: "elliptical_cardio",
    primaryMuscles: ["Cardio"],
    secondaryMuscles: ["Full Body"],
    requiredEquipment: ["Elliptisk maskin"],
    difficulty: "beginner"
  },
  {
    name: "Trappklättrare",
    nameEn: "Stair Climber",
    category: "cardio",
    exerciseId: "stair_climber_cardio",
    primaryMuscles: ["Cardio", "Quads", "Glutes"],
    secondaryMuscles: ["Calves"],
    requiredEquipment: ["Trappmaskin"],
    difficulty: "beginner"
  },
  {
    name: "Roddmaskin",
    nameEn: "Rowing Machine",
    category: "cardio",
    exerciseId: "rowing_machine_cardio",
    primaryMuscles: ["Cardio", "Back", "Legs"],
    secondaryMuscles: ["Biceps", "Core"],
    requiredEquipment: ["Roddmaskin"],
    difficulty: "beginner"
  },
  {
    name: "Assaultcykel",
    nameEn: "Assault Bike",
    category: "cardio",
    exerciseId: "assault_bike_cardio",
    primaryMuscles: ["Cardio", "Full Body"],
    secondaryMuscles: ["Quads", "Shoulders"],
    requiredEquipment: ["Assault Bike"],
    difficulty: "intermediate"
  },
  {
    name: "Klättring i Jacob's Ladder",
    nameEn: "Jacob's Ladder Climb",
    category: "cardio",
    exerciseId: "jacobs_ladder_climb",
    primaryMuscles: ["Cardio", "Core", "Quads"],
    secondaryMuscles: ["Shoulders", "Back"],
    requiredEquipment: ["Jacob's Ladder"],
    difficulty: "advanced"
  }
];

async function run() {
  console.log(`🚀 Starting Multi-Batch Import (Batch 6: Machines & Cardio)...`);
  
  // 1. Update/Ensure Equipment
  console.log(`🛠 Checking Equipment Catalog...`);
  for (const eqData of equipmentToAdd) {
    try {
      const existing = await db.select().from(schema.equipmentCatalog).where(
        or(
          eq(schema.equipmentCatalog.nameEn, eqData.nameEn),
          eq(schema.equipmentCatalog.equipmentKey, eqData.equipmentKey)
        )
      ).limit(1);

      if (existing.length === 0) {
        await db.insert(schema.equipmentCatalog).values(eqData);
        console.log(`✅ Added Equipment: ${eqData.nameEn}`);
      } else {
        console.log(`⏩ Equipment Already Exists: ${eqData.nameEn}`);
      }
    } catch (e) {
      console.error(`❌ Error with equipment ${eqData.nameEn}:`, e);
    }
  }

  // 2. Import Exercises
  console.log(`\n🏋️ Importing Exercises...`);
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
        console.log(`⏩ Skipping Existing Exercise: ${ex.nameEn}`);
        skipped++;
        continue;
      }

      await db.insert(schema.exercises).values(ex);
      console.log(`✅ Inserted Exercise: ${ex.nameEn}`);
      inserted++;
    } catch (e) {
      console.error(`❌ Error inserting exercise ${ex.nameEn}:`, e);
    }
  }

  console.log(`\n✨ Finished!`);
  console.log(`Inserted Exercises: ${inserted}`);
  console.log(`Skipped Exercises: ${skipped}`);
  
  await pool.end();
  process.exit(0);
}

run();
