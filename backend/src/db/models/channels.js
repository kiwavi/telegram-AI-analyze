"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareChannels = exports.saveChannels = exports.allChannels = void 0;
// all crud operations to deal with channels
var index_1 = require("../../index");
var schema_1 = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var allChannels = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.db.select().from(schema_1.channels)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.allChannels = allChannels;
var saveChannels = function (tel_channels) { return __awaiter(void 0, void 0, void 0, function () {
    var arr, res, _i, tel_channels_1, channel, obj;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                arr = [];
                for (_i = 0, tel_channels_1 = tel_channels; _i < tel_channels_1.length; _i++) {
                    channel = tel_channels_1[_i];
                    obj = {};
                    obj.telegram_channel_id = ((_a = channel === null || channel === void 0 ? void 0 : channel.id) === null || _a === void 0 ? void 0 : _a.value) || channel.telegram_channel_id;
                    obj.channel_name = (channel === null || channel === void 0 ? void 0 : channel.title) || channel.channel_name;
                    arr.push(obj);
                }
                if (!arr.length) return [3 /*break*/, 2];
                return [4 /*yield*/, index_1.db
                        .insert(schema_1.channels)
                        .values(arr)
                        .returning({ insertedId: schema_1.channels.id })];
            case 1:
                res = _b.sent();
                return [2 /*return*/, res];
            case 2: throw new Error("No rows to insert");
        }
    });
}); };
exports.saveChannels = saveChannels;
var compareChannels = function (tel_channels) { return __awaiter(void 0, void 0, void 0, function () {
    var query;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(tel_channels === null || tel_channels === void 0 ? void 0 : tel_channels.length)) return [3 /*break*/, 2];
                return [4 /*yield*/, index_1.db.execute((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["WITH temp_table(telegram_channel_id, channel_name) AS\n      (SELECT *\n       FROM jsonb_to_recordset(", ") AS x(telegram_channel_id bigint, channel_name varchar(255))),\n         current_table(telegram_channel_id, channel_name) AS\n      (SELECT telegram_channel_id,\n              channel_name\n       FROM channels)\n    SELECT *\n    FROM temp_table\n    EXCEPT\n    SELECT *\n    FROM current_table"], ["WITH temp_table(telegram_channel_id, channel_name) AS\n      (SELECT *\n       FROM jsonb_to_recordset(", ") AS x(telegram_channel_id bigint, channel_name varchar(255))),\n         current_table(telegram_channel_id, channel_name) AS\n      (SELECT telegram_channel_id,\n              channel_name\n       FROM channels)\n    SELECT *\n    FROM temp_table\n    EXCEPT\n    SELECT *\n    FROM current_table"])), JSON.stringify(tel_channels)))];
            case 1:
                query = _a.sent();
                return [2 /*return*/, query];
            case 2: throw new Error("No rows to compare");
        }
    });
}); };
exports.compareChannels = compareChannels;
var templateObject_1;
// await saveChannels([
//   {
//     telegram_channel_id: -1002098116995,
//     channel_name: "🇰🇪 The Kenya We Want 🇰🇪",
//   },
//   {
//     telegram_channel_id: -1001090406917,
//     channel_name: "Nairobi GNU/Linux User Group",
//   },
//   { telegram_channel_id: -1001387645188, channel_name: "RT News" },
//   { telegram_channel_id: -1001321385690, channel_name: "Al Jazeera English" },
//   { telegram_channel_id: -1001222973093, channel_name: "National Geographic" },
//   { telegram_channel_id: -1002111495264, channel_name: "ZYNERIS.COM" },
//   { telegram_channel_id: -1001942691032, channel_name: "African Stream" },
//   {
//     telegram_channel_id: -1001197600239,
//     channel_name: "React Developer Community Kenya",
//   },
//   {
//     telegram_channel_id: -1001836620031,
//     channel_name: "UNIswap-MEV節點礦池官方中文群",
//   },
//   { telegram_channel_id: -1001411818369, channel_name: "Dr Mumbi Show" },
// ]);
