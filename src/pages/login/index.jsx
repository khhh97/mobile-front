import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import CustomInput from '@/components/CustomInput';
import { pxTransform } from '@/lib';
import request from '@/lib/request';
import { getUser } from '@/store/user/actions';
import logo from '@/assets/logo.png';
import phoneIcon from '@/assets/images/phone.png';
import verifyIcon from '@/assets/images/verify.png';
import './index.scss';

@connect(
  ({ user }) => ({
    user: user.user
  }),
  dispatch => ({
    getUser: () => dispatch(getUser())
  })
)
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
    countdown: 60,

    // 倒计时初始值
    initialCountDown: 60
  };

  componentDidMount() {
    const { user } = this.props;
    if (!isEmpty(user)) {
      Taro.navigateBack();
    }
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

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
  handleSendVerify = () => {
    const { sendStatus, phone } = this.state;
    if (sendStatus === 'pending' || sendStatus === 'down') return false;
    // 手机号为空
    if (!phone)
      return Taro.showToast({ title: '手机号不能为空', icon: 'none' });
    // 手机号格式不正确
    if (!/(?:^1[3456789]|^9[28])\d{9}$/.test(phone)) {
      return Taro.showToast({ title: '请输入正确的手机号码!', icon: 'none' });
    }
    // 发送请求
    this.setState(
      {
        sendStatus: 'pending'
      },
      async () => {
        try {
          const { code, msg } = await request('sendVerify', { phone });
          // 发送成功
          if (code === 200) {
            Taro.showToast({ title: '发送成功!', icon: 'success' });
            this.setState(
              {
                sendStatus: 'down'
              },
              () => {
                this.timer = setInterval(() => {
                  const { countdown, initialCountDown } = this.state;
                  if (countdown === 1) {
                    this.timer && clearInterval(this.timer);
                    this.setState({
                      countdown: initialCountDown,
                      sendStatus: 'done'
                    });
                  } else {
                    this.setState({
                      countdown: countdown - 1
                    });
                  }
                }, 1000);
              }
            );
          } else {
            Taro.showToast({
              title: msg || '短信验证码发送失败,请重试!',
              icon: 'none'
            });
            this.setState({ sendStatus: 'done' });
          }
        } catch (error) {
          Taro.showToast({ title: '短信验证码发送失败,请重试!', icon: 'none' });
          this.setState({ sendStatus: 'done' });
        }
      }
    );
  };

  // 登陆
  handleLogin = async () => {
    const { phone, verify } = this.state;
    if (!phone)
      return Taro.showToast({ title: '手机号不能为空', icon: 'none' });
    if (!verify)
      return Taro.showToast({ title: '验证码不能为空', icon: 'none' });
    Taro.showLoading({ title: '正在登陆中' });
    try {
      const { code, data, msg } = await request('login', {
        phone,
        verify,
        platform: Taro.getEnv().toLowerCase()
      });
      if (code === 200) {
        const { token } = data;
        // 保存token
        Taro.setStorageSync('token', token);
        // 获取用户信息
        // eslint-disable-next-line taro/this-props-function
        this.props.getUser();
        // 返回之前的页面
        Taro.navigateBack();
      } else {
        Taro.showToast({ title: msg || '登陆失败,请重试!', icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '登陆失败,请重试!', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  render() {
    const { sendStatus, countdown } = this.state;
    let countdownText = '';
    if (sendStatus === 'done') countdownText = '验证码';
    if (sendStatus === 'pending') countdownText = '正在发送中';
    if (sendStatus === 'down') countdownText = `${countdown}秒`;
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
                  onChange={this.handleVerifyChange}
                  onSubmit={this.handleLogin}
                />
                <View
                  className={classNames('login__form-item__verify', {
                    'login__form-item__verify--pending': sendStatus === 'down'
                  })}
                  onClick={this.handleSendVerify}
                >
                  {countdownText}
                </View>
              </View>
            </View>
          </View>
          <View className='login__btn' onClick={this.handleLogin}>
            登录
          </View>
          <View className='login__tooltip'>
            首次登陆，登陆的同时会自动进行注册，无需重复注册!
          </View>
        </View>
      </View>
    );
  }
}

export default Login;
