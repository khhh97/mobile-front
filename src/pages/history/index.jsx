import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import request from '@/lib/request';
import ArticleList from '@/components/ArticleList';
import { AtIcon } from 'taro-ui';
import './index.scss';

class History extends Taro.PureComponent {

  constructor(props) {
    super(props);
    const { type } = this.$router.params;
    let title = '我的浏览历史';
    if (type === 'collect') {
      title = '我收藏的文章';
    } else if (type === 'like') {
      title = '我赞过的文章';
    }
    Taro.setNavigationBarTitle({ title });
    this.state = {
      title,

      // 浏览历史、点赞、收藏
      type: type || 'history',

      // 页码
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
    this.getArticleList();
  }

  onReachBottom() {
    if (!this.state.hasMore) return false;
    this.getArticleList();
  }

  // 获取请求requestName
  getRequestName = () => {
    const { type } = this.state;
    if (type === 'collect') {
      return 'getCollects';
    } else if (type === 'like') {
      return 'getLikes';
    }
    return 'getHistory';
  };

  // 获取文章列表信息
  getArticleList = () => {
    const { status, page, pageSize, list } = this.state;
    if (status === 'pending') return false;
    this.setState({
      status: 'pending'
    }, async () => {
      try {
        const { code, data } = await request(this.getRequestName(), {
          page: page + 1,
          pageSize
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
    const { title, status, page, list, hasMore } = this.state;
    let wrapperStyle = {};
    if (process.env.TARO_ENV === 'h5') {
      wrapperStyle = {
        paddingTop: Taro.pxTransform(88)
      };
    }
    return (
      <View style={wrapperStyle}>
        {
          process.env.TARO_ENV === 'h5' && (
            <View className='header'>
              <AtIcon
                value='chevron-left'
                size='32'
                color='#fff'
                onClick={() => Taro.navigateBack()}
              ></AtIcon>
              <View className='header__title'>{title}</View>
            </View>
          )
        }
        <ArticleList
          showPoster
          page={page}
          status={status}
          list={list}
          hasMore={hasMore}
        />
      </View>
    );
  }
}

export default History;
