'use strict'
const FindObj = (array = [], autoCompleteNameKeys = {})=>{
  try{
    let returnObj
    const tempObj = array.find(x=>x.focused && (autoCompleteNameKeys[x.name] || autoCompleteNameKeys[x.name?.split('-')[0]]))
    if(tempObj){
      returnObj = tempObj
    }else{
      const tempArray = array.find(x=>x.options)
      if(tempArray && tempArray.options) returnObj = FindObj(tempArray.options)
    }
    return returnObj
  }catch(e){
    console.log(e)
  }
}
module.exports = FindObj
