class Baidu {
  constructor () {
    this.context = window.require('system-core:context/context.js').instanceForSystem
  }
  showToast (message, type) {
    if (type.startsWith('MODE')) {
      type = type.split('_')[1].toLowerCase()
    }
    this.context.ui.tip({
      mode: type,
      msg: message
    })
  }
  startListen () {
    window.addEventListener('message', function (event) {
      if (event.source !== window) {
        return
      }

      if (event.data.type === 'getSelected') {
        window.postMessage({ type: 'selected', data: this.context.list.getSelected() }, '*')
      }
    })
  }
}

const baidu = new Baidu()

baidu.start()
