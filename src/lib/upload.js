import Taro from '@tarojs/taro';
import request from '@/lib/request';
import { baseUrl } from '../env';

// /**
//  * @description 选择图片，兼容h5和微信及支付宝小程序
//  * @returns {Promise}
//  */
// const chooseImage = () => {
//   return new Promise((resolve, reject) => {
//     if (process.env.TARO_ENV === 'h5') {
//       // 创建一个input标签
//       const input = document.createElement('input');
//       input.type = 'file';
//       input.addEventListener('change', e => {
//         const files = e.target.files;
//         input.remove();
//         resolve(files);
//       });
//       document.body.append(input);
//       input.click();
//     } else {
//       Taro.chooseImage({
//         count: 1,
//         success: res => resolve(res),
//         fail: err => {
//           Taro.showToast({ title: '图片选择失败', icon: 'none' });
//           reject(err);
//         }
//       });
//     }
//   });
// };
//
// /**
//  * @description 上传文件
//  * @param options - 上传文件的配置信息
//  * @param files - 上传的文件
//  * @returns {Promise}
//  */
// const uploadFile = (options, files) => {
//   return new Promise((resolve, reject) => {
//     let { url, name, fileType = 'image' } = options;
//     url = baseUrl + url;
//     Taro.showLoading({ title: '正在上传中' });
//     if (process.env.TARO_ENV === 'h5') {
//       const file = files[0];
//       const form = new FormData();
//       form.append(name, file);
//       const xhr = new XMLHttpRequest();
//       xhr.open('POST', url);
//       xhr.setRequestHeader('Content-Type', 'multipart/form-data');
//       xhr.setRequestHeader('token', Taro.getStorageSync('token'));
//       xhr.setRequestHeader('platform', Taro.getEnv().toLowerCase());
//       xhr.send(form);
//
//       xhr.onreadystatechange = () => {
//         if (xhr.readyState === 4) {
//           if (xhr.status === 200) {
//
//           } else {
//
//           }
//         }
//       }
//     } else {
//       const { tempFilePaths } = files;
//       Taro.uploadFile({
//         url,
//         filePath: tempFilePaths[0],
//         name,
//         fileType,
//         header: {
//           'Content-Type': 'multipart/form-data',
//           token: Taro.getStorageSync('token'),
//           platform: Taro.getEnv().toLowerCase()
//         },
//         success: result => {
//           Taro.hideLoading();
//           Taro.showToast({ title: '上传成功', icon: 'success' });
//           let { data } = result;
//           data = JSON.parse(data);
//           resolve(data);
//         },
//         fail: error => {
//           Taro.hideLoading();
//           // 文件上传失败
//           Taro.showToast({ title: '文件上传失败,请重试', icon: 'none' });
//           reject(error);
//         }
//       });
//     }
//   });
// };

export default options => {
  return new Promise((resolve, reject) => {
    Taro.chooseImage({
      count: 1,
      success: res => {
        const { tempFilePaths } = res;
        let { url, name, fileType = 'image' } = options;
        url = baseUrl + url;
        Taro.showLoading({ title: '正在上传中' });
        Taro.uploadFile({
          url,
          filePath: tempFilePaths[0],
          name,
          fileType,
          header: {
            'Content-Type': 'multipart/form-data',
            token: Taro.getStorageSync('token'),
            platform: Taro.getEnv().toLowerCase()
          },
          success: result => {
            Taro.hideLoading();
            Taro.showToast({ title: '上传成功', icon: 'success' });
            let { data } = result;
            data = JSON.parse(data);
            resolve(data);
          },
          fail: error => {
            Taro.hideLoading();
            // 文件上传失败
            Taro.showToast({ title: '文件上传失败,请重试', icon: 'none' });
            reject(error);
          }
        });
      },
      fail: err => {
        Taro.showToast({ title: '图片选择失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

