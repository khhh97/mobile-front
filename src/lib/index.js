import { pxTransform as TaroPxTransform } from '@tarojs/taro';
import { isObject, isEmpty, forEach } from 'lodash';

/**
 * 组件之间传值时，将带有px的转为rem
 */
/* eslint-disable-next-line */
export const pxTransform = (style) => {
  // 为空时
  if (isEmpty(style)) return isObject(style) ? {} : '';

  // 样式为一个对象时
  if (isObject(style)) {
    forEach(style, (value, key) => {
      if (typeof value === 'number') {
        style[key] = TaroPxTransform(value);
      } else if (value.indexOf('px')) {
        const styles = value.split(' ');
        style[key] = styles.map(item => {
          if (item.includes('px')) {
            item = TaroPxTransform(item);
          }
          return item;
        }).join(' ');
      }
      if (!style[key]) delete style[key];
    });
  } else {
    style = (typeof style === 'number') ? TaroPxTransform(style) : style;
  }
  return style;
};
