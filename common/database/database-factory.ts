import { MongoClient } from "mongodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NimkeeDBType, NimkeeDBConfig, MongoDBConfig, DynamoDBConfig } from "./interface";

class DatabaseFactory {
  static create(dbType: NimkeeDBType, config: NimkeeDBConfig) {
    const dynamodbConfig = config as DynamoDBConfig;
    switch (dbType) {
      case NimkeeDBType.DYNAMODB:
        return new DynamoDBClient(dynamodbConfig);
      case NimkeeDBType.MONGODB:
        const mongoConfig = config as MongoDBConfig;
        return new MongoClient(mongoConfig.url, mongoConfig.options);
      default:
        return new DynamoDBClient(dynamodbConfig);
    }
  }
}

export default DatabaseFactory;
