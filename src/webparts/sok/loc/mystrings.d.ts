declare interface ISokWebPartStrings {
  PropertyPaneDescription: string;
  SettingsGroupName: string;
  SourceGroupName: string;
  PlaceholderLabel: string;
  MaxResultsLabel: string;
  SiteUrlFieldLabel: string;
  SiteUrlFieldDescription: string;
  DefaultPlaceholder: string;
  NoResults: string;
  Searching: string;
}

declare module 'SokWebPartStrings' {
  const strings: ISokWebPartStrings;
  export = strings;
}
