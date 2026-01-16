// lib/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client with environment variables
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);

// User interface
export interface User {
  id: string; // Firebase UID (Partition Key)
  phone: string;
  name?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

const TABLE_NAME = "Inkhub_users";

/**
 * Get user by ID (Firebase UID)
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id: userId,
      },
    });

    const response = await ddbDocClient.send(command);
    return response.Item as User | null;
  } catch (error) {
    console.error("Error fetching user from DynamoDB:", error);
    throw error;
  }
}

/**
 * Create or update user in DynamoDB
 * If user exists, updates the record; if not, creates a new one
 * New values take precedence over existing values
 */
export async function createOrUpdateUser(userData: {
  id: string;
  phone: string;
  name?: string;
  email?: string;
}): Promise<User> {
  try {
    const now = new Date().toISOString();
    
    // Check if user already exists
    const existingUser = await getUser(userData.id);
    
    const user: User = {
      id: userData.id,
      phone: userData.phone, // Always update phone
      // Use new value if provided, otherwise keep existing value
      name: userData.name !== undefined ? userData.name : existingUser?.name,
      email: userData.email !== undefined ? userData.email : existingUser?.email,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
    });

    await ddbDocClient.send(command);
    return user;
  } catch (error) {
    console.error("Error creating/updating user in DynamoDB:", error);
    throw error;
  }
}
