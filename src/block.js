const SHA256 = require("crypto-js/sha256");
const hex2ascii = require("hex2ascii");

class Block {
  constructor(data) {
    this.hash = null;
    this.height = 0;
    // Corrección: Encoding correcto del body
    this.body = Buffer.from(JSON.stringify(data)).toString("hex");
    this.time = 0;
    this.previousBlockHash = null;
  }

  validate() {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        // Guardar el hash actual
        const currentHash = self.hash;
        
        // Recalcular el hash sin incluir el hash actual
        const recalculatedHash = SHA256(JSON.stringify({
          height: self.height,
          body: self.body,
          time: self.time,
          previousBlockHash: self.previousBlockHash
        })).toString();

        // Comparar hashes
        if (currentHash !== recalculatedHash) {
          return resolve(false);
        }

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlockData() {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        // Decodificar el body de hex a string
        let decodedData = hex2ascii(self.body);
        let dataObject = JSON.parse(decodedData);

        // Verificar si es el bloque génesis
        if (dataObject.data && dataObject.data === "Genesis Block") {
          return reject(new Error("This is the Genesis Block"));
        }

        resolve(dataObject);
      } catch (error) {
        reject(error);
      }
    });
  }

  toString() {
    const { hash, height, body, time, previousBlockHash } = this;
    return `Block -
        hash: ${hash}
        height: ${height}
        body: ${body}
        time: ${time}
        previousBlockHash: ${previousBlockHash}
        -------------------------------------`;
  }
}

module.exports = Block;