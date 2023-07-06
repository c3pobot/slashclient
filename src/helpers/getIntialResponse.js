'use strict'
const CmdQue = require('cmdQue')
const getJobType = require('./getJobType')
module.exports = async(req)=>{
  try{
    let intialResponse = 'Oh dear! Unspecified Error Occured...'
    if(!req?.guild_id) return ({type: 4, data: { content: 'Oh dear! I don\'t work very well in DM\'s'}})
    let type = await getJobType(req)
    if(type){
      intialResponse = 'Here we go again...'
      const status = await CmdQue.add(type, req)
      if(!status?.timestamp) intialResponse = 'Oh dear! error adding command to the que'
    }else{
      intialResponse = 'Oh dear! Command not recognized...'
    }
    return({ type: 4,  data: { content: intialResponse } })
  }catch(e){
    throw(e);
  }
}
