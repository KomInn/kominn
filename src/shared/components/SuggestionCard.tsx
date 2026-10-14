import * as React from 'react';
import { Badge, Caption1, Card, CardHeader, CardPreview, Link, Text, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { Chat16Regular, Heart16Regular, Star16Filled } from '@fluentui/react-icons';
import type { Suggestion, SuggestionStatus } from '../models';

const useStyles = makeStyles({
  card: { height: '100%', display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  compact: { flexDirection: 'row', alignItems: 'flex-start', columnGap: tokens.spacingHorizontalM },
  image: { width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' },
  thumb: { width: '72px', height: '72px', flexShrink: 0, objectFit: 'cover', borderRadius: tokens.borderRadiusMedium },
  body: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS, minWidth: 0 },
  title: { fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400, lineHeight: tokens.lineHeightBase400 },
  summary: { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  // Metadata holdes på én linje. Avdelingen kortes ned med … ved behov.
  meta: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    minWidth: 0,
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3
  },
  metaText: { flexShrink: 0 },
  department: { minWidth: 0, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
  stat: { display: 'inline-flex', alignItems: 'center', flexShrink: 0, columnGap: tokens.spacingHorizontalXXS },
  badges: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS },
  badge: {
    height: 'auto',
    minHeight: '20px',
    ...shorthands.padding(tokens.spacingVerticalXXS, tokens.spacingHorizontalS),
    lineHeight: tokens.lineHeightBase200
  },
  statusBadge: { flexShrink: 0 },
  // Etiketter og metadata legges nederst, så de står på linje i rutenettet.
  footer: { marginTop: 'auto', display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS, minWidth: 0 },
  highlighted: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    backgroundColor: tokens.colorBrandBackground2
  }
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
  /** Vis bilde (miniatyr i kompakt liste, forhåndsvisning i kort). Standard true. */
  showImage?: boolean;
  /** Illustrasjon i kortvisning når forslaget ikke har eget bilde. */
  fallbackImageUrl?: string;
  /** Fremhever kortet med ramme og merke, f.eks. «Månedens forslag». */
  highlightLabel?: string;
  likesLabel: string;
  commentsLabel: string;
}

const formatDate = (d: Date): string => d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

/** Kort for ett forslag, brukt i lister og karusell. */
export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion: s,
  variant = 'card',
  showStatus,
  showImage = true,
  fallbackImageUrl,
  highlightLabel,
  likesLabel,
  commentsLabel
}) => {
  const styles = useStyles();
  const compact = variant === 'compact';
  // Standardbildet brukes bare i kortvisning. Kompakte lister ville fått samme miniatyr på hver rad.
  const imageSrc = s.imageUrl || (compact ? undefined : fallbackImageUrl);
  const [failedSrc, setFailedSrc] = React.useState<string>();
  const image = showImage && imageSrc && imageSrc !== failedSrc ? imageSrc : undefined;
  const onImageError = (): void => setFailedSrc(imageSrc);

  const meta = (
    <div className={styles.meta}>
      <Caption1 className={styles.department} title={s.submitter.department || s.submitter.name}>
        {s.submitter.department || s.submitter.name}
      </Caption1>
      <Caption1 className={styles.metaText}>{formatDate(s.created)}</Caption1>
      <Caption1 className={styles.stat} aria-label={`${s.likes} ${likesLabel}`}>
        <Heart16Regular aria-hidden /> {s.likes}
      </Caption1>
      <Caption1 className={styles.stat} aria-label={`${s.numberOfComments} ${commentsLabel}`}>
        <Chat16Regular aria-hidden /> {s.numberOfComments}
      </Caption1>
      {showStatus && (
        <Badge className={mergeClasses(styles.badge, styles.statusBadge)} appearance="tint" color={statusColor[s.status]} size="small">
          {s.status}
        </Badge>
      )}
    </div>
  );

  const focusAreas = compact ? [] : s.focusAreas.slice(0, 2);
  const badges = (highlightLabel || focusAreas.length > 0) && (
    <div className={styles.badges}>
      {highlightLabel && (
        <Badge className={styles.badge} appearance="filled" color="brand" size="small" icon={<Star16Filled />}>
          {highlightLabel}
        </Badge>
      )}
      {focusAreas.map((a) => (
        <Badge key={a} className={styles.badge} appearance="outline" size="small">
          {a}
        </Badge>
      ))}
    </div>
  );

  if (compact) {
    return (
      <Card className={mergeClasses(styles.card, styles.compact, highlightLabel && styles.highlighted)} appearance="subtle" size="small">
        {image && <img className={styles.thumb} src={image} alt="" onError={onImageError} />}
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
    <Card className={mergeClasses(styles.card, highlightLabel && styles.highlighted)}>
      {image && (
        <CardPreview>
          <img className={styles.image} src={image} alt="" onError={onImageError} />
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
      <div className={styles.footer}>
        {badges}
        {meta}
      </div>
    </Card>
  );
};
