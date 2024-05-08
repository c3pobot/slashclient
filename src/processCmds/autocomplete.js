'use strict'
const { dataList } = require('src/helpers/dataList')
const findObj = (array = [])=>{
  let returnObj
  let tempObj = array.find(x=>x.focused && (dataList?.nameKeys[x.name] || dataList?.nameKeys[x.name?.split('-')[0]]))
  if(tempObj) return tempObj;

  let tempArray = array.find(x=>x.options)
  if(tempArray?.options) returnObj = findObj(tempArray.options)
  return returnObj
}
module.exports = (req = {})=>{
  if(!req.data?.options || req.data?.options?.length == 0) return

  let tempCmd = findObj(req.data.options)
  if(!tempCmd?.name) return
  let key = dataList?.nameKeys[tempCmd.name]
  if(!key) key = dataList?.nameKeys[tempCmd.name.split('-')[0]]
  if(!key) return

  let returnArray = dataList?.autoObj[key]?.filter(x=>x.name.toLowerCase().includes(tempCmd.value.toLowerCase())) || []
  if(!returnArray || returnArray?.length == 0) return

  return { type: 8, data: { choices: returnArray }}
}
