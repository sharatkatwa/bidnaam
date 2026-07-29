import mongoose from "mongoose";
import { env } from "./env.js";
import dns from 'dns'

dns.setServers(["8.8.8.8", "8.8.4.4"])
dns.setDefaultResultOrder('ipv4first')

export async function connectDB() {
    try {
        await mongoose.connect(env.MONGODB_URI)
        console.log('mongodb connected successfully')

    } catch (error) {
        console.log('Mongo connection error', error)
    }
}
