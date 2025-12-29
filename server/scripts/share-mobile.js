import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console
const cyan = '\x1b[36m%s\x1b[0m';
const green = '\x1b[32m%s\x1b[0m';
const yellow = '\x1b[33m%s\x1b[0m';
const red = '\x1b[31m%s\x1b[0m';

console.log(cyan, '🚀 Starting CountCalory Mobile Share Mode (SSH Powered)...');

// Helper to start SSH tunnel and capture URL
function startSshTunnel(port, name) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Creating secure tunnel for ${name} (Port ${port})...`);
    
    // Using pinggy.io as it provides stable URLs and works well on Windows
    // Alternative: localhost.run
    const ssh = spawn('ssh', [
      '-p', '443',
      '-R0:localhost:' + port,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=60',
      'a.pinggy.io'
    ]);

    let url = null;
    let buffer = '';

    ssh.stdout.on('data', (data) => {
      const text = data.toString();
      buffer += text;
      
      // Pinggy outputs URL like: https://ran-dom-name.a.pinggy.io
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.a\.pinggy\.io/);
      if (match && !url) {
        url = match[0];
        resolve({ url, process: ssh });
      }
    });

    ssh.stderr.on('data', (data) => {
      // ssh often outputs to stderr for info
      const text = data.toString();
      // console.log(`[SSH ${name}]`, text); 
    });

    ssh.on('close', (code) => {
      if (!url) reject(new Error(`SSH tunnel for ${name} closed unexpectedly with code ${code}`));
    });

    // Timeout if no URL after 15 seconds
    setTimeout(() => {
      if (!url) {
        ssh.kill();
        reject(new Error(`Timeout waiting for ${name} tunnel URL`));
      }
    }, 15000);
  });
}

async function run() {
  try {
    // 1. Start Backend Tunnel (Port 4000)
    const apiTunnel = await startSshTunnel(4000, 'Backend');
    console.log(green, `✅ Backend exposed at: ${apiTunnel.url}`);

    // 2. Start Backend Server
    console.log('🔄 Starting Backend Server...');
    const backend = spawn('node', ['server.js'], { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DB_MODE: 'atlas' } 
    });

    // 3. Start Frontend Tunnel (Port 5173)
    const frontendTunnel = await startSshTunnel(5173, 'Frontend');
    console.log(green, `✅ Frontend exposed at: ${frontendTunnel.url}`);

    // 4. Start Frontend Server (Vite)
    console.log('🔄 Starting Frontend Server...');
    const frontend = spawn('npm', ['run', 'dev'], { 
      cwd: path.join(__dirname, '../../client'),
      stdio: 'inherit',
      shell: true,
      env: { 
        ...process.env, 
        VITE_API_URL: `${apiTunnel.url}/api` 
      }
    });

    console.log(yellow, '\n⚠️  IMPORTANT INSTRUCTIONS ⚠️');
    console.log(yellow, '1. Open this URL on your mobile: ' + frontendTunnel.url);
    console.log(yellow, '2. NO PASSWORD REQUIRED!');
    console.log(yellow, '3. Enjoy CountCalory on mobile!\n');

    // Cleanup on exit
    const cleanup = () => {
      apiTunnel.process.kill();
      frontendTunnel.process.kill();
      backend.kill();
      frontend.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    console.error(red, '❌ Error starting tunnels:', error.message);
    console.log(yellow, '💡 Tip: Check your internet connection or firewall settings.');
    process.exit(1);
  }
}

run();