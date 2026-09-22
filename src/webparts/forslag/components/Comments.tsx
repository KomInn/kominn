import * as React from 'react';
import { Avatar, Button, Caption1, Field, MessageBar, MessageBarBody, Spinner, Subtitle2, Text, Textarea, makeStyles, tokens } from '@fluentui/react-components';
import { Send20Regular } from '@fluentui/react-icons';
import * as strings from 'ForslagWebPartStrings';
import { useAsync, useDataService } from '../../../shared/hooks';
import { formatDateTime } from './format';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  list: { listStyleType: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalM },
  item: { display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: tokens.spacingHorizontalM },
  body: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXXS },
  head: { display: 'flex', flexWrap: 'wrap', columnGap: tokens.spacingHorizontalS, alignItems: 'baseline' },
  text: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
  form: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalS, alignItems: 'flex-start' },
  textarea: { width: '100%' }
});

export interface CommentsProps {
  suggestionId: number;
  onCountChange?: (count: number) => void;
}

export const Comments: React.FC<CommentsProps> = ({ suggestionId, onCountChange }) => {
  const styles = useStyles();
  const service = useDataService();
  const comments = useAsync(() => service.getComments(suggestionId), [service, suggestionId]);
  const [text, setText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const send = async (): Promise<void> => {
    const value = text.trim();
    if (!value) return;
    setSending(true);
    setError(undefined);
    try {
      await service.addComment(suggestionId, value);
      setText('');
      comments.reload();
      onCountChange?.((comments.data?.length ?? 0) + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.root} id="kommentarer" aria-labelledby="fs-comments">
      <Subtitle2 id="fs-comments">
        {strings.CommentsTitle} {comments.data ? `(${comments.data.length})` : ''}
      </Subtitle2>
      {comments.loading && <Spinner size="tiny" label={strings.Loading} />}
      {comments.error && (
        <MessageBar intent="error">
          <MessageBarBody>{strings.CommentsLoadError}</MessageBarBody>
        </MessageBar>
      )}
      {comments.data && comments.data.length === 0 && <Text>{strings.CommentsEmpty}</Text>}
      {comments.data && comments.data.length > 0 && (
        <ul className={styles.list}>
          {comments.data.map((c) => (
            <li key={c.id} className={styles.item}>
              <Avatar name={c.author.name} size={32} />
              <div className={styles.body}>
                <div className={styles.head}>
                  <Text weight="semibold">{c.author.name}</Text>
                  <Caption1>{formatDateTime(c.created)}</Caption1>
                </div>
                <Text className={styles.text}>{c.text}</Text>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          send().catch(() => undefined);
        }}
      >
        <Field label={strings.CommentLabel} className={styles.textarea}>
          <Textarea id="fs-comment" value={text} rows={3} resize="vertical" onChange={(_e, d) => setText(d.value)} />
        </Field>
        {error && (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}
        <Button type="submit" appearance="primary" icon={<Send20Regular />} disabled={sending || !text.trim()}>
          {sending ? strings.CommentSending : strings.CommentSend}
        </Button>
      </form>
    </section>
  );
};
