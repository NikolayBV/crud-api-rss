"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
require("dotenv/config");
const constants_1 = require("./utils/constants");
const UsersController_1 = __importDefault(require("./db/UsersController"));
const functions_1 = require("./utils/functions");
const uuid_1 = require("uuid");
const usersService = new UsersController_1.default();
const server = (0, http_1.createServer)((req, res) => {
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
