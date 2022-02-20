import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth'
import * as dev from './cdk-exports-dev.json'

Amplify.configure({
  mandatorySignIn: true,
  region: dev['BugStack'].region,
  userPoolId: dev['BugStack'].userPoolId,
  userPoolWebClientId: dev['BugStack'].userPoolClientId,
  endpoint: 'http://localhost:4566',
})

Auth.signUp({
  username: 'bug@test.com',
  password: '123456',
  attributes: {
    email: 'bug@test.com',
  },
})
