import { MongoClient } from "mongodb";
import { DocumentClient } from "electrodb";
import { Request, Response, NextFunction } from "express";

export enum NimkeeDBStorageMapper {
  DYNAMODB='dynamodb',
  ELECTRODB='electrodb',
  MONGODB='mongodb',
  MONGOOSE='mongoose'
}

export type ElectroDBMapperConfig = {
  table: string;
}

export type TodoRepoOptions = {
  tbd: string;
};

export type NimkeeDBMapperConfig = ElectroDBMapperConfig;
export type TodoItem = { id: string; note: string };

export interface ITodoController {
  create(todo: TodoItem): Promise<void>;
}

export interface ITodoRepo {
  create(todo: TodoItem): Promise<void>;
}

export interface ITodoHandlers {
  post(): (req: Request, res: Response, next: NextFunction) => Promise<void>
}
