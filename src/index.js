'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
const { redisStatus, localQueStatus } = require('helpers')
const { CmdMap } = require('./helpers/cmdMap')
const CmdQue = require('./cmdQue')
const CheckRedis = async()=>{
  try{
    let status = redisStatus()
    if(status){
      CheckLocalQue()
    }else{
      setTimeout(CheckRedis, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(CheckRedis, 5000)
  }
}
const CheckLocalQue = async()=>{
  try{
    let status = localQueStatus()
    if(status){
      StartServices()
    }else{
      setTimeout(CheckLocalQue, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(CheckLocalQue, 5000)
  }
}
const CheckCommandMap = ()=>{
  try{
    if(CmdMap?.map?.cmdCount > 0){
      StartServices()
    }else{
    }
    setTimeout(CheckCommandMap, 5000)
  }catch(e){
    log.error(e);
    setTimeout(CheckCommandMap, 5000)
  }
}
const StartServices = async()=>{
  try{
    await CmdQue.createQues()
    require('./server')
  }catch(e){
    setTimeout(StartServices, 5000)
    log.error(e)
  }
}

CheckRedis()
