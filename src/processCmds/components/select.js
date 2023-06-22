'use strict'
const { getJobType } = require(baseDir+'/src/helpers')
const AddJob = async(obj)=>{
  try{
    const type = await getJobType(obj)
    await redis.del('component-'+obj.id)
    if(type) CmdQue.add(type, obj)
  }catch(e){
    console.log(e)
  }
}
module.exports = async(req)=>{
  try{
    if(!req?.data || !req?.member?.user?.id || !req?.data?.custom_id) return {type: 6}
    const opt = JSON.parse(req.data?.custom_id)
    if(!opt?.id) return {type: 6, data: { content: 'Error with selection', components: []}}
    const tempObj = await redis.get('component-'+opt.id)
    if(!tempObj?.member?.user?.id) return {type: 7, data: { content: 'Command timed out', components: []}}
    if(tempObj.member.user.id == req.member.user.id){
      tempObj.token = req.token
      tempObj.select = {opt: opt, data: req.data.values || []}
      await AddJob(tempObj)
    }
    return {type: 6}
  }catch(e){
    console.error(e)
  }
}
