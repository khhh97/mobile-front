import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { getUser, updateAvatar } from '@/store/user/actions';
import { isEmpty } from 'lodash';
import upload from '@/lib/upload';
import myIcon from '@/assets/images/wodedangxuan.svg';
import zangIcon from '@/assets/images/dianzan.svg';
import collectIcon from '@/assets/images/shoucang.svg';
import historyIcon from '@/assets/images/chakanguo.svg';
import settingIcon from '@/assets/images/shezhi.svg';
import { baseUrl } from '../../env';
import './index.scss';

const menuConfig = [
  { id: 1, icon: myIcon, text: '我的主页', url: '' },
  { id: 2, icon: zangIcon, text: '我赞过的', url: '' },
  { id: 3, icon: collectIcon, text: '收藏集', url: '' },
  { id: 4, icon: historyIcon, text: '阅读过的文章', url: '' },
  { id: 5, icon: settingIcon, text: '个人信息', url: '' }
];

@connect(
  ({ user }) => ({
    user: user.user,
    status: user.status
  }),
  dispatch => ({
    getUser: () => dispatch(getUser()),
    updateAvatar: avatar => dispatch(updateAvatar(avatar))
  })
)
class MyPage extends Taro.Component {
  // eslint-disable-next-line react/sort-comp
  config = {
    navigationBarTitleText: '我的',
    disableScroll: true
  };

  componentDidMount() {
    const { user } = this.props;
    if (isEmpty(user)) {
      // eslint-disable-next-line taro/this-props-function
      this.props.getUser();
    }
  }

  componentDidUpdate() {
    const { status } = this.props;
    if (status === 'pending') {
      Taro.showLoading({ title: '正在获取用户信息中!', mask: true });
    } else {
      Taro.hideLoading();
    }
  }

  // 跳转到登录页
  handleNavigateToLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
    return false;
  };

  // 上传头像
  handleUploadAvatar = () => {
    if (process.env.TARO_ENV === 'h5') return false;
    upload({
      url: '/user/avatar',
      name: 'avatar'
    }).then(result => {
      const { data } = result;
      // eslint-disable-next-line taro/this-props-function
      this.props.updateAvatar(data);
    });
  };

  // 菜单栏点击事件
  handleMenuClick = url => {
    const { user } = this.props;
    const token = Taro.getStorageSync('token');
    const isLogin = token && Object.keys(user).length > 0;
    if (!isLogin) return this.handleNavigateToLogin();
    console.log(url);
  };

  render() {
    const { user } = this.props;
    const isLogin = Object.keys(user).length > 0;
    return (
      <View className='page-my'>
        <View className='user'>
          <View className='user__header'>
            {!isLogin ? (
              <View className='user__header-logout'>
                <View
                  className='user__login'
                  onClick={this.handleNavigateToLogin}
                >
                  登录
                </View>
              </View>
            ) : (
              <View className='user__header-login'>
                <View className='user__header-top'>
                  <Image
                    className='user__avatar'
                    onClick={this.handleUploadAvatar}
                    src={user.avatar}
                  />
                  <View className='user__bio'>
                    <Text className='user__nickname'>{user.nickname}</Text>
                    {user.job && <Text className='user__job'>{user.job}</Text>}
                  </View>
                </View>
                <View className='user__header-bottom'>
                  <View className='user__article'>
                    {user.article_count}
                    <Text className='user__bottom-text'>动态</Text>
                  </View>
                  <View className='user__follow'>
                    {user.follow_count}
                    <Text className='user__bottom-text'>关注</Text>
                  </View>
                  <View className='user__fans'>
                    {user.fans_count}
                    <Text className='user__bottom-text'>粉丝</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          <View className='user__menu'>
            {menuConfig.map(menu => (
              <View
                key={menu.id}
                className='user__menu-item'
                onClick={() => this.handleMenuClick(menu.url)}
              >
                <View className='user__menu-item-text'>
                  <Image src={menu.icon} className='user__menu-item-icon' />
                  <View>{menu.text}</View>
                </View>
                <View className='user__menu-item-arrow'>&gt;</View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }
}

export default MyPage;
