import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            Get Started - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  const features = [
    {
      title: '🎯 Professional Editor',
      description: 'Monaco Editor integration with VS Code features, syntax highlighting, and keyboard shortcuts.',
    },
    {
      title: '📝 Rich Markdown',
      description: 'GitHub Flavored Markdown, math equations with KaTeX, and syntax highlighting for 100+ languages.',
    },
    {
      title: '🎨 Customizable',
      description: 'Multiple view modes (Edit, Preview, Split), theme support (Light, Dark, Auto), and extensive configuration.',
    },
    {
      title: '⚡ Fast',
      description: 'Optimized for large documents with debounced updates and efficient re-rendering.',
    },
    {
      title: '📱 Responsive',
      description: 'Works perfectly on all screen sizes with touch-optimized controls.',
    },
    {
      title: '🔧 TypeScript',
      description: 'Full type safety with comprehensive type definitions and IntelliSense support.',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className={clsx('col col--4', styles.feature)}>
              <div className={styles.featureCard}>
                <Heading as="h3">{feature.title}</Heading>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageCode() {
  return (
    <section className={styles.codeSection}>
      <div className="container">
        <div className="row">
          <div className="col">
            <Heading as="h2">Quick Start</Heading>
            <pre>
              <code>npm install aksha-md-editor</code>
            </pre>
            <pre>
              <code>{`import MarkdownEditor  from 'aksha-md-editor';
import 'aksha-md-editor/dist/styles.css';

function App() {
  return <MarkdownEditor defaultViewMode="split" />;
}`}</code>
            </pre>
            <div style={{ marginTop: '2rem' }}>
              <Link
                className="button button--primary button--lg"
                to="/docs/introduction">
                Read the Documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={`${siteConfig.title} - A Highly Optimized Markdown Editor for React`}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        {/* <HomepageCode /> */}
      </main>
    </Layout>
  );
}
