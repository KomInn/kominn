import * as React from 'react';
import { Badge, Caption1, Card, CardHeader, CardPreview, Link, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Chat16Regular, Heart16Regular } from '@fluentui/react-icons';
import type { Suggestion, SuggestionStatus } from '../models';

const useStyles = makeStyles({
  card: { height: '100%', display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  compact: { flexDirection: 'row', alignItems: 'flex-start', columnGap: tokens.spacingHorizontalM },
  image: { width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' },
  thumb: { width: '72px', height: '72px', flexShrink: 0, objectFit: 'cover', borderRadius: tokens.borderRadiusMedium },
  body: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS, minWidth: 0 },
  title: { fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400, lineHeight: tokens.lineHeightBase400 },
  summary: { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  meta: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: tokens.spacingHorizontalM, color: tokens.colorNeutralForeground3 },
  stat: { display: 'inline-flex', alignItems: 'center', columnGap: tokens.spacingHorizontalXXS },
  badges: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS }
});

const statusColor: Record<SuggestionStatus, 'informative' | 'brand' | 'success' | 'important'> = {
  'Sendt inn': 'informative',
  Publisert: 'brand',
  Suksess: 'success',
  Promotert: 'important'
};

export interface SuggestionCardProps {
  suggestion: Suggestion;
  variant?: 'card' | 'compact';
  showStatus?: boolean;
  likesLabel: string;
  commentsLabel: string;
}

const formatDate = (d: Date): string => d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

/** Kort for ett forslag, brukt i lister og karusell. */
export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion: s, variant = 'card', showStatus, likesLabel, commentsLabel }) => {
  const styles = useStyles();
  const compact = variant === 'compact';

  const meta = (
    <div className={styles.meta}>
      <Caption1>{s.submitter.department || s.submitter.name}</Caption1>
      <Caption1>{formatDate(s.created)}</Caption1>
      <Caption1 className={styles.stat} aria-label={`${s.likes} ${likesLabel}`}>
        <Heart16Regular aria-hidden /> {s.likes}
      </Caption1>
      <Caption1 className={styles.stat} aria-label={`${s.numberOfComments} ${commentsLabel}`}>
        <Chat16Regular aria-hidden /> {s.numberOfComments}
      </Caption1>
    </div>
  );

  const badges = (showStatus || s.focusAreas.length > 0) && (
    <div className={styles.badges}>
      {showStatus && (
        <Badge appearance="tint" color={statusColor[s.status]} size="small">
          {s.status}
        </Badge>
      )}
      {!compact &&
        s.focusAreas.slice(0, 2).map((a) => (
          <Badge key={a} appearance="outline" size="small">
            {a}
          </Badge>
        ))}
    </div>
  );

  if (compact) {
    return (
      <Card className={`${styles.card} ${styles.compact}`} appearance="subtle" size="small">
        {s.imageUrl && <img className={styles.thumb} src={s.imageUrl} alt="" />}
        <div className={styles.body}>
          <Link className={styles.title} href={s.url}>
            {s.title}
          </Link>
          {meta}
          {badges}
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      {s.imageUrl && (
        <CardPreview>
          <img className={styles.image} src={s.imageUrl} alt="" />
        </CardPreview>
      )}
      <CardHeader
        header={
          <Link className={styles.title} href={s.url}>
            {s.title}
          </Link>
        }
      />
      <Text className={styles.summary} size={300}>
        {s.summary}
      </Text>
      {badges}
      {meta}
    </Card>
  );
};
