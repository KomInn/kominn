import type { DisplayMode } from '@microsoft/sp-core-library';

export interface NyttForslagSections {
  showAmount: boolean;
  showChallenges: boolean;
  showSolution: boolean;
  showUsefulForOthers: boolean;
  showTags: boolean;
  showGoals: boolean;
  showImage: boolean;
  showLocation: boolean;
  showInspiredBy: boolean;
}

export interface INyttForslagProps extends NyttForslagSections {
  introText: string;
  successText: string;
  competitionRef: string;
  displayMode: DisplayMode;
  /** Absolutt URL til KomInn-området webdelen er koblet til. */
  webUrl: string;
}
