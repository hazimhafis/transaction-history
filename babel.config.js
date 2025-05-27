module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['@tamagui/core', '@tamagui/card', '@tamagui/button', '@tamagui/stacks'],
          config: './tamagui.config.ts',
        },
      ],
    ],
  };
}; 