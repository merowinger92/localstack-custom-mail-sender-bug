import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib'
import {
  AccountRecovery,
  ClientAttributes,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from 'aws-cdk-lib/aws-cognito'
import { Key } from 'aws-cdk-lib/aws-kms'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'

export class BugStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // create needed KMS Key
    const customSenderKmsKeyAlias = 'bug-stack-alias'
    const customSenderKmsKey = new Key(this, 'custom-mail-sender-key', {
      alias: customSenderKmsKeyAlias,
      description: `KMS Key to show bug`,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // create custom E-Mail Sender Function
    const customEmailSenderTrigger = new NodejsFunction(
      this,
      'custom-email-sender',
      {
        architecture: Architecture.ARM_64,
        runtime: Runtime.NODEJS_14_X,
        memorySize: 1024,
        timeout: Duration.seconds(6),
        handler: 'main',
        entry: path.join(__dirname, './lambda/index.ts'),
        bundling: {
          externalModules: ['aws-sdk'],
        },
      }
    )

    // create User Pool
    const userPool = new UserPool(this, 'userpool', {
      userPoolName: `bug-userpool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
      },

      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      customSenderKmsKey: customSenderKmsKey,
      lambdaTriggers: {
        customEmailSender: customEmailSenderTrigger,
      },
    })

    // User Pool Client Preparation
    const clientReadAttributes = new ClientAttributes().withStandardAttributes({
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    })

    const clientWriteAttributes = new ClientAttributes().withStandardAttributes(
      {
        givenName: true,
        familyName: true,
        email: true,
        emailVerified: false,
        address: true,
        birthdate: true,
        gender: true,
        locale: true,
        middleName: true,
        fullname: true,
        nickname: true,
        phoneNumber: true,
        profilePicture: true,
        preferredUsername: true,
        profilePage: true,
        timezone: true,
        lastUpdateTime: true,
        website: true,
      }
    )

    // User Pool client
    const userPoolClient = new UserPoolClient(this, 'userpool-client', {
      userPool: userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    })

    // outputs
    new CfnOutput(this, 'userPoolId', {
      value: userPool.userPoolId,
    })
    new CfnOutput(this, 'userPoolClientId', {
      value: userPoolClient.userPoolClientId,
    })
    new CfnOutput(this, 'region', {
      value: Stack.of(this).region,
    })
  }
}
