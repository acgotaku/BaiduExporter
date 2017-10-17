import Core from './core'

class Config {
  constructor () {
    this.version = '0.9.7'
    this.updateDate = '2017/09/22'
  }
  init () {
    this.addSettingUI()
    this.addTextExport()
    if (typeof browser !== 'undefined') {
      chrome = browser
      if (!chrome.storage.sync) {
        chrome.storage.sync = chrome.storage.local
      }
    }
    chrome.storage.sync.get(null, (items) => {
      for (let key in items) {
        // console.log(key + items[key])
        chrome.storage.local.set({key: items[key]}, () => {
          console.log('chrome first local set: %s, %s', key, items[key])
        })
      }
      this.initSetting()
    })
  }
  saveConfigData (configData) {
    for (let key in configData) {
      chrome.storage.local.set({[key]: configData[key]}, () => {
        console.log('chrome local set: %s, %s', key, configData[key])
      })
      if (configData['configSync'] === true) {
        chrome.storage.sync.set({[key]: configData[key]}, () => {
          console.log('chrome sync set: %s, %s', key, configData[key])
        })
      }
    }
  }
  readConfigData (key = null) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, resolve)
    })
  }
  clearConfigData () {
    chrome.storage.sync.clear()
    chrome.storage.local.clear()
  }
  addTextExport () {
    const text = `
      <div id="textExport" class="export-menu">
        <div class="export-menu-inner">
          <div class="export-menu-header">
            <div class="export-menu-title">文本导出</div>
            <div class="export-menu-close">×</div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', text)
    const close = document.querySelector('.export-menu-close')
    const exportMenu = document.querySelector('#textExport')
    close.addEventListener('click', () => {
      exportMenu.classList.remove('open-o')
    })
  }
  addSettingUI () {
    const setting = `
      <div id="settingMenu" class="modal setting-menu">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">导出设置</div>
            <div class="modal-close">×</div>
          </div>
          <div class="modal-body">
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
          <div class="modal-footer">
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
    const close = document.querySelector('.modal-close')
    const settingMenu = document.querySelector('#settingMenu')
    close.addEventListener('click', () => {
      settingMenu.classList.remove('open-o')
      this.updateSetting()
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
      this.clearConfigData()
      this.initSetting().then(() => {
        message.innerText = '设置已重置'
      })
    })

    const testAria2 = document.querySelector('#testAria2')
    testAria2.addEventListener('click', () => {
      Core.getVersion(Core.configData.rpcList[0].url, testAria2)
    })
  }
  initSetting () {
    // TODO promise 没必要两重
    return new Promise((resolve) => {
      this.readConfigData().then((items = Core.defaultConfigData) => {
        Core.setConfigData(Object.assign({}, Core.defaultConfigData, items))
        this.updateSetting()
        resolve()
      })
    })
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
    const testAria2 = document.querySelector('#testAria2')
    testAria2.innerText = '测试连接，成功显示版本号'
  }
  updateSetting () {
    this.resetSetting()
    Core.updateMenu()
    const { rpcList, configSync, md5Check, fold, interval, downloadPath, userAgent, referer, headers } = Core.getConfigData()
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
    const fold = Number.parseInt(document.querySelector('.fold-s').value)
    const interval = document.querySelector('.interval-s').value
    const downloadPath = document.querySelector('.downloadPath-s').value
    const userAgent = document.querySelector('.userAgent-s').value
    const referer = document.querySelector('.referer-s').value
    const headers = document.querySelector('.headers-s').value

    const configData = {
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
    Core.setConfigData(configData)
    this.saveConfigData(Core.configData)
  }
}

export default new Config()
