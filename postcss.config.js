const customMedia = {
  '(--breakpoint-mobile)': '(max-width: 36rem)',
};

const expandCustomMedia = () => {
  return {
    postcssPlugin: 'expand-custom-media',
    AtRule(atRule) {
      if (atRule.name !== 'media') {
        return;
      }

      const replacement = customMedia[atRule.params.trim()];

      if (replacement) {
        atRule.params = replacement;
      }
    },
  };
};

expandCustomMedia.postcss = true;

export default {
  plugins: [expandCustomMedia()],
};
