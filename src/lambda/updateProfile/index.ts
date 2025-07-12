import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse, notFoundResponse } from '../../utils/response';
import { updateProfileSchema } from '../../schemas/validation';

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

        const validationResult = updateProfileSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return validationErrorResponse(errors);
        }

        // Check if user profile exists
        const existingProfile = await dbService.getUserProfile(user.sub);
        if (!existingProfile) {
            return notFoundResponse();
        }

        // Update user profile
        const updatedProfile = await dbService.updateUserProfile(user.sub, validationResult.data);

        return successResponse(updatedProfile, 'Profile updated successfully');
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return errorResponse('Internal server error', 500);
    }
}; 