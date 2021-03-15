module.exports = {
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(scss)$': 'identity-obj-proxy',
    'lodash-es': 'lodash',
  },
};
