import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

function Error({ text = '加载出错', btnText = '点击重试', onClick = () => ({}) }) {
  return (
    <View className='error'>
      <View className='error__text'>{text}</View>
      <View
        className='error__btn'
        onClick={onClick}
      >{btnText}</View>
    </View>
  );
}

export default Error;
