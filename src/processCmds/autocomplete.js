'use strict'
const { autoCompleteData } = require('src/helpers/autoComplete')
const findObj = (array = [])=>{
  let returnObj
  let tempObj = array.find(x=>x.focused && (autoCompleteData?.nameKeys[x.name] || autoCompleteData?.nameKeys[x.name?.split('-')[0]]))
  if(tempObj) return tempObj;

  let tempArray = array.find(x=>x.options)
  if(tempArray?.options) returnObj = findObj(tempArray.options)
  return returnObj
}
module.exports = (req = {})=>{
  if(!req.data?.options || req.data?.options?.length == 0) return

  let tempCmd = findObj(req.data.options)
  if(!tempCmd?.name) return
  let key = autoCompleteData?.nameKeys[tempCmd.name]
  if(!key) key = autoCompleteData?.nameKeys[tempCmd.name.split('-')[0]]
  if(!key) return

  let returnArray = autoCompleteData?.autoObj[key]?.filter(x=>x.name.toLowerCase().includes(tempCmd.value.toLowerCase())) || []
  if(!returnArray || returnArray?.length == 0) return

  return { type: 8, data: { choices: returnArray }}
}
