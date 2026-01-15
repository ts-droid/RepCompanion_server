import { 
  type User, 
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type UpdateUserProfile,
  type Gym,
  type InsertGym,
  type UserEquipment,
  type InsertUserEquipment,
  type GymProgram,
  type InsertGymProgram,
  type WorkoutSession,
  type InsertWorkoutSession,
  type ExerciseLog,
  type InsertExerciseLog,
  type ProgramTemplate,
  type InsertProgramTemplate,
  type ProgramTemplateExercise,
  type InsertProgramTemplateExercise,
  type ExerciseStats,
  type InsertExerciseStats,
  type PromoContent,
  type InsertPromoContent,
  type PromoImpression,
  type InsertPromoImpression,
  type AffiliateClick,
  type InsertAffiliateClick,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type UpdateNotificationPreferences,
  type UserSubscription,
  type InsertUserSubscription,
  type TrainingTip,
  type InsertTrainingTip,
  type ProfileTrainingTip,
  users,
  userProfiles,
  gyms,
  userEquipment,
  gymPrograms,
  workoutSessions,
  exerciseLogs,
  programTemplates,
  programTemplateExercises,
  exerciseStats,
  promoContent,
  promoImpressions,
  affiliateClicks,
  notificationPreferences,
  userSubscriptions,
  trainingTips,
  profileTrainingTips,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, sql, inArray, isNull, isNotNull } from "drizzle-orm";
import { matchExercise } from "./exercise-matcher";

export interface IStorage {
  // User operations (required by Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, data: UpdateUserProfile): Promise<UserProfile>;
  
  // Gym operations
  createGym(gym: InsertGym): Promise<Gym>;
  getGym(id: string): Promise<Gym | undefined>;
  getUserGyms(userId: string): Promise<Gym[]>;
  getSelectedGym(userId: string): Promise<Gym | undefined>;
  setSelectedGym(userId: string, gymId: string): Promise<void>;
  updateGym(id: string, userId: string, data: { name: string; location?: string; latitude?: string | null; longitude?: string | null; isPublic?: boolean }): Promise<Gym>;
  updateGym(id: string, userId: string, data: { name: string; location?: string; latitude?: string | null; longitude?: string | null; isPublic?: boolean }): Promise<Gym>;
  deleteGym(id: string, userId: string): Promise<void>;
  findNearbyGyms(lat: number, lng: number, radiusKm: number): Promise<Array<Gym & { distance: number }>>;

  
  // Equipment operations
  getUserEquipment(userId: string): Promise<UserEquipment[]>;
  getGymEquipment(gymId: string): Promise<UserEquipment[]>;
  upsertEquipment(equipment: InsertUserEquipment): Promise<UserEquipment>;
  deleteEquipment(id: string): Promise<void>;
  getEquipmentCatalog(): Promise<any[]>;
  
  // Gym program operations
  createGymProgram(program: InsertGymProgram): Promise<GymProgram>;
  getGymProgram(userId: string, gymId: string): Promise<GymProgram | undefined>;
  upsertGymProgram(program: InsertGymProgram): Promise<GymProgram>;
  getUserGymPrograms(userId: string): Promise<GymProgram[]>;
  clearUserGymPrograms(userId: string): Promise<void>;
  
  // Workout session operations
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  getWorkoutSession(id: string): Promise<WorkoutSession | undefined>;
  completeWorkoutSession(id: string, movergyScore?: number): Promise<void>;
  cancelWorkoutSession(id: string): Promise<void>;
  getUserWorkoutSessions(userId: string, limit?: number): Promise<WorkoutSession[]>;
  getActiveWorkoutSession(userId: string): Promise<WorkoutSession | undefined>;
  updateSessionSnapshot(id: string, snapshotData: { skippedExercises: number[] }): Promise<void>;
  
  // Exercise log operations
  getExerciseLog(id: string): Promise<ExerciseLog | undefined>;
  createExerciseLog(log: InsertExerciseLog): Promise<ExerciseLog>;
  updateExerciseLog(id: string, data: Partial<InsertExerciseLog>): Promise<void>;
  bulkUpdateExerciseLogs(sessionId: string, exerciseOrderIndex: number, data: { weight?: number; reps?: number }): Promise<void>;
  getSessionExerciseLogs(sessionId: string): Promise<ExerciseLog[]>;
  
  // Promo operations
  getPromo(id: string): Promise<PromoContent | undefined>;
  getActivePromosByPlacement(placement: string): Promise<PromoContent[]>;
  createPromo(promo: InsertPromoContent): Promise<PromoContent>;
  trackPromoImpression(impression: InsertPromoImpression): Promise<void>;
  getUserRecentImpressions(userId: string, promoId: string, hours: number): Promise<PromoImpression[]>;
  trackAffiliateClick(click: InsertAffiliateClick): Promise<void>;
  
  // Notification preferences operations
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(prefs: InsertNotificationPreferences): Promise<NotificationPreferences>;
  updateNotificationPreferences(userId: string, data: UpdateNotificationPreferences): Promise<void>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  upsertUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  
  // Training tips operations
  createTrainingTip(tip: InsertTrainingTip): Promise<TrainingTip>;
  getTrainingTips(filters?: { category?: string; workoutType?: string; isActive?: boolean }): Promise<TrainingTip[]>;
  getTrainingTip(id: string): Promise<TrainingTip | undefined>;
  
  // Profile training tips operations
  getPersonalizedTips(userId: string, limit?: number): Promise<ProfileTrainingTip[]>;
  getProfileTipsByCategory(userId: string, category: string, limit?: number): Promise<ProfileTrainingTip[]>;
  
  // Exercise catalog operations
  getExerciseByName(name: string): Promise<{ id: string; name: string; nameEn: string | null; youtubeUrl: string | null; videoType: string | null } | undefined>;
  getExercisesByNames(names: string[]): Promise<{ id: string; name: string; nameEn: string | null; youtubeUrl: string | null; videoType: string | null }[]>;
  
  // Program template operations
  getUserProgramTemplates(userId: string): Promise<ProgramTemplate[]>;
  getProgramTemplate(id: string): Promise<ProgramTemplate | undefined>;
  getTemplateExercises(templateId: string): Promise<ProgramTemplateExercise[]>;
  updateTemplateExercises(templateId: string, exercises: Partial<ProgramTemplateExercise>[]): Promise<void>;
  updateProgramTemplate(id: string, data: { dayOfWeek?: number }): Promise<ProgramTemplate>;
  getNextTemplate(userId: string): Promise<{ template: ProgramTemplate; exercises: ProgramTemplateExercise[] } | null>;
  createProgramTemplatesFromAI(userId: string, aiProgramData: any): Promise<void>;
  createProgramTemplatesFromDeepSeek(userId: string, program: import("./ai-service").DeepSeekWorkoutProgram): Promise<void>;
  clearUserProgramTemplates(userId: string): Promise<void>;
  updateLastCompletedTemplate(userId: string, templateId: string): Promise<void>;
  getTemplatesWithMetadata(userId: string): Promise<Array<{ template: ProgramTemplate; exerciseCount: number; exercises: ProgramTemplateExercise[]; isNext: boolean }>>;

  incrementProgramGeneration(userId: string): Promise<void>;
  
  // Admin operations
  setUserAdminStatus(userId: string, isAdmin: boolean): Promise<void>;
  
  // V4 specific operations
  getUserTimeModel(userId: string): Promise<import("@shared/schema").UserTimeModel | undefined>;
  getExercisesByIds(ids: string[]): Promise<any[]>;
  getCandidatePools(userId: string, gymId?: string): Promise<import("@shared/schema").CandidatePool[]>;
}

export class DatabaseStorage implements IStorage {
  // ========== User operations ==========
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // ========== User profile operations ==========
  
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    
    // Auto-select newest gym if no gym is selected but user has gyms
    if (profile && !profile.selectedGymId) {
      const userGyms = await this.getUserGyms(userId);
      if (userGyms.length > 0) {
        // Select the most recently created gym
        const newestGym = userGyms[0]; // Already ordered by createdAt DESC
        try {
          await this.setSelectedGym(userId, newestGym.id);
          // Refresh profile to include the updated selectedGymId
          const [updatedProfile] = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));
          return updatedProfile;
        } catch (error) {
          console.error("[STORAGE] Failed to auto-select gym:", error);
          // Return original profile even if auto-selection fails
          return profile;
        }
      }
    }
    
    return profile;
  }

  async upsertUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  async updateUserProfile(userId: string, data: UpdateUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    return profile;
  }

  async incrementPassNumber(userId: string): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);
    const templates = await this.getUserProgramTemplates(userId);
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    // If no templates exist (e.g., during regeneration), keep at 1
    if (templates.length === 0) {
      return this.updateUserProfile(userId, { currentPassNumber: 1 });
    }
    
    const currentPass = profile.currentPassNumber || 1;
    const totalPasses = templates.length;
    
    // Increment and wrap around (1→2→3→4→1)
    const nextPass = (currentPass % totalPasses) + 1;
    
    return this.updateUserProfile(userId, { currentPassNumber: nextPass });
  }

  // ========== Gym operations ==========
  
  async createGym(gymData: InsertGym): Promise<Gym> {
    const [gym] = await db
      .insert(gyms)
      .values(gymData)
      .returning();
    return gym;
  }

  async getGym(id: string): Promise<Gym | undefined> {
    const [gym] = await db
      .select()
      .from(gyms)
      .where(eq(gyms.id, id));
    return gym;
  }

  async getUserGyms(userId: string): Promise<Gym[]> {
    return await db
      .select()
      .from(gyms)
      .where(eq(gyms.userId, userId))
      .orderBy(desc(gyms.createdAt));
  }

  async getSelectedGym(userId: string): Promise<Gym | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    
    if (!profile?.selectedGymId) {
      return undefined;
    }
    
    return await this.getGym(profile.selectedGymId);
  }

  async setSelectedGym(userId: string, gymId: string): Promise<void> {
    const targetGym = await this.getGym(gymId);
    if (!targetGym || targetGym.userId !== userId) {
      throw new Error("Gym not found or access denied");
    }

    await db
      .update(userProfiles)
      .set({ selectedGymId: gymId, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  }

  async updateGym(id: string, userId: string, data: { name: string; location?: string; latitude?: string | null; longitude?: string | null; isPublic?: boolean }): Promise<Gym> {
    const gym = await this.getGym(id);
    if (!gym || gym.userId !== userId) {
      throw new Error("Gym not found or access denied");
    }

    const [updatedGym] = await db
      .update(gyms)
      .set({
        name: data.name,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        isPublic: data.isPublic,
      })
      .where(and(eq(gyms.id, id), eq(gyms.userId, userId)))
      .returning();
    
    return updatedGym;
  }

  async deleteGym(id: string, userId: string): Promise<void> {
    const gym = await this.getGym(id);
    if (!gym || gym.userId !== userId) {
      throw new Error("Gym not found or access denied");
    }
    await db.delete(gyms).where(and(eq(gyms.id, id), eq(gyms.userId, userId)));
  }

  // ========== Equipment operations ==========
  
  async getUserEquipment(userId: string): Promise<UserEquipment[]> {
    return await db
      .select()
      .from(userEquipment)
      .where(eq(userEquipment.userId, userId));
  }

  async getGymEquipment(gymId: string): Promise<UserEquipment[]> {
    return await db
      .select()
      .from(userEquipment)
      .where(eq(userEquipment.gymId, gymId));
  }

  async getEquipmentById(id: string): Promise<UserEquipment | undefined> {
    const [equipment] = await db
      .select()
      .from(userEquipment)
      .where(eq(userEquipment.id, id));
    return equipment;
  }

  async upsertEquipment(equipmentData: InsertUserEquipment): Promise<UserEquipment> {
    const [equipment] = await db
      .insert(userEquipment)
      .values(equipmentData)
      .onConflictDoUpdate({
        target: [userEquipment.gymId, userEquipment.equipmentName],
        set: { available: equipmentData.available ?? true },
      })
      .returning();
    return equipment;
  }

  async deleteEquipment(id: string): Promise<void> {
    await db.delete(userEquipment).where(eq(userEquipment.id, id));
  }

  async getEquipmentCatalog(): Promise<any[]> {
    const { equipmentCatalog } = await import("@shared/schema");
    return await db.select().from(equipmentCatalog);
  }

  // ========== Gym program operations ==========
  
  async createGymProgram(programData: InsertGymProgram): Promise<GymProgram> {
    const [program] = await db
      .insert(gymPrograms)
      .values(programData)
      .returning();
    return program;
  }

  async getGymProgram(userId: string, gymId: string): Promise<GymProgram | undefined> {
    const [program] = await db
      .select()
      .from(gymPrograms)
      .where(and(eq(gymPrograms.userId, userId), eq(gymPrograms.gymId, gymId)));
    return program;
  }

  async upsertGymProgram(programData: InsertGymProgram): Promise<GymProgram> {
    const [program] = await db
      .insert(gymPrograms)
      .values(programData)
      .onConflictDoUpdate({
        target: [gymPrograms.userId, gymPrograms.gymId],
        set: {
          programData: programData.programData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return program;
  }

  async getUserGymPrograms(userId: string): Promise<GymProgram[]> {
    return await db
      .select()
      .from(gymPrograms)
      .where(eq(gymPrograms.userId, userId));
  }

  async clearUserGymPrograms(userId: string): Promise<void> {
    await db.delete(gymPrograms).where(eq(gymPrograms.userId, userId));
  }

  async findNearbyGyms(lat: number, lng: number, radiusKm: number = 50): Promise<Array<Gym & { distance: number }>> {
    // Haversine formula helper
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Fetch all public gyms
    // Note: Since we store lat/lng as text (legacy decision), we fetch all public gyms 
    // and filter in memory. This is fine for < 1000 gyms.
    const publicGyms = await db
      .select()
      .from(gyms)
      .where(eq(gyms.isPublic, true));

    const gymsWithDistance = publicGyms
      .map(gym => {
        const gymLat = gym.latitude ? parseFloat(gym.latitude) : null;
        const gymLng = gym.longitude ? parseFloat(gym.longitude) : null;
        
        if (gymLat === null || gymLng === null || isNaN(gymLat) || isNaN(gymLng)) {
          return null;
        }

        const distance = calculateDistance(lat, lng, gymLat, gymLng);
        return { ...gym, distance };
      })
      .filter((item): item is Gym & { distance: number } => 
        item !== null && item.distance <= radiusKm
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50); // Limit to top 50 matches

    return gymsWithDistance;
  }

  // ========== Workout session operations ==========
  
  async createWorkoutSession(sessionData: InsertWorkoutSession): Promise<WorkoutSession> {
    const [session] = await db
      .insert(workoutSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getWorkoutSession(id: string): Promise<WorkoutSession | undefined> {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id));
    return session;
  }

  async completeWorkoutSession(id: string, movergyScore?: number): Promise<void> {
    await db
      .update(workoutSessions)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
        movergyScore,
      })
      .where(eq(workoutSessions.id, id));
  }

  async cancelWorkoutSession(id: string): Promise<void> {
    await db
      .update(workoutSessions)
      .set({ 
        status: 'cancelled',
        completedAt: new Date(),
      })
      .where(eq(workoutSessions.id, id));
  }

  async getUserWorkoutSessions(userId: string, limit: number = 50): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          isNotNull(workoutSessions.completedAt)
        )
      )
      .orderBy(desc(workoutSessions.startedAt))
      .limit(limit);
  }

  async getActiveWorkoutSession(userId: string): Promise<WorkoutSession | undefined> {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, 'pending')
        )
      )
      .orderBy(desc(workoutSessions.startedAt))
      .limit(1);
    return session;
  }

  async updateSessionSnapshot(id: string, snapshotData: { skippedExercises: number[] }): Promise<void> {
    console.log("updateSessionSnapshot called with:", { id, snapshotData });
    const result = await db
      .update(workoutSessions)
      .set({ snapshotData })
      .where(eq(workoutSessions.id, id))
      .returning();
    console.log("updateSessionSnapshot result:", result);
  }

  // ========== Exercise log operations ==========
  
  async getExerciseLog(id: string): Promise<ExerciseLog | undefined> {
    const [log] = await db
      .select()
      .from(exerciseLogs)
      .where(eq(exerciseLogs.id, id));
    return log;
  }
  
  async createExerciseLog(logData: InsertExerciseLog): Promise<ExerciseLog> {
    const [log] = await db
      .insert(exerciseLogs)
      .values(logData)
      .returning();
    return log;
  }

  async updateExerciseLog(id: string, data: Partial<InsertExerciseLog>): Promise<void> {
    await db
      .update(exerciseLogs)
      .set(data)
      .where(eq(exerciseLogs.id, id));
  }

  async bulkUpdateExerciseLogs(sessionId: string, exerciseOrderIndex: number, data: { weight?: number; reps?: number }): Promise<void> {
    // Fetch session and template data first
    const session = await this.getWorkoutSession(sessionId);
    
    // Update exercise logs
    await db
      .update(exerciseLogs)
      .set(data)
      .where(
        and(
          eq(exerciseLogs.workoutSessionId, sessionId),
          eq(exerciseLogs.exerciseOrderIndex, exerciseOrderIndex),
          eq(exerciseLogs.completed, false)
        )
      );

    // Also update the template exercise if the session has a templateId
    if (session?.templateId) {
      const templateExercises = await this.getTemplateExercises(session.templateId);
      const templateExercise = templateExercises.find(ex => ex.orderIndex === exerciseOrderIndex);
      
      if (templateExercise) {
        const updateData: any = {};
        if (data.weight !== undefined) updateData.targetWeight = data.weight;
        if (data.reps !== undefined) updateData.targetReps = String(data.reps);
        
        // Update template exercise to sync with bulk update
        await db
          .update(programTemplateExercises)
          .set(updateData)
          .where(eq(programTemplateExercises.id, templateExercise.id));
      }
    }
  }

  async getSessionExerciseLogs(sessionId: string): Promise<ExerciseLog[]> {
    return await db
      .select()
      .from(exerciseLogs)
      .where(eq(exerciseLogs.workoutSessionId, sessionId))
      .orderBy(exerciseLogs.exerciseKey, exerciseLogs.setNumber);
  }

  // ========== Promo operations ==========
  
  async getPromo(id: string): Promise<PromoContent | undefined> {
    const [promo] = await db
      .select()
      .from(promoContent)
      .where(eq(promoContent.id, id));
    return promo;
  }

  async getActivePromosByPlacement(placement: string): Promise<PromoContent[]> {
    return await db
      .select()
      .from(promoContent)
      .where(and(
        eq(promoContent.placement, placement),
        eq(promoContent.isActive, true)
      ));
  }

  async createPromo(promoData: InsertPromoContent): Promise<PromoContent> {
    const [promo] = await db
      .insert(promoContent)
      .values(promoData)
      .returning();
    return promo;
  }

  async trackPromoImpression(impressionData: InsertPromoImpression): Promise<void> {
    await db.insert(promoImpressions).values(impressionData);
  }

  async getUserRecentImpressions(userId: string, promoId: string, hours: number): Promise<PromoImpression[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return await db
      .select()
      .from(promoImpressions)
      .where(and(
        eq(promoImpressions.userId, userId),
        eq(promoImpressions.promoId, promoId),
        gte(promoImpressions.createdAt, cutoffTime)
      ));
  }

  async trackAffiliateClick(clickData: InsertAffiliateClick): Promise<void> {
    await db.insert(affiliateClicks).values(clickData);
  }

  // ========== Notification preferences operations ==========
  
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async upsertNotificationPreferences(prefsData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [prefs] = await db
      .insert(notificationPreferences)
      .values(prefsData)
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          ...prefsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return prefs;
  }

  async updateNotificationPreferences(userId: string, data: UpdateNotificationPreferences): Promise<void> {
    await db
      .update(notificationPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId));
  }

  // ========== Subscription operations ==========
  
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));
    return subscription;
  }

  async upsertUserSubscription(subscriptionData: InsertUserSubscription): Promise<UserSubscription> {
    const [subscription] = await db
      .insert(userSubscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          ...subscriptionData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return subscription;
  }

  // ========== Training tips operations ==========
  
  async createTrainingTip(tipData: InsertTrainingTip): Promise<TrainingTip> {
    const [tip] = await db
      .insert(trainingTips)
      .values(tipData)
      .returning();
    return tip;
  }

  async getTrainingTips(filters?: { category?: string; workoutType?: string; isActive?: boolean }): Promise<TrainingTip[]> {
    let query = db.select().from(trainingTips);
    
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(trainingTips.category, filters.category));
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(trainingTips.isActive, filters.isActive));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    let tips = await query.orderBy(desc(trainingTips.priority));
    
    if (filters?.workoutType) {
      const workoutType = filters.workoutType;
      tips = tips.filter(tip => 
        tip.workoutTypes.length === 0 || 
        tip.workoutTypes.includes(workoutType)
      );
    }
    
    return tips;
  }

  async getTrainingTip(id: string): Promise<TrainingTip | undefined> {
    const [tip] = await db
      .select()
      .from(trainingTips)
      .where(eq(trainingTips.id, id));
    return tip;
  }

  // ========== Profile training tips operations ==========
  
  async getPersonalizedTips(userId: string, limit: number = 1): Promise<ProfileTrainingTip[]> {
    // Get user profile
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      console.warn(`No profile found for user ${userId} - returning empty tips array`);
      return [];
    }

    // Map user age to age group
    const getAgeGroup = (age: number | null): string => {
      if (!age) return "30–39"; // Default to 30-39 if no age (most common adult range)
      if (age >= 13 && age <= 17) return "13–17";
      if (age >= 18 && age <= 29) return "18–29";
      if (age >= 30 && age <= 39) return "30–39";
      if (age >= 40 && age <= 59) return "40–59";
      return "60+";
    };

    // Map user sex to gender - returns specific gender or null for neutral matching
    const getUserGender = (sex: string | null): string | null => {
      if (!sex) return null; // No specific gender - will match "både" only
      const normalized = sex.toLowerCase();
      if (normalized === "man" || normalized === "male" || normalized === "m") return "man";
      if (normalized === "kvinna" || normalized === "female" || normalized === "woman" || normalized === "f") return "kvinna";
      return null; // Unknown gender - will match "både" only
    };

    const ageGroup = getAgeGroup(profile.age);
    const userGender = getUserGender(profile.sex);
    const trainingLevel = profile.trainingLevel || "van"; // Default to "van" (intermediate)
    const sport = profile.specificSport?.trim() || null;

    // Build base query conditions (no age/training level - flexible matching)
    const baseConditions: any[] = [];

    // Gender: case-insensitive matching. If user has specific gender, match that OR "både". If no gender, match all genders
    if (userGender) {
      const genderCondition = or(
        sql`LOWER(${profileTrainingTips.gender}) = LOWER(${userGender})`,
        sql`LOWER(${profileTrainingTips.gender}) = 'både'`
      );
      if (genderCondition) baseConditions.push(genderCondition);
    }

    // Sport filter: if user has sport, match that OR general. If no sport, match all sports
    if (sport) {
      const sportCondition = or(
        sql`LOWER(${profileTrainingTips.sport}) = LOWER(${sport})`,
        isNull(profileTrainingTips.sport)
      );
      if (sportCondition) baseConditions.push(sportCondition);
    }

    // Try exact match first (age group + training level)
    let allTips = await db
      .select()
      .from(profileTrainingTips)
      .where(and(
        ...baseConditions,
        eq(profileTrainingTips.ageGroup, ageGroup),
        eq(profileTrainingTips.trainingLevel, trainingLevel)
      ));

    // Fallback 1: Match only training level (ignore age group)
    if (allTips.length === 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .where(and(
          ...baseConditions,
          eq(profileTrainingTips.trainingLevel, trainingLevel)
        ));
    }

    // Fallback 2: Match only age group (ignore training level)
    if (allTips.length === 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .where(and(
          ...baseConditions,
          eq(profileTrainingTips.ageGroup, ageGroup)
        ));
    }

    // Fallback 3: Just base conditions (no age/training filter)
    if (allTips.length === 0 && baseConditions.length > 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .where(and(...baseConditions));
    }

    // Fallback 4: Any tips if nothing else matches
    if (allTips.length === 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .limit(limit * 3); // Fetch more to allow randomization
    }

    // Randomize order and apply limit (default 1 for single tip)
    const shuffled = allTips.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async getProfileTipsByCategory(userId: string, category: string, limit: number = 10): Promise<ProfileTrainingTip[]> {
    // Get user profile
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      console.warn(`No profile found for user ${userId} - returning empty tips array`);
      return [];
    }

    // Map user age to age group
    const getAgeGroup = (age: number | null): string => {
      if (!age) return "30–39"; // Default to 30-39 if no age (most common adult range)
      if (age >= 13 && age <= 17) return "13–17";
      if (age >= 18 && age <= 29) return "18–29";
      if (age >= 30 && age <= 39) return "30–39";
      if (age >= 40 && age <= 59) return "40–59";
      return "60+";
    };

    const getUserGender = (sex: string | null): string | null => {
      if (!sex) return null;
      const normalized = sex.toLowerCase();
      if (normalized === "man" || normalized === "male" || normalized === "m") return "man";
      if (normalized === "kvinna" || normalized === "female" || normalized === "woman" || normalized === "f") return "kvinna";
      return null;
    };

    const ageGroup = getAgeGroup(profile.age);
    const userGender = getUserGender(profile.sex);
    const trainingLevel = profile.trainingLevel || "van"; // Default to "van" (intermediate) if not specified
    const sport = profile.specificSport?.trim() || null;

    // Build query with category filter - use flexible matching
    // First try exact match, then fall back to broader matches
    const baseConditions = [
      eq(profileTrainingTips.category, category),
    ];

    // Gender: case-insensitive matching. If user has specific gender, match that OR "både". If no gender, match all genders
    if (userGender) {
      const genderCondition = or(
        sql`LOWER(${profileTrainingTips.gender}) = LOWER(${userGender})`,
        sql`LOWER(${profileTrainingTips.gender}) = 'både'`
      );
      if (genderCondition) baseConditions.push(genderCondition);
    }

    // Sport filter: if user has sport, match that OR general. If no sport, match all sports
    if (sport) {
      const sportCondition = or(
        sql`LOWER(${profileTrainingTips.sport}) = LOWER(${sport})`,
        isNull(profileTrainingTips.sport)
      );
      if (sportCondition) baseConditions.push(sportCondition);
    }

    // Try exact match first (age group + training level)
    let allTips = await db
      .select()
      .from(profileTrainingTips)
      .where(and(
        ...baseConditions,
        eq(profileTrainingTips.ageGroup, ageGroup),
        eq(profileTrainingTips.trainingLevel, trainingLevel)
      ));

    // Fallback 1: Match only training level (ignore age group)
    if (allTips.length === 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .where(and(
          ...baseConditions,
          eq(profileTrainingTips.trainingLevel, trainingLevel)
        ));
    }

    // Fallback 2: Match only age group (ignore training level)
    if (allTips.length === 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .where(and(
          ...baseConditions,
          eq(profileTrainingTips.ageGroup, ageGroup)
        ));
    }

    // Fallback 3: Just match category (no age/training filter)
    if (allTips.length === 0) {
      allTips = await db
        .select()
        .from(profileTrainingTips)
        .where(and(...baseConditions));
    }

    // Randomize order and apply limit
    const shuffled = allTips.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  // ========== Exercise catalog operations ==========
  
  async getExerciseByName(name: string): Promise<{ id: string; name: string; nameEn: string | null; youtubeUrl: string | null; videoType: string | null } | undefined> {
    const { exercises } = await import("@shared/schema");
    const [exercise] = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        nameEn: exercises.nameEn,
        youtubeUrl: exercises.youtubeUrl,
        videoType: exercises.videoType,
      })
      .from(exercises)
      .where(or(eq(exercises.name, name), eq(exercises.nameEn, name)))
      .limit(1);
    return exercise;
  }

  async getExercisesByNames(names: string[]): Promise<{ id: string; name: string; nameEn: string | null; youtubeUrl: string | null; videoType: string | null }[]> {
    if (names.length === 0) {
      return [];
    }
    
    const { exercises } = await import("@shared/schema");
    return await db
      .select({
        id: exercises.id,
        name: exercises.name,
        nameEn: exercises.nameEn,
        youtubeUrl: exercises.youtubeUrl,
        videoType: exercises.videoType,
      })
      .from(exercises)
      .where(or(inArray(exercises.name, names), inArray(exercises.nameEn, names)));
  }

  // ========== Program template operations ==========
  
  async getUserProgramTemplates(userId: string): Promise<ProgramTemplate[]> {
    return await db
      .select()
      .from(programTemplates)
      .where(eq(programTemplates.userId, userId))
      .orderBy(programTemplates.createdAt);
  }

  async getProgramTemplate(id: string): Promise<ProgramTemplate | undefined> {
    const [template] = await db
      .select()
      .from(programTemplates)
      .where(eq(programTemplates.id, id));
    return template;
  }

  async getTemplateExercises(templateId: string): Promise<ProgramTemplateExercise[]> {
    return await db
      .select()
      .from(programTemplateExercises)
      .where(eq(programTemplateExercises.templateId, templateId))
      .orderBy(programTemplateExercises.orderIndex);
  }

  async updateTemplateExercises(templateId: string, exercises: Partial<ProgramTemplateExercise>[]): Promise<void> {
    // Fetch all existing exercises for this template to verify ownership
    const existingExercises = await db
      .select()
      .from(programTemplateExercises)
      .where(eq(programTemplateExercises.templateId, templateId));
    
    const existingIds = new Set(existingExercises.map(ex => ex.id));
    
    for (const exercise of exercises) {
      if (!exercise.id) continue;
      
      // Verify this exercise belongs to this template
      if (!existingIds.has(exercise.id)) {
        throw new Error(`Exercise ${exercise.id} does not belong to template ${templateId}`);
      }
      
      const updateData: any = {};
      if (exercise.orderIndex !== undefined) updateData.orderIndex = exercise.orderIndex;
      if (exercise.targetSets !== undefined) updateData.targetSets = exercise.targetSets;
      if (exercise.targetReps !== undefined) updateData.targetReps = exercise.targetReps;
      if (exercise.targetWeight !== undefined) updateData.targetWeight = exercise.targetWeight;
      
      await db
        .update(programTemplateExercises)
        .set(updateData)
        .where(
          and(
            eq(programTemplateExercises.id, exercise.id),
            eq(programTemplateExercises.templateId, templateId)
          )
        );
    }
  }

  async updateProgramTemplate(id: string, data: { dayOfWeek?: number }): Promise<ProgramTemplate> {
    const [template] = await db
      .update(programTemplates)
      .set(data)
      .where(eq(programTemplates.id, id))
      .returning();
    return template;
  }

  async getNextTemplate(userId: string): Promise<{ template: ProgramTemplate; exercises: ProgramTemplateExercise[] } | null> {
    const profile = await this.getUserProfile(userId);
    const templates = await this.getUserProgramTemplates(userId);
    
    // Early return if no templates to avoid modulo by zero
    if (templates.length === 0) {
      return null;
    }
    
    // Use currentPassNumber to determine which template to show (1-based index)
    const currentPassNumber = profile?.currentPassNumber || 1;
    const templateIndex = currentPassNumber - 1;
    
    // Wrap around if pass number exceeds template count
    const safeIndex = templateIndex % templates.length;
    const nextTemplate = templates[safeIndex];
    
    const exercises = await this.getTemplateExercises(nextTemplate.id);
    
    return {
      template: nextTemplate,
      exercises,
    };
  }

  async createProgramTemplatesFromAI(userId: string, aiProgramData: any): Promise<void> {
    const { getReferenceWeight } = await import("../lib/referenceWeights");
    
    console.log("[STORAGE] createProgramTemplatesFromAI called for userId:", userId);
    console.log("[STORAGE] aiProgramData:", JSON.stringify(aiProgramData).substring(0, 300));
    
    const phases = aiProgramData.phases || [];
    console.log("[STORAGE] Number of phases:", phases.length);
    
    const allSessions: any[] = [];
    
    phases.forEach((phase: any, phaseIdx: number) => {
      console.log(`[STORAGE] Phase ${phaseIdx}:`, phase.phaseName, "Sessions:", phase.sessions?.length || 0);
      if (phase.sessions && Array.isArray(phase.sessions)) {
        allSessions.push(...phase.sessions);
      }
    });
    
    console.log("[STORAGE] Total sessions to create:", allSessions.length);
    
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (let i = 0; i < allSessions.length; i++) {
      const session = allSessions[i];
      const templateName = `Pass ${letters[i] || i + 1}`;
      
      console.log(`[STORAGE] Creating template ${i + 1}/${allSessions.length}: ${templateName}`);
      
      const [template] = await db
        .insert(programTemplates)
        .values({
          userId,
          templateName,
          dayOfWeek: null,
        })
        .returning();
      
      const exercises = session.exercises || [];
      console.log(`[STORAGE] Template ${templateName} has ${exercises.length} exercises`);
      
      if (exercises.length === 0) {
        console.warn(`[STORAGE] WARNING: Template ${templateName} has no exercises!`);
      }
      
      for (let j = 0; j < exercises.length; j++) {
        const exercise = exercises[j];
        const exerciseName = exercise.exerciseTitle || exercise.exerciseName || exercise.name || 'Unknown';
        const exerciseKey = exercise.exerciseKey || `ex_${i}_${j}`;
        const referenceWeight = getReferenceWeight(exerciseName);
        
        console.log(`[STORAGE] Adding exercise ${j + 1}: ${exerciseName}`);
        
        await db.insert(programTemplateExercises).values({
          templateId: template.id,
          exerciseKey: exerciseKey,
          exerciseName: exerciseName,
          orderIndex: j,
          targetSets: parseInt(exercise.sets) || 3,
          targetReps: exercise.reps || '8-12',
          targetWeight: referenceWeight,
          requiredEquipment: exercise.equipment || [],
          muscles: exercise.muscleGroups || exercise.muscles || [],
          notes: exercise.notes || null,
        });
      }
    }
    
    console.log("[STORAGE] Template creation complete");
  }

  /**
   * Calculate suggested weight based on user's 1RM values and target reps
   */
  private calculateSuggestedWeight(
    exerciseName: string,
    targetReps: string,
    userProfile: {
      oneRmBench?: number | null;
      oneRmOhp?: number | null;
      oneRmDeadlift?: number | null;
      oneRmSquat?: number | null;
      oneRmLatpull?: number | null;
    }
  ): number | null {
    // Parse reps to get average (e.g., "8-12" -> 10)
    const repsMatch = targetReps.match(/\d+/);
    if (!repsMatch) return null;
    
    const reps = parseInt(repsMatch[0]);
    
    // Map reps to % of 1RM (standard powerlifting percentages)
    let rmPercentage = 0.70; // Default for 10-12 reps
    if (reps <= 3) rmPercentage = 0.90;
    else if (reps <= 5) rmPercentage = 0.85;
    else if (reps <= 8) rmPercentage = 0.80;
    else if (reps <= 10) rmPercentage = 0.75;
    else if (reps <= 12) rmPercentage = 0.70;
    else if (reps <= 15) rmPercentage = 0.65;
    else rmPercentage = 0.60;
    
    // Map exercise to relevant 1RM based on movement pattern
    const exerciseLower = exerciseName.toLowerCase();
    
    // Bench Press movements
    if (exerciseLower.includes('bench') || 
        exerciseLower.includes('chest press') ||
        exerciseLower.includes('push up') ||
        exerciseLower.includes('push-up')) {
      if (userProfile.oneRmBench) {
        return Math.round(userProfile.oneRmBench * rmPercentage);
      }
    }
    
    // Overhead Press movements
    if (exerciseLower.includes('overhead') || 
        exerciseLower.includes('shoulder press') ||
        exerciseLower.includes('military press') ||
        exerciseLower.includes('seated press') ||
        (exerciseLower.includes('dumbbell') && exerciseLower.includes('press') && !exerciseLower.includes('bench'))) {
      if (userProfile.oneRmOhp) {
        return Math.round(userProfile.oneRmOhp * rmPercentage);
      }
    }
    
    // Squat movements
    if (exerciseLower.includes('squat') || 
        exerciseLower.includes('leg press') ||
        exerciseLower.includes('hack squat')) {
      if (userProfile.oneRmSquat) {
        // Leg press is typically ~2x squat strength
        const multiplier = exerciseLower.includes('leg press') ? 2.0 : 1.0;
        return Math.round(userProfile.oneRmSquat * rmPercentage * multiplier);
      }
    }
    
    // Deadlift movements
    if (exerciseLower.includes('deadlift') || 
        exerciseLower.includes('rdl') ||
        exerciseLower.includes('romanian')) {
      if (userProfile.oneRmDeadlift) {
        // RDL is typically ~85% of conventional deadlift
        const multiplier = (exerciseLower.includes('rdl') || exerciseLower.includes('romanian')) ? 0.85 : 1.0;
        return Math.round(userProfile.oneRmDeadlift * rmPercentage * multiplier);
      }
    }
    
    // Pull movements (rows, pulldowns, pull-ups)
    if (exerciseLower.includes('row') || 
        exerciseLower.includes('pull') ||
        exerciseLower.includes('lat') ||
        exerciseLower.includes('chin')) {
      if (userProfile.oneRmLatpull) {
        return Math.round(userProfile.oneRmLatpull * rmPercentage);
      }
    }
    
    // FALLBACK: Heuristic estimates for isolation/accessory exercises
    // These provide a reasonable starting point; users will adjust during workouts
    
    // Bicep exercises (based on pulling strength or bodyweight)
    if (exerciseLower.includes('curl') && (exerciseLower.includes('bicep') || exerciseLower.includes('hammer') || exerciseLower.includes('preacher'))) {
      // Estimate as ~30% of lat pulldown 1RM, or fallback to body weight percentage
      if (userProfile.oneRmLatpull) {
        return Math.round(userProfile.oneRmLatpull * 0.30 * rmPercentage);
      }
    }
    
    // Tricep isolation (based on pressing strength)
    if ((exerciseLower.includes('tricep') || exerciseLower.includes('skullcrusher') || exerciseLower.includes('kickback')) && 
        !exerciseLower.includes('dip') && !exerciseLower.includes('press')) {
      // Estimate as ~25% of bench press 1RM
      if (userProfile.oneRmBench) {
        return Math.round(userProfile.oneRmBench * 0.25 * rmPercentage);
      }
    }
    
    // Lateral/Front raises (shoulder isolation)
    if (exerciseLower.includes('lateral') || exerciseLower.includes('front raise') || exerciseLower.includes('side raise')) {
      // Estimate as ~20% of OHP 1RM
      if (userProfile.oneRmOhp) {
        return Math.round(userProfile.oneRmOhp * 0.20 * rmPercentage);
      }
    }
    
    // Leg curls/extensions
    if (exerciseLower.includes('leg curl') || exerciseLower.includes('leg extension')) {
      // Estimate as ~40% of squat 1RM
      if (userProfile.oneRmSquat) {
        return Math.round(userProfile.oneRmSquat * 0.40 * rmPercentage);
      }
    }
    
    // Calf raises
    if (exerciseLower.includes('calf')) {
      // Estimate as ~60% of squat 1RM (calves are relatively strong)
      if (userProfile.oneRmSquat) {
        return Math.round(userProfile.oneRmSquat * 0.60 * rmPercentage);
      }
    }
    
    // Face pulls, rear delt work
    if (exerciseLower.includes('face pull') || exerciseLower.includes('rear delt')) {
      // Estimate as ~25% of lat pulldown 1RM
      if (userProfile.oneRmLatpull) {
        return Math.round(userProfile.oneRmLatpull * 0.25 * rmPercentage);
      }
    }
    
    // Shrugs
    if (exerciseLower.includes('shrug')) {
      // Estimate as ~70% of deadlift 1RM
      if (userProfile.oneRmDeadlift) {
        return Math.round(userProfile.oneRmDeadlift * 0.70 * rmPercentage);
      }
    }
    
    // Abs/core exercises - return a conservative starting weight
    if (exerciseLower.includes('crunch') || exerciseLower.includes('plank') || 
        exerciseLower.includes('ab') || exerciseLower.includes('core')) {
      // Bodyweight exercises or light weights - return small value
      return 5; // 5kg starting point for weighted core work
    }
    
    // No matching pattern found
    return null;
  }

  async createProgramTemplatesFromDeepSeek(userId: string, program: import("./ai-service").DeepSeekWorkoutProgram): Promise<void> {
    console.log("[STORAGE] createProgramTemplatesFromDeepSeek called for userId:", userId);
    console.log("[STORAGE] Program overview:", program.program_overview.week_focus_summary);
    
    const weeklySessions = program.weekly_sessions || [];
    console.log("[STORAGE] Number of weekly sessions:", weeklySessions.length);
    
    if (weeklySessions.length === 0) {
      throw new Error("No weekly sessions found in generated program");
    }
    
    const weekdayToNumber: Record<string, number> = {
      'måndag': 1, 'monday': 1,
      'tisdag': 2, 'tuesday': 2,
      'onsdag': 3, 'wednesday': 3,
      'torsdag': 4, 'thursday': 4,
      'fredag': 5, 'friday': 5,
      'lördag': 6, 'saturday': 6,
      'söndag': 7, 'sunday': 7,
    };
    
    // Fetch user profile to get 1RM values for weight calculation
    const userProfile = await this.getUserProfile(userId);
    console.log("[STORAGE] Fetched user profile for weight calculation:", {
      oneRmBench: userProfile?.oneRmBench,
      oneRmOhp: userProfile?.oneRmOhp,
      oneRmDeadlift: userProfile?.oneRmDeadlift,
      oneRmSquat: userProfile?.oneRmSquat,
      oneRmLatpull: userProfile?.oneRmLatpull,
    });
    
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (let i = 0; i < weeklySessions.length; i++) {
      const session = weeklySessions[i];
      const templateName = session.session_name || `Pass ${letters[i] || i + 1}`;
      
      // Map AI's weekday to dayOfWeek integer
      const weekdayStr = session.weekday?.toLowerCase() || '';
      const dayOfWeek = weekdayToNumber[weekdayStr] || null;
      
      console.log(`[STORAGE] Creating template ${i + 1}/${weeklySessions.length}: ${templateName} - ${session.session_name} (${session.weekday} → dayOfWeek=${dayOfWeek}, ${session.estimated_duration_minutes}min)`);
      
      // Generate muscle_focus if AI didn't provide it (defensive fallback)
      let muscleFocus = session.muscle_focus || null;
      if (!muscleFocus && session.main_work && session.main_work.length > 0) {
        const muscles = new Set<string>();
        session.main_work.forEach((ex: any) => {
          if (ex.target_muscles && Array.isArray(ex.target_muscles)) {
            ex.target_muscles.forEach((m: string) => muscles.add(m));
          }
        });
        if (muscles.size > 0) {
          const muscleArray = Array.from(muscles);
          // Generate descriptive focus based on muscle groups
          if (muscleArray.length === 1) {
            muscleFocus = muscleArray[0];
          } else if (muscleArray.some(m => m.toLowerCase().includes('chest') || m.toLowerCase().includes('bröst'))) {
            muscleFocus = "Upper Body - Push";
          } else if (muscleArray.some(m => m.toLowerCase().includes('back') || m.toLowerCase().includes('rygg'))) {
            muscleFocus = "Upper Body - Pull";
          } else if (muscleArray.some(m => m.toLowerCase().includes('leg') || m.toLowerCase().includes('ben'))) {
            muscleFocus = "Legs";
          } else {
            muscleFocus = muscleArray.slice(0, 2).join(" - ");
          }
          console.log(`[STORAGE] Generated muscle_focus from exercises: "${muscleFocus}"`);
        }
      }
      
      const [template] = await db
        .insert(programTemplates)
        .values({
          userId,
          templateName,
          muscleFocus: muscleFocus,
          dayOfWeek: dayOfWeek,
          estimatedDurationMinutes: session.estimated_duration_minutes,
        })
        .returning();
      
      const mainWorkExercises = session.main_work || [];
      console.log(`[STORAGE] Template ${templateName} has ${mainWorkExercises.length} main exercises`);
      
      if (mainWorkExercises.length === 0) {
        console.warn(`[STORAGE] WARNING: Template ${templateName} has no main exercises!`);
      }
      
      for (let j = 0; j < mainWorkExercises.length; j++) {
        const exercise = mainWorkExercises[j];
        const aiGeneratedName = exercise.exercise_name || 'Unknown';
        
        const matchResult = await matchExercise(aiGeneratedName);
        
        // CRITICAL: Only accept matched exercises with English names
        // Do NOT fall back to aiGeneratedName if match fails
        if (!matchResult.matched || !matchResult.exerciseName) {
          console.error(`[VALIDATION ERROR] ❌ Exercise "${aiGeneratedName}" not matched to catalog - SKIPPING`);
          console.warn(`[VALIDATION] Skipping unmatched exercise to enforce English-only policy`);
          continue; // Skip this exercise
        }
        
        const finalExerciseName = matchResult.exerciseName;
        
        const exerciseKey = finalExerciseName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        // POST-VALIDATION: Fix AI errors where time-based values are used for reps-based exercises
        let validatedReps = exercise.reps || '8-12';
        const repsValue = validatedReps.toLowerCase();
        const isTimeValue = repsValue.includes('sec') || repsValue.includes('sekund');
        
        // Known reps-based exercises that should NEVER have time values
        const repsBasedKeywords = [
          'press', 'push', 'pull', 'row', 'curl', 'extension', 'raise', 'fly', 'flye',
          'squat', 'lunge', 'deadlift', 'rdl', 'pulldown', 'pullup', 'pull-up',
          'dip', 'shrug', 'raise', 'lateral', 'front', 'rear', 'skull', 'tricep',
          'bicep', 'hammer', 'preacher', 'leg press', 'calf', 'crunch'
        ];
        
        const exerciseNameLower = finalExerciseName.toLowerCase();
        const isRepsBasedExercise = repsBasedKeywords.some(keyword => exerciseNameLower.includes(keyword));
        
        if (isTimeValue && isRepsBasedExercise) {
          console.warn(`[STORAGE] AI ERROR DETECTED: "${finalExerciseName}" has time value "${validatedReps}" - correcting to "8-12"`);
          validatedReps = '8-12';
        }
        
        // INVERSE VALIDATION: Ensure static/isometric exercises get time values instead of reps
        const timeBasedKeywords = [
          'plank', 'hold', 'static', 'isometric', 'dead hang', 'wall sit',
          'bridge hold', 'hollow hold', 'l-sit', 'handstand hold'
        ];
        
        const isTimeBasedExercise = timeBasedKeywords.some(keyword => exerciseNameLower.includes(keyword));
        
        if (!isTimeValue && isTimeBasedExercise) {
          // Convert reps to seconds (estimate based on typical hold times)
          const repsMatch = validatedReps.match(/\d+/);
          if (repsMatch) {
            const reps = parseInt(repsMatch[0]);
            // Map rep count to appropriate hold time
            let seconds = 30; // Default
            if (reps <= 5) seconds = 45; // Low "reps" = longer hold
            else if (reps <= 10) seconds = 30;
            else if (reps <= 15) seconds = 20;
            else seconds = 15; // High "reps" = shorter hold
            
            validatedReps = `${seconds} sec`;
            console.warn(`[STORAGE] AI ERROR DETECTED: "${finalExerciseName}" has rep value "${exercise.reps}" - correcting to "${validatedReps}"`);
          }
        }
        
        // CRITICAL VALIDATION: Enforce English-only exercise names
        const hasSwedishChars = /[åäöÅÄÖ]/.test(finalExerciseName);
        const hasSwedishWords = finalExerciseName.toLowerCase().includes('böj') || 
                                finalExerciseName.toLowerCase().includes('lyft') ||
                                (finalExerciseName.toLowerCase().includes('press') && finalExerciseName.toLowerCase().includes('bänk'));
        
        if (hasSwedishChars || hasSwedishWords) {
          console.error(`[VALIDATION ERROR] ❌ Swedish exercise name detected: "${finalExerciseName}" (AI="${aiGeneratedName}") - SKIPPING`);
          console.warn(`[VALIDATION] Skipping Swedish exercise to enforce English-only policy`);
          continue; // Skip this exercise - don't insert it
        }
        
        console.log(`[VALIDATION] ✅ English exercise name confirmed: "${finalExerciseName}"`);
        
        // Calculate suggested weight: use AI's suggestion if available, otherwise calculate locally
        let suggestedWeight: number | null = null;
        if (exercise.suggested_weight_kg) {
          suggestedWeight = Math.round(exercise.suggested_weight_kg);
          console.log(`[STORAGE] Using AI-provided weight: ${suggestedWeight}kg for "${finalExerciseName}"`);
        } else if (userProfile) {
          suggestedWeight = this.calculateSuggestedWeight(finalExerciseName, validatedReps, {
            oneRmBench: userProfile.oneRmBench,
            oneRmOhp: userProfile.oneRmOhp,
            oneRmDeadlift: userProfile.oneRmDeadlift,
            oneRmSquat: userProfile.oneRmSquat,
            oneRmLatpull: userProfile.oneRmLatpull,
          });
          if (suggestedWeight) {
            console.log(`[STORAGE] Calculated weight: ${suggestedWeight}kg for "${finalExerciseName}" (${validatedReps} reps)`);
          }
        }
        
        console.log(`[STORAGE] Adding exercise ${j + 1}: AI="${aiGeneratedName}" → Matched="${finalExerciseName}" (${matchResult.confidence}), Reps="${validatedReps}", Weight=${suggestedWeight || 'N/A'}kg`);
        
        await db.insert(programTemplateExercises).values({
          templateId: template.id,
          exerciseKey: exerciseKey,
          exerciseName: finalExerciseName,
          orderIndex: j,
          targetSets: exercise.sets || 3,
          targetReps: validatedReps,
          targetWeight: suggestedWeight,
          requiredEquipment: exercise.required_equipment || [],
          muscles: exercise.target_muscles || [],
          notes: [
            exercise.technique_cues?.join('. '),
            exercise.suggested_weight_notes,
            `Tempo: ${exercise.tempo}`,
            `Vila: ${exercise.rest_seconds}s`
          ].filter(Boolean).join('\n'),
        });
      }
    }
    
    console.log("[STORAGE] DeepSeek template creation complete");
  }

  async clearUserProgramTemplates(userId: string): Promise<void> {
    console.log("[STORAGE] Clearing all program templates for userId:", userId);
    
    const templates = await db
      .select({ id: programTemplates.id })
      .from(programTemplates)
      .where(eq(programTemplates.userId, userId));
    
    for (const template of templates) {
      await db
        .delete(programTemplateExercises)
        .where(eq(programTemplateExercises.templateId, template.id));
    }
    
    await db
      .delete(programTemplates)
      .where(eq(programTemplates.userId, userId));
    
    console.log("[STORAGE] Cleared", templates.length, "program templates");
  }

  async updateLastCompletedTemplate(userId: string, templateId: string): Promise<void> {
    await db
      .update(userProfiles)
      .set({ 
        lastCompletedTemplateId: templateId,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  }

  async getTemplatesWithMetadata(userId: string): Promise<Array<{ template: ProgramTemplate; exerciseCount: number; exercises: ProgramTemplateExercise[]; isNext: boolean }>> {
    const profile = await this.getUserProfile(userId);
    const templates = await this.getUserProgramTemplates(userId);
    
    // Early return if no templates to avoid modulo by zero
    if (templates.length === 0) {
      return [];
    }
    
    // Use currentPassNumber to determine next template (1-based index)
    const currentPassNumber = profile?.currentPassNumber || 1;
    const nextTemplateIndex = currentPassNumber - 1;
    const safeIndex = nextTemplateIndex % templates.length;
    const nextTemplateId = templates[safeIndex]?.id;
    
    const result = await Promise.all(
      templates.map(async (template) => {
        const exercises = await this.getTemplateExercises(template.id);
        return {
          template,
          exerciseCount: exercises.length,
          exercises, // Include exercises in response
          isNext: template.id === nextTemplateId,
        };
      })
    );
    
    return result;
  }

  async incrementProgramGeneration(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new Error("User profile not found - cannot increment generation counter");
    }

    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const needsReset = !profile.weekStartDate || profile.weekStartDate < weekStart;

    let result;
    if (needsReset) {
      // New week - reset counter to 1
      result = await db
        .update(userProfiles)
        .set({
          programGenerationsThisWeek: 1,
          weekStartDate: weekStart,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId))
        .returning();
    } else {
      // Increment counter
      result = await db
        .update(userProfiles)
        .set({
          programGenerationsThisWeek: (profile.programGenerationsThisWeek || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId))
        .returning();
    }

    if (result.length === 0) {
      throw new Error("Failed to increment program generation counter - no rows updated");
    }
    
    console.log(`[STORAGE] Program generation counter updated to ${result[0].programGenerationsThisWeek}/5 for user ${userId}`);
  }

  async setUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    const result = await db
      .update(userProfiles)
      .set({
        isAdmin,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    if (result.length === 0) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }

    console.log(`[STORAGE] Admin status for user ${userId} set to: ${isAdmin}`);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ========== V4 specific operations ==========

  async getUserTimeModel(userId: string): Promise<import("@shared/schema").UserTimeModel | undefined> {
    const { userTimeModel } = await import("@shared/schema");
    const [model] = await db
      .select()
      .from(userTimeModel)
      .where(eq(userTimeModel.userId, userId));
    return model;
  }

  async getExercisesByIds(ids: string[]): Promise<any[]> {
    const { exercises } = await import("@shared/schema");
    return await db
      .select()
      .from(exercises)
      .where(
        or(
          inArray(exercises.exerciseId, ids),
          inArray(exercises.id, ids)
        )
      );
  }

  async getCandidatePools(userId: string, gymId?: string): Promise<import("@shared/schema").CandidatePool[]> {
    const { candidatePools } = await import("@shared/schema");
    return await db
      .select()
      .from(candidatePools)
      .where(
        or(
          eq(candidatePools.scope, 'global'),
          and(eq(candidatePools.scope, 'user'), eq(candidatePools.userId, userId)),
          gymId ? and(eq(candidatePools.scope, 'gym'), eq(candidatePools.gymId, gymId)) : undefined
        )
      );
  }

  // ========== Admin operations ==========

  async adminGetUnmappedExercises(): Promise<import("@shared/schema").UnmappedExercise[]> {
    const { unmappedExercises } = await import("@shared/schema");
    return await db.select().from(unmappedExercises).orderBy(desc(unmappedExercises.count));
  }

  async adminGetAllExercises(): Promise<import("@shared/schema").Exercise[]> {
    const { exercises } = await import("@shared/schema");
    return await db.select().from(exercises).orderBy(exercises.name);
  }

  async adminUpdateExercise(id: string, data: Partial<import("@shared/schema").Exercise>): Promise<import("@shared/schema").Exercise> {
    const { exercises } = await import("@shared/schema");
    const [updated] = await db.update(exercises).set(data).where(eq(exercises.id, id)).returning();
    return updated;
  }

  async adminCreateExerciseAlias(data: import("@shared/schema").InsertExerciseAlias): Promise<import("@shared/schema").ExerciseAlias> {
    const { exerciseAliases } = await import("@shared/schema");
    const [alias] = await db.insert(exerciseAliases).values(data).returning();
    return alias;
  }

  async adminGetAllEquipment(): Promise<import("@shared/schema").EquipmentCatalog[]> {
    const { equipmentCatalog } = await import("@shared/schema");
    return await db.select().from(equipmentCatalog).orderBy(equipmentCatalog.name);
  }

  async adminUpdateEquipment(id: string, data: Partial<import("@shared/schema").EquipmentCatalog>): Promise<import("@shared/schema").EquipmentCatalog> {
    const { equipmentCatalog } = await import("@shared/schema");
    const [updated] = await db.update(equipmentCatalog).set(data).where(eq(equipmentCatalog.id, id)).returning();
    return updated;
  }

  async adminCreateEquipmentAlias(data: import("@shared/schema").InsertEquipmentAlias): Promise<import("@shared/schema").EquipmentAlias> {
    const { equipmentAliases } = await import("@shared/schema");
    const [alias] = await db.insert(equipmentAliases).values(data).returning();
    return alias;
  }

  async adminGetAllGyms(): Promise<import("@shared/schema").Gym[]> {
    const { gyms } = await import("@shared/schema");
    return await db.select().from(gyms).orderBy(gyms.name);
  }

  async adminUpdateGym(id: string, data: Partial<import("@shared/schema").Gym>): Promise<import("@shared/schema").Gym> {
    const { gyms } = await import("@shared/schema");
    const [updated] = await db.update(gyms).set(data).where(eq(gyms.id, id)).returning();
    return updated;
  }

  async adminDeleteExercise(id: string): Promise<void> {
    const { exercises } = await import("@shared/schema");
    await db.delete(exercises).where(eq(exercises.id, id));
  }

  async adminDeleteUnmappedExercise(id: string): Promise<void> {
    const { unmappedExercises } = await import("@shared/schema");
    await db.delete(unmappedExercises).where(eq(unmappedExercises.id, id));
  }

  async adminDeleteEquipmentCatalog(id: string): Promise<void> {
    const { equipmentCatalog } = await import("@shared/schema");
    await db.delete(equipmentCatalog).where(eq(equipmentCatalog.id, id));
  }

  async adminDeleteGym(id: string): Promise<void> {
    const { gyms } = await import("@shared/schema");
    await db.delete(gyms).where(eq(gyms.id, id));
  }

  async adminGetUsersCount(): Promise<number> {
    const { users } = await import("@shared/schema");
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0].count);
  }
}

export const storage = new DatabaseStorage();
