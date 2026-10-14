import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import {
  Button,
  Dropdown,
  Field,
  Input,
  Link,
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
import { LIST_MODES, type IForslagslisteProps, type ListMode } from './IForslagslisteProps';
import { buildQuery, type ListFilters } from './listQuery';
import { useDataService, useFocusAreas, useSuggestions, useTags } from '../../../shared/hooks';
import { SuggestionCard } from '../../../shared/components';
import { allSuggestionsUrl, defaultImageUrl, VIEW_QUERY_KEY, type SuggestionOrder } from '../../../shared/services';

const modeTitles: Record<ListMode, string> = {
  published: strings.ModePublished,
  promoted: strings.ModePromoted,
  success: strings.ModeSuccess,
  monthly: strings.ModeMonthly,
  mine: strings.ModeMine
};

/** Modus fra ?visning=<modus>, hvis den er gyldig. */
function urlMode(): ListMode | undefined {
  const value = new URLSearchParams(window.location.search).get(VIEW_QUERY_KEY);
  return LIST_MODES.find((m) => m === value);
}

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  header: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', columnGap: tokens.spacingHorizontalM },
  titleInput: { flexGrow: 1, minWidth: 0 },
  seeAll: { flexShrink: 0, whiteSpace: 'nowrap' },
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
  pager: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', columnGap: tokens.spacingHorizontalS }
});

export const Forslagsliste: React.FC<IForslagslisteProps> = (props) => {
  const styles = useStyles();
  const service = useDataService();
  const editable = props.displayMode === DisplayMode.Edit;
  const [filters, setFilters] = React.useState<ListFilters>({ focusAreas: [], tags: [], orderBy: props.defaultOrder });
  const [page, setPage] = React.useState(1);
  const carousel = React.useRef<HTMLUListElement>(null);
  const top = React.useRef<HTMLElement>(null);
  const fromUrl = props.modeFromUrl ? urlMode() : undefined;
  const mode = fromUrl ?? props.mode;
  const title = fromUrl && fromUrl !== props.mode ? modeTitles[fromUrl] : props.title;

  React.useEffect(() => setFilters((f) => ({ ...f, orderBy: props.defaultOrder })), [props.defaultOrder]);
  React.useEffect(() => setPage(1), [filters, mode, props.period, props.top, props.paging]);

  const paged = props.paging === 'prevNext' && props.layout !== 'carousel';
  const currentPage = paged ? page : 1;
  const areas = useFocusAreas();
  const tags = useTags();
  const withMonthly = props.highlightMonthly && mode === 'published';
  const monthly = useSuggestions(withMonthly ? buildQuery('monthly', 'all', filters, 3) : undefined);
  const featured = withMonthly ? (monthly.data ?? []).filter((s) => s.status !== 'Sendt inn') : [];
  const featuredIds = new Set(featured.map((s) => s.id));
  // Hent alt til og med gjeldende side, pluss én for å vite om det finnes en side til.
  const fetchCount = props.top * currentPage + 1;
  const { data, error, loading } = useSuggestions(buildQuery(mode, props.period, filters, fetchCount));
  // Antallet gjelder totalt, med månedens forslag inkludert.
  const all = [...featured, ...(data ?? []).filter((s) => !featuredIds.has(s.id))];
  const items = all.slice((currentPage - 1) * props.top, currentPage * props.top);
  const hasNext = all.length > currentPage * props.top;
  const seeAllHref = props.seeAllUrl.trim() || allSuggestionsUrl(service.webUrl, mode);
  // Som i SharePoint, men bare når det faktisk finnes flere forslag enn listen viser.
  const showSeeAll = props.showSeeAll && !paged && hasNext;
  const filtered = filters.focusAreas.length > 0 || filters.tags.length > 0;
  const cardLabels = { likesLabel: strings.Likes, commentsLabel: strings.Comments, showStatus: props.mode === 'mine', showImage: props.showImages, fallbackImageUrl: defaultImageUrl(service.webUrl) };
  const highlight = (id: number): string | undefined => (featuredIds.has(id) ? strings.MonthlyLabel : undefined);

  const scroll = (dir: 1 | -1): void => {
    const el = carousel.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9 });
  };

  const sortOptions: { key: SuggestionOrder; text: string }[] = [
    { key: 'likes', text: strings.SortLikes },
    { key: 'comments', text: strings.SortComments },
    { key: 'created', text: strings.SortCreated }
  ];

  const goTo = (p: number): void => {
    setPage(p);
    top.current?.scrollIntoView?.({ block: 'start' });
  };

  return (
    <section ref={top} className={styles.root} aria-label={title || strings.DefaultAriaLabel}>
      {(editable || title || showSeeAll) && (
        <div className={styles.header}>
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
          ) : title ? (
            <Title3 as="h2">{title}</Title3>
          ) : (
            <span />
          )}
          {showSeeAll && (
            <Link className={styles.seeAll} href={seeAllHref}>
              {strings.SeeAll}
            </Link>
          )}
        </div>
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
              <SuggestionCard suggestion={s} {...cardLabels} highlightLabel={highlight(s.id)} />
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && props.layout === 'compact' && (
        <ul className={styles.compactList}>
          {items.map((s) => (
            <li key={s.id}>
              <SuggestionCard suggestion={s} variant="compact" {...cardLabels} highlightLabel={highlight(s.id)} />
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && props.layout === 'carousel' && (
        <div className={styles.carouselWrap}>
          <ul ref={carousel} className={styles.carousel} tabIndex={0} aria-roledescription="karusell">
            {items.map((s) => (
              <li key={s.id} className={styles.slide}>
                <SuggestionCard suggestion={s} {...cardLabels} highlightLabel={highlight(s.id)} />
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

      {paged && (currentPage > 1 || hasNext) && (
        <nav className={styles.pager} aria-label={strings.PagingLabel}>
          <Button appearance="subtle" icon={<ChevronLeft20Regular />} disabled={currentPage === 1 || loading} onClick={() => goTo(currentPage - 1)}>
            {strings.Previous}
          </Button>
          <Text aria-live="polite">{strings.PageLabel.replace('{0}', String(currentPage))}</Text>
          <Button appearance="subtle" icon={<ChevronRight20Regular />} iconPosition="after" disabled={!hasNext || loading} onClick={() => goTo(currentPage + 1)}>
            {strings.Next}
          </Button>
        </nav>
      )}
    </section>
  );
};
