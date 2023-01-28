'use strict'

const ada = { LINE_REGEX: /^--.*/ }

const javascript = {
  BLOCK_OPEN_REGEX: /^\/\*\*?(!?)/,
  BLOCK_EMPTY_REGEX: /^\/\*\*\//,
  BLOCK_CLOSE_REGEX: /^\*\/(\n?)/,
  LINE_REGEX: /^\/\/(!?).*/
}

export default {
  javascript,
  js: javascript,
  sql: ada
}
