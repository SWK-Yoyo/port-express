import express from 'express'
import dayjs from 'dayjs'
import { decodeJWT } from './helper.mjs'
import db from './mongodb-config.mjs'
const router = express.Router()
const highScoreCollection = db.collection('2048-highscore')
let myUser

router.use((req, res, next) => {
    try {
        myUser = decodeJWT(req.header.jwt)
        if (myUser.expried < dayjs().unix()) {
            throw Error('Token expired')
        }
        next()
    } catch (err) {
        next(err)
    }
})

router.route('/high-score')
    .post((req, res, next) => {
        try {
            const params = {
                uesr_id: myUser.id,
                score: req.body.score,
                created_at: dayjs().unix()
            }
            const insert = await highScoreCollection.insertOne(params)
            if (!insert.insertedId) {
                throw Error('Insert failed')
            }
            res.json({
                status: true,
                message: "Keep high score success",
                data: {}
            })

        } catch (err) {
            next(err)
        }
    })
    .get((req, res, next) => {
        try {
            const score = await highScoreCollection.find({}, { sort: { score: -1 }, limit: 10 }).toArray()
            res.json({
                status: true,
                message: "Get high-score success",
                data: score
            })
        } catch (err) {
            next(err)
        }
    })
    .patch(async (req, res, next) => {
        try {
            const params = {
                score: req.body.score,
                updated_at: dayjs().unix()
            }
            const condition = {
                user_id: myUser.id
            }
            const update = await highScoreCollection.updateOne(condition, { $set: params })
            if (!update.modifiedCount) {
                throw Error('Updated failed')
            }
            res.json({
                status: true,
                message: "Update high-score success",
                data: {}
            })

        } catch (err) {
            next(err)
        }

    })

router.get('/my-score', (req, res, next) => {
    try {
        const myScore = await highScoreCollection.findOne({ user_id: myUser.id }, { projection: { score: 1 } })
        res.json({
            status: true,
            message: "Get my score success",
            data: myScore
        })
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