'use strict'
const redis = require('redisclient')
const rabbitmq = require('src/helpers/rabbitmq')
const { CmdMap } = require('src/helpers/cmdMap')

const addButtonJob = async(obj = {})=>{
  await redis.del(obj.id)
  await redis.del('button-'+obj.id)
  let queName = CmdMap?.map[obj?.data?.name]?.worker
  if(!queName) return
  await rabbitmq.add(queName, obj)
}
const addMiscJob = async(obj = {})=>{
  let queName = CmdMap?.map[obj?.data?.name]?.worker
  if(!queName) return

  await rabbitmq.add(queName, obj)
}
const miscCmds = new Set(['pollvote'])
module.exports = async(req = {})=>{
  if(!req?.data || !req?.member?.user?.id || !req?.data?.custom_id) return { type: 6 }
  let opt = JSON.parse(req.data.custom_id)
  if(!opt?.id) return { type: 6 }

  if(opt?.type && miscCmds?.has(opt?.type)){
    req.data.name = opt.type
    await addMiscJob(req, req?.id)
  }else{
    let tempObj = await redis.get('button-'+opt.id)
    if(!tempObj) tempObj = await redis.get(opt.id)
    if(!tempObj || !tempObj?.member?.user?.id) return { type: 7, data: { content: 'Command timed out', components: [] }}
    if(tempObj.member.user.id !== req.member?.user?.id) return { type: 6 }

    tempObj.token = req.token
    tempObj.confirm = opt
    await addButtonJob(tempObj, req?.id)
  }
  return { type: 6 }
}
