const Blockchain = require("./src/blockchain");
const Block = require("./src/block");

async function run() {
  try {
    console.log("Iniciando Blockchain...\n");
    
    // Crear la blockchain
    const blockchain = new Blockchain();
    
    // Esperar a que se inicialice (bloque génesis)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Agregar bloques
  console.log("Agregando bloques...\n");
    
  const block1 = new Block({ data: "Block #1", description: "Primer bloque de datos" });
  await blockchain.addBlock(block1);
  console.log("Block #1 agregado");

  const block2 = new Block({ data: "Block #2", description: "Segundo bloque de datos" });
  await blockchain.addBlock(block2);
  console.log("Block #2 agregado");

  const block3 = new Block({ data: "Block #3", description: "Tercer bloque de datos" });
  await blockchain.addBlock(block3);
  console.log("Block #3 agregado\n");

    // Imprimir la blockchain
    blockchain.print();

    // Validar la cadena
  console.log("Validando la cadena...\n");
    const errors = await blockchain.validateChain();
    
    if (errors.length === 0) {
  console.log("La blockchain es válida!\n");
    } else {
  console.log("Errores encontrados:");
      errors.forEach(error => console.log(`   - ${error.message}`));
    }

    // Probar obtención de datos del bloque
  console.log("\nObteniendo datos del Block #2...");
    const block = await blockchain.getBlockByHeight(2);
    const blockData = await block.getBlockData();
    console.log("Datos del bloque:", blockData);

    // Simular manipulación de un bloque (para demostrar validación)
  console.log("\nSimulando manipulación del Block #2...");
    blockchain.chain[2].body = Buffer.from(JSON.stringify({ data: "Block #2 MODIFICADO" })).toString("hex");
    
  console.log("Validando nuevamente la cadena...\n");
    const errorsAfterTampering = await blockchain.validateChain();
    
    if (errorsAfterTampering.length === 0) {
  console.log("La blockchain es válida!\n");
    } else {
  console.log("Errores encontrados:");
      errorsAfterTampering.forEach(error => console.log(`   - ${error.message}`));
  console.log("\nLa cadena ha sido manipulada y ya no es válida!\n");
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();