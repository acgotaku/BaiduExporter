class Core {
  constructor () {
    this.version = '0.9.7'
    this.updateDate = '2017/09/22'
    this.defaultUA = 'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia'
    this.defaultReferer = 'https://pan.baidu.com/disk/home'
    this.cookies = null
  }
  init () {
  }
  // 将文件名用单引号包裹，并且反转义文件名中所有单引号，确保按照文件名保存
  escapeString (str) {
    if (navigator.platform.indexOf('Win') !== -1) {
      return str
    }
    return `'${str.replace(/'/g, "\\'")}'`
  }
  // 调整元素的位置使元素居中
  setCenter (element) {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const domRect = element.getBoundingClientRect()
    const left = (screenWidth - domRect.width) / 2 + scrollX
    const top = (screenHeight - domRect.height) / 2 + scrollY
    const domStyle = element.style
    domStyle.left = left
    domStyle.top = top
  }

  startListen () {
    function saveSyncData (data, value) {
      let obj = {[data]: value}
      chrome.storage.sync.set(obj, function () {
        // console.log(data + ' saved');
      })
    }
    window.addEventListener('message', function (event) {
      if (event.source !== window) {
        return
      }
      if (event.data.type && (event.data.type === 'configData')) {
        for (let key in event.data.data) {
          localStorage.setItem(key, event.data.data[key])
          if (event.data.data['rpcSync'] === true) {
            saveSyncData(key, event.data.data[key])
          } else {
            chrome.storage.sync.clear()
          }
        }
      }
      if (event.data.type && (event.data.type === 'clearData')) {
        chrome.storage.sync.clear()
      }
    }, false)
  }
  sendToBackground (method, data, callback) {
    chrome.runtime.sendMessage({
      method,
      data
    }, callback)
  }
  showToast (message, type) {
    window.postMessage({ type: 'showToast', data: { message, type } }, '*')
  }
  // 获取aria2c的版本号用来测试通信
  getVersion () {
    // TODO 路径和显示部分需要重构
    let data = {
      jsonrpc: '2.0',
      method: 'aria2.getVersion',
      id: 1,
      params: []
    }
    const rpcPath = document.querySelector('#rpcURL').value
    const {authStr, path} = this.parseAuth(rpcPath)
    if (authStr && authStr.startsWith('token')) {
      data.params.unshift(authStr)
    }
    const parameter = { url: path, dataType: 'json', type: 'POST', data: JSON.stringify(data) }
    if (authStr && authStr.startsWith('Basic')) {
      parameter['headers'] = { 'Authorization': authStr }
    }
    this.sendToBackground('rpc_version', parameter, function (version) {
      if (version) {
        document.querySelector('#sendTest').html = `Aria2\u7248\u672c\u4e3a\uff1a\u0020${version.result.version}`
      } else {
        document.querySelector('#sendTest').html = '\u9519\u8BEF,\u8BF7\u67E5\u770B\u662F\u5426\u5F00\u542FAria2'
      }
    })
  }
  // 解析 RPC地址 返回验证数据 和地址
  parseAuth (url) {
    const parseURL = new URL(url)
    let authStr = (parseURL.username !== '') ? `${parseURL.username} : ${decodeURI(parseURL.password)}` : null
    if (authStr) {
      if (authStr.indexOf('token:') !== 0) {
        authStr = `Basic ${btoa(authStr)}`
      }
    }
    const hash = parseURL.hash.substr(1)
    let options = []
    if (hash) {
      hash.split('&').forEach((item) => {
        const config = item.split('=')
        if (config) {
          options.push([config[0], config.length === 2 ? config[1] : 'enabled'])
        }
      })
    }
    const path = parseURL.origin + parseURL.pathname
    return {authStr, path, options}
  }
  addMenu () {
  }
  updateMenu () {
  }
  copyText (text) {
    const input = document.createElement('textarea')
    document.body.appendChild(input)
    input.value = text
    input.focus()
    input.select()
    const result = document.execCommand('copy')
    input.remove()
    if (result) {
      this.showToast('拷贝成功~', 'MODE_SUCCESS')
    } else {
      this.showToast('拷贝失败 QAQ', 'MODE_FAILURE')
    }
  }
}

export default Core
