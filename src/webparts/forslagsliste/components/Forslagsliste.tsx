import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import {
  Button,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  Spinner,
  Text,
  Title3,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { ChevronLeft20Regular, ChevronRight20Regular, Dismiss16Regular } from '@fluentui/react-icons';
import * as strings from 'ForslagslisteWebPartStrings';
import type { IForslagslisteProps } from './IForslagslisteProps';
import { buildQuery, type ListFilters } from './listQuery';
import { useFocusAreas, useSuggestions, useTags } from '../../../shared/hooks';
import { SuggestionCard } from '../../../shared/components';
import type { SuggestionOrder } from '../../../shared/services';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  titleInput: { width: '100%' },
  toolbar: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalS },
  filter: { minWidth: '180px', flexGrow: 1, flexBasis: '180px' },
  grid: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gap: tokens.spacingHorizontalM,
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
  },
  compactList: { listStyleType: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS },
  carouselWrap: { position: 'relative' },
  carousel: {
    listStyleType: 'none',
    margin: 0,
    padding: `${tokens.spacingVerticalXXS} 0`,
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(240px, 300px)',
    columnGap: tokens.spacingHorizontalM,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'thin',
    '@media (prefers-reduced-motion: no-preference)': { scrollBehavior: 'smooth' }
  },
  slide: { scrollSnapAlign: 'start' },
  carouselNav: { display: 'flex', justifyContent: 'flex-end', columnGap: tokens.spacingHorizontalXS },
  footer: { display: 'flex', justifyContent: 'center' }
});

export const Forslagsliste: React.FC<IForslagslisteProps> = (props) => {
  const styles = useStyles();
  const editable = props.displayMode === DisplayMode.Edit;
  const [filters, setFilters] = React.useState<ListFilters>({ focusAreas: [], tags: [], orderBy: props.defaultOrder });
  const [pages, setPages] = React.useState(1);
  const carousel = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => setFilters((f) => ({ ...f, orderBy: props.defaultOrder })), [props.defaultOrder]);
  React.useEffect(() => setPages(1), [filters, props.mode, props.period, props.top]);

  const areas = useFocusAreas();
  const tags = useTags();
  const pageSize = props.layout === 'carousel' ? props.top : props.top * pages;
  // Hent én ekstra for å vite om det finnes flere.
  const { data, error, loading } = useSuggestions(buildQuery(props.mode, props.period, filters, pageSize + 1));
  const items = (data ?? []).slice(0, pageSize);
  const hasMore = (data?.length ?? 0) > pageSize;
  const filtered = filters.focusAreas.length > 0 || filters.tags.length > 0;
  const cardLabels = { likesLabel: strings.Likes, commentsLabel: strings.Comments, showStatus: props.mode === 'mine' };

  const scroll = (dir: 1 | -1): void => {
    const el = carousel.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9 });
  };

  const sortOptions: { key: SuggestionOrder; text: string }[] = [
    { key: 'likes', text: strings.SortLikes },
    { key: 'comments', text: strings.SortComments },
    { key: 'created', text: strings.SortCreated }
  ];

  return (
    <section className={styles.root} aria-label={props.title || strings.DefaultAriaLabel}>
      {editable ? (
        <Input
          id="forslagsliste-title"
          className={styles.titleInput}
          appearance="underline"
          placeholder={strings.TitlePlaceholder}
          defaultValue={props.title}
          onChange={(_e, d) => props.onTitleChange(d.value)}
          aria-label={strings.TitlePlaceholder}
        />
      ) : (
        props.title && <Title3 as="h2">{props.title}</Title3>
      )}

      {(props.showFilters || props.showSorting) && (
        <div className={styles.toolbar}>
          {props.showFilters && (
            <>
              <Field className={styles.filter} label={strings.FilterFocusAreas}>
                <Dropdown
                  multiselect
                  placeholder={strings.FilterAll}
                  selectedOptions={filters.focusAreas}
                  value={filters.focusAreas.join(', ')}
                  onOptionSelect={(_e, d) => setFilters((f) => ({ ...f, focusAreas: d.selectedOptions }))}
                >
                  {(areas.data ?? []).map((a) => (
                    <Option key={a} value={a}>
                      {a}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              {(tags.data?.length ?? 0) > 0 && (
                <Field className={styles.filter} label={strings.FilterTags}>
                  <Dropdown
                    multiselect
                    placeholder={strings.FilterAll}
                    selectedOptions={filters.tags}
                    value={filters.tags.join(', ')}
                    onOptionSelect={(_e, d) => setFilters((f) => ({ ...f, tags: d.selectedOptions }))}
                  >
                    {(tags.data ?? []).map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            </>
          )}
          {props.showSorting && (
            <Field className={styles.filter} label={strings.SortLabel}>
              <Dropdown
                value={sortOptions.find((o) => o.key === filters.orderBy)?.text}
                selectedOptions={[filters.orderBy]}
                onOptionSelect={(_e, d) => setFilters((f) => ({ ...f, orderBy: d.optionValue as SuggestionOrder }))}
              >
                {sortOptions.map((o) => (
                  <Option key={o.key} value={o.key}>
                    {o.text}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          )}
          {filtered && (
            <Button appearance="subtle" icon={<Dismiss16Regular />} onClick={() => setFilters((f) => ({ ...f, focusAreas: [], tags: [] }))}>
              {strings.FilterClear}
            </Button>
          )}
        </div>
      )}

      {loading && !data && <Spinner size="small" label={strings.Loading} />}
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            {strings.LoadError} {error.message}
          </MessageBarBody>
        </MessageBar>
      )}
      {!loading && !error && items.length === 0 && <Text>{filtered ? strings.NoFilterResults : props.emptyText}</Text>}

      {items.length > 0 && props.layout === 'cards' && (
        <ul className={styles.grid}>
          {items.map((s) => (
            <li key={s.id}>
              <SuggestionCard suggestion={s} {...cardLabels} />
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && props.layout === 'compact' && (
        <ul className={styles.compactList}>
          {items.map((s) => (
            <li key={s.id}>
              <SuggestionCard suggestion={s} variant="compact" {...cardLabels} />
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && props.layout === 'carousel' && (
        <div className={styles.carouselWrap}>
          <ul ref={carousel} className={styles.carousel} tabIndex={0} aria-roledescription="karusell">
            {items.map((s) => (
              <li key={s.id} className={styles.slide}>
                <SuggestionCard suggestion={s} {...cardLabels} />
              </li>
            ))}
          </ul>
          {items.length > 1 && (
            <div className={styles.carouselNav}>
              <Button appearance="subtle" icon={<ChevronLeft20Regular />} aria-label={strings.Previous} onClick={() => scroll(-1)} />
              <Button appearance="subtle" icon={<ChevronRight20Regular />} aria-label={strings.Next} onClick={() => scroll(1)} />
            </div>
          )}
        </div>
      )}

      {hasMore && props.layout !== 'carousel' && (
        <div className={styles.footer}>
          <Button onClick={() => setPages((p) => p + 1)} disabled={loading}>
            {loading ? strings.Loading : strings.ShowMore}
          </Button>
        </div>
      )}
    </section>
  );
};
