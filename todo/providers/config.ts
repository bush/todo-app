import path from "path";
import Joi from "joi";
import fs from "fs";
import { parse } from "yaml";
import Container from "../../common/ioc/container";
import { NimkeeDBConfig, NimkeeDBType } from "../../common/interface";
import { NimkeeDBStorageMapper } from "../todo/interface";
import { HttpConfig } from "../../common/interface";

const configFile = fs.readFileSync(
  path.join(process.cwd(), "config.yml"),
  "utf8"
);

const config = parse(configFile);

const envVarsSchema = Joi.object({
  app: Joi.object({
    env: Joi.string().valid("production", "development", "test").required(),
    port: Joi.number().default(3000),
    middleware: Joi.object({
      http: Joi.object({
        urlencoded: Joi.object({
          parameterLimit: Joi.number().default(20),
        }),
        json: Joi.object({
          limit: Joi.alternatives(
            Joi.number().default(1e6),
            Joi.string()
          ).default("1mb"),
        }),
      }),
    }),
    todo: Joi.object({
      route: Joi.string().required(),
      storage: Joi.object({
        mapper: Joi.object({
          type: Joi.string()
            .valid(
              NimkeeDBStorageMapper.DYNAMODB,
              NimkeeDBStorageMapper.ELECTRODB,
              NimkeeDBStorageMapper.MONGODB,
              NimkeeDBStorageMapper.MONGOOSE
            ).required(),
          config: Joi.object({  
            table: Joi.string().required()
          }).required(),
        }).required(),
        database: Joi.object({
          type: Joi.alternatives()
            .conditional(Joi.ref("...mapper.type"), [
              {
                is: NimkeeDBStorageMapper.ELECTRODB,
                then: Joi.string().valid(NimkeeDBType.DYNAMODB).required(),
              },
              {
                is: NimkeeDBStorageMapper.MONGOOSE,
                then: Joi.string().valid(NimkeeDBType.MONGODB).required(),
              },
            ])
            .messages({
              "any.only": `The storage mapper type '${config.app.todo.storage.mapper.type}' does not support the database type '${config.app.todo.storage.database.type}'`,
            }),
          config: Joi.alternatives().conditional("type", [
            {
              is: NimkeeDBType.DYNAMODB,
              then: Joi.object({
                region: Joi.string().valid("us-east-1", "us-west-2"),
              }),
            },
            {
              is: NimkeeDBType.MONGODB,
              then: Joi.object({
                url: Joi.string().required(),
              }),
            },
          ]).required(),
        }).required(),
      }).required(),
    }).required(),
  }), 
})
  .required()
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "path" } })
  .validate(config);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export type AppConfig = {
  app: {
    env: string;
    port: number;
    middleware: {
      http: HttpConfig;
    };
    todo: {
      route: string;
      storage: {
        mapper: {
          type: NimkeeDBStorageMapper;
          config: {
            table: string;
          };
        };
        database: {
          type: NimkeeDBType;
          config: NimkeeDBConfig;
        };
      };
    };
    };
};

export interface IConfigProvider extends Container {
  config: AppConfig;
}

export default function (c: Container) {
  c.service("config", (c) => config);
}
