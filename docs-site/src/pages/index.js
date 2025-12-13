import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import LiveAkshaEditor from '../components/LiveAkshaEditor';
import { Circle, Github } from 'lucide-react';


function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            style={{ color: "#ffffff", borderColor: "#ffffff" }}
            to="/docs/getting-started"
          >
            Get Started - 5min ⏱️
          </Link>

          <Link
            className="button button--secondary button--lg npmButton"
            style={{ marginLeft: '1rem', backgroundColor: '#c40504', color: '#ffffff' }}
            href="https://www.npmjs.com/package/aksha-md-editor"
          >
            View on npm
            <img
              alt="NPM Version"
              src="https://www.svgrepo.com/show/355146/npm.svg"
              style={{
                width: '20px',
                height: '20px',
                marginLeft: '0.5rem',
                verticalAlign: 'middle'
              }}
            />
          </Link>

          <Link
            className="button button--secondary button--lg githubButton"
            style={{ marginLeft: '1rem', backgroundColor: '#24292e', color: '#ffffff' }}
            href="https://github.com/Nil369/aksha-md-editor"
          >
            View on GitHub
            <Github
              size={20}
              style={{ verticalAlign: "middle", marginBottom: "0.3rem", marginLeft: "0.3rem" }}
            />
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
        <Heading as="h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
        <Heading as="h1" style={{ textAlign: 'center', textDecoration: 'underline' }}>
          Aksha MD Editor
        </Heading>

        <p style={{ textAlign: 'center', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '4rem' }}>A highly optimized, <strong>production-ready Markdown Editor</strong> for <strong>React</strong> with <strong>live preview</strong> and <strong>VS Code style interface</strong>!</p>

        <div className="container" style={{ marginTop: "3rem", border: "2px solid #B7B9BD", background: "linear-gradient(135deg, #E6E6FA, #D8BFD8, #FFDAB9, #C3B1E1)", borderRadius: "8px", padding: "1rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <Heading
            as="h2"
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              verticalAlign: 'middle'
            }}
          >
            <Circle className={styles.liveDot} size={14} fill="#16a34a" color="#16a34a" />
            Live Editor Preview
          </Heading>

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
