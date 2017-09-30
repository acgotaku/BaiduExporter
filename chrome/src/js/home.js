import Core from './lib/core'

class Home {
  constructor () {
    Core.init()
    Core.requestCookies([{ url: 'http://pan.baidu.com/', name: 'BDUSS' }, { url: 'http://pcs.baidu.com/', name: 'pcsett' }])
    Core.addMenu('home')
  }
}

const home = new Home()

console.log(home)
