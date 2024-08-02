import { useWeb3React, Web3ReactHooks } from "@web3-react/core";
import { Typography } from "antd";
const { Paragraph } = Typography;
 
import {  useWindowSize } from "hooks";
import { getEllipsisTxt, } from "utils/formatters";

const styles = {
  display: {
    paddingBlock: "0 15px",
    display: "flex",
    flexDirection: "column"
  },
  statusText: {
    fontSize: "17px"
  },
  statusValue: {
    fontWeight: 800
  }
} as const;

const Infos = ({ chainId }: { chainId: ReturnType<Web3ReactHooks["useChainId"]> }) => {
  const { account,   } = useWeb3React(); 
  const { isTablet } = useWindowSize();

  if (chainId === undefined) return null; 

  return (
    <Typography style={styles.display}>
      <Paragraph style={styles.statusText}>
        Address:{" "}
        {!isTablet ? (
          <span style={styles.statusValue}>{account}</span>
        ) : (
          <span style={styles.statusValue}>{account && getEllipsisTxt(account, 4)}</span>
        )}
      </Paragraph>
    </Typography>
  );
};

export default Infos;
