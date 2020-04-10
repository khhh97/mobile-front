import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import PropTypes from 'prop-types';
import Loading from '@/components/Loading';
import dayjs from 'dayjs';
import cn from 'classnames';
import './index.scss';

const blockClass = 'article__list';

class ArticleList extends Taro.PureComponent {

  static propTypes = {
    list: PropTypes.array,
    hasMore: PropTypes.bool.isRequired,
    status: PropTypes.oneOf(['pending', 'done', 'error']),
    // 是否展示发布者用户信息
    showPoster: PropTypes.bool
    // onLoaded: PropTypes.func
  };

  static defaultProps = {
    list: [],
    hasMore: true,
    status: 'pending',
    showPoster: false,
    wrapperHeight: '400px'
  };

  // 跳转文章详情页
  goToArticleDetail = id => Taro.navigateTo({ url: `/pages/article/index?id=${id}` });

  render() {
    const { status, list, hasMore } = this.props;
    const { showPoster } = this.props;

    // 解决小程序端监听下滑操作无法设置高度问题设置的style
    let centerStyle = {};
    if (process.env.TARO_ENV !== 'h5') {
      centerStyle = {
        position: 'fixed',
        top: '50%',
        left: '0',
        transform: 'translate(0, -50%)'
      };
    }
    return (
      <View className={blockClass}>
        {
          list.length === 0 && status === 'pending' && <Loading text='正在加载中' style={centerStyle} />
        }
        {
          list.length === 0 && status === 'error' && <View style={centerStyle} className={`${blockClass}-btn--refresh`}>请求失败,请重试</View>
        }
        {
          list.length === 0 && status === 'done' && <View style={centerStyle} className={`${blockClass}--none`}>对不起,暂时没有数据!</View>
        }
        {
          list.length > 0 && (
            <View>
              <View>
                {
                  list.map((article => (
                    <View
                      className={`${blockClass}-item`}
                      key={article.id}
                      onClick={() => this.goToArticleDetail(article.id)}
                    >
                      {
                        showPoster && (
                          <View className={`${blockClass}-item__user`}>
                            <Image
                              className={`${blockClass}-item__user-avatar`}
                              src={article.user && article.user.avatar}
                            />
                            <View className={`${blockClass}-item__user-body`}>
                              <View className={`${blockClass}-item__user-nickname`}>{article.user.nickname}</View>
                              <View className={`${blockClass}-item__user-create`}>{dayjs(article.createdAt).format('YYYY-MM-DD')}</View>
                            </View>
                          </View>
                        )
                      }
                      <View className={`${blockClass}-item__body`}>
                        <View className={`${blockClass}-item__content`}>
                          <View className={cn(`${blockClass}-item__title`, { [`${blockClass}-item__title--padding`]: article.imgs.length === 1 })}>
                            {article.title}
                          </View>
                          {article.imgs.length === 1 && <Image className={`${blockClass}-item__title-img`} src={article.imgs[0]} />}
                        </View>
                        {
                          article.imgs.length >= 2 && (
                            <View className={`${blockClass}-item__img`}>
                              {
                                article.imgs.map((item, index) => <Image key={index} src={item} className={`${blockClass}-item__img-item`} />)
                              }
                            </View>
                          )
                        }
                      </View>
                      <View className={`${blockClass}-item__footer`}>
                        <View>
                          {!showPoster && <Text className={`${blockClass}-item__poster`}>{article.user.nickname}</Text>}
                          <Text>{article.comments}评论</Text>
                        </View>
                        <View className={`${blockClass}-item-time`}>{dayjs(article.createdAt).fromNow()}</View>
                      </View>
                    </View>
                  )))
                }
              </View>
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

export default ArticleList;
