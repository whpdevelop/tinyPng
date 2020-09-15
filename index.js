
const fs = require("fs");
const path = require('path')
const tinify = require("tinify");
tinify.key = "5TC6wxqfk4LrZ1RHPJHlQjyyqQhQdZyF";

let sourceDir = 'sourceImgs/';
let targetDir = 'targetImgs/';

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

let main = async (dirPath) => {
    // 读取图片源文件夹中第一层目录或文件
    let [err , dirArr] = await awaitWraper(readDirFn(path.join(__dirname,dirPath)))
    if(err) return console.log(`读取图片目录失败:${err}`)
    // 遍历得到的数据
    dirArr.forEach(async (item) =>{
        // 判断是 file or dir
        let [err, type] = await awaitWraper(statFn(path.join(__dirname,dirPath,item)))
        if(err) return console.log(`判断文件或目录失败:${err}`)
        // 如果是目录 递归
        if(type === 'dir') {
            let [err, res] = await awaitWraper(mkDirFn(path.join(sourceDir + item).replace(sourceDir,targetDir)))
            if(err) return console.log(`创建目录失败:${err}`)
            return main(path.join(sourceDir + item))
        }
        if(type === 'file') {
           // 获取文件压缩前的大小
           let {size:starSize} = fs.statSync(path.join(__dirname,dirPath,item))
           // 读取将要压缩的图片
           let [ err, readRes ] = await awaitWraper(readFn(path.join(__dirname,dirPath,item)))
           if(err) return console.log('读取图片文件失败！')
           if(!item.includes('.png') && !item.includes('.jpg')){
                let [ error, res] = await awaitWraper(writeFn(path.join(__dirname,dirPath,item).replace(sourceDir,targetDir),readRes))
                if(error) return console.log('写入非图片文件失败:' + error)
                return console.log(
                    ` 
                      非图片文件写入成功:
                      ${path.join(dirPath,item).replace(sourceDir,targetDir)}
                     `.unSpace()
                )
           }
           // 进行压缩
           tinify.fromBuffer(readRes).toBuffer(async (err, resultData) => {
              if(err) return console.log('tinify:图片压缩失败！' + path.join(__dirname,dirPath,item))
              //  压缩完毕存储图片
              let [ error, res] = await awaitWraper(writeFn(path.join(__dirname,dirPath,item).replace(sourceDir,targetDir),resultData,'binary'))
              if(error) return console.log('写入图片文件失败:' + error)
              // 获取文件压缩后的大小
              let endSize = fs.statSync(path.join(__dirname,dirPath,item).replace(sourceDir,targetDir)).size
              console.log(
                  ` 
                    压缩成功:
                    ${path.join(dirPath,item).replace(sourceDir,targetDir)}
                    ${(starSize/1024).toFixed(2)} KB => ${(endSize/1024).toFixed(2)} KB
                   `.unSpace()
              )
           })
        }
    })
}
main(sourceDir)

