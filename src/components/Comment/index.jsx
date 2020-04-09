import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { AtLoadMore } from 'taro-ui';
import { pxTransform } from '@/lib';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import './index.scss';

function Comment(props) {
  const { comments, status } = props;

  if (comments.length === 0) return '';

  return (
    <View className='comment' style={pxTransform(this.props.style)}>
      {
        comments.map(comment => (
          <View key={comment.id} className='comment__item'>
            <Image src={comment.user.avatar} className='comment__item-avatar'></Image>
            <View className='comment__item-content'>
              <View className='comment__item-header'>
                <View className='comment__item-nickname'>{comment.user.nickname}</View>
                <View className='comment__item-time'>{dayjs(comment.createdAt).format('MM-DD HH:mm')}</View>
              </View>
              <View className='comment__item-body'>{comment.content}</View>
            </View>
          </View>
        ))
      }
      {
        comments.length > 0 && (
          <AtLoadMore
            status={status}
            onClick={props.loadMore}
            moreBtnStyle={pxTransform({ border: 'none', marginTop: '-50px' })}
          />
        )
      }
    </View>
  );
}

Comment.propTypes = {
  comments: PropTypes.array,
  status: PropTypes.string,
  loadMore: PropTypes.func
};

Comment.defaultProps = {
  comments: [],
  status: 'more',
  loadMore: () => {
  }
};

export default Comment;
