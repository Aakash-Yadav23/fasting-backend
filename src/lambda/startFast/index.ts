import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse, notFoundResponse } from '../../utils/response';
import { startFastSchema } from '../../schemas/validation';
import { FastingSession } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const authService = new AuthService();
const dbService = new DynamoDBService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Authenticate user
        const user = await authService.authenticateRequest(event.headers);
        if (!user) {
            return unauthorizedResponse();
        }

        // Check if user profile exists
        const userProfile = await dbService.getUserProfile(user.sub);
        if (!userProfile) {
            return notFoundResponse();
        }

        // Check if user is already fasting
        const activeSession = await dbService.getActiveFastingSession(user.sub);
        if (activeSession) {
            return errorResponse('User is already fasting', 409);
        }

        // Parse and validate request body
        let body: any;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return errorResponse('Invalid JSON body');
        }

        const validationResult = startFastSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return validationErrorResponse(errors);
        }

        const { targetHours } = validationResult.data;
        const now = new Date().toISOString();

        // Create fasting session
        const session: FastingSession = {
            sessionId: uuidv4(),
            userId: user.sub,
            startTime: now,
            targetHours,
            status: 'active',
            createdAt: now,
            updatedAt: now
        };

        await dbService.createFastingSession(session);

        return successResponse(session, 'Fasting session started successfully');
    } catch (error) {
        console.error('Error in startFast:', error);
        return errorResponse('Internal server error', 500);
    }
}; 