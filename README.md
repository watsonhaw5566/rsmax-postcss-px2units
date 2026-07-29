# @rsmax/postcss-px2units

一个 [PostCSS](https://github.com/ai/postcss) 插件，用于将像素单位（px）转换为 rpx 或其他自定义单位。

## 功能特性

- **小写 px**：转换为目标单位（默认为 rpx）
- **大写 PX 或 Px**：保留为 px（输出时转为小写 px）
- **注释跳过**：使用注释跳过单个声明的转换
- **最小像素过滤**：小于阈值的像素值不进行转换

## 安装

```
$ npm install @rsmax/postcss-px2units --save-dev
```

## 使用方法

### 输入/输出示例

使用默认配置，将得到以下输出结果。

```css
/* 输入 */
p {
  margin: 0 0 20px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 1px; /* no */
  border: 1PX solid #ccc;
  padding: 10Px 20px;
}

/* 输出 */
p {
  margin: 0 0 20rpx;
  font-size: 32rpx;
  line-height: 1.2;
  letter-spacing: 1px;
  border: 1px solid #ccc;
  padding: 10px 20rpx;
}
```

### 使用示例

```js
var fs = require('fs');
var postcss = require('postcss');
var px2units = require('@rsmax/postcss-px2units');
var css = fs.readFileSync('main.css', 'utf8');
var options = {
  targetUnits: 'rem',
  divisor: 100
};
var processedCss = postcss([px2units(options)]).process(css).css;

fs.writeFile('main-rem.css', processedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('Rem 文件写入完成。');
});
```

### 配置项 options

类型：Object | Null

默认值：

```js
{
  divisor: 1,
  multiple: 1,
  decimalPlaces: 2,
  targetUnits: 'rpx',
  comment: 'no',
  minPixelValue: 0
}
```

配置说明：

- **divisor** (Number)：除数，像素值转换公式为 `像素值 * multiple / divisor`。
- **multiple** (Number)：乘数，像素值转换公式为 `像素值 * multiple / divisor`。
- **decimalPlaces** (Number)：保留的小数位数。例如，CSS 代码 `width: 100px`，转换后的值为 `Number(100 / divisor * multiple).toFixed(decimalPlaces)`。
- **targetUnits** (String)：目标单位，用于替换像素单位，可设置为 'rem'、'em'、'vw' 等。
- **comment** (String)：默认值为 'no'。例如，如果设置为 '不转换'，CSS 代码 `width: 100px; /* 不转换 */` 将被转换为 `width: 100px;`，同时注释会被移除。
- **minPixelValue** (Number)：最小转换像素值。如果像素值小于该值，则不会被转换。默认为 0，表示所有值都会被转换。

### 配合 gulp-postcss 使用

```js
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var px2units = require('@rsmax/postcss-px2units');

gulp.task('css', function () {
  return gulp.src('./test/src/css/**/*.css')
    .pipe(postcss([px2units()]))
    .pipe(gulp.dest('./test/dist/css'));
});
```

### 使用 minPixelValue 配置

```js
var px2units = require('@rsmax/postcss-px2units');

var options = {
  minPixelValue: 2
};
```

```css
/* 输入 */
.icon {
  width: 1px; /* 小于 2，不转换 */
  height: 2px; /* 会转换 */
  margin: 3px; /* 会转换 */
}

/* 输出 */
.icon {
  width: 1px;
  height: 2rpx;
  margin: 3rpx;
}
```
