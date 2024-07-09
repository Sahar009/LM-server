import {redis} from 'ioredis'
require('dotenv').config();
const redisClient = () =>{
    if(process.env.RDIS_URL){
        console.log('redis connected');
        return process.env.REDIS_URL
        
    }
    throw new Error('redis connection failed !!!')
}