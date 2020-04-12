import Taro from '@tarojs/taro';
import { View, Image, Input, RadioGroup, Radio } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtIcon, AtInputNumber, AtTextarea } from 'taro-ui';
import upload from '@/lib/upload';
import request from '@/lib/request';
import { changeUser } from '../../store/user/actions';
import './index.scss';

@connect(
  ({ user }) => ({ userInfo: user.user }),
  dispatch => ({ updateUser: user => dispatch(changeUser(user)) })
)
class Person extends Taro.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }

  componentDidMount() {
    this.getUser();
  }

  // 获取用户信息
  getUser = async () => {
    try {
      const { code, data } = await request('getUser');
      if (code !== 200) throw new Error();
      this.setState({ user: data });
    } catch (err) {
      Taro.showToast({ title: '用户信息获取失败,请重试!', icon: 'none' });
    }
  };

  // 上传头像
  handleUploadAvatar = () => {
    upload({
      url: '/user/avatar',
      name: 'avatar'
    }).then(result => {
      const { data } = result;
      this.setState(pre => ({ user: { ...pre.user, avatar: data } }));
    });
  };

  // 性别切换
  handleGenderChange = (e, index) => {
    const gender = index === 0 ? '男' : '女';
    const { user } = this.state;
    if (user.gender === gender) return false;
    this.setState({ user: { ...user, gender } });
  };

  // 同意设置表单input的change事件
  handleFormChange = (e, type) => {
    const { user } = this.state;
    let value = '';
    if (type === 'birth' || type === 'bio') {
      value = e;
    } else {
      value = e.target.value;
    }
    this.setState({ user: { ...user, [type]: value } });
  };

  // 提交表单
  handleSubmitForm = async () => {
    const { user } = this.state;
    const { nickname, job, birth, gender, bio } = user;
    if (!nickname) return Taro.showToast({ icon: 'none', title: '请输入用户昵称' });
    // 更新信息
    Taro.showLoading({ title: '正在更新中' });
    try {
      const { code } = await request('updateUser', {
        nickname,
        job,
        birth: String(birth),
        gender,
        bio
      });
      if (code !== 200) throw new Error();
      Taro.hideLoading();
      Taro.showToast({ icon: 'success', title: '用户信息更新成功' });
      // eslint-disable-next-line taro/this-props-function
      this.props.updateUser(user);
    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ icon: 'none', title: '个人信息修改失败,请重试' });
    }
  };

  render() {
    const { user } = this.state;
    let wrapperStyle = {};
    if (process.env.TARO_ENV === 'h5') {
      wrapperStyle = {
        paddingTop: Taro.pxTransform(88)
      };
    }
    const gender = user.gender || '男';
    return (
      <View className='my' style={wrapperStyle}>
        {
          process.env.TARO_ENV === 'h5' && (
            <View className='my__header'>
              <AtIcon
                value='chevron-left'
                size='32'
                color='#fff'
                onClick={() => Taro.navigateBack()}
              ></AtIcon>
              <View className='my__header-title'>个人信息</View>
            </View>
          )
        }
        <View className='my__item' onClick={this.handleUploadAvatar}>
          <View className='my__item-prefix'>头像：</View>
          <Image className='my__avatar' src={user.avatar} />
        </View>
        <View className='my__item'>
          <View className='my__item-prefix'>昵称：</View>
          <Input
            value={user.nickname}
            className='my__item-input'
            placeholder='请输入您的昵称'
            onInput={e => this.handleFormChange(e, 'nickname')}
          />
        </View>
        <View className='my__item'>
          <View className='my__item-prefix'>职业：</View>
          <Input
            value={user.job}
            className='my__item-input'
            placeholder='请输入您的职业'
            onInput={e => this.handleFormChange(e, 'job')}
          />
        </View>
        <View className='my__item'>
          <View className='my__item-prefix'>年龄：</View>
          <AtInputNumber
            min={1}
            max={150}
            step={1}
            value={user.birth || 1}
            onChange={v => this.handleFormChange(v, 'birth')}
          />
        </View>
        <View className='my__item'>
          <View className='my__item-prefix'>性别：</View>
          <RadioGroup onChange={this.handleGenderChange}>
            <Radio
              value='男'
              checked={gender === '男'}
              style={{ marginRight: Taro.pxTransform(16) }}
            >
              男
            </Radio>
            <Radio
              value='女'
              checked={gender === '女'}
            >
              女
            </Radio>
          </RadioGroup>
        </View>
        <View className='my__bio-wrapper'>
          <AtTextarea
            count={false}
            value={user.bio || ''}
            onChange={e => this.handleFormChange(e, 'bio')}
            placeholder='您的个人介绍...'
            className='my__bio'
            maxLength={100}
          />
          <View className='my__btn--submit' onClick={this.handleSubmitForm}>提交</View>
        </View>
      </View>
    );
  }

}

export default Person;
