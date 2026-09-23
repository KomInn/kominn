import * as React from 'react';
import {
  Button,
  Caption1,
  Card,
  CardHeader,
  Checkbox,
  Dropdown,
  Field,
  MessageBar,
  MessageBarBody,
  Option,
  Slider,
  Spinner,
  Subtitle2,
  Text,
  Textarea,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Gavel20Regular } from '@fluentui/react-icons';
import * as strings from 'ForslagWebPartStrings';
import { CASE_WORKER_STATUSES, SUGGESTION_STATUSES, type CaseWorkerStatus, type NewEvaluation, type Suggestion, type SuggestionStatus } from '../../../shared/models';
import { averageEvaluations } from '../../../shared/services';
import { useAsync, useCurrentUser, useDataService } from '../../../shared/hooks';

const useStyles = makeStyles({
  card: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM, background: tokens.colorNeutralBackground2 },
  section: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalS },
  avg: { display: 'grid', gridTemplateColumns: '1fr auto', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalXXS },
  num: { fontVariantNumeric: 'tabular-nums', textAlign: 'right' },
  actions: { display: 'flex', columnGap: tokens.spacingHorizontalS, alignItems: 'center' }
});

type ScoreKey = 'feasibility' | 'emissionReductionPotential' | 'distributionPotential' | 'degreeOfInnovation';

const criteria: { key: ScoreKey; label: () => string }[] = [
  { key: 'feasibility', label: () => strings.ScoreFeasibility },
  { key: 'emissionReductionPotential', label: () => strings.ScoreEmission },
  { key: 'distributionPotential', label: () => strings.ScoreDistribution },
  { key: 'degreeOfInnovation', label: () => strings.ScoreInnovation }
];

const emptyEvaluation = (suggestionId: number): NewEvaluation => ({
  suggestionId,
  feasibility: 3,
  emissionReductionPotential: 3,
  distributionPotential: 3,
  degreeOfInnovation: 3,
  moreActors: false,
  lawRequirements: false,
  comment: ''
});

export interface CaseWorkerPanelProps {
  suggestion: Suggestion;
  onChanged: () => void;
}

/** Vises kun for gruppen Saksbehandlere. Status og egen vurdering, pluss snitt av alle vurderinger. */
export const CaseWorkerPanel: React.FC<CaseWorkerPanelProps> = ({ suggestion, onChanged }) => {
  const styles = useStyles();
  const service = useDataService();
  const me = useCurrentUser();
  const evaluations = useAsync(() => service.getEvaluations(suggestion.id), [service, suggestion.id]);

  const [status, setStatus] = React.useState<SuggestionStatus>(suggestion.status);
  const [cwStatus, setCwStatus] = React.useState<CaseWorkerStatus>(suggestion.caseWorkerStatus);
  const [evaluation, setEvaluation] = React.useState<NewEvaluation>(emptyEvaluation(suggestion.id));
  const [saving, setSaving] = React.useState<'status' | 'evaluation'>();
  const [message, setMessage] = React.useState<{ intent: 'success' | 'error'; text: string }>();

  // Fyll inn egen tidligere vurdering.
  React.useEffect(() => {
    const mine = evaluations.data?.find((e) => e.author?.id !== undefined && e.author.id === me.data?.id);
    if (mine) {
      setEvaluation({
        suggestionId: mine.suggestionId,
        feasibility: mine.feasibility,
        emissionReductionPotential: mine.emissionReductionPotential,
        distributionPotential: mine.distributionPotential,
        degreeOfInnovation: mine.degreeOfInnovation,
        moreActors: mine.moreActors,
        lawRequirements: mine.lawRequirements,
        comment: mine.comment ?? ''
      });
    }
  }, [evaluations.data, me.data?.id]);

  const average = averageEvaluations(evaluations.data ?? [])[0];

  const run = async (kind: 'status' | 'evaluation', fn: () => Promise<unknown>, ok: string): Promise<void> => {
    setSaving(kind);
    setMessage(undefined);
    try {
      await fn();
      setMessage({ intent: 'success', text: ok });
      if (kind === 'evaluation') evaluations.reload();
      onChanged();
    } catch (err) {
      setMessage({ intent: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setSaving(undefined);
    }
  };

  const statusDirty = status !== suggestion.status || cwStatus !== suggestion.caseWorkerStatus;

  return (
    <Card className={styles.card} appearance="filled-alternative">
      <CardHeader image={<Gavel20Regular />} header={<Subtitle2>{strings.CaseWorkerTitle}</Subtitle2>} description={<Caption1>{strings.CaseWorkerHint}</Caption1>} />

      <div className={styles.section}>
        <div className={styles.row}>
          <Field label={strings.StatusLabel}>
            <Dropdown id="fs-status" value={status} selectedOptions={[status]} onOptionSelect={(_e, d) => setStatus(d.optionValue as SuggestionStatus)}>
              {SUGGESTION_STATUSES.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Dropdown>
          </Field>
          <Field label={strings.CaseWorkerStatusLabel}>
            <Dropdown id="fs-cwstatus" value={cwStatus} selectedOptions={[cwStatus]} onOptionSelect={(_e, d) => setCwStatus(d.optionValue as CaseWorkerStatus)}>
              {CASE_WORKER_STATUSES.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
        <div className={styles.actions}>
          <Button
            disabled={!statusDirty || !!saving}
            onClick={() => run('status', () => service.updateSuggestion(suggestion.id, { status, caseWorkerStatus: cwStatus }), strings.StatusSaved).catch(() => undefined)}
          >
            {strings.SaveStatus}
          </Button>
          {saving === 'status' && <Spinner size="tiny" />}
        </div>
      </div>

      <div className={styles.section}>
        <Text weight="semibold">{strings.AverageTitle}</Text>
        {evaluations.loading && <Spinner size="tiny" />}
        {!evaluations.loading && !average && <Text size={200}>{strings.AverageEmpty}</Text>}
        {average && (
          <div className={styles.avg}>
            {criteria.map((c) => (
              <React.Fragment key={c.key}>
                <Text size={200}>{c.label()}</Text>
                <Text size={200} className={styles.num}>
                  {average[c.key].toFixed(1)}
                </Text>
              </React.Fragment>
            ))}
            <Caption1>{strings.AverageCount}</Caption1>
            <Caption1 className={styles.num}>{average.count}</Caption1>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <Text weight="semibold">{strings.MyEvaluationTitle}</Text>
        <div className={styles.row}>
          {criteria.map((c) => (
            <Field key={c.key} label={`${c.label()}: ${evaluation[c.key]}`}>
              <Slider id={`fs-score-${c.key}`} min={1} max={5} step={1} value={evaluation[c.key]} onChange={(_e, d) => setEvaluation((v) => ({ ...v, [c.key]: d.value }))} />
            </Field>
          ))}
        </div>
        <div className={styles.row}>
          <Checkbox id="fs-more-actors" label={strings.MoreActorsLabel} checked={evaluation.moreActors} onChange={(_e, d) => setEvaluation((v) => ({ ...v, moreActors: d.checked === true }))} />
          <Checkbox id="fs-law" label={strings.LawRequirementsLabel} checked={evaluation.lawRequirements} onChange={(_e, d) => setEvaluation((v) => ({ ...v, lawRequirements: d.checked === true }))} />
        </div>
        <Field label={strings.EvaluationCommentLabel}>
          <Textarea id="fs-eval-comment" rows={2} resize="vertical" value={evaluation.comment ?? ''} onChange={(_e, d) => setEvaluation((v) => ({ ...v, comment: d.value }))} />
        </Field>
        <div className={styles.actions}>
          <Button appearance="primary" disabled={!!saving} onClick={() => run('evaluation', () => service.saveEvaluation(evaluation), strings.EvaluationSaved).catch(() => undefined)}>
            {strings.SaveEvaluation}
          </Button>
          {saving === 'evaluation' && <Spinner size="tiny" />}
        </div>
      </div>

      {message && (
        <MessageBar intent={message.intent}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      )}
    </Card>
  );
};
