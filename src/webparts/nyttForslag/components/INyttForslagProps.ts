import type { BaseComponentContext } from '@microsoft/sp-component-base';
import type { DisplayMode } from '@microsoft/sp-core-library';

export interface NyttForslagSections {
  showAmount: boolean;
  showFocusAreas: boolean;
  showManagerInformed: boolean;
  showChallenges: boolean;
  showSolution: boolean;
  showUsefulForOthers: boolean;
  showTags: boolean;
  showGoals: boolean;
  showImage: boolean;
  showLocation: boolean;
  showInspiredBy: boolean;
}

/** Tekster som kan overstyres i egenskapsruten. Tom ledetekst gir standardteksten; tom hjelpetekst fjerner den. */
export interface NyttForslagTexts {
  summaryLabel?: string;
  summaryHint?: string;
  amountLabel?: string;
  amountHint?: string;
  imageSectionTitle?: string;
}

export interface INyttForslagProps extends NyttForslagSections, NyttForslagTexts {
  introText: string;
  successText: string;
  competitionRef: string;
  displayMode: DisplayMode;
  /** Absolutt URL til KomInn-området webdelen er koblet til. */
  webUrl: string;
  /** SPFx-konteksten, brukes av SharePoints filvelger for bilder. */
  context?: BaseComponentContext;
}
