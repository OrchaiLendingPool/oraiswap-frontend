import { TokenItemType } from '@oraichain/oraidex-common';
import { OraiswapRouterReadOnlyInterface } from '@oraichain/oraidex-contracts-sdk';
import { handleSimulateSwap } from '@oraichain/oraidex-universal-swap';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { TokenInfo } from 'types/token';
import { useDebounce } from 'hooks/useDebounce';
/**
 * Simulate ratio between fromToken & toToken
 * @param queryKey
 * @param fromTokenInfoData
 * @param toTokenInfoData
 * @param initAmount
 * @returns
 */
export const useSimulate = (
  queryKey: string,
  fromTokenInfoData: TokenInfo,
  toTokenInfoData: TokenInfo,
  originalFromTokenInfo: TokenItemType,
  originalToTokenInfo: TokenItemType,
  routerClient: OraiswapRouterReadOnlyInterface,
  initAmount?: number,
  simulateOption?: {
    useAlphaSmartRoute?: boolean;
    useSmartRoute?: boolean;
  },
  isAIRoute?: boolean
) => {
  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([initAmount || null, 0]);
  const debouncedFromAmount = useDebounce(fromAmountToken, 500);

  const { data: simulateData, isPreviousData: isPreviousSimulate } = useQuery(
    [queryKey, fromTokenInfoData, toTokenInfoData, debouncedFromAmount, isAIRoute],
    () => {
      return handleSimulateSwap({
        originalFromInfo: originalFromTokenInfo,
        originalToInfo: originalToTokenInfo,
        originalAmount: debouncedFromAmount,
        routerClient,
        routerOption: {
          useAlphaSmartRoute: simulateOption?.useAlphaSmartRoute
        },
        urlRouter: {
          url: 'https://router.oraidex.io',
          path: '/smart-router/alpha-router'
        }
      });
    },
    {
      keepPreviousData: true,
      refetchInterval: 10000,
      staleTime: 1000,
      enabled: !!fromTokenInfoData && !!toTokenInfoData && !!debouncedFromAmount && fromAmountToken > 0
    }
  );

  useEffect(() => {
    // initAmount used for simulate averate ratio
    const fromAmount = initAmount ?? fromAmountToken;
    setSwapAmount([fromAmount ?? null, !!fromAmount ? Number(simulateData?.displayAmount) : 0]);
  }, [simulateData, fromAmountToken, fromTokenInfoData, toTokenInfoData]);

  return {
    simulateData,
    fromAmountToken,
    toAmountToken,
    setSwapAmount,
    debouncedFromAmount,
    isPreviousSimulate
  };
};
