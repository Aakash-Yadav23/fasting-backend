import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '../../utils/response';
import { onboardingSchema } from '../../schemas/validation';
import { UserProfile } from '../../types';

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

        const validationResult = onboardingSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return validationErrorResponse(errors);
        }

        const { name, dateOfBirth, currentWeight, diseases, fastingGoals } = validationResult.data;

        // Check if user profile already exists
        const existingProfile = await dbService.getUserProfile(user.sub);
        if (existingProfile) {
            return errorResponse('User profile already exists', 409);
        }

        // Create user profile
        const profile: UserProfile = {
            userId: user.sub,
            email: user.email,
            name,
            dateOfBirth,
            currentWeight,
            diseases,
            fastingGoals,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dbService.createUserProfile(profile);

        return successResponse(profile, 'User profile created successfully');
    } catch (error) {
        console.error('Error in onboarding:', error);
        return errorResponse('Internal server error', 500);
    }
}; 