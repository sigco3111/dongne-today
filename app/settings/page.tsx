'use client';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Search,
  Users,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Languages,
  Navigation,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNeighborhood } from '@/lib/hooks/useNeighborhood';
import { useAutoRedetect } from '@/lib/hooks/useAutoRedetect';
import { useFriends } from '@/lib/hooks/useFriends';
import { searchAddress } from '@/lib/api/geocoding';
import { haptic } from '@/lib/haptics';
import { useI18n, LANG_OPTIONS } from '@/lib/i18n';
import { requestNotificationPermission } from '@/lib/notify';
import { storage } from '@/lib/storage';
import type { ThemePref } from '@/app/_components/ThemeProvider';
import { setThemePref } from '@/app/_components/ThemeProvider';
import type { Neighborhood } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const { neighborhood, clear: clearMy } = useNeighborhood();
  const { friends, remove, add, maxFriends } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [themePref, setTheme] = useState<ThemePref>(() => {
    if (typeof window === 'undefined') return 'dark';
    return storage.get<ThemePref>('themePref') ?? 'dark';
  });
  const cycleTheme = () => {
    const next: ThemePref = themePref === 'dark' ? 'auto' : themePref === 'auto' ? 'light' : 'dark';
    setTheme(next);
    setThemePref(next);
    haptic('tap');
  };

  const [autoRedetect, setAutoRedetect] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return storage.get<boolean>('autoRedetect') ?? false;
  });
  useAutoRedetect(autoRedetect);
  const toggleAutoRedetect = () => {
    const next = !autoRedetect;
    setAutoRedetect(next);
    storage.set('autoRedetect', next);
    haptic(next ? 'success' : 'tap');
  };

  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return storage.get<boolean>('notifyEnabled') ?? false;
  });
  const toggleNotify = async () => {
    if (notifyEnabled) {
      setNotifyEnabled(false);
      storage.set('notifyEnabled', false);
      haptic('tap');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifyEnabled(true);
        storage.set('notifyEnabled', true);
        haptic('success');
      } else {
        haptic('error');
        if (typeof window !== 'undefined') {
          window.alert(t('settings.notifyDenied'));
        }
      }
    }
  };

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    setError(null);
    searchAddress(q)
      .then((r) => {
        if (cancelled) return;
        setResults(
          r.map((g) => {
            const parts = (g.displayName ?? g.name).split(',').map((s) => s.trim()).filter(Boolean);
            const short = parts.length <= 2 ? (g.displayName ?? g.name) : parts.slice(0, 2).join(', ');
            return { name: short, lat: g.lat, lon: g.lon };
          }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setError(t('settings.searchFail'));
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, t]);

  return (
    <main id="main" className="mx-auto max-w-screen-md px-4 py-5 sm:py-8 min-h-[100dvh]">
      <header className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
          <ArrowLeft size={16} strokeWidth={2} />
          {t('settings.back')}
        </Button>
        <h1 className="text-tds-t2 font-bold text-tds-grey-900 tracking-tight">{t('settings.title')}</h1>
      </header>

      <Card className="mb-4 animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-tds-md bg-tds-blue/10 flex items-center justify-center text-tds-blue">
            <MapPin size={18} strokeWidth={2} />
          </div>
          <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">{t('settings.myDongne')}</h2>
        </div>
        <p className="text-tds-st2 text-tds-grey-700 font-medium mb-4">
          {neighborhood?.name ?? t('settings.unset')}
        </p>
        <div className="flex gap-2">
          <Button variant="weak" size="sm" onClick={() => router.push('/onboarding')}>
            {t('settings.change')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearMy();
              haptic('tap');
            }}
          >
            {t('settings.reset')}
          </Button>
        </div>
      </Card>

      <Card className="mb-4 animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-tds-md bg-tds-purple/10 flex items-center justify-center text-tds-purple">
              <Languages size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">{t('lang.label')}</h2>
              <p className="text-tds-st3 text-tds-grey-500 mt-0.5 leading-snug">
                {LANG_OPTIONS.find((o) => o.value === lang)?.label}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {LANG_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={lang === opt.value ? 'primary' : 'weak'}
                size="sm"
                onClick={() => {
                  setLang(opt.value);
                  haptic('tap');
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mb-4 animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-tds-md bg-tds-yellow/10 flex items-center justify-center text-tds-yellow">
              {themePref === 'dark' ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
            </div>
            <div>
              <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">{t('settings.theme')}</h2>
              <p className="text-tds-st3 text-tds-grey-500 mt-0.5 leading-snug">
                {themePref === 'auto' ? t('settings.themeAuto') : themePref === 'light' ? t('settings.themeLight') : t('settings.themeDark')}
              </p>
            </div>
          </div>
          <Button variant="weak" size="sm" onClick={cycleTheme}>
            {themePref === 'auto' ? t('settings.themeAutoBtn') : themePref === 'light' ? t('settings.themeLightBtn') : t('settings.themeDarkBtn')}
          </Button>
        </div>
      </Card>

      <Card className="animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-tds-md bg-tds-green/10 flex items-center justify-center text-tds-green">
              <Navigation size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">{t('settings.autoRedetect')}</h2>
              <p className="text-tds-st3 text-tds-grey-500 mt-0.5 leading-snug">
                {t('settings.autoRedetectDesc')}
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={autoRedetect}
            aria-label={t('settings.autoRedetect')}
            onClick={toggleAutoRedetect}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              autoRedetect ? 'bg-tds-blue' : 'bg-tds-grey-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-tds-surface-elevated shadow transition-transform ${
                autoRedetect ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card className="animate-stagger animate-stagger-1" padding="lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-tds-md bg-tds-orange/10 flex items-center justify-center text-tds-orange">
              <Bell size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">{t('settings.notify')}</h2>
              <p className="text-tds-st3 text-tds-grey-500 mt-0.5 leading-snug">
                {t('settings.notifyDesc')}
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={notifyEnabled}
            aria-label={t('settings.notify')}
            onClick={toggleNotify}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              notifyEnabled ? 'bg-tds-blue' : 'bg-tds-grey-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-tds-surface-elevated shadow transition-transform ${
                notifyEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card className="animate-stagger animate-stagger-2" padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-tds-md bg-tds-purple/10 flex items-center justify-center text-tds-purple">
            <Users size={18} strokeWidth={2} />
          </div>
          <h2 className="text-tds-st1 font-semibold text-tds-grey-900 tracking-tight">
            {t('settings.friends')}
            <span className="text-tds-st3 text-tds-grey-500 font-normal ml-2">
              {t('settings.friendsCount', { current: friends.length, max: maxFriends })}
            </span>
          </h2>
        </div>

        {friends.length > 0 && (
          <ul className="flex flex-col gap-1 mb-4">
            {friends.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-tds-md bg-tds-grey-50 dark:bg-tds-grey-100"
              >
                <span className="text-tds-st2 text-tds-grey-900 font-medium">{f.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    remove(i);
                    haptic('tap');
                  }}
                  aria-label={`${f.name} ${t('settings.remove')}`}
                >
                  <Trash2 size={14} strokeWidth={2} />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {friends.length < maxFriends && (
          <>
            <div className="relative mb-2">
              <Search
                size={14}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tds-grey-400 pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('settings.friendPlaceholder')}
                aria-label={t('settings.friendSearch')}
                className="w-full pl-9 pr-3 py-2.5 rounded-tds-md border border-tds-grey-200 bg-tds-bg text-tds-st2 text-tds-grey-900 placeholder:text-tds-grey-400 focus:border-tds-blue focus:outline-none transition-colors"
              />
              {busy && (
                <Loader2
                  size={14}
                  strokeWidth={2}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-tds-grey-400"
                />
              )}
            </div>
            {error && (
              <p className="text-tds-st3 text-tds-red flex items-start gap-1.5 mb-2">
                <AlertCircle size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
            {results.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {results.map((r, i) => (
                  <li
                    key={`${r.name}-${i}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-tds-md hover:bg-tds-blue-light dark:hover:bg-tds-blue/20 transition-colors"
                  >
                    <span className="text-tds-st2 text-tds-grey-900">{r.name}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        add(r);
                        setResults([]);
                        setQuery('');
                        haptic('success');
                      }}
                    >
                      <Plus size={14} strokeWidth={2} />
                      {t('settings.add')}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : !busy && debouncedQuery.trim().length >= 2 ? (
              <p className="text-tds-st3 text-tds-grey-500 text-center py-2">{t('settings.searchEmpty')}</p>
            ) : null}
          </>
        )}
      </Card>
    </main>
  );
}
