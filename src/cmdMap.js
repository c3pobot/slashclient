'use strict'
let workerType = ['discord']
if(process.env.WORKER_TYPES) workerType = JSON.parse(process.env.WORKER_TYPES)
const UpdateCmdMap = async(notify = false)=>{
  try{
    let tempMap = {}
    for(let i in workerType){
      if(notify) console.log('Add '+workerType[i]+' commands...')
      const obj = (await mongo.find('slashCmds', {_id: workerType[i]}))[0]
      if(obj?.cmdMap) tempMap = {...tempMap,...obj.cmdMap}
    }
    if(Object.values(tempMap)?.length > 0){
      CmdMap = tempMap
      if(notify) console.log('Saving map to CmdMap')
    }
  }catch(e){
    console.error(e);
  }
}
const SyncCmdMap = async(notify = false)=>{
  try{
    if(notify) console.log('Creating command map...')
    let time = 5000
    if(mongoReady > 0){
      time = 60000
      await UpdateCmdMap(notify)
    }
    setTimeout(SyncCmdMap, time)
  }catch(e){
    console.error(e);
    setTimeout(SyncCmdMap, 5000)
  }
}
SyncCmdMap(true)
