import Taro from '@tarojs/taro';
import { Image, Text, View } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import classNames from 'classnames';
import request from '@/lib/request';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import './index.scss';

const blockClass = 'followOrFans';

class FollowOrFans extends Taro.PureComponent {

  constructor(props) {
    super(props);
    const { type, id } = this.$router.params;
    this.state = {
      id: id ? Number(id) : '',

      type: type || 'follow',

      // 关注或者粉丝列表
      list: [],

      // 请求状态
      status: 'done', // pending done error

      // 分页
      page: 1,

      // 是否还有更多数据
      hasMore: true
    };
  }

  onReachBottom() {
    if (!this.state.hasMore) return false;
    this.getFollowsOrFans();
  }

  componentDidMount() {
    this.getFollowsOrFans();
  }

  // 获取关注数据或者粉丝数据
  getFollowsOrFans = () => {
    const { id, type, page, list, status, hasMore } = this.state;
    const requestName = type === 'follow' ? 'getFollows' : 'getFans';
    if (status === 'pending' || !hasMore) return false;
    this.setState({
      status: 'pending'
    }, async () => {
      try {
        const { code, data } = await request(requestName, {
          id,
          page,
          pageSize: 15
        });
        if (code !== 200) throw new Error();
        this.setState({
          page: data.page + 1,
          status: 'done',
          hasMore: data.page * data.pageSize < data.count,
          list: list.length === 0 ? data.rows : list.concat(data.rows)
        });
      } catch (err) {
        this.setState({ status: 'error' });
      }
    });
  };

  // 刷新页面
  handleRefreshPage = () => {
    this.setState({
      page: 1,
      list: [],
      status: 'done',
      hasMore: true
    }, () => this.getFollowsOrFans());
  };

  // 取消关注
  handleCancelFollow = (userId, id) => {
    const { list } = this.state;
    Taro.showLoading({ title: '正在取消关注中' });
    request('follow', { id: userId }).then(result => {
      const { code } = result;
      Taro.hideLoading();
      if (code !== 200) {
        Taro.showToast({ title: '取消关注失败, 请重试', icon: 'none' });
        return false;
      }
      const index = list.findIndex(item => item.id === id);
      const newList = list.splice(index, 1);
      this.setState({
        list: newList
      });
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '取消关注失败, 请重试', icon: 'none' });
    });
  };

  render() {
    const { type, list, status, hasMore } = this.state;
    let wrapperStyle = {};
    if (process.env.TARO_ENV === 'h5') {
      wrapperStyle = {
        paddingTop: Taro.pxTransform(88)
      };
    }

    return (
      <View className={blockClass} style={wrapperStyle}>
        {
          process.env.TARO_ENV === 'h5' && (
            <View className={`${blockClass}__header`}>
              <AtIcon
                value='chevron-left'
                size='32'
                color='#fff'
                onClick={() => Taro.navigateBack()}
              ></AtIcon>
              <View className={`${blockClass}__header-title`}>{type === 'follow' ? '关注' : '粉丝'}</View>
            </View>
          )
        }
        {
          list.length === 0 && status === 'pending' && <Loading text='正在获取数据中' />
        }
        {
          list.length === 0 && status === 'error' && <Error onClick={this.handleRefreshPage} />
        }
        {
          list.length === 0 && status === 'done' && (
            <View className={`${blockClass}--empty`}>对不起,TA暂时没有{type === 'follow' ? '关注他人' : '粉丝'}哦</View>
          )
        }
        {
          list.length > 0 && (
            <View className={`${blockClass}__list`}>
              {
                list.map(item => {
                  const btnClass = classNames(`${blockClass}__btn`, {
                    // [`${blockClass}__btn--follow`]: item.status === 0,
                    // [`${blockClass}__btn--cross`]: item.status === 2,
                    // [`${blockClass}__btn--no-follow`]: item.status === 2
                  });
                  return (<View
                    key={item.id}
                    className={`${blockClass}__list-item`}
                  >
                    <View className={`${blockClass}__list-item__left`} onClick={() => Taro.navigateTo({ url: `/pages/profile/index?id=${item.user.id}` })}>
                      <Image
                        src={item.user.avatar}
                        className={`${blockClass}__list-item__avatar`}
                      />
                      <View className={`${blockClass}__list-item__user-name`}>{item.user.nickname}</View>
                    </View>
                    <View className={btnClass} onClick={() => this.handleCancelFollow(item.user.id, item.id)}>
                      {
                        type === 'follow'
                          ? '取消关注'
                          : item.status === 0 || item.status === 2
                          ? '取消关注'
                          : '关注'
                      }
                    </View>
                  </View>);
                })
              }
              <View className={`${blockClass}__footer`}>
                {
                  !hasMore
                    ? <Text>没有更多了</Text>
                    : status === 'error'
                    ? <Text>加载失败了,请刷新重试</Text>
                    : <Text>正在加载中</Text>
                }
              </View>
            </View>
          )
        }
      </View>
    );
  }
}

export default FollowOrFans;
