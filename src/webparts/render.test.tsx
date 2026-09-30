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

// jsdom har ikke ResizeObserver, som Fluent bruker i MessageBar. Nettleserne har det.
(global as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
  public observe(): void {
    /* stub */
  }
  public unobserve(): void {
    /* stub */
  }
  public disconnect(): void {
    /* stub */
  }
};

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
      <Forslagsliste title="Aktuelle" mode="published" layout="cards" period="all" top={6} defaultOrder="likes" showFilters showSorting showImages highlightMonthly emptyText="Tom" displayMode={DisplayMode.Read} onTitleChange={() => undefined} />
    );
    const text = c.textContent ?? '';
    expect(text).toContain('Månedens forslag');
    // Månedens forslag vises først og bare én gang.
    expect(text.split('Klimasmart meny i skolekantinene').length - 1).toBe(1);
    expect(text.indexOf('Klimasmart meny')).toBeLessThan(text.indexOf('Solceller på Risenga'));
  });

  it('Forslagsliste – mine forslag uten bilder', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Mine" mode="mine" layout="compact" period="all" top={6} defaultOrder="created" showFilters={false} showSorting={false} showImages={false} highlightMonthly={false} emptyText="Tom" displayMode={DisplayMode.Read} onTitleChange={() => undefined} />
    );
    expect(c.textContent).toContain('Solceller på Risenga');
    expect(c.querySelectorAll('img')).toHaveLength(0);
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

  it('Nytt forslag i redigeringsmodus', async () => {
    window.history.pushState({}, '', '/?rediger=1');
    try {
      const c = await renderWithData(
        <NyttForslag introText="" successText="" competitionRef="" displayMode={DisplayMode.Read} webUrl="https://x" showAmount showChallenges showSolution={false} showUsefulForOthers={false} showTags showGoals showImage showLocation={false} showInspiredBy />
      );
      expect(c.textContent).toContain('Du redigerer forslaget');
      expect(c.textContent).toContain('Lagre endringer');
      expect((c.querySelector('#nf-title') as HTMLInputElement).value).toBe('Solceller på Risenga svømmehall');
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('Forslag', async () => {
    const c = await renderWithData(<Forslag suggestionId={1} showMap={false} showEvaluation showComments showRelated />);
    expect(c.textContent).toContain('Solceller på Risenga svømmehall');
    expect(c.textContent).toContain('Rediger forslaget');
  });

  it('Forslag viser samme antall kommentarer overalt', async () => {
    // Forslag 2 har telleren 8 i testdataene, men bare 1 kommentar i kommentarlisten.
    const c = await renderWithData(<Forslag suggestionId={2} showMap={false} showEvaluation={false} showComments showRelated={false} />);
    const text = c.textContent ?? '';
    expect(text).toContain('Kommentarer (1)');
    expect(text).toContain('1 kommentarer');
    expect(text).not.toContain('8 kommentarer');
  });

  it('Saksbehandling', async () => {
    const c = await renderWithData(<Saksbehandling defaultStatuses={['Sendt inn', 'Vurderes']} maxItems={100} />);
    expect(c.textContent).toContain('Behandle');
  });
});
