import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse, notFoundResponse } from '../../utils/response';
import { endFastSchema } from '../../schemas/validation';

const authService = new AuthService();
const dbService = new DynamoDBService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Authenticate user
        const user = await authService.authenticateRequest(event.headers);
        if (!user) {
            return unauthorizedResponse();
        }

        // Parse and validate request body
        let body: any;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return errorResponse('Invalid JSON body');
        }

        const validationResult = endFastSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return validationErrorResponse(errors);
        }

        const { sessionId } = validationResult.data;

        // Get the fasting session
        const session = await dbService.getFastingSession(sessionId, user.sub);
        if (!session) {
            return notFoundResponse();
        }

        if (session.status !== 'active') {
            return errorResponse('Session is not active', 400);
        }

        // End the fasting session
        const now = new Date().toISOString();
        const updatedSession = await dbService.updateFastingSession(sessionId, user.sub, {
            endTime: now,
            status: 'completed',
            updatedAt: now
        });

        return successResponse(updatedSession, 'Fasting session ended successfully');
    } catch (error) {
        console.error('Error in endFast:', error);
        return errorResponse('Internal server error', 500);
    }
}; 