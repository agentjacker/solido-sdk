import { lamportsToSol, solToLamports } from '@/utils/formatters';
import { ErrorWrapper } from '@/utils/errorWrapper';
import { ERROR_CODE } from '@/constants';

export const checkMaxExceed = (amount: number, maxInLamports: number) => {
  if (solToLamports(amount) > maxInLamports) {
    throw new ErrorWrapper({
      code: ERROR_CODE.EXCEED_MAX,
      message: `Amount must not exceed MAX(${lamportsToSol(maxInLamports)})`,
  });
  }
};