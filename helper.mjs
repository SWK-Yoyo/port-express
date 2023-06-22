import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export function trimObject(obj) {
    for (const [key, val] of Object.entries(obj)) {
        if (val) {
            obj[key] = val.trim()
        }
    }
    return obj
}

export function decodeJWT(token) {
    try {
        var decoded = jwt.verify(token, process.env.TOKEN_KEY);
        return decoded
    } catch (err) {
        return false
    }

}