module.exports = {
  apps: [{
    name: 'ton618-web',
    script: 'serve',
    args: ['-s', 'dist', '-l', '3000', '-n'],
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000
  }]
};
