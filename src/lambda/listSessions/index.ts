import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../../utils/auth';
import { DynamoDBService } from '../../utils/dynamodb';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '../../utils/response';
import { listSessionsSchema } from '../../schemas/validation';

const authService = new AuthService();
const dbService = new DynamoDBService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Authenticate user
        const user = await authService.authenticateRequest(event.headers);
        if (!user) {
            return unauthorizedResponse();
        }

        // Parse and validate query parameters
        const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 20;
        const nextToken = event.queryStringParameters?.nextToken;

        const validationResult = listSessionsSchema.safeParse({
            userId: user.sub,
            limit,
            nextToken
        });

        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return validationErrorResponse(errors);
        }

        // Get fasting sessions
        const result = await dbService.listFastingSessions(user.sub, limit, nextToken);

        return successResponse(result);
    } catch (error) {
        console.error('Error in listSessions:', error);
        return errorResponse('Internal server error', 500);
    }
}; 