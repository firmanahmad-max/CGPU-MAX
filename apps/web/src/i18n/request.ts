import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config';

// Cookie-based locale — no URL prefix, so share slugs and Clerk catch-all
// routes keep working unchanged.
export default getRequestConfig(async () => {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
