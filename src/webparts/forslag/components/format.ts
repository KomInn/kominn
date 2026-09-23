export const formatDate = (d?: Date): string =>
  d ? d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export const formatDateTime = (d?: Date): string =>
  d ? d.toLocaleString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export const formatAmount = (n?: number): string =>
  n === undefined ? '' : `${new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(n)} kr`;
