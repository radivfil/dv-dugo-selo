/** Formatiranje datuma i tekstova na hrvatskom (koristi se na poslužitelju i u pregledniku). */

const dateFmt = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateShort = (d: Date | string) => shortFmt.format(new Date(d));
