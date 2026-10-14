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
const listDefaults = {
  emptyText: 'Tom',
  paging: 'none' as const,
  showSeeAll: true,
  seeAllUrl: '',
  modeFromUrl: false,
  displayMode: DisplayMode.Read,
  onTitleChange: () => undefined
};

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
      <Forslagsliste title="Aktuelle" mode="published" layout="cards" period="all" top={6} defaultOrder="likes" showFilters showSorting showImages highlightMonthly {...listDefaults} />
    );
    const text = c.textContent ?? '';
    expect(text).toContain('Månedens forslag');
    // Månedens forslag vises først og bare én gang.
    expect(text.split('Klimasmart meny i skolekantinene').length - 1).toBe(1);
    expect(text.indexOf('Klimasmart meny')).toBeLessThan(text.indexOf('Solceller på Risenga'));
  });

  it('Forslagsliste – antallet inkluderer månedens forslag', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Aktuelle" mode="published" layout="cards" period="all" top={1} defaultOrder="likes" showFilters={false} showSorting={false} showImages highlightMonthly {...listDefaults} />
    );
    expect(c.querySelectorAll('li')).toHaveLength(1);
    expect(c.textContent).toContain('Månedens forslag');
    expect(c.textContent).not.toContain('Vis flere');
  });

  it('Forslagsliste – «Se alle» ved overskriften, som i SharePoint', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Mine" mode="mine" layout="compact" period="all" top={1} defaultOrder="created" showFilters={false} showSorting={false} showImages={false} highlightMonthly={false} {...listDefaults} />
    );
    const link = Array.from(c.querySelectorAll('a')).find((a) => a.textContent === 'Se alle');
    expect(link?.getAttribute('href')).toBe('https://mock.sharepoint.com/sites/kominn/SitePages/AlleForslag.aspx?visning=mine');
    expect(c.querySelector('nav')).toBeNull();
  });

  it('Forslagsliste – ingen «Se alle» når alt allerede vises', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Mine" mode="mine" layout="compact" period="all" top={50} defaultOrder="created" showFilters={false} showSorting={false} showImages={false} highlightMonthly={false} {...listDefaults} />
    );
    expect(c.textContent).toContain('Solceller på Risenga');
    expect(c.textContent).not.toContain('Se alle');
  });

  it('Forslagsliste – standardbilde for forslag uten bilde', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Aktuelle" mode="published" layout="cards" period="all" top={6} defaultOrder="likes" showFilters={false} showSorting={false} showImages highlightMonthly={false} {...listDefaults} />
    );
    const sources = Array.from(c.querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(sources).toHaveLength(c.querySelectorAll('li').length);
    expect(sources).toContain('https://mock.sharepoint.com/sites/kominn/Ikoner/kominn-standardbilde.jpg');
  });

  it('Forslagsliste – forrige/neste på siden Alle forslag', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Alle forslag" mode="published" layout="cards" period="all" top={1} defaultOrder="created" showFilters={false} showSorting={false} showImages={false} highlightMonthly={false} {...listDefaults} paging="prevNext" showSeeAll={false} />
    );
    expect(c.querySelectorAll('li')).toHaveLength(1);
    expect(c.textContent).not.toContain('Se alle');
    expect(c.textContent).toContain('Side 1');
    const next = Array.from(c.querySelectorAll('button')).find((b) => b.textContent === 'Neste');
    const firstTitles = Array.from(c.querySelectorAll('li a')).map((a) => a.textContent);
    await act(async () => {
      next?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
    expect(c.textContent).toContain('Side 2');
    const secondTitles = Array.from(c.querySelectorAll('li a')).map((a) => a.textContent);
    expect(secondTitles).toHaveLength(1);
    expect(secondTitles.some((t) => firstTitles.includes(t))).toBe(false);
  });

  it('Forslagsliste – mine forslag uten bilder', async () => {
    const c = await renderWithData(
      <Forslagsliste title="Mine" mode="mine" layout="compact" period="all" top={6} defaultOrder="created" showFilters={false} showSorting={false} showImages={false} highlightMonthly={false} {...listDefaults} />
    );
    expect(c.textContent).toContain('Solceller på Risenga');
    expect(c.querySelectorAll('img')).toHaveLength(0);
    // Status står på samme linje som dato og tall, ikke på egen linje.
    const meta = c.querySelector('li .fui-Caption1')?.parentElement;
    expect(meta?.textContent).toMatch(/Publisert|Sendt inn|Suksess|Promotert/);
  });

  it('Søk i forslag', async () => {
    const c = await renderWithData(<Sok placeholder="Søk etter forslag" maxResults={8} />);
    expect(c.querySelector('input')).not.toBeNull();
  });

  it('Nytt forslag', async () => {
    const c = await renderWithData(
      <NyttForslag introText="Hei" successText="" competitionRef="" displayMode={DisplayMode.Read} webUrl="https://x" showAmount showFocusAreas showManagerInformed={false} showChallenges showSolution={false} showUsefulForOthers={false} showTags showGoals showImage showLocation={false} showInspiredBy />
    );
    expect(c.textContent).toContain('Send inn forslag');
  });

  it('Nytt forslag – nedstrippet skjema for 2026', async () => {
    const c = await renderWithData(
      <NyttForslag
        introText=""
        successText=""
        competitionRef=""
        displayMode={DisplayMode.Read}
        webUrl="https://x"
        summaryLabel="Beskrivelse av tiltaket (Er dette noe helt nytt, eller er dere inspirert av andre?)"
        summaryHint=""
        amountLabel="Hvor mye søker du om? (inntil 15 000,-)"
        imageSectionTitle="Bilde (husk rettigheter)"
        showAmount
        showChallenges
        showFocusAreas={false}
        showTags={false}
        showGoals={false}
        showImage
        showLocation={false}
        showInspiredBy={false}
        showManagerInformed
        showSolution={false}
        showUsefulForOthers={false}
      />
    );
    const text = c.textContent ?? '';
    expect(text).toContain('Er dette noe helt nytt, eller er dere inspirert av andre?');
    expect(text).not.toContain('Hva vil du gjøre, og hvorfor?');
    expect(text).toContain('(inntil 15 000,-)');
    expect(text).not.toContain('Innsatsområder');
    expect(text).not.toContain('Tags');
    expect(text).not.toContain('Bærekraftsmål');
    expect(text).toContain('Bilde (husk rettigheter)');
    expect(text).not.toContain('Bilde og sted');
    expect(text).not.toContain('Inspirert av');
    expect(text).toContain('Min nærmeste leder er orientert om søknaden');
    expect(c.querySelectorAll('input[type="radio"]')).toHaveLength(2);
  });

  it('Nytt forslag i redigeringsmodus', async () => {
    window.history.pushState({}, '', '/?rediger=1');
    try {
      const c = await renderWithData(
        <NyttForslag introText="" successText="" competitionRef="" displayMode={DisplayMode.Read} webUrl="https://x" showAmount showFocusAreas showManagerInformed={false} showChallenges showSolution={false} showUsefulForOthers={false} showTags showGoals showImage showLocation={false} showInspiredBy />
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
