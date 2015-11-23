import "core-js";
import path from "path";
import mime from "mime-types";


import AWS from "./index.js";


export default class S3 {
    constructor() {
        this.s3 = new AWS.S3();
        return this;
    }

    /**
     * S3 から key で指定した object を get し、その値が含まれる Promise をかえす。
     * 失敗すると Promise.reject() する。
     *
     * @param key
     * @param bucket
     * @returns {Promise}
     */
    get(key, bucket) {
        return new Promise((resolve, reject) => {
            console.log(`[get] ${S3.uriString(bucket, key)}`);
            this.s3.getObject({Bucket: bucket, Key: key}, (error, data) => {
                if (error) {
                    console.log(`Error getting ${S3.uriString(bucket, key)}`);
                    console.log(error, error.stack);
                    return reject(error);
                } else {
                    return resolve(data.Body);
                }
            });
        });
    }

    /**
     * S3 から keys で指定したすべての object を get し、その値を含む Map が含まれる Promise をかえす。
     * 一つでも失敗すると Promise.reject() する。
     *
     * @param keys []
     * @param bucket
     * @returns {Promise}
     */
    getAll(keys, bucket) {
        return new Promise((resolve, reject) => {
            console.log("[getAll]", keys);
            let map = new Map();
            return Promise.all(keys.map(key =>
                this.get(key, bucket)
                    .then(buffer =>
                        map.set(key, buffer))
                    .catch(error =>
                        reject(error))))
                .then(() =>
                    resolve(map))
                .catch(error =>
                    reject(error));
        });
    }

    /**
     * S3 へ指定した key で put し、結果を含む Promise をかえす。
     * 失敗すると Promise.reject() する。
     *
     * @param body
     * @param key
     * @param bucket
     * @returns {Promise}
     */
    put(body, key, bucket) {
        return new Promise((resolve, reject) => {
            console.log(`[put] ${S3.uriString(bucket, key)}`);
            this.s3.upload({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: mime.contentType(path.extname(key))
            }, (error, data) => {
                if (error) {
                    console.log(error, error.stack, data);
                    return reject(error);
                } else {
                    return resolve(`Success put ${key} to ${bucket}.`);
                }
            });
        });
    }

    /**
     * S3 上に指定した key が存在しているかを調べる。boolean を含む Promise をかえす。
     *
     * @param key
     * @param bucket
     * @returns {Promise}
     */
    exists(key, bucket) {
        return new Promise(resolve => {
            this.s3.headObject({Bucket: bucket, Key: key}, error => {  // TODO: エラー処理
                resolve(!error);
            });
        });
    }

    /**
     * 指定した Prefix, bucket に合致する key を__すべて__含んだ Set をかえす。
     * aws-sdk の listObjects では 1000 件までしか取得できないので、1000 件以上一度に取得したい場合使用する。
     *
     * @param prefix
     * @param bucket
     * @returns {Promise}  key の Set を含む。
     */
    listKeys(prefix, bucket) {
        console.log("[listKeys]", S3.uriString(bucket, prefix));
        return new Promise((resolve, reject) => {
            let keys = [];
            let list = (innerPrefix, innerBucket, marker="") => {
                this.s3.listObjects({
                    Prefix: innerPrefix,
                    Bucket: innerBucket,
                    Marker: marker
                }, (error, data) => {
                    if (error) {
                        reject(error);
                    }
                    data.Contents.forEach(content => keys.push(content.Key));
                    if (data.IsTruncated) {
                        list(innerPrefix, innerBucket, keys[keys.length - 1]);
                    } else {
                        resolve(new Set(keys));
                    }
                });
            };
            list(prefix, bucket);
        });
    }

    /**
     * S3 uri を作ってかえす。
     *
     * @param bucket
     * @param key
     * @returns string
     */
    static uriString(bucket, key) {
        return `s3://${bucket}/${key}`;
    }
}
