"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var merkle_tree_1 = require("@openzeppelin/merkle-tree");
var fs = __importStar(require("fs"));
// (1)
var wallets_json_1 = __importDefault(require("./wallets.json"));
var power = Math.pow(10, 18);
var values = wallets_json_1.default.filter(function (item) { return item.type == "wallet"; }).map(function (item) { return [item.wallet, Number(item.balance) * power]; });
// (2)
var tree = merkle_tree_1.StandardMerkleTree.of(values, ["address", "uint256"]);
// (3)
console.log('Merkle Root:', tree.root);
// (4)
fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
