import {User} from "../utils/types";
import { validate } from 'uuid';

export class UsersController {
    public users: Map<string, User>
    constructor() {
        this.users = new Map<string, User>()
    }

    getUsers() {
        const users = Array.from(this.users.values());
        return users.length ? users : [];
    }

    getUser(key: string) {
        const user = this.users.get(key)
        return JSON.stringify(user)
    }

    setUser(userObj: User) {
        this.users.set(userObj.id, userObj);
        return JSON.stringify(this.users.get(userObj.id));
    }

    setUsers(users: User[]) {
        if (users.length) {
            users.forEach((user) => {
                this.users.set(user.id, user)
            })
        }
    }

    putUser(user: string) {
        const parseUser = JSON.parse(user) as User;
        if (validate(parseUser.id)) {
            this.users.set(parseUser.id, parseUser);
            return JSON.stringify(this.users.get(parseUser.id));
        } else {
            return undefined;
        }
    }

    deleteUser(key: string) {
        this.users.delete(key);
    }
}
