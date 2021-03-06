import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { getUser, updateAvatar, logout } from '@/store/user/actions';
import { isEmpty } from 'lodash';
import upload from '@/lib/upload';
import myIcon from '@/assets/images/wodedangxuan.svg';
import zangIcon from '@/assets/images/dianzan.svg';
import collectIcon from '@/assets/images/shoucang.svg';
import historyIcon from '@/assets/images/chakanguo.svg';
import settingIcon from '@/assets/images/shezhi.svg';
import logoutIcon from '@/assets/images/logout.svg';
import './index.scss';

const menuConfig = [
  { id: 1, icon: myIcon, text: '我的主页', url: '/pages/profile/index' },
  { id: 2, icon: zangIcon, text: '我赞过的', url: '/pages/history/index?type=like' },
  { id: 3, icon: collectIcon, text: '收藏集', url: '/pages/history/index?type=collect' },
  { id: 4, icon: historyIcon, text: '阅读过的文章', url: '/pages/history/index?type=history' },
  { id: 5, icon: settingIcon, text: '个人信息', url: '/pages/person/index' }
];

@connect(
  ({ user }) => ({
    user: user.user,
    status: user.status
  }),
  dispatch => ({
    getUser: () => dispatch(getUser()),
    updateAvatar: avatar => dispatch(updateAvatar(avatar)),
    logout: () => dispatch(logout())
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
    upload({
      url: '/user/avatar',
      name: 'avatar'
    }).then(result => {
      const { data } = result;
      // eslint-disable-next-line taro/this-props-function
      this.props.updateAvatar(data);
    });
  };

  // 退出登录
  handleLogout = () => {
    // redux中的用户信息置空
    // eslint-disable-next-line taro/this-props-function
    this.props.logout();
    Taro.clearStorageSync('token');
  };

  // 菜单栏点击事件
  handleMenuClick = menu => {
    const { user } = this.props;
    const token = Taro.getStorageSync('token');
    const isLogin = token && Object.keys(user).length > 0;
    if (!isLogin) return this.handleNavigateToLogin();
    const { id, url } = menu;
    if (id === 1) {
      Taro.navigateTo({ url: `${url}?id=${user.id}` });
    } else {
      Taro.navigateTo({ url });
    }
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
                  <View className='user__article' onClick={() => Taro.navigateTo({ url: `/pages/profile/index?id=${user.id}` })}>
                    {user.article_count}
                    <Text className='user__bottom-text'>动态</Text>
                  </View>
                  <View
                    className='user__follow'
                    onClick={() => Taro.navigateTo({ url: `/pages/followOrFans/index?type=follow&id=${user.id}` })}
                  >
                    {user.follow_count}
                    <Text className='user__bottom-text'>关注</Text>
                  </View>
                  {/*<View*/}
                  {/*  className='user__fans'*/}
                  {/*  onClick={() => Taro.navigateTo({ url: `/pages/followOrFans/index?type=fans&id=${user.id}` })}*/}
                  {/*>*/}
                  {/*  {user.fans_count}*/}
                  {/*  <Text className='user__bottom-text'>粉丝</Text>*/}
                  {/*</View>*/}
                </View>
              </View>
            )}
          </View>
          <View className='user__menu'>
            {menuConfig.map(menu => (
              <View
                key={menu.id}
                className='user__menu-item'
                onClick={() => this.handleMenuClick(menu)}
              >
                <View className='user__menu-item-text'>
                  <Image src={menu.icon} className='user__menu-item-icon' />
                  <View>{menu.text}</View>
                </View>
                <View className='user__menu-item-arrow'>&gt;</View>
              </View>
            ))}
            {/*退出登录*/}
            <View
              className='user__menu-item'
              onClick={this.handleLogout}
            >
              <View className='user__menu-item-text'>
                <Image src={logoutIcon} className='user__menu-item-icon' />
                <View>退出登录</View>
              </View>
              <View className='user__menu-item-arrow'>&gt;</View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default MyPage;
