'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);

const redis = require('redisclient')
const mongo = require('mongoapiclient')

const rabbitmq = require('./helpers/rabbitmq')
const mqtt = require('./helpers/mqtt')
const { CmdMap } = require('./helpers/cmdMap')

const CheckRedis = ()=>{
  try{
    let status = redis.status()
    if(status){
      CheckMongo()
      return
    }
    setTimeout(CheckRedis, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckRedis, 5000)
  }
}
const CheckMongo = ()=>{
  try{
    let status = mongo.status()
    if(status){
      CheckCommandMap()
      return
    }
    setTimeout(CheckMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckMongo, 5000)
  }
}
const CheckCommandMap = ()=>{
  try{
    if(CmdMap?.map?.cmdCount > 0){
      require('./server')
      return
    }
    setTimeout(CheckCommandMap, 5000)
  }catch(e){
    log.error(e);
    setTimeout(CheckCommandMap, 5000)
  }
}

CheckRedis()
