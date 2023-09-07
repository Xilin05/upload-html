const LOCATION = window.location
// const BASE_URL = `http://dingding.shining98.top:5012`
// const BASE_URL = `${LOCATION.protocol}//${LOCATION.hostname}:5012`
const BASE_URL = `https://127.0.01:5012`

// 默认配置项
const fetchOptions = {
  headers: {
    Origin: BASE_URL,
    'Content-Type': 'application/json;charset=utf-8'
  },
  method: 'GET',
  // 默认设置请求超时时间,且超时时间为6秒钟
  timeoutFlag: true,
  timeout: 6000,
  // 默认不返回blob对象,返回json
  returnBlobFlag: false,
  // 默认值,同源请求时发送Cookie,跨域请求时不发送.
  credentials: 'same-origin',
  // 没有权限时,需要跳转到的画面
  loginPath: '/login.html'
}

// 设置请求对象的配置信息
const setRequestConfig = (param = {}, options = {}) => {
  // 配置对象合并
  const defaultOptions = {
    ...fetchOptions,
    ...options
  }

  // 判断传入的参数是否为FormData实例
  const formDataKbn = param instanceof FormData

  // 如果不是GET请求,就添加body配置项
  if (defaultOptions.method !== 'GET') {
    // 如果是FormData表单对象,就直接放入,否则解析为json字符串
    defaultOptions.body = formDataKbn ? param : JSON.stringify(param)
  }

  // 如果是文件上传的话,就删除headers请求头属性
  if (formDataKbn) Reflect.deleteProperty(defaultOptions, 'headers')

  // 请求头
  const headers = new Headers(defaultOptions.headers)

  // 请求对象
  const requestConfig = {
    // 将默认的配置对象解构到请求对象中
    ...defaultOptions,
    headers
  }

  return requestConfig
}

// fetch的Ajax请求
const fetchAjax = async (url, param = {}, options = {}) => {
  // const domain = window.location.host
  // console.log('domain', domain)
  // 设置请求对象的配置信息
  const requestConfig = setRequestConfig(param, options)
  const request = new Request(BASE_URL + url, requestConfig)
  // 超时函数
  let abortId
  let timeout = false
  if (requestConfig.timeoutFlag) {
    abortId = setTimeout(() => {
      timeout = true
    }, requestConfig.timeout)
  }

  try {
    // 发送请求,获取响应
    const response = await fetch(request)
    // 判断请求是否超时
    if (timeout) {
      /*
        任何一个await语句后面的Promise对象变为reject状态,那么整个async函数都会中断执行
        因此Promise.reject()前面必须添加await
      */
      await Promise.reject('timeout')
    }

    const { status, statusText } = response
    // 没有权限则跳转登录画面
    // if ([401, 403].includes(status)) {
    //   window.location = requestConfig.loginPath
    // }
    // 如果请求失败
    // if (status < 200 || status >= 300) {
    //   return new Error(statusText)
    // }

    // 文件流对象flag
    if (requestConfig.returnBlobFlag) {
      return response.blob()
    } else {
      return response.json()
    }
  } catch (error) {
    console.log(error)
  } finally {
    // 请求超时延时器
    clearTimeout(abortId)
  }
}

// export default fetchAjax
