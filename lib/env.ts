import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGODB_URI: z.string().min(16, "MONGODB_URI is required"),
    MONGODB_DB: z.string().min(3, "MONGODB_DB is required")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables!", parsedEnv.error.format());
    throw new Error("❌ Missing or invalid environment variables. Check your .env file.");
}

export const env = parsedEnv.data;