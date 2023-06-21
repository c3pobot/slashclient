'use strict'
let workerType = ['discord']
if(process.env.WORKER_TYPES) workerType = JSON.parse(process.env.WORKER_TYPES)
const UpdateCmdMap = async()=>{
  try{
    let tempMap = {}
    for(let i in workerType){
      const obj = (await mongo.find('slashCmds', {_id: workerType[i]}))
      if(obj?.cmdMap) tempMap = {...tempMap,...obj.cmdMap}
    }
    if(Object.values(tempMap)?.length > 0) CmdMap = tempMap
  }catch(e){
    console.error(e);
  }
}
const SyncCmdMap = async()=>{
  try{
    let time = 5000
    if(mongoReady > 0){
      time = 60000
      await UpdateCmdMap()
    }
    setTimeout(SyncCmdMap, 6000)
  }catch(e){
    console.error(e);
    setTimeout(GetCmdMap, 5000)
  }
}
console.log('Creating command map...')
