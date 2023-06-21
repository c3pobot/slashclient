'use strict'
const Cmds = {}
Cmds['1'] = require('./ping')
Cmds['2'] = require('./cmds')
Cmds['3'] = require('./components')
Cmds['4'] = require('./autocomplete')
module.exports = Cmds
