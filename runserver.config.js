module.exports = {
  apps: [
    {
      name: "solistic-lst-fe",
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
	      PORT: 3000
      },
      max_memory_restart: "512M",
      watch: false,
      ignore_watch: ["node_modules"],
      autorestart: true,
      min_uptime: "60s",
      max_restarts: 3,
    },
  ],
}