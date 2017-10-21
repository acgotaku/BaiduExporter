import Core from './lib/core'
import Config from './lib/config'
import Downloader from './lib/downloader'

class Home {
  constructor () {
    Config.init()
    Core.requestCookies([{ url: 'http://pan.baidu.com/', name: 'BDUSS' }, { url: 'http://pcs.baidu.com/', name: 'pcsett' }])
    Core.addMenu('home')
    Core.showToast('初始化成功!', 'success')
    this.mode = 'RPC'
    this.rpcURL = 'http://localhost:6800/jsonrpc'
    this.initDownloader()
  }
  initDownloader () {
    const listSearch = {
      dir: '',
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const listParameter = {
      search: listSearch,
      url: `/api/list`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    // eslint-disable-next-line no-new-func
    const sign = btoa(new Function(`return ${window.yunData.sign2}`)()(window.yunData.sign3, window.yunData.sign1))

    const fileSearch = {
      sign,
      type: 'dlink',
      bdstoken: window.yunData.bdstoken,
      fidlist: '',
      timestamp: window.yunData.timestamp,
      channel: 'chunlei',
      clienttype: 0,
      web: 1,
      app_id: 250528
    }

    const fileParameter = {
      search: fileSearch,
      url: `/api/download`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    this.downloader = new Downloader(listParameter, fileParameter)
  }
  startListen () {
    window.addEventListener('message', (event) => {
      if (event.source !== window) {
        return
      }

      if (event.data.type && event.data.type === 'selected') {
        this.downloader.reset()
        const selectedFile = event.data.data
        if (selectedFile.length === 0) {
          Core.showToast('请选择一下你要保存的文件哦', 'failure')
          return
        }
        selectedFile.forEach((item) => {
          if (item.isdir) {
            this.downloader.addFolder(item.path)
          } else {
            this.downloader.addFile(item)
          }
        })
        this.downloader.start(Core.getConfigData('interval'), (fileDownloadInfo) => {
          if (this.mode === 'RPC') {
            Core.aria2RPCMode(this.rpcURL, fileDownloadInfo)
          }
          if (this.mode === 'TXT') {
            Core.aria2TXTMode(fileDownloadInfo)
            document.querySelector('#textMenu').classList.add('open-o')
          }
        })
      }
    })
    const menuButton = document.querySelector('#aria2List')
    menuButton.addEventListener('click', (event) => {
      const rpcURL = event.target.dataset.url
      if (rpcURL) {
        this.rpcURL = rpcURL
        this.getSelected()
        this.mode = 'RPC'
      }
      if (event.target.id === 'aria2Text') {
        this.getSelected()
        this.mode = 'TXT'
      }
    })
  }

  getSelected () {
    window.postMessage({ type: 'getSelected' }, '*')
  }
}

const home = new Home()

home.startListen()
