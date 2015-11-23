import AWS from "aws-sdk";
import config from "../../config.js";


AWS.config.region = config.aws.region;

if ("accessKeyId" in config.aws && "secretAccessKey" in config.aws) {
    AWS.config.update({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    });
}

export default AWS;
