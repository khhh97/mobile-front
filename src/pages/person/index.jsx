import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import request from '@/lib/request';
import { connect } from '@tarojs/redux';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import ArticleList from '@/components/ArticleList';
import './index.scss';

@connect(({ user }) => ({ userInfo: user.user }))
class Person extends Taro.PureComponent {

  constructor(props) {
    super(props);
    const { id } = this.$router.params;

    this.state = {
      // 用户id
      id: id ? Number(id) : 0,

      // 请求用户信息状态
      userStatus: 'pending',

      // 用户信息
      user: {},

      // 是否关注
      follow: false,

      //页码
      page: 0,

      // 页码数量
      pageSize: 15,

      // 请求状态
      status: 'done', // pending/done/error，

      // 文章列表
      list: [],

      // 是否还有更多数据
      hasMore: true
    };
  }

  componentDidMount() {
    this.getUser();
    this.getArticleList();
  }

  onReachBottom() {
    if (!this.state.hasMore) return false;
    this.getArticleList();
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
          userStatus: 'done',
          follow: data.follow
        });
      }
    } catch (err) {
      this.setState({ userStatus: 'error' });
    }
  };

  // 关注或者取消关注
  handleFollow = async () => {
    const { userInfo } = this.props;
    const token = Taro.getStorageSync('token');
    if (!token || Object.keys(userInfo).length === 0) return Taro.navigateTo({ url: '/pages/login/index' });
    const { id, follow } = this.state;
    Taro.showLoading({ title: follow ? '正在取消关注' : '正在关注中' });
    try {
      const { code, msg } = await request('follow', { id });
      if (code !== 200) {
        Taro.hideLoading();
        Taro.showToast({ title: msg || (follow ? '取消关注失败' : '关注失败'), icon: 'none' });
        return false;
      }
      Taro.hideLoading();
      Taro.showToast({ title: follow ? '取消关注成功' : '关注成功', icon: 'none' });
      this.setState({
        follow: !follow
      });
    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ title: follow ? '取消关注失败' : '关注失败', icon: 'none' });
    }
  };

  // 获取文章列表信息
  getArticleList = () => {
    const { id, status, page, pageSize, list } = this.state;
    if (status === 'pending') return false;
    this.setState({
      status: 'pending'
    }, async () => {
      try {
        const { code, data } = await request('getArticles', {
          page: page + 1,
          pageSize,
          post_id: id
        });
        if (code !== 200) throw new Error();
        const state = {
          page: data.page,
          pageSize: data.pageSize,
          status: 'done',
          hasMore: data.page * data.pageSize < data.count,
          list: page === 0 ? data.rows : list.concat(data.rows)
        };
        this.setState(state);
      } catch (err) {
        this.setState({ status: 'error' });
      }
    });
  };

  render() {
    const { user, follow, userStatus, page, status, list, hasMore } = this.state;
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
                {
                  page !== 0 && (
                    <View className='person__header'>
                      <View className='person__header-left'>
                        <Image
                          src={user.avatar}
                          onClick={() => Taro.previewImage({ urls: [user.avatar] })}
                          className='person__avatar'
                        />
                      </View>
                      <View className='person__header-right'>
                        <View className='person__info'>
                          <View className='person__articles'>
                            <Text className='person__articles-num'>{user.article_count}</Text>
                            <Text className='person__articles-text'>发布</Text>
                          </View>
                          <View className='person__follow'>
                            <Text className='person__follow-num'>{user.follow_count}</Text>
                            <Text className='person__follow-text'>关注</Text>
                          </View>
                          <View className='person__fan'>
                            <Text className='person__fan-num'>{user.fans_count}</Text>
                            <Text className='person__fan-text'>粉丝</Text>
                          </View>
                        </View>
                        <View
                          className='person__btn--follow'
                          onClick={this.handleFollow}
                        >{follow ? '已关注' : '关注'}</View>
                      </View>
                    </View>
                  )
                }
                <View className='person__information'>
                  <View className='person__job'>
                    <Text className='person__job-prefix'>职业：</Text>
                    <Text className='person__job-body'>{user.job || '暂未填写'}</Text>
                  </View>
                  <View className='person__bio'>
                    <Text className='person__bio-prefix'>简介：</Text>
                    <Text className='person__bio-body'>{user.bio || '暂未填写'}</Text>
                  </View>
                </View>
                <View className='person__list'>
                  <ArticleList
                    page={page}
                    status={status}
                    list={list}
                    hasMore={hasMore}
                    showPoster
                  />
                </View>
              </View>
            )
        }
      </View>
    );
  }

}

export default Person;
