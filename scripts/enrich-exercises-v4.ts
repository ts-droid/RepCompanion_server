import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq, or, isNull, and } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.ts";
import fs from "fs";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const db = drizzle(pool, { schema });

const v4CatalogPath = "./server/data/exercises.json";

function normalizeName(name: string): string {
  return name.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`🚀 Starting Exercise Enrichment & V4 ID Population (${dryRun ? "DRY RUN" : "LIVE"})`);

  try {
    // 1. Load V4 Catalog
    if (!fs.existsSync(v4CatalogPath)) {
      throw new Error(`Catalog not found at ${v4CatalogPath}`);
    }
    const v4Catalog = JSON.parse(fs.readFileSync(v4CatalogPath, "utf-8"));
    const v4Map = new Map();
    v4Catalog.forEach((ex: any) => {
      v4Map.set(normalizeName(ex.name), ex);
    });

    // 2. Fetch exercises missing ID or metadata
    const dbExercises = await db.select().from(schema.exercises);
    console.log(`Total exercises in DB: ${dbExercises.length}`);

    let updatedCount = 0;
    let enrichedCount = 0;
    let skippedCount = 0;

    for (const ex of dbExercises) {
      let matchedV4 = null;
      const normName = normalizeName(ex.name);
      const normNameEn = ex.nameEn ? normalizeName(ex.nameEn) : null;

      // Match strategy: English name first, then current name
      matchedV4 = (normNameEn ? v4Map.get(normNameEn) : null) || v4Map.get(normName);

      if (matchedV4) {
        // Prepare updates
        const updates: any = {};
        
        // Populate V4 ID if missing
        if (!ex.exerciseId) {
          updates.exerciseId = matchedV4.id;
        }

        // Enrich missing metadata
        if (!ex.primaryMuscles || ex.primaryMuscles.length === 0 || ex.primaryMuscles[0] === "Full Body") {
          updates.primaryMuscles = [matchedV4.primary_muscle_group];
        }
        if (!ex.requiredEquipment || ex.requiredEquipment.length === 0 || ex.requiredEquipment[0] === "Bodyweight" || ex.requiredEquipment[0] === "Other") {
          updates.requiredEquipment = [matchedV4.equipment];
        }
        if (ex.category === "strength" || ex.category === "General" || !ex.category) {
          updates.category = matchedV4.category;
        }
        if (!ex.difficulty || ex.difficulty === "beginner") {
          updates.difficulty = matchedV4.difficulty.toLowerCase();
        }
        if (matchedV4.video_url && !ex.youtubeUrl) {
          updates.youtubeUrl = matchedV4.video_url;
        }

        if (Object.keys(updates).length > 0) {
          console.log(`✨ Enriching: "${ex.name}" [${updates.exerciseId || ex.exerciseId || 'NO ID'}]`);
          if (updates.exerciseId) updatedCount++;
          enrichedCount++;

          if (!dryRun) {
            await db.update(schema.exercises)
              .set(updates)
              .where(eq(schema.exercises.id, ex.id));
          }
        } else {
          skippedCount++;
        }
      } else {
        // Heuristic enrichment for non-catalog items
        const updates: any = {};
        
        const lowerName = ex.name.toLowerCase();
        const lowerNameEn = (ex.nameEn || "").toLowerCase();
        
        // Equipment heuristics
        if (!ex.requiredEquipment || ex.requiredEquipment.length === 0 || ex.requiredEquipment[0] === "Other") {
          if (lowerName.includes("hantel") || lowerNameEn.includes("dumbbell")) updates.requiredEquipment = ["Dumbbell"];
          else if (lowerName.includes("skivstång") || lowerNameEn.includes("barbell")) updates.requiredEquipment = ["Barbell"];
          else if (lowerName.includes("kettlebell")) updates.requiredEquipment = ["Kettlebell"];
          else if (lowerName.includes("cable") || lowerName.includes("kabel")) updates.requiredEquipment = ["Cable"];
        }

        // Category heuristics
        if (ex.category === "strength" || !ex.category) {
          if (lowerName.includes("stretch") || lowerNameEn.includes("stretch")) updates.category = "stretching";
          else if (lowerName.includes("planka") || lowerNameEn.includes("plank")) updates.category = "Core";
        }

        if (Object.keys(updates).length > 0) {
          console.log(`💡 Heuristic enrichment: "${ex.name}"`);
          enrichedCount++;
          if (!dryRun) {
            await db.update(schema.exercises)
              .set(updates)
              .where(eq(schema.exercises.id, ex.id));
          }
        } else {
          skippedCount++;
        }
      }
    }

    console.log(`\nResults:`);
    console.log(`V4 IDs populated: ${updatedCount}`);
    console.log(`Total enriched: ${enrichedCount}`);
    console.log(`Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("❌ Error during enrichment:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
