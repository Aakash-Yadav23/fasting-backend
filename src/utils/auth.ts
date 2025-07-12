import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoUser } from '../types';

const cognitoClient = new CognitoIdentityProviderClient({});

export class AuthService {
    async getUserFromToken(accessToken: string): Promise<CognitoUser | null> {
        try {
            const command = new GetUserCommand({
                AccessToken: accessToken
            });

            const response = await cognitoClient.send(command);

            const user: CognitoUser = {
                sub: '',
                email: '',
                email_verified: false
            };

            for (const attribute of response.UserAttributes || []) {
                switch (attribute.Name) {
                    case 'sub':
                        user.sub = attribute.Value || '';
                        break;
                    case 'email':
                        user.email = attribute.Value || '';
                        break;
                    case 'email_verified':
                        user.email_verified = attribute.Value === 'true';
                        break;
                    case 'name':
                        user.name = attribute.Value;
                        break;
                    case 'given_name':
                        user.given_name = attribute.Value;
                        break;
                    case 'family_name':
                        user.family_name = attribute.Value;
                        break;
                    case 'picture':
                        user.picture = attribute.Value;
                        break;
                }
            }

            return user;
        } catch (error) {
            console.error('Error getting user from token:', error);
            return null;
        }
    }

    extractTokenFromHeaders(headers: Record<string, string>): string | null {
        const authHeader = headers.Authorization || headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    async authenticateRequest(headers: Record<string, string>): Promise<CognitoUser | null> {
        const token = this.extractTokenFromHeaders(headers);
        if (!token) {
            return null;
        }

        return await this.getUserFromToken(token);
    }
} 