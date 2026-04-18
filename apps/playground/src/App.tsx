import { useCallback, useMemo, useState } from 'react';
import {
  BrandBadge,
  copySnapshotToClipboard,
  createProjectStorage,
  createStringCodec,
  serializeSnapshot,
  shareContent,
  ShortcutPanel,
  TvProgramsMark,
  TvProgramsWordmark,
  useDebugFlag,
  useLiveAnnouncer,
  usePersistentState,
  usePrefersReducedMotion,
  useShortcutRegistry,
  useThemePreference,
  useUrlState,
} from '@taylorvance/tv-shared-runtime';
import {
  TVPROGRAMS_MARK_PNG_URL,
  TVPROGRAMS_MARK_SVG_URL,
} from '@taylorvance/tv-shared-runtime/assets';
import tvMarkSubpathUrl from '@taylorvance/tv-shared-runtime/tv.svg';

const playgroundStorage = createProjectStorage('tv-shared-playground', { version: 1 });

function App() {
  const { announce } = useLiveAnnouncer();
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    resolvedTheme,
    setThemePreference,
    systemTheme,
    themePreference,
  } = useThemePreference(playgroundStorage, { applyToDocument: true });
  const [notes, setNotes, noteControls] = usePersistentState(
    playgroundStorage,
    ['demo', 'notes'],
    {
      codec: createStringCodec(),
      defaultValue: 'Shared runtime demo state',
    },
  );
  const [panel, setPanel, panelControls] = useUrlState('panel', {
    codec: createStringCodec(),
    defaultValue: 'overview',
  });
  const [shareStatus, setShareStatus] = useState<'copied' | 'idle' | 'shared' | 'unavailable'>('idle');
  const [secretMode, setSecretMode] = useState(false);
  const debugGrid = useDebugFlag<HTMLDivElement>('grid', {
    description: 'Persisted debug flag with an optional URL override.',
    hotkeys: 'g',
    label: 'Toggle grid overlay',
    storage: playgroundStorage,
    urlParam: 'grid',
  });
  const snapshotValue = useMemo(() => ({
    debugGrid: debugGrid.value,
    notes,
    panel,
    resolvedTheme,
    secretMode,
  }), [debugGrid.value, notes, panel, resolvedTheme, secretMode]);
  const snapshotText = useMemo(() => serializeSnapshot(snapshotValue, {
    kind: 'playground-state',
    version: 1,
  }), [snapshotValue]);
  const copySnapshot = useCallback(async () => {
    const didCopy = await copySnapshotToClipboard(snapshotValue, {
      kind: 'playground-state',
      version: 1,
    });

    setShareStatus(didCopy ? 'copied' : 'unavailable');
    announce(didCopy ? 'Snapshot copied to the clipboard.' : 'Snapshot copy is unavailable.');
  }, [announce, snapshotValue]);
  const shareState = useCallback(async () => {
    const result = await shareContent({
      text: [
        `panel=${panel}`,
        `theme=${resolvedTheme}`,
        `debugGrid=${debugGrid.value ? 'on' : 'off'}`,
      ].join('\n'),
      title: 'tv-shared playground',
    });

    setShareStatus(result);
    announce(
      result === 'shared'
        ? 'State shared.'
        : result === 'copied'
          ? 'State copied to the clipboard.'
          : 'State sharing is unavailable.',
    );
  }, [announce, debugGrid.value, panel, resolvedTheme]);
  const shortcutRegistry = useShortcutRegistry<HTMLDivElement>([
    {
      description: 'Copies the current demo snapshot.',
      id: 'copy-snapshot',
      keys: 'c',
      label: 'Copy snapshot',
      onTrigger: () => {
        void copySnapshot();
      },
    },
    {
      description: 'Uses the Web Share API with clipboard fallback.',
      id: 'share-state',
      keys: 's',
      label: 'Share state',
      onTrigger: () => {
        void shareState();
      },
    },
    {
      hidden: true,
      id: 'toggle-secret-mode',
      label: 'Toggle secret demo mode',
      onTrigger: () => {
        setSecretMode((previousValue) => !previousValue);
        announce('Secret demo mode toggled.');
      },
      sequence: ['d', 'e', 'm', 'o'],
    },
  ]);
  const setShortcutScope = useCallback((node: HTMLDivElement | null) => {
    shortcutRegistry.ref(node);
    debugGrid.ref(node);
  }, [debugGrid.ref, shortcutRegistry.ref]);

  return (
    <main className="playground-shell">
      <section className="hero-card">
        <div className="hero-header">
          <p className="eyebrow">Local Playground</p>
          <TvProgramsWordmark className="hero-wordmark" />
        </div>
        <h1>Test `tv-shared` like a real consumer.</h1>
        <p className="lede">
          This playground now exercises the shared runtime as more than a logo package:
          persistent state, URL state, theme handling, debug flags, shortcuts, snapshots,
          live announcements, and share helpers all run together here.
        </p>
        <div className="status-row">
          <span className="status-pill">{`theme: ${themePreference} -> ${resolvedTheme}`}</span>
          <span className="status-pill">{`system: ${systemTheme}`}</span>
          <span className="status-pill">{`motion: ${prefersReducedMotion ? 'reduce' : 'full'}`}</span>
          <span className="status-pill">{`share: ${shareStatus}`}</span>
        </div>
      </section>

      <section className="demo-grid">
        <article className="demo-card">
          <h2>Brand Primitives</h2>
          <p>Quick sanity check for the shared badge, mark, and wordmark exports.</p>
          <div className="demo-row">
            <BrandBadge />
            <TvProgramsWordmark />
            <TvProgramsMark title="TV Programs" className="component-mark" />
          </div>
        </article>

        <article className="demo-card">
          <h2>Persistent State</h2>
          <p>The note below is backed by `usePersistentState()` on top of `createProjectStorage()`.</p>
          <label className="stacked-field">
            <span className="field-label">{`storage source: ${noteControls.source}`}</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button type="button" onClick={noteControls.clear}>Reset Note</button>
          </div>
        </article>

        <article className="demo-card">
          <h2>URL State</h2>
          <p>`useUrlState()` keeps this view mode in sync with `?panel=` for copyable links.</p>
          <div className="status-row">
            <span className="status-pill">{`panel: ${panel}`}</span>
            <span className="status-pill">{`source: ${panelControls.source}`}</span>
          </div>
          <div className="button-row">
            <button type="button" onClick={() => setPanel('overview')}>Overview</button>
            <button type="button" onClick={() => setPanel('history')}>History</button>
            <button type="button" onClick={() => setPanel('debug')}>Debug</button>
            <button type="button" onClick={panelControls.clear}>Clear URL</button>
          </div>
        </article>

        <article className="demo-card theme-card">
          <h2>Theme Helper</h2>
          <p>The helper persists the preference and resolves it against the current system theme.</p>
          <div className="status-row">
            <span className="status-pill">{`preference: ${themePreference}`}</span>
            <span className="status-pill">{`resolved: ${resolvedTheme}`}</span>
          </div>
          <div className="button-row">
            <button type="button" onClick={() => setThemePreference('light')}>Light</button>
            <button type="button" onClick={() => setThemePreference('dark')}>Dark</button>
            <button type="button" onClick={() => setThemePreference('system')}>System</button>
          </div>
        </article>

        <article className="demo-card scope-card">
          <h2>Shortcuts And Debug Flags</h2>
          <p>
            Focus inside this card and try `g`, `c`, or `s`. The secret sequence is hidden from the
            panel on purpose.
          </p>
          <div className="scope-shell" ref={setShortcutScope} tabIndex={-1}>
            <div className="status-row">
              <span className="status-pill">{`debug grid: ${debugGrid.value ? 'on' : 'off'}`}</span>
              <span className="status-pill">{`debug source: ${debugGrid.source}`}</span>
              <span className="status-pill">{`secret mode: ${secretMode ? 'enabled' : 'hidden'}`}</span>
            </div>
            <div className="button-row">
              <button type="button" onClick={debugGrid.toggle}>Toggle Grid</button>
              <button type="button" onClick={debugGrid.clearStoredValue}>Reset Grid</button>
              <button type="button" onClick={debugGrid.clearUrlOverride}>Clear URL Override</button>
              <button type="button" onClick={() => announce('Playground shortcut scope focused.')}>
                Announce
              </button>
            </div>
          </div>
          <ShortcutPanel shortcuts={shortcutRegistry.visibleShortcuts} />
        </article>

        <article className="demo-card">
          <h2>Share And Snapshot</h2>
          <p>Snapshots stay generic and deterministic so future game consumers can reuse the format.</p>
          <div className="button-row">
            <button type="button" onClick={() => { void copySnapshot(); }}>Copy Snapshot</button>
            <button type="button" onClick={() => { void shareState(); }}>Share State</button>
          </div>
          <pre className="snapshot-preview">{snapshotText}</pre>
        </article>

        <article className="demo-card">
          <h2>Raw Assets</h2>
          <p>Validate URL constants and raw subpath imports a consumer could use.</p>
          <div className="demo-row asset-row">
            <figure className="asset-preview">
              <img
                src={TVPROGRAMS_MARK_SVG_URL}
                alt="TV Programs mark SVG"
                className="asset-mark"
              />
              <figcaption>SVG export</figcaption>
            </figure>
            <figure className="asset-preview">
              <img
                src={TVPROGRAMS_MARK_PNG_URL}
                alt="TV Programs mark PNG"
                className="asset-mark"
              />
              <figcaption>PNG export</figcaption>
            </figure>
            <figure className="asset-preview">
              <img
                src={tvMarkSubpathUrl}
                alt="TV Programs mark via subpath import"
                className="asset-mark"
              />
              <figcaption>Subpath import</figcaption>
            </figure>
          </div>
        </article>

        <article className="demo-card regression-card">
          <h2>Consumer Regression Cases</h2>
          <p>Stress the shared brand primitives with small but realistic consumer variations.</p>
          <div className="regression-stack">
            <div className="regression-case">
              <span className="case-label">Long label</span>
              <BrandBadge label="tvprograms.tech shared package preview build" />
            </div>
            <div className="regression-case">
              <span className="case-label">Custom href</span>
              <BrandBadge href="https://example.com/demo" label="example.com/demo" />
            </div>
            <div className="regression-case dark-case">
              <span className="case-label">Dark surface</span>
              <BrandBadge />
            </div>
            <div className="regression-case">
              <span className="case-label">Unstyled wordmark</span>
              <TvProgramsWordmark className="custom-wordmark" unstyled />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
