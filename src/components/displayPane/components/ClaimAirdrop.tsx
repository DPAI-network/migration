import { FC, MouseEvent, ReactElement, SetStateAction, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Button, Input, message, Modal } from "antd";

import { useContract, useWriteContract } from "hooks";

import wallets from "../../../wallets.json";
import treeRaw from "../../../tree.json";
import DPAIAirdrop from "../../../data/abi/DPAIAirdrop.json";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { Contract } from "ethers";
import { QuestionCircleOutlined,   } from "@ant-design/icons";

const AIRDROP_CONTRACT = "0x54fc5811e34786d738b84ed05587a0088d6710c8";

const styles = {
  buttonSign: {
    margin: "15px auto"
  }
} as const;

const ClaimAirdrop: FC = (): ReactElement => {
  const { account, } = useWeb3React();
  const [messageApi, contextHolder] = message.useMessage();
  const { loading } = useWriteContract();
  const [airdropAddress, setAirdropAddress] = useState<string>(account!);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contract = useContract<Contract>(AIRDROP_CONTRACT!, DPAIAirdrop.abi);
  const handleAddressChange = (e: { target: { value: SetStateAction<string> } }) => {
    setAirdropAddress(e.target.value);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleClaimAirdrop = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();
    console.log(1)
    const walletFound = wallets.find(item => item.wallet.toLowerCase() == airdropAddress.toLowerCase())
    if (!walletFound) {
      messageApi.error(`The wallet is not found in the list`);
      return;
    }
    console.log(2)
    //@ts-expect-error json is correct
    const tree = StandardMerkleTree.load(treeRaw);

    for (const [i, v] of tree.entries()) {
      if (v[0] === airdropAddress.toLowerCase()) {
        // (3)
        console.log(3, v)
        const proof = tree.getProof(i);
        console.log("proof", proof)
        try {
          const isClaimed = await contract!.claimed(airdropAddress);
          if (isClaimed) {
            messageApi.error(`You have already claimed the tokens`);
            return
          }
          await contract!.claim(
            proof,
            airdropAddress,
            v[1]
          );
          // if (success) {
          messageApi.success(`Success! You have claimed the tokens`);
          /* } else {
            messageApi.error(`An error occurred: ${data}`);
          } */
        } catch (error) {
          console.log(error)
          messageApi.error(`You cannot claim the tokens`);
        }
      }
    }

    // console.log(walletFound)

    return
  };

  return (
    <>
      {contextHolder}
      <div style={{ width: "100%", minWidth: "250px" }}>
        <h3 style={{ color: "#FFF" }}>Claiming the airdrop  <Button type="primary" shape="circle" icon={<QuestionCircleOutlined />} size="large" onClick={showModal} /></h3>
        <div style={{ display: "inline-flex", gap: "10px", width: "100%" }}>
          <Input
            allowClear
            value={airdropAddress}
            onChange={handleAddressChange}
            type="textarea"
            placeholder="Input address for the airdrop"
            style={{ width: "100%", height: "80%", marginBlock: "auto", minWidth: "250px", marginTop: "16px" }}
          />
          <Button type="primary" shape="round" style={styles.buttonSign} onClick={handleClaimAirdrop} loading={loading}>
            Claim airdrop
          </Button>
        </div>
        <a href="/SCALE.csv" style={{ color: "#FFF" }}>Download airdrop addresses list</a>
      </div>
      <Modal title="Airdrop claiming" open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <p>You can get airdrop of DPAI tokens for free if you were the owner of SCALE tokens on July 10 at 00:00GMT. </p>
        <p>It doesn't matter if you have these tokens now or not, you will get the amount of DPAI equal to SCALE at that moment according to the blockchain snapshot.</p>
        <p>You can make a claim using any other wallet for security by simply entering the wallet number with SCALE tokens for verification. The tokens will be sent to the wallet that is entered, not the one that signed the transaction.</p>
        <p>You can check if your wallet is on the list by downloading the file below the entry form. If your wallet is in the list but the system does not find it, copy the wallet address as it is written in the file - this is a text case problem.</p>
      </Modal>
    </>
  );
};

export default ClaimAirdrop;
