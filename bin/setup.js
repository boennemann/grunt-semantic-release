#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var inquirer = require('inquirer');

var setup = require('../util/setup');

function notEmpty(input) {
  return input ? true : 'This shouldn\'t be empty';
}

function npmCredentials() {
  var npmrc = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.npmrc');
  if (!npmrc) {
    return {};
  }
  var npmrcContent = fs.readFileSync(npmrc)+'';
  var credentials = {};
  npmrcContent.split('\n').forEach(function(line) {
    var data = line.split(' = ');
    if (data[0] === '_auth') {
      credentials.token = data[1];
    }
    if (data[0] === 'email') {
      credentials.email = data[1];
    }
  });
  return credentials;
}

function npmEmail() {
  return npmCredentials().email;
}

function npmToken() {
  return npmCredentials().token;
}

var questions = [
  {
    type: 'password',
    name: 'gitubToken',
    message: 'Please enter a GitHub token that has push access to this repo',
    validate: notEmpty
  },
  {
    type: 'prompt',
    name: 'npmEmail',
    message: 'Please enter your npm email.',
    validate: notEmpty,
    default: npmEmail

  },
  {
    type: 'password',
    name: 'npmToken',
    message: 'Please enter your npm token.',
    validate: notEmpty,
    default: npmToken
  }

];

inquirer.prompt(questions, setup);
