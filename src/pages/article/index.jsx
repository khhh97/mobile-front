import Taro from '@tarojs/taro';
import { View, Input, Textarea, Text } from '@tarojs/components';
import { AtActionSheet, AtActionSheetItem, AtImagePicker } from 'taro-ui';
import { debounce } from 'lodash';
import request from '@/lib/request';
import './index.scss';

class ArticlePost extends Taro.Component {

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
    topicOpen: false
  };

  componentDidMount() {
    this.getArticleTopics();
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
  handleImagePickFail = () => Taro.showToast({ title: '图片选择失败,请重试' });

  // 选择图片
  handleChooseImage = (...args) => {
    const [files, type, index] = args;
    const { imgs } = this.state;
    if (type === 'add') {
      if (imgs.length === 3) return Taro.showToast({ title: '最多支持选择3张图片!' });
      const allowLength = 3 - imgs.length;
      const newImgs = files.slice(0, allowLength);
      this.setState({ imgs: imgs.concat(newImgs) });
    } else if (type === 'remove') {
      imgs.splice(index, 1);
      this.setState({ imgs: imgs });
    }
  };

  // 发表文章
  handleAddArticle = () => {

  };

  render() {
    const {
      imgs,
      title,
      content,
      topics,
      topic_id,
      topicOpen
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
            maxlength='1000'
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
      </View>
    );
  }
}

export default ArticlePost;
