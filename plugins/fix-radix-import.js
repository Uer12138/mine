// 这个插件用于修复 @radix-ui/react-select 导入 VISUALLY_HIDDEN_STYLES 的问题

module.exports = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack: (config, options) => {
      // 只有在开发环境下应用这个修复
      if (options.isServer) {
        config.module.rules.push({
          test: /@radix-ui\\react-select\\dist\\index\.mjs$/,
          use: [
            {
              loader: 'string-replace-loader',
              options: {
                search: "import { VISUALLY_HIDDEN_STYLES } from '@radix-ui/react-visually-hidden';",
                replace: "// 手动定义 VISUALLY_HIDDEN_STYLES 常量\nconst VISUALLY_HIDDEN_STYLES = {\n  position: 'absolute',\n  border: 0,\n  width: 1,\n  height: 1,\n  padding: 0,\n  margin: -1,\n  overflow: 'hidden',\n  clip: 'rect(0, 0, 0, 0)',\n  whiteSpace: 'nowrap',\n  wordWrap: 'normal',\n};\n",
              },
            },
          ],
        });
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
};