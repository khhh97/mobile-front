import Taro, { Component } from '@tarojs/taro';
import { Provider } from '@tarojs/mobx';
import Index from './pages/index';

import counterStore from './store/counter';

import './app.scss';

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const store = {
  counterStore
};

class App extends Component {
  // eslint-disable-next-line react/sort-comp
  config = {
    pages: [
      'pages/login/index',
      'pages/index/index',
      'pages/article/index',
      'pages/robot/index',
      'pages/my/index'

    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    // 底部tab栏
    tabBar: {
      color: '#666666',
      selectedColor: '#3296FA',
      backgroundColor: '#FFFFFF',
      list: [
        {
          text: '首页',
          pagePath: 'pages/index/index',
          iconPath: './assets/tabbar/index.png',
          selectedIconPath: './assets/tabbar/index-select.png'
        },
        {
          text: '发表文章',
          pagePath: 'pages/article/index',
          iconPath: './assets/tabbar/post.png',
          selectedIconPath: './assets/tabbar/post-select.png'
        },
        {
          text: '问答',
          pagePath: 'pages/robot/index',
          iconPath: './assets/tabbar/robot.png',
          selectedIconPath: './assets/tabbar/robot-select.png'
        },
        {
          text: '我的',
          pagePath: 'pages/my/index',
          iconPath: './assets/tabbar/my.png',
          selectedIconPath: './assets/tabbar/my-select.png'
        }
      ]
    }
  };

  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));