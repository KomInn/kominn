import type { DisplayMode } from '@microsoft/sp-core-library';

/** Hvilke forslag listen viser. Styres fra egenskapsruten. */
export type ListMode = 'published' | 'promoted' | 'success' | 'monthly' | 'mine';

export interface IForslagslisteProps {
  title: string;
  mode: ListMode;
  top: number;
  emptyText: string;
  isDarkTheme: boolean;
  displayMode: DisplayMode;
  onTitleChange: (title: string) => void;
}
