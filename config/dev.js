/* eslint-disable */
const os = require('os');

// 获取本机ip
const getComputerIp = () => {
  const netInterface = os.networkInterfaces();
  // 遍历给出的对象信息，为ipv4以及非本机网络
  for (const key in netInterface) {
    if (netInterface.hasOwnProperty(key)) {
      const netInfo = netInterface[key];
      for (let i = 0; i < netInfo.length; i++) {
        const network = netInfo[i];
        if (
          network.family === 'IPv4' &&
          network.address !== '127.0.0.1' &&
          !network.internal
        ) {
          return network.address;
        }
      }
    }
  }
};

const host = getComputerIp();

module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {},
  mini: {},
  h5: {
    devServer: {
      host,
      port: 8080
    }
  }
};
