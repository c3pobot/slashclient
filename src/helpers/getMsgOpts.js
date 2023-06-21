'use strict'
const updateVip = async()=>{
  try{
    let res = []
    const vip = await mongo.find('vip', {status: 1}, {_id: 1})
    const obj = (await mongo.find('botSettings', {_id: "1"}))[0]
    if(vip?.length > 0) res = vip.map(x=>x._id)
    if(obj?.boCR) res = res.concat(obj.boCR)
    return res;
  }catch(e){
    console.error(e);
  }
}
const updateServers = async()=>{
  try{
    const res = { private: [], basic: [] }
    const servers = await mongo.find('discordServer', {}, {instance: 1, _id: 1, basicStatus: 1})
    if(servers?.length > 0){
      res.basic = servers.filter(x=>x.basicStatus > 0).map(x=>x._id)
      res.private = servers.filter(x=>x.instance === 'private').map(x=>x._id)
    }
    return res;
  }catch(e){
    console.error(e);
  }
}
module.exports = async()=>{
  try{
    const res = { private: [], basic: [], vip: [] }
    const vip = await updateVip()
    if(vip) res.vip = vip
    const servers = await updateServers()
    if(servers){
      res.private = servers.private || []
      res.basic = servers.basic || []
    }
    return res
  }catch(e){
    console.error(e);
  }
}
