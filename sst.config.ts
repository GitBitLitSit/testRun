/// <reference path="./.sst/platform/config.d.ts" />

import { env } from "./.sst/platform/src/components";

export default $config({
  app(input) {
    return {
      name: "billiard-club",
      home: "aws",
      providers: {
        aws: { region: "eu-west-1", profile: process.env.AWS_PROFILE },
      },
    };
  },

  async run() {
    const api = new sst.aws.ApiGatewayV2("Api");

    api.route("POST /members", {
      handler: "./src/packages/functions/createMember.handler",
      environment: {
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
        MONGODB_URI: process.env.MONGODB_URI!,
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME!,
        SES_SENDER_EMAIL: process.env.SES_SENDER_EMAIL!,
      },
      architecture: "arm64",
      runtime: "nodejs22.x",
      // CHANGE 1: Remove the manual 'role'
      // role: process.env.AWS_LAMBDA_ROLE, 
      
      // CHANGE 2: Add permissions for SES explicitly here
      permissions: [
        {
          actions: ["ses:SendEmail", "ses:SendRawEmail"],
          resources: ["*"] 
        }
      ]
    });

    api.route("POST /admin/login", {
      handler: "./src/packages/functions/adminLogin.handler",
      environment: {
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
        ADMIN_USERNAME: process.env.ADMIN_USERNAME!,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
      },
      architecture: "arm64",
      runtime: "nodejs22.x",
    });
  }
});