'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel('debug');

const POD_NAME = process.env.POD_NAME || 'slash-client'
const redis = require('redisclient')
const mongo = require('mongoclient')

const rabbitmq = require('./helpers/rabbitmq')
const { CmdMap } = require('./helpers/cmdMap')
const cmdQue = require('./cmdQue')

require('./exchanges')

const checkRabbitmq = ()=>{
  log.debug(`${POD_NAME} rabbitmq startup check...`)
  if(rabbitmq.ready){
    checkRedis()
    return
  }
  setTimeout(checkRabbitmq, 5000)
}
const checkRedis = ()=>{
  log.debug(`${POD_NAME} redis startup check...`)
  let status = redis.status()
  if(status){
    checkMongo()
    return
  }
  setTimeout(checkRedis, 5000)
}
const checkMongo = ()=>{
  log.debug(`${POD_NAME} mongo startup check...`)
  let status = mongo.status()
  if(status){
    checkCommandMap()
    return
  }
  setTimeout(checkMongo, 5000)
}
const checkCommandMap = ()=>{
  try{
    log.debug(`${POD_NAME} cmdMap startup check...`)
    if(CmdMap?.map?.cmdCount > 0){
      checkCmdQue()
      return
    }
    setTimeout(checkCommandMap, 5000)
  }catch(e){
    log.error(e);
    setTimeout(checkCommandMap, 5000)
  }
}
const checkCmdQue = async()=>{
  try{
    log.debug(`${POD_NAME} cmdQue startup check...`)
    let status = await cmdQue.start()
    if(status){
      require('./server')
      return
    }
    setTimeout(checkCmdQue, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkCmdQue, 5000)
  }
}
checkRabbitmq()
