import { NextFunction, Response, Request } from "express";
import Joi from "joi";
import { generateValidationErrorMessage } from "../generate-validation-msg";

export const validatorMiddleware = (
  validator: Joi.ObjectSchema<any>,
  location: 'body' | 'query' | 'params'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // console.log(req[location]);
        const data = req[location];
        const { error, value } = validator.validate(data, { stripUnknown: true });

        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        req[location] = value;
        next();
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };
  };