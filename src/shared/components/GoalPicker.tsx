import * as React from 'react';
import { Caption1, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { Checkmark12Filled } from '@fluentui/react-icons';
import type { SustainabilityGoal } from '../models';

const useStyles = makeStyles({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: tokens.spacingHorizontalS },
  goal: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalXS,
    border: `2px solid transparent`,
    borderRadius: tokens.borderRadiusMedium,
    background: 'transparent',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    ':hover': { background: tokens.colorNeutralBackground1Hover },
    ':focus-visible': { outlineStyle: 'solid', outlineWidth: '2px', outlineColor: tokens.colorStrokeFocus2, outlineOffset: '1px' }
  },
  selected: { ...shorthands.borderColor(tokens.colorBrandStroke1), background: tokens.colorBrandBackground2 },
  icon: { width: '56px', height: '56px', borderRadius: tokens.borderRadiusSmall, objectFit: 'cover' },
  fallback: {
    width: '56px',
    height: '56px',
    borderRadius: tokens.borderRadiusSmall,
    display: 'grid',
    placeItems: 'center',
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightSemibold
  },
  check: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand
  },
  label: { textAlign: 'center', lineHeight: '1.2' }
});

export interface GoalPickerProps {
  goals: SustainabilityGoal[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  readOnly?: boolean;
}

const shortTitle = (title: string): string => title.replace(/^Mål\s*\d+\s*-\s*/, '');
const goalNumber = (title: string): string => /\d+/.exec(title)?.[0] ?? '';

/** Velger for FNs bærekraftsmål, vist som ikoner som kan slås av og på. */
export const GoalPicker: React.FC<GoalPickerProps> = ({ goals, selectedIds, onChange, readOnly }) => {
  const styles = useStyles();
  const toggle = (id: number): void => {
    if (readOnly) return;
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };
  return (
    <div className={styles.grid} role="group">
      {goals.map((g) => {
        const selected = selectedIds.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            className={mergeClasses(styles.goal, selected && styles.selected)}
            aria-pressed={selected}
            title={g.title}
            onClick={() => toggle(g.id)}
          >
            {g.iconUrl ? <img className={styles.icon} src={g.iconUrl} alt="" /> : <span className={styles.fallback}>{goalNumber(g.title)}</span>}
            {selected && (
              <span className={styles.check} aria-hidden="true">
                <Checkmark12Filled />
              </span>
            )}
            <Caption1 className={styles.label}>{shortTitle(g.title)}</Caption1>
          </button>
        );
      })}
    </div>
  );
};
