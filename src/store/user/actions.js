import Taro from '@tarojs/taro';
import request from '@/lib/request';
import {
  INIT_USER,
  GET_USER,
  GET_USER_PENDING,
  GET_USER_ERROR,
  CHANGE_USER_AVATAR
} from '@/store/constants.js';

// 获取用户信息开始
const getUserStart = () => {
  return {
    type: GET_USER_PENDING
  };
};

// 获取用户信息失败
const getUserError = () => {
  return {
    type: GET_USER_ERROR
  };
};

// 修改用户头像
export const updateAvatar = avatar => ({
  type: CHANGE_USER_AVATAR,
  value: avatar
});

// 退出登录
export const logout = () => ({
  type: INIT_USER
});

// 获取用户信息请求
// eslint-disable-next-line import/prefer-default-export
export const getUser = () => {
  return async dispatch => {
    const token = Taro.getStorageSync('token');
    if (!token) return false;

    dispatch(getUserStart());

    try {
      const { code, data, msg } = await request('getUser');

      if (code !== 200)
        throw new Error(`Response Exception: ${msg};code: ${code}`);

      // 修改用户信息
      dispatch({
        type: GET_USER,
        user: data
      });
    } catch (error) {
      dispatch(getUserError());
    }
  };
};

