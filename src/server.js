'use strict'
const log = require('logger')
const nacl = require('tweetnacl')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression');
const ProcessCmds = require('./processCmds')
const POD_NAME = process.env.POD_NAME || 'slash-client'
const app = express()
const PORT = process.env.PORT || 3000
const PUBLIC_KEY = process.env.BOT_PUBLIC_KEY
app.use(bodyParser.json({
  limit: '100MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression())

app.get('/healthz', (req, res)=>{
  res.status(200).json({res: 'ok'})
})
app.post('/cmd', (req, res)=>{
  handleRequest(req, res)
})
const isVerified = (body, timestamp, signature, BOT_KEY)=>{
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(BOT_KEY, 'hex')
  )
}
const handleRequest = async(req, res)=>{
  try{
    if(!(await isVerified(req.rawBody, req.header('X-Signature-Timestamp'), req.header('X-Signature-Ed25519'), PUBLIC_KEY))){
      res.status(401).end('invalid request signature')
    }else{

      if(ProcessCmds[req?.body?.type]){

        let status = await ProcessCmds[req.body.type](req.body)
        if(status?.type){
          res.status(200).json(status)
        }else{
          res.status(400).json({error: 'command not found'})
        }
      }else{
        res.status(400).json({error: 'command not found'})
      }
    }
  }catch(e){
    log.error(e)
    res.status(400).json({error: e.message || e})
  }
}
const server = app.listen(PORT, ()=>{
  log.info('slash-client is listening on '+server.address().port)
})
