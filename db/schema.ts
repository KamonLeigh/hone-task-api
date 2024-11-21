import {
  sqliteTable as table,
  text,
  integer,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "@hono/zod-openapi";
import { generateKey as createId } from "../util";

export const users = table("users", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  name: text("name").notNull(),
  hash: text("hash").notNull(),
  salt: text("salt").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const selectUsersSchema = createSelectSchema(users).omit({
  hash: true,
  salt: true,
  createdAt: true,
});

export const insertUsersSchema = createInsertSchema(users, {
  name: (schema: any) => schema.name.min(1).max(20),
})
  .omit({
    id: true,
    createdAt: true,
    hash: true,
    salt: true,
  })
  .extend({
    password: z.string().min(4).max(20),
  });

export const requestSchema = insertUsersSchema.pick({
  name: true,
  password: true,
});

export const projects = table(
  "projects",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text()
      .notNull()
      .$default(() => createId()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    updatedAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
  }),
);

export const selectProjectsSchema = createSelectSchema(projects).omit({
  id: true,
});

export const insertProjectsSchema = createInsertSchema(projects, {
  name: (schema: any) => schema.name.min(1).max(40),
}).omit({
  id: true,
  slug: true,
});

export type CreateProjectBody = z.infer<typeof insertProjectsSchema>;

export const tasks = table(
  "tasks",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    slug: text()
      .notNull()
      .$default(() => createId()),
    name: text("name").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.slug),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    updatedAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
  }),
);

export const selectTasksSchema = createSelectSchema(tasks).omit({
  id: true,
});

export const insertTasksSchema = createInsertSchema(tasks, {
  name: (schema: any) => schema.name.min(1).max(400),
}).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const comments = table(
  "comments",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    comment: text("comment").notNull(),
    slug: text()
      .notNull()
      .$default(() => createId()),
    authorId: text()
      .notNull()
      .references(() => users.id),
    taskId: text()
      .notNull()
      .references(() => tasks.slug),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    updatedAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
  }),
);

export const selectCommentsSchema = createSelectSchema(comments).omit({
  id: true,
});

export const insertCommentsSchema = createInsertSchema(comments, {
  comment: (schema: any) => schema.comment.min(5).max(400),
}).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  tasks: many(tasks),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  author: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.slug],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.slug],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
