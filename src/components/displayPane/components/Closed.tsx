import { Typography } from "antd";
const { Paragraph } = Typography;

const styles = {
  display: {
    paddingBlock: "15px 0px"
  },
  statusText: {
    fontSize: "17px"
  },
  statusValue: {
    fontWeight: 800
  }
} as const;

const Closed = ( ) => {
   

  return (
    <div style={styles.display}>
      <Typography>
        <Paragraph style={styles.statusText}>
         Airdrop is over
        </Paragraph>
      </Typography>
    </div>
  );
};

export default Closed;
