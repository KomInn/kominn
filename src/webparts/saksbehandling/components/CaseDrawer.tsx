import * as React from 'react';
import {
  Button,
  Caption1,
  Divider,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  Dropdown,
  Field,
  Link,
  MessageBar,
  MessageBarBody,
  Option,
  OverlayDrawer,
  Spinner,
  Text,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Dismiss24Regular, Open16Regular } from '@fluentui/react-icons';
import * as strings from 'SaksbehandlingWebPartStrings';
import { CASE_WORKER_STATUSES, SUGGESTION_STATUSES, type CaseWorkerStatus, type Person, type SuggestionStatus } from '../../../shared/models';
import { useDataService } from '../../../shared/hooks';
import type { CaseRow } from './caseWork';

const useStyles = makeStyles({
  body: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  summary: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
  scores: { display: 'grid', gridTemplateColumns: '1fr auto', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalXXS },
  num: { fontVariantNumeric: 'tabular-nums', textAlign: 'right' },
  footer: { display: 'flex', columnGap: tokens.spacingHorizontalS, alignItems: 'center' }
});

export interface CaseDrawerProps {
  row?: CaseRow;
  caseWorkers: Person[];
  currentUser?: Person;
  onClose: () => void;
  onSaved: () => void;
}

const UNASSIGNED = '__none';

/** Sidepanel for å behandle ett forslag: status, saksbehandlerstatus og tildeling. */
export const CaseDrawer: React.FC<CaseDrawerProps> = ({ row, caseWorkers, currentUser, onClose, onSaved }) => {
  const styles = useStyles();
  const service = useDataService();
  const s = row?.suggestion;
  const [status, setStatus] = React.useState<SuggestionStatus>('Sendt inn');
  const [cwStatus, setCwStatus] = React.useState<CaseWorkerStatus>('Sendt inn');
  const [caseWorkerId, setCaseWorkerId] = React.useState<string>(UNASSIGNED);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!s) return;
    setStatus(s.status);
    setCwStatus(s.caseWorkerStatus);
    setCaseWorkerId(s.caseWorker?.id ? String(s.caseWorker.id) : UNASSIGNED);
    setError(undefined);
  }, [s]);

  // Saksbehandleren på forslaget skal alltid kunne velges, også om vedkommende har gått ut av gruppen.
  const people = React.useMemo(() => {
    const list = [...caseWorkers];
    if (s?.caseWorker?.id && !list.some((p) => p.id === s.caseWorker?.id)) list.push(s.caseWorker);
    return list;
  }, [caseWorkers, s]);

  const selectedPerson = people.find((p) => String(p.id) === caseWorkerId);
  const dirty = !!s && (status !== s.status || cwStatus !== s.caseWorkerStatus || caseWorkerId !== (s.caseWorker?.id ? String(s.caseWorker.id) : UNASSIGNED));

  const save = async (): Promise<void> => {
    if (!s) return;
    setSaving(true);
    setError(undefined);
    try {
      await service.updateSuggestion(s.id, { status, caseWorkerStatus: cwStatus, caseWorker: caseWorkerId === UNASSIGNED ? undefined : selectedPerson });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OverlayDrawer open={!!s} position="end" size="medium" onOpenChange={(_e, d) => !d.open && onClose()}>
      <DrawerHeader>
        <DrawerHeaderTitle action={<Button appearance="subtle" aria-label={strings.Close} icon={<Dismiss24Regular />} onClick={onClose} />}>
          {s?.title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.body}>
        {s && (
          <>
            <Caption1>
              {s.submitter.name}
              {s.submitter.department ? ` · ${s.submitter.department}` : ''} · {s.created.toLocaleDateString('nb-NO')}
            </Caption1>
            <Text className={styles.summary}>{s.summary}</Text>
            <Link href={s.url} target="_blank">
              {strings.OpenSuggestion} <Open16Regular />
            </Link>
            <Divider />
            <Field label={strings.StatusLabel} hint={strings.StatusHint}>
              <Dropdown id="sb-status" value={status} selectedOptions={[status]} onOptionSelect={(_e, d) => setStatus(d.optionValue as SuggestionStatus)}>
                {SUGGESTION_STATUSES.map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label={strings.CaseWorkerStatusLabel}>
              <Dropdown id="sb-cwstatus" value={cwStatus} selectedOptions={[cwStatus]} onOptionSelect={(_e, d) => setCwStatus(d.optionValue as CaseWorkerStatus)}>
                {CASE_WORKER_STATUSES.map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label={strings.CaseWorkerLabel}>
              <Dropdown
                id="sb-caseworker"
                value={selectedPerson?.name ?? strings.Unassigned}
                selectedOptions={[caseWorkerId]}
                onOptionSelect={(_e, d) => setCaseWorkerId(d.optionValue ?? UNASSIGNED)}
              >
                <Option value={UNASSIGNED}>{strings.Unassigned}</Option>
                {people.map((p) => (
                  <Option key={p.id} value={String(p.id)}>
                    {p.name}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            {currentUser?.id && caseWorkerId !== String(currentUser.id) && (
              <Button appearance="subtle" onClick={() => setCaseWorkerId(String(currentUser.id))}>
                {strings.AssignToMe}
              </Button>
            )}
            <Divider />
            <Text weight="semibold">{strings.EvaluationTitle}</Text>
            {row?.average ? (
              <div className={styles.scores}>
                <Text size={200}>{strings.ScoreFeasibility}</Text>
                <Text size={200} className={styles.num}>{row.average.feasibility.toFixed(1)}</Text>
                <Text size={200}>{strings.ScoreEmission}</Text>
                <Text size={200} className={styles.num}>{row.average.emissionReductionPotential.toFixed(1)}</Text>
                <Text size={200}>{strings.ScoreDistribution}</Text>
                <Text size={200} className={styles.num}>{row.average.distributionPotential.toFixed(1)}</Text>
                <Text size={200}>{strings.ScoreInnovation}</Text>
                <Text size={200} className={styles.num}>{row.average.degreeOfInnovation.toFixed(1)}</Text>
                <Caption1>{strings.EvaluationCount}</Caption1>
                <Caption1 className={styles.num}>{row.average.count}</Caption1>
              </div>
            ) : (
              <Text size={200}>{strings.NoEvaluations}</Text>
            )}
            <Caption1>{strings.EvaluateHint}</Caption1>
            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}
          </>
        )}
      </DrawerBody>
      <DrawerFooter className={styles.footer}>
        <Button appearance="primary" disabled={!dirty || saving} onClick={() => save().catch(() => undefined)}>
          {strings.Save}
        </Button>
        <Button onClick={onClose}>{strings.Cancel}</Button>
        {saving && <Spinner size="tiny" />}
      </DrawerFooter>
    </OverlayDrawer>
  );
};
