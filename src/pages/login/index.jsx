import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import CustomInput from '@/components/CustomInput';
import { pxTransform } from '@/lib';
import request from '@/lib/request';
import logo from '@/assets/logo.png';
import phoneIcon from '@/assets/images/phone.png';
import verifyIcon from '@/assets/images/verify.png';
import './index.scss';

class Login extends Taro.Component {
  // eslint-disable-next-line react/sort-comp
  config = {
    navigationBarTitleText: '登录',
    navigationBarTextStyle: 'white',
    navigationBarBackgroundColor: '#3296FA'
  };

  state = {
    // 手机号
    phone: '',

    // 验证码
    verify: '',

    // 发送验证码状态 done/pending/down down表示正在倒计时
    sendStatus: 'done',

    // 验证码倒计时
    countdown: 60
  };

  // 手机号码改变
  handlePhoneChange = value => {
    this.setState({
      phone: value
    });
  };

  // 验证码改变
  handleVerifyChange = verify => {
    this.setState({
      verify
    });
  };

  // 发送验证码
  handleSendVerify = async () => {
    const { sendStatus, phone } = this.state;
    if (sendStatus === 'down' || sendStatus === 'pending') return false;
    // 手机号为空
    if (!phone)
      return Taro.showToast({ title: '手机号不能为空', icon: 'none' });
    // 手机号格式不正确
    if (!/(?:^1[3456789]|^9[28])\d{9}$/.test(phone)) {
      return Taro.showToast({ title: '请输入正确的手机号码!', icon: 'none' });
    }
    // 发送请求
    try {
      const result = await request('sendVerify', { phone });
      console.log(result);
    } catch (error) {
      Taro.showToast({ title: '短信验证码发送失败,请重试!', icon: 'none' });
    }
  };

  render() {
    return (
      <View className='login'>
        <View className='login__logo'>
          <Image className='login__logo-image' src={logo} />
          <Text className='login__logo-text'>Coding Notes</Text>
        </View>

        <View className='login__content'>
          <View className='login__form'>
            <View className='login__form-item'>
              <Image src={phoneIcon} className='login__form-item__icon' />
              <View className='login__form-item__input'>
                <CustomInput
                  type='number'
                  placeholder='请输入手机号'
                  maxLength='11'
                  confirmType='next'
                  showClear
                  placeholderStyle='color: #C0C0C0'
                  onChange={this.handlePhoneChange}
                />
              </View>
            </View>
            <View className='login__form-item'>
              <Image src={verifyIcon} className='login__form-item__icon' />
              <View className='login__form-item__input'>
                <CustomInput
                  type='number'
                  placeholder='请输入验证码'
                  maxLength='6'
                  confirmType='done'
                  placeholderStyle='color: #C0C0C0'
                  style={pxTransform({ marginRight: '160px' })}
                  className='login__form-item__input'
                />
                <View
                  className='login__form-item__verify'
                  onClick={this.handleSendVerify}
                >
                  验证码
                </View>
              </View>
            </View>
          </View>
          <View className='login__btn'>登录</View>
          <View className='login__tooltip'>
            首次登陆，登陆的同时会自动进行注册，无需重复注册!
          </View>
        </View>
      </View>
    );
  }
}

export default Login;
