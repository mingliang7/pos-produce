module.exports = {
  servers: {
    one: {
      host: '52.43.19.193',
      username: 'ubuntu',
      pem: "/home/kevin/Downloads/original-pos.pem"
      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },

  meteor: {
    name: 'Cement',
    path: '../cement',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      PORT: 8080,
      ROOT_URL: 'http://52.43.19.193:8080',
      MONGO_URL: 'mongodb://localhost/cement'
    },
    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 60
  },
  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};