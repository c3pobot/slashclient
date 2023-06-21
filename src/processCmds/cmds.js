'use strict'
const { getIntialResponse } = require('src/helpers')
module.exports = async(req)=>{
  try{
    return await getIntialResponse(req)
  }catch(e){
    console.error(e)
  }
}
