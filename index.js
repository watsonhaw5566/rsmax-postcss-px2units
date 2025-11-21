/**
 * PostCSS plugin to convert px to other units
 */
module.exports = (opts = {}) => {
  opts = Object.assign(
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

  const pxRegex = /\b(\d+(\.\d+)?)px\b/g;

  function replacePx(str) {
    if (!str) {
      return '';
    }
    return str.replace(pxRegex, (match, x) => {
      const value = Number(x);
      if (value <= opts.minPixelValue) {
        return match;
      }
      const size = (value * opts.multiple) / opts.divisor;
      return size % 1 === 0
        ? String(size) + opts.targetUnits
        : size.toFixed(opts.decimalPlaces) + opts.targetUnits;
    });
  }

  return {
    postcssPlugin: 'postcss-px2units',
    Declaration(decl) {
      const next = decl.next();
      if (next && next.type === 'comment' && next.text === opts.comment) {
        next.remove();
      } else {
        decl.value = replacePx(decl.value);
      }
    },
  };
};

module.exports.postcss = true;
