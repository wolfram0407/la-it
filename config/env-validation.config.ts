import * as Joi from "joi";


export const configModuleValidationSchema =
  Joi.object({
    JWT_SECRET_KEY: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_NAME: Joi.string().required(),
    DB_SYNC: Joi.boolean().required(),
    PASSWORD_HASH_ROUNDS: Joi.number().required().default(10)
  })