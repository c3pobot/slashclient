'use strict'
const fetch = require('node-fetch')
const path = require('path')
const headers2get = ['x-ratelimit-bucket', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'x-ratelimit-reset-after']
let discordUrl = process.env.DISCORD_PROXY || 'https://discord.com'
discordUrl += '/api/webhooks/'+process.env.DISCORD_CLIENT_ID
const parseResponse = async(res)=>{
  try{
    if(!res) return
    if (res?.status?.toString().startsWith('5')) {
      throw('Bad status code '+res.status)
    }
    let body, headers = {}

    if (res?.status === 204) {
      body = null
    } else if (res?.headers?.get('Content-Type')?.includes('application/json')) {
      body = await res?.json()
    } else {
      body = await res?.text()
    }
    if(res.headers){
      for(let i in headers2get){
        headers[headers2get[i]] = res.headers?.get(headers2get[i])
      }
    }
    return {
      status: res?.status,
      body: body,
      headers: headers
    }
  }catch(e){
    console.error(e);
  }
}
module.exports = async(token, msg, method = 'PATCH')=>{
  try{
    if(!token || !msg) return
    let uri = path.join(discordUrl, token)
    if(method === 'PATCH') uri = path.join(uri, 'messages', '@original')
    let payload = { method: method, compress: true, timeout: 60000, headers: {'Content-Type': 'application/json'}}
    payload.body = JSON.stringify(msg)
    let res = await fetch(uri, payload)
    return await parseResponse(res)
  }catch(e){
    if(e?.name){
      throw({error: e.name, message: e.message, type: e.type})
    }else{
      if(e?.status) throw(await parseResponse(e))
    }
  }
}
