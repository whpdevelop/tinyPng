### 图片压缩功能
 
`基于node & tinypng插件实现的图片压缩程序`

- 使用
  + 安装依赖
  + 将要压缩的图片放大 ***sourceImgs*** 文件夹中（可以是dir）
  + 执行程序 `yarn start`
  + 被压缩的图片将会放到 ***targetImgs*** 目录下
  
- 说明

  `tinify.key = "你的秘钥"; 可以到官网免费申请`

- 效果

    ···
    
    压缩成功:
    targetImgs/homeImgs/index1_2.png
    6.56 KB => 3.42 KB
    
    压缩成功:
    targetImgs/homeImgs/bg_download.png
    125.59 KB => 120.17 KB
    
    压缩成功:
    targetImgs/qrcode/register.png
    
    ···