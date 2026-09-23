import type { ISPFXContext } from '@pnp/sp';
import type { IDataService } from './IDataService';
import { MockDataService } from './MockDataService';
import { SharePointDataService } from './SharePointDataService';

export const MOCK_QUERY_KEY = 'kominnMock';

/** True når siden er åpnet med ?kominnMock=1, slik at webdelene kan kjøres uten lister. */
export function isMockMode(): boolean {
  try {
    return new URLSearchParams(window.location.search).get(MOCK_QUERY_KEY) === '1';
  } catch {
    return false;
  }
}

export interface DataServiceOptions {
  /** Absolutt URL til KomInn-området. Tom eller undefined betyr området webdelen står på. */
  siteUrl?: string;
  /** Tving mock-datalaget, uavhengig av URL. */
  useMock?: boolean;
}

export function createDataService(context: ISPFXContext, options: DataServiceOptions = {}): IDataService {
  if (options.useMock ?? isMockMode()) return new MockDataService({ latencyMs: 150 });
  return new SharePointDataService(context, options.siteUrl);
}
