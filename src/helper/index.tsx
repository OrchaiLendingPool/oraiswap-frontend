import React from 'react';
import { ReactComponent as BNBIcon } from 'assets/network/bnb.svg';
import { ReactComponent as ETHIcon } from 'assets/network/ethereum.svg';
import { ReactComponent as ORAIIcon } from 'assets/network/oraichain.svg';
import { ReactComponent as KwtIcon } from 'assets/network/kwt.svg';
import { ReactComponent as AtomCosmosIcon } from 'assets/network/atom_cosmos.svg';
import { ReactComponent as OsmosisIcon } from 'assets/network/osmosis.svg';
import {
  BEP20_ORAI,
  ORAICHAIN_ID,
  BSC_ORG,
  KAWAII_ORG,
  OSMOSIS_ORG,
  COSMOS_ORG,
  ORAI_BRIDGE_ORG,
  ETHEREUM_ORG,
  ORAI_BRIDGE_CHAIN_ID,
  ORAI_BRIDGE_RPC,
  OSMOSIS_NETWORK_RPC,
  COSMOS_NETWORK_RPC,
  KAWAII_RPC,
} from 'config/constants';

import {
  BSC_CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  KWT_SUBNETWORK_EVM_CHAIN_ID,
  KWT_SUBNETWORK_CHAIN_ID,
  COSMOS_CHAIN_ID,
  OSMOSIS_CHAIN_ID,
  ERC20_ORAI,
  KAWAII_ORAI,
  ETHEREUM_RPC,
  BSC_RPC,
  COSMOS_TYPE,
  EVM_TYPE,
} from 'config/constants';
import { ChainInfoType } from 'hooks/useGlobalState';
import { network } from 'config/networks';
import { TokenItemType } from 'config/bridgeTokens';
import _ from 'lodash';

interface Items {
  chainId?: string;
  title?: string;
}
interface Tokens {
  denom?: string;
  chainId?: string | number;
  bridgeTo?: Array<string>
}

export const networks = [
  {
    title: ORAICHAIN_ID,
    chainId: ORAICHAIN_ID,
    icon: <ORAIIcon />,
    networkType: COSMOS_TYPE,
  },
  {
    title: KAWAII_ORG,
    chainId: KWT_SUBNETWORK_CHAIN_ID,
    icon: <KwtIcon />,
    networkType: COSMOS_TYPE,
  },
  {
    title: OSMOSIS_ORG,
    chainId: OSMOSIS_CHAIN_ID,
    icon: <OsmosisIcon />,
    networkType: COSMOS_TYPE,
  },
  {
    title: COSMOS_ORG,
    chainId: COSMOS_CHAIN_ID,
    icon: <AtomCosmosIcon />,
    networkType: COSMOS_TYPE,
  },
  {
    title: BSC_ORG,
    chainId: BSC_ORG,
    icon: <BNBIcon />,
    networkType: EVM_TYPE,
  },
  {
    title: ETHEREUM_ORG,
    chainId: ETHEREUM_ORG,
    icon: <ETHIcon />,
    networkType: EVM_TYPE,
  },
];

export const renderLogoNetwork = (network: string) => {
  let logo = <ORAIIcon />;
  switch (network) {
    case ORAICHAIN_ID:
      logo = <ORAIIcon />;
      break;
    case ORAI_BRIDGE_ORG:
      logo = <ORAIIcon />;
      break;
    case KAWAII_ORG:
      logo = <KwtIcon />;
      break;
    case OSMOSIS_ORG:
      logo = <OsmosisIcon />;
      break;
    case COSMOS_ORG:
      logo = <AtomCosmosIcon />;
      break;
    case ETHEREUM_ORG:
      logo = <ETHIcon />;
      break;
    case BSC_ORG:
      logo = <BNBIcon />;
      break;
  }
  return logo;
};

export const filterChainBridge = (
  token: Tokens,
  item: Items,
  filterNetwork?: string
) => {
  const tokenCanBridgeTo = token.bridgeTo ?? [ORAICHAIN_ID];
  return tokenCanBridgeTo.includes(item.title);
};

export const getTokenChain = (token: TokenItemType) => {
  return token?.bridgeTo?.[0] ?? ORAICHAIN_ID;
};

export const handleCheckChain = (
  chainId: string | number,
  infoCosmos?: ChainInfoType
) => {
  switch (chainId) {
    case BSC_CHAIN_ID:
      return window.Metamask.isBsc();
    case ETHEREUM_CHAIN_ID:
      return window.Metamask.isEth();
    case KWT_SUBNETWORK_EVM_CHAIN_ID:
      return (
        Number(window.ethereum.chainId) === Number(KWT_SUBNETWORK_EVM_CHAIN_ID)
      );
    case KWT_SUBNETWORK_CHAIN_ID:
      return infoCosmos.chainId === KWT_SUBNETWORK_CHAIN_ID;
    case COSMOS_CHAIN_ID:
      return infoCosmos.chainId === COSMOS_CHAIN_ID;
    case OSMOSIS_CHAIN_ID:
      return infoCosmos.chainId === OSMOSIS_CHAIN_ID;
    case ORAICHAIN_ID:
      return (
        infoCosmos.chainId !== OSMOSIS_CHAIN_ID &&
        infoCosmos.chainId !== COSMOS_CHAIN_ID &&
        infoCosmos.chainId !== KWT_SUBNETWORK_CHAIN_ID
      );
    default:
      return false;
  }
};

export const getDenomEvm = () => {
  if (window.Metamask.isEth()) return ERC20_ORAI;
  if (window.Metamask.isBsc()) return BEP20_ORAI;
  return KAWAII_ORAI;
};

export const getRpcEvm = (infoEvm?: ChainInfoType) => {
  if (window.Metamask.isEth()) return ETHEREUM_RPC;
  if (window.Metamask.isBsc()) return BSC_RPC;
  return infoEvm?.rpc;
};

export const objConvertTokenIbc = {
  usdt: process.env.REACT_APP_USDTBSC_ORAICHAIN_DENOM,
  kwt: process.env.REACT_APP_KWTBSC_ORAICHAIN_DENOM,
  milky: process.env.REACT_APP_MILKYBSC_ORAICHAIN_DENOM,
  airi: process.env.REACT_APP_AIRIBSC_ORAICHAIN_DENOM
}

export const arrayLoadToken = [
  { chainId: ORAI_BRIDGE_CHAIN_ID, rpc: ORAI_BRIDGE_RPC },
  { chainId: OSMOSIS_CHAIN_ID, rpc: OSMOSIS_NETWORK_RPC },
  { chainId: COSMOS_CHAIN_ID, rpc: COSMOS_NETWORK_RPC },
  { chainId: KWT_SUBNETWORK_CHAIN_ID, rpc: KAWAII_RPC },
  { chainId: network.chainId, rpc: network.rpc }
];

export const getNetworkGasPrice = async () => {
  const chainInfosWithoutEndpoints = await window.Keplr.getChainInfosWithoutEndpoints();
  return chainInfosWithoutEndpoints.find(e => e.chainId == network.chainId)?.feeCurrencies[0]?.gasPriceStep
}

export const calculateSubAmounts = (amountDetail: AmountDetail) => {
  return (amountDetail?.subAmounts ? _.sumBy(Object.values(amountDetail.subAmounts), (sub) => sub.amount) : 0)
}