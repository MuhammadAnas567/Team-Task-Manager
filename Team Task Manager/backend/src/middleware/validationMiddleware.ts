// backend/src/middleware/validationMiddleware.ts

import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';

type RequestLocation = 'body' | 'params' | 'query';

export const validate =
  (schema: ObjectSchema, location: RequestLocation = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[location], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(422).json({
        message: 'Validation failed',
        details: error.details.map((detail) => detail.message),
      });
    }

    if (location === 'body') {
      req.body = value;
    } else if (location === 'query') {
      res.locals.validatedQuery = value;
    } else {
      req.params = value;
    }

    return next();
  };
