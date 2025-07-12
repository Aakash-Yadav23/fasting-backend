import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '../../utils/response';
import { FastingStats } from '../../types';

const authService = new AuthService();
const dbService = new DynamoDBService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Authenticate user
        const user = await authService.authenticateRequest(event.headers);
        if (!user) {
            return unauthorizedResponse();
        }

        // Get user profile
        const userProfile = await dbService.getUserProfile(user.sub);
        if (!userProfile) {
            return notFoundResponse();
        }

        // Get active fasting session
        const activeSession = await dbService.getActiveFastingSession(user.sub);

        // Get fasting statistics
        const { totalFastingHours, completedSessions } = await dbService.getFastingStats(user.sub);

        // Calculate current fasting status
        let hoursSinceStarted: number | undefined;
        let hoursRemaining: number | undefined;

        if (activeSession) {
            const startTime = new Date(activeSession.startTime);
            const now = new Date();
            hoursSinceStarted = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            if (activeSession.targetHours) {
                hoursRemaining = Math.max(0, activeSession.targetHours - hoursSinceStarted);
            }
        }

        const stats: FastingStats = {
            isCurrentlyFasting: !!activeSession,
            currentSession: activeSession || undefined,
            hoursSinceStarted,
            hoursRemaining,
            targetWeight: userProfile.targetWeight,
            diseases: userProfile.diseases,
            totalFastingHours,
            completedSessions
        };

        return successResponse(stats);
    } catch (error) {
        console.error('Error in getStats:', error);
        return errorResponse('Internal server error', 500);
    }
}; 