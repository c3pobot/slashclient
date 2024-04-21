const log = require('logger');
const rabbitmq = require('rabbitmq-client');
const { msgOpts } = require('./msgOpts')
const routingKeyPrefix = process.env.WORKER_QUE_PREFIX || 'worker'
let queues = [ 'swgoh', 'discord', 'oauth'], clientReady, producerReady, producer
if(process.env.WORKER_QUES) queues = JSON.parse(process.env.WORKER_QUES)
const NO_PRIVATE = process.env.NO_PRIVATE_QUES || false
const POD_NAME = process.env.POD_NAME || 'slash-client'

const connectOptions = {
  hostname: process.env.MESSAGE_BUS_HOST || 'rabbitmq-cluster.datastore',
  port: +process.env.MESSAGE_BUS_PORT || 5672,
  username: process.env.MESSAGE_BUS_USER,
  password: process.env.MESSAGE_BUS_PASS
}
const client = new rabbitmq.Connection(connectOptions)
client.on('error', (err)=>{
  log.error(`Producer on ${POD_NAME} Error`)
  if(err?.code){
    log.error(err.code)
    log.error(err.message)
    return
  }
  log.error(err)
})
client.on('connection', ()=>{
  clientReady = true
  log.info(`messagebus producer client on ${POD_NAME} connection successfully (re)established`)
})
const createProducer = async()=>{
  try{
    let payload = { confirm: true, queues:[] }
    for(let i in queues){
      payload.queues.push({ queue: `${routingKeyPrefix}.${queues[i]}`, durable: true, arguments: { 'x-queue-type': 'quorum' }})
      if(!NO_PRIVATE) payload.queues.push({ queue: `${routingKeyPrefix}.${queues[i]}.private`, durable: true, arguments: { 'x-queue-type': 'quorum' }})
    }
    producer = client.createPublisher(payload)
    producer.on('retry', (err, payload, body)=>{
      log.error('Retry on job')
    })
    producerReady = true
  }catch(e){
    log.error(e)
    setTimeout(createProducer, 5000)
  }
}
createProducer()
module.exports.add = async(queName, data = {})=>{
  if(!producer) return
  let routingKey = `${routingKeyPrefix}.${queName}`
  if(!NO_PRIVATE && msgOpts?.private?.has(data.guild_id)) routingKey += '.private'
  await producer.send(routingKey, data)
  return true
}
module.exports.rabbitmq = client
