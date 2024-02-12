"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const constants_1 = require("../utils/constants");
const uuid_1 = require("uuid");
const functions_1 = require("../utils/functions");
const UsersController_1 = require("../db/UsersController");
const usersService = new UsersController_1.UsersController();
const server = node_http_1.default.createServer((req, res) => {
    const { method, url, headers } = req;
    let body;
    let splitUrl;
    let id;
    switch (method) {
        case constants_1.API_METHODS.GET:
            if (url === '/api/users') {
                res.statusCode = 200;
                res.end(JSON.stringify(usersService.getUsers()));
            }
            else if (url && /^\/api\/users\/[a-f0-9-]+$/.test(url)) {
                splitUrl = url.split('/');
                id = splitUrl[splitUrl.length - 1];
                if ((0, uuid_1.validate)(id)) {
                    const user = usersService.getUser(id);
                    if (user) {
                        res.statusCode = 200;
                        res.end(user);
                    }
                    else {
                        res.statusCode = 404;
                        res.end('User does not exist');
                    }
                }
                else {
                    res.statusCode = 400;
                    res.end('Not valid id (not uuid)');
                }
            }
            else {
                res.statusCode = 404;
                res.end('Something Wrong');
            }
            break;
        case constants_1.API_METHODS.POST:
            body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const user = (0, functions_1.formatUser)(body);
                if (user) {
                    const createdUser = usersService.setUser(user);
                    res.statusCode = 201;
                    res.end(createdUser);
                }
                else {
                    res.statusCode = 400;
                    res.end('Body does not contain required fields');
                }
            });
            break;
        case constants_1.API_METHODS.PUT:
            body = '';
            splitUrl = url.split('/');
            id = splitUrl[splitUrl.length - 1];
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                if ((0, uuid_1.validate)(id)) {
                    const updatedUser = usersService.setUser(JSON.parse(body));
                    if (updatedUser) {
                        res.statusCode = 200;
                        res.end(updatedUser);
                    }
                    else {
                        res.statusCode = 404;
                        res.end('User does not exist');
                    }
                }
                else {
                    res.statusCode = 400;
                    res.end('Not valid id (not uuid)');
                }
            });
            break;
        case constants_1.API_METHODS.DELETE:
            splitUrl = url.split('/');
            id = splitUrl[splitUrl.length - 1];
            if ((0, uuid_1.validate)(id)) {
                const user = usersService.getUser(id);
                const parseUser = JSON.parse(user);
                if (user) {
                    usersService.deleteUser(parseUser.id);
                    res.statusCode = 204;
                    res.end('User has been deleted');
                }
                else {
                    res.statusCode = 404;
                    res.end('User does not exist');
                }
            }
            else {
                res.statusCode = 400;
                res.end('Not valid id (not uuid)');
            }
            break;
        default:
            res.statusCode = 404;
            res.end('Something wrong');
    }
});
process.on('message', (message) => {
    const { type, url, data } = message;
    let body;
    let splitUrl;
    let id;
    switch (type) {
        case constants_1.API_METHODS.GET:
            if (url === '/api/users') {
                if (process.send) {
                    process.send(JSON.stringify(usersService.getUsers()));
                }
            }
            else if (url && /^\/api\/users\/[a-f0-9-]+$/.test(url)) {
                splitUrl = url.split('/');
                id = splitUrl[splitUrl.length - 1];
                if ((0, uuid_1.validate)(id)) {
                    const user = usersService.getUser(id);
                    if (user) {
                        if (process.send) {
                            process.send(user);
                        }
                    }
                    else {
                        if (process.send) {
                            process.send('User does not exist');
                        }
                    }
                }
                else {
                    if (process.send) {
                        process.send('Not valid id (not uuid)');
                    }
                }
            }
            else {
                if (process.send) {
                    process.send('Something Wrong');
                }
            }
            break;
        case constants_1.API_METHODS.POST:
            body = data || '';
            const user = (0, functions_1.formatUser)(body);
            if (user) {
                const createdUser = usersService.setUser(user);
                if (process.send) {
                    process.send(createdUser);
                }
            }
            else {
                if (process.send) {
                    process.send('Body does not contain required fields');
                }
            }
            break;
        case constants_1.API_METHODS.PUT:
            body = data || '';
            splitUrl = url.split('/');
            id = splitUrl[splitUrl.length - 1];
            if ((0, uuid_1.validate)(id)) {
                const updatedUser = usersService.setUser(JSON.parse(body));
                if (updatedUser) {
                    if (process.send) {
                        process.send(updatedUser);
                    }
                }
                else {
                    if (process.send) {
                        process.send('User does not exist');
                    }
                }
            }
            else {
                if (process.send) {
                    process.send('Not valid id (not uuid)');
                }
            }
            break;
        case constants_1.API_METHODS.DELETE:
            splitUrl = url.split('/');
            id = splitUrl[splitUrl.length - 1];
            if ((0, uuid_1.validate)(id)) {
                const user = usersService.getUser(id);
                const parseUser = JSON.parse(user);
                if (user) {
                    usersService.deleteUser(parseUser.id);
                    if (process.send) {
                        process.send('User has been deleted');
                    }
                }
                else {
                    if (process.send) {
                        process.send('User does not exist');
                    }
                }
            }
            else {
                if (process.send) {
                    process.send('Not valid id (not uuid)');
                }
            }
            break;
        default:
            if (process.send) {
                process.send('Something wrong');
            }
    }
});
exports.default = server;
