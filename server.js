import express from 'express'
import auth from './auth.mjs'
import cors from 'cors'

const app = express()
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.use(express.json()) // for application/json


app.get('/', (req, res) => {
    res.send('asd')
})
app.listen(3000, (req, res) => {
    console.log("Example app listen to port 3000")
})
app.use('/auth', auth)