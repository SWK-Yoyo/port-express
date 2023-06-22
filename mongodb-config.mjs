import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
dotenv.config()
const url = process.env.MONGODB_URL
const client = new MongoClient(url)
export default client.db('finding-job')

