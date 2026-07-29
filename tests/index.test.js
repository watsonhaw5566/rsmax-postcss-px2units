const { test, expect, describe } = require('@rstest/core');
const postcss = require('postcss');
const px2units = require('../index');

async function process(css, options) {
  const result = await postcss([px2units(options)]).process(css, { from: undefined });
  return result.css;
}

describe('basic px to rpx conversion', () => {
  test('should convert lowercase px to rpx', async () => {
    const input = '.box { width: 100px; }';
    const output = await process(input);
    expect(output).toContain('width: 100rpx');
  });

  test('should convert multiple px values', async () => {
    const input = '.box { margin: 10px 20px 30px 40px; }';
    const output = await process(input);
    expect(output).toContain('margin: 10rpx 20rpx 30rpx 40rpx');
  });

  test('should handle decimal px values', async () => {
    const input = '.box { font-size: 14.5px; }';
    const output = await process(input);
    expect(output).toContain('font-size: 14.50rpx');
  });

  test('should handle zero px', async () => {
    const input = '.box { margin: 0px; padding: 0px; }';
    const output = await process(input);
    expect(output).toContain('margin: 0rpx');
    expect(output).toContain('padding: 0rpx');
  });

  test('should not convert rpx values', async () => {
    const input = '.box { width: 750rpx; height: 100px; }';
    const output = await process(input);
    expect(output).toContain('width: 750rpx');
    expect(output).toContain('height: 100rpx');
  });
});

describe('uppercase PX/Px handling', () => {
  test('should keep uppercase PX as px (not convert to rpx)', async () => {
    const input = '.box { border: 1PX solid #ccc; }';
    const output = await process(input);
    expect(output).toContain('border: 1px solid #ccc');
    expect(output).not.toContain('1rpx');
  });

  test('should keep capitalized Px as px', async () => {
    const input = '.box { font-size: 14Px; }';
    const output = await process(input);
    expect(output).toContain('font-size: 14px');
    expect(output).not.toContain('14rpx');
  });

  test('should handle mixed px and PX in same declaration', async () => {
    const input = '.box { width: 100px; border: 1PX solid #000; font-size: 14Px; }';
    const output = await process(input);
    expect(output).toContain('width: 100rpx');
    expect(output).toContain('border: 1px solid #000');
    expect(output).toContain('font-size: 14px');
  });

  test('should handle multiple declarations with mixed units', async () => {
    const input = `
.a { width: 100px; }
.b { height: 200PX; }
.c { padding: 10Px 20px; }
    `;
    const output = await process(input);
    expect(output).toContain('width: 100rpx');
    expect(output).toContain('height: 200px');
    expect(output).toContain('padding: 10px 20rpx');
  });
});

describe('comment ignore', () => {
  test('should skip declaration with /* no */ comment', async () => {
    const input = '.box { width: 100px; /* no */ height: 200px; }';
    const output = await process(input);
    expect(output).toContain('width: 100px');
    expect(output).toContain('height: 200rpx');
  });

  test('should support custom comment', async () => {
    const input = '.box { width: 100px; /* skip */ height: 200px; }';
    const output = await process(input, { comment: 'skip' });
    expect(output).toContain('width: 100px');
    expect(output).toContain('height: 200rpx');
  });
});

describe('options', () => {
  test('should use divisor option', async () => {
    const input = '.box { width: 100px; }';
    const output = await process(input, { divisor: 2 });
    expect(output).toContain('width: 50rpx');
  });

  test('should use multiple option', async () => {
    const input = '.box { width: 100px; }';
    const output = await process(input, { multiple: 2 });
    expect(output).toContain('width: 200rpx');
  });

  test('should use targetUnits option', async () => {
    const input = '.box { width: 100px; }';
    const output = await process(input, { targetUnits: 'rem' });
    expect(output).toContain('width: 100rem');
  });

  test('should respect minPixelValue', async () => {
    const input = '.box { border: 1px solid #ccc; width: 100px; }';
    const output = await process(input, { minPixelValue: 2 });
    expect(output).toContain('border: 1px solid #ccc');
    expect(output).toContain('width: 100rpx');
  });

  test('should use decimalPlaces option', async () => {
    const input = '.box { width: 100px; }';
    const output = await process(input, { divisor: 3, decimalPlaces: 3 });
    expect(output).toContain('width: 33.333rpx');
  });
});
