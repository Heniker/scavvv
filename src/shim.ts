// --- Promise.withResolvers ---

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
// @ts-ignore
Promise.withResolvers ??= Promise.withResolvers = () => {
  let res = undefined
  let rej = undefined

  const p = new Promise((resolve, reject) => {
    res = resolve; rej = reject
  })

  return { resolve: res.bind(p), reject: rej.bind(p), promise: p }
}

/// --- Array.at ---

Array.prototype.at ??= function(index) {
  if (index < 0) {
    index += this.length
  }
  return this[Math.floor(index)]
}
