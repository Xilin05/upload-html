document.addEventListener(
  'DOMContentLoaded',
  async function () {
    let versionInfo = await getVersionInfo()
    console.log('DOMContentLoaded', versionInfo)
    let storageVersion = localStorage.getItem('version')
    if (storageVersion) {
      if (storageVersion != versionInfo?.current_version) {
        alert('检测到新版本，即将自动强制刷新')
        localStorage.setItem('version', versionInfo?.current_version)
      }
    } else {
      localStorage.setItem('version', versionInfo?.current_version)
      window.location.reload(true)
    }
  },
  false
)

async function getVersionInfo() {
  return await getVersionApi()
}

async function initFileList() {
  fileList = await getFileListAPI()
  if (fileList.length) {
    emptyTipRef.classList.add('hidden')
    insertHTMLDOM(fileList)
  } else {
    emptyTipRef.classList.remove('hidden')
  }
}

initFileList()
// console.log('qiniu', qiniu)

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
    <div data-uid="${payload?.uid}" class="file-card">
    <svg class="file-icon svg-excel-file" aria-hidden="true" style="display: none;">
      <use xlink:href="#icon-Excel"></use>
    </svg>
    <div id="img-box" class="img-viewer" style="background-color: #464646; background: url('${
      payload?.img_url_temp
    }') no-repeat; background-size: cover; background-position: center;">
      <img
        loading="lazy"
        id="imageViewerRef-${payload?.uid}"
        data-original="${payload?.img_url}"
        src="${payload?.img_url_temp}"
        alt="${payload?.name}"
        style="opacity: 0;"
      />
    </div>
    <div class="file-info">
      <div class="name">
        ${payload?.name}
      </div>
      <div class="size">${payload?.create_time} - ${payload?.size}</div>
    </div>
    <div class="file-operations">
      <i id="download-btn=${payload?.uid}" class="${
    payload?.preview ? 'hidden' : ''
  } svg-operation primary iconfont icon-xiazai"></i>
      <i id="success-status=${payload?.uid}" class="${
    payload?.preview ? 'hidden' : ''
  } svg-operation success iconfont icon-check"></i>
      <i id="warning-status=${payload?.uid}" class="${
    payload?.preview ? 'hidden' : ''
  } svg-operation warning iconfont icon-note" style="display: none;"></i>
      <i id="loading-status=${payload?.uid}" class="${
    payload?.preview ? '' : 'hidden'
  } svg-operation primary iconfont icon-loading03 animation-rotate"></i>
    </div>
    <span class="progress-bg" ></span>
  </div>
  `
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

function asyncOnload(file) {
  let reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => {
      let info = {
        preview: true,
        uid: GenNonDuplicateID(),
        img_url: event.target.result,
        img_url_temp: event.target.result,
        size: formatSize(file?.size),
        name: file?.name,
        create_time: new Date().toLocaleString()
      }

      if (initDomStr(info)) {
        resolve(initDomStr(info))
      } else {
        reject('')
      }
    }
    reader.readAsDataURL(file)
  })
}

async function insertBeforeDom(fileList) {
  let tempStr = ''

  for (let index = 0; index < fileList.length; index++) {
    const f = fileList[index]
    tempStr += await asyncOnload(f)
  }

  emptyTipRef.classList.add('hidden')

  fileListRef.insertAdjacentHTML('afterbegin', tempStr)
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

async function dealUpload(payload) {
  const { event, originLength = 0, fileList = [] } = payload

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

  if (filterRes.length != originLength) {
    console.log('已过滤非jpg/jpeg/png/gif/svg/webp 的文件')
  }

  insertBeforeDom(filterRes)

  // compressImg(filterRes)

  let formData = new FormData()
  filterRes.forEach(f => formData.append('file_list', f))
  const res = await uploadFilesAPI(formData)

  if (res?.status == 200) {
    fileListRef.innerHTML = ''
    initFileList()
  }
}

document.getElementById('uploadBtnRef').addEventListener('click', e => {
  uploadInputRef.click()
})

document
  .getElementById('uploadInputRef')
  .addEventListener('change', async (e, d, c) => {
    dealUpload({
      event: e,
      originLength: e.target.files,
      fileList: Array.from(e.target.files)
    })
  })

// 获取dom元素
// let draggableRef = document.getElementById("drop")
// 拖拽上传事件
async function handleEvent(event) {
  // 阻止事件的默认行为
  event.preventDefault()
  if (event.type === 'drop') {
    // 文件进入并松开鼠标,文件边框恢复正常
    draggableRef.style.borderColor = '#a89b9b'

    dealUpload({
      event,
      originLength: event.dataTransfer.files.length,
      fileList: Array.from(event.dataTransfer.files)
    })
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
