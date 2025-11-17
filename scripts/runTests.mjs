import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const nodeArgs = [
  '--experimental-vm-modules',
  '--require',
  path.resolve('tests', 'localstorage-polyfill.cjs')
];

const jestBin = path.resolve('node_modules', 'jest', 'bin', 'jest.js');
const env = { ...process.env, NODE_ENV: process.env.NODE_ENV || 'test' };

const child = spawn(process.execPath, [...nodeArgs, jestBin, '--runInBand'], {
  stdio: 'inherit',
  env
});

child.on('exit', (code) => {
  process.exit(code);
});
