module.exports = function prop (key) {
  if (!key) {
    // Key is falsy, return it as-is.
    return key
  }

  if (typeof key === 'string') {
    // Key is a string, use the default function.
    return (data) => data[key]
  }

  if (typeof key !== 'object' && typeof key.exec === 'function') {
    // Key is a regular expression, use a function to return the first match.
    return (data) => {
      const v = key.exec(data)
      if (v) {
        return v[0]
      } else {
        return v
      }
    }
  }

  // Key is hopefully a function, so we return it as-is.
  return key
}
