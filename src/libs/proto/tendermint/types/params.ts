/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Duration } from "../../google/protobuf/duration";

export const protobufPackage = "tendermint.types";

/**
 * ConsensusParams contains consensus critical parameters that determine the
 * validity of blocks.
 */
export interface ConsensusParams {
  block: BlockParams | undefined;
  evidence: EvidenceParams | undefined;
  validator: ValidatorParams | undefined;
  version: VersionParams | undefined;
}

/** BlockParams contains limits on the block size. */
export interface BlockParams {
  /**
   * Max block size, in bytes.
   * Note: must be greater than 0
   */
  maxBytes: string;
  /**
   * Max gas per block.
   * Note: must be greater or equal to -1
   */
  maxGas: string;
  /**
   * Minimum time increment between consecutive blocks (in milliseconds) If the
   * block header timestamp is ahead of the system clock, decrease this value.
   *
   * Not exposed to the application.
   */
  timeIotaMs: string;
}

/** EvidenceParams determine how we handle evidence of malfeasance. */
export interface EvidenceParams {
  /**
   * Max age of evidence, in blocks.
   *
   * The basic formula for calculating this is: MaxAgeDuration / {average block
   * time}.
   */
  maxAgeNumBlocks: string;
  /**
   * Max age of evidence, in time.
   *
   * It should correspond with an app's "unbonding period" or other similar
   * mechanism for handling [Nothing-At-Stake
   * attacks](https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ#what-is-the-nothing-at-stake-problem-and-how-can-it-be-fixed).
   */
  maxAgeDuration:
    | Duration
    | undefined;
  /**
   * This sets the maximum size of total evidence in bytes that can be committed in a single block.
   * and should fall comfortably under the max block bytes.
   * Default is 1048576 or 1MB
   */
  maxBytes: string;
}

/**
 * ValidatorParams restrict the public key types validators can use.
 * NOTE: uses ABCI pubkey naming, not Amino names.
 */
export interface ValidatorParams {
  pubKeyTypes: string[];
}

/** VersionParams contains the ABCI application version. */
export interface VersionParams {
  appVersion: string;
}

/**
 * HashedParams is a subset of ConsensusParams.
 *
 * It is hashed into the Header.ConsensusHash.
 */
export interface HashedParams {
  blockMaxBytes: string;
  blockMaxGas: string;
}

function createBaseConsensusParams(): ConsensusParams {
  return { block: undefined, evidence: undefined, validator: undefined, version: undefined };
}

export const ConsensusParams = {
  encode(message: ConsensusParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.block !== undefined) {
      BlockParams.encode(message.block, writer.uint32(10).fork()).ldelim();
    }
    if (message.evidence !== undefined) {
      EvidenceParams.encode(message.evidence, writer.uint32(18).fork()).ldelim();
    }
    if (message.validator !== undefined) {
      ValidatorParams.encode(message.validator, writer.uint32(26).fork()).ldelim();
    }
    if (message.version !== undefined) {
      VersionParams.encode(message.version, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConsensusParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.block = BlockParams.decode(reader, reader.uint32());
          break;
        case 2:
          message.evidence = EvidenceParams.decode(reader, reader.uint32());
          break;
        case 3:
          message.validator = ValidatorParams.decode(reader, reader.uint32());
          break;
        case 4:
          message.version = VersionParams.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ConsensusParams {
    return {
      block: isSet(object.block) ? BlockParams.fromJSON(object.block) : undefined,
      evidence: isSet(object.evidence) ? EvidenceParams.fromJSON(object.evidence) : undefined,
      validator: isSet(object.validator) ? ValidatorParams.fromJSON(object.validator) : undefined,
      version: isSet(object.version) ? VersionParams.fromJSON(object.version) : undefined,
    };
  },

  toJSON(message: ConsensusParams): unknown {
    const obj: any = {};
    message.block !== undefined && (obj.block = message.block ? BlockParams.toJSON(message.block) : undefined);
    message.evidence !== undefined &&
      (obj.evidence = message.evidence ? EvidenceParams.toJSON(message.evidence) : undefined);
    message.validator !== undefined &&
      (obj.validator = message.validator ? ValidatorParams.toJSON(message.validator) : undefined);
    message.version !== undefined &&
      (obj.version = message.version ? VersionParams.toJSON(message.version) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<ConsensusParams>, I>>(base?: I): ConsensusParams {
    return ConsensusParams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ConsensusParams>, I>>(object: I): ConsensusParams {
    const message = createBaseConsensusParams();
    message.block = (object.block !== undefined && object.block !== null)
      ? BlockParams.fromPartial(object.block)
      : undefined;
    message.evidence = (object.evidence !== undefined && object.evidence !== null)
      ? EvidenceParams.fromPartial(object.evidence)
      : undefined;
    message.validator = (object.validator !== undefined && object.validator !== null)
      ? ValidatorParams.fromPartial(object.validator)
      : undefined;
    message.version = (object.version !== undefined && object.version !== null)
      ? VersionParams.fromPartial(object.version)
      : undefined;
    return message;
  },
};

function createBaseBlockParams(): BlockParams {
  return { maxBytes: "0", maxGas: "0", timeIotaMs: "0" };
}

export const BlockParams = {
  encode(message: BlockParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.maxBytes !== "0") {
      writer.uint32(8).int64(message.maxBytes);
    }
    if (message.maxGas !== "0") {
      writer.uint32(16).int64(message.maxGas);
    }
    if (message.timeIotaMs !== "0") {
      writer.uint32(24).int64(message.timeIotaMs);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BlockParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxBytes = longToString(reader.int64() as Long);
          break;
        case 2:
          message.maxGas = longToString(reader.int64() as Long);
          break;
        case 3:
          message.timeIotaMs = longToString(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BlockParams {
    return {
      maxBytes: isSet(object.maxBytes) ? String(object.maxBytes) : "0",
      maxGas: isSet(object.maxGas) ? String(object.maxGas) : "0",
      timeIotaMs: isSet(object.timeIotaMs) ? String(object.timeIotaMs) : "0",
    };
  },

  toJSON(message: BlockParams): unknown {
    const obj: any = {};
    message.maxBytes !== undefined && (obj.maxBytes = message.maxBytes);
    message.maxGas !== undefined && (obj.maxGas = message.maxGas);
    message.timeIotaMs !== undefined && (obj.timeIotaMs = message.timeIotaMs);
    return obj;
  },

  create<I extends Exact<DeepPartial<BlockParams>, I>>(base?: I): BlockParams {
    return BlockParams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BlockParams>, I>>(object: I): BlockParams {
    const message = createBaseBlockParams();
    message.maxBytes = object.maxBytes ?? "0";
    message.maxGas = object.maxGas ?? "0";
    message.timeIotaMs = object.timeIotaMs ?? "0";
    return message;
  },
};

function createBaseEvidenceParams(): EvidenceParams {
  return { maxAgeNumBlocks: "0", maxAgeDuration: undefined, maxBytes: "0" };
}

export const EvidenceParams = {
  encode(message: EvidenceParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.maxAgeNumBlocks !== "0") {
      writer.uint32(8).int64(message.maxAgeNumBlocks);
    }
    if (message.maxAgeDuration !== undefined) {
      Duration.encode(message.maxAgeDuration, writer.uint32(18).fork()).ldelim();
    }
    if (message.maxBytes !== "0") {
      writer.uint32(24).int64(message.maxBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvidenceParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvidenceParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxAgeNumBlocks = longToString(reader.int64() as Long);
          break;
        case 2:
          message.maxAgeDuration = Duration.decode(reader, reader.uint32());
          break;
        case 3:
          message.maxBytes = longToString(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EvidenceParams {
    return {
      maxAgeNumBlocks: isSet(object.maxAgeNumBlocks) ? String(object.maxAgeNumBlocks) : "0",
      maxAgeDuration: isSet(object.maxAgeDuration) ? Duration.fromJSON(object.maxAgeDuration) : undefined,
      maxBytes: isSet(object.maxBytes) ? String(object.maxBytes) : "0",
    };
  },

  toJSON(message: EvidenceParams): unknown {
    const obj: any = {};
    message.maxAgeNumBlocks !== undefined && (obj.maxAgeNumBlocks = message.maxAgeNumBlocks);
    message.maxAgeDuration !== undefined &&
      (obj.maxAgeDuration = message.maxAgeDuration ? Duration.toJSON(message.maxAgeDuration) : undefined);
    message.maxBytes !== undefined && (obj.maxBytes = message.maxBytes);
    return obj;
  },

  create<I extends Exact<DeepPartial<EvidenceParams>, I>>(base?: I): EvidenceParams {
    return EvidenceParams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<EvidenceParams>, I>>(object: I): EvidenceParams {
    const message = createBaseEvidenceParams();
    message.maxAgeNumBlocks = object.maxAgeNumBlocks ?? "0";
    message.maxAgeDuration = (object.maxAgeDuration !== undefined && object.maxAgeDuration !== null)
      ? Duration.fromPartial(object.maxAgeDuration)
      : undefined;
    message.maxBytes = object.maxBytes ?? "0";
    return message;
  },
};

function createBaseValidatorParams(): ValidatorParams {
  return { pubKeyTypes: [] };
}

export const ValidatorParams = {
  encode(message: ValidatorParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.pubKeyTypes) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pubKeyTypes.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ValidatorParams {
    return { pubKeyTypes: Array.isArray(object?.pubKeyTypes) ? object.pubKeyTypes.map((e: any) => String(e)) : [] };
  },

  toJSON(message: ValidatorParams): unknown {
    const obj: any = {};
    if (message.pubKeyTypes) {
      obj.pubKeyTypes = message.pubKeyTypes.map((e) => e);
    } else {
      obj.pubKeyTypes = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ValidatorParams>, I>>(base?: I): ValidatorParams {
    return ValidatorParams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ValidatorParams>, I>>(object: I): ValidatorParams {
    const message = createBaseValidatorParams();
    message.pubKeyTypes = object.pubKeyTypes?.map((e) => e) || [];
    return message;
  },
};

function createBaseVersionParams(): VersionParams {
  return { appVersion: "0" };
}

export const VersionParams = {
  encode(message: VersionParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.appVersion !== "0") {
      writer.uint32(8).uint64(message.appVersion);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersionParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.appVersion = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): VersionParams {
    return { appVersion: isSet(object.appVersion) ? String(object.appVersion) : "0" };
  },

  toJSON(message: VersionParams): unknown {
    const obj: any = {};
    message.appVersion !== undefined && (obj.appVersion = message.appVersion);
    return obj;
  },

  create<I extends Exact<DeepPartial<VersionParams>, I>>(base?: I): VersionParams {
    return VersionParams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<VersionParams>, I>>(object: I): VersionParams {
    const message = createBaseVersionParams();
    message.appVersion = object.appVersion ?? "0";
    return message;
  },
};

function createBaseHashedParams(): HashedParams {
  return { blockMaxBytes: "0", blockMaxGas: "0" };
}

export const HashedParams = {
  encode(message: HashedParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.blockMaxBytes !== "0") {
      writer.uint32(8).int64(message.blockMaxBytes);
    }
    if (message.blockMaxGas !== "0") {
      writer.uint32(16).int64(message.blockMaxGas);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HashedParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHashedParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.blockMaxBytes = longToString(reader.int64() as Long);
          break;
        case 2:
          message.blockMaxGas = longToString(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HashedParams {
    return {
      blockMaxBytes: isSet(object.blockMaxBytes) ? String(object.blockMaxBytes) : "0",
      blockMaxGas: isSet(object.blockMaxGas) ? String(object.blockMaxGas) : "0",
    };
  },

  toJSON(message: HashedParams): unknown {
    const obj: any = {};
    message.blockMaxBytes !== undefined && (obj.blockMaxBytes = message.blockMaxBytes);
    message.blockMaxGas !== undefined && (obj.blockMaxGas = message.blockMaxGas);
    return obj;
  },

  create<I extends Exact<DeepPartial<HashedParams>, I>>(base?: I): HashedParams {
    return HashedParams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<HashedParams>, I>>(object: I): HashedParams {
    const message = createBaseHashedParams();
    message.blockMaxBytes = object.blockMaxBytes ?? "0";
    message.blockMaxGas = object.blockMaxGas ?? "0";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToString(long: Long) {
  return long.toString();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
