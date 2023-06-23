'use strict'
const GetMsgOpts = require('./getMsgOpts')
let msgOpts = {}
const SyncMsgOpts = async()=>{
  try{
    let time = 5000
    if(mongoReady){
      time = 60000
      let obj = await GetMsgOpts()
      if(obj) msgOpts = obj
    }
    setTimeout(SyncMsgOpts, time)
  }catch(e){
    console.error(e);
    setTimeout(SyncMsgOpts, 5000)
  }
}
SyncMsgOpts()
module.exports = async(obj = {})=>{
  try{
    let type
    if(CmdMap[obj?.data?.name]) type = CmdMap[obj?.data?.name].worker
    if(!type) return
    if(msgOpts?.private?.filter(x=>x === obj.guild_id).length > 0) type += 'Private'
    return type
  }catch(e){
    console.error(e);
  }
}
