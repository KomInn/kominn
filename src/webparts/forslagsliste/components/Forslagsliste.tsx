import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import * as strings from 'ForslagslisteWebPartStrings';
import styles from './Forslagsliste.module.scss';
import type { IForslagslisteProps, ListMode } from './IForslagslisteProps';
import { useSuggestions } from '../../../shared/hooks';
import type { SuggestionQuery } from '../../../shared/services';
import type { Suggestion } from '../../../shared/models';

function queryFor(mode: ListMode, top: number): SuggestionQuery {
  switch (mode) {
    case 'promoted':
      return { status: 'Promotert', top };
    case 'success':
      return { status: 'Suksess', top };
    case 'monthly':
      return { monthlyOnly: true, top };
    case 'mine':
      return { mineOnly: true, top };
    default:
      return { status: 'Publisert', orderBy: 'likes', top };
  }
}

const formatDate = (d: Date): string => d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

const SuggestionCard: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => (
  <li className={styles.card}>
    {suggestion.imageUrl && <img className={styles.image} src={suggestion.imageUrl} alt="" />}
    <div className={styles.body}>
      <a className={styles.cardTitle} href={suggestion.url}>
        {suggestion.title}
      </a>
      <p className={styles.summary}>{suggestion.summary}</p>
      <div className={styles.meta}>
        <span>{suggestion.submitter.name}</span>
        <span>{formatDate(suggestion.created)}</span>
        <span>
          {suggestion.likes} {strings.Likes}
        </span>
        <span>
          {suggestion.numberOfComments} {strings.Comments}
        </span>
      </div>
      {suggestion.focusAreas.length > 0 && (
        <div className={styles.tags}>
          {suggestion.focusAreas.map((a) => (
            <span key={a} className={styles.tag}>
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  </li>
);

export const Forslagsliste: React.FC<IForslagslisteProps> = (props) => {
  const { data, error, loading } = useSuggestions(queryFor(props.mode, props.top));
  const editable = props.displayMode === DisplayMode.Edit;

  return (
    <section className={`${styles.forslagsliste} ${props.isDarkTheme ? styles.dark : ''}`}>
      {editable ? (
        <input
          id="forslagsliste-title"
          className={styles.titleInput}
          placeholder={strings.TitlePlaceholder}
          defaultValue={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          aria-label={strings.TitlePlaceholder}
        />
      ) : (
        props.title && <h2 className={styles.title}>{props.title}</h2>
      )}
      {loading && <p role="status">{strings.Loading}</p>}
      {error && (
        <p role="alert" className={styles.error}>
          {strings.LoadError} {error.message}
        </p>
      )}
      {!loading && !error && data && data.length === 0 && <p>{props.emptyText}</p>}
      {data && data.length > 0 && (
        <ul className={styles.list}>
          {data.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </ul>
      )}
    </section>
  );
};
