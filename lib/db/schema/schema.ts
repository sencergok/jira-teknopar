import { pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Rol enum'ını tanımlayalım
export const ProjectRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type ProjectRoleType = typeof ProjectRole[keyof typeof ProjectRole];

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectMembers = pgTable('project_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 50 }).notNull().default(ProjectRole.MEMBER),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('todo'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  task_order: text('task_order').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// İlişkileri tanımlayalım
export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects, { relationName: 'createdBy' }),
  projectMemberships: many(projectMembers),
  assignedTasks: many(tasks, { relationName: 'assignedTo' }),
  createdTasks: many(tasks, { relationName: 'createdBy' }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
    relationName: 'createdBy',
  }),
  members: many(projectMembers),
  tasks: many(tasks),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: 'assignedTo',
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: 'createdBy',
  }),
}));

