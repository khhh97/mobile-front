import Taro from '@tarojs/taro';
import { View, Input, Textarea, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import {
  AtActionSheet,
  AtActionSheetItem,
  AtImagePicker,
  AtModal
} from 'taro-ui';
import { debounce } from 'lodash';
import request from '@/lib/request';
import { uploadFile } from '@/lib/upload';
import './index.scss';

@connect(({ user }) => ({ user: user.user }))
class ArticlePost extends Taro.PureComponent {

  config = {
    navigationBarTitleText: '发表文章'
  };

  state = {
    // 文章标题
    title: '',

    // 文章内容
    content: '',

    // 文章主题id
    topic_id: '',

    // 所有的图片
    imgs: [],

    // 所有文章分类
    topics: [],

    // 控制选择主题的ActionSheet 打开与关闭
    topicOpen: false,

    // modal框关闭与展示
    modalOpen: false,

    // 发表的新文章id
    articleId: ''
  };

  componentDidMount() {
    this.getArticleTopics();
  }

  componentDidHide() {
    if (process.env.TARO_ENV === 'h5') {
      this.handleModalClose();
    }
  }

  // 获取所有的文章分类
  getArticleTopics = async () => {
    try {
      const { code, data, msg } = await request('getTopics');
      if (code !== 200) throw new Error(`Response Exception: ${msg};code: ${code}`);
      this.setState({ topics: data });
    } catch (err) {
      Taro.showToast({ title: err.msg || '文章主题分类获取失败', icon: 'none' });
    }
  };

  // 标题内容
  handleTitleChange = e => this.setState({ title: e.target.value });

  // 文章内容受控
  handleContentInput = debounce(e => {
    this.setState({ content: e.target.value });
  }, 200);

  // 选择文章分类
  handleOpenActionSheet = () => this.setState({ topicOpen: true });

  // 主题选择的ActionSheet关闭
  handleCloseActionSheet = () => this.setState({ topicOpen: false });

  // 选择文章主题
  handleChooseTopic = id => this.setState({ topic_id: id, topicOpen: false });

  // 图片选择失败
  handleImagePickFail = () => Taro.showToast({ title: '图片选择失败,请重试', icon: 'none' });

  // 选择图片
  handleChooseImage = (...args) => {
    const [files, type, index] = args;
    if (type === 'add') {
      if (files.length > 3) {
        this.setState({ imgs: files.slice(0, 3) });
        Taro.showToast({ title: '最多支持选择3张图片!', icon: 'none' });
        return false;
      } else {
        this.setState({ imgs: files });
      }
    } else if (type === 'remove') {
      files.splice(index, 1);
      this.setState({ imgs: files });
    }
  };

  // 上传图片
  handleUploadImages = () => {
    const { imgs } = this.state;
    return new Promise(((resolve, reject) => {
      const result = [];
      if (imgs.length === 0) resolve(result);
      let i = 0;
      imgs.forEach((file, index) => {
        let img = file.url;
        if (process.env.TARO_ENV === 'h5') {
          img = file.file.originalFileObj;
        }
        uploadFile({
          url: '/upload',
          name: 'image'
        }, img).then(res => {
          i++;
          result[index] = res;
          if (i === imgs.length) {
            resolve(result);
          }
        }).catch(err => reject(err));
      });
    }));
  };

  // 发表文章
  handleAddArticle = async () => {
    const { title, content, topic_id } = this.state;
    if (!title) return Taro.showToast({ title: '请输入文章标题', icon: 'none' });
    if (!content) return Taro.showToast({ title: '请输入文章内容', icon: 'none' });
    if (!topic_id) return Taro.showToast({ title: '请选择文章所属主题', icon: 'none' });
    // 创建文章
    Taro.showLoading({ title: '正在发表文章中' });
    this.handleUploadImages().then(async results => {
      const params = {
        title,
        content,
        topic_id,
        img1_url: results[0] ? results[0].data : '',
        img2_url: results[1] ? results[1].data : '',
        img3_url: results[2] ? results[2].data : ''
      };
      // 创建文章
      try {
        const { code, data, msg } = await request('post', params);
        Taro.hideLoading();
        if (code !== 200) {
          return Taro.showToast({
            title: typeof msg === 'string' ? msg : '文章发表失败,请重试',
            icon: 'none'
          });
        }
        // 创建成功
        this.setState({
          articleId: data.id,
          modalOpen: true
        });
      } catch (err) {
        Taro.hideLoading();
        Taro.showToast({ title: err.msg || '文章发表失败,请重试', icon: 'none' });
      }
    }).catch(err => {
      Taro.hideLoading();
      Taro.showToast({ title: err.msg || '图片上传失败,请重试', icon: 'none' });
    });
  };

  // modal框关闭
  handleModalClose = () => {
    this.setState({
      title: '',
      content: '',
      modalOpen: false
    });
  };

  handleGoToArticleDetail = () => {
    const { articleId } = this.state;
    if (!articleId) return false;
    Taro.navigateTo({ url: `/pages/article/index?id=${articleId}` });
  };

  // 跳转登录页面
  goToLoginPage = () => Taro.navigateTo({ url: '/pages/login/index' });

  render() {
    const { user } = this.props;
    const token = Taro.getStorageSync('token');
    if (!token || Object.keys(user).length === 0) {
      return (
        <View className='post__login' onClick={this.goToLoginPage}>登录</View>
      );
    }
    const {
      imgs,
      title,
      content,
      topics,
      topic_id,
      topicOpen,
      modalOpen
    } = this.state;
    let topic = topics.find(item => item.id === topic_id);
    topic = topic ? topic.name : '选择文章所属主题';
    return (
      <View className='post'>
        <View className='post__input'>
          <Input
            type='text'
            value={title}
            className='post__title'
            placeholder='请输入标题'
            maxLength='30'
            onChange={this.handleTitleChange}
          />
        </View>
        <View className='post__content'>
          <Textarea
            className='post__content-input'
            placeholder='请输入正文'
            maxlength='2000'
            show-count={false}
            value={content}
            onInput={this.handleContentInput}
          />
          <Text className='post__content-count'>共{content.length}字</Text>
        </View>
        <View
          className='post__topic'
          onClick={this.handleOpenActionSheet}
        >
          {topic}
        </View>
        <AtActionSheet
          isOpened={topicOpen}
          cancelText='关闭'
          onClose={this.handleCloseActionSheet}
        >
          {
            topics.map(item => (
              <AtActionSheetItem
                key={item.id}
                onClick={() => this.handleChooseTopic(item.id)}
              >
                {item.name}
              </AtActionSheetItem>
            ))
          }
        </AtActionSheet>
        {/* 图片上传 */}
        <AtImagePicker
          files={imgs}
          multiple
          count={3}
          className='post__image-picker'
          length={3}
          showAddBtn={imgs.length < 3}
          onChange={this.handleChooseImage}
          onImageClick={this.handleImageClick}
          onFail={this.handleImagePickFail}
        />
        <View className='post__btn' onClick={this.handleAddArticle}>发表</View>
        <AtModal
          isOpened={modalOpen}
          title='文章发表成功了，赶紧去看看吧!'
          cancelText='不用了'
          confirmText='好的'
          onClose={this.handleModalClose}
          onCancel={this.handleModalClose}
          onConfirm={this.handleGoToArticleDetail}
        />
      </View>
    );
  }
}

export default ArticlePost;
