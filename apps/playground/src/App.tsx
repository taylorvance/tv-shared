import {
  TvProgramsMark,
} from '@taylorvance/tv-shared-ui';
import { BrandBadge } from '@taylorvance/tv-shared-ui/BrandBadge';
import {
  TVPROGRAMS_MARK_PNG_URL,
  TVPROGRAMS_MARK_SVG_URL,
} from '@taylorvance/tv-shared-ui/assets';
import tvMarkSubpathUrl from '@taylorvance/tv-shared-ui/tv.svg';

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

        <article className="demo-card">
          <h2>Mark Component</h2>
          <p>Check the React export directly with inherited color.</p>
          <div className="demo-row mark-row">
            <TvProgramsMark title="TV Programs" className="component-mark" />
            <span>Inherited color test</span>
          </div>
        </article>

        <article className="demo-card regression-card">
          <h2>Consumer Regression Cases</h2>
          <p>Stress the shared badge with small but realistic consumer variations.</p>
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
              <span className="case-label">Unstyled fallback</span>
              <BrandBadge unstyled label="Unstyled badge" />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
