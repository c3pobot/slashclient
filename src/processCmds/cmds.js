'use strict'
const log = require('logger')
const rabbitmq = require('src/helpers/rabbitmq')
const { CmdMap } = require('src/helpers/cmdMap')

module.exports = async(req = {})=>{
  try{
    let intialResponse = 'Oh dear! Unspecified Error Occured...'
    if(!req?.guild_id) return { type: 4, data: { content: 'Oh dear! I don\'t work very well in DM\'s'} }

    let queName = CmdMap?.map[req?.data?.name]?.worker
    if(!queName) return { type: 4,  data: { content: 'Oh dear! Command not recognized...' } }

    let msg2send = { content: 'Here we go again...'}
    let status = await rabbitmq.add(queName, req)
    if(!status) msg2send.content = 'Oh dear! error adding command to the que'
    return { type: 4,  data: msg2send }
  }catch(e){
    log.error(e)
    return { type: 4, data: { content: 'Oh dear! Unspecified Error Occured...'} }
  }
}
