import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashPassword = (password) => bcrypt.hash(password, 12);

export const comparePassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);

export const signToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

export const randomToken = () => crypto.randomBytes(32).toString('hex');

export const newId = () => crypto.randomUUID();
