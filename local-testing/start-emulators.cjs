// Keep emulator tools, cache and credentials separate from the real Firebase CLI profile.
const { spawn } = require('node:child_process');
const { readdirSync, existsSync } = require('node:fs');
const path = require('node:path');
const root = __dirname;
const runtime = path.join(root, 'runtime');
const java = existsSync(runtime) && readdirSync(runtime).find(name => name.startsWith('jdk-'));
const javaBin = java ? path.join(runtime, java, 'Contents', 'Home', 'bin') : '';
const args = ['emulators:start', '--config', 'local-testing/firebase.json', '--project', 'demo-meditrack', '--only', 'auth,firestore', '--import', 'local-testing/data', '--export-on-exit', 'local-testing/data'];
const child = spawn('firebase', args, { cwd: path.dirname(root), stdio: 'inherit', env: {
  ...process.env,
  PATH: javaBin ? javaBin + path.delimiter + process.env.PATH : process.env.PATH,
  XDG_CONFIG_HOME: path.join(root, 'config'),
  FIREBASE_EMULATORS_PATH: path.join(root, 'cache')
}});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
