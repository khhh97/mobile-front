export default {
  sendVerify: {
    url: '/verify',
    method: 'post'
  },
  login: {
    url: '/login',
    method: 'post'
  },
  getUser: {
    url: '/user/my',
    method: 'get'
  },
  getTopics: {
    url: '/topics',
    method: 'get'
  },
  // 上传文件
  uploadFile: {
    url: '/upload',
    method: 'post'
  },
  post: {
    url: '/article',
    method: 'post'
  },
  // 获取文章详情
  getArticle: {
    url: '/article',
    method: 'get'
  },
  // 对文章或者评论点赞
  likeArticleOrComment: {
    url: '/like',
    method: 'post'
  },
  // 对文章收藏
  collectArticleOrComment: {
    url: '/collect',
    method: 'post'
  },
  // 对文章评论
  commentArticle: {
    url: '/comment',
    method: 'post'
  },
  // 获取评论
  getComments: {
    url: '/comment',
    method: 'get'
  },
  // 关注他人
  follow: {
    url: '/follow',
    method: 'post'
  },
  // 获取文章列表
  getArticles: {
    url: '/article/list',
    method: 'get'
  },
  // 获取用户信息
  getUserInfo: {
    url: '/user/profile',
    method: 'get'
  },
  // 获取我的浏览历史
  getHistory: {
    url: '/user/my/history',
    method: 'get'
  },
  // 获取我的收藏
  getCollects: {
    url: '/user/my/collect',
    method: 'get'
  },
  // 获取我的点赞
  getLikes: {
    url: '/user/my/likes',
    method: 'get'
  },
  // 更新用户信息
  updateUser: {
    url: '/user/update',
    method: 'post'
  },
  // 获取关注列表
  getFollows: {
    url: '/follows',
    method: 'get'
  },
  // 获取粉丝列表
  getFans: {
    url: '/fans',
    method: 'get'
  }
};
