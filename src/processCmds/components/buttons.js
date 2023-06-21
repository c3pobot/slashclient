'use strict'
const { getJobType } = require('src/helpers')
const AddButtonJob = async(obj, jobId)=>{
  try{
    const type = await getJobType(obj)
    await redis.del(obj.id)
    await redis.del('button-'+obj.id)
    if(type) await CmdQue.add(type, obj, jobId)
  }catch(e){
    console.error(e)
  }
}
const AddMiscJob = async(obj, jobId)=>{
  try{
    const type = await getJobType(obj)
    if(type) CmdQue.add(type, obj, jobId)
  }catch(e){
    console.error(e)
  }
}
const miscCmds = ['pollvote']
module.exports = async(req)=>{
  try{
    if(!req?.data || !req?.member?.user?.id || !req?.data?.custom_id) return {type: 6}
    const opt = JSON.parse(req.body.data.custom_id)
    if(!opt?.id) return {type: 6}
    if(opt?.type && miscCmds.filter(x=>x == opt?.type).length > 0){
      req.data.name = opt.type
      await AddMiscJob(req, req?.id)
    }else{
      let tempObj = await redis.get('button-'+opt.id)
      if(!tempObj) tempObj = await redis.get(opt.id)
      if(!tempObj?.member?.user?.id) return {type: 7, data: { content: 'Command timed out', components: []}}
      if(tempObj.member.user.id == req.body.member.user.id){
        tempObj.token = req.body.token
        tempObj.confirm = opt
        await AddButtonJob(tempObj, req?.id)
      }
    }
    return {type: 6}
  }catch(e){
    console.error(e)
  }
}
