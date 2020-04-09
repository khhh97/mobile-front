import Taro from '@tarojs/taro';
import { baseUrl } from '../env';

/**
 * @description 上传文件
 * @param options - 上传文件的配置信息
 * @param files - 上传的文件
 * @returns {Promise}
 */
export const uploadFile = (options, file) => {
  return new Promise((resolve, reject) => {
    let { url, name, fileType = 'image' } = options;
    url = baseUrl + url;

    if (process.env.TARO_ENV === 'h5') {
      if (!file) return false;
      const form = new FormData();
      form.append(name, file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('token', Taro.getStorageSync('token'));
      xhr.setRequestHeader('platform', Taro.getEnv().toLowerCase());
      xhr.send(form);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.code === 200) {
              resolve(result);
            } else {
              reject(result);
            }
          } else {
            let err = '';
            try {
              err = JSON.parse(xhr.responseText);
            } catch (error) {
              err = xhr.responseText;
            }
            reject(err);
          }
        }
      };
    } else {
      Taro.uploadFile({
        url,
        filePath: file,
        name,
        fileType,
        header: {
          token: Taro.getStorageSync('token'),
          platform: Taro.getEnv().toLowerCase()
        },
        success: result => {
          let { data } = result;
          data = JSON.parse(data);
          resolve(data);
        },
        fail: error => {
          // 文件上传失败
          reject(error);
        }
      });
    }
  });
};

export default options => {
  return new Promise((resolve, reject) => {
    Taro.chooseImage({
      count: 1,
      success: res => {
        const { tempFilePaths, tempFiles } = res;
        let file = tempFilePaths[0];
        if (process.env.TARO_ENV === 'h5') {
          file = tempFiles[0].originalFileObj;
        }
        let { url, name, fileType = 'image' } = options;
        Taro.showLoading({ title: '正在上传中' });
        // 上传文件
        uploadFile({
          name,
          url,
          fileType
        }, file).then(result => {
          Taro.hideLoading();
          Taro.showToast({ title: '上传成功', icon: 'success' });
          resolve(result);
        }).catch(err => {
          Taro.hideLoading();
          Taro.showToast({ title: err.msg || '文件上传失败,请重试', icon: 'none' });
          reject(err);
        });
      },
      fail: err => {
        Taro.showToast({ title: '图片选择失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

