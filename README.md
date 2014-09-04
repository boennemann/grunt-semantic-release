# grunt-semantic-release
[![Build Status](https://travis-ci.org/boennemann/grunt-semantic-release.svg)](https://travis-ci.org/boennemann/grunt-semantic-release)
[![Dependency Status](https://david-dm.org/boennemann/grunt-semantic-release.svg)](https://david-dm.org/boennemann/grunt-semantic-release)
[![devDependency Status](https://david-dm.org/boennemann/grunt-semantic-release/dev-status.svg)](https://david-dm.org/boennemann/grunt-semantic-release#info=devDependencies)

![grunt-semantic-release](https://cloud.githubusercontent.com/assets/908178/3786831/72e2b5ea-19e7-11e4-9ad2-b382adb4dea8.png)

Using this plugin it is possible to release a new version with just `grunt release`.

This will
- ,based on changes made, determine the correct semantic version to release. (Yes the checkboxes are prechecked for you).
- generate a changelog using [conventional-changelog](https://www.npmjs.org/package/conventional-changelog)
- only release code that doesn't fail it's tests.
- generate the release on TravisCI, rather than on a local, error-prone machine.
- publish the new version to npm and GitHub Releases.

Here is an [example release](https://github.com/hoodiehq/hoodie-cli/releases/tag/v0.5.5).

## Usage

- `grunt release`: suggests correct version
- `grunt release:patch`: 0.0.1 => 0.0.2
- `grunt release:minor`: 0.0.2 => 0.1.0
- `grunt release:major`: 0.1.0 => 1.0.0
- `grunt release --setversion=4.12.3-alpha.19`: 1.0.0 => 4.12.3-alpha.19

## Getting Started
If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-semantic-release --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-semantic-release');
```

## Setup

This task comes with a setup script. You should be good to go after running this.

```shell
./node_modules/.bin/setup
```

## The "release" task

### Overview
In your project's Gruntfile, add a section named `release` to the data object passed into `grunt.initConfig()`.

Example configuration:
```js
grunt.initConfig({
  release: {
    bump: {
      commitMessage: 'Released v%VERSION%'
    },
    email: 'stephan@boennemann.me',
    name: 'Stephan Bönnemann',
    payload: function(payload, cb) {
      payload.body += '\nvery release'
      payload.body += '\n     such consistent'
      payload.body += '\n  much information'
      payload.body += '\nwow'
      cb(payload);
    }
  }
})
```

### Options

#### email
Type: `Array<String>`
*required*

The email used for git commits.

#### name
Type: `Array<String>`
*required*

The name used for git commits.

#### bump
Type: `Object`
*optional*
Default value:
```js
bump: {
  commitMessage: 'chore(release): v%VERSION%',
  files: ['package.json', 'bower.json', 'component.json'],
  commitFiles: ['-a'],
  pushTo: 'origin master'
}
```

The options object that gets (partly) forwarded to the [grunt-bump](https://github.com/vojtajina/grunt-bump) task.

The task relies on some options for grunt-bump, but there shouldn't be a need to configure this anyways. E.g. when there is a `bower.json` file present in the file system it is added to the files array automatically.

#### tasks
Type: `Array<String>`
*optional*
Default value: `['changelog']`

A list of tasks that prepare files for the release commit.
Per default the changelog is generated here, but you can do other stuff like minifying a distribution build, generating a list of contributors – basically everything you could imagine and find useful. 

#### payload
Type: `Function`
*optional*

```js
function(payload, cb) {
  getAwesomeContextualGif(function(url) {
    payload.body += '![yo](' + url + ')';
    cb(payload);
  })
}
```

You can use this function to manipulate the [payload](https://mikedeboer.github.io/node-github/#releases.prototype.createRelease) for the GitHub release.
For example you could search the internet for an amazing gif and append it to the message body.

The `payload` object already contains information about the `repo`, `owner` and `tag_name`; the `body` is set to the current changelog. 

## Caveats
This grunt tasks is extracted from [hood.ie's](http://hood.ie) release [process](https://github.com/hoodiehq/grunt-release-hoodie) and thus tightly coupled to the tools, conventions and needs of hoodie.
Extracting this into it's own general purpose task is the first of several steps to make this more universally applicable.

Currently it is required to:
- host code on GitHub
- use Travis for CI
- adhere to the [angular commit message guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014 Stephan Bönnemann. Licensed under the MIT license.
