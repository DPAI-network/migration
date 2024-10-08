import { MouseEvent, useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { Button, InputNumber, Modal, message } from "antd";
import DPAIAToken from "../../../data/abi/DPAIToken.json";
import { useContract, useNativeBalance, useWriteContract } from "hooks";
import { getEllipsisTxt, parseBigNumberToFloat } from "utils/formatters";
import { Contract } from "ethers";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { isNull } from "lodash";
/* 
import AddressInput from "../../AddressInput"; */

const TOKEN_CONTRACT = "0x3C2993B831528EC4db4e334D5c2d1914491E38B4"
// mainnet "0x3C2993B831528EC4db4e334D5c2d1914491E38B4";
// sepolia  "0xf96C7B8930abfB7187416A3Ea75b3b5f31425CA8"
const styles = {
  buttonTransfer: {
    display: "flex",
    margin: "15px 0"
  }
} as const;



const TransferEth: React.FC = () => {
  const { account, provider } = useWeb3React();
  const [messageApi, contextHolder] = message.useMessage();
  const { loading, transferNative } = useWriteContract();
  const balance = useNativeBalance(provider, account);
  const [amount, setAmount] = useState<number | null>();
  const [amountEth, setAmountEth] = useState<number | null>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [maxEth, setMaxEth] = useState<number | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<number | null>();
  const [lastChanged, setLastChnaged] = useState<string | null>();
  const contract = useContract<Contract>(TOKEN_CONTRACT!, DPAIAToken.abi);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const refreshPrice = async () => {
    try {
      const ethPrice = Number(await contract!.getEthPrice());
      setTokenPrice(Number((1 / ethPrice).toFixed(8)));
      if (lastChanged == 'token') {
        setAmountEth(amount! / ethPrice);
      }
      if (lastChanged == 'eth') {
        setAmount(amountEth! * ethPrice);
      }
      if (!isNull(balance) && balance!=undefined) {
        if (!isNull(ethPrice)) {
          setMaxAmount(Number(parseBigNumberToFloat(balance!.mul(ethPrice)).toFixed(8)))
        } else {
          setMaxAmount(undefined);
        }
        setMaxEth(Number(parseBigNumberToFloat(balance!).toFixed(8)))
      } else {
        setMaxAmount(undefined);
        setMaxEth(undefined);
      }
    } catch (e) {
      console.log('cannot set price', TOKEN_CONTRACT)
      console.log(e)
    }
    setTimeout(refreshPrice, 15000);
  }

  refreshPrice();





  const handleTransfer = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();

    if (!account) {
      messageApi.error("The address is missing. Please connect your wallet.");
      return;
    }

    if (amount === 0) {
      messageApi.error("The amount can't be 0. Make sure your balance is positive, and double check your input.");
      return;
    }

    if (!amount) {
      messageApi.error("The amount is missing. Please double check your input.");
      return;
    }

    try {
      let lastAmount;
      if (lastChanged == 'token') {
        lastAmount = amount * tokenPrice!;
      } else if (lastChanged == 'eth') {
        lastAmount = amountEth
      } else {
        messageApi.error("Please choose the correct amount");
        return;
      }
      const { success, data } = await transferNative(TOKEN_CONTRACT, lastAmount!);

      if (success) {
        messageApi.success(
          `Success! Transaction Hash: ${getEllipsisTxt(data?.transactionHash ?? "Transactions Hash missing.", 8)}`
        );
      } else {
        messageApi.error(`An error occurred: ${data}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function processAmount(value: number | null) {
    console.log('process amount', value)
    setAmount(value);
    setLastChnaged('token')
    setAmountEth(value! / tokenPrice!)
  }

  function processAmountEth(value: number | null) {
    setAmountEth(value);
    setLastChnaged('eth')
    setAmount(value! * tokenPrice!)
  }


  return (
    <>
      {contextHolder}
      <div style={{ width: "100%", minWidth: "250px" }}>
        <h3 style={{ color: "#FFF" }}>Buying of the DPAI tokens<Button type="primary" shape="circle" icon={<QuestionCircleOutlined />} size="large" onClick={showModal} /></h3>
        <div style={{ display: "inline-flex", gap: "10px", width: "100%", color: "white", paddingTop: "4px", textAlign: "center" }}>
          The price is {tokenPrice} ETH
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

          <InputNumber
            value={amount}
            onChange={processAmount}
            placeholder="Amount tokens to buy"
            min={0}
            addonAfter="DPAI"
            max={maxAmount}
            style={{ width: "100%", height: "80%", marginBlock: "auto" }}
          />
          <div style={{ color: "white", paddingTop: "20px" }}>OR</div>
          <InputNumber
            value={amountEth}
            onChange={processAmountEth}
            placeholder="Amount ETH to buy"
            min={0}
            addonAfter="ETH"
            max={maxEth}
            style={{ width: "100%", height: "80%", marginBlock: "auto" }}
          />
          <div style={styles.buttonTransfer}>
            <Button type="primary" shape="round" onClick={handleTransfer} loading={loading} disabled={loading}>
              Buy tokens
            </Button>
          </div>
        </div>
      </div>
      <Modal title="Buy tokens" open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <p>During the current presale, you can buy DPAI tokens for ETH at $0.01975 (SCALE price as of July 10) per piece. </p>
        <p>Just enter the desired quantity and the ETH amount will be calculated at Chainlink's exchange rate. </p>
        <p>ETH will be automatically sent to safe wallet and DPAI tokens will be credited to your wallet address.</p>
      </Modal>
    </>
  );
};

export default TransferEth;
