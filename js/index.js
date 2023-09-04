async function initFileList() {
  fileList = await getFileListAPI()

  if (fileList.length) {
    insertHTMLDOM(fileList)
  }
}

initFileList()
// console.log('qiniu', qiniu)

// 简单版上传功能实现：
// 1. 前端页面实现
// 2. 服务端：单文件上传，多文件上传
// 3. 服务端：文件重命名，获取静态文件列表
// 4.

// 1. 编写服务端鉴权
// 2. 前端获取token
// 3. 前端上传文件，并将外链传给后端
// 4. 后端将外链保存于数据库

// 1. 样式差不多就行
// 2. 前端上传文件实现
// 3. 七牛云jsapi调用

function initDomStr(payload) {
  // <div class="text">${f.name}</div>
  // <div class="more-btn">...查看更多</div>
  return `
    <div data-uid="${payload.uid}" class="file-card">
    <svg class="file-icon svg-excel-file" aria-hidden="true" style="display: none;">
      <use xlink:href="#icon-Excel"></use>
    </svg>
    <div id="img-box" class="img-viewer" style="background-color: #464646; background: url('${payload.img_url}') no-repeat; background-size: cover; background-position: center;">
      <img
        loading="lazy"
        id="imageViewerRef-${payload.uid}"
        data-original="${payload.img_url}"
        src="${payload.img_url}"
        alt="${payload.name}"
        style="opacity: 0;"
      />
    </div>
    <div class="file-info">
      <div class="name">
        ${payload.name}
      </div>
      <div class="size">${payload.size}</div>
    </div>
    <div class="file-operations">
      <i id="download-btn=${payload.uid}" class="svg-operation primary iconfont icon-xiazai"></i>
      <i id="success-status=${payload.uid}" class="svg-operation success iconfont icon-check"></i>
      <i id="warning-status=${payload.uid}"class="svg-operation warning iconfont icon-note" style="display: none;"></i>
    </div>

    <span class="progress-bg" ></span>
  </div>
  `
}

async function getUserInfo() {
  // 🤠发送POST请求,获取json数据
  // const result = await fetchAjax('https://api.github.com/users/Xilin05')
  const { status, msg, data } = await fetchAjax(
    'https://www.fastmock.site/mock/c273bd037cac88380de2ec9776d4ce46/user/userinfo'
  )

  if (status === 200) {
    // alert('请求成功')
    // console.log(data)
  }
}

function insertHTMLDOM(list = []) {
  let fileListRef = document.getElementById('fileListRef')
  fileListRef.addEventListener('click', generateImageViewer)
  let domStr = ''
  tempDomIds = []

  list.forEach((f, fIndex) => {
    tempDomIds.push(`imageViewerRef-${f.uid}`)
    domStr += initDomStr(f)
  })

  fileListRef.insertAdjacentHTML('beforeend', domStr)

  let svgDOMList = document.getElementsByClassName('svg-operation')
  if (svgDOMList.length) {
    for (let i = 0; i < svgDOMList.length; i++) {
      //鼠标移入事件
      svgDOMList[i].addEventListener('mouseenter', showTipBubble)
      //鼠标移出事件
      svgDOMList[i].addEventListener('mouseleave', hiddenTipBubble)
    }
  }
}

async function generateImageViewer(e) {
  if (e.target.id.includes('download-btn')) {
    let uid = e.target.id.split('=')[1]
    let targetFile = fileList.find(f => f.uid == uid)

    downloadFile(targetFile.img_url, targetFile.name)
  }

  if (e.target.nodeName == 'IMG') {
    // let viewerRef = document.getElementsByClassName('viewer-move')[0]
    let targetDom = document.getElementById(e.target.id)
    imagesViewer = new Viewer(targetDom, {
      url: 'data-original'
    })

    targetDom.click()
  }
}

function showTipBubble(e) {
  const targetBoundingClient = e.target.getBoundingClientRect()
  const targetInfo = {
    id: e.target.id.split('=')[0],
    uid: e.target.id.split('=')[0]
  }

  if (targetInfo?.id == 'success-status') {
    let translateX =
      targetBoundingClient?.x -
      statusBubble.clientWidth / 2 +
      targetBoundingClient?.width / 2
    let translateY =
      targetBoundingClient?.y - (targetBoundingClient?.height + 18)

    statusBubble.style.transform = `translate(${translateX}px, ${translateY}px)`
    statusBubble.classList.add('opacity-show')
  }

  if (targetInfo?.id == 'download-btn') {
    let translateX =
      targetBoundingClient?.x -
      downloadBubble.clientWidth / 2 +
      targetBoundingClient?.width / 2
    let translateY =
      targetBoundingClient?.y - (targetBoundingClient?.height + 18)

    downloadBubble.style.transform = `translate(${translateX}px, ${translateY}px)`
    downloadBubble.classList.add('opacity-show')
  }
}
function hiddenTipBubble(e) {
  const targetInfo = {
    id: e.target.id.split('=')[0],
    uid: e.target.id.split('=')[0]
  }
  if (targetInfo?.id == 'success-status') {
    statusBubble.classList.remove('opacity-show')
    setTimeout(() => {
      if (!statusBubble.classList.contains('opacity-show')) {
        statusBubble.style.transform = `translate(0px, 0px)`
      }
    }, 500)
  }

  if (targetInfo?.id == 'download-btn') {
    downloadBubble.classList.remove('opacity-show')
    setTimeout(() => {
      if (!downloadBubble.classList.contains('opacity-show')) {
        downloadBubble.style.transform = `translate(0px, 0px)`
      }
    }, 500)
  }
}

document.getElementById('uploadBtnRef').addEventListener('click', e => {
  uploadInputRef.click()
})

document
  .getElementById('uploadInputRef')
  .addEventListener('change', async (e, d, c) => {
    let fileList = Array.from(e.target.files)

    if (!fileList?.length || fileList?.[0] == undefined) {
      alert('未上传任何文件！')

      return
    }

    let enumMimetType = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ]

    let filterRes = fileList.filter(f => enumMimetType.includes(f.type))
    if (!filterRes.length) {
      alert('当前仅支持上传 jpg/jpeg/png/gif/svg/webp 的文件')
      return
    }

    if (filterRes.length != e.target.files.length) {
      console.log('已过滤非jpg/jpeg/png/gif/svg/webp 的文件')
    }

    let formData = new FormData()

    filterRes.forEach(f => formData.append('file_list', f))

    const res = await uploadFilesAPI(formData)

    if (res.status == 200) {
      fileListRef.innerHTML = ''
      initFileList()
    }
  })

// console.log('draggableRef', draggableRef)
// // 当文件在目标元素内移动时
// draggableRef.addEventListener('dragover', function (e) {
//   // 阻止事件冒泡
//   e.stopPropagation()
//   // 阻止默认事件（与drop事件结合，阻止拖拽文件在浏览器打开的默认行为）
//   e.preventDefault()
// })
// // 当拖拽文件在目标元素内松开时
// draggableRef.addEventListener('drop', function (e) {
//   // 阻止事件冒泡
//   e.stopPropagation()
//   // 阻止默认事件（与dragover事件结合，阻止拖拽文件在浏览器打开的默认行为）
//   e.preventDefault()
//   console.log('dataTransfer', e.dataTransfer)
//   // 获取拖拽上传的文件（files是个数组 此处默认限制只能上传一个）
//   console.log('获取拖拽上传的文件---', e.dataTransfer.files[0])
//   // 第二次验证选择的文件类型是否正确
//   if (
//     e.dataTransfer.files[0].type == 'application/msword' ||
//     e.dataTransfer.files[0].type ==
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ) {
//     file = e.dataTransfer.files[0]
//   } else {
//     alert('请选择正确的文件类型')
//   }
// })

// 获取dom元素
// let draggableRef = document.getElementById("drop")
// 文件流数组
let fileBlodArr = []
// 文件数组
let fileArr = []
// 拖拽上传事件
async function handleEvent(event) {
  // 阻止事件的默认行为
  event.preventDefault()
  if (event.type === 'drop') {
    // 文件进入并松开鼠标,文件边框恢复正常
    draggableRef.style.borderColor = '#a89b9b'

    console.log('event.dataTransfer.files', event.dataTransfer.files)
    for (let file of event.dataTransfer.files) {
      // 把文件保存到文件数组中
      fileArr.push(file)
      // 初始化文件
      // filesToBlod(file)
    }

    let enumMimetType = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ]

    let filterRes = fileArr.filter(f => enumMimetType.includes(f.type))

    if (!filterRes.length) {
      alert('当前仅支持上传 jpg/jpeg/png/gif/svg/webp 的文件')
      return
    }

    if (filterRes.length != event.dataTransfer.files.length) {
      console.log('已过滤非jpg/jpeg/png/gif/svg/webp 的文件')
    }

    let formData = new FormData()

    filterRes.forEach(f => formData.append('file_list', f))
    const res = await uploadFilesAPI(formData)

    if (res.status == 200) {
      fileListRef.innerHTML = ''
      initFileList()
    }
  } else if (event.type === 'dragleave') {
    // 离开时边框恢复
    draggableRef.style.borderColor = '#a89b9b'
  } else {
    // 进入边框变为红色
    draggableRef.style.borderColor = 'red'
  }
}
// 拖拽事件绑定
draggableRef.addEventListener('dragenter', handleEvent)
draggableRef.addEventListener('dragover', handleEvent)
draggableRef.addEventListener('drop', handleEvent)
draggableRef.addEventListener('dragleave', handleEvent)
