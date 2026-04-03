const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('--- Terminal Optimized Startup ---');

// Manually load .env.local because standalone mode doesn't do it automatically!
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    console.log('[0/3] Injecting Environment Security Nodes...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
        }
    });
}

console.log('[1/3] Synchronizing Styles...');
copyDir(path.join(__dirname, '.next', 'static'), path.join(__dirname, '.next', 'standalone', '.next', 'static'));

console.log('[2/3] Mapping Public Assets...');
copyDir(path.join(__dirname, 'public'), path.join(__dirname, '.next', 'standalone', 'public'));

console.log('[3/3] Launching Standalone Node...');
const server = spawn('node', [path.join(__dirname, '.next', 'standalone', 'server.js')], {
    stdio: 'inherit',
    env: process.env
});

// Run DB Optimizer in background to ensure zero-lag synchronization
console.log('[4/4] Sycing Terminal Optimization Nodes...');
spawn('node', [path.join(__dirname, 'optimize-db.js')], { stdio: 'inherit' });

server.on('close', (code) => {
    console.log(`Node exited with code ${code}`);
});
