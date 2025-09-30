# Run tests
```
cd package
npm run test
```

# Publish nodehive-js on npm

```
# go into the package folder
cd package

# https://docs.npmjs.com/cli/v8/commands/npm-publish
# update package/package.json with new version number
npm version 2.0.0-beta.1

npm login

# if it's a beta release
npm publish . --tag beta

# if new latest release
npm publish

# if something went wrong
npm unpublish nodehive-js@2.0.0

```