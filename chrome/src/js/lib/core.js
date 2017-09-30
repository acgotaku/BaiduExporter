class Core {
  constructor () {
    this.version = '0.9.7'
    this.updateDate = '2017/09/22'
    this.defaultUA = 'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia'
    this.defaultReferer = 'https://pan.baidu.com/disk/home'
    this.cookies = null
  }
  init () {
    this.addSetting()
    this.startListen()
    if (typeof browser !== 'undefined') {
      chrome = browser
      if (!chrome.storage.sync) {
        chrome.storage.sync = chrome.storage.local
      }
    }
    chrome.storage.sync.get(null, function (items) {
      for (var key in items) {
        localStorage.setItem(key, items[key])
        // console.log(key + items[key])
      }
    })
  }
  // 将文件名用单引号包裹，并且反转义文件名中所有单引号，确保按照文件名保存
  escapeString (str) {
    if (!navigator.platform.includes('Win')) {
      return str
    }
    return `'${str.replace(/'/g, "\\'")}'`
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
    const parameter = { url: path, dataType: 'json', type: 'POST', data: JSON.stringify(data) }
    if (authStr && authStr.startsWith('Basic')) {
      parameter['headers'] = { 'Authorization': authStr }
    }
    this.sendToBackground('rpc_version', parameter, function (version) {
      if (version) {
        element.innerHTML = `Aria2\u7248\u672c\u4e3a\uff1a\u0020${version.result.version}`
      } else {
        element.innerHTML = '\u9519\u8BEF,\u8BF7\u67E5\u770B\u662F\u5426\u5F00\u542FAria2'
      }
    })
  }
  // 解析 RPC地址 返回验证数据 和地址
  parseAuth (url) {
    const parseURL = new URL(url)
    let authStr = (parseURL.username !== '') ? `${parseURL.username} : ${decodeURI(parseURL.password)}` : null
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
          <a class="g-button-menu" href="javascript:void(0);">ARIA2 RPC</a>
          <a class="g-button-menu" id="aria2Text" href="javascript:void(0);">文本导出</a>
          <a class="g-button-menu" href="javascript:void(0);">设置</a>
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
  }
  updateMenu () {
  }
  addSetting () {
    const setting = `
      <div id="settingMenu" class="setting-menu">
        <div class="setting-menu-inner">
          <div class="setting-menu-header">
            <div class="setting-menu-title">导出设置</div>
            <div class="setting-menu-close">×</div>
          </div>
          <div class="setting-menu-body">
            <div class="setItem-menu-row">

            </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', setting)
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
