import { SOL_API_HOST } from '@common/constants';
import { hasAPIError } from '@/utils/errors';

import { SolApiPriceResponse } from '@/types';

export const getSolPrice = async () => {
  try {
    const resp = await fetch(`${SOL_API_HOST}/v1/prices?tokens=SOL`, { mode: 'cors' });
    const { batchData, batchError, error } = (await resp.json()) as SolApiPriceResponse<'SOL'>;

    if (hasAPIError(batchError, error)) {
      return 0; // TODO fallback
    }

    return batchData.SOL.priceUsd;
  } catch {
    return 0; // TODO think fallback
  }
};
