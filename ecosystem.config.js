module.exports = {
  apps: [{
    name: "logsphere-server",
    script: "index.js",
    cwd: "./server",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    env_production: {
      NODE_ENV: "production"
    },
    watch: false,
    max_memory_restart: "500M",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
