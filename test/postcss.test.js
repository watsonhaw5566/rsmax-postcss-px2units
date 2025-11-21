import {expect, test} from '@rstest/core';
import postcss from 'postcss';
import * as pluginModule from '../index.js';

const plugin = pluginModule.default || pluginModule;

async function run(input, opts = {}) {
    return await postcss([plugin(opts)]).process(input, {from: undefined});
}

test('replace pixel values', async () => {
    const result = await run(`.title {
      font-size: 24px;
      background-image: url(../slice/icon-wh.png);
      margin: 0 0 0 5px;
      vertical-align: -1px;
      display: flex;
    }`, {});
    expect(result.css).toBe(`.title {
      font-size: 24rpx;
      background-image: url(../slice/icon-wh.png);
      margin: 0 0 0 5rpx;
      vertical-align: -1rpx;
      display: flex;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('rpx not be replaced', async () => {
    const result = await run(`.title2 {
      padding: 20rpx 30px 2rem 4em;
    }`, {});
    expect(result.css).toBe(`.title2 {
      padding: 20rpx 30rpx 2rem 4em;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('pixel values not be replaced', async () => {
    const result = await run(`.title3 {
      padding: 20rpx 30px 2rem 4em; /* no */
      margin: 40px;
      font-size: 24px; /* no */
    }`, {comment: 'no'});
    expect(result.css).toBe(`.title3 {
      padding: 20rpx 30px 2rem 4em;
      margin: 40rpx;
      font-size: 24px;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('replace pixel values with px / opts.divisor', async () => {
    const result = await run(`.title4 {
      padding: 30px;
      margin: 40px;
    }`, {divisor: 3, decimalPlaces: 2});
    expect(result.css).toBe(`.title4 {
      padding: 10rpx;
      margin: 13.33rpx;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('replace pixel values with px * opts.multiple', async () => {
    const result = await run(`.title5 {
      padding: 30px;
      margin: 40px;
    }`, {multiple: 2});
    expect(result.css).toBe(`.title5 {
      padding: 60rpx;
      margin: 80rpx;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('replace pixel values with rem units', async () => {
    const result = await run(`.title6 {
      padding: 30px;
      margin: 40px;
    }`, {divisor: 2, decimalPlaces: 2, targetUnits: 'rem'});
    expect(result.css).toBe(`.title6 {
      padding: 15rem;
      margin: 20rem;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('work in media', async () => {
    const result = await run(`@media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
      .word {
        margin-top: 30px;
        margin-bottom: 40px;
      }

      .word-retina {
        margin-top: 50px;
        margin-bottom: 60px;
      }
    }`);
    expect(result.css).toBe(`@media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
      .word {
        margin-top: 30rpx;
        margin-bottom: 40rpx;
      }

      .word-retina {
        margin-top: 50rpx;
        margin-bottom: 60rpx;
      }
    }`);
    expect(result.warnings().length).toBe(0);
});

test('work in keyframes', async () => {
    const result = await run(`@keyframes anim {
      0% {
        width: 10px;
        height: 10px;
        font-size: 24px;
      }
      100% {
        width: 20px;
        height: 20px;
        font-size: 42px;
      }
    }`);
    expect(result.css).toBe(`@keyframes anim {
      0% {
        width: 10rpx;
        height: 10rpx;
        font-size: 24rpx;
      }
      100% {
        width: 20rpx;
        height: 20rpx;
        font-size: 42rpx;
      }
    }`);
    expect(result.warnings().length).toBe(0);
});

test('work in others', async () => {
    const result = await run(`.main {background: 12px 12rpx url('https://px.test.com/rpx/PX/pX.png')}`);
    expect(result.css).toBe(`.main {background: 12rpx 12rpx url('https://px.test.com/rpx/PX/pX.png')}`);
    expect(result.warnings().length).toBe(0);
});

test('ignore uppercase value', async () => {
    const result = await run(`.title {
      font-size: 24PX;
    }`);
    expect(result.css).toBe(`.title {
      font-size: 24PX;
    }`);
    expect(result.warnings().length).toBe(0);
});

test('ignore min value', async () => {
    const result = await run(`.title {
      font-size: 0px;
    }`);
    expect(result.css).toBe(`.title {
      font-size: 0px;
    }`);
    expect(result.warnings().length).toBe(0);
});
