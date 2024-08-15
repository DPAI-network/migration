// import { useWeb3React } from "@web3-react/core";
import { /* Divider, */ Typography } from "antd";
const { Title } = Typography;

/* import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import tree from  "../../tree.json";
import wallets from "../../wallets.json"; */
import { useWindowSize } from "hooks";

import {/*  ClaimAirdrop, Status, TransferEth,  */ Closed } from "./components";
// import ExchangeTokens from "./components/ExchangeTokens";

const styles = {
  container: {
    width: "80%",
    minWidth: "330px",
    maxWidth: "900px",
    textAlign: "center",
    margin: "auto",
    padding: "20px 0",
    borderRadius: "10px",
    boxShadow: "0px 0px 30px 30px rgba(30, 136, 229, 0.2)"
  },
  content: {
    width: "85%",
    margin: "auto",
    fontSize: "17px"
  },
  action: {
    display: "inline-flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px"
  }
} as const;

type DisplayPaneProps = {
  isDarkMode: boolean;
};

const DisplayPane: React.FC<DisplayPaneProps> = ({ isDarkMode }) => {
  // const { isActivating, isActive } = useWeb3React();
  const { isTablet } = useWindowSize();

  return (
    <div
      style={{
        ...styles.container,
        border: isDarkMode ? "1px solid rgba(152, 161, 192, 0.24)" : "none",
        width: isTablet ? "90%" : "80%"
      }}
    >
      <Title>DPAI airdrop & migration tool</Title>
      <div style={styles.content}>
        <Closed />
      {/*   <Status isActivating={isActivating} isActive={isActive} />

        {isActive && (
          <>
            <Divider />
            <div style={styles.action}>
              <ClaimAirdrop />
              <ExchangeTokens />
              <TransferEth />
            </div>
          </>
        )} */}
      </div>
    </div>
  );
};

export default DisplayPane;
