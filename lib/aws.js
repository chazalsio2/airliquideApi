import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export function uploadFile(fileName, fileData, contentType) {
  const cleanFileDataSplit = fileData.split(",");
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: new Buffer(cleanFileDataSplit[1], "base64"),
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: contentType,
  };

  return new Promise(function (resolve, reject) {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
}
