"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const sendMail_1 = require("./lib/mail/sendMail");
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000"
}));
app.post("/api/send-mail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, subject, body } = req.body;
    try {
        yield (0, sendMail_1.sendTestEmail)(from, to, subject, body);
        res.status(200).json({ data: "mail sent" });
    }
    catch (error) {
        res.status(500).json({ data: `mail not sent ${error}` });
    }
}));
app.listen(8000, () => console.log("listening on port", 8000));
