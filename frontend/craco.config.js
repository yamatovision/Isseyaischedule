module.exports = {
  webpack: {
    configure: {
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: ['node_modules', 'src']
      }
    }
  }
};
