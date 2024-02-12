import http from "node:http";
import {API_METHODS} from "../utils/constants";
import {validate} from "uuid";
import {formatUser} from "../utils/functions";
import {UsersController} from "../db/UsersController";

const usersService = new UsersController();

const server = http.createServer((req, res) => {
    const {method, url, headers} = req;
    let body: string;
    let splitUrl: string[];
    let id: string;
    switch (method) {
        case API_METHODS.GET:
            if (url === '/api/users') {
                res.statusCode = 200;
                res.end(JSON.stringify(usersService.getUsers()));
            } else if (url && /^\/api\/users\/[a-f0-9-]+$/.test(url)) {
                splitUrl = url.split('/')
                id = splitUrl[splitUrl.length - 1]
                if (validate(id)) {
                    const user = usersService.getUser(id)
                    if (user) {
                        res.statusCode = 200;
                        res.end(user)
                    } else {
                        res.statusCode = 404;
                        res.end('User does not exist')
                    }
                } else {
                    res.statusCode = 400;
                    res.end('Not valid id (not uuid)')
                }
            } else {
                res.statusCode = 404;
                res.end('Something Wrong')
            }
            break;
        case API_METHODS.POST:
            body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const user = formatUser(body)
                if (user) {
                    const createdUser = usersService.setUser(user)
                    res.statusCode = 201
                    res.end(createdUser)
                } else {
                    res.statusCode = 400
                    res.end('Body does not contain required fields')
                }
            });
            break;
        case API_METHODS.PUT:
            body = '';
            splitUrl = url!.split('/')
            id = splitUrl[splitUrl.length - 1]
            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', () => {
                if (validate(id)) {
                    const updatedUser = usersService.setUser(JSON.parse(body))
                    if (updatedUser) {
                        res.statusCode = 200;
                        res.end(updatedUser)
                    } else {
                        res.statusCode = 404;
                        res.end('User does not exist')
                    }
                } else {
                    res.statusCode = 400;
                    res.end('Not valid id (not uuid)')
                }
            });
            break;
        case API_METHODS.DELETE:
            splitUrl = url!.split('/')
            id = splitUrl[splitUrl.length - 1]
            if (validate(id)) {
                const user = usersService.getUser(id)
                const parseUser = JSON.parse(user);
                if (user) {
                    usersService.deleteUser(parseUser.id)
                    res.statusCode = 204;
                    res.end('User has been deleted')
                } else {
                    res.statusCode = 404;
                    res.end('User does not exist')
                }
            } else {
                res.statusCode = 400;
                res.end('Not valid id (not uuid)')
            }
            break;
        default:
            res.statusCode = 404;
            res.end('Something wrong')
    }
});

process.on('message', (message: {type: string, url: string, data: string| undefined}) => {
    const {type, url, data} = message;
    let body: string;
    let splitUrl: string[];
    let id: string;
    switch (type) {
        case API_METHODS.GET:
            if (url === '/api/users') {
                if (process.send) {
                    process.send(JSON.stringify(usersService.getUsers()));
                }
            } else if (url && /^\/api\/users\/[a-f0-9-]+$/.test(url)) {
                splitUrl = url.split('/')
                id = splitUrl[splitUrl.length - 1]
                if (validate(id)) {
                    const user = usersService.getUser(id)
                    if (user) {
                        if (process.send) {
                            process.send(user)
                        }
                    } else {
                        if (process.send) {
                            process.send('User does not exist')
                        }
                    }
                } else {
                    if (process.send) {
                        process.send('Not valid id (not uuid)')
                    }
                }
            } else {
                if (process.send) {
                    process.send('Something Wrong')
                }
            }
            break;
        case API_METHODS.POST:
            body = data || '';
            const user = formatUser(body)
            if (user) {
                const createdUser = usersService.setUser(user)
                if(process.send) {
                    process.send(createdUser)
                }
            } else {
                if(process.send) {
                    process.send('Body does not contain required fields')
                }
            }
            break;
        case API_METHODS.PUT:
            body = data || '';
            splitUrl = url!.split('/')
            id = splitUrl[splitUrl.length - 1]
            if (validate(id)) {
                const updatedUser = usersService.setUser(JSON.parse(body))
                if (updatedUser) {
                    if(process.send) {
                        process.send(updatedUser)
                    }
                } else {
                    if(process.send) {
                        process.send('User does not exist')
                    }
                }
            } else {
                if(process.send) {
                    process.send('Not valid id (not uuid)')
                }
            }
            break;
        case API_METHODS.DELETE:
            splitUrl = url!.split('/')
            id = splitUrl[splitUrl.length - 1]
            if (validate(id)) {
                const user = usersService.getUser(id)
                const parseUser = JSON.parse(user);
                if (user) {
                    usersService.deleteUser(parseUser.id)
                    if(process.send) {
                        process.send('User has been deleted')
                    }
                } else {
                    if(process.send) {
                        process.send('User does not exist')
                    }
                }
            } else {
                if(process.send) {
                    process.send('Not valid id (not uuid)')
                }
            }
            break;
        default:
            if(process.send) {
                process.send('Something wrong')
            }
    }
});

export default server;
