# Fasting Tracker Backend

A complete serverless backend for a fasting tracker application built with AWS CDK, TypeScript, and AWS services.

## 🏗️ Architecture

- **AWS Lambda** - Serverless compute for API endpoints
- **AWS API Gateway** - REST API management
- **Amazon DynamoDB** - NoSQL database for user data and fasting sessions
- **AWS Cognito** - User authentication and authorization
- **AWS CDK** - Infrastructure as Code in TypeScript

## 🚀 Features

### Authentication & User Management
- Email/password signup and login
- Google OAuth integration
- User profile onboarding with health information
- Secure JWT token-based authentication

### Fasting Tracking
- Start custom fasting sessions with target hours
- Start immediate fasting sessions (track from current time)
- End active fasting sessions
- Real-time fasting status and progress tracking

### User Profile Management
- Store user health information (weight, diseases, fasting goals)
- Update profile information
- Track fasting statistics and history

### API Endpoints
- `POST /api/v1/user/onboarding` - Complete user onboarding
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `POST /api/v1/fasting/start` - Start a fasting session
- `POST /api/v1/fasting/end` - End a fasting session
- `GET /api/v1/fasting/stats` - Get fasting statistics
- `GET /api/v1/fasting/sessions` - List fasting sessions

## 📋 Prerequisites

- Node.js 18+ 
- AWS CLI configured with appropriate permissions
- AWS CDK CLI installed globally
- TypeScript knowledge

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fasting-tracker-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install AWS CDK globally (if not already installed)**
   ```bash
   npm install -g aws-cdk
   ```

4. **Bootstrap CDK (first time only)**
   ```bash
   cdk bootstrap
   ```

5. **Deploy the infrastructure**
   ```bash
   npm run deploy
   ```

## 🗄️ Database Schema

### UserProfile Table
```typescript
{
  userId: string;           // Partition key
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
```

### FastingSession Table
```typescript
{
  sessionId: string;        // Partition key
  userId: string;           // Sort key
  startTime: string;
  endTime?: string;
  targetHours?: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

## 🔧 Configuration

### Environment Variables
The following environment variables are automatically set by CDK:
- `USER_PROFILE_TABLE` - DynamoDB table name for user profiles
- `FASTING_SESSION_TABLE` - DynamoDB table name for fasting sessions
- `USER_POOL_ID` - Cognito User Pool ID
- `USER_POOL_CLIENT_ID` - Cognito User Pool Client ID
- `IDENTITY_POOL_ID` - Cognito Identity Pool ID

### Cognito Configuration
Update the callback URLs in `src/lib/fasting-tracker-stack.ts`:
```typescript
callbackUrls: [
  'http://localhost:3000/callback', // For local development
  'https://yourdomain.com/callback', // Replace with your domain
],
logoutUrls: [
  'http://localhost:3000/logout', // For local development
  'https://yourdomain.com/logout', // Replace with your domain
],
```

## 📡 API Documentation

### Authentication
All API endpoints require authentication via Cognito JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Endpoints

#### User Onboarding
```http
POST /api/v1/user/onboarding
Content-Type: application/json

{
  "name": "John Doe",
  "dateOfBirth": "1990-01-01",
  "currentWeight": 70.5,
  "diseases": ["diabetes", "hypertension"],
  "fastingGoals": ["weight_loss", "mental_clarity"]
}
```

#### Update Profile
```http
PUT /api/v1/user/profile
Content-Type: application/json

{
  "targetWeight": 65.0,
  "diseases": ["diabetes"],
  "currentWeight": 68.0
}
```

#### Start Fasting Session
```http
POST /api/v1/fasting/start
Content-Type: application/json

{
  "targetHours": 16
}
```

#### End Fasting Session
```http
POST /api/v1/fasting/end
Content-Type: application/json

{
  "sessionId": "session-uuid"
}
```

#### Get Fasting Statistics
```http
GET /api/v1/fasting/stats
```

#### List Fasting Sessions
```http
GET /api/v1/fasting/sessions?limit=20&nextToken=token
```

## 🧪 Testing

### Local Development
1. Install dependencies in the layer:
   ```bash
   cd src/layer/nodejs
   npm install
   cd ../../..
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy for testing:
   ```bash
   npm run deploy
   ```

### Testing API Endpoints
Use tools like Postman or curl to test the endpoints. Remember to:
1. Authenticate with Cognito first
2. Include the JWT token in the Authorization header
3. Use the API Gateway URL from the CDK outputs

## 🔒 Security

- All endpoints are protected with Cognito JWT authentication
- DynamoDB tables use least-privilege IAM policies
- CORS is configured for secure cross-origin requests
- Input validation using Zod schemas
- Error handling without exposing sensitive information

## 🚀 Deployment

### Development
```bash
npm run deploy
```

### Production
1. Update the CDK stack to use `RemovalPolicy.RETAIN` for production
2. Configure proper domain names in Cognito
3. Set up monitoring and alerting
4. Deploy with production environment variables

### Destroy Infrastructure
```bash
npm run destroy
```

## 📊 Monitoring

- CloudWatch Logs for Lambda function logs
- CloudWatch Metrics for API Gateway and Lambda performance
- DynamoDB CloudWatch metrics for database performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the CloudWatch logs for error details
2. Verify your AWS credentials and permissions
3. Ensure all environment variables are properly set
4. Check the API Gateway logs for request/response details # fasting-backend
