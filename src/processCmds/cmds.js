'use strict'
const { getIntialResponse } = require('helpers')
module.exports = async(req)=>{
  try{
    return await getIntialResponse(req)
  }catch(e){
    throw(e)
  }
}
