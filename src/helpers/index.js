'use strict'
const RedisCmd = require('./redis')
const LocalQueCmd = require('./localQue')
const Cmds = {}
Cmds.getJobType = require('./getJobType')
Cmds.getIntialResponse = require('./getIntialResponse')
Cmds.redis = RedisCmd.redis
Cmds.redisStatus = RedisCmd.redisStatus
Cmds.webHookMsg = require('./webHookMsg')
module.exports = Cmds
