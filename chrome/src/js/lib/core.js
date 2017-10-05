class Core {
  constructor () {
    this.version = '0.9.7'
    this.updateDate = '2017/09/22'
    this.defaultRPC = [{name: 'ARIA2 RPC', url: 'http://localhost:6800/jsonrpc'}]
    this.defaultUserAgent = 'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuserAgentnJia'
    this.defaultReferer = 'https://pan.baidu.com/disk/home'
    this.cookies = null
  }
  init () {
    this.initSetting()
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
          localStorage.setItem(key, JSON.stringify(event.data.data[key]))
          if (event.data.data['configSync'] === true) {
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
        element.innerHTML = `Aria2\u7248\u672c\u4e3a\uff1a\u0020${version}`
      } else {
        element.innerHTML = '\u9519\u8BEF,\u8BF7\u67E5\u770B\u662F\u5426\u5F00\u542FAria2'
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
          <a class="g-button-menu" href="javascript:void(0);">ARIA2 RPC</a>
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
      this.updateSetting()
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
            <div class="setting-menu-message">
              <label class="setting-menu-label orange-o" id="message"></label>
            </div>
            <div class="setting-menu-row rpc-s">
              <div class="setting-menu-name">
                <input class="setting-menu-input name-s" spellcheck="false">
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input url-s" spellcheck="false">
                <a class="setting-menu-button" id="addRPC" href="javascript:void(0);">添加RPC地址</a>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">配置同步</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox configSync-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">MD5校验</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox md5Check-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">文件夹层数</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input small-o fold-s" type="number" spellcheck="false">
                <label class="setting-menu-label">(默认0表示不保留,-1表示保留完整路径)</label>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">递归下载间隔</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input small-o interval-s" type="number" spellcheck="false">
                <label class="setting-menu-label">(单位:毫秒)</label>
                <a class="setting-menu-button version-s" id="testAria2" href="javascript:void(0);">测试连接，成功显示版本号</a>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">下载路径</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input downloadPath-s" placeholder="只能设置为绝对路径" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">User-Agent</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input userAgent-s" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">Referer</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input referer-s" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">Headers</label>
              </div>
              <div class="setting-menu-value">
                <textarea class="setting-menu-input textarea-o headers-s" type="textarea" spellcheck="false"></textarea>
              </div>
            </div><!-- /.setting-menu-row -->
          </div><!-- /.setting-menu-body -->
          <div class="setting-menu-footer">
            <div class="setting-menu-copyright">
              <div class="setting-menu-item">
                <label class="setting-menu-label">&copy; Copyright</label>
                <a class="setting-menu-link" href="https://github.com/acgotaku/BaiduExporter" target="_blank">雪月秋水</a>
              </div>
              <div class="setting-menu-item">
                <label class="setting-menu-label">Version: ${this.version}</label>
                <label class="setting-menu-label">Update date: ${this.updateDate}</label>
              </div>
            </div><!-- /.setting-menu-copyright -->
            <div class="setting-menu-operate">
              <a class="setting-menu-button large-o blue-o" id="apply" href="javascript:void(0);">应用</a>
              <a class="setting-menu-button large-o" id="reset" href="javascript:void(0);">重置</a>
            </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', setting)
    const close = document.querySelector('.setting-menu-close')
    const settingMenu = document.querySelector('#settingMenu')
    close.addEventListener('click', () => {
      settingMenu.classList.remove('open-o')
    })
    const addRPC = document.querySelector('#addRPC')
    addRPC.addEventListener('click', () => {
      const rpcDOMList = document.querySelectorAll('.rpc-s')
      const RPC = `
        <div class="setting-menu-row rpc-s">
          <div class="setting-menu-name">
            <input class="setting-menu-input name-s" spellcheck="false">
          </div>
          <div class="setting-menu-value">
            <input class="setting-menu-input url-s" spellcheck="false">
          </div>
        </div><!-- /.setting-menu-row -->`
      Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC)
    })
    const apply = document.querySelector('#apply')
    const message = document.querySelector('#message')
    apply.addEventListener('click', () => {
      this.saveSetting()
      this.updateSetting()
      message.innerText = '设置已保存'
    })

    const reset = document.querySelector('#reset')
    reset.addEventListener('click', () => {
      localStorage.clear()
      window.postMessage({ type: 'clearData' }, '*')
      this.initSetting()
      this.updateSetting()
      message.innerText = '设置已重置'
    })

    const testAria2 = document.querySelector('#testAria2')
    testAria2.addEventListener('click', () => {
      this.getVersion(this.configData.rpcList[0].url, testAria2)
    })
  }
  initSetting () {
    this.configData = {
      rpcList: JSON.parse(localStorage.getItem('rpcList')) || this.defaultRPC,
      configSync: JSON.parse(localStorage.getItem('configSync')) || false,
      md5Check: JSON.parse(localStorage.getItem('md5Check')) || false,
      fold: JSON.parse(localStorage.getItem('fold')) || 0,
      interval: JSON.parse(localStorage.getItem('interval')) || 300,
      downloadPath: JSON.parse(localStorage.getItem('downloadPath')) || null,
      userAgent: JSON.parse(localStorage.getItem('userAgent')) || this.defaultUserAgent,
      referer: JSON.parse(localStorage.getItem('referer')) || this.defaultReferer,
      headers: JSON.parse(localStorage.getItem('headers')) || ''
    }
  }
  resetSetting () {
    // reset dom
    document.querySelectorAll('.rpc-s').forEach((rpc, index) => {
      if (index !== 0) {
        rpc.remove()
      }
    })
    const message = document.querySelector('#message')
    message.innerText = ''
  }
  updateSetting () {
    this.resetSetting()
    const { rpcList, configSync, md5Check, fold, interval, downloadPath, userAgent, referer, headers } = this.configData
    rpcList.forEach((rpc, index) => {
      const rpcDOMList = document.querySelectorAll('.rpc-s')
      if (index === 0) {
        rpcDOMList[index].querySelector('.name-s').value = rpc.name
        rpcDOMList[index].querySelector('.url-s').value = rpc.url
      } else {
        const RPC = `
          <div class="setting-menu-row rpc-s">
            <div class="setting-menu-name">
              <input class="setting-menu-input name-s" value="${rpc.name}" spellcheck="false">
            </div>
            <div class="setting-menu-value">
              <input class="setting-menu-input url-s" value="${rpc.url}" spellcheck="false">
            </div>
          </div><!-- /.setting-menu-row -->`
        Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC)
      }
    })
    document.querySelector('.configSync-s').checked = configSync
    document.querySelector('.md5Check-s').checked = md5Check
    document.querySelector('.fold-s').value = fold
    document.querySelector('.interval-s').value = interval
    document.querySelector('.downloadPath-s').value = downloadPath
    document.querySelector('.userAgent-s').value = userAgent
    document.querySelector('.referer-s').value = referer
    document.querySelector('.headers-s').value = headers
  }

  saveSetting () {
    // TODO 检测数据来变更DOM
    const rpcDOMList = document.querySelectorAll('.rpc-s')
    const rpcList = Array.from(rpcDOMList).map((rpc) => {
      const name = rpc.querySelector('.name-s').value
      const url = rpc.querySelector('.url-s').value
      if (name && url) {
        return { name, url }
      }
    })
    const configSync = document.querySelector('.configSync-s').checked
    const md5Check = document.querySelector('.md5Check-s').checked
    const fold = document.querySelector('.fold-s').value
    const interval = document.querySelector('.interval-s').value
    const downloadPath = document.querySelector('.downloadPath-s').value
    const userAgent = document.querySelector('.userAgent-s').value
    const referer = document.querySelector('.referer-s').value
    const headers = document.querySelector('.headers-s').value

    this.configData = {
      rpcList,
      configSync,
      md5Check,
      fold,
      interval,
      downloadPath,
      userAgent,
      referer,
      headers
    }
    window.postMessage({ type: 'configData', data: this.configData }, '*')
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
