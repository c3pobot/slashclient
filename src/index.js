'use strict'
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
    console.error(e);
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
    console.error(e);
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
    console.error(e);
    setTimeout(CheckCommandMap, 5000)
  }
}
const StartServices = async()=>{
  try{
    await CmdQue.createQues()
    require('./server')
  }catch(e){
    setTimeout(StartServices, 5000)
    console.error(e)
  }
}

CheckRedis()
