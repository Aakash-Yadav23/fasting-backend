import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '../../utils/response';

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

        return successResponse(userProfile);
    } catch (error) {
        console.error('Error in getProfile:', error);
        return errorResponse('Internal server error', 500);
    }
}; 