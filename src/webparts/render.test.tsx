/**
 * Røyktest: tegner hver webdel med testdata i jsdom og sjekker at noe faktisk vises.
 * Fanger krasj under rendering, som ellers gir en helt blank webdel i SharePoint.
 */

jest.mock('@microsoft/sp-core-library', () => ({ DisplayMode: { Read: 1, Edit: 2 } }));
jest.mock('../shared/services/SharePointDataService', () => ({ SharePointDataService: class {} }));
jest.mock('ForslagslisteWebPartStrings', () => amd('./forslagsliste/loc/nb-no.js'), { virtual: true });
jest.mock('SokWebPartStrings', () => amd('./sok/loc/nb-no.js'), { virtual: true });
jest.mock('NyttForslagWebPartStrings', () => amd('./nyttForslag/loc/nb-no.js'), { virtual: true });
jest.mock('ForslagWebPartStrings', () => amd('./forslag/loc/nb-no.js'), { virtual: true });
jest.mock('SaksbehandlingWebPartStrings', () => amd('./saksbehandling/loc/nb-no.js'), { virtual: true });

function amd(path: string): unknown {
  let result: unknown;
  (global as unknown as { define: unknown }).define = (_deps: unknown, factory: () => unknown) => {
    result = factory();
  };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(path);
  return result;
}

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { DisplayMode } from '@microsoft/sp-core-library';



import { KomInnProvider } from '../shared/components';
import { MockDataService } from '../shared/services/MockDataService';
import { Forslagsliste } from './forslagsliste/components/Forslagsliste';
import { Sok } from './sok/components/Sok';
import { NyttForslag } from './nyttForslag/components/NyttForslag';
import { Forslag } from './forslag/components/Forslag';
import { Saksbehandling } from './saksbehandling/components/Saksbehandling';

const containers: HTMLDivElement[] = [];

afterEach(() => {
  for (const c of containers.splice(0)) {
    ReactDOM.unmountComponentAtNode(c);
    c.remove();
  }
});

async function renderWithData(element: React.ReactElement): Promise<HTMLDivElement> {
  const container = document.createElement('div');
  containers.push(container);
  document.body.appendChild(container);
  const service = new MockDataService();
  await act(async () => {
    ReactDOM.render(<KomInnProvider instanceId="test" service={service}>{element}</KomInnProvider>, container);
  });
  // La asynkrone kall i hooks fullføre.
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  return container;
}

describe('webdelene tegnes med testdata', () => {
  it('Forslagsliste', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Populære" mode="published" layout="cards" period="all" top={6} defaultOrder="likes" showFilters showSorting emptyText="Tom" displayMode={DisplayMode.Read} onTitleChange={() => undefined} />
    );
    expect(c.textContent).toContain('Klimasmart meny i skolekantinene');
  });

  it('Søk i forslag', async () => {
    const c = await renderWithData(<Sok placeholder="Søk etter forslag" maxResults={8} />);
    expect(c.querySelector('input')).not.toBeNull();
  });

  it('Nytt forslag', async () => {
    const c = await renderWithData(
      <NyttForslag introText="Hei" successText="" competitionRef="" displayMode={DisplayMode.Read} webUrl="https://x" showAmount showChallenges showSolution={false} showUsefulForOthers={false} showTags showGoals showImage showLocation={false} showInspiredBy />
    );
    expect(c.textContent).toContain('Send inn forslag');
  });

  it('Forslag', async () => {
    const c = await renderWithData(<Forslag suggestionId={1} showMap={false} showEvaluation showComments showRelated />);
    expect(c.textContent).toContain('Solceller på Risenga svømmehall');
  });

  it('Saksbehandling', async () => {
    const c = await renderWithData(<Saksbehandling defaultStatuses={['Sendt inn', 'Vurderes']} maxItems={100} />);
    expect(c.textContent).toContain('Behandle');
  });
});
