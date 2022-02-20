# Localstack Custom Email Sender Bug

## Steps to reproduce

1. Run localstack: `docker run --rm -it -p 4566:4566 -p 4571:4571 -e LOCALSTACK_API_KEY=api_key -e DEBUG=1 localstack/localstack`
2. Install dependencies: `npm run setup`
3. Create Localstack stack: `npm run cdk-local-stack`
4. Run `npm run test-bug` to see the bug in console.
