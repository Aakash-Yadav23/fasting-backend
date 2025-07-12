export interface UserProfile {
    userId: string;
    email: string;
    name: string;
    dateOfBirth: string;
    currentWeight?: number;
    targetWeight?: number;
    diseases: string[];
    fastingGoals: FastingGoal[];
    createdAt: string;
    updatedAt: string;
}

export interface FastingSession {
    sessionId: string;
    userId: string;
    startTime: string;
    endTime?: string;
    targetHours?: number;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export type FastingGoal = 'weight_loss' | 'detox' | 'mental_clarity' | 'religious' | 'other';

export interface OnboardingRequest {
    name: string;
    dateOfBirth: string;
    currentWeight?: number;
    diseases: string[];
    fastingGoals: FastingGoal[];
}

export interface UpdateProfileRequest {
    targetWeight?: number;
    diseases?: string[];
    currentWeight?: number;
}

export interface StartFastRequest {
    targetHours?: number; // If not provided, start tracking from now
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface FastingStats {
    isCurrentlyFasting: boolean;
    currentSession?: FastingSession;
    hoursSinceStarted?: number;
    hoursRemaining?: number;
    targetWeight?: number;
    diseases: string[];
    totalFastingHours: number;
    completedSessions: number;
}

export interface CognitoUser {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
} 