import * as React from 'react';
import type { BaseComponentContext } from '@microsoft/sp-component-base';
import type { IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
import { Button, Caption1, MessageBar, MessageBarBody, Spinner, makeStyles, tokens } from '@fluentui/react-components';
import { Delete16Regular, ImageAdd24Regular, ImageEdit16Regular } from '@fluentui/react-icons';
import { compressImage } from '../utils';
import { ImageUpload } from './ImageUpload';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalL,
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center'
  },
  preview: { borderRadius: tokens.borderRadiusMedium, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke1}` },
  img: { display: 'block', width: '100%', maxHeight: '320px', objectFit: 'cover' },
  actions: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalS }
});

export interface ImagePickerProps {
  /** SPFx-konteksten. Uten den (f.eks. i tester) brukes den enkle opplastingen. */
  context?: BaseComponentContext;
  /** KomInn-området. Fanen «Område» i velgeren åpner her. */
  webUrl: string;
  /** Eksisterende bilde-URL (ved redigering eller kopiering). */
  imageUrl?: string;
  /** Valgt fil, komprimert og klar til opplasting. */
  file?: File;
  /** Ny fil, eller en URL når bildet ikke kunne lastes ned og brukes som lenke. */
  onChange: (file: File | undefined, url: string | undefined) => void;
  labels: { choose: string; change: string; remove: string; hint: string; error: string; drop: string; browse: string; loading: string };
  inputId: string;
}

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

// Filvelgeren er stor (Fluent UI v8 m.m.), så den lastes først når brukeren åpner den.
const FilePicker = React.lazy(() =>
  import(/* webpackChunkName: 'kominn-filepicker' */ '@pnp/spfx-controls-react/lib/FilePicker').then((m) => ({ default: m.FilePicker }))
);

/** Sørger for filnavn med endelse, så bildet får riktig innholdstype i biblioteket. */
function withExtension(file: File, fallbackName: string): File {
  const name = file.name || fallbackName;
  if (/\.[a-z0-9]{2,5}$/i.test(name)) return file.name ? file : new File([file], name, { type: file.type });
  const ext = file.type === 'image/png' ? '.png' : file.type === 'image/gif' ? '.gif' : file.type === 'image/webp' ? '.webp' : '.jpg';
  return new File([file], `${name}${ext}`, { type: file.type || 'image/jpeg' });
}

/**
 * Bildevelger med SharePoints filvelger (PnP FilePicker): nylige filer, arkivbilder, organisasjonens bilder,
 * OneDrive, området, opplasting og lenke. Valgt bilde lastes alltid ned og kopieres til KomInn ved lagring,
 * slik at alle som ser forslaget har tilgang til det.
 */
export const ImagePicker: React.FC<ImagePickerProps> = ({ context, webUrl, imageUrl, file, onChange, labels, inputId }) => {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);
  const preview = React.useMemo(() => (file ? URL.createObjectURL(file) : imageUrl), [file, imageUrl]);

  React.useEffect(
    () => () => {
      if (file && preview) URL.revokeObjectURL(preview);
    },
    [file, preview]
  );

  if (!context) {
    return (
      <ImageUpload
        inputId={inputId}
        imageUrl={imageUrl}
        file={file}
        labels={{ drop: labels.drop, browse: labels.browse, remove: labels.remove, hint: labels.hint }}
        onChange={(f) => onChange(f, undefined)}
      />
    );
  }

  const onSave = async (results: IFilePickerResult[]): Promise<void> => {
    setOpen(false);
    const picked = results[0];
    if (!picked) return;
    setBusy(true);
    setError(false);
    try {
      const downloaded = withExtension(await picked.downloadFileContent(), picked.fileNameWithoutExtension || 'bilde');
      onChange(await compressImage(downloaded), undefined);
    } catch {
      // Eksterne bilder kan nekte nedlasting (CORS). Da brukes adressen direkte.
      if (picked.fileAbsoluteUrl) onChange(undefined, picked.fileAbsoluteUrl);
      else setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      {preview ? (
        <div className={styles.preview}>
          <img className={styles.img} src={preview} alt="" />
        </div>
      ) : (
        <div className={styles.empty}>
          <ImageAdd24Regular aria-hidden />
          <Caption1>{labels.hint}</Caption1>
        </div>
      )}
      <div className={styles.actions}>
        <Button
          id={inputId}
          icon={preview ? <ImageEdit16Regular /> : undefined}
          disabled={busy}
          onClick={() => {
            setLoaded(true);
            setOpen(true);
          }}
        >
          {preview ? labels.change : labels.choose}
        </Button>
        {preview && (
          <Button appearance="subtle" icon={<Delete16Regular />} disabled={busy} onClick={() => onChange(undefined, undefined)}>
            {labels.remove}
          </Button>
        )}
        {busy && <Spinner size="tiny" label={labels.loading} />}
      </div>
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{labels.error}</MessageBarBody>
        </MessageBar>
      )}
      {loaded && (
        <React.Suspense fallback={<Spinner size="tiny" label={labels.loading} />}>
          <FilePicker
            hidden
            isPanelOpen={open}
            context={context}
            webAbsoluteUrl={webUrl}
            accepts={IMAGE_TYPES}
            allowExternalLinks
            hideLocalMultipleUploadTab
            storeLastActiveTab={false}
            onSave={(r) => {
              onSave(r).catch(() => setError(true));
            }}
            onCancel={() => setOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
