# lambda-webp-converter

A function for AWS Lambda convert jpeg images uploaded on Amazon S3 to WebP. 

## How to use

1. Clone it.
  ```sh
git clone https://github.com/ikait/lambda-webp-converter.git
```

1. Set current directory to it, and install npms locally.
  ```sh
cd lambda-webp-converter
npm i -S -D
```

1. Build. The codes based on ES6 are converted to AWS Lambda compatible ES5.
  ```sh
gulp build
```
This output `./build.zip`.

1. Upload `./build.zip` to AWS Lambda.
