import { z } from 'zod';

export const onboardingSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    currentWeight: z.number().positive().optional(),
    diseases: z.array(z.string()).default([]),
    fastingGoals: z.array(z.enum(['weight_loss', 'detox', 'mental_clarity', 'religious', 'other'])).min(1, 'At least one fasting goal is required')
});

export const updateProfileSchema = z.object({
    targetWeight: z.number().positive().optional(),
    diseases: z.array(z.string()).optional(),
    currentWeight: z.number().positive().optional()
});

export const startFastSchema = z.object({
    targetHours: z.number().positive().optional()
});

export const endFastSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required')
});

export const getStatsSchema = z.object({
    userId: z.string().min(1, 'User ID is required')
});

export const getSessionSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required')
});

export const listSessionsSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    limit: z.number().positive().max(100).optional().default(20),
    nextToken: z.string().optional()
}); 