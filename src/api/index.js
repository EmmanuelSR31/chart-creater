// 配置API接口地址
var root = '/apis'
// 引用axios
var axios = require('axios')
var qs = require('qs')
// 自定义判断元素类型JS
function toType (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
// 参数过滤函数
function filterNull (o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}
/*
  接口处理函数
*/

function apiAxios (method, url, params, callback) {
  if (params) {
    params = filterNull(params)
  }
  var paramsStr = qs.stringify(params)
  axios({
    method: method,
    url: url,
    data: method === 'POST' ? paramsStr : null,
    params: method === 'GET' ? paramsStr : null,
    baseURL: root,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(function (res) {
    callback(res)
  })
  .catch(function (err) {
    if (err) {
      alert('载入错误，' + err)
    }
  })
}

// 返回在vue模板中的调用接口
export default {
  get: function (url, params, callback) {
    return apiAxios('GET', url, params, callback)
  },
  post: function (url, params, callback) {
    return apiAxios('POST', url, params, callback)
  }
}
