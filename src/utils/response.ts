import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types';

export const createResponse = (
    statusCode: number,
    body: ApiResponse,
    headers: Record<string, string> = {}
): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            ...headers
        },
        body: JSON.stringify(body)
    };
};

export const successResponse = <T>(data: T, message?: string): APIGatewayProxyResult => {
    return createResponse(200, {
        success: true,
        data,
        message
    });
};

export const errorResponse = (error: string, statusCode: number = 400): APIGatewayProxyResult => {
    return createResponse(statusCode, {
        success: false,
        error
    });
};

export const unauthorizedResponse = (): APIGatewayProxyResult => {
    return createResponse(401, {
        success: false,
        error: 'Unauthorized'
    });
};

export const forbiddenResponse = (): APIGatewayProxyResult => {
    return createResponse(403, {
        success: false,
        error: 'Forbidden'
    });
};

export const notFoundResponse = (): APIGatewayProxyResult => {
    return createResponse(404, {
        success: false,
        error: 'Not found'
    });
};

export const validationErrorResponse = (errors: string[]): APIGatewayProxyResult => {
    return createResponse(400, {
        success: false,
        error: 'Validation failed',
        data: { errors }
    });
}; 