import Taro, { Component } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import './index.scss';

class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  };

  decrement = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  render() {
    return (
      <View className='index'>
        <Button onClick={this.decrement}>-</Button>
      </View>
    );
  }
}

export default Index;
