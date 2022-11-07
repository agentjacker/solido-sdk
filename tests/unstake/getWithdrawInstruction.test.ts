import { Keypair, TransactionInstruction } from '@solana/web3.js';
import { LidoVersion, SolidoSDK, solToLamports } from '@/index';
import { clusterProgramAddresses, INSTRUCTION_V2, VALIDATOR_LIST } from '@/constants';
import {
  getHeaviestValidator,
  getValidatorIndex,
  getWithdrawInstruction,
  withdrawDataLayout,
} from '@/unstake';

import { heaviestValidator, stakeAuthority, validators } from '../data/snapshot';
import { mockValidatorList } from '../mocks/validators';
import { getConnection } from '../helpers';

describe('getHeaviestValidator', () => {
  test('heaviest validator from validators list', () => {
    const validator = getHeaviestValidator(validators);

    expect(validator).toStrictEqual(heaviestValidator);
  });
});

describe('getValidatorIndex', () => {
  test('get heaviest validator index from validators list', () => {
    const validator = getHeaviestValidator(validators);
    const index = getValidatorIndex(validators, validator);

    expect(index).toEqual(0);
  });
});

describe('getWithdrawInstruction', () => {
  let withdrawInstruction: TransactionInstruction;
  const payerAddress = Keypair.generate().publicKey;
  const senderStSolAccountAddress = Keypair.generate().publicKey;
  const stakeAccount = Keypair.generate().publicKey;
  const amount = 10;
  const cluster = 'testnet';
  let sdk;

  const { solidoInstanceId, solidoProgramId, stSolMintAddress } = clusterProgramAddresses[cluster];

  beforeAll(async () => {
    const connection = getConnection();
    sdk = new SolidoSDK(cluster, connection);

    mockValidatorList(connection);

    withdrawInstruction = await getWithdrawInstruction.call(sdk, {
      amount,
      payerAddress,
      senderStSolAccountAddress,
      stakeAccount,
    });
  });

  test('withdrawInstruction keys validity', () => {
    const { keys } = withdrawInstruction;

    expect(keys).toHaveLength(13);

    expect(keys[0].pubkey).toStrictEqual(solidoInstanceId);
    expect(keys[1].pubkey).toStrictEqual(payerAddress);
    expect(keys[2].pubkey).toStrictEqual(senderStSolAccountAddress);
    expect(keys[3].pubkey).toStrictEqual(stSolMintAddress);
    expect(keys[4].pubkey).toStrictEqual(heaviestValidator.vote_account_address);
    expect(keys[5].pubkey).toStrictEqual(heaviestValidator.stake_account_address);
    expect(keys[6].pubkey).toStrictEqual(stakeAccount);
    expect(keys[7].pubkey).toStrictEqual(stakeAuthority);
    expect(keys[8].pubkey).toStrictEqual(VALIDATOR_LIST);
  });

  test('withdrawInstruction.programId is correct', () => {
    expect(withdrawInstruction.programId).toStrictEqual(solidoProgramId);
  });

  test('withdrawInstruction.data is fulled as expected', () => {
    const data = withdrawDataLayout[LidoVersion.v2].decode(withdrawInstruction.data);

    expect(data.instruction).toBe(INSTRUCTION_V2.UNSTAKE);
    expect(data.amount).toBe(solToLamports(amount));
  });
});

describe('calculateStakeAccountAddress', () => {
  test.todo('think about it');
});
