"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const uuid_1 = require("uuid");
class UsersController {
    constructor() {
        this.users = new Map();
    }
    getUsers() {
        const users = Array.from(this.users.values());
        return users.length ? users : [];
    }
    getUser(key) {
        const user = this.users.get(key);
        return JSON.stringify(user);
    }
    setUser(userObj) {
        this.users.set(userObj.id, userObj);
        return JSON.stringify(this.users.get(userObj.id));
    }
    putUser(user) {
        const parseUser = JSON.parse(user);
        if ((0, uuid_1.validate)(parseUser.id)) {
            this.users.set(parseUser.id, parseUser);
            return JSON.stringify(this.users.get(parseUser.id));
        }
        else {
            return undefined;
        }
    }
    deleteUser(key) {
        this.users.delete(key);
    }
}
exports.UsersController = UsersController;
exports.default = UsersController;
