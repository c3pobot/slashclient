'use strict'
const { autoCompleteData } = require('helpers/autoComplete')
const FindObj = (array = [])=>{
  try{
    let returnObj
    let tempObj = array.find(x=>x.focused && (autoCompleteData?.nameKeys[x.name] || autoCompleteData?.nameKeys[x.name?.split('-')[0]]))
    if(tempObj){
      returnObj = tempObj
    }else{
      let tempArray = array.find(x=>x.options)
      if(tempArray?.options) returnObj = FindObj(tempArray.options)
    }
    return returnObj
  }catch(e){
    throw(e)
  }
}
module.exports = (req)=>{
  try{
    let tempCmd, returnArray = []
    if(req?.data?.options?.length > 0) tempCmd = FindObj(req.data.options)
    if(tempCmd?.name){
      let key = autoCompleteData?.nameKeys[tempCmd.name]
      if(!key) key = autoCompleteData?.nameKeys[tempCmd.name.split('-')[0]]
      if(key) returnArray = (autoCompleteData?.autoObj[key]?.filter(x=>x.name.toLowerCase().includes(tempCmd.value.toLowerCase())) || [])
    }
    if(returnArray.length > 0 && returnArray.length < 26){
      return({
          type: 8,
          data: {
            choices: returnArray
          }
      })
    }
  }catch(e){
    throw(e)
  }
}
