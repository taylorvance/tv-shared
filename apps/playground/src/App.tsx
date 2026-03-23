import {
  BrandBadge,
  TVPROGRAMS_MARK_SVG_URL,
  TvProgramsMark,
} from '@taylorvance/tv-shared-ui';

function App() {
  return (
    <main className="playground-shell">
      <section className="hero-card">
        <p className="eyebrow">Local Playground</p>
        <h1>Test `tv-shared` like a real consumer.</h1>
        <p className="lede">
          This app watches local package builds so changes in `packages/ui`
          flow into a real consumer app during development.
        </p>
      </section>

      <section className="demo-grid">
        <article className="demo-card">
          <h2>Default Badge</h2>
          <p>Quick sanity check for the shipped defaults.</p>
          <div className="demo-row">
            <BrandBadge />
          </div>
        </article>

        <article className="demo-card">
          <h2>Consumer Styling</h2>
          <p>Exercise the unstyled path with consumer-owned classes.</p>
          <div className="demo-row">
            <BrandBadge
              className="custom-badge"
              iconClassName="custom-badge-icon"
              labelClassName="custom-badge-label"
              label="TV Shared"
              unstyled
            />
          </div>
        </article>

        <article className="demo-card">
          <h2>Raw Assets</h2>
          <p>Validate the asset export path a consumer would use.</p>
          <div className="demo-row">
            <img
              src={TVPROGRAMS_MARK_SVG_URL}
              alt="TV Programs mark"
              className="asset-mark"
            />
          </div>
        </article>

        <article className="demo-card">
          <h2>Mark Component</h2>
          <p>Check the React export directly with inherited color.</p>
          <div className="demo-row mark-row">
            <TvProgramsMark title="TV Programs" className="component-mark" />
            <span>Inherited color test</span>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
