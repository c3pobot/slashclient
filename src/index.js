'use strict'
const log = require('logger')
const redis = require('redisclient')
const mongo = require('mongoapiclient')

let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);

const { CmdMap } = require('./helpers/cmdMap')

const CmdQue = require('./cmdQue')

const CheckRedis = ()=>{
  try{
    let status = redis.status()
    if(status){
      console.log(status)
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
      StartServices()
    }
    setTimeout(CheckCommandMap, 5000)
  }catch(e){
    log.error(e);
    setTimeout(CheckCommandMap, 5000)
  }
}
const StartServices = async()=>{
  try{
    await CmdQue.start()
    require('./server')
  }catch(e){
    log.error(e)
    setTimeout(StartServices, 5000)
  }
}

CheckRedis()
