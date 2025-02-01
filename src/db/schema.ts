import {
  integer,
  pgTable,
  varchar,
  bigint,
  timestamp,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const channels = pgTable("channels", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  telegram_channel_id: bigint("telegram_channel_id", {
    mode: "bigint",
  }).unique(),
  channel_name: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ precision: 6, withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  deleted_at: timestamp("deleted_at"),
});

export const channelsRelations = relations(channels, ({ many }) => ({
  messages: many(messages),
}));

export const messages = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  message: text().notNull(),
  telegram_message_id: integer(),
  telegram_created_at: timestamp("telegram_created_at").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  deleted_at: timestamp("deleted_at"),
  channel_id: bigint("channel_id", {
    mode: "bigint",
  })
    .notNull()
    .references(() => channels.id),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channel_id],
    references: [channels.id],
  }),
}));

export const messagesRelationsToAnswers = relations(messages, ({ many }) => ({
  answers: many(answers),
}));

export const questions = pgTable("questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  question: text().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  deleted_at: timestamp("deleted_at"),
});

export const questionsRelationsToAnswers = relations(questions, ({ many }) => ({
  answers: many(answers),
}));

export const answers = pgTable("answers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  question_id: integer()
    .notNull()
    .references(() => questions.id),
  message_id: integer()
    .notNull()
    .references(() => messages.id),
  answer: text().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  deleted_at: timestamp("deleted_at"),
});

export const answersRelationsToMessages = relations(answers, ({ one }) => ({
  message: one(messages, {
    fields: [answers.message_id],
    references: [messages.id],
  }),
}));

export const answersRelationsToQuestions = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.question_id],
    references: [questions.id],
  }),
}));
