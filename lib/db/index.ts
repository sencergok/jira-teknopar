import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema';

const connectionString = process.env.DATABASE_URL!;

// Sorgu client'ı
const queryClient = postgres(connectionString);

// Drizzle instance'ı
export const db = drizzle(queryClient, { schema });

// Tip tanımlamaları için
export type Schema = typeof schema; 