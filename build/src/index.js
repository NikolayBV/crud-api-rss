"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const server_1 = __importDefault(require("./server/server"));
const PORT = process.env.PORT || 3000;
server_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
