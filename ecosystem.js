module.exports = {
  apps: [
    {
      name: 'neocodefront',
      cwd: '/home/ubuntu/neocodefront',
      script: 'npm run deploy',
      error_file: '/var/log/neocodefront/expresserror.log',
      out_file: '/var/log/neocodefront/express.log',
    },
  ],
}
