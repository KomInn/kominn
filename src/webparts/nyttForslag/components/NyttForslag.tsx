import * as React from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Field,
  Input,
  Link,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Option,
  Spinner,
  Subtitle2,
  Text,
  Textarea,
  Title3,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { CheckmarkCircle24Filled } from '@fluentui/react-icons';
import * as strings from 'NyttForslagWebPartStrings';
import type { INyttForslagProps } from './INyttForslagProps';
import { emptyForm, fillPersonalia, fromSuggestion, toNewSuggestion, validate, type FormErrors, type FormState } from './formState';
import { useConfig, useCurrentUser, useDataService, useFocusAreas, useSustainabilityGoals, useTags } from '../../../shared/hooks';
import { GoalPicker, ImageUpload, LocationPicker, SuggestionPicker } from '../../../shared/components';
import type { Suggestion } from '../../../shared/models';
import { COPY_QUERY_KEY } from '../../../shared/services';
import { clearDraft, getQueryNumber, loadDraft, parseLatLng, saveDraft } from '../../../shared/utils';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalL, maxWidth: '760px' },
  section: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', columnGap: tokens.spacingHorizontalM, rowGap: tokens.spacingVerticalM },
  actions: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalS, rowGap: tokens.spacingVerticalS, alignItems: 'center' },
  success: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM, alignItems: 'flex-start' },
  successIcon: { color: tokens.colorPaletteGreenForeground3 }
});


export const NyttForslag: React.FC<INyttForslagProps> = (props) => {
  const styles = useStyles();
  const service = useDataService();
  const user = useCurrentUser();
  const goals = useSustainabilityGoals();
  const areas = useFocusAreas();
  const tags = useTags();
  const config = useConfig();
  const draftKey = `kominn-draft-${props.webUrl}`;
  const copyId = React.useMemo(() => getQueryNumber(COPY_QUERY_KEY), []);

  const [form, setForm] = React.useState<FormState>(() => (copyId ? emptyForm : loadDraft<FormState>(draftKey) ?? emptyForm));
  const [imageFile, setImageFile] = React.useState<File>();
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>();
  const [created, setCreated] = React.useState<Suggestion>();
  const [copySource, setCopySource] = React.useState<Suggestion>();
  const [copyLoading, setCopyLoading] = React.useState(!!copyId);

  // Kopier-modus: hent kildeforslaget og fyll skjemaet.
  React.useEffect(() => {
    if (!copyId) return;
    let cancelled = false;
    service
      .getSuggestion(copyId)
      .then((source) => {
        if (cancelled || !source) return;
        setCopySource(source);
        setForm((f) => fromSuggestion(source, f));
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setCopyLoading(false));
    return () => {
      cancelled = true;
    };
  }, [copyId, service]);

  // Personalia fra profil, én gang.
  React.useEffect(() => {
    if (user.data) setForm((f) => fillPersonalia(f, user.data!));
  }, [user.data]);

  // Utkast lagres fortløpende (uten bildefil).
  React.useEffect(() => {
    if (created) return;
    const handle = setTimeout(() => saveDraft(draftKey, form), 400);
    return () => clearTimeout(handle);
  }, [form, draftKey, created]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const texts = { required: strings.ValidationRequired, invalidAmount: strings.ValidationAmount, invalidEmail: strings.ValidationEmail };

  const submit = async (): Promise<void> => {
    const found = validate(form, props, texts);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      let imageUrl = props.showImage ? form.imageUrl : undefined;
      if (props.showImage && imageFile) imageUrl = await service.uploadImage(imageFile);
      const result = await service.createSuggestion(toNewSuggestion(form, user.data, imageUrl, props.competitionRef));
      clearDraft(draftKey);
      setCreated(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = (): void => {
    setForm(user.data ? fillPersonalia(emptyForm, user.data) : emptyForm);
    setImageFile(undefined);
    setErrors({});
    setCreated(undefined);
    setCopySource(undefined);
  };

  if (created) {
    return (
      <div className={styles.success} role="status">
        <CheckmarkCircle24Filled className={styles.successIcon} />
        <Title3>{strings.SuccessTitle}</Title3>
        <Text>{props.successText || strings.SuccessDefaultText}</Text>
        <div className={styles.actions}>
          <Button as="a" appearance="primary" href={created.url}>
            {strings.SuccessOpen}
          </Button>
          <Button onClick={reset}>{strings.SuccessNew}</Button>
        </div>
      </div>
    );
  }

  if (copyLoading) return <Spinner label={strings.Loading} />;

  const center = parseLatLng(config.data?.KART_SENTER);
  const zoom = config.data?.KART_ZOOM ? parseInt(config.data.KART_ZOOM, 10) : undefined;

  return (
    <form
      className={styles.root}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit().catch(() => undefined);
      }}
    >
      {props.introText && <Text>{props.introText}</Text>}
      {copySource && (
        <MessageBar intent="info">
          <MessageBarBody>
            <MessageBarTitle>{strings.CopyTitle}</MessageBarTitle> {strings.CopyText} <Link href={copySource.url}>{copySource.title}</Link>
          </MessageBarBody>
        </MessageBar>
      )}

      <section className={styles.section} aria-labelledby="nf-suggestion">
        <Subtitle2 id="nf-suggestion">{strings.SectionSuggestion}</Subtitle2>
        <Field label={strings.TitleLabel} required validationMessage={errors.title} validationState={errors.title ? 'error' : 'none'}>
          <Input id="nf-title" value={form.title} maxLength={255} onChange={(_e, d) => update('title', d.value)} />
        </Field>
        <Field label={strings.SummaryLabel} hint={strings.SummaryHint} required validationMessage={errors.summary} validationState={errors.summary ? 'error' : 'none'}>
          <Textarea id="nf-summary" value={form.summary} rows={5} resize="vertical" onChange={(_e, d) => update('summary', d.value)} />
        </Field>
        {props.showAmount && (
          <Field label={strings.AmountLabel} hint={strings.AmountHint} required validationMessage={errors.amount} validationState={errors.amount ? 'error' : 'none'}>
            <Input id="nf-amount" type="text" inputMode="numeric" value={form.amount} contentAfter={<Text size={200}>kr</Text>} onChange={(_e, d) => update('amount', d.value)} />
          </Field>
        )}
        {props.showChallenges && (
          <Field label={strings.ChallengesLabel} hint={strings.ChallengesHint}>
            <Textarea id="nf-challenges" value={form.challenges} rows={3} resize="vertical" onChange={(_e, d) => update('challenges', d.value)} />
          </Field>
        )}
        {props.showSolution && (
          <Field label={strings.SolutionLabel}>
            <Textarea id="nf-solution" value={form.suggestedSolution} rows={3} resize="vertical" onChange={(_e, d) => update('suggestedSolution', d.value)} />
          </Field>
        )}
        {props.showUsefulForOthers && (
          <Field label={strings.UsefulForOthersLabel}>
            <Textarea id="nf-useful" value={form.usefulForOthers} rows={3} resize="vertical" onChange={(_e, d) => update('usefulForOthers', d.value)} />
          </Field>
        )}
        <div className={styles.row}>
          <Field label={strings.FocusAreasLabel}>
            <Dropdown
              id="nf-areas"
              multiselect
              placeholder={areas.loading ? strings.Loading : strings.SelectPlaceholder}
              selectedOptions={form.focusAreas}
              value={form.focusAreas.join(', ')}
              onOptionSelect={(_e, d) => update('focusAreas', d.selectedOptions)}
            >
              {(areas.data ?? []).map((a) => (
                <Option key={a} value={a}>
                  {a}
                </Option>
              ))}
            </Dropdown>
          </Field>
          {props.showTags && (
            <Field label={strings.TagsLabel}>
              <Dropdown
                id="nf-tags"
                multiselect
                placeholder={tags.loading ? strings.Loading : strings.SelectPlaceholder}
                selectedOptions={form.tags}
                value={form.tags.join(', ')}
                onOptionSelect={(_e, d) => update('tags', d.selectedOptions)}
              >
                {(tags.data ?? []).map((t) => (
                  <Option key={t} value={t}>
                    {t}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          )}
        </div>
      </section>

      {props.showGoals && (
        <section className={styles.section} aria-labelledby="nf-goals">
          <Subtitle2 id="nf-goals">{strings.SectionGoals}</Subtitle2>
          <Text size={200}>{strings.GoalsHint}</Text>
          {goals.loading ? <Spinner size="tiny" /> : <GoalPicker goals={goals.data ?? []} selectedIds={form.goalIds} onChange={(ids) => update('goalIds', ids)} />}
        </section>
      )}

      {(props.showImage || props.showLocation) && (
        <section className={styles.section} aria-labelledby="nf-media">
          <Subtitle2 id="nf-media">{strings.SectionMedia}</Subtitle2>
          <div className={styles.row}>
            {props.showImage && (
              <Field label={strings.ImageLabel}>
                <ImageUpload
                  inputId="nf-image"
                  imageUrl={form.imageUrl}
                  file={imageFile}
                  labels={{ drop: strings.ImageDrop, browse: strings.ImageBrowse, remove: strings.ImageRemove, hint: strings.ImageHint }}
                  onChange={(file) => {
                    setImageFile(file);
                    if (!file) update('imageUrl', undefined);
                  }}
                />
              </Field>
            )}
            {props.showLocation && (
              <Field label={strings.LocationLabel}>
                <LocationPicker value={form.location} onChange={(v) => update('location', v)} center={center} zoom={zoom} helpText={strings.LocationHint} clearLabel={strings.LocationClear} />
              </Field>
            )}
          </div>
        </section>
      )}

      {props.showInspiredBy && (
        <section className={styles.section} aria-labelledby="nf-inspired">
          <Subtitle2 id="nf-inspired">{strings.SectionInspiredBy}</Subtitle2>
          <Text size={200}>{strings.InspiredByHint}</Text>
          <SuggestionPicker inputId="nf-inspired-input" selected={form.inspiredBy} onChange={(v) => update('inspiredBy', v)} placeholder={strings.InspiredByPlaceholder} noResultsText={strings.NoResults} />
        </section>
      )}

      <Divider />

      <section className={styles.section} aria-labelledby="nf-person">
        <Subtitle2 id="nf-person">{strings.SectionPerson}</Subtitle2>
        <Text size={200}>{strings.PersonHint}</Text>
        <div className={styles.row}>
          <Field label={strings.NameLabel} required validationMessage={errors.name} validationState={errors.name ? 'error' : 'none'}>
            <Input id="nf-name" value={form.name} onChange={(_e, d) => update('name', d.value)} />
          </Field>
          <Field label={strings.EmailLabel} validationMessage={errors.email} validationState={errors.email ? 'error' : 'none'}>
            <Input id="nf-email" type="email" value={form.email} onChange={(_e, d) => update('email', d.value)} />
          </Field>
          <Field label={strings.DepartmentLabel}>
            <Input id="nf-department" value={form.department} onChange={(_e, d) => update('department', d.value)} />
          </Field>
          <Field label={strings.TelephoneLabel}>
            <Input id="nf-telephone" type="tel" value={form.telephone} onChange={(_e, d) => update('telephone', d.value)} />
          </Field>
        </div>
        {user.data?.manager && (
          <Field label={strings.ManagerLabel} hint={strings.ManagerHint}>
            <Input id="nf-manager" value={user.data.manager.name} readOnly />
          </Field>
        )}
        <Checkbox id="nf-consent" label={strings.ConsentLabel} checked disabled />
      </section>

      {submitError && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>{strings.SubmitErrorTitle}</MessageBarTitle> {submitError}
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.actions}>
        <Button appearance="primary" type="submit" disabled={submitting}>
          {submitting ? strings.Submitting : strings.Submit}
        </Button>
        <Button appearance="subtle" type="button" disabled={submitting} onClick={() => { clearDraft(draftKey); reset(); }}>
          {strings.Reset}
        </Button>
        {submitting && <Spinner size="tiny" />}
      </div>
    </form>
  );
};
