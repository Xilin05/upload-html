async function getFileListAPI() {
  // 🤠发送POST请求,获取json数据
  // const result = await fetchAjax('https://api.github.com/users/Xilin05')
  const { status, msg, data } = await fetchAjax('/upload/list')

  if (status === 200) {
    // alert('请求成功')
    console.log(data)
    return data || []
  }

  return []
}

function downloadAction(fileName, url) {
  let a = document.createElement('a')
  a.style = 'display: none' // 创建一个隐藏的a标签
  a.download = fileName
  a.href = url
  document.body.appendChild(a)
  a.click() // 触发a标签的click事件
  document.body.removeChild(a)
}

async function downloadImageAPI(name) {
  if (!name) {
    alert('获取名称失败，无法下载')
    return
  }

  const res = await fetchAjax('/upload/download?file_name=' + name, {
    file_name: name
  })
  console.log('res', res)
}

function downloadIamge(imgUrl, name) {
  //下载图片地址和图片名
  var image = new Image()
  // 解决跨域 Canvas 污染问题
  image.src = imgUrl
  image.setAttribute('crossorigin', 'anonymous')
  image.onload = function () {
    var canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    var context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    var url = canvas.toDataURL('image/png') //得到图片的base64编码数据
    var a = document.createElement('a') // 生成一个a元素
    var event = new MouseEvent('click') // 创建一个单击事件
    a.download = name || 'photo' // 设置图片名称
    a.href = url // 将生成的URL设置为a.href属性
    a.dispatchEvent(event) // 触发a的单击事件
  }
  image.onerror = err => {
    console.log(err)
    window.open(imgUrl)
  }
}

let time = new Date().getTime()
function downloadFile(url, filename, delay = 1000) {
  let now = new Date().getTime()
  if (now - time < delay) {
    return
  }
  time = now
  getBlob(url, function (blob) {
    saveAs(blob, filename)
  })
}

function getBlob(url, cb) {
  let xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.onload = function (e) {
    if (xhr.status === 200) {
      cb(xhr.response)
    }
  }
  xhr.send()
}

function saveAs(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename)
  } else {
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(link.href)
  }
}
