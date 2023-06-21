'use strict'
const nacl = require('tweetnacl')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression');
const ProcessCmds = require('./processCmds')
const app = express()
const PORT = process.env.PORT || 3000
const PUBLIC_KEY = process.env.BOT_PUBLIC_KEY


const isVerified = (body, timestamp, signature, BOT_KEY)=>{
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(BOT_KEY, 'hex')
  )
}
app.use(bodyParser.json({
  limit: '100MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.get('/healthz', (req, res)=>{
  res.json({res: 'ok'}).status(200)
})
app.post('/cmd', async(req, res)=>{
  if(!(await isVerified(req.rawBody, req.header('X-Signature-Timestamp'), req.header('X-Signature-Ed25519'), PUBLIC_KEY))){
    res.status(401).end('invalid request signature')
  }else{
    if(ProcessCmds[req?.body?.type]){
      const status = await ProcessCmds[req.body.type](req.body)
      if(status?.type) res.json(status).status(200)
    }
  }
})
const server = app.listen(PORT, ()=>{
  console.log('Slash Client Listening on ', server.address().port)
})
