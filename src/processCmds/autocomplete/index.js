'use strict'
const FindObj = require('./findObj')
let autoCompleteNameKeys = {}
let autoCompleteObj = {}
const UpdateAutoCompleteObj = async()=>{
  try{
    const obj = await mongo.find('autoComplete', {include: true}, {_id: 1, data: {name: 1, value: 1}})
    if(obj.length > 0){
      let tempObj = {}
      for(let i in obj){
        if(obj[i]?.data) tempObj[obj[i]._id] = obj[i].data
      }
      autoCompleteObj = tempObj
    }
  }catch(e){
    console.error(e)
  }
}
const UpdateAutoCompleteNameKeys = async()=>{
  try{
    const obj = (await mongo.find('autoComplete', {_id: 'nameKeys'}))[0]
    if(obj?.data) autoCompleteNameKeys = obj.data
  }catch(e){
    console.error(e)
    setTimeout(()=>UpdateAutoComplete(), 5000)
  }
}
const SyncAutoComplete = async()=>{
  try{
    let time = 5000
    if(mongoReady > 0){
      time = 30000
      await UpdateAutoCompleteObj()
      await UpdateAutoCompleteNameKeys()
    }
    setTimeout(SyncAutoComplete, time)
  }catch(e){
    console.error(e);
    setTimeout(SyncAutoComplete, 5000)
  }
}
SyncAutoComplete()
module.exports = (req)=>{
  try{
    let tempCmd, returnArray = []
    if(req?.data?.options?.length > 0) tempCmd = FindObj(req.data.options, autoCompleteNameKeys)
    if(tempCmd?.name){
      let key = autoCompleteNameKeys[tempCmd.name]
      if(!key) key = autoCompleteNameKeys[tempCmd.name.split('-')[0]]
      if(key) returnArray = (autoCompleteObj[key]?.filter(x=>x.name.toLowerCase().includes(tempCmd.value.toLowerCase())) || [])
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
    console.log(e)
  }
}
