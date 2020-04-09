import Taro from '@tarojs/taro';
import { View, Image, Text, RichText, Input } from '@tarojs/components';
import classNames from 'classnames';
import { connect } from '@tarojs/redux';
import Comment from '@/components/Comment';
import request from '@/lib/request';
import Loading from '@/components/Loading';
import dayjs from 'dayjs';
import { AtIcon } from 'taro-ui';
import './index.scss';

@connect(({ user }) => ({ user: user.user }))
class Article extends Taro.PureComponent {

  constructor(props) {
    super(props);
    const { id } = this.$router.params;
    this.state = {
      // 文章id
      articleId: Number(id),

      // 请求文章信息状态
      status: 'pending', //pending done error

      // 文章信息
      article: {},

      // 发表者用户信息
      poster: {},

      // 推荐文章
      recommend: [],

      // 点赞状态
      like: false,

      // 收藏状态
      collect: false,

      // 对作者的关注状态
      follow: false,

      // 评论
      comments: [],

      // 输入的评论内容
      commentValue: '',

      // 加载评论状态
      getCommentStatus: 'done',

      // 是否还有更多评论数据
      hasMore: true,

      // 评论页码
      page: 1,

      pageSize: 15
    };
  }

  config = {
    // navigationStyle: 'custom'
    navigationBarTitleText: '',
    disableScroll: true
  };

  componentDidMount() {
    this.getArticleDetail(() => this.getComments());
  }

  // 检查是否登录
  checkLogin = () => {
    const { user } = this.props;
    const token = Taro.getStorageSync('token');
    if (!token || Object.keys(user).length === 0) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return false;
    }
    return true;
  };

  // 获取文章详情
  getArticleDetail = async (callback) => {
    const { articleId } = this.state;
    try {
      const { code, data, msg } = await request('getArticle', { id: articleId });
      if (code !== 200) {
        Taro.showToast({ title: msg || '文章详情获取失败,请重试!', icon: 'none' });
        return this.setState({ status: 'error' });
      }
      const user = data.user || {};
      const recommend = data.recommend || [];
      delete data.user;
      delete data.recommend;
      // 设置标题
      Taro.setNavigationBarTitle({ title: data.title });
      this.setState({
        status: 'done',
        article: data,
        poster: user,
        recommend,
        like: data.like,
        collect: data.collect,
        follow: data.follow
      }, () => callback && callback());
    } catch (err) {
      Taro.showToast({ title: err.msg || '文章详情获取失败,请重试!', icon: 'none' });
      this.setState({ status: 'error' });
    }
  };

  // 刷新页面
  handleRefresh = () => {
    this.setState({
      status: 'pending'
    }, () => this.getArticleDetail());
  };

  // 获取转换后的发表时间
  getCreateTime = date => dayjs(date).fromNow();

  // 跳转到其他的文章
  GotoAnotherArticle = id => Taro.navigateTo({ url: `/pages/article/index?id=${id}` });

  // 对文章或者评论点赞,type=0: 为文章点赞，type=1: 为评论点赞
  handlePraiseArticle = async (id, type, status) => {
    if (!this.checkLogin()) return false;
    type = type === 'article' ? 0 : 1;
    Taro.showLoading({ title: status ? '正在取消点赞中' : '正在点赞中' });
    try {
      const { code } = await request('likeArticleOrComment', {
        id,
        type
      });
      if (code !== 200) {
        Taro.showToast({ title: status ? '取消失败,请重试' : '点赞失败,请重试', icon: 'none' });
        return false;
      }
      Taro.showToast({ title: status ? '已取消' : '点赞成功', icon: 'success' });
      if (type === 0) {
        this.setState({
          like: !status
        });
      } else {

      }
    } catch (err) {
      Taro.showToast({ title: err.msg || status ? '取消失败,请重试' : '点赞失败,请重试!', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  // 对文章收藏
  handleCollectArticle = async () => {
    if (!this.checkLogin()) return false;
    const { article, collect } = this.state;
    const id = article.id;
    Taro.showLoading({ title: collect ? '正在取消收藏中' : '正在收藏中' });
    try {
      const { code } = await request('collectArticleOrComment', { article_id: id });
      if (code !== 200) {
        Taro.showToast({ title: collect ? '取消失败,请重试' : '收藏失败,请重试', icon: 'none' });
        return false;
      }
      Taro.showToast({ title: collect ? '已取消' : '收藏成功', icon: 'success' });
      this.setState({
        collect: !collect
      });
    } catch (err) {
      Taro.showToast({ title: err.msg || collect ? '取消失败,请重试' : '收藏失败,请重试!', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  // 对文章进行评论
  handleAddComment = async () => {
    if (!this.checkLogin()) return false;
    const { article, comments, commentValue } = this.state;
    if (!commentValue) return Taro.showToast({ title: '请输入评论内容!', icon: 'none' });
    try {
      const { code, data, msg } = await request('commentArticle', {
        article_id: article.id,
        content: commentValue
      });
      if (code !== 200) {
        Taro.showToast({ title: msg || '评论失败,请重试', icon: 'none' });
        return false;
      }
      Taro.showToast({ title: '评论成功!', icon: 'success' });
      this.setState({ comments: [data, ...comments], commentValue: '' });
    } catch (err) {
      Taro.showToast({ title: err.msg || '评论失败,请重试', icon: 'none' });
    }
  };

  // 获取评论信息
  getComments = async () => {
    let { getCommentStatus, hasMore, comments, page, pageSize, article } = this.state;
    if (!hasMore) return false;
    if (getCommentStatus === 'pending') return false;
    this.setState({
      getCommentStatus: 'pending'
    }, async () => {
      try {
        const { code, data, msg } = await request('getComments', {
          article_id: article.id,
          page,
          pageSize
        });
        if (code !== 200) throw new Error(`Response Exception: ${msg};code: ${code}`);
        const { count, rows } = data;
        if (data.page * data.pageSize >= count) hasMore = false;
        this.setState({
          page: data.page + 1,
          pageSize: data.pageSize + 1,
          comments: comments.concat(rows),
          hasMore,
          getCommentStatus: 'done'
        });
      } catch (err) {
        // 获取失败
      }
    });
  };

  // 关注作者
  handleFollowPoster = () => {
    if (!this.checkLogin()) return false;
    const { poster, follow } = this.state;
    Taro.showLoading({ title: follow ? '正在取消关注中' : '正在关注中' });
    request('follow', { id: poster.id }).then(result => {
      const { code, msg } = result;
      Taro.hideLoading();
      if (code !== 200) {
        Taro.showToast({ title: msg ? msg : follow ? '取消关注失败, 请重试' : '关注失败, 请重试', icon: 'none' });
        return false;
      }
      this.setState({
        follow: !follow
      });
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: follow ? '取消关注失败, 请重试' : '关注失败, 请重试', icon: 'none' });
    });
  };

  // 系统信息
  getSystemInfo = () => {
    const result = Taro.getSystemInfoSync();
    return result.screenHeight - result.windowHeight - result.statusBarHeight - 32 > 72;
  };

  // 预览图片
  handlePreviewImage = index => {
    const { article } = this.state;
    Taro.previewImage({
      urls: [article.img1_url, article.img2_url, article.img3_url],
      current: `urls[${index}]`
    });
  };

  render() {
    const {
      status,
      article,
      poster,
      recommend,
      like,
      collect,
      follow,
      comments,
      hasMore,
      commentValue,
      getCommentStatus
    } = this.state;
    const isFullScreen = this.getSystemInfo();
    const content = article.content
      ? article.content.replace(/\\n|\\n\\r/g, '<br />')
      : '';
    const commentStatus =
      getCommentStatus === 'pending'
        ? 'loading'
        : hasMore
        ? 'more'
        : 'noMore';
    return (
      <View className='article'>
        {
          process.env.TARO_ENV === 'h5' && (
            <View className='article__header'>
              <AtIcon
                value='chevron-left'
                size='32'
                color='#fff'
                onClick={() => Taro.navigateBack()}
              ></AtIcon>
              <View className='article__header-title'>{article.title || ''}</View>
            </View>
          )
        }
        <View className='article__content'>
          <View className='article__inner'>
            {status === 'pending' && <Loading text='正在获取文章信息' />}
            {status === 'error' && (
              <View className='article__error'>
                <View className='article__error-text'>亲，文章信息获取失败了~</View>
                <View className='article__btn--refresh' onClick={this.handleRefresh}>点击重试</View>
              </View>
            )}
            {
              status === 'done' && (
                <View>
                  <View className='article__title'>{article.title}</View>
                  <View className='article__poster'>
                    <View
                      className='article__poster-left'
                      onClick={() => Taro.navigateTo({ url: `/pages/person/index?id=${poster.id}` })}
                    >
                      <Image src={poster.avatar} className='article__poster-avatar' />
                      <View className='article__poster-info'>
                        <Text className='article__poster-nickname'>{poster.nickname}</Text>
                        <Text className='article__poster-time'>{this.getCreateTime(article.createdAt)}</Text>
                      </View>
                    </View>
                    <View
                      className='article__poster-follow'
                      onClick={this.handleFollowPoster}
                    >
                      {follow ? '已关注' : '+关注'}
                    </View>
                  </View>
                  {article.img1_url && <Image onClick={() => this.handlePreviewImage(0)} src={article.img1_url} className='article__img' />}
                  {article.img2_url && <Image onClick={() => this.handlePreviewImage(1)} src={article.img2_url} className='article__img' />}
                  {article.img3_url && <Image onClick={() => this.handlePreviewImage(2)} src={article.img3_url} className='article__img' />}
                  <View className='article__body'>
                    <RichText nodes={content} />
                  </View>
                  {
                    recommend.length > 0 && (
                      <View className='article__recommend-title'>猜你喜欢</View>
                    )
                  }
                  {
                    recommend.length > 0 && (
                      <View className='article__recommend'>
                        {
                          recommend.map(item => (
                            <View
                              key={item.id}
                              className='article__recommend-item'
                              onClick={() => this.GotoAnotherArticle(item.id)}
                            >{item.title}</View>
                          ))
                        }

                      </View>
                    )
                  }
                  <View className='article__op'>
                    <View
                      className={classNames('article__op-praise',
                        { 'article__op-praise--active': like })}
                      onClick={() => this.handlePraiseArticle(article.id, 'article', like)}
                    >
                      <AtIcon
                        value='heart-2'
                        size='16'
                        color={like ? '#3296fa' : '#666'}
                        className='article__op-icon'
                      />
                      {like ? '已赞' : '点赞'}
                    </View>
                    <View
                      className={classNames('article__op-collect',
                        { 'article__op-collect--active': collect })}
                      onClick={this.handleCollectArticle}
                    >
                      <AtIcon
                        value='star-2'
                        size='16'
                        color={collect ? '#3296fa' : '#666'}
                        className='article__op-icon'
                      />
                      {collect ? '已收藏' : '收藏'}
                    </View>
                  </View>
                  <Comment
                    comments={comments}
                    status={commentStatus}
                    loadMore={this.getComments}
                  />
                </View>
              )
            }
          </View>
        </View>
        <View className='article__footer' style={{ paddingBottom: isFullScreen ? '64px' : 0 }}>
          <Input
            value={commentValue}
            confirmType='search'
            className='article__comment-input'
            placeholder='写点什么吧...'
            onInput={e => this.setState({ commentValue: e.target.value })}
            onFocus={this.checkLogin}
            onConfirm={this.handleAddComment}
          />
          <View className='article__comment-btn' onClick={this.handleAddComment}>评论</View>
        </View>
      </View>
    );
  }
}

export default Article;
