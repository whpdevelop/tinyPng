
const fs = require("fs");
const path = require('path')
const tinify = require("tinify");

tinify.key = "ZPbm6W7qxSJlqZWzRnZf6Q5pJ1C2BmBS";
tinify.key = 'NNTbvCVh60sSlR5kQyqNnJ4fvZztBsH8';
tinify.key = 'wK4KntpDBYYjcTkhM2g1bcF2bGfKR4fQ';
tinify.key = 'Kp18lq72QcVR8blR8PDnLL1qwqLvs5cq';

/**
 * @des 去除模板字符串中的多个空格
 */
String.prototype.unSpace =function () {
    return this.replace(/\s{2,100}/g,"\n")
}
/**
 * 
 * awaitWraper 
 * @des 
 * promise 返回数据处理
 */
let awaitWraper = (promise) => {
    return promise.then((res) => [null, res])
    .catch((err) => [err, null])
}

/**
 * @dec 读文件
 * @param {} filePath
 */
let readFn = (filePath) => {
    return new Promise((resolve,reject) => {
        fs.readFile(filePath, (err, data) => {
            if(err) return reject(err)
            resolve(data)
        });
    })
}
/**
 * @dec 写文件
 * @param {} filePath
 */
let writeFn = (filePath,data,type='utf-8') => {
    return new Promise((resolve,reject) => {
        fs.writeFile(filePath,data,type ,(err, data) => {
            if(err) return reject(err)
            resolve(data)
        });
    })
}
/**
 * @dec 读目录
 * @param {*} dirPath 
 */
let readDirFn = (dirPath)=>{
    return new Promise((resolve,reject)=>{
        fs.readdir(dirPath,function(err,files){
            if(err) return reject(err);
            resolve(files)
        });
    })
}
/**
 * @dec 创建目录
 * @param {*} dirPath 
 */
let mkDirFn = (dirPath)=>{
    return new Promise((resolve,reject)=>{
        fs.mkdir(dirPath,function(err){
            if(err) return reject(err);
            resolve('ok')
        });
    })
}

/**
 * @dec 判断文件的状态，用于区分文件名/文件夹
 * @param {*} param 
 */
let statFn = (param) => {
    return new Promise((resolve,reject)=>{
        fs.stat(param,function(err,status){
            if(err) return reject(`判断文件的状态:${err}`);
            //是文件
            // let isFile = status.isFile();
            //是文件夹
            let isDir = status.isDirectory();
            resolve(isDir?'dir':'file')
        });
    })
}
/**
 * 
 * @param {文件名} param 
 */
let isImg = (param) => {
    if(param.endsWith('.png') || param.endsWith('.jpg'))
        return true
    else 
        return false
}
/**
 * 
 * @param {图片路径} imgPtah 
 */
let handleImg = async (imgPtah) =>{
 // 获取文件压缩前的大小
 let {size:starSize} = fs.statSync(imgPtah)
 // 判断是否是图片
 if(!isImg(imgPtah)) return

 // 读取将要压缩的图片
 let [ err, readRes ] = await awaitWraper(readFn(imgPtah))
 if(err) return console.log('读取图片文件失败！')
 // 进行压缩
 tinify.fromBuffer(readRes).toBuffer(async (err, resultData) => {
    if(err) {
      return console.log(
          `tinify:图片压缩失败！
           path:${imgPtah}
           ${err}
           `.unSpace()
      )
    }
    //  压缩完毕覆盖图片
    let [ error, res] = await awaitWraper(writeFn(imgPtah,resultData,'binary'))
    if(error) {
      return console.log(
          `
          图片压缩成功覆盖失败: 
          ${error}
          `
      )
    }
    // 获取文件压缩后的大小
    let endSize = fs.statSync(imgPtah).size
    console.log(
        ` 
          压缩覆盖成功:
          ${imgPtah}
          ${(starSize/1024).toFixed(2)} KB => ${(endSize/1024).toFixed(2)} KB
         `.unSpace()
    )
 })
}

let main = async (dirPath) => {
    console.log('开始进行压缩')
    // 读取图片源文件夹中第一层目录或文件
    let [err , dirArr] = await awaitWraper(readDirFn(dirPath))
    if(err) return console.log(`读取${dirPath}目录失败:${err}`)
    // 遍历得到的数据
    dirArr.forEach(async (item) =>{
        // 判断是 file or dir
        let [err, type] = await awaitWraper(statFn(path.join(dirPath,item)))
        if(err) 
        {
            return console.log(
                `判断文件或目录失败:
                 ${err}
                `.unSpace()
            )
        }
        if(type === 'dir'){
            main(`${dirPath}/${item}`)
        }
        else if(type === 'file') {
            handleImg(path.join(dirPath,item))
        }
    })
}

process.stdin.setEncoding('utf8');
console.log(
    `
    请输入要压缩图片的路径:
    (注意:不要重复压缩，以免浪费压缩次数)
    `.unSpace()
)
process.stdout.write('=>');
process.stdin.on("data", (input) => {
    if(input.trim()){
        main(input.trim())
    } else {
        console.log('路径无效！')
    }
    process.stdin.emit('end');
})