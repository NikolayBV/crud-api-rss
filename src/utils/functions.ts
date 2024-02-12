import {User} from "./types";
import { v4 as uuidv4 } from 'uuid';

export const formatUser = (user: string): User | undefined => {
    const parseUser = JSON.parse(user);
    const {username, age, hobbies} = parseUser;
    if (username && age && hobbies.length) {
        return {...parseUser, id: uuidv4()}
    } else {
        return undefined;
    }
}
