import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

const Loading = ({ text }) => {
  return (
    <View className='loading'>
      <View className='loading__container'>
        <View className='loading__content'>
          <View className='loading__content-item' />
          <View className='loading__content-item' />
          <View className='loading__content-item' />
          <View className='loading__content-item' />
          <View className='loading__content-item' />
        </View>
        {text && <View className='loading__text'>{text}</View>}
      </View>
    </View>
  );
};

export default Loading;
