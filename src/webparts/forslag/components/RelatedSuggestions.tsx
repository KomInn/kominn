import * as React from 'react';
import { Caption1, Link, Subtitle2, Text, makeStyles, tokens } from '@fluentui/react-components';
import { ArrowCircleLeft20Regular, ArrowCircleRight20Regular } from '@fluentui/react-icons';
import * as strings from 'ForslagWebPartStrings';
import type { Suggestion } from '../../../shared/models';
import { suggestionUrl } from '../../../shared/services';
import { useDataService, useInspiredSuggestions } from '../../../shared/hooks';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  group: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS },
  list: { listStyleType: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS },
  item: { display: 'flex', columnGap: tokens.spacingHorizontalS, alignItems: 'center' },
  icon: { color: tokens.colorBrandForeground1, flexShrink: 0 }
});

/**
 * Kjeden av forslag: det dette bygger på, og det som er inspirert av dette.
 * Erstatter nettverksgrafen fra 1.x.
 */
export const RelatedSuggestions: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
  const styles = useStyles();
  const service = useDataService();
  const inspired = useInspiredSuggestions(suggestion.id);
  const before = suggestion.inspiredBy;
  const after = inspired.data ?? [];

  if (before.length === 0 && after.length === 0 && !inspired.loading) return null;

  return (
    <section className={styles.root} aria-labelledby="fs-related">
      <Subtitle2 id="fs-related">{strings.RelatedTitle}</Subtitle2>
      {before.length > 0 && (
        <div className={styles.group}>
          <Caption1>{strings.RelatedBefore}</Caption1>
          <ul className={styles.list}>
            {before.map((r) => (
              <li key={r.id} className={styles.item}>
                <ArrowCircleLeft20Regular className={styles.icon} aria-hidden />
                <Link href={suggestionUrl(service.webUrl, r.id)}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {after.length > 0 && (
        <div className={styles.group}>
          <Caption1>{strings.RelatedAfter}</Caption1>
          <ul className={styles.list}>
            {after.map((s) => (
              <li key={s.id} className={styles.item}>
                <ArrowCircleRight20Regular className={styles.icon} aria-hidden />
                <Link href={s.url}>{s.title}</Link>
                <Text size={200}>· {s.submitter.department || s.submitter.name}</Text>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
