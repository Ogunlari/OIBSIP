import { env } from '../config/env.js';
import * as memoryStore from './memory.js';
import * as mongoStore from './mongo.js';

export const store = env.mongoUri ? mongoStore : memoryStore;
export const storageMode = env.mongoUri ? 'mongodb' : 'memory';
