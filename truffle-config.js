const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const mnemonic = process.env.MNEMONIC
const url = process.env.RPC_URL

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, url)
      },
      network_id: '42',
      skipDryRun: true
    },
    mine_kovan: {
      provider: function(){
        return new HDWalletProvider(
          [process.env.PRIVATE_KEY], 
          `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_DEV_KEY}`
        )
      },
      network_id: 42,
      skipDryRun: true
    }
   },

  compilers: {
    solc: {
      version: "0.8.4" 
    }
  }
};
