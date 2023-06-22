import express from 'express'
import db from './mongodb-config.mjs'
import { trimObject } from './helper.mjs'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const router = express.Router();
const usersCollection = db.collection('users')

const validate = {
    user: new RegExp(/^[a-zA-Z0-9!@#$%^&._-]{4,20}$/),
    name: new RegExp(/^[\u0E00-\u0E7Fa-zA-Z. -]{4,20}$/),
}
router.post('/login', async (req, res, next) => {
    try {
        const params = {
            username: req.body.username,
            password: req.body.password,
            rememberMe: req.body.remember
        }
        trimObject(params)
        if (!validate.user.test(params.username) || !validate.user.test(params.password)) {
            req.httpStatusCode = 400
            throw Error('Invalid params')
        }
        const findByUsername = await usersCollection.findOne({ username: params.username })
        if (!findByUsername) {
            req.httpStatusCode = 400
            throw Error('User not found')
        }
        if (!bcrypt.compare(params.password, findByUsername.password)) {
            req.httpStatusCode = 400
            throw Error('Password invalid')
        }
        const token = jwt.sign({
            id: findByUsername._id,
            firstname: findByUsername.firstname,
            lastname: findByUsername.lastname,
            expired: dayjs().add(params.rememberMe ? 30 : 1, 'day').unix(),
        }, process.env.TOKEN_KEY)
        res.json({
            status: true,
            message: 'login success',
            data: {
                token: token
            }
        })
    } catch (err) {
        next(err)
    }
})

router.post('/register', async (req, res, next) => {
    try {
        const params = {
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.fName,
            lastname: req.body.lName,
            from: req.body.from
        }
        trimObject(params)
        if (!validate.user.test(params.username) ||
            !validate.user.test(params.password) ||
            !validate.name.test(params.firstname) ||
            !validate.name.test(params.lastname)
        ) {
            req.httpStatusCode = 400
            throw Error('Invalid params')
        }
        const findUsername = await usersCollection.findOne({ username: params.username }, { projection: { _id: 1 } })
        if (findUsername) {
            req.httpStatusCode = 400
            throw Error('This username is already in use')
        }
        params.password = await bcrypt.hash(params.password, 10);
        const insert = await usersCollection.insertOne(params)
        console.log(insert)
        if (insert.insertedId) {
            res.json({
                status: true,
                message: 'Register success',
                data: {}
            })
        }
    } catch (err) {
        next(err)
    }
})

router.use((err, req, res, next) => {
    res.status(req.httpStatusCode ?? 500).json({
        status: false,
        message: err.message,
        data: {}
    })
})
export default router;