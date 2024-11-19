import { z } from "@hono/zod-openapi";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  DEBUG: z.coerce.boolean().default(false),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z
    .string()
    .min(10, { message: "Must be more than 10 characters" }),
  JWT_EXPIRE_IN: z.string(),
  PASSWORD_SALT: z.string(),
});

// export const config = createEnvSchema({
//   ...envSchema,
//   // Add environment-specific overrides or additional variables
//   ...(process.env.NODE_ENV === 'test' && {
//     DATABASE_URL: z.string().url().default('postgresql://test:test@localhost:5432/testdb'),
//     PORT: z.string().transform(Number).default('5000'),
//   }),
//   ...(process.env.NODE_ENV === 'development' && {
//     PORT: z.string().transform(Number).default('3000'),
//   })
// })

const config = envSchema.parse(Bun.env);

export type Config = z.infer<typeof envSchema>;

const environmentConfig = {
  isDevelopment: config.NODE_ENV === "development",
  isProduction: config.NODE_ENV === "production",
};

const finalCong: Config & typeof environmentConfig = {
  ...config,
  ...environmentConfig,
};

export default finalCong;
