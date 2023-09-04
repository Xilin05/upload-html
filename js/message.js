/** 一直累加的定位层级 */
let zIndex = params.zIndex || 1000
/**
 * 消息队列
 * @type {Array<HTMLElement>}
 */
const messageList = []

/**
 * 获取指定`item`的定位`top`
 * @param {HTMLElement=} el
 */
function getItemTop(el) {
  let top = 10
  for (let i = 0; i < messageList.length; i++) {
    const item = messageList[i]
    if (el && el === item) {
      break
    }
    top += item.clientHeight + 20
  }
  return top
}

/**
 * 删除指定列表项
 * @param {HTMLElement} el
 */
function removeItem(el) {
  for (let i = 0; i < messageList.length; i++) {
    const item = messageList[i]
    if (item === el) {
      messageList.splice(i, 1)
      break
    }
  }
  el.classList.add(className.hide)
  messageList.forEach(function (item) {
    item.style.top = `${getItemTop(item)}px`
  })
}

/**
 * 显示一条消息
 * @param {string} content 内容
 * @param {"info"|"success"|"warning"|"error"} type 消息类型
 * @param {number} duration 持续时间，优先级比默认值高
 */
function show(content, type = 'info', duration) {
  const el = doc.createElement('div')
  el.className = `${className.box} ${type}`
  el.style.top = `${getItemTop()}px`
  el.style.zIndex = zIndex
  el.innerHTML = `
  <span class="${className.icon}"></span>
  <span class="${className.text}">${content}</span>
  `
  zIndex++
  messageList.push(el)
  doc.body.appendChild(el)
  // 添加动画监听事件
  function animationEnd() {
    el.removeEventListener('animationend', animationEnd)
    setTimeout(removeItem, duration || params.duration || 3000, el)
  }
  el.addEventListener('animationend', animationEnd)
  function transitionEnd() {
    if (getComputedStyle(el).opacity !== '0') return
    el.removeEventListener('transitionend', transitionEnd)
    el.remove()
  }
  el.addEventListener('transitionend', transitionEnd)
}
