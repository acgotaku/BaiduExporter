class Core {
  constructor () {
    this.version = '0.9.7'
    this.updateDate = '2017/09/22'
    this.defaultUA = 'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia'
    this.defaultReferer = 'https://pan.baidu.com/disk/home'
    this.cookies = null
  }
  init () {
  }
  // 将文件名用单引号包裹，并且反转义文件名中所有单引号，确保按照文件名保存
  escapeString (str) {
    if (navigator.platform.indexOf('Win') !== -1) {
      return str
    }
    return `'${str.replace(/'/g, "\\'")}'`
  }
}

export default Core
