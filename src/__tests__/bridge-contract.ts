import { AppResponse, CWSimulateApp, IbcOrder, SimulateCosmWasmClient } from '@terran-one/cw-simulate';
import * as CwIcs20LatestTypes from 'libs/contracts/CwIcs20Latest.types';
import bech32 from 'bech32';
import path from 'path';
import { toBinary } from '@cosmjs/cosmwasm-stargate';
import { FungibleTokenPacketData } from 'libs/proto/ibc/applications/transfer/v2/packet';
import { CwIcs20LatestClient } from 'libs/contracts/CwIcs20Latest.client';
import { TransferBackMsg } from 'libs/contracts/types';
import { coins } from '@cosmjs/proto-signing';
import { OraiswapTokenClient } from 'libs/contracts/OraiswapToken.client';
import { InstantiateMsg as OraiswapInstantiateMsg } from 'libs/contracts/OraiswapToken.types';

var cosmosChain: CWSimulateApp = new CWSimulateApp({
  chainId: 'cosmoshub-4',
  bech32Prefix: 'cosmos'
});
// oraichain support cosmwasm
var oraiClient: SimulateCosmWasmClient;

const oraiSenderAddress = 'orai1g4h64yjt0fvzv5v2j8tyfnpe5kmnetejvfgs7g';
const bobAddress = 'orai1ur2vsjrjarygawpdwtqteaazfchvw4fg6uql76';
const routerContractAddress = 'orai1x7s4a42y8scugcac5vj2zre96z86lhntq7qg23';
const cosmosSenderAddress = bech32.encode(cosmosChain.bech32Prefix, bech32.decode(oraiSenderAddress).words);
const ibcTransferAmount = '100000000';
const initialBalanceAmount = '10000000000000';

describe.only('IBCModule', () => {
  let oraiPort: string;
  let oraiIbcDenom: string = 'oraib0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0';
  let airiIbcDenom: string = 'oraib0x7e2A35C746F2f7C240B664F1Da4DD100141AE71F';
  let cosmosPort: string = 'transfer';
  let channel = 'channel-0';
  let ics20Contract: CwIcs20LatestClient;
  let airiToken: OraiswapTokenClient;
  beforeEach(async () => {
    // reset state for every test
    cosmosChain = new CWSimulateApp({
      chainId: 'cosmoshub-4',
      bech32Prefix: 'cosmos'
    });
    oraiClient = new SimulateCosmWasmClient({
      chainId: 'Oraichain',
      bech32Prefix: 'orai'
    });
    const { contractAddress } = await oraiClient.deploy(
      oraiSenderAddress,
      path.join(__dirname, 'testdata', 'cw-ics20-latest.wasm'),
      {
        allowlist: [],
        default_timeout: 3600,
        gov_contract: oraiSenderAddress, // mulitsig contract
        swap_router_contract: routerContractAddress
      } as CwIcs20LatestTypes.InstantiateMsg,
      'cw-ics20'
    );

    oraiPort = 'wasm.' + contractAddress;
    ics20Contract = new CwIcs20LatestClient(oraiClient, oraiSenderAddress, contractAddress);

    // init cw20 AIRI token
    const { contractAddress: airiAddress } = await oraiClient.deploy(
      oraiSenderAddress,
      path.join(__dirname, 'testdata', 'oraiswap_token.wasm'),
      {
        decimals: 6,
        symbol: 'AIRI',
        name: 'Airight token',
        initial_balances: [{ address: ics20Contract.contractAddress, amount: initialBalanceAmount }],
        mint: {
          minter: oraiSenderAddress
        }
      } as OraiswapInstantiateMsg,
      'cw-ics20'
    );
    airiToken = new OraiswapTokenClient(oraiClient, oraiSenderAddress, airiAddress);

    // init ibc channel between two chains
    cosmosChain.ibc.relay('channel-0', oraiPort, oraiClient.app);
    await cosmosChain.ibc.sendChannelOpen({
      open_init: {
        channel: {
          counterparty_endpoint: {
            port_id: oraiPort,
            channel_id: channel
          },
          endpoint: {
            port_id: cosmosPort,
            channel_id: channel
          },
          order: IbcOrder.Unordered,
          version: 'ics20-1',
          connection_id: 'connection-0'
        }
      }
    });

    await cosmosChain.ibc.sendChannelConnect({
      open_ack: {
        channel: {
          counterparty_endpoint: {
            port_id: oraiPort,
            channel_id: 'channel-0'
          },
          endpoint: {
            port_id: cosmosPort,
            channel_id: 'channel-0'
          },
          order: IbcOrder.Unordered,
          version: 'ics20-1',
          connection_id: 'connection-0'
        },
        counterparty_version: 'ics20-1'
      }
    });
    // topup
    oraiClient.app.bank.setBalance(ics20Contract.contractAddress, coins(initialBalanceAmount, 'orai'));
  });

  it('cw-ics20-success-should-increase-native-balance-remote-to-local', async () => {
    // create mapping
    await ics20Contract.updateMappingPair({
      assetInfo: {
        native_token: {
          denom: 'orai'
        }
      },
      assetInfoDecimals: 6,
      denom: oraiIbcDenom,
      remoteDecimals: 6,
      localChannelId: 'channel-0'
    });
    // now send ibc package
    const icsPackage: FungibleTokenPacketData = {
      amount: ibcTransferAmount,
      denom: oraiIbcDenom,
      receiver: bobAddress,
      sender: cosmosSenderAddress,
      memo: ''
    };
    let packetReceiveRes = await cosmosChain.ibc.sendPacketReceive({
      packet: {
        data: toBinary(icsPackage),
        src: {
          port_id: cosmosPort,
          channel_id: 'channel-0'
        },
        dest: {
          port_id: oraiPort,
          channel_id: 'channel-0'
        },
        sequence: 27,
        timeout: {
          block: {
            revision: 1,
            height: 12345678
          }
        }
      },
      relayer: cosmosSenderAddress
    });

    const bobBalance = oraiClient.app.bank.getBalance(bobAddress);
    expect(bobBalance).toEqual(coins(ibcTransferAmount, 'orai'));
  });

  it('cw-ics20-fail-no-pair-mapping-should-not-send-balance-remote-to-local', async () => {
    // now send ibc package
    const icsPackage: FungibleTokenPacketData = {
      amount: ibcTransferAmount,
      denom: oraiIbcDenom,
      receiver: bobAddress,
      sender: cosmosSenderAddress,
      memo: ''
    };
    let packetReceiveRes = await cosmosChain.ibc.sendPacketReceive({
      packet: {
        data: toBinary(icsPackage),
        src: {
          port_id: cosmosPort,
          channel_id: 'channel-0'
        },
        dest: {
          port_id: oraiPort,
          channel_id: 'channel-0'
        },
        sequence: 27,
        timeout: {
          block: {
            revision: 1,
            height: 12345678
          }
        }
      },
      relayer: cosmosSenderAddress
    });

    const bobBalance = oraiClient.app.bank.getBalance(bobAddress);
    expect(bobBalance).toEqual([]);
  });

  it('cw-ics20-fail-transfer-native-fail-insufficient-funds-should-not-send-balance-remote-to-local', async () => {
    // create mapping
    await ics20Contract.updateMappingPair({
      assetInfo: {
        native_token: {
          denom: 'orai'
        }
      },
      assetInfoDecimals: 6,
      denom: oraiIbcDenom,
      remoteDecimals: 6,
      localChannelId: 'channel-0'
    });
    // now send ibc package
    const icsPackage: FungibleTokenPacketData = {
      amount: '10000000000001',
      denom: oraiIbcDenom,
      receiver: bobAddress,
      sender: cosmosSenderAddress,
      memo: ''
    };
    let packetReceiveRes = await cosmosChain.ibc.sendPacketReceive({
      packet: {
        data: toBinary(icsPackage),
        src: {
          port_id: cosmosPort,
          channel_id: 'channel-0'
        },
        dest: {
          port_id: oraiPort,
          channel_id: 'channel-0'
        },
        sequence: 27,
        timeout: {
          block: {
            revision: 1,
            height: 12345678
          }
        }
      },
      relayer: cosmosSenderAddress
    });

    const bobBalance = oraiClient.app.bank.getBalance(bobAddress);
    expect(bobBalance).toEqual([]);
  });

  it('cw-ics20-success-transfer-cw20-should-increase-cw20-balance-remote-to-local', async () => {
    // create mapping
    await ics20Contract.updateMappingPair({
      assetInfo: {
        token: {
          contract_addr: airiToken.contractAddress
        }
      },
      assetInfoDecimals: 6,
      denom: airiIbcDenom,
      remoteDecimals: 6,
      localChannelId: 'channel-0'
    });
    // now send ibc package
    const icsPackage: FungibleTokenPacketData = {
      amount: ibcTransferAmount,
      denom: airiIbcDenom,
      receiver: bobAddress,
      sender: cosmosSenderAddress,
      memo: ''
    };
    let packetReceiveRes = await cosmosChain.ibc.sendPacketReceive({
      packet: {
        data: toBinary(icsPackage),
        src: {
          port_id: cosmosPort,
          channel_id: 'channel-0'
        },
        dest: {
          port_id: oraiPort,
          channel_id: 'channel-0'
        },
        sequence: 27,
        timeout: {
          block: {
            revision: 1,
            height: 12345678
          }
        }
      },
      relayer: cosmosSenderAddress
    });

    const bobBalance = await airiToken.balance({ address: bobAddress });
    expect(bobBalance.balance).toEqual(ibcTransferAmount);
  });

  it('cw-ics20-fail-outcoming-channel-larger-than-incoming-should-not-transfer-balance-local-to-remote', async () => {
    // create mapping
    await ics20Contract.updateMappingPair({
      assetInfo: {
        token: {
          contract_addr: airiToken.contractAddress
        }
      },
      assetInfoDecimals: 6,
      denom: airiIbcDenom,
      remoteDecimals: 6,
      localChannelId: 'channel-0'
    });
    // now send ibc package
    const icsPackage: FungibleTokenPacketData = {
      amount: ibcTransferAmount,
      denom: airiIbcDenom,
      receiver: bobAddress,
      sender: cosmosSenderAddress,
      memo: ''
    };
    // transfer from cosmos to oraichain, should pass
    await cosmosChain.ibc.sendPacketReceive({
      packet: {
        data: toBinary(icsPackage),
        src: {
          port_id: cosmosPort,
          channel_id: 'channel-0'
        },
        dest: {
          port_id: oraiPort,
          channel_id: 'channel-0'
        },
        sequence: 27,
        timeout: {
          block: {
            revision: 1,
            height: 12345678
          }
        }
      },
      relayer: cosmosSenderAddress
    });

    // mint new cw20 token to bob
    await airiToken.mint({ amount: '1', recipient: bobAddress });
    // try to send back to cosmos from oraichain, which will fail because outcoming channel balance is greater
    const transferBackMsg: TransferBackMsg = {
      local_channel_id: channel,
      remote_address: cosmosSenderAddress,
      remote_denom: airiIbcDenom
    };
    airiToken.sender = bobAddress;
    try {
      const packetReceiveRes = await airiToken.send({
        amount: (parseInt(ibcTransferAmount) + 1).toString(),
        contract: ics20Contract.contractAddress,
        msg: Buffer.from(JSON.stringify(transferBackMsg)).toString('base64')
      });
    } catch (error) {
      expect(error).toEqual(new Error("Insufficient funds to redeem voucher on channel"));
    }
  });

  it('cw-ics20-success-cw20-should-transfer-balance-to-ibc-wasm-contract-local-to-remote', async () => {
    // create mapping
    await ics20Contract.updateMappingPair({
      assetInfo: {
        token: {
          contract_addr: airiToken.contractAddress
        }
      },
      assetInfoDecimals: 6,
      denom: airiIbcDenom,
      remoteDecimals: 6,
      localChannelId: 'channel-0'
    });
    // now send ibc package
    const icsPackage: FungibleTokenPacketData = {
      amount: ibcTransferAmount,
      denom: airiIbcDenom,
      receiver: bobAddress,
      sender: cosmosSenderAddress,
      memo: ''
    };
    // transfer from cosmos to oraichain, should pass
    await cosmosChain.ibc.sendPacketReceive({
      packet: {
        data: toBinary(icsPackage),
        src: {
          port_id: cosmosPort,
          channel_id: 'channel-0'
        },
        dest: {
          port_id: oraiPort,
          channel_id: 'channel-0'
        },
        sequence: 27,
        timeout: {
          block: {
            revision: 1,
            height: 12345678
          }
        }
      },
      relayer: cosmosSenderAddress
    });

    // try to send back to cosmos from oraichain, which will pass
    const transferBackMsg: TransferBackMsg = {
      local_channel_id: channel,
      remote_address: cosmosSenderAddress,
      remote_denom: airiIbcDenom
    };
    airiToken.sender = bobAddress;
    await airiToken.send({
      amount: ibcTransferAmount,
      contract: ics20Contract.contractAddress,
      msg: Buffer.from(JSON.stringify(transferBackMsg)).toString('base64')
    });
    const ibcWasmAiriBalance = await airiToken.balance({ address: ics20Contract.contractAddress });
    expect(ibcWasmAiriBalance.balance).toEqual(initialBalanceAmount);
  });
});
