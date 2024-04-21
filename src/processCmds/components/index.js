'use strict'
const Cmds = {}
Cmds['2'] = require('./buttons')
Cmds['3'] = require('./select')
module.exports = async(req = {})=>{
  if(req?.data?.component_type && Cmds[req.data.component_type]) return await Cmds[req.data.component_type](req)
}
