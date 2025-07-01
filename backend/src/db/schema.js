"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.answersRelationsToQuestions = exports.answersRelationsToMessages = exports.answers = exports.questionsRelationsToAnswers = exports.questions = exports.messagesRelationsToAnswers = exports.messagesRelations = exports.messages = exports.channelsRelations = exports.channels = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
exports.channels = (0, pg_core_1.pgTable)("channels", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    telegram_channel_id: (0, pg_core_1.bigint)("telegram_channel_id", {
        mode: "bigint",
    }).unique(),
    channel_name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    created_at: (0, pg_core_1.timestamp)({ precision: 6, withTimezone: true })
        .notNull()
        .defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))))
        .$onUpdate(function () { return (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))); }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at"),
});
exports.channelsRelations = (0, drizzle_orm_1.relations)(exports.channels, function (_a) {
    var many = _a.many;
    return ({
        messages: many(exports.messages),
    });
});
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    message: (0, pg_core_1.text)().notNull(),
    telegram_message_id: (0, pg_core_1.integer)(),
    telegram_created_at: (0, pg_core_1.timestamp)("telegram_created_at").notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))))
        .$onUpdate(function () { return (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))); }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at"),
    channel_id: (0, pg_core_1.integer)()
        .notNull()
        .references(function () { return exports.channels.id; }),
});
exports.messagesRelations = (0, drizzle_orm_1.relations)(exports.messages, function (_a) {
    var one = _a.one;
    return ({
        channel: one(exports.channels, {
            fields: [exports.messages.channel_id],
            references: [exports.channels.id],
        }),
    });
});
exports.messagesRelationsToAnswers = (0, drizzle_orm_1.relations)(exports.messages, function (_a) {
    var many = _a.many;
    return ({
        answers: many(exports.answers),
    });
});
exports.questions = (0, pg_core_1.pgTable)("questions", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    question: (0, pg_core_1.text)().notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))))
        .$onUpdate(function () { return (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))); }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at"),
});
exports.questionsRelationsToAnswers = (0, drizzle_orm_1.relations)(exports.questions, function (_a) {
    var many = _a.many;
    return ({
        answers: many(exports.answers),
    });
});
exports.answers = (0, pg_core_1.pgTable)("answers", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    question_id: (0, pg_core_1.integer)()
        .notNull()
        .references(function () { return exports.questions.id; }),
    message_id: (0, pg_core_1.integer)()
        .notNull()
        .references(function () { return exports.messages.id; }),
    answer: (0, pg_core_1.text)().notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))))
        .$onUpdate(function () { return (0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"]))); }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at"),
});
exports.answersRelationsToMessages = (0, drizzle_orm_1.relations)(exports.answers, function (_a) {
    var one = _a.one;
    return ({
        message: one(exports.messages, {
            fields: [exports.answers.message_id],
            references: [exports.messages.id],
        }),
    });
});
exports.answersRelationsToQuestions = (0, drizzle_orm_1.relations)(exports.answers, function (_a) {
    var one = _a.one;
    return ({
        question: one(exports.questions, {
            fields: [exports.answers.question_id],
            references: [exports.questions.id],
        }),
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
