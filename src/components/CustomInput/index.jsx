/* eslint-disable react/no-multi-comp */
import Taro from '@tarojs/taro';
import { View, Input, Image } from '@tarojs/components';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clear from './image/clear.svg';
import './index.scss';

class CustomInput extends Taro.Component {
  static propTypes = {
    /**
     * @description input的属性值
     * @see 具体属性值见 https://developers.weixin.qq.com/miniprogram/dev/component/input.html
     */
    // 输入框 type属性
    // type: PropTypes.oneOf([
    //   'text',
    //   'number',
    //   'password',
    //   'idcard', // 身份证输入键盘
    //   'digit' // 身份证输入键盘
    // ]),

    // input value 值
    value: PropTypes.string,

    // 默认填充的值
    placeholder: PropTypes.string,

    // 是否禁用
    disabled: PropTypes.bool,

    // 最大输入长度
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // 是否自动获取焦点
    focus: PropTypes.bool,

    // 设置键盘右下角按钮的文字
    confirmType: PropTypes.string,

    // 是否显示清除图标
    showClear: PropTypes.bool,

    // placeholder 样式
    placeholderStyle: PropTypes.string,

    // input发生的onChange事件
    onChange: PropTypes.func,

    // 搜索事件
    onSubmit: PropTypes.func,

    // 输入框聚焦事件
    onFocus: PropTypes.func,

    // 输入框失焦事件
    onBlur: PropTypes.func
  };

  static defaultProps = {
    type: 'text',
    value: '',
    disabled: false,
    placeholder: '',
    maxLength: 30,
    focus: false,
    confirmType: 'search',
    showClear: false,
    placeholderStyle: '',
    onChange: () => {},
    onSubmit: () => {},
    onFocus: () => {},
    onBlur: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      // 输入框的值
      inputValue: props.value || '',

      // 是否聚焦
      inputFocus: false
    };
  }

  componentDidMount() {
    // 处理h5端focus问题
    if (process.env.TARO_ENV === 'h5') {
      if (this.props.focus) {
        this.inputNode &&
          this.inputNode.inputRef &&
          this.inputNode.inputRef.focus();
        this.setState({ inputFocus: true });
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.value !== this.props.value &&
      nextProps.value !== this.state.inputValue
    ) {
      nextState.inputValue = nextProps.value;
    }
    return true;
  }

  // 输入框表单提交
  handleFormSubmit = e => {
    e.preventDefault();
    // 失焦
    if (process.env.TARO_ENV === 'h5') {
      e.target.blur();
    }
    const { inputValue } = this.state;
    this.props.onSubmit(inputValue, e);
  };

  // 输入框聚焦
  handleInputFocus = e => {
    this.setState({ inputFocus: true }, () => this.props.onFocus(e));
  };

  // 输入框失焦
  handleInputBlur = e => {
    this.setState({ inputFocus: false }, () => this.props.onBlur(e));
  };

  // 处理输入框input事件
  handleInputChange = e => {
    this.setState(
      {
        inputValue: e.detail.value
      },
      () => {
        this.props.onChange(this.state.inputValue, e);
      }
    );
  };

  // 输入框清除
  handleInputClear = () => {
    this.setState(
      {
        inputValue: ''
      },
      () => {
        this.props.onChange(this.state.inputValue);
      }
    );
  };

  render() {
    const { inputValue, inputFocus } = this.state;
    let inputProps = { ...this.props };

    // 处理h5端的input属性问题
    if (process.env.TARO_ENV === 'h5') {
      delete inputProps.focus;
    }

    // 是否显示语音按钮，反之对应是否显示清除按钮
    const showClearIcon = inputFocus ? (inputValue ? false : true) : true;

    return (
      <View className='input__container' style={{ ...this.props.style }}>
        <Input
          ref={el => (this.inputNode = el)}
          type={inputProps.type}
          value={inputValue}
          name='search'
          placeholder={inputProps.placeholder}
          disabled={inputProps.disabled}
          maxLength={inputProps.maxLength}
          focus={inputProps.focus}
          confirmType={inputProps.confirmType}
          placeholderStyle={inputProps.placeholderStyle}
          className='input__content'
          autocomplete='off'
          onInput={this.handleInputChange}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onConfirm={this.handleFormSubmit}
        />
        {/* 清除按钮 */}
        {inputProps.showClear && (
          <View
            className={classNames('input__suffix', {
              'input__suffix--hidden': showClearIcon
            })}
            onTouchStart={this.handleInputClear}
          >
            <Image className='input__suffix-icon' src={clear} />
          </View>
        )}
      </View>
    );
  }
}

export default CustomInput;
