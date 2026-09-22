import * as React from 'react';
import {
  Badge,
  Button,
  Caption1,
  Dropdown,
  Field,
  Input,
  Link,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Option,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  ToggleButton,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { ArrowClockwise20Regular, Search20Regular } from '@fluentui/react-icons';
import * as strings from 'SaksbehandlingWebPartStrings';
import type { ISaksbehandlingProps } from './ISaksbehandlingProps';
import { buildRows, countByStatus, filterRows, sortRows, type CaseRow, type SortKey, type SortState } from './caseWork';
import { CaseDrawer } from './CaseDrawer';
import { useAsync, useCurrentUser, useDataService, useIsCaseWorker } from '../../../shared/hooks';
import { averageEvaluations } from '../../../shared/services';
import { CASE_WORKER_STATUSES, type CaseWorkerStatus } from '../../../shared/models';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  counts: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS },
  toolbar: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalS },
  grow: { flexGrow: 1, flexBasis: '220px', minWidth: '180px' },
  tableWrap: { overflowX: 'auto' },
  table: { minWidth: '760px' },
  num: { fontVariantNumeric: 'tabular-nums' },
  titleCell: { minWidth: '220px' }
});

const cwColor: Record<CaseWorkerStatus, 'informative' | 'warning' | 'brand' | 'success' | 'danger'> = {
  'Sendt inn': 'informative',
  'Løftes til linja': 'warning',
  Vurderes: 'brand',
  Godtatt: 'success',
  Avslått: 'danger'
};

export const Saksbehandling: React.FC<ISaksbehandlingProps> = ({ defaultStatuses, maxItems }) => {
  const styles = useStyles();
  const service = useDataService();
  const access = useIsCaseWorker();
  const me = useCurrentUser();
  const data = useAsync(async () => {
    if (!(await service.isCaseWorker())) return undefined;
    const [suggestions, evaluations, caseWorkers] = await Promise.all([
      service.getSuggestions({ top: maxItems, orderBy: 'created' }),
      service.getEvaluations(),
      service.getCaseWorkers()
    ]);
    return { rows: buildRows(suggestions, averageEvaluations(evaluations)), caseWorkers };
  }, [service, maxItems]);

  const [text, setText] = React.useState('');
  const [statuses, setStatuses] = React.useState<CaseWorkerStatus[]>(defaultStatuses);
  const [mineOnly, setMineOnly] = React.useState(false);
  const [sort, setSort] = React.useState<SortState>({ key: 'created', direction: 'descending' });
  const [selected, setSelected] = React.useState<CaseRow>();

  React.useEffect(() => setStatuses(defaultStatuses), [defaultStatuses.join('|')]);

  if (access.loading) return <Spinner label={strings.Loading} />;
  if (!access.data) {
    return (
      <MessageBar intent="warning">
        <MessageBarBody>
          <MessageBarTitle>{strings.NoAccessTitle}</MessageBarTitle> {strings.NoAccessText}
        </MessageBarBody>
      </MessageBar>
    );
  }

  const all = data.data?.rows ?? [];
  const counts = countByStatus(all);
  const rows = sortRows(filterRows(all, { text, statuses, mineOnly, currentUserId: me.data?.id }), sort);

  const header = (key: SortKey, label: string, className?: string): JSX.Element => (
    <TableHeaderCell
      className={className}
      sortDirection={sort.key === key ? sort.direction : undefined}
      onClick={() => setSort((s) => ({ key, direction: s.key === key && s.direction === 'descending' ? 'ascending' : 'descending' }))}
    >
      {label}
    </TableHeaderCell>
  );

  const toggleStatus = (s: CaseWorkerStatus): void =>
    setStatuses((cur) => (cur.length === 1 && cur[0] === s ? defaultStatuses : [s]));

  return (
    <div className={styles.root}>
      <div className={styles.counts} role="group" aria-label={strings.CountsLabel}>
        {CASE_WORKER_STATUSES.map((s) => (
          <ToggleButton key={s} size="small" checked={statuses.length === 1 && statuses[0] === s} onClick={() => toggleStatus(s)}>
            {s} <Badge appearance="tint" color={cwColor[s]} size="small" style={{ marginLeft: 6 }}>{counts[s]}</Badge>
          </ToggleButton>
        ))}
      </div>

      <div className={styles.toolbar}>
        <Field className={styles.grow} label={strings.SearchLabel}>
          <Input id="sb-search" contentBefore={<Search20Regular />} value={text} onChange={(_e, d) => setText(d.value)} placeholder={strings.SearchPlaceholder} />
        </Field>
        <Field className={styles.grow} label={strings.CaseWorkerStatusLabel}>
          <Dropdown
            id="sb-filter-status"
            multiselect
            placeholder={strings.AllStatuses}
            selectedOptions={statuses}
            value={statuses.join(', ')}
            onOptionSelect={(_e, d) => setStatuses(d.selectedOptions as CaseWorkerStatus[])}
          >
            {CASE_WORKER_STATUSES.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Dropdown>
        </Field>
        <Switch id="sb-mine" label={strings.MineOnly} checked={mineOnly} onChange={(_e, d) => setMineOnly(d.checked)} />
        <Button appearance="subtle" icon={<ArrowClockwise20Regular />} onClick={data.reload} disabled={data.loading}>
          {strings.Refresh}
        </Button>
      </div>

      {data.loading && !data.data && <Spinner label={strings.Loading} />}
      {data.error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>{strings.LoadErrorTitle}</MessageBarTitle> {data.error.message}
          </MessageBarBody>
        </MessageBar>
      )}

      {data.data && (
        <>
          <Caption1 aria-live="polite">{strings.ShowingCount.replace('{0}', String(rows.length)).replace('{1}', String(all.length))}</Caption1>
          <div className={styles.tableWrap}>
            <Table className={styles.table} size="small" sortable aria-label={strings.TableLabel}>
              <TableHeader>
                <TableRow>
                  {header('title', strings.ColTitle, styles.titleCell)}
                  {header('created', strings.ColCreated)}
                  <TableHeaderCell>{strings.ColSubmitter}</TableHeaderCell>
                  {header('caseWorkerStatus', strings.ColCaseWorkerStatus)}
                  <TableHeaderCell>{strings.ColStatus}</TableHeaderCell>
                  <TableHeaderCell>{strings.ColCaseWorker}</TableHeaderCell>
                  {header('score', strings.ColScore)}
                  {header('likes', strings.ColLikes)}
                  <TableHeaderCell aria-label={strings.ColActions} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const s = r.suggestion;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className={styles.titleCell}>
                        <TableCellLayout truncate>
                          <Link href={s.url}>{s.title}</Link>
                        </TableCellLayout>
                      </TableCell>
                      <TableCell className={styles.num}>{s.created.toLocaleDateString('nb-NO')}</TableCell>
                      <TableCell>
                        <TableCellLayout description={s.submitter.department}>{s.submitter.name}</TableCellLayout>
                      </TableCell>
                      <TableCell>
                        <Badge appearance="tint" color={cwColor[s.caseWorkerStatus]}>
                          {s.caseWorkerStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.status}</TableCell>
                      <TableCell>{s.caseWorker?.name ?? <Text italic>{strings.Unassigned}</Text>}</TableCell>
                      <TableCell className={styles.num}>{r.score !== undefined ? `${r.score.toFixed(1)} (${r.average?.count})` : '–'}</TableCell>
                      <TableCell className={styles.num}>{s.likes}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => setSelected(r)}>
                          {strings.Handle}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {rows.length === 0 && <Text>{strings.NoRows}</Text>}
        </>
      )}

      <CaseDrawer
        row={selected}
        caseWorkers={data.data?.caseWorkers ?? []}
        currentUser={me.data}
        onClose={() => setSelected(undefined)}
        onSaved={data.reload}
      />
    </div>
  );
};
