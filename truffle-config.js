const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    kovan: {
      provider: function(){
        return new HDWalletProvider(
          [process.env.PRIVATE_KEY], 
          `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_DEV_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 42
    }
   },

  compilers: {
    solc: {
      version: "0.8.4" 
    }
  }
};
