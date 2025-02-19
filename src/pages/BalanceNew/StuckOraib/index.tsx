import { ReactComponent as StuckOraibridge } from 'assets/icons/stuck_oraib.svg';
import TokenBalance from 'components/TokenBalance';
import styles from './style.module.scss';
import loadingGif from 'assets/gif/loading.gif';
import { RemainingOraibTokenItem } from './useGetOraiBridgeBalances';
import { TooltipIcon } from './TooltipBridgeToken';
import { toDisplay } from 'libs/utils';

interface Props {
  handleMove: () => Promise<void>;
  loading: Boolean;
  remainingOraib: RemainingOraibTokenItem[];
}

export default function StuckOraib({ handleMove, loading, remainingOraib }: Props) {
  if (!remainingOraib.length) {
    return <></>;
  }
  return (
    <div className={styles.bridgeBalances}>
      <StuckOraibridge className={styles.stuckIcon} />
      {loading ? (
        <img src={loadingGif} alt="loading-gif" width={30} height={30} />
      ) : (
        <div className={styles.stuckText} onClick={handleMove}>
          Move stuck token from OraiBridge to Oraichain
        </div>
      )}
      <TooltipIcon
        placement="bottom-end"
        content={remainingOraib.map((token) => {
          const { Icon } = token;
          return (
            <div key={token.denom} className={styles.stuckToken}>
              <div className={styles.icon}>
                <Icon width={20} height={20} />
                <span className={styles.name}>{token.name}</span>
              </div>
              <TokenBalance
                balance={{
                  amount: toDisplay(token.amount, token.decimals).toString()
                }}
                className={styles.tokenAmount}
                decimalScale={Math.min(6, token.decimals)}
              />
            </div>
          );
        })}
      />
    </div>
  );
}
