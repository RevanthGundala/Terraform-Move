import minimist from "minimist";
import touch from "touch";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64, fromHEX } from "@mysten/sui.js/utils";
import { execSync } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectChange,
} from "@mysten/sui.js/client";
import { existsSync, writeFileSync, mkdirSync, openSync } from "fs";

const PRIVATE_KEY = minimist(process.argv.slice(2)).private_key;
const PROJECT_NAME = minimist(process.argv.slice(2)).project_name;
const MODULE_NAME = minimist(process.argv.slice(2)).module_name;
const CONTRACT_PATH = minimist(process.argv.slice(2)).path || "../../";

if (!PRIVATE_KEY) {
  console.log("Error: Invalid Private Key.");
  process.exit(1);
}
const keypair = Ed25519Keypair.fromSecretKey(fromHEX(privkey));
const pathToContracts = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  CONTRACT_PATH.concat(PROJECT_NAME),
);

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

console.log("Building...");
const { modules, dependencies } = JSON.parse(
  execSync(
    `sui move build --dump-bytecode-as-base64 --path ${pathToContracts}`,
    { encoding: "utf-8" },
  ),
);

console.log("Deploying from address:", keypair.toSuiAddress());

const deploy_trx = new TransactionBlock();
const [upgradeCap] = deploy_trx.publish({
  modules,
  dependencies,
});

deploy_trx.transferObjects(
  [upgradeCap],
  deploy_trx.pure(keypair.toSuiAddress()),
);
const { objectChanges, balanceChanges } =
  await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: deploy_trx,
    options: {
      showBalanceChanges: true,
      showEffects: true,
      showEvents: true,
      showInput: false,
      showObjectChanges: true,
      showRawInput: false,
    },
  });

const parseCost = (amount: string) =>
  Math.abs(parseInt(amount)) / 1_000_000_000;

if (balanceChanges) {
  console.log("Cost to deploy:", parseCost(balanceChanges[0].amount), "SUI");
}

if (!objectChanges) {
  console.log("Error: RPC did not return objectChanges");
  process.exit(1);
}
const publishedEvent = objectChanges.find((obj) => obj.type == "published");
if (publishedEvent?.type != "published") {
  process.exit(1);
}

console.log("ObjectChanges: ", objectChanges);

const package_id = published_event.packageId;
const object_name = "Forge";
const place_type = `${package_id}::${moduleName}::${object_name}`;
console.log("Changes: ", objectChanges);
const place_id = find_one_by_type(objectChanges, place_type);
if (!place_id) {
  console.log("Error: Could not find place creation in results of publish");
  process.exit(1);
}

let deployed_addresses = {
  types: {
    object_name: place_type,
  },
  PACKAGE_ID: package_id,
  object: place_id,
};

console.log("Writing addresses to json...");
const path_to_address_file = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "../../deployed_addresses.json",
);
if (!existsSync(path_to_address_file)) {
  touch.sync(path_to_address_file);
}
writeFileSync(
  path_to_address_file,
  JSON.stringify(deployed_addresses, null, 4),
);
console.log(
  "Successfully deployed and wrote addresses to deployed_addresses.json.",
);
