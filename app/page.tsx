const publicApps = [
  {
    title: 'Loan Default Predictor',
    description:
      'LightGBM model that estimates default probability on Lending Club personal loans, with a live Streamlit app you can poke at. AUC 0.71.',
    tags: ['Python', 'LightGBM', 'scikit-learn', 'pandas', 'Streamlit'],
    image: '/loan-default-icon.png',
    href: '/apps/loan-default',
  },
  {
    title: 'Stupid Small',
    description:
      'An Android app that defeats procrastination by using AI to break overwhelming tasks into stupidly small micro-steps. Focus timer, streak tracking, and celebration animations included.',
    tags: ['Kotlin', 'Jetpack Compose', 'Room', 'WorkManager', 'Groq', 'Cloudflare Workers'],
    image: '/stupid-small-icon.png',
    href: '/apps/stupid-small',
  },
  {
    title: 'Niner',
    description:
      'Native Android Sudoku app with five difficulties, five game modes, a daily streak puzzle, and a teaching hint engine.',
    tags: ['Kotlin', 'Jetpack Compose', 'StateFlow', 'Coroutines', 'Custom Canvas', 'On-device'],
    image: '/niner-icon.png',
    href: '/apps/niner',
  },
]

const experience = [
  {
    title: 'Data Scientist, AVP',
    org: 'PNC Financial Services',
    meta: '2025 — Present',
    bullets: [
      'Built an XGBoost system that catches Reg-E debit card dispute errors 10x more often than random sampling, taken through MRM validation, production deployment, and Tableau monitoring.',
      'Built the case-sampling tool QA reviewers use day to day; model scores drive risk-targeted review with a random control sample for ongoing validation.',
      'Build Tableau dashboards leadership uses to track dispute error trends and team performance.',
    ],
  },
  {
    title: 'Sr. Business Analytics Consultant, AVP',
    org: 'PNC Financial Services',
    meta: '2022 — 2025',
    bullets: [
      'Owned analytics for relationship-operations strategy, supporting decisions for line-of-business leaders.',
      'Built SQL, PySpark, and Hive pipelines on Cloudera, orchestrated with Oozie, that fed downstream reporting and modeling work.',
      'Top 3, two years running, in PNC\'s enterprise data science competition: multi-class LightGBM (2024), Cox proportional hazards survival model (2025).',
    ],
  },
  {
    title: 'Business Analytics Consultant and earlier roles',
    org: 'PNC Financial Services',
    meta: '2017 — 2022 and prior',
    bullets: [
      'Built the first analytics function on multiple teams that previously had none.',
      'Replaced legacy Excel/VBA reporting with Python and SQL pipelines.',
      'Grew from reporting and collections roles into full analytics ownership.',
    ],
  },
]

const stacks = {
  platforms: ['Python', 'SQL', 'PySpark', 'Hadoop', 'Spark', 'Hive', 'Cloudera', 'Teradata', 'Oracle', 'Oozie', 'Jupyter', 'GitHub', 'Cloudflare Workers'],
  modeling: ['XGBoost', 'LightGBM', 'Scikit-learn', 'Pandas', 'NumPy', 'Cox Proportional Hazards', 'Survival Analysis', 'Classification', 'Feature Engineering', 'Statistical Sampling', 'A/B Testing', 'NLP (TF-IDF)', 'LLMs'],
  visualization: ['Tableau', 'matplotlib', 'seaborn', 'Excel', 'Executive Dashboards'],
}

function Pill({ text }: { text: string }) {
  return <span className="pill">{text}</span>
}

function ProjectCard({
  title,
  description,
  tags,
  image,
  href,
}: {
  title: string
  description: string
  tags: string[]
  image?: string
  href?: string
}) {
  const inner = (
    <>
      {image ? (
        <div className="projectIconFrame">
          <img className="projectIcon" src={image} alt={`${title} icon`} />
        </div>
      ) : null}
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="pillRow">
        {tags.map((tag) => (
          <Pill key={tag} text={tag} />
        ))}
      </div>
    </>
  )

  if (href) {
    return (
      <a className="card tile projectCardLink" href={href}>
        {inner}
      </a>
    )
  }
  return <article className="card tile">{inner}</article>
}

export default function HomePage() {
  return (
    <main>
      <div className="nav">
        <div className="wrap navInner">
          <a href="#top" className="brand">Raymond Jack</a>
          <div className="navLinks">
            <a href="#apps">Work</a>
            <a href="#experience">Experience</a>
            <a href="#stack">Stack</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>

      <header id="top" className="hero wrap">
        <div className="eyebrow">Data Scientist · Applied ML & Analytics</div>
        <h1>Production ML for regulated banking. Two Android apps on the side.</h1>
        <p className="lede">
          Data scientist at a top-10 US bank. I build production models for Reg-E and Reg-Z dispute analytics and the Tableau dashboards leadership uses to track operational risk. Android apps in my spare time.
        </p>
        <div className="ctaRow">
          <a className="btn primary" href="#apps">
            View work
          </a>
          <a className="btn secondary" href="mailto:rayjackcb@gmail.com">
            Get in touch
          </a>
          <a className="btn secondary" href="https://github.com/rjcb-commits/" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>

        <div className="heroStats">
          <div className="heroStat">
            <strong>19</strong>
            <span>years in banking and analytics</span>
          </div>
          <div className="heroStat">
            <strong>Top 3</strong>
            <span>enterprise modeling competition, two years running</span>
          </div>
          <div className="heroStat">
            <strong>2</strong>
            <span>shipped Android apps in the public store</span>
          </div>
        </div>
      </header>

      <section id="apps" className="wrap sectionBlock">
        <div className="sectionHead">
          <div className="sectionLabel">Work</div>
          <h2>Selected work</h2>
          <p>A live ML demo plus two native Android apps.</p>
        </div>
        <div className="grid3">
          {publicApps.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>

      <section id="experience" className="wrap sectionBlock">
        <div className="sectionHead">
          <div className="sectionLabel">Experience</div>
          <h2>Selected roles</h2>
          <p>The short version of the story behind the resume.</p>
        </div>
        <div className="timeline">
          {experience.map((item) => (
            <div className="card timelineItem" key={item.title + item.meta}>
              <div className="timelineHead">
                <div>
                  <h3>{item.title}</h3>
                  <div className="org">{item.org}</div>
                </div>
                <div className="meta">{item.meta}</div>
              </div>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className="wrap sectionBlock">
        <div className="sectionHead">
          <div className="sectionLabel">Toolkit</div>
          <h2>Core stack</h2>
          <p>Tools and methods I use to move from raw data to business decisions.</p>
        </div>
        <div className="grid3">
          <div className="card tile">
            <h3>Languages and platforms</h3>
            <div className="pillRow">{stacks.platforms.map((item) => <Pill key={item} text={item} />)}</div>
          </div>
          <div className="card tile">
            <h3>Modeling and analytics</h3>
            <div className="pillRow">{stacks.modeling.map((item) => <Pill key={item} text={item} />)}</div>
          </div>
          <div className="card tile">
            <h3>Visualization</h3>
            <div className="pillRow">{stacks.visualization.map((item) => <Pill key={item} text={item} />)}</div>
          </div>
        </div>
      </section>

      <section id="contact" className="wrap sectionBlock contactBlock">
        <div className="contactCard">
          <div className="sectionLabel">Contact</div>
          <h2>Let&apos;s connect.</h2>
          <p>
            Always up for a conversation about data science, banking analytics, or product work. Reach out anytime.
          </p>
          <div className="ctaRow">
            <a className="btn primary" href="mailto:rayjackcb@gmail.com">
              rayjackcb@gmail.com
            </a>
            <a className="btn secondary" href="https://github.com/rjcb-commits/" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
