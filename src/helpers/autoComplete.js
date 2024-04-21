'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const mqtt = require('./mqtt')
let gameVersion, dataTopic = ''
if(process.env.MQTT_PREFIX) dataTopic += `${process.env.MQTT_PREFIX}/`
dataTopic += 'gameVersions'
const processMQTTMsg = async(msg)=>{
  try{
    let data = JSON.parse(msg)
    if(!data?.gameVersion) return
    if(gameVersion !== data.gameVersion){
      await updateAutoObj()
      await updateNameKeys()
      gameVersion = data.gameVersion
      log.info(`Updated autoComplete data to version ${gameVersion}...`)
    }
  }catch(e){
    log.error(e)
  }
}
mqtt.on('message', (topic, msg)=>{
  if(!msg || topic !== dataTopic) return
  processMQTTMsg(msg)
})
let autoCompleteData = {
  nameKeys: {},
  autoObj: {}
}
const updateNameKeys = async()=>{
  let obj = (await mongo.find('autoComplete', {_id: 'nameKeys'}))[0]
  if(obj?.data) autoCompleteData.nameKeys = obj.data
}
const updateAutoObj = async()=>{
  let obj = await mongo.find('autoComplete', {include: true}, {_id: 1, data: {name: 1, value: 1}})
  if(!obj || obj?.length == 0) return
  let tempObj = {}
  for(let i in obj){
    if(obj[i]?.data) tempObj[obj[i]._id] = obj[i].data
  }
  autoCompleteData.autoObj = tempObj
}
const start = async()=>{
  try{
    await updateAutoObj()
    await updateNameKeys()
    checkMQTTStatus()
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
const checkMQTTStatus = async()=>{
  try{
    if(mqtt.connected){
      await mqtt.subscribe(dataTopic, { qos: 1, rh: true })
      log.info(`mqtt subscribed to ${dataTopic}...`)
      return
    }
    setTimeout(checkMQTTStatus, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMQTTStatus, 5000)
  }
}
start()
module.exports = { autoCompleteData }
