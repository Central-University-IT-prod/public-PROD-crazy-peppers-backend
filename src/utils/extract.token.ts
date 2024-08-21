import { Request } from 'express';

export const extractToken = (request: Request) => {
  return request.headers?.authorization?.split(' ')[1];
};
