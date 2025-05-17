const assign = require('object-assign');

/**
 * PostCSS plugin to convert px to other units
 */
module.exports = (opts = {}) => {
  // Merge options with defaults
  opts = assign(
    {
      divisor: 1,
      multiple: 1,
      decimalPlaces: 2,
      targetUnits: 'rpx',
      comment: 'no',
      minPixelValue: 0,
    },
    opts,
  );

  function replacePx(str) {
    if (!str) {
      return '';
    }
    return str.replace(/\b(\d+(\.\d+)?)px\b/g, (match, x) => {
      if (x <= opts.minPixelValue) {
        return match;
      }
      const size = (x * opts.multiple) / opts.divisor;
      return size % 1 === 0
        ? size + opts.targetUnits
        : size.toFixed(opts.decimalPlaces) + opts.targetUnits;
    });
  }

  return {
    postcssPlugin: 'postcss-px2units',
    Declaration(decl) {
      if (
        decl.next() &&
        decl.next().type === 'comment' &&
        decl.next().text === opts.comment
      ) {
        decl.next().remove();
      } else {
        decl.value = replacePx(decl.value);
      }
    },
  };
};

module.exports.postcss = true;
