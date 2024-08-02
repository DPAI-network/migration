import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { BigNumber  } from "ethers";

import * as fs from "fs";

// (1)
import wallets from "./wallets.json";
 
const ZEROES = "000000000000000000"

function powBigNumber(a: string): BigNumber {
    const aNum = Number(a);
    if (aNum == 0 || isNaN(aNum)) return BigNumber.from(0);
    const [l, s] = a.split(".");
    if (!s) return BigNumber.from(l + ZEROES);
    return BigNumber.from(l + s);
}

const values = wallets.filter(item => item.type == "wallet").map(item => [item.wallet.toLowerCase(), powBigNumber(item.balance)]);

// (2)
const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

// (3)
console.log('Merkle Root:', tree.root);

// (4)
fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));