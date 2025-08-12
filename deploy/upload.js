const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 转换为Promise API，便于异步处理
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// 从环境变量获取配置
const { 
  COS_SECRET_ID, 
  COS_SECRET_KEY, 
  COS_BUCKET, 
  COS_REGION, 
  VERSION: REMOTE_DIR = 'default' 
} = process.env;

console.log(`上传配置: COS_BUCKET: ${COS_BUCKET}, REMOTE_DIR:${REMOTE_DIR}`);

// 初始化COS实例
const cos = new COS({
  SecretId: COS_SECRET_ID,
  SecretKey: COS_SECRET_KEY,
  retry: {
    maxRetryTimes: 3, // 最大重试次数
    retryDelay: 1000, // 重试间隔（毫秒）
  },
  // 自定义需要重试的错误（可选）
    retryableError: (err) => {
      // err 为错误对象，包含 statusCode、errorCode 等信息
      if (err.statusCode >= 500) {
        return true; // 5xx 错误重试
      }
      // 特定错误码重试（如 InternalError）
      const retryCodes = ['InternalError', 'ServiceUnavailable'];
      if (retryCodes.includes(err.errorCode)) {
        return true;
      }
      return false;
    }
});

// 本地文件夹路径（要上传的build目录）
const localDir = path.resolve(__dirname, '../build');
console.log(`本地文件夹路径: ${localDir}`);

/**
 * 递归上传文件夹
 * @param {string} localPath 本地文件夹路径
 * @param {string} cosDir COS上的目标目录（基于REMOTE_DIR）
 */
async function uploadFolder(localPath, cosDir) {
  try {
    // 读取本地目录下的所有文件/子目录
    const files = await readdir(localPath);

    for (const file of files) {
      const localFilePath = path.join(localPath, file);
      const fileStat = await stat(localFilePath);

      // 计算该文件在COS中的Key（保持目录结构）
      const cosKey = path.posix.join(cosDir, file); // 使用posix风格的路径分隔符（/）

      if (fileStat.isDirectory()) {
        // 如果是子目录，递归上传
        await uploadFolder(localFilePath, cosKey);
      } else {
        // 如果是文件，调用SDK上传
        console.log(`正在上传: ${localFilePath} -> ${cosKey}`);
        await uploadSingleFile(localFilePath, cosKey);
      }
    }

    console.log(`文件夹上传完成: ${localPath} -> ${cosDir}`);
  } catch (err) {
    console.error(`上传失败: ${err.message}`);
    throw err; // 抛出错误，让上层处理 todo 删除所有已上传的
  }
}

/**
 * 上传单个文件到COS
 * @param {string} localFilePath 本地文件路径
 * @param {string} cosKey COS中的文件Key（路径+文件名）
 */
function uploadSingleFile(localFilePath, cosKey) {
  return new Promise((resolve, reject) => {
    cos.uploadFile({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Key: cosKey,
      FilePath: localFilePath,
      SliceSize: 1024 * 1024 * 5, // 5MB以上分块上传
    }, (err, data) => {
      if (err) {
        reject(new Error(`文件 ${localFilePath} 上传失败: ${err.message}`));
      } else {
        console.log(`文件上传成功: ${cosKey}`);
        resolve(data);
      }
    });
  });
}

// 启动上传（目标目录为REMOTE_DIR，如development或production）
uploadFolder(localDir, REMOTE_DIR)
  .then(() => console.log('所有文件上传完成'))
  .catch(() => process.exit(1));
