class Core {
  constructor () {
    this.cookies = null
    this.defaultRPC = [{name: 'ARIA2 RPC', url: 'http://localhost:6800/jsonrpc'}]
    this.defaultUserAgent = 'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuserAgentnJia'
    this.defaultReferer = 'https://pan.baidu.com/disk/home'
    this.defaultConfigData = {
      rpcList: this.defaultRPC,
      configSync: false,
      md5Check: false,
      fold: 0,
      interval: 300,
      downloadPath: '',
      userAgent: this.defaultUserAgent,
      referer: this.defaultReferer,
      headers: ''
    }
    this.configData = {}
  }
  getConfigData (key = null) {
    if (key) {
      return this.configData[key]
    } else {
      return this.configData
    }
  }
  setConfigData (configData) {
    this.configData = configData
  }
  // 将文件名用单引号包裹，并且反转义文件名中所有单引号，确保按照文件名保存
  escapeString (str) {
    if (navigator.platform.includes('Win')) {
      return str
    }
    return `'${str.replace(/'/g, "\\'")}'`
  }
  objectToQueryString (obj) {
    const string = Object.keys(obj).map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
    }).join('&')
    return `?${string}`
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
  // 解析 RPC地址 返回验证数据 和地址
  parseAuth (url) {
    const parseURL = new URL(url)
    let authStr = (parseURL.username !== '') ? `${parseURL.username}:${decodeURI(parseURL.password)}` : null
    if (authStr) {
      if (!authStr.includes('token:')) {
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
  // 获取aria2c的版本号用来测试通信
  getVersion (rpcPath, element) {
    let data = {
      jsonrpc: '2.0',
      method: 'aria2.getVersion',
      id: 1,
      params: []
    }
    const {authStr, path} = this.parseAuth(rpcPath)
    if (authStr && authStr.startsWith('token')) {
      data.params.unshift(authStr)
    }
    const parameter = {
      url: path,
      options: {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: JSON.stringify(data)
      }
    }
    if (authStr && authStr.startsWith('Basic')) {
      Object.assign(parameter.options.headers, { Authorization: authStr })
    }
    this.sendToBackground('rpcVersion', parameter, function (version) {
      if (version) {
        element.innerText = `Aria2\u7248\u672c\u4e3a\uff1a\u0020${version}`
      } else {
        element.innerText = '\u9519\u8BEF,\u8BF7\u67E5\u770B\u662F\u5426\u5F00\u542FAria2'
      }
    })
  }
  addMenu (type) {
    const menu = `
      <div id="exportMenu" class="g-dropdown-button">
        <a class="g-button">
          <span class="g-button-right">
            <em class="icon icon-download"></em>
            <span class="text">导出下载</span>
          </span>
        </a>
        <div id="aria2List" class="menu">
          <a class="g-button-menu" id="aria2Text" href="javascript:void(0);">文本导出</a>
          <a class="g-button-menu" id="settingButton" href="javascript:void(0);">设置</a>
        </div>
      </div>`
    const near = document.querySelectorAll('.g-dropdown-button')[3]
    near.insertAdjacentHTML('afterend', menu)
    const exportMenu = document.querySelector('#exportMenu')
    exportMenu.addEventListener('mouseenter', () => {
      exportMenu.classList.add('button-open')
    })
    exportMenu.addEventListener('mouseleave', () => {
      exportMenu.classList.remove('button-open')
    })
    const settingButton = document.querySelector('#settingButton')
    const settingMenu = document.querySelector('#settingMenu')
    settingButton.addEventListener('click', () => {
      settingMenu.classList.add('open-o')
    })
  }
  resetMenu () {
    document.querySelectorAll('.rpc-button').forEach((rpc) => {
      rpc.remove()
    })
  }
  updateMenu () {
    this.resetMenu()
    const { rpcList } = this.configData
    let rpcDOMList = ''
    rpcList.forEach((rpc) => {
      const rpcDOM = `<a class="g-button-menu rpc-button" href="javascript:void(0);" data-url=${rpc.url}>${rpc.name}</a>`
      rpcDOMList = rpcDOMList + rpcDOM
    })
    document.querySelector('#aria2List').insertAdjacentHTML('afterbegin', rpcDOMList)
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
  // names format  [{"url": "http://pan.baidu.com/", "name": "BDUSS"},{"url": "http://pcs.baidu.com/", "name": "pcsett"}]
  requestCookies (names) {
    this.sendToBackground('getCookies', names, (value) => { this.cookies = value })
  }
}

export default new Core()
