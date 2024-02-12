"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUser = void 0;
const uuid_1 = require("uuid");
const formatUser = (user) => {
    const parseUser = JSON.parse(user);
    const { username, age, hobbies } = parseUser;
    if (username && age && hobbies.length) {
        return Object.assign(Object.assign({}, parseUser), { id: (0, uuid_1.v4)() });
    }
    else {
        return undefined;
    }
};
exports.formatUser = formatUser;
