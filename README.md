# lambda-js-prerender

![git Version](https://img.shields.io/github/package-json/v/nuxy/lambda-js-prerender?style=flat-square&svg=true&label=git+package) [![Build Status](https://api.travis-ci.com/nuxy/lambda-js-prerender.svg?branch=master)](https://app.travis-ci.com/github/nuxy/lambda-js-prerender)

AWS [CloudFront Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) serverless JavaScript [prerenderer](https://github.com/prerender/prerender).

## Features

- Ability to prerender SPA (Single-page application) pages for SE0
- Ability to create screenshots of dynamic pages for testing.
- Serverless function, scales [on a tight budget](https://s3.amazonaws.com/lambda-tools/pricing-calculator.html).
- Can be set-up easily (in minutes).

## Dependencies

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org)

### Get the [Chromium](https://opensource.google/projects/chromium) binary

    $ wget -c https://github.com/nuxy/chromium-lambda-build/releases/download/0.0.1/headless_shell.tar.gz -O - | tar -xz

## Deploying to AWS

    $ ./deploy --profile <AWS credentials profile>

The following operations are orchestrated by AWS [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) during execution:

- Docker container image is created and uploaded to AWS [Elastic Container Registry](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html).
- AWS [Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) function is created with a configured [Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) endpoint.
- AWS [CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) distribution is created using the new function as origin.
- Network routing occurs thereby exposing your Lambda function URL

## Invoking the service

### Command-line

```sh
curl -X 'POST' \
  'https://<url-id>.lambda-url.<region>.on.aws' \
  -H 'Accept: text/html' \
  -H 'Content-Type: application/json' \
  -d '{"url": "<site-url>", "image": <boolean>}'
```

### In Node.js

```js
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({region: '<region>'});

const params = {
  FunctionName: 'PrerenderApi',
  InvocationType: 'RequestResponse',
  LogType: 'Tail',
  Payload: JSON.stringify({
    url: '<site-url>',
    image: <boolean>
  })
};

lambda.invoke(params).promise()
  .then(function({Payload}) {
    console.log(Payload?.body));
  })
  .catch(function(err) {
    console.warn(err.message);
    throw err;
  });
```

## AWS requirements

In order to successfully deploy your application you must have [set-up your AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/gs-cli.html) and have [created an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the following [policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage.html):

- [IAMFullAccess](https://console.aws.amazon.com/iam/home#/policies/arn%3Aaws%3Aiam%3A%3Aaws%3Apolicy%2FIAMFullAccess)
- [CloudFrontFullAccess](https://console.aws.amazon.com/iam/home#/policies/arn%3Aaws%3Aiam%3A%3Aaws%3Apolicy%2FCloudFrontFullAccess)
- [AWSCloudFormationFullAccess](https://console.aws.amazon.com/iam/home#/policies/arn%3Aaws%3Aiam%3A%3Aaws%3Apolicy%2FAWSCloudFormationFullAccess)
- [AWSLambda_FullAccess](https://console.aws.amazon.com/iam/home#/policies/arn%3Aaws%3Aiam%3A%3Aaws%3Apolicy%2FAWSLambda_FullAccess)
- [AmazonEC2ContainerRegistryFullAccess](https://us-east-1.console.aws.amazon.com/iam/home#/policies/arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess)

WARNING: The policies above are provided to ensure a successful application deployment.  It is recommended that you adjust these policies to meet the security requirements of your Lambda application.  They should NOT be used in a Production environment.

## Developers

### CLI options

Run [ESLint](https://eslint.org/) on project sources:

    $ npm run lint

Generate [Swagger](https://swagger.io) OpenAPI definitions:

    $ npm run genapi

Run [Mocha](https://mochajs.org) unit tests:

    $ npm run test

## Performance

Running in Lambda there is overhead that occurs ([cold start](https://docs.aws.amazon.com/lambda/latest/operatorguide/execution-environments.html)) when the environment is first launched.  This overhead does not include [headless shell](https://github.com/nuxy/chromium-lambda-build) initialization which creates its own latency.  Due to this, you can expect a longer response time for the first request.  As long as there is an active Lambda handler (hot start) all subsequent requests will not incurr this overhead.

## References

- [Setting IAM Permissions and Roles](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-permissions.html)
- [Scaling and concurrency in Lambda](https://docs.aws.amazon.com/lambda/latest/operatorguide/scaling-concurrency.html)
- [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html)
- [chromium-lambda-build](https://github.com/nuxy/chromium-lambda-build)
- [content_switches.cc](https://source.chromium.org/chromium/chromium/src/+/main:content/public/common/content_switches.cc?q=kDisableGpu&ss=chromium)

## Versioning

This package is maintained under the [Semantic Versioning](https://semver.org) guidelines.

## License and Warranty

This package is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose.

_lambda-js-prerender_ is provided under the terms of the [MIT license](http://www.opensource.org/licenses/mit-license.php)

[AWS](https://aws.amazon.com) is a registered trademark of Amazon Web Services, Inc.

## Author

[Marc S. Brooks](https://github.com/nuxy)
