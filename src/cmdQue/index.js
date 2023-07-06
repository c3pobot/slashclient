'use strict'
const QueWrapper = require('quewrapper')
const CheckJob = require('./checkJob')
let workerTypes = ['discord', 'oauth', 'swgoh']
let WorkerQues = {}
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)
const USE_PRIVATE = process.env.USE_PRIVATE_WORKERS || false
const redisConnection = {
	host: process.env.QUE_SERVER,
	port: +process.env.QUE_PORT,
  password: process.env.QUE_PASS
}
const CreateQue = async(queName)=>{
  try{
    console.log('Creating '+queName+' job que...')
    WorkerQues[queName] = new QueWrapper({queName: queName, queOptions: {redis: redisConnection}})
  }catch(e){
    throw(e);
  }
}
const CreateQues = async()=>{
  try{
    for(let i in workerTypes){
      await CreateQue(workerTypes[i])
      if(USE_PRIVATE) await CreateQue(workerTypes[i]+'Private')
    }
  }catch(e){
    console.error(e);
    setTimeout(CreateQues, 5000)
  }
}
module.exports.createQues = CreateQues
module.exports.add = async(type, job, jobId = null)=>{
	try{
    let jobQue = type
    if(type?.includes('Private') && !WorkerQues[type]) jobQue = type?.replace('Private', '')
    if(!WorkerQues[jobQue]) return;
    const res = await WorkerQues[jobQue].newJob(job, {jobId: jobId || job.id})
    CheckJob(job, WorkerQues[jobQue])
    return res
	}catch(e){
		console.error(e)
	}
}
