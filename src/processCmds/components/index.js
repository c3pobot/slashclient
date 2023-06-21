'use strict'
const Cmds = {}
Cmds['2'] = require('./buttons')
Cmds['3'] = require('./select')
module.exports = async(req)=>{
  try{
    if(req.body.data && req.body.data.component_type && Cmds[req.body.data.component_type]) return await Cmds[req.body.data.component_type](req)
  }catch(e){
    console.error(e)
  }
}
