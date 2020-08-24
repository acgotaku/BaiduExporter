import Core from './lib/core'
import UI from './lib/ui'
import Downloader from './lib/downloader'
import sha1 from 'crypto-js/sha1'
import md5 from 'crypto-js/md5'

const options = {
  credentials: 'include',
  method: 'GET'
}

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
      url: '/api/list?',
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    super(listParameter)
    UI.init()
    UI.addMenu(document.querySelectorAll('.g-dropdown-button')[3], 'afterend')
    Core.requestCookies([{ url: 'https://pan.baidu.com/', name: 'BDUSS' }, { url: 'https://pcs.baidu.com/', name: 'STOKEN' }])
    Core.sendToBackground('fetch', {
      url: `${location.protocol}//tieba.baidu.com`,
      options
    }, (data) => {
      this.uid = data.match(/(?<=uid=)\d+/)[0]
    })
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

  getPrefixLength () {
    const path = Core.getHashParameter('/all?path') || Core.getHashParameter('path')
    const fold = Core.getConfigData('fold')
    if (fold === -1 || path === '/') {
      return 1
    } else if (Core.getHashParameter('/search?key')) {
      return 1
    } else {
      const dir = path.split('/')
      let count = 0
      for (let i = 0; i < dir.length - fold; i++) {
        count = count + dir[i].length + 1
      }
      return count
    }
  }

  async getFiles (files) {
    const prefix = this.getPrefixLength()
    const appId = Core.getConfigData('appId')
    const svip = Core.getConfigData('svip')
    const BDUSS = Core.cookies.BDUSS
    const time = Number.parseInt(Date.now() / 1000, 10)

    if (BDUSS && this.uid) {
      const devuid = this.getDevUID()
      const rand = this.sign(time, devuid, this.uid, BDUSS)
      for (const key in files) {
        let links = ''
        if (svip) {
          const prelink = `${location.protocol}//pcs.baidu.com/rest/2.0/pcs/file?method=locatedownload&ver=2&time=${time}&rand=${rand}&devuid=${devuid}&app_id=${appId}&path=${encodeURIComponent(files[key].path)}`
          links = await this.getFileLink(prelink)
        } else {
          links = `${location.protocol}//pcs.baidu.com/rest/2.0/pcs/file?method=download&app_id=${appId}&path=${encodeURIComponent(files[key].path)}`
        }
        this.fileDownloadInfo.push({
          name: files[key].path.substr(prefix),
          link: links,
          md5: files[key].md5
        })
      }
    } else {
      Core.showToast('还没获取到cookies哦，请稍等', 'failure')
    }
    return Promise.resolve()
  }

  getFileLink (prelink) {
    return new Promise((resolve, reject) => {
      Core.sendToBackground('fetch', {
        url: prelink,
        options
      }, (data) => {
        const urls = data.urls.map(item => {
          return item.url
        })
        resolve(urls)
      })
    })
  }

  sign (time, devuid, uid, bduss) {
    const bdussSha1 = sha1(bduss)
    const rand = bdussSha1 + uid + 'ebrcUYiuxaZv2XGu7KIYKxUrqfnOfpDF' + time + devuid
    return sha1(rand).toString()
  }

  getDevUID (bduss) {
    return '0|' + md5(bduss).toString()
  }
}

const home = new Home()

home.startListen()
