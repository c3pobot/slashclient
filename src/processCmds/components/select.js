'use strict'
const redis = require('redisclient')
const rabbitmq = require('src/helpers/rabbitmq')
const { CmdMap } = require('src/helpers/cmdMap')
const addJob = async(obj = {})=>{
  await redis.del('component-'+obj.id)
  let queName = CmdMap?.map[obj?.data?.name]?.worker
  if(!queName) return
  await rabbitmq.add(queName, obj)
}
module.exports = async(req)=>{
  if(!req?.data || !req?.member?.user?.id || !req?.data?.custom_id) return { type: 6 }
  let opt = JSON.parse(req.data?.custom_id)
  if(!opt?.id) return {type: 6, data: { content: 'Error with selection', components: []}}

  let tempObj = await redis.get('component-'+opt.id)
  if(!tempObj || !tempObj?.member?.user?.id) return { type: 7, data: { content: 'Command timed out', components: []} }
  if(tempObj.member.user.id !== req.member?.user?.id) return { type: 6 }

  tempObj.token = req.token
  tempObj.select = { opt: opt, data: req.data.values || [] }
  await addJob(tempObj)
  return { type: 6 }
}
