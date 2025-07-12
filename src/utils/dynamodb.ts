import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { UserProfile, FastingSession } from '../types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class DynamoDBService {
    private readonly userProfileTable: string;
    private readonly fastingSessionTable: string;

    constructor() {
        this.userProfileTable = process.env.USER_PROFILE_TABLE!;
        this.fastingSessionTable = process.env.FASTING_SESSION_TABLE!;
    }

    // User Profile Operations
    async createUserProfile(profile: UserProfile): Promise<void> {
        await docClient.send(new PutCommand({
            TableName: this.userProfileTable,
            Item: profile,
            ConditionExpression: 'attribute_not_exists(userId)'
        }));
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const result = await docClient.send(new GetCommand({
            TableName: this.userProfileTable,
            Key: { userId }
        }));

        return result.Item as UserProfile || null;
    }

    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        const updateExpression: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        });

        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const result = await docClient.send(new UpdateCommand({
            TableName: this.userProfileTable,
            Key: { userId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));

        return result.Attributes as UserProfile;
    }

    // Fasting Session Operations
    async createFastingSession(session: FastingSession): Promise<void> {
        await docClient.send(new PutCommand({
            TableName: this.fastingSessionTable,
            Item: session
        }));
    }

    async getFastingSession(sessionId: string, userId: string): Promise<FastingSession | null> {
        const result = await docClient.send(new GetCommand({
            TableName: this.fastingSessionTable,
            Key: { sessionId, userId }
        }));

        return result.Item as FastingSession || null;
    }

    async getActiveFastingSession(userId: string): Promise<FastingSession | null> {
        const result = await docClient.send(new QueryCommand({
            TableName: this.fastingSessionTable,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'status = :status',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':status': 'active'
            },
            Limit: 1
        }));

        return result.Items?.[0] as FastingSession || null;
    }

    async updateFastingSession(sessionId: string, userId: string, updates: Partial<FastingSession>): Promise<FastingSession> {
        const updateExpression: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        });

        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const result = await docClient.send(new UpdateCommand({
            TableName: this.fastingSessionTable,
            Key: { sessionId, userId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));

        return result.Attributes as FastingSession;
    }

    async listFastingSessions(userId: string, limit: number = 20, nextToken?: string): Promise<{
        sessions: FastingSession[];
        nextToken?: string;
    }> {
        const params: any = {
            TableName: this.fastingSessionTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false, // Most recent first
            Limit: limit
        };

        if (nextToken) {
            params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
        }

        const result = await docClient.send(new QueryCommand(params));

        return {
            sessions: result.Items as FastingSession[] || [],
            nextToken: result.LastEvaluatedKey
                ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
                : undefined
        };
    }

    async getFastingStats(userId: string): Promise<{
        totalFastingHours: number;
        completedSessions: number;
    }> {
        const result = await docClient.send(new QueryCommand({
            TableName: this.fastingSessionTable,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'status = :status',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':status': 'completed'
            }
        }));

        const completedSessions = result.Items?.length || 0;
        let totalFastingHours = 0;

        for (const session of result.Items || []) {
            if (session.startTime && session.endTime) {
                const start = new Date(session.startTime);
                const end = new Date(session.endTime);
                const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                totalFastingHours += hours;
            }
        }

        return { totalFastingHours, completedSessions };
    }
} 