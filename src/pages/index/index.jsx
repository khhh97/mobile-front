import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import ArticleList from '@/components/ArticleList';
import { AtTabs } from 'taro-ui';
import request from '@/lib/request';
import './index.scss';

class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true,
    onReachBottomDistance: 30,
    backgroundColor: '#fff',
    backgroundTextStyle: 'dark'
  };

  state = {
    //页码
    page: 0,

    // 页码数量
    pageSize: 15,

    // 搜索关键词
    keyword: '',

    // 主题分类key
    topicId: '',

    // 请求状态
    status: 'done', // pending/done/error，

    // 文章列表
    list: [],

    // 文章分类
    topics: [],

    // 是否还有更多数据
    hasMore: true,

    // index页面高度
    wrapperHeight: 'auto'
  };

  componentDidMount() {
    this.getArticleTopics();
    this.getArticleList();

  }

  onPullDownRefresh() {
    this.handleRefreshList();
  }

  onReachBottom() {
    if (!this.state.hasMore) return false;
    this.getArticleList();
  }

  // 获取文章列表信息
  getArticleList = height => {
    const { status, page, pageSize, keyword, topicId, list } = this.state;
    if (status === 'pending') return false;
    this.setState({
      status: 'pending'
    }, async () => {
      try {
        const { code, data } = await request('getArticles', {
          page: page + 1,
          pageSize,
          keyword,
          topic_id: topicId
        });
        if (code !== 200) throw new Error();
        const state = {
          page: data.page,
          pageSize: data.pageSize,
          keyword: data.keyword,
          status: 'done',
          hasMore: data.page * data.pageSize < data.count,
          list: page === 0 ? data.rows : list.concat(data.rows)
        };
        if (height) state.wrapperHeight = height;
        this.setState(state);
      } catch (err) {
        this.setState({ status: 'error' });
      }
    });
  };

  // 刷新获取数据
  handleGetRefreshData = async () => {
    const { keyword, topicId, pageSize } = this.state;
    try {
      const { code, data } = await request('getArticles', {
        page: 1,
        pageSize,
        keyword,
        topic_id: topicId
      });
      if (code !== 200) throw new Error();
      this.setState({
        status: 'done',
        page: data.page,
        pageSize: data.pageSize,
        keyword: data.keyword,
        hasMore: data.page * data.pageSize < data.count,
        list: data.rows
      }, () => Taro.stopPullDownRefresh());
    } catch (err) {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新失败,请重试!', icon: 'none' });
    }
  };

  // 刷新列表
  handleRefreshList = async () => {
    if (process.env.TARO_ENV === 'h5') {
      this.setState({
        list: [],
        status: 'pending'
      }, async () => {
        await this.handleGetRefreshData();
      });
    } else {
      await this.handleGetRefreshData();
    }

  };

  // 获取所有的文章分类
  getArticleTopics = async () => {
    try {
      let { code, data, msg } = await request('getTopics');
      if (code !== 200) throw new Error(`Response Exception: ${msg};code: ${code}`);
      data.unshift({ id: '', name: '所有' });
      if (process.env.TARO_ENV === 'h5') {
        const query = Taro.createSelectorQuery();
        query
          .select('.taro_page')
          .boundingClientRect(rect => {
            const { height } = rect;
            this.setState({
              topics: data,
              wrapperHeight: height + 'px'
            });
          }).exec();
      } else {
        // const query = Taro.createSelectorQuery();
        // query
        //   .selectViewport()
        //   .boundingClientRect(rect => {
        //     const { height } = rect;
        //     this.setState({
        //       topics: data,
        //       wrapperHeight: height + 'px'
        //     });
        //   }).exec();
        this.setState({ topics: data });
      }
    } catch (err) {
      this.setState({ topics: [] });
    }
  };

  // Tab栏点击事件
  handleTabClick = index => {
    const { topics } = this.state;
    const current = topics[index] ? topics[index] : '';
    this.setState({
      topicId: current ? current.id : '',
      page: 0,
      list: []
    }, () => this.getArticleList());
  };

  render() {
    const {
      status,
      page,
      topicId,
      list,
      hasMore,
      topics,
      wrapperHeight
    } = this.state;
    const tabList = topics.map(topic => ({ title: topic ? topic.name : '' }));
    const current = topics.findIndex(item => item && item.id === topicId) || 0;

    let tabStyle = {
      position: process.env.TARO_ENV === 'h5' ? 'absolute' : 'fixed',
      top: 0,
      left: 0,
      height: 'auto',
      borderBottom: '1px solid #EDEFF3',
      zIndex: 999
    };

    return (
      <View className='index'>
        {
          topics.length > 0 && (
            <AtTabs
              scroll
              animated
              tabDirection='horizontal'
              current={current}
              tabList={tabList}
              onClick={this.handleTabClick}
              customStyle={tabStyle}
            />
          )
        }
        <View
          className='index__articles'
          style={{ height: wrapperHeight }}
        >
          <ArticleList
            page={page}
            status={status}
            list={list}
            hasMore={hasMore}
          />
        </View>
      </View>
    );
  }
}

export default Index;
