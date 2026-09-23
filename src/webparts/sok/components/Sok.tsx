import * as React from 'react';
import { Caption1, Combobox, Option, makeStyles, tokens } from '@fluentui/react-components';
import { Search20Regular } from '@fluentui/react-icons';
import * as strings from 'SokWebPartStrings';
import type { ISokProps } from './ISokProps';
import { useDataService } from '../../../shared/hooks';
import type { Suggestion } from '../../../shared/models';

const useStyles = makeStyles({
  root: { width: '100%' },
  combo: { width: '100%', minWidth: 0 },
  option: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXXS },
  meta: { color: tokens.colorNeutralForeground3 }
});

const MIN_CHARS = 2;

/** Søkefelt med forslag mens man skriver. Valgt treff åpner forslagssiden. */
export const Sok: React.FC<ISokProps> = ({ placeholder, maxResults }) => {
  const styles = useStyles();
  const service = useDataService();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Suggestion[]>([]);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_CHARS) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(() => {
      service
        .searchSuggestions(term, maxResults)
        .then((found) => !cancelled && setResults(found.filter((s) => s.status !== 'Sendt inn')))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setSearching(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, service, maxResults]);

  const open = (id: string | undefined): void => {
    const hit = results.find((r) => String(r.id) === id);
    if (hit) window.location.href = hit.url;
  };

  const term = query.trim();
  return (
    <div className={styles.root} role="search">
      <Combobox
        id="kominn-search"
        className={styles.combo}
        size="large"
        freeform
        expandIcon={<Search20Regular />}
        placeholder={placeholder || strings.DefaultPlaceholder}
        aria-label={placeholder || strings.DefaultPlaceholder}
        value={query}
        selectedOptions={[]}
        onChange={(e) => setQuery(e.target.value)}
        onOptionSelect={(_e, d) => open(d.optionValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length === 1) open(String(results[0].id));
        }}
      >
        {results.map((s) => (
          <Option key={s.id} value={String(s.id)} text={s.title}>
            <div className={styles.option}>
              <span>{s.title}</span>
              <Caption1 className={styles.meta}>
                {s.status} · {s.submitter.department || s.submitter.name}
              </Caption1>
            </div>
          </Option>
        ))}
        {term.length >= MIN_CHARS && !searching && results.length === 0 && (
          <Option key="none" value="__none" disabled text={strings.NoResults}>
            {strings.NoResults}
          </Option>
        )}
        {searching && (
          <Option key="searching" value="__searching" disabled text={strings.Searching}>
            {strings.Searching}
          </Option>
        )}
      </Combobox>
    </div>
  );
};
