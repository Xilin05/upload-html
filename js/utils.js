function GenNonDuplicateID(randomLength = 10) {
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substr(3, randomLength)
  return idStr
}

function formatSize(size, pointLength = 2, units) {
  var unit
  units = units || ['B', 'K', 'M', 'G', 'TB']
  while ((unit = units.shift()) && size > 1024) {
    size = size / 1024
  }
  return (unit === 'B' ? size : size.toFixed(pointLength || 2)) + unit
}
