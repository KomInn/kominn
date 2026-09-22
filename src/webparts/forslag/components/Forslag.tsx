import * as React from 'react';
import {
  Badge,
  Body1,
  Button,
  Caption1,
  Card,
  Divider,
  Image,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Text,
  Title2,
  Tooltip,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Heart20Filled, Heart20Regular, Lightbulb20Regular, Link20Regular, Chat20Regular } from '@fluentui/react-icons';
import * as strings from 'ForslagWebPartStrings';
import type { IForslagProps } from './IForslagProps';
import { Comments } from './Comments';
import { RelatedSuggestions } from './RelatedSuggestions';
import { CaseWorkerPanel } from './CaseWorkerPanel';
import { formatAmount, formatDate } from './format';
import { useAsync, useConfig, useDataService, useIsCaseWorker, useSuggestion, useSustainabilityGoals } from '../../../shared/hooks';
import { LocationPicker } from '../../../shared/components';
import { copySuggestionUrl } from '../../../shared/services';
import type { Suggestion, SuggestionStatus } from '../../../shared/models';
import { parseLatLng } from '../../../shared/utils';

const useStyles = makeStyles({
  root: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalXXL, rowGap: tokens.spacingVerticalXL, alignItems: 'flex-start' },
  main: { flexGrow: 2, flexShrink: 1, flexBasis: '420px', minWidth: 0, display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalL },
  side: { flexGrow: 1, flexShrink: 1, flexBasis: '260px', minWidth: 0, display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalL },
  header: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  badges: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalXS, rowGap: tokens.spacingVerticalXS },
  meta: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalM, color: tokens.colorNeutralForeground3 },
  image: { width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: tokens.borderRadiusMedium },
  block: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS },
  prose: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxWidth: '72ch' },
  goals: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS },
  goalIcon: { width: '56px', height: '56px', borderRadius: tokens.borderRadiusSmall },
  card: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  actions: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalS, rowGap: tokens.spacingVerticalS },
  details: { display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalXS, margin: 0 },
  dt: { color: tokens.colorNeutralForeground3 },
  dd: { margin: 0, overflowWrap: 'anywhere' }
});

const statusColor: Record<SuggestionStatus, 'informative' | 'brand' | 'success' | 'important'> = {
  'Sendt inn': 'informative',
  Publisert: 'brand',
  Suksess: 'success',
  Promotert: 'important'
};

function typeLabel(s: Suggestion): string {
  if (s.isPast) return strings.TypePast;
  if (s.status === 'Suksess') return strings.TypeSuccess;
  return strings.TypeSuggestion;
}

const LikeButton: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
  const service = useDataService();
  const liked = useAsync(() => service.hasLiked(suggestion.id), [service, suggestion.id]);
  const [count, setCount] = React.useState(suggestion.likes);
  const [mine, setMine] = React.useState<boolean>();
  const [busy, setBusy] = React.useState(false);
  const active = mine ?? liked.data ?? false;

  const toggle = async (): Promise<void> => {
    setBusy(true);
    try {
      setCount(await service.toggleLike(suggestion.id));
      setMine(!active);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      appearance={active ? 'primary' : 'secondary'}
      icon={active ? <Heart20Filled /> : <Heart20Regular />}
      aria-pressed={active}
      disabled={busy || liked.loading}
      onClick={() => toggle().catch(() => undefined)}
    >
      {active ? strings.Liked : strings.Like} · {count}
    </Button>
  );
};

export const Forslag: React.FC<IForslagProps> = (props) => {
  const styles = useStyles();
  const service = useDataService();
  const { data: suggestion, loading, error, reload } = useSuggestion(props.suggestionId);
  const goals = useSustainabilityGoals();
  const isCaseWorker = useIsCaseWorker();
  const config = useConfig();
  const [copied, setCopied] = React.useState(false);

  // Hopp til kommentarer når lenken har #kommentarer.
  React.useEffect(() => {
    if (suggestion && window.location.hash === '#kommentarer') document.getElementById('kommentarer')?.scrollIntoView({ behavior: 'smooth' });
  }, [suggestion]);

  if (!props.suggestionId) {
    return (
      <MessageBar intent="info">
        <MessageBarBody>{strings.NoIdText}</MessageBarBody>
      </MessageBar>
    );
  }
  if (loading) return <Spinner label={strings.Loading} />;
  if (error) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>
          <MessageBarTitle>{strings.LoadErrorTitle}</MessageBarTitle> {error.message}
        </MessageBarBody>
      </MessageBar>
    );
  }
  if (!suggestion) {
    return (
      <MessageBar intent="warning">
        <MessageBarBody>{strings.NotFoundText}</MessageBarBody>
      </MessageBar>
    );
  }

  const icons = new Map((goals.data ?? []).map((g) => [g.id, g.iconUrl]));
  const hasLocation = !!parseLatLng(suggestion.location);
  const s = suggestion;

  const copyLink = (): void => {
    navigator.clipboard
      ?.writeText(s.url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  };

  return (
    <article className={styles.root}>
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.badges}>
            <Badge appearance="tint" color={statusColor[s.status]}>
              {typeLabel(s)}
            </Badge>
            {s.status !== 'Publisert' && s.status !== 'Suksess' && <Badge appearance="outline">{s.status}</Badge>}
            {s.focusAreas.map((a) => (
              <Badge key={a} appearance="outline" color="brand">
                {a}
              </Badge>
            ))}
            {s.tags.map((t) => (
              <Badge key={t} appearance="outline" color="informative">
                {t}
              </Badge>
            ))}
          </div>
          <Title2 as="h1">{s.title}</Title2>
          <div className={styles.meta}>
            <Text size={200}>{s.submitter.name}</Text>
            {s.submitter.department && <Text size={200}>{s.submitter.department}</Text>}
            <Text size={200}>{formatDate(s.created)}</Text>
          </div>
        </header>

        {s.imageUrl && <Image className={styles.image} src={s.imageUrl} alt="" />}

        <div className={styles.block}>
          <Body1 className={styles.prose}>{s.summary}</Body1>
        </div>
        {s.challenges && (
          <div className={styles.block}>
            <Subtitle2 as="h2">{strings.ChallengesTitle}</Subtitle2>
            <Body1 className={styles.prose}>{s.challenges}</Body1>
          </div>
        )}
        {s.suggestedSolution && (
          <div className={styles.block}>
            <Subtitle2 as="h2">{strings.SolutionTitle}</Subtitle2>
            <Body1 className={styles.prose}>{s.suggestedSolution}</Body1>
          </div>
        )}
        {s.usefulForOthers && (
          <div className={styles.block}>
            <Subtitle2 as="h2">{strings.UsefulForOthersTitle}</Subtitle2>
            <Body1 className={styles.prose}>{s.usefulForOthers}</Body1>
          </div>
        )}

        {s.sustainabilityGoals.length > 0 && (
          <div className={styles.block}>
            <Subtitle2 as="h2">{strings.GoalsTitle}</Subtitle2>
            <div className={styles.goals}>
              {s.sustainabilityGoals.map((g) => {
                const icon = icons.get(g.id);
                return icon ? (
                  <Tooltip key={g.id} content={g.title} relationship="label">
                    <img className={styles.goalIcon} src={icon} alt={g.title} />
                  </Tooltip>
                ) : (
                  <Badge key={g.id} appearance="tint">
                    {g.title}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {props.showRelated && <RelatedSuggestions suggestion={s} />}

        {props.showComments && (
          <>
            <Divider />
            <Comments suggestionId={s.id} />
          </>
        )}
      </div>

      <aside className={styles.side}>
        <Card className={styles.card}>
          <div className={styles.actions}>
            <LikeButton suggestion={s} />
            {props.showComments && (
              <Button as="a" href="#kommentarer" appearance="subtle" icon={<Chat20Regular />}>
                {s.numberOfComments} {strings.CommentsShort}
              </Button>
            )}
          </div>
          <Button as="a" href={copySuggestionUrl(service.webUrl, s.id)} icon={<Lightbulb20Regular />}>
            {strings.DoThisToo}
          </Button>
          <Caption1>{strings.DoThisTooHint}</Caption1>
          <Button appearance="subtle" icon={<Link20Regular />} onClick={copyLink}>
            {copied ? strings.LinkCopied : strings.CopyLink}
          </Button>
        </Card>

        <Card className={styles.card}>
          <Subtitle2 as="h2">{strings.DetailsTitle}</Subtitle2>
          <dl className={styles.details}>
            {s.amount !== undefined && (
              <>
                <dt className={styles.dt}>{strings.AmountLabel}</dt>
                <dd className={styles.dd}>{formatAmount(s.amount)}</dd>
              </>
            )}
            <dt className={styles.dt}>{strings.StatusLabel}</dt>
            <dd className={styles.dd}>{s.status}</dd>
            <dt className={styles.dt}>{strings.CaseWorkerStatusLabel}</dt>
            <dd className={styles.dd}>{s.caseWorkerStatus}</dd>
            {s.caseWorker && (
              <>
                <dt className={styles.dt}>{strings.CaseWorkerLabel}</dt>
                <dd className={styles.dd}>{s.caseWorker.name}</dd>
              </>
            )}
            <dt className={styles.dt}>{strings.SubmitterLabel}</dt>
            <dd className={styles.dd}>{s.submitter.name}</dd>
            {s.submitter.email && (
              <>
                <dt className={styles.dt}>{strings.EmailLabel}</dt>
                <dd className={styles.dd}>
                  <a href={`mailto:${s.submitter.email}`}>{s.submitter.email}</a>
                </dd>
              </>
            )}
            {s.submitter.manager && (
              <>
                <dt className={styles.dt}>{strings.ManagerLabel}</dt>
                <dd className={styles.dd}>{s.submitter.manager.name}</dd>
              </>
            )}
            {s.competitionRef && (
              <>
                <dt className={styles.dt}>{strings.CompetitionRefLabel}</dt>
                <dd className={styles.dd}>{s.competitionRef}</dd>
              </>
            )}
          </dl>
        </Card>

        {props.showMap && hasLocation && (
          <Card className={styles.card}>
            <Subtitle2 as="h2">{strings.MapTitle}</Subtitle2>
            <LocationPicker value={s.location} onChange={() => undefined} readOnly zoom={config.data?.KART_ZOOM ? parseInt(config.data.KART_ZOOM, 10) : undefined} />
          </Card>
        )}

        {props.showEvaluation && isCaseWorker.data && <CaseWorkerPanel suggestion={s} onChanged={reload} />}
      </aside>
    </article>
  );
};
