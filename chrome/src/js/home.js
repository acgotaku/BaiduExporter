import Core from './lib/core'
import Config from './lib/config'
import Downloader from './lib/downloader'

class Home extends Downloader {
  constructor () {
    const search = {
      dir: '',
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const listParameter = {
      search,
      url: `/api/list`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    super(listParameter)
    Config.init()
    Core.requestCookies([{ url: 'http://pan.baidu.com/', name: 'BDUSS' }, { url: 'http://pcs.baidu.com/', name: 'pcsett' }])
    Core.addMenu('home')
    Core.showToast('初始化成功!', 'success')
    this.mode = 'RPC'
    this.rpcURL = 'http://localhost:6800/jsonrpc'
  }

  startListen () {
    window.addEventListener('message', (event) => {
      if (event.source !== window) {
        return
      }

      if (event.data.type && event.data.type === 'selected') {
        this.reset()
        const selectedFile = event.data.data
        if (selectedFile.length === 0) {
          Core.showToast('请选择一下你要保存的文件哦', 'failure')
          return
        }
        selectedFile.forEach((item) => {
          if (item.isdir) {
            this.addFolder(item.path)
          } else {
            this.addFile(item)
          }
        })
        this.start(Core.getConfigData('interval'), (fileDownloadInfo) => {
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
    window.postMessage({ type: 'getSelected' }, location.origin)
  }
  getFilesByChunk (files, fidlist) {
    // eslint-disable-next-line no-new-func
    const sign = btoa(new Function(`return ${window.yunData.sign2}`)()(window.yunData.sign3, window.yunData.sign1))

    const search = {
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
      search,
      url: `/api/download`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    return new Promise((resolve) => {
      fileParameter.search.fidlist = JSON.stringify(fidlist)
      fetch(`${window.location.origin}${fileParameter.url}${Core.objectToQueryString(fileParameter.search)}`, fileParameter.options).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            if (data.errno !== 0) {
              Core.showToast('未知错误', 'failure')
              console.log(data)
              return
            }
            data.dlink.forEach((item) => {
              this.fileDownloadInfo.push({
                name: files[item.fs_id].path,
                link: item.dlink,
                md5: files[item.fs_id].md5
              })
              resolve()
            })
          })
        } else {
          console.log(response)
        }
      })
    })
  }
  getFiles (files) {
    const chunk = 100
    const fileArray = Object.keys(files)
    const fidlist = fileArray.map((el, index) => {
      return index % chunk === 0 ? fileArray.slice(index, index + chunk) : null
    }).filter(el => el)
    const list = fidlist.map(item => this.getFilesByChunk(files, item))
    return new Promise((resolve) => {
      Promise.all(list).then(() => {
        resolve()
      })
    })
  }
}

const home = new Home()

home.startListen()
