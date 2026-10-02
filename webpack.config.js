module.exports = function (options, webpack) {
  return {
    ...options,
    output: {
      ...options.output,
      libraryTarget: 'commonjs',
    },
  };
};
