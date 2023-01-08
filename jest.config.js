/* eslint-disable global-require */

module.exports = {
  testURL: 'http://localhost/',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff1|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/.build/mocks/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    ...require('jest-module-name-mapper')(),
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleDirectories: ['node_modules', 'src/node_modules'],
};
