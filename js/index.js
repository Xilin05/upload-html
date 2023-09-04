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

async function getUserInfo() {
  // 🤠发送POST请求,获取json数据
  // const result = await fetchAjax('https://api.github.com/users/Xilin05')
  const { status, msg, data } = await fetchAjax(
    'https://www.fastmock.site/mock/c273bd037cac88380de2ec9776d4ce46/user/userinfo'
  )

  if (status === 200) {
    // alert('请求成功')
    console.log(data)
  }
}

function insertHTMLDOM(list = []) {
  let fileListRef = document.getElementById('fileListRef')
  fileListRef.addEventListener('click', generateImageViewer)
  let domStr = ''
  tempDomIds = []

  list.forEach((f, fIndex) => {
    tempDomIds.push(`imageViewerRef-${f.uid}`)
    domStr += `
    <div data-uid="${f.uid}" class="file-card">
      <svg class="file-icon svg-excel-file" aria-hidden="true" style="display: none;">
        <use xlink:href="#icon-Excel"></use>
      </svg>
      <div id="img-box" class="img-viewer" style="background-color: #464646; background: url('${f.img_url}') no-repeat; background-size: cover; background-position: center;">
        <img
          loading="lazy"
          id="imageViewerRef-${f.uid}"
          data-original="${f.img_url}"
          src="${f.img_url}"
          alt="${f.name}"
          style="opacity: 0;"
        />
      </div>
      <div class="file-info">
        <div class="name">
          <div class="text">${f.name}</div>
          <div class="more-btn">...查看更多</div>
        </div>
        <div class="size">${f.size}</div>
      </div>
      <div class="file-operations">
        <i id="download-btn=${f.uid}" class="svg-operation primary iconfont icon-xiazai"></i>
        <i id="success-status=${f.uid}" class="svg-operation success iconfont icon-check"></i>
        <i id="warning-status=${f.uid}"class="svg-operation warning iconfont icon-note" style="display: none;"></i>
      </div>

      <span class="progress-bg" ></span>
    </div>
    `
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
    statusBubble.style.opacity = 1
  }

  if (targetInfo?.id == 'download-btn') {
    let translateX =
      targetBoundingClient?.x -
      downloadBubble.clientWidth / 2 +
      targetBoundingClient?.width / 2
    let translateY =
      targetBoundingClient?.y - (targetBoundingClient?.height + 18)

    downloadBubble.style.transform = `translate(${translateX}px, ${translateY}px)`
    downloadBubble.style.opacity = 1
  }
}
function hiddenTipBubble(e) {
  const targetBoundingClient = e.target.getBoundingClientRect()
  const targetInfo = {
    id: e.target.id.split('=')[0],
    uid: e.target.id.split('=')[0]
  }
  if (targetInfo?.id == 'success-status') {
    statusBubble.style.opacity = 0
    statusBubble.style.transform = `translate(0px, 0px)`
  }

  if (targetInfo?.id == 'download-btn') {
    downloadBubble.style.opacity = 0
    downloadBubble.style.transform = `translate(0px, 0px)`
  }
}

document.getElementById('uploadBtnRef').addEventListener('click', e => {
  alert('上传功能待开放')
})
