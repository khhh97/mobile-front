import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import request from '@/lib/request';
import Loading from '@/components/Loading';
import './index.scss';
import Error from '@/components/Error';

class Person extends Taro.PureComponent {

  constructor(props) {
    super(props);
    const { id } = this.$router.params;

    this.state = {
      // 用户id
      id: id ? Number(id) : '',

      // 请求用户信息状态
      userStatus: 'pending',

      // 用户信息
      user: {}
    };
  }

  componentDidMount() {
    this.getUser();
  }

  // 获取用户信息
  getUser = async () => {
    const { id } = this.state;
    try {
      const { code, data, msg } = await request('getUserInfo', { id });
      if (code !== 200) {
        Taro.showToast({ title: msg || '用户信息获取失败,请重试!', icon: 'none' });
        this.setState({ userStatus: 'error' });
      } else {
        Taro.setNavigationBarTitle({ title: data.nickname });
        this.setState({
          user: data,
          userStatus: 'done'
        });
      }
    } catch (err) {
      this.setState({ userStatus: 'error' });
    }
  };

  render() {
    const { user, userStatus } = this.state;
    return (
      <View className='person'>
        {
          userStatus === 'pending'
            ? <Loading text='获取用户信息中' />
            : userStatus === 'error'
            ? (
              <Error
                text='用户信息获取失败'
                btnText='返回重试'
                onClick={() => Taro.navigateBack()}
              />)
            : (
              <View>

              </View>
            )
        }
      </View>
    );
  }

}

export default Person;
