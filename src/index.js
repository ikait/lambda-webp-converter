import "core-js";
import path from "path";

import S3 from "./classes/aws/S3.js";
import ImageConverter from "./classes/ImageConverter.js";

import config from "./config.js";


export function handler(event, context) {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const keyExt = path.extname(key);
    const keyWebp = key.replace(keyExt, ".webp");

    // check if key triggered event is image
    if (config.image.source.extentions.indexOf(keyExt.slice(1)) == -1) {
        context.fail(`${key} seems not to be image file.`);
        return;
    } else {
        console.log(`Start converting to WebP. ${S3.uriString(bucket, key)}`);
    }

    const s3 = new S3();

    return s3.get(key, bucket)
        .then(data =>
            new ImageConverter(data))
        .then(ic =>
            ic.getWebpAsync())
        .then(webp =>
            s3.put(webp, keyWebp, bucket))
        .then(() =>
            context.succeed(`Succeed. ${S3.uriString(bucket, keyWebp)}`))
        .catch(error =>
            context.fail(error))
}
