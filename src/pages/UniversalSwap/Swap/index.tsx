import { useQuery } from '@tanstack/react-query';
import AntSwapImg from 'assets/images/ant_swap.svg';
import AntSwapLightImg from 'assets/icons/ant_swap_light.svg';
import { ReactComponent as RefreshImg } from 'assets/images/refresh.svg';
import cn from 'classnames/bind';
import Loader from 'components/Loader';
import LoadingBox from 'components/LoadingBox';
import { TToastType, displayToast } from 'components/Toasts/Toast';
import TokenBalance from 'components/TokenBalance';
import { TokenItemType, tokenMap } from 'config/bridgeTokens';
import { DEFAULT_SLIPPAGE, GAS_ESTIMATION_SWAP_DEFAULT, ORAI, TRON_DENOM, swapEvmRoutes } from 'config/constants';
import { swapFromTokens, swapToTokens } from 'config/bridgeTokens';
import { feeEstimate, floatToPercent, getTransactionUrl, handleCheckAddress, handleErrorTransaction } from 'helper';
import { useCoinGeckoPrices } from 'hooks/useCoingecko';
import useConfigReducer from 'hooks/useConfigReducer';
import useLoadTokens from 'hooks/useLoadTokens';
import { toDisplay, toSubAmount, truncDecimals } from 'libs/utils';
import { combineReceiver } from 'pages/Balance/helpers';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTokenInfos, getTokenOnOraichain } from 'rest/api';
import { RootState } from 'store/configure';
import { TooltipIcon, SlippageModal, SelectTokenModalV2 } from '../Modals';
import { UniversalSwapHandler, checkEvmAddress, calculateMinimum, filterTokens } from '../helpers';
import styles from './index.module.scss';
import useTokenFee from 'hooks/useTokenFee';
import { selectCurrentToken, setCurrentToken } from 'reducer/tradingSlice';
import { generateNewSymbol } from 'components/TVChartContainer/helpers/utils';
import InputSwap from 'components/InputSwap/InputSwap';
import { useSimulate, useTaxRate } from './hooks';

const cx = cn.bind(styles);

const SwapComponent: React.FC<{
  fromTokenDenom: string;
  toTokenDenom: string;
  setSwapTokens: (denoms: [string, string]) => void;
}> = ({ fromTokenDenom, toTokenDenom, setSwapTokens }) => {
  const { data: prices } = useCoinGeckoPrices();
  const [isSelectFrom, setIsSelectFrom] = useState(false);
  const [isSelectTo, setIsSelectTo] = useState(false);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [visible, setVisible] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [oraiAddress] = useConfigReducer('address');
  const amounts = useSelector((state: RootState) => state.token.amounts);
  const [metamaskAddress] = useConfigReducer('metamaskAddress');
  const [tronAddress] = useConfigReducer('tronAddress');
  const [theme] = useConfigReducer('theme');
  const loadTokenAmounts = useLoadTokens();
  const dispatch = useDispatch();
  const [searchTokenName, setSearchTokenName] = useState('');
  const [filteredToTokens, setFilteredToTokens] = useState([] as TokenItemType[]);
  const [filteredFromTokens, setFilteredFromTokens] = useState([] as TokenItemType[]);
  const currentPair = useSelector(selectCurrentToken);

  const refreshBalances = async () => {
    try {
      if (loadingRefresh) return;
      setLoadingRefresh(true);
      await loadTokenAmounts({ metamaskAddress, tronAddress, oraiAddress });
      setLoadingRefresh(false);
    } catch (err) {
      setLoadingRefresh(false);
    }
  };

  const onChangeFromAmount = (amount: number | undefined) => {
    if (!amount) return setSwapAmount([undefined, toAmountToken]);
    setSwapAmount([amount, toAmountToken]);
  };

  const onMaxFromAmount = (amount: bigint, type: 'max' | 'half') => {
    const displayAmount = toDisplay(amount, originalFromToken?.decimals);
    let finalAmount = displayAmount;

    // hardcode fee when swap token orai
    if (fromTokenDenom === ORAI) {
      const estimatedFee = feeEstimate(originalFromToken, GAS_ESTIMATION_SWAP_DEFAULT);
      const fromTokenBalanceDisplay = toDisplay(fromTokenBalance, originalFromToken?.decimals);
      if (type === 'max') {
        finalAmount = estimatedFee > displayAmount ? 0 : displayAmount - estimatedFee;
      }
      if (type === 'half') {
        finalAmount = estimatedFee > fromTokenBalanceDisplay - displayAmount ? 0 : displayAmount;
      }
    }
    setSwapAmount([finalAmount, toAmountToken]);
  };

  // get token on oraichain to simulate swap amount.
  const fromToken = getTokenOnOraichain(tokenMap[fromTokenDenom].coinGeckoId) ?? tokenMap[fromTokenDenom];
  const toToken = getTokenOnOraichain(tokenMap[toTokenDenom].coinGeckoId) ?? tokenMap[toTokenDenom];
  const originalFromToken = tokenMap[fromTokenDenom];
  const originalToToken = tokenMap[toTokenDenom];

  const fromTokenFee = useTokenFee(originalFromToken.prefix + originalFromToken.contractAddress);
  const toTokenFee = useTokenFee(originalToToken.prefix + originalToToken.contractAddress);

  const {
    data: [fromTokenInfoData, toTokenInfoData]
  } = useQuery(['token-infos', fromToken, toToken], () => fetchTokenInfos([fromToken!, toToken!]), { initialData: [] });

  const subAmountFrom = toSubAmount(amounts, originalFromToken);
  const subAmountTo = toSubAmount(amounts, originalToToken);
  const fromTokenBalance = originalFromToken
    ? BigInt(amounts[originalFromToken.denom] ?? '0') + subAmountFrom
    : BigInt(0);
  const toTokenBalance = originalToToken ? BigInt(amounts[originalToToken.denom] ?? '0') + subAmountTo : BigInt(0);

  // process filter from & to tokens
  useEffect(() => {
    const filteredToTokens = filterTokens(fromToken.chainId, fromTokenDenom, searchTokenName);
    setFilteredToTokens(filteredToTokens);

    const filteredFromTokens = filterTokens(toToken.chainId, toTokenDenom, searchTokenName);
    setFilteredFromTokens(filteredFromTokens);
  }, [fromTokenDenom, toTokenDenom]);

  const taxRate = useTaxRate();
  const { simulateData, setSwapAmount, fromAmountToken, toAmountToken } = useSimulate(
    'simulate-data',
    fromTokenInfoData,
    toTokenInfoData
  );
  const { toAmountToken: averageRatio } = useSimulate('simulate-average-data', fromTokenInfoData, toTokenInfoData, 1);

  useEffect(() => {
    const newTVPair = generateNewSymbol(fromToken, toToken, currentPair);
    if (newTVPair) dispatch(setCurrentToken(newTVPair));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, toToken]);

  const handleSubmit = async () => {
    if (fromAmountToken <= 0)
      return displayToast(TToastType.TX_FAILED, {
        message: 'From amount should be higher than 0!'
      });

    setSwapLoading(true);
    displayToast(TToastType.TX_BROADCASTING);
    try {
      const oraiAddress = await handleCheckAddress();
      const univeralSwapHandler = new UniversalSwapHandler(
        oraiAddress,
        originalFromToken,
        originalToToken,
        fromAmountToken,
        simulateData.amount,
        userSlippage
      );
      const toAddress = await univeralSwapHandler.getUniversalSwapToAddress(originalToToken.chainId);
      const { combinedReceiver, universalSwapType } = combineReceiver(
        oraiAddress,
        originalFromToken,
        originalToToken,
        toAddress
      );
      checkEvmAddress(originalFromToken.chainId, metamaskAddress, tronAddress);
      checkEvmAddress(originalToToken.chainId, metamaskAddress, tronAddress);
      const checksumMetamaskAddress = window.Metamask.toCheckSumEthAddress(metamaskAddress);
      const result = await univeralSwapHandler.processUniversalSwap(combinedReceiver, universalSwapType, {
        metamaskAddress: checksumMetamaskAddress,
        tronAddress
      });
      if (result) {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: getTransactionUrl(originalFromToken.chainId, result.transactionHash)
        });
        loadTokenAmounts({ oraiAddress, metamaskAddress, tronAddress });
        setSwapLoading(false);
      }
    } catch (error) {
      console.log({ error });
      handleErrorTransaction(error);
    } finally {
      setSwapLoading(false);
    }
  };

  const FromIcon = theme === 'light' ? originalFromToken?.IconLight || originalFromToken?.Icon : fromToken?.Icon;
  const ToIcon = theme === 'light' ? originalToToken?.IconLight || originalToToken?.Icon : originalToToken?.Icon;

  // const filteredFromTokens = swapFromTokens.filter(
  //   (token) => token.denom !== toTokenDenom && token.name.includes(searchTokenName)
  // );

  // const filteredToTokens = swapToTokens.filter(
  //   (token) => token.denom !== fromTokenDenom && token.name.includes(searchTokenName)
  // );

  // minimum receive after slippage
  const minimumReceive = simulateData?.amount ? calculateMinimum(simulateData.amount, userSlippage) : '0';

  return (
    <LoadingBox loading={loadingRefresh}>
      <div className={cx('swap-box')}>
        <div className={cx('from')}>
          <div className={cx('header')}>
            <div className={cx('title')}>FROM</div>
            <TooltipIcon
              placement="bottom-end"
              visible={visible}
              setVisible={setVisible}
              content={<SlippageModal setVisible={setVisible} setUserSlippage={setUserSlippage} />}
            />
            <button className={cx('btn')} onClick={refreshBalances}>
              <RefreshImg />
            </button>
          </div>
          <div className={cx('balance')}>
            <TokenBalance
              balance={{
                amount: fromTokenBalance,
                decimals: originalFromToken?.decimals,
                denom: fromTokenInfoData?.symbol ?? ''
              }}
              prefix="Balance: "
              decimalScale={6}
            />

            <div
              className={cx('btn')}
              onClick={() => onMaxFromAmount(fromTokenBalance - BigInt(originalFromToken?.maxGas ?? 0), 'max')}
            >
              MAX
            </div>
            <div className={cx('btn')} onClick={() => onMaxFromAmount(fromTokenBalance / BigInt(2), 'half')}>
              HALF
            </div>
          </div>
          <div className={cx('input-wrapper')}>
            <InputSwap
              Icon={FromIcon}
              setIsSelectFrom={setIsSelectFrom}
              token={originalFromToken}
              amount={fromAmountToken}
              onChangeAmount={onChangeFromAmount}
              tokenFee={fromTokenFee}
            />
            {isSelectFrom && (
              <SelectTokenModalV2
                close={() => setIsSelectFrom(false)}
                prices={prices}
                items={filteredFromTokens}
                amounts={amounts}
                setToken={(denom) => {
                  setSwapTokens([denom, toTokenDenom]);
                }}
                setSearchTokenName={setSearchTokenName}
              />
            )}
          </div>
        </div>
        <div className={cx('swap-icon')}>
          <img
            src={theme === 'light' ? AntSwapLightImg : AntSwapImg}
            onClick={() => {
              setSwapTokens([toTokenDenom, fromTokenDenom]);
              setSwapAmount([toAmountToken, fromAmountToken]);
            }}
            alt="ant"
          />
        </div>
        <div className={cx('to')}>
          <div className={cx('header')}>
            <div className={cx('title')}>TO</div>
          </div>
          <div className={cx('balance')}>
            <TokenBalance
              balance={{
                amount: toTokenBalance,
                denom: toTokenInfoData?.symbol ?? '',
                decimals: originalToToken?.decimals
              }}
              prefix="Balance: "
              decimalScale={6}
            />

            <span style={{ flexGrow: 1, textAlign: 'right' }}>
              {`1 ${originalFromToken?.name} ≈ ${averageRatio} ${originalToToken?.name}`}
            </span>
          </div>
          <div className={cx('input-wrapper')}>
            <InputSwap
              Icon={ToIcon}
              setIsSelectFrom={setIsSelectTo}
              token={originalToToken}
              amount={toAmountToken}
              tokenFee={toTokenFee}
            />
            {isSelectTo && (
              <SelectTokenModalV2
                close={() => setIsSelectTo(false)}
                prices={prices}
                items={filteredToTokens}
                amounts={amounts}
                setToken={(denom) => {
                  setSwapTokens([fromTokenDenom, denom]);
                }}
                setSearchTokenName={setSearchTokenName}
              />
            )}
          </div>
        </div>
        <button
          className={cx('swap-btn')}
          onClick={handleSubmit}
          disabled={swapLoading || !fromAmountToken || !toAmountToken}
        >
          {swapLoading && <Loader width={40} height={40} />}
          {/* hardcode check minimum tron */}
          {!swapLoading && (!fromAmountToken || !toAmountToken) && fromToken.denom === TRON_DENOM ? (
            <span>Minimum amount: {(fromToken.minAmountSwap || '0') + ' ' + fromToken.name} </span>
          ) : (
            <span>Swap</span>
          )}
        </button>
        <div className={cx('detail')}>
          <div className={cx('row')}>
            <div className={cx('title')}>
              <span>Minimum Received</span>
            </div>
            <TokenBalance
              balance={{
                amount: minimumReceive,
                denom: toTokenInfoData?.symbol,
                sourceDecimals: fromTokenInfoData?.decimals,
                decimals: toTokenInfoData?.decimals
              }}
              decimalScale={6}
            />
          </div>

          {!fromTokenFee && !toTokenFee && (
            <div className={cx('row')}>
              <div className={cx('title')}>
                <span>Tax rate</span>
              </div>
              <span>{taxRate && floatToPercent(parseFloat(taxRate)) + '%'}</span>
            </div>
          )}
        </div>
      </div>
    </LoadingBox>
  );
};

export default SwapComponent;
