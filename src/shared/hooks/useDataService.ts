import * as React from 'react';
import type { IDataService } from '../services';

const DataServiceContext = React.createContext<IDataService | undefined>(undefined);

export const DataServiceProvider: React.FC<{ service: IDataService; children?: React.ReactNode }> = ({ service, children }) =>
  React.createElement(DataServiceContext.Provider, { value: service }, children);

/** Henter datalaget som webdelen har satt opp i DataServiceProvider. */
export function useDataService(): IDataService {
  const service = React.useContext(DataServiceContext);
  if (!service) throw new Error('useDataService må brukes innenfor en DataServiceProvider.');
  return service;
}
