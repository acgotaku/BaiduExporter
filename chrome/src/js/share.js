import Core from './lib/core'
import Config from './lib/config'
import Downloader from './lib/downloader'

class Share extends Downloader {
  constructor () {
    const search = {
      dir: '',
      bdstoken: window.yunData.MYBDSTOKEN,
      uk: window.yunData.SHARE_UK,
      shareid: window.yunData.SHARE_ID,
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const listParameter = {
      search,
      url: `/share/list?`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    super(listParameter)
    Config.init()
    Core.requestCookies([{ url: 'http://pan.baidu.com/', name: 'BDUSS' }, { url: 'http://pcs.baidu.com/', name: 'pcsett' }])
    Core.addMenu(document.querySelector('a[data-button-id="b1"]'), 'beforebegin')
    Core.showToast('初始化成功!', 'success')
    this.mode = 'RPC'
    this.rpcURL = 'http://localhost:6800/jsonrpc'
    this.cookies = null
    this.requestCookies()
  }

  startDownload () {
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

  requestCookies () {
    Core.sendToBackground('getCookies', [{ url: 'http://pan.baidu.com/', name: 'BDCLND' }], (value) => { this.cookies = decodeURIComponent(value['BDCLND']) })
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
        this.startDownload()
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
    if (window.yunData.SHAREPAGETYPE === 'single_file_page') {
      this.reset()
      this.addFile({
        fs_id: window.yunData.FS_ID,
        path: window.yunData.PATH
      })
      this.startDownload()
    } else {
      window.postMessage({ type: 'getSelected' }, location.origin)
    }
  }

  getFiles (files) {
    let list = []
    for (let key in files) {
      list.push(files[key].fs_id)
    }
    const body = {
      encrypt: '0',
      product: 'share',
      uk: window.yunData.SHARE_UK,
      primaryid: window.yunData.SHARE_ID,
      fid_list: JSON.stringify(list)
    }

    if (!window.yunData.SHARE_PUBLIC) {
      body['extra'] = JSON.stringify({ sekey: this.cookies })
    }
    const search = {
      timestamp: window.yunData.TIMESTAMP,
      sign: window.yunData.SIGN,
      bdstoken: window.yunData.MYBDSTOKEN,
      app_id: 250528,
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const parameter = {
      search,
      url: `/api/sharedownload?`,
      options: {
        body: Core.objectToQueryString(body),
        credentials: 'include',
        method: 'POST'
      }
    }
    return new Promise((resolve) => {
      fetch(`${window.location.origin}${parameter.url}${Core.objectToQueryString(parameter.search)}`, parameter.options).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            if (data.errno === 0) {
              if (window.yunData.SHAREPAGETYPE === 'single_file_page') {
                const item = data.list[0]
                this.fileDownloadInfo.push({
                  name: window.yunData.FILENAME,
                  link: item.dlink,
                  md5: item.md5
                })
              }
              resolve()
            }
          })
        } else {
          console.log(response)
        }
      })
    })
  }
}

const share = new Share()

share.startListen()
