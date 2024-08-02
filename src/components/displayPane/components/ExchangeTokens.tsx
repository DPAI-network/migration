import { MouseEvent, useEffect, useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { Button, InputNumber, Modal, message } from "antd";
import DPAIAToken from "../../../data/abi/DPAIToken.json";
import GenericERC20 from "../../../data/abi/GenericERC20.json";
import { useContract } from "hooks";
import { Contract } from "ethers";
import { formatUnits, parseEther } from "ethers/lib/utils";
import { QuestionCircleOutlined  } from "@ant-design/icons";

const TOKEN_CONTRACT = "0x3C2993B831528EC4db4e334D5c2d1914491E38B4"
// const WALLET_CONTRACT = "0xf7cc8Fb6a49Cf34914BE6ea3653eB87EF11D5B51"
const OLD_CONTRACT = "0x8A0a9b663693A22235B896f70a229C4A22597623";

// TOKEN_CONTRACT
// mainnet "0x3C2993B831528EC4db4e334D5c2d1914491E38B4";
// sepolia  "0xf96C7B8930abfB7187416A3Ea75b3b5f31425CA8"

//WALLET_CONTRACT
// mainnet "0xf7cc8Fb6a49Cf34914BE6ea3653eB87EF11D5B51";
// sepolia "0x972e08cf7d79E9CA2013fbd662CFFA31761d1325"

//OLD_CONTRACT
// mainnet "0x8a0a9b663693a22235b896f70a229c4a22597623"
// sepolia "0x009F158DC325701b09dca908c7d459fac4Bf5fAa"

const styles = {
    buttonTransfer: {
        display: "flex",
        margin: "15px 0"
    }
} as const;


const ExchangeTokens: React.FC = () => {
    const { account } = useWeb3React();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState<boolean | undefined>(false);
    const [amount, setAmount] = useState<number | null>(0);
    const [allowance, setAllowance] = useState<number | null>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<number | null>();
    const contract = useContract<Contract>(TOKEN_CONTRACT!, DPAIAToken.abi);
    const oldContract = useContract<Contract>(OLD_CONTRACT!, GenericERC20);


    const showModal = () => {
        setIsModalOpen(true);
      };
    
      const handleCloseModal = () => {
        setIsModalOpen(false);
      };


    useEffect(() => {
        let id: any;
        const refreshBalance = async () => {
            setLoading(true);
            try {
                const balance = await oldContract!.balanceOf(account)
                console.log('Got balance', balance.toString(), formatUnits(balance.toString()))
                setTokenBalance(Number(formatUnits(balance.toString())));
            } catch (error) {
                console.log('cannot load exchange balance from ', OLD_CONTRACT)
                console.log((error as any).message)
            }
            try {
                setAllowance(Number(formatUnits(await oldContract!.allowance(account, TOKEN_CONTRACT))));
            } catch (error) {
                console.log('cannot set allowance', OLD_CONTRACT);
                console.log((error as any).message)
            }
            console.log('update', allowance, tokenBalance)
            setLoading(false);
            id = setTimeout(refreshBalance, 60000);
        };
        refreshBalance();

        return () => {
            clearTimeout(id);
        };
    }, [account, oldContract]);


    const handleAllowance = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        if (!account) {
            messageApi.error("The account address is missing. Please connect your wallet.");
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
            /* const { success, data } = */ await oldContract!.approve(TOKEN_CONTRACT, parseEther(amount.toString()));
            // if (success) {
            messageApi.success(
                `Success! Tokens approved`
            );
            // } else {
            //     messageApi.error(`An error occurred: ${data}`);
            // }
        } catch (error) {
            messageApi.error((error as any).message);
            console.log(error);
        }
    }

    const handleExchange = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        if (allowance! < amount!) {
            messageApi.error("The amount is not allowed.");
            return;
        }
        if (!account) {
            messageApi.error("The account address is missing. Please connect your wallet.");
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
            /* const { success, data } =  */
            console.log('exchange', parseEther(amount.toString()).toString())
            await contract!.exchange(parseEther(amount.toString()))
            // if (success) {
            messageApi.success(
                `Success! Exchange processed`
            );
            // } else {
            //     messageApi.error(`An error occurred: ${data}`);
            // }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {contextHolder}
            <div style={{ width: "100%", minWidth: "250px" }}>
                <h3 style={{ color: "#FFF" }}>Exchange the SCALE to the DPAI 5:1<Button type="primary" shape="circle" icon={<QuestionCircleOutlined />} size="large" onClick={showModal} /></h3>
                <div style={{ display: "inline-flex", gap: "10px", width: "100%" }}>

                    <InputNumber
                        value={amount}
                        onChange={setAmount}
                        placeholder="Amount tokens to exchange"
                        min={0}
                        max={tokenBalance ? Number(tokenBalance.toFixed(4)) : 0}
                        style={{ width: "100%", height: "80%", marginBlock: "auto", minWidth: "250px", marginTop: "16px" }}
                    />

                    <div style={styles.buttonTransfer}>
                        {amount != undefined && allowance! < amount! &&
                            <Button type="primary" shape="round" onClick={handleAllowance} loading={loading}  >
                                Approve tokens
                            </Button>

                        } else {

                            <Button type="primary" shape="round" onClick={handleExchange} loading={loading}
                                disabled={amount == undefined || (amount! > 0 && allowance! < amount!)}>
                                Exchange
                            </Button>


                        }
                    </div>
                </div>
            </div>
            <Modal title="Exchange tokens" open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <p>If you currently have SCALE tokens that you want to exchange for DPAI, you can do so here.</p>
        <p>Just enter the desired number of tokens and they will be exchanged at the rate of 5 SCALE - 1 DPAI. This ratio is calculated based on the SCALE rate as of July 10 and the average SCALE rate over the last two weeks.</p>
        <p>The tokens will be exchanged automatically and sent to your wallet.</p>
      </Modal>
        </>
    );
};

export default ExchangeTokens;
