'use strict'
let workerTypes = ['discord', 'oauth', 'swgoh']
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)
const mongo = require('mongoapiclient')
let CmdMap = { map: {} }, mongoReady
const update = async(notify = false)=>{
  try{
    let tempMap = {}
    for(let i in workerTypes){
      if(notify) console.log('Add '+workerTypes[i]+' commands...')
      const obj = (await mongo.find('slashCmds', {_id: workerTypes[i]}))[0]
      if(obj?.cmdMap) tempMap = {...tempMap,...obj.cmdMap}
    }
    let cmdCount = +Object.values(tempMap)?.length
    if(cmdCount > 0){
      tempMap.cmdCount = cmdCount
      CmdMap.map = tempMap
      if(notify) console.log('Saving map to CmdMap')
      return true
    }
  }catch(e){
    throw(e);
  }
}
const syncMap = async(notify = false)=>{
  try{
    if(notify) console.log('Creating command map...')
    let checkTime = 5, notifyUpdate = false
    if(notify) notifyUpdate = true
    let status = await update(notify)
    if(status){
      checkTime = 60
      notifyUpdate = false
    }
    setTimeout(()=>syncMap(notifyUpdate), checkTime * 1000)
  }catch(e){
    console.error(e);
    setTimeout(()=>syncMap(notify), 5000)
  }
}
syncMap(true)
module.exports = { CmdMap }
