'use strict'
const log = require('logger')
const cmdQue = require('src/cmdQue')
const { CmdMap } = require('src/helpers/cmdMap')

const mongo = require('mongoclient')
const saveCmd = (obj = {})=>{
  let type = 'chat'
  if(obj.type > 2) type = 'component'
  mongo.set(`${type}SlashCmd`, { _id: obj.id }, obj)
}
const getUsers = (value, resolved = {})=>{
  log.info(value)
  log.info(resolved)
  if(!value || !resolved.members || !resolved.users || !resolved.members[value] || !resolved.users[value]) return
  let data = { ...resolved.users[value],...resolved.members[value] }
  if(!data.avatar) data.avatar = resolved.users[value].avatar
  return data
}
const getRoles = (value, resolved = {})=>{
  if(!value || !resolved.roles) return
  return resolved.roles[value]
}
const getChannels = (value, resolved = {})=>{
  if(!value || !resolved.channels) return
  return resolved.channels[value]
}
const getResolvedData = (type, value, resolved = {})=>{
  if(!type || !value) return
  if(typeEnum[type]) return typeEnum[type](value, resolved)
}
const typeEnum = {
  6: getUsers,
  8: getRoles,
  7: getChannels
}
const getOptions = (array = [], obj = { options: {} }, resolved = {})=>{
  if(!array || array?.length == 0) return
  for(let i in array){
    if(array[i].type === 2) obj.subCmdGroup = array[i].name
    if(array[i].type === 1) obj.subCmd = array[i].name
    if(array[i].type > 2){
      obj.options[array[i].name] = { name: array[i].name, type: array[i].type, value: array[i].value, data: getResolvedData(array[i].type, array[i].value, resolved) }
    }
    if(array[i].options) getOptions(array[i].options, obj, resolved)
  }
}
const getPreviousCmd = (obj, data = {})=>{
  if(!obj) return
  let oldCmd = obj.name?.split(' ')
  if(!oldCmd) return
  data.cmd = oldCmd[0]
  data.subCmd = oldCmd[2]
  if(data.subCmd){
    data.subCmdGroup = oldCmd[1]
  }else{
    data.subCmd = oldCmd[1]
  }
}
module.exports = async(obj = {})=>{
  try{
    if(!obj?.guild_id) return { type: 4, data: { content: 'Oh dear! I don\'t work very well in DM\'s'} }
    let tempOptions = { options: {} }
    getOptions(obj.data.options, tempOptions, obj.data?.resolved)
    obj.cmd = obj.data.name
    obj.subCmd = tempOptions.subCmd
    obj.subCmdGroup = tempOptions.subCmdGroup
    if(obj?.type > 2 && obj.data?.custom_id){
      if(obj.member?.user?.id !== obj.message?.interaction_metadata?.user_id) return { type: 6 }
      obj.confirm = JSON.parse(obj.data.custom_id)
      obj.previousId = obj.message?.interaction_metadata?.id
      getPreviousCmd(obj.message?.interaction_metadata, obj)
    }
    obj.data.options = tempOptions.options
    saveCmd(obj)
    let queName = CmdMap?.map[obj?.cmd]?.worker
    if(!queName) return { type: 4,  data: { content: 'Oh dear! Command not recognized...' } }

    let status = await cmdQue.add(queName, obj)
    if(!status) return { type: 4, data: { content: 'Oh dear! error adding command to the que' } }

    if(obj.type > 2) return { type: 6 }
    return { type: 4, data: { content: 'Here we go again...' } }
  }catch(e){
    log.error(e)
    return { type: 4, data: { content: 'Oh dear! Unspecified Error Occured...'} }
  }
}
