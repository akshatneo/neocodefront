module.exports = {
  apps: [
    {
      name: 'neocodefront',
      cwd: '/home/ubuntu/neocodefront',
      script: 'npx serve -s dist -l 4000',
      error_file: '/var/log/neocodefront/expresserror.log',
      out_file: '/var/log/neocodefront/express.log',
    },
  ],
}
