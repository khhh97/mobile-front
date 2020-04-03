// eslint-disable-next-line import/prefer-default-export
export const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://api.khhh.ink/api'
    : 'https://api-dev.khhh.ink/api';
