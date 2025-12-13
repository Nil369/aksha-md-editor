import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import LiveAkshaEditor from '../components/LiveAkshaEditor';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <div className={styles.buttons}>
          <Link
            style= {{color: "#ffffff"}}
            className="button button--primary button--lg"
            to="/docs/getting-started">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{ marginLeft: '1rem' }}
            href="https://github.com/Nil369/aksha-md-editor">
            View on GitHub
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
        <Heading as="h1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Features
        </Heading>
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
        <Link
          className="button button--primary button--lg"
          to="/docs/getting-started"
          style={{ display: 'block', width: 'max-content', margin: '2rem auto 0', color: "#ffffff" }}
        >
          Explore the Docs 📜
        </Link>
      </div>
    </section>
  );
}



function HomepageDemo() {
  return (
    <section className={styles.demoSection}>
      <div className="container">
        <Heading as="h1" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Aksha MD Editor
        </Heading>
        <Heading as="h2" style={{ textAlign: 'center', marginBottom: '2rem', textDecoration: 'underline' }}>
          See it in Action
        </Heading>
        <div className="container" style={{ marginTop: "3rem", border: "2px solid #B7B9BD", background: "linear-gradient(135deg, #E6E6FA, #D8BFD8, #FFDAB9, #C3B1E1)", borderRadius: "8px", padding: "1rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <LiveAkshaEditor />
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
        <HomepageDemo />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
