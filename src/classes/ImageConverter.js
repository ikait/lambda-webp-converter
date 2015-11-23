import fs from "fs";
import path from "path";
import "core-js";
import { CWebp } from "cwebp";

import config from "../config.js";


if (!fs.existsSync("/usr/local/bin/cwebp")) {
    const RESOURCES_DIR = path.join(__dirname, "resources");
    process.env.PATH += `:${RESOURCES_DIR}`;
    process.env.LD_LIBRARY_PATH += `:${RESOURCES_DIR}`;
}


export default class ImageConverter {
    constructor(data) {
        this.data = data;
        return this;
    }

    getWebpAsync(quality=config.image.quality, preset=config.image.preset) {
        return new Promise((resolve, reject) => {
            let webp = new CWebp(this.data);
            webp.quality(quality);
            webp.preset(preset);
            webp.toBuffer()
                .then(buffer =>
                    resolve(buffer))
                .catch(error =>
                    reject(error));
        });
    }
};
