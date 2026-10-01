import * as React from 'react';
import { Combobox, Option, Tag, TagGroup, makeStyles, tokens } from '@fluentui/react-components';
import type { SuggestionRef } from '../models';
import { useDataService } from '../hooks';

const NO_IDS: number[] = [];

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  combo: { minWidth: '0', width: '100%' }
});

export interface SuggestionPickerProps {
  selected: SuggestionRef[];
  onChange: (selected: SuggestionRef[]) => void;
  placeholder: string;
  noResultsText: string;
  /** Forslag som ikke skal kunne velges, f.eks. det som redigeres. */
  excludeIds?: number[];
  inputId: string;
}

/** Søk opp og velg andre forslag, f.eks. «inspirert av». */
export const SuggestionPicker: React.FC<SuggestionPickerProps> = ({ selected, onChange, placeholder, noResultsText, excludeIds = NO_IDS, inputId }) => {
  const styles = useStyles();
  const service = useDataService();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SuggestionRef[]>([]);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults((r) => (r.length ? [] : r));
      return;
    }
    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(() => {
      service
        .searchSuggestions(term, 8)
        .then((found) => {
          if (cancelled) return;
          setResults(found.filter((s) => !excludeIds.includes(s.id) && !selected.some((x) => x.id === s.id)).map((s) => ({ id: s.id, title: s.title })));
        })
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setSearching(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, service, excludeIds, selected]);

  return (
    <div className={styles.root}>
      {selected.length > 0 && (
        <TagGroup onDismiss={(_e, data) => onChange(selected.filter((s) => String(s.id) !== data.value))} aria-label={placeholder}>
          {selected.map((s) => (
            <Tag key={s.id} value={String(s.id)} dismissible dismissIcon={{ 'aria-label': 'Fjern' }}>
              {s.title}
            </Tag>
          ))}
        </TagGroup>
      )}
      <Combobox
        id={inputId}
        className={styles.combo}
        placeholder={placeholder}
        value={query}
        freeform
        selectedOptions={[]}
        onChange={(e) => setQuery(e.target.value)}
        onOptionSelect={(_e, data) => {
          const pick = results.find((r) => String(r.id) === data.optionValue);
          if (pick) onChange([...selected, pick]);
          setQuery('');
          setResults([]);
        }}
      >
        {results.map((r) => (
          <Option key={r.id} value={String(r.id)} text={r.title}>
            {r.title}
          </Option>
        ))}
        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <Option key="none" value="__none" disabled text={noResultsText}>
            {noResultsText}
          </Option>
        )}
      </Combobox>
    </div>
  );
};
