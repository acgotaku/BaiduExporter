import Core from './lib/core'
import Downloader from './lib/downloader'
class Home {
  constructor () {
    Core.init()
    Core.requestCookies([{ url: 'http://pan.baidu.com/', name: 'BDUSS' }, { url: 'http://pcs.baidu.com/', name: 'pcsett' }])
    Core.addMenu('home')
    Core.showToast('初始化成功!', 'success')
  }
  startListen () {
    window.addEventListener('message', (event) => {
      if (event.source !== window) {
        return
      }

      if (event.data.type && event.data.type === 'selected') {
        Downloader.reset()
        const selectedFile = event.data.data
        if (selectedFile.length === 0) {
          Core.showToast('请选择一下你要保存的文件哦', 'failure')
          return
        }
        selectedFile.forEach((item) => {
          if (item.isdir) {
            Downloader.addFolder(item.path)
          } else {
            Downloader.addFile(item)
          }
        })
        Downloader.start()
      }
    })
  }
  getSelected () {
    window.postMessage({ type: 'getSelected' }, '*')
  }
}

const home = new Home()

home.startListen()
