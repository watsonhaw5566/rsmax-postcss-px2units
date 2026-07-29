/**
 * PostCSS plugin to convert px to rpx for rsmax
 * Features:
 * - Lowercase px: convert to rpx
 * - Uppercase PX or Px: keep as px (convert to lowercase px in output)
 * - Support /* no * / comment to skip single declaration
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

  const PLACEHOLDER_OPEN = '\u0000RSMAX_UPPER_PX_';
  const PLACEHOLDER_CLOSE = '\u0000';

  // Match both lowercase px and uppercase PX/Px
  const pxRegex = /\b(\d+(\.\d+)?)(px|PX|Px)\b/g;
  const placeholderRegex = new RegExp(
    PLACEHOLDER_OPEN + '(\\d+(?:\\.\\d+)?)' + PLACEHOLDER_CLOSE,
    'g',
  );

  function createPlaceholder(value) {
    return PLACEHOLDER_OPEN + value + PLACEHOLDER_CLOSE;
  }

  function replacePx(str) {
    if (!str) {
      return '';
    }
    return str.replace(pxRegex, (match, x, dec, unit) => {
      const value = Number(x);
      const isUpper = unit !== 'px';

      if (isUpper) {
        // Uppercase PX/Px: replace with placeholder that won't match px regex
        return createPlaceholder(x);
      }

      // Lowercase px: convert to target units
      if (value < opts.minPixelValue) {
        return match;
      }
      const size = (value * opts.multiple) / opts.divisor;
      return size % 1 === 0
        ? String(size) + opts.targetUnits
        : size.toFixed(opts.decimalPlaces) + opts.targetUnits;
    });
  }

  function restorePlaceholders(str) {
    if (!str) {
      return '';
    }
    return str.replace(placeholderRegex, '$1px');
  }

  return {
    postcssPlugin: 'postcss-px2units',
    Once(root) {
      // Use string replacement on the root toString() and parse back?
      // No, better to walk decls and process values with placeholders
      root.walkDecls((decl) => {
        const next = decl.next();
        if (next && next.type === 'comment' && next.text === opts.comment) {
          next.remove();
        } else {
          let value = decl.value;
          value = replacePx(value);
          value = restorePlaceholders(value);
          decl.value = value;
        }
      });
    },
  };
};
module.exports.postcss = true;
