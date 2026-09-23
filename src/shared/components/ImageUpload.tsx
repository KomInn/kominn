import * as React from 'react';
import { Button, Caption1, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { Delete16Regular, ImageAdd24Regular } from '@fluentui/react-icons';
import { compressImage } from '../utils';

const useStyles = makeStyles({
  drop: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalL,
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
    cursor: 'pointer',
    ':focus-visible': { outlineStyle: 'solid', outlineWidth: '2px', outlineColor: tokens.colorStrokeFocus2 }
  },
  active: { ...shorthands.borderColor(tokens.colorBrandStroke1), background: tokens.colorBrandBackground2 },
  preview: { position: 'relative', borderRadius: tokens.borderRadiusMedium, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke1}` },
  img: { display: 'block', width: '100%', maxHeight: '320px', objectFit: 'cover' },
  remove: { position: 'absolute', top: tokens.spacingVerticalS, right: tokens.spacingHorizontalS },
  hidden: { display: 'none' }
});

export interface ImageUploadProps {
  /** Eksisterende bilde-URL (f.eks. ved kopiering). */
  imageUrl?: string;
  /** Valgt fil, komprimert. */
  file?: File;
  onChange: (file: File | undefined, previewUrl: string | undefined) => void;
  labels: { drop: string; browse: string; remove: string; hint: string };
  inputId: string;
}

/** Dra-og-slipp eller velg bilde. Bildet komprimeres i nettleseren før det lastes opp. */
export const ImageUpload: React.FC<ImageUploadProps> = ({ imageUrl, file, onChange, labels, inputId }) => {
  const styles = useStyles();
  const [active, setActive] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const preview = React.useMemo(() => (file ? URL.createObjectURL(file) : imageUrl), [file, imageUrl]);

  React.useEffect(() => () => {
    if (file && preview) URL.revokeObjectURL(preview);
  }, [file, preview]);

  const accept = async (picked?: File | null): Promise<void> => {
    if (!picked || !picked.type.startsWith('image/')) return;
    setBusy(true);
    try {
      const compressed = await compressImage(picked);
      onChange(compressed, undefined);
    } finally {
      setBusy(false);
    }
  };

  if (preview) {
    return (
      <div className={styles.preview}>
        <img className={styles.img} src={preview} alt="" />
        <Button className={styles.remove} appearance="secondary" size="small" icon={<Delete16Regular />} onClick={() => onChange(undefined, undefined)}>
          {labels.remove}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={mergeClasses(styles.drop, active && styles.active)}
      role="button"
      tabIndex={0}
      aria-busy={busy}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        accept(e.dataTransfer.files?.[0]).catch(() => undefined);
      }}
    >
      <ImageAdd24Regular />
      <span>{busy ? '…' : labels.drop}</span>
      <Caption1>{labels.hint}</Caption1>
      <input id={inputId} ref={input} className={styles.hidden} type="file" accept="image/*" onChange={(e) => accept(e.target.files?.[0]).catch(() => undefined)} />
    </div>
  );
};
