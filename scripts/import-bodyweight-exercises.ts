import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq, or } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.ts";
import path from "path";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const db = drizzle(pool, { schema });

const exercisesToImport = [
  { name: "Planka med vridning", nameEn: "Plank Twist", category: "Core" },
  { name: "Löparens bakåtspark", nameEn: "Runner's Butt Kick", category: "Cardio" },
  { name: "Sittande hamstringsstretch", nameEn: "Seated Hamstring Stretch", category: "stretching" },
  { name: "Sittande tåhävningar", nameEn: "Seated Toe Touches", category: "stretching" },
  { name: "Axelcirklar", nameEn: "Shoulder Circles", category: "Stability" },
  { name: "Sidoplanka med höftabduktion", nameEn: "Side Plank with Hip Abduction", category: "Core" },
  { name: "Sidoplanka med underarmsräck", nameEn: "Side Plank with Reach Under", category: "Core" },
  { name: "Sidoförflyttning med golvberöring", nameEn: "Side Shuffle with Floor Touch", category: "cardio" },
  { name: "Single-Leg Calf Raise", nameEn: "Single-Leg Calf Raise", category: "Ben" },
  { name: "Stående dynamisk adduktorsträckning", nameEn: "Standing Dynamic Adductor Stretch", category: "stretching" },
  { name: "Sidosträckning", nameEn: "Lat Side Stretch", category: "stretching" },
  { name: "Laterala hopp", nameEn: "Lateral Hops", category: "cardio" },
  { name: "Laterala bensvingar", nameEn: "Lateral Leg Swing", category: "Stability" },
  { name: "Utfall med översträckning", nameEn: "Lunge with Overhead Reach", category: "Lunge" },
  { name: "Liggande hamstringsstretch", nameEn: "Lying Hamstring Stretch", category: "stretching" },
  { name: "Overhead utfall med vridning", nameEn: "Overhead Lunge with Twist", category: "Lunge" },
  { name: "Duva Pose", nameEn: "Pigeon Pose", category: "stretching" },
  { name: "Planka med hopp på armbågarna", nameEn: "Plank Jack on Elbows", category: "Core" },
  { name: "Planka med genomsträckning", nameEn: "Plank Reach Through", category: "Core" },
  { name: "Planka till Nedåtgående Hund", nameEn: "Plank to Downward Facing Dog", category: "Stability" },
  { name: "Bröststretch i dörröppning", nameEn: "Doorway Chest Stretch", category: "stretching" },
  { name: "Nedåtgående hund", nameEn: "Downward Facing Dog", category: "stretching" },
  { name: "Framåt och bakåt bensving", nameEn: "Forward and Backward Leg Swing", category: "Stability" },
  { name: "Framåt hopp", nameEn: "Forward Hops", category: "cardio" },
  { name: "Halvknästående Höftböjarstretch", nameEn: "Half Kneeling Hip Flexor Stretch", category: "stretching" },
  { name: "Halvknästående Psoas-stretch", nameEn: "Half Kneeling Psoas Stretch", category: "stretching" },
  { name: "Hamstringsvep", nameEn: "Hamstring Sweeps", category: "stretching" },
  { name: "Hälgång", nameEn: "Heel Walk", category: "Stability" },
  { name: "Höftcirklar", nameEn: "Hip Circles", category: "Stability" },
  { name: "Knäcirklar", nameEn: "Knee Circles", category: "Stability" },
  { name: "Sidoblandning (lateral blandning)", nameEn: "Side (Lateral) Shuffle", category: "cardio" },
  { name: "Fotledscirklar", nameEn: "Ankle Circles", category: "Stability" },
  { name: "Armcirklar", nameEn: "Arm Circles", category: "Stability" },
  { name: "Kroppsvikt djup knäböj", nameEn: "Bodyweight Deep Squat", category: "Squat" },
  { name: "Längdhopp", nameEn: "Broad Jump", category: "plyometrics" },
  { name: "Fjärilsstretch", nameEn: "Butterfly Stretch", category: "stretching" },
  { name: "Katt-ko ställning", nameEn: "Cat-Cow Pose", category: "stretching" },
  { name: "Barnets position", nameEn: "Child's Pose", category: "stretching" },
  { name: "Korsa kroppen armsving", nameEn: "Cross Body Arm Swing", category: "Stability" },
  { name: "Djup knäböjstretch", nameEn: "Deep Squat Stretch", category: "stretching" },
  { name: "Handfrigörande armhävning", nameEn: "Hand Release Push-Up", category: "Upper Body Push" },
  { name: "planka promenad ut", nameEn: "Plank Walk Out", category: "Core" },
  { name: "Björnplanka", nameEn: "Bear Plank", category: "Core" },
  { name: "Hollow Hold", nameEn: "Hollow Hold", category: "Core" },
  { name: "Sidoplanka höftdips", nameEn: "Side Plank Hip Dips", category: "Core" },
  { name: "Kosacksquat", nameEn: "Cossack Squat", category: "Stability" },
  { name: "Archer Push-Up", nameEn: "Archer Push-Up", category: "Upper Body Push" },
  { name: "Klapp-armhävning", nameEn: "Clap Push-Up", category: "plyometrics" },
  { name: "L-Sitt", nameEn: "L-Sit", category: "Core" },
  { name: "Burpee breda hopp", nameEn: "Burpee Broad Jumps", category: "cardio" },
];

const suggestId = (name: string) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

async function seed() {
  console.log("🌱 Starting Bodyweight & Stretching Exercise Import...");
  
  let inserted = 0;
  let skipped = 0;

  for (const ex of exercisesToImport) {
    try {
      // Check for existing by nameEn or name
      const [existing] = await db.select().from(schema.exercises).where(
        or(
          eq(schema.exercises.nameEn, ex.nameEn),
          eq(schema.exercises.name, ex.nameEn),
          eq(schema.exercises.name, ex.name)
        )
      );

      if (existing) {
        console.log(`⏩ Skipping duplicate: ${ex.nameEn}`);
        skipped++;
        continue;
      }

      await db.insert(schema.exercises).values({
        exerciseId: suggestId(ex.nameEn),
        name: ex.name,
        nameEn: ex.nameEn,
        category: ex.category,
        difficulty: "beginner",
        primaryMuscles: ["Full Body"], // Default since we don't have detailed muscle data for all
        requiredEquipment: ["Bodyweight"],
        isCompound: ex.category === "Squat" || ex.category === "Lunge" || ex.category === "Upper Body Push",
      });
      
      console.log(`✅ Inserted: ${ex.nameEn}`);
      inserted++;
    } catch (e: any) {
      console.error(`❌ Error with ${ex.nameEn}: ${e.message}`);
    }
  }

  console.log(`\n✨ Finished!`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  
  await pool.end();
}

seed().catch(console.error);
