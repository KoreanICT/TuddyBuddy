// Only internal, known report routes may be used as notification links.
export const reportNotificationLink = (category: string, url: string): string | null =>
    category === 'REPORT' && /^\/(?:admin\/reportDetail|report\/replyDetail)\/[1-9]\d*$/.test(url)
        ? url : null;
