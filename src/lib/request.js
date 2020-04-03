import Taro from '@tarojs/taro';
import Api from '../api';
import { baseUrl } from '../env';

/**
 * @description 封装的请求方法
 * @param {string} name - api文件中定义的请求对象的键名
 * @param {object} option - 请求携带参数
 * @returns {Promise} 返回promise
 */
const request = (name, option = {}) => {
  if (!Api[name]) throw new Error('请求api方法不存在!');
  let showLoading = false;

  // 请求前拦截器
  const interceptor = chain => {
    let {
      url = '',
      method = 'GET',
      header = {},
      data = { showLoading: false }
    } = chain.requestParams;

    if (!/(http|https):\/\/([\w.]+\/?)\S*/.test(url)) {
      // 拼接url
      url = baseUrl + url;
    }

    // 拼接header信息
    header = Object.assign(
      {},
      {
        'Content-Type': 'application/json',
        token: Taro.getStorageSync('token') || '',
        platform: Taro.getEnv().toLowerCase()
      },
      header
    );

    // option中可封装一个特定参数 showLoading默认为false
    if (data.showLoading) {
      let title = '正在加载中...';
      showLoading = true;
      delete data.showLoading;
      if (data.loadingTitle) {
        delete data.loadingTitle;
        title = data.loadingTitle;
      }
      Taro.showLoading({ title });
    }

    return chain.proceed({
      url,
      method: method.toUpperCase(),
      header,
      data
    });
  };

  // 添加拦截器
  Taro.addInterceptor(interceptor);

  return Taro.request({
    ...Api[name],
    data: option
  })
    .then(res => {
      const { statusCode, data } = res;
      // 关闭loading
      if (showLoading) {
        Taro.hideLoading();
      }
      if (statusCode === 200) {
        return data;
      } else {
        throw new Error(res);
      }
    })
    .catch(err => {
      if (showLoading) {
        Taro.hideLoading();
      }
      return Promise.reject(err);
    });
};

export default request;
