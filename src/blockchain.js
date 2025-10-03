const SHA256 = require("crypto-js/sha256");
const Block = require("./block");

class Blockchain {
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  async initializeChain() {
    if (this.height === -1) {
      const block = new Block({ data: "Genesis Block" });
      await this._addBlock(block);
    }
  }

  // Método interno para agregar el bloque génesis sin validación
  async _addBlock(block) {
    const self = this;
    block.height = self.chain.length;
    block.time = new Date().getTime().toString();

    if (self.chain.length > 0) {
      block.previousBlockHash = self.chain[self.chain.length - 1].hash;
    }

    block.hash = SHA256(JSON.stringify({
      height: block.height,
      body: block.body,
      time: block.time,
      previousBlockHash: block.previousBlockHash
    })).toString();

    self.chain.push(block);
    self.height = self.chain.length - 1;
    
    return block;
  }

  addBlock(block) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {
        block.height = self.chain.length;
        block.time = new Date().getTime().toString();

        if (self.chain.length > 0) {
          block.previousBlockHash = self.chain[self.chain.length - 1].hash;
        }

        // Validar la cadena antes de agregar el nuevo bloque
        let errors = await self.validateChain();
        if (errors.length > 0) {
          return reject(new Error(`The chain is not valid: ${errors.map(e => e.message).join(", ")}`));
        }

        // Calcular el hash del nuevo bloque
        block.hash = SHA256(JSON.stringify({
          height: block.height,
          body: block.body,
          time: block.time,
          previousBlockHash: block.previousBlockHash
        })).toString();

        self.chain.push(block);
        self.height = self.chain.length - 1;
        
        resolve(block);
      } catch (error) {
        reject(error);
      }
    });
  }

  validateChain() {
    let self = this;
    const errors = [];

    return new Promise(async (resolve, reject) => {
      try {
        // Validar cada bloque
        for (let i = 0; i < self.chain.length; i++) {
          const block = self.chain[i];
          
          // Validar la integridad del bloque
          const isValid = await block.validate();
          if (!isValid) {
            errors.push(new Error(`Block ${block.height} has been tampered with`));
          }

          // Validar el enlace con el bloque anterior (excepto el génesis)
          if (i > 0) {
            const previousBlock = self.chain[i - 1];
            if (block.previousBlockHash !== previousBlock.hash) {
              errors.push(new Error(`Block ${block.height} has invalid previousBlockHash`));
            }
          }
        }

        resolve(errors);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Método adicional: obtener bloque por altura
  getBlockByHeight(height) {
    return new Promise((resolve, reject) => {
      if (height < 0 || height >= this.chain.length) {
        reject(new Error("Block height out of bounds"));
      } else {
        resolve(this.chain[height]);
      }
    });
  }

  // Método adicional: obtener bloque por hash
  getBlockByHash(hash) {
    return new Promise((resolve, reject) => {
      const block = this.chain.find(b => b.hash === hash);
      if (block) {
        resolve(block);
      } else {
        reject(new Error("Block not found"));
      }
    });
  }

  print() {
    let self = this;
    console.log("\n========== BLOCKCHAIN ==========\n");
    for (let block of self.chain) {
      console.log(block.toString());
    }
    console.log(`\nTotal blocks: ${self.chain.length}`);
    console.log(`Chain height: ${self.height}\n`);
  }
}

module.exports = Blockchain;