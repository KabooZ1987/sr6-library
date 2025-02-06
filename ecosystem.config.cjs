module.exports = {
    apps: [
      {
        name: 'sr6library',
        port: '3010',
        script: './.output/server/index.mjs',
        version: '0.0.1',
        env     : {
          "NODE_ENV": "development",
          "DATABASE_URL": "postgresql://webuser:Luebeck%231@localhost:5432/webdb?schema=public",
          "NITRO_PORT": 3010
        },
        env_production : {
           "NODE_ENV": "production",
           "DATABASE_URL": "postgresql://webuser:Luebeck%231@localhost:5432/webdb?schema=public",
           "NITRO_PORT": 3010
        }
      }
    ]
  }
  