#!/usr/bin/env node

const path = require('path')
const { spawn } = require('child_process')

const abs = r => path.join(__dirname, r);

const packageDirs = [
  abs('electron_app'),
  abs('email_composer'),
  abs('email_dialog'),
  abs('email_loading'),
  abs('email_login'),
  abs('email_mailbox')
]

const installModules = dir => 
  new Promise((resolve, reject) =>  {
    const cp = spawn('yarn', [], { cwd: dir });
    cp.on('exit', code => {
      code == 0
        ? resolve() 
        : reject(`failed to install modules at ${dir}. Yarn exited with code: ${code}`)
    });
  })

const installations = Promise.all(packageDirs.map(installModules));

installations.then(
  () => console.log('Installed modules successfully'), 
  err => console.error(err)
);
