if (typeof browser !== 'undefined') {
  chrome = browser
}
// https://developer.chrome.com/apps/runtime#event-onMessage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.method) {
    case 'addScript':
      chrome.tabs.executeScript(sender.tab.id, { file: request.data })
      break
    case 'rpcData':
      fetch(request.data).then(() => {
        sendResponse(true)
      }).catch(() => {
        sendResponse(false)
      })
      break
    case 'configData':
      for (let key in request.data) {
        localStorage.setItem(key, request.data[key])
      }
      break
    case 'rpcVersion':
      fetch(request.data.url, request.data.options).then((response) => {
        if (response.ok) {
          response.json().then(function (data) {
            sendResponse(data.result.version)
          })
        } else {
          console.log(response)
          sendResponse(false)
        }
      }).catch((err) => {
        sendResponse(false)
        console.log(err)
      })
      return true
    case 'getCookies':
      getCookies(request.data).then(value => sendResponse(value))
      return true
  }
})

// Promise style `chrome.cookies.get()`
function getCookie (detail) {
  return new Promise(function (resolve) {
    chrome.cookies.get(detail, resolve)
  })
}

function getCookies (details) {
  return new Promise(function (resolve) {
    const list = details.map(item => getCookie(item))
    Promise.all(list).then(function (cookies) {
      let obj = {}
      for (let item of cookies) {
        if (item !== null) {
          obj[item.name] = item.value
        }
      }
      resolve(obj)
    })
  })
}

function showNotification (id, opt) {
  if (!chrome.notifications) {
    return
  }
  chrome.notifications.create(id, opt, function () { })
  setTimeout(function () {
    chrome.notifications.clear(id, function () { })
  }, 5000)
}
// 软件版本更新提示
const manifest = chrome.runtime.getManifest()
const previousVersion = localStorage.getItem('version')
if (previousVersion === '' || previousVersion !== manifest.version) {
  var opt = {
    type: 'basic',
    title: '更新',
    message: '百度网盘助手更新到' + manifest.version + '版本啦～\n此次更新专治百度~',
    iconUrl: 'images/icon.jpg'
  }
  const id = new Date().getTime().toString()
  showNotification(id, opt)
  localStorage.setItem('version', manifest.version)
}
