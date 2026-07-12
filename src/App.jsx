import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import heroSlab from './assets/hero.png'

const profile = {
  handle: 'd1vyansh',
  host: 'archbox',
  name: 'Divyansh',
  role: 'Linux-first developer and problem solver',
  location: 'India',
  status: 'Building fast interfaces, dotfiles, and a measurable problem-solving graph.',
  links: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/L0calised' },
    { id: 'codeforces', label: 'Codeforces', href: 'https://codeforces.com/profile/d1vyxn5h' },
    { id: 'atcoder', label: 'AtCoder', href: 'https://atcoder.jp/users/d1vyansh' },
    { id: 'leetcode', label: 'LeetCode', href: 'https://leetcode.com/u/d1vyan5h/' },
    { id: 'usaco', label: 'USACO', href: 'https://usaco.org/' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@localisedcharge' },
  ],
}

const accounts = {
  codeforces: 'd1vyxn5h',
  atcoder: 'd1vyansh',
  leetcode: 'd1vyan5h',
  usaco: 'divyansh293',
  github: 'L0calised',
  youtube: 'localisedcharge',
}

const projects = [
  {
    id: 'portfolio-os',
    title: 'Portfolio OS',
    kind: 'React interface',
    signal: 'Keyboard-first one-page portfolio with command routing, file preview, and live panels.',
    impact: 'Turns the portfolio itself into a usable interface instead of a static resume page.',
    stack: ['React', 'Vite', 'CSS', 'State machines'],
    href: '#command',
    files: [
      ['README.md', 'One-page system interface with command search, section jumps, and working project panels.'],
      ['commands.ts', 'help, search, open, theme, filter, refresh, clear, status'],
      ['design.log', 'Amber terminal chrome, thin borders, dense data, and direct navigation.'],
    ],
  },
  {
    id: 'dotfiles',
    title: 'Hyprland Dotfiles',
    kind: 'Linux workflow',
    signal: 'Config-driven desktop: Hyprland, Waybar, tmux, zsh, Neovim, scripts.',
    impact: 'Daily-driver environment optimized around fast navigation and readable configs.',
    stack: ['Arch Linux', 'Hyprland', 'Lua', 'Shell'],
    href: '#work',
    files: [
      ['hyprland.conf', 'Tiling workflow, keybinds, monitor rules, launcher and system scripts.'],
      ['waybar.css', 'Compact status bar with dense system signals.'],
      ['nvim.lua', 'Small plugin set, fast editing path, terminal-friendly defaults.'],
    ],
  },
  {
    id: 'cp-notebook',
    title: 'CP Notebook',
    kind: 'Algorithms',
    signal: 'Structured notes for patterns, contest review, and C++ templates.',
    impact: 'Makes practice measurable: solved logs, weak-topic queues, reusable snippets.',
    stack: ['C++', 'STL', 'Graphs', 'DP'],
    href: '#work',
    files: [
      ['graphs.cpp', 'BFS, DFS, shortest paths, DSU, topological ordering.'],
      ['dp.md', 'State definitions, transitions, tabulation notes, revision queue.'],
      ['contest.log', 'After-contest review format with misses and next drills.'],
    ],
  },
  {
    id: 'terminal-tools',
    title: 'Terminal Tools',
    kind: 'Small utilities',
    signal: 'Scripts and compact tools for local workflow automation.',
    impact: 'Cuts repetitive setup and keeps the desktop predictable.',
    stack: ['Shell', 'Node', 'Git', 'CLI UX'],
    href: '#work',
    files: [
      ['bootstrap.sh', 'Install and link common tools with explicit, readable steps.'],
      ['notes-sync.js', 'Keeps notes and project references easy to find.'],
      ['checks.sh', 'Local quality checks before pushing a change.'],
    ],
  },
]

const skills = [
  { name: 'React', level: 82, note: 'Stateful interfaces, keyboard UX, component systems' },
  { name: 'Linux', level: 88, note: 'Arch, Hyprland, shell workflows, desktop tooling' },
  { name: 'C++', level: 74, note: 'DSA practice, contest templates, STL fluency' },
  { name: 'JavaScript', level: 80, note: 'Browser APIs, data-driven UI, Vite apps' },
  { name: 'Neovim', level: 86, note: 'Lua config, fast editing loops, terminal habits' },
  { name: 'Git', level: 78, note: 'Clean diffs, focused commits, readable history' },
]

const logs = [
  'boot portfolio-os: ready',
  'loaded workspace: one-page terminal desktop',
  'mounted real command router: help/search/open/filter/theme/refresh',
  'synced project browser with portfolio data',
]

const commands = [
  'help',
  'about',
  'work',
  'skills',
  'solving',
  'contact',
  'status',
  'projects',
  'refresh',
  'reset cache',
  'search',
  'filter',
  'open',
  'theme',
  'clear',
]

const sections = ['home', 'solving', 'work', 'skills', 'contact']

const platformMeta = {
  all: { label: 'All', short: 'all' },
  codeforces: { label: 'Codeforces', short: 'CF' },
  atcoder: { label: 'AtCoder', short: 'AC' },
  leetcode: { label: 'LeetCode', short: 'LC' },
  usaco: { label: 'USACO', short: 'US' },
  github: { label: 'GitHub', short: 'GH' },
}

const currentYear = new Date().getUTCFullYear()
const cacheKey = 'portfolio-solving-cache-v2'
const activityTimeZone = 'Asia/Kolkata'

function App() {
  return (
    <ErrorBoundary>
      <PortfolioApp />
    </ErrorBoundary>
  )
}

function PortfolioApp() {
  const [theme, setTheme] = useState('amber')
  const [activeSection, setActiveSection] = useState('home')
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id)
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [skillIndex, setSkillIndex] = useState(0)
  const [platformFilter, setPlatformFilter] = useState('all')
  const [solvingData, setSolvingData] = useState(() => readCachedSolvingData() ?? createEmptySolvingData())
  const [query, setQuery] = useState('')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState(logs)
  const [clock, setClock] = useState(() => new Date())
  const commandRef = useRef(null)
  const didInitialRefresh = useRef(false)

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0]
  const selectedFile = selectedProject.files[Math.min(selectedFileIndex, selectedProject.files.length - 1)]
  const filteredProjects = useMemo(() => filterProjects(query), [query])
  const searchHits = useMemo(() => buildSearchHits(query), [query])
  const visibleActivity = useMemo(
    () => filterActivity(solvingData.activity, platformFilter),
    [platformFilter, solvingData.activity],
  )
  const progress = useMemo(() => buildProgress(visibleActivity), [visibleActivity])
  const solvingSummary = useMemo(() => summarizeSolving(solvingData), [solvingData])
  const recentActivity = useMemo(
    () => filterRecent(solvingData.recent, platformFilter),
    [platformFilter, solvingData.recent],
  )

  const appendHistory = useCallback((line) => {
    setHistory((items) => [...items.slice(-9), line])
  }, [])

  const refreshSolving = useCallback(async () => {
    setSolvingData((current) => ({ ...current, loading: true }))
    appendHistory('refreshing live solving telemetry')
    try {
      const nextData = await fetchSolvingData()
      writeCachedSolvingData(nextData)
      setSolvingData(nextData)
      appendHistory(`telemetry updated: ${nextData.updatedAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`)
    } catch {
      setSolvingData((current) => ({ ...current, loading: false }))
      appendHistory('telemetry refresh failed; showing cached data')
    }
  }, [appendHistory])

  const resetSolvingCache = useCallback(async () => {
    clearSolvingCache()
    setSolvingData(createEmptySolvingData())
    appendHistory('telemetry cache cleared')
    await refreshSolving()
  }, [appendHistory, refreshSolving])

  const jumpTo = useCallback((id) => {
    const section = document.getElementById(id)
    if (!section) return false
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
    return true
  }, [])

  const runCommand = useCallback(async (rawValue = command) => {
    const value = rawValue.trim()
    if (!value) return

    const [cmd, ...rest] = value.toLowerCase().split(/\s+/)
    const arg = rest.join(' ')
    appendHistory(`[${profile.handle}@${profile.host}]$ ${value}`)
    setCommand('')

    if (cmd === 'clear') {
      setHistory([])
      return
    }

    if (cmd === 'help') {
      appendHistory(`commands: ${commands.join(', ')}`)
      return
    }

    if (cmd === 'about' || cmd === 'status') {
      appendHistory(`${profile.role} - ${profile.status}`)
      setActiveSection('home')
      return
    }

    if (sections.includes(cmd)) {
      jumpTo(cmd)
      appendHistory(`opened section: ${cmd}`)
      return
    }

    if (cmd === 'projects' || cmd === 'work') {
      jumpTo('work')
      appendHistory(`${projects.length} projects loaded`)
      return
    }

    if (cmd === 'refresh') {
      await refreshSolving()
      return
    }

    if (cmd === 'reset' && arg === 'cache') {
      await resetSolvingCache()
      return
    }

    if (cmd === 'skills') {
      jumpTo('skills')
      appendHistory(`${skills.length} skill meters loaded`)
      return
    }

    if (cmd === 'contact') {
      jumpTo('contact')
      appendHistory('contact: github, codeforces, atcoder, leetcode, youtube')
      return
    }

    if (cmd === 'theme') {
      const next = arg === 'paper' || arg === 'amber' ? arg : theme === 'amber' ? 'paper' : 'amber'
      setTheme(next)
      appendHistory(`theme set to ${next}`)
      return
    }

    if (cmd === 'search' || cmd === 'filter') {
      setQuery(arg)
      if (platformMeta[arg]) setPlatformFilter(arg)
      appendHistory(arg ? `searching portfolio for "${arg}"` : 'search cleared')
      return
    }

    if (cmd === 'open') {
      const target = findTarget(arg)
      if (!target) {
        appendHistory(`open: unknown target "${arg || '<empty>'}"`)
        return
      }
      if (target.type === 'project') {
        setSelectedProjectId(target.project.id)
        setSelectedFileIndex(0)
        jumpTo('work')
        appendHistory(`selected project: ${target.project.title}`)
        return
      }
      if (target.type === 'section') {
        jumpTo(target.id)
        appendHistory(`opened section: ${target.id}`)
        return
      }
      window.open(target.href, '_blank', 'noopener,noreferrer')
      appendHistory(`opened ${target.label}`)
      return
    }

    appendHistory(`command not found: ${cmd}. try help`)
  }, [appendHistory, command, jumpTo, refreshSolving, resetSolvingCache, theme])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!didInitialRefresh.current) {
      didInitialRefresh.current = true
      refreshSolving()
    }
    const timer = window.setInterval(refreshSolving, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [refreshSolving])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        commandRef.current?.focus()
        return
      }
      if (event.altKey && event.key >= '1' && event.key <= String(sections.length)) {
        event.preventDefault()
        jumpTo(sections[Number(event.key) - 1])
        return
      }
      if (event.altKey && event.key.toLowerCase() === 't') {
        event.preventDefault()
        setTheme((current) => (current === 'amber' ? 'paper' : 'amber'))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [jumpTo])

  return (
    <main className={`site theme-${theme}`}>
      <BackgroundGrid />
      <Header
        activeSection={activeSection}
        clock={clock}
        onCommandFocus={() => commandRef.current?.focus()}
        onTheme={() => setTheme((current) => (current === 'amber' ? 'paper' : 'amber'))}
        onJump={jumpTo}
        theme={theme}
      />

      <section className="hero-shell section" id="home">
        <div className="hero-copy">
          <p className="kicker">d1vyansh@archbox:~/portfolio</p>
          <h1>Divyansh builds terminal-grade systems.</h1>
          <p className="hero-text">
            I build compact interfaces and keep my problem-solving progress live:
            Codeforces, AtCoder, LeetCode, and GitHub activity combined into one signal.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={() => jumpTo('solving')}>Live stats</button>
            <button
              type="button"
              className="ghost"
              onClick={() => window.open(profile.links[0].href, '_blank', 'noopener,noreferrer')}
            >
              Open GitHub
            </button>
          </div>
        </div>

        <CommandCenter
          command={command}
          commandRef={commandRef}
          history={history}
          onCommand={setCommand}
          onRun={runCommand}
          query={query}
          searchHits={searchHits}
          setQuery={setQuery}
        />
      </section>

      <section className="solving-section section" id="solving">
        <SectionTitle
          eyebrow="live telemetry"
          title="Problem-solving graph pulled from real profiles."
          text="The dashboard combines public Codeforces, AtCoder, LeetCode, and GitHub signals, then refreshes quietly in the background."
        />
        <SolvingDashboard
          filter={platformFilter}
          progress={progress}
          setFilter={setPlatformFilter}
          solvingData={solvingData}
          solvingSummary={solvingSummary}
          visibleActivity={visibleActivity}
          recentActivity={recentActivity}
          onRefresh={refreshSolving}
          onResetCache={resetSolvingCache}
        />
      </section>

      <section className="workbench section" id="work">
        <SectionTitle
          eyebrow="workbench"
          title="Projects with real browsing, not static cards."
          text="Selecting a project updates the file preview, stack, and detail panel from one shared source of truth. Larp larp sahur."
        />
        <div className="work-grid">
          <ProjectList
            filteredProjects={filteredProjects}
            selectedProjectId={selectedProjectId}
            setQuery={setQuery}
            setSelectedFileIndex={setSelectedFileIndex}
            setSelectedProjectId={setSelectedProjectId}
          />
          <FileBrowser
            selectedFile={selectedFile}
            selectedFileIndex={selectedFileIndex}
            selectedProject={selectedProject}
            setSelectedFileIndex={setSelectedFileIndex}
          />
          <ProjectDetail project={selectedProject} />
        </div>
      </section>

      <section className="skills-section section" id="skills">
          <SectionTitle
            eyebrow="stack telemetry"
            title="Skill meters tuned for the work I actually do."
            text="Each signal maps to a practical working habit: building interfaces, using Linux well, and improving through contests. TBH its all bullshit, these are just random numbers "
        />
        <div className="skills-grid">
          <div className="skill-list">
            {skills.map((skill, index) => (
              <button
                className={index === skillIndex ? 'skill selected' : 'skill'}
                key={skill.name}
                type="button"
                onClick={() => setSkillIndex(index)}
              >
                <span>{skill.name}</span>
                <b>{skill.level}%</b>
                <i><span style={{ width: `${skill.level}%` }} /></i>
              </button>
            ))}
          </div>
          <article className="skill-detail">
            <p className="large-number">{skills[skillIndex].level}</p>
            <h3>{skills[skillIndex].name}</h3>
            <p>{skills[skillIndex].note}</p>
            <div className="signal-row">
              <span>focus</span>
              <b>{profile.status}</b>
            </div>
          </article>
        </div>
      </section>

      <section className="contact-section section" id="contact">
        <div className="contact-panel">
          <SectionTitle
            eyebrow="contact"
            title="Profiles, streams, and code activity."
            text="These are the public accounts wired into the live dashboard and command center."
          />
          <div className="link-grid">
            {profile.links.map((link) => (
              <a href={link.href} key={link.id} rel="noreferrer" target="_blank">
                <span>{link.label}</span>
                <b>{link.id}</b>
              </a>
            ))}
          </div>
          <button
            type="button"
            className="primary-link"
            onClick={() => window.open(profile.links[0].href, '_blank', 'noopener,noreferrer')}
          >
            github.com/{accounts.github}
          </button>
        </div>
        <div className="visual-panel" aria-hidden="true">
          <img src={heroSlab} alt="" />
          <div>
            <span>ready</span>
            <b>ship polished interfaces</b>
          </div>
        </div>
      </section>
    </main>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="site theme-amber">
          <section className="crash-panel">
            <p className="kicker">portfolio-os recovered</p>
            <h1>Something broke during render.</h1>
            <p>
              The page did not disappear; reload once to retry with fresh telemetry.
              If it keeps happening, clear the browser cache for this site.
            </p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload portfolio
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                clearSolvingCache()
                window.location.reload()
              }}
            >
              Clear cache and reload
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

function Header({ activeSection, clock, onCommandFocus, onJump, onTheme, theme }) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onJump('home')}>
        <span>d1vyansh</span>
        <b>portfolio-os</b>
      </button>
      <nav aria-label="Sections">
        {sections.map((section, index) => (
          <button
            className={activeSection === section ? 'active' : ''}
            key={section}
            type="button"
            onClick={() => onJump(section)}
          >
            {index + 1} {section}
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <button type="button" onClick={onCommandFocus}>ctrl+k</button>
        <button type="button" onClick={onTheme}>{theme}</button>
        <time>{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
      </div>
    </header>
  )
}

function CommandCenter({ command, commandRef, history, onCommand, onRun, query, searchHits, setQuery }) {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [history])

  return (
    <aside className="command-card" id="command">
      <div className="window-head">
        <span>command-center</span>
        <i />
      </div>
      <div className="command-body">
        <div className="fastfetch">
          <pre>{asciiMark}</pre>
          <div>
            <Info label="user" value={`${profile.handle}@${profile.host}`} />
            <Info label="role" value={profile.role} />
            <Info label="wm" value="Hyprland" />
            <Info label="editor" value="Neovim" />
            <Info label="mode" value="one-page portfolio" />
          </div>
        </div>

        <label className="search-line">
          <span>search</span>
          <input
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="project, stack, signal..."
            value={query}
          />
        </label>

        <div className="hits">
          {searchHits.slice(0, 5).map((hit) => (
            <button key={hit.id} type="button" onClick={() => onRun(`open ${hit.id}`)}>
              <span>{hit.label}</span>
              <b>{hit.type}</b>
            </button>
          ))}
        </div>

        <div className="terminal-output" ref={outputRef}>
          {history.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
        </div>

        <form
          className="prompt"
          onSubmit={(event) => {
            event.preventDefault()
            onRun()
          }}
        >
          <span>$</span>
          <input
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            list="command-list"
            onChange={(event) => onCommand(event.target.value)}
            placeholder="help, open dotfiles, search react, theme"
            ref={commandRef}
            spellCheck="false"
            value={command}
          />
          <datalist id="command-list">
            {commands.map((item) => <option key={item} value={item} />)}
            {projects.map((project) => <option key={project.id} value={`open ${project.id}`} />)}
          </datalist>
        </form>
      </div>
    </aside>
  )
}

function SolvingDashboard({
  filter,
  progress,
  recentActivity,
  setFilter,
  solvingData,
  solvingSummary,
  visibleActivity,
  onRefresh,
  onResetCache,
}) {
  return (
    <div className="solving-grid">
      <section className="progress-panel">
        <div className="progress-head">
          <div>
            <b>{solvingSummary.totalSolved}</b>
            <span>accepted problems tracked</span>
          </div>
          <Metric label="active days" value={progress.activeDays} />
          <Metric label="active streak" value={progress.currentStreak} />
          <Metric label="max streak" value={progress.maxStreak} />
          <button type="button" onClick={onRefresh}>
            {solvingData.loading ? 'syncing' : 'refresh'}
          </button>
          <button type="button" onClick={onResetCache}>
            reset cache
          </button>
        </div>

        <div className="platform-filters" aria-label="Problem solving filters">
          {Object.entries(platformMeta).map(([id, item]) => (
            <button
              className={filter === id ? 'selected' : ''}
              key={id}
              type="button"
              onClick={() => setFilter(id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ActivityCalendar days={progress.days} monthLabels={progress.monthLabels} />

        <div className="progress-foot">
          <span>Includes accepted submissions where public APIs expose dates.</span>
          <div className="legend">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => <i className={`level-${level}`} key={level} />)}
            <span>More</span>
          </div>
        </div>
      </section>

      <aside className="account-panel">
        <div className="panel-title">
          <span>accounts</span>
          <small>{solvingData.updatedAt ? `updated ${formatTime(solvingData.updatedAt)}` : 'waiting'}</small>
        </div>
        <div className="account-list">
          {solvingData.platforms.map((item) => (
            <a className="account-row" href={item.href} key={item.id} rel="noreferrer" target="_blank">
              <span>{item.label}</span>
            <b>{item.primary}</b>
            <small>{item.secondary}</small>
              <i className={item.ok ? 'ok' : 'warn'}>{item.status ?? (item.ok ? 'live' : 'limited')}</i>
            </a>
          ))}
        </div>
      </aside>

      <section className="combine-panel">
        <div className="panel-title">
          <span>combined signal</span>
        </div>
        <div className="combine-stats">
          <Metric label="submissions this year" value={progress.total} />
          <Metric label="active platforms" value={solvingSummary.livePlatforms} />
          <Metric label="github public events" value={solvingSummary.githubEvents} />
          <Metric label="filtered activity" value={visibleActivity.length} />
        </div>
        <p>
          Live coding profiles sync automatically. The YouTube stream link stays in contact
          so the dashboard remains focused on coding activity.
        </p>
      </section>

      <section className="recent-panel">
        <div className="panel-title">
          <span>recent accepts / commits</span>
          <small>{platformMeta[filter].label}</small>
        </div>
        <div className="recent-list">
          {recentActivity.length > 0 ? recentActivity.slice(0, 12).map((item) => (
            <a className="recent-row" href={item.href} key={item.id} rel="noreferrer" target="_blank">
              <span>{platformMeta[item.platform]?.short ?? item.platform}</span>
              <b>{item.title}</b>
              <small>{item.meta}</small>
              <time>{formatRelativeDate(item.date)}</time>
            </a>
          )) : (
            <p>No recent public activity available for this filter yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

function ActivityCalendar({ days, monthLabels }) {
  return (
    <div className="activity-wrap">
      <div className="months">
        {monthLabels.map((item) => (
          <span key={item.month} style={{ gridColumn: `${item.column} / span 4` }}>
            {item.month}
          </span>
        ))}
      </div>
      <div className="calendar-row">
        <div className="weekdays">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className="activity-grid" style={{ gridTemplateColumns: `repeat(${Math.ceil(days.length / 7)}, 11px)` }}>
          {days.map((day) => (
            <span
              aria-label={`${day.date}: ${day.count} accepted activity`}
              className={`level-${day.level}`}
              key={day.key}
              title={`${day.date}: ${day.count}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectList({ filteredProjects, selectedProjectId, setQuery, setSelectedFileIndex, setSelectedProjectId }) {
  return (
    <aside className="project-list">
      <div className="panel-title">
        <span>projects</span>
        <button type="button" onClick={() => setQuery('')}>reset</button>
      </div>
      {filteredProjects.map((project) => (
        <button
          className={selectedProjectId === project.id ? 'project-row selected' : 'project-row'}
          key={project.id}
          type="button"
          onClick={() => {
            setSelectedProjectId(project.id)
            setSelectedFileIndex(0)
          }}
        >
          <span>{project.title}</span>
          <b>{project.kind}</b>
        </button>
      ))}
    </aside>
  )
}

function FileBrowser({ selectedFile, selectedFileIndex, selectedProject, setSelectedFileIndex }) {
  return (
    <aside className="file-browser">
      <div className="panel-title">
        <span>files/{selectedProject.id}</span>
      </div>
      <div className="file-layout">
        <div className="file-list">
          {selectedProject.files.map((file, index) => (
            <button
              className={selectedFileIndex === index ? 'selected' : ''}
              key={file[0]}
              type="button"
              onClick={() => setSelectedFileIndex(index)}
            >
              {file[0]}
            </button>
          ))}
        </div>
        <article className="file-preview">
          <header>{selectedFile[0]}</header>
          <p>{selectedFile[1]}</p>
        </article>
      </div>
    </aside>
  )
}

function ProjectDetail({ project }) {
  return (
    <article className="project-detail">
      <p>{project.kind}</p>
      <h3>{project.title}</h3>
      <strong>{project.signal}</strong>
      <span>{project.impact}</span>
      <div className="stack">
        {project.stack.map((item) => <b key={item}>{item}</b>)}
      </div>
      <a href={project.href}>open context</a>
    </article>
  )
}

function SectionTitle({ eyebrow, text, title }) {
  return (
    <div className="section-title">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{text}</span>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <p className="info">
      <span>{label}</span>
      <b>{value}</b>
    </p>
  )
}

function BackgroundGrid() {
  return (
    <div className="background" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

function createEmptySolvingData() {
  return {
    activity: [],
    loading: true,
    platforms: [
      platformFallback('codeforces', 'Codeforces', `@${accounts.codeforces}`, 'waiting for API'),
      platformFallback('atcoder', 'AtCoder', `@${accounts.atcoder}`, 'waiting for API'),
      platformFallback('leetcode', 'LeetCode', `@${accounts.leetcode}`, 'waiting for API'),
      usacoPlatform(),
      platformFallback('github', 'GitHub', `@${accounts.github}`, 'waiting for API'),
    ],
    recent: [],
    updatedAt: null,
  }
}

function readCachedSolvingData() {
  try {
    const rawValue = window.localStorage.getItem(cacheKey)
    if (!rawValue) return null
    const cached = JSON.parse(rawValue)
    if (!Array.isArray(cached.platforms) || !Array.isArray(cached.activity)) return null

    return {
      activity: cached.activity,
      loading: false,
      platforms: cached.platforms,
      recent: (cached.recent ?? [])
        .map((item) => ({ ...item, date: new Date(item.date) }))
        .filter((item) => !Number.isNaN(item.date.getTime())),
      updatedAt: cached.updatedAt ? new Date(cached.updatedAt) : null,
    }
  } catch {
    return null
  }
}

function writeCachedSolvingData(data) {
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify({
      activity: data.activity,
      platforms: data.platforms,
      recent: data.recent,
      updatedAt: data.updatedAt?.toISOString() ?? null,
    }))
  } catch {
    // Cache is only a speed/resilience layer; the live dashboard still works without it.
  }
}

function clearSolvingCache() {
  try {
    window.localStorage.removeItem(cacheKey)
  } catch {
    // Cache clearing is best-effort.
  }
}

async function fetchSolvingData() {
  const results = await Promise.allSettled([
    fetchCodeforces(),
    fetchAtCoder(),
    fetchLeetCode(),
    fetchGitHub(),
  ])

  const platforms = results.map((result, index) => (
    result.status === 'fulfilled' ? result.value : fallbackByIndex(index)
  ))
  platforms.splice(3, 0, usacoPlatform())

  return {
    activity: platforms.flatMap((item) => item.activity),
    loading: false,
    platforms,
    recent: platforms.flatMap((item) => item.recent).sort((a, b) => b.date - a.date),
    updatedAt: new Date(),
  }
}

async function fetchCodeforces() {
  const [userResponse, submissionsResponse] = await Promise.all([
    fetchJson(`https://codeforces.com/api/user.info?handles=${accounts.codeforces}`),
    fetchJson(`https://codeforces.com/api/user.status?handle=${accounts.codeforces}`),
  ])
  if (userResponse.status !== 'OK' || submissionsResponse.status !== 'OK') {
    throw new Error('Codeforces response was not OK')
  }

  const user = userResponse.result[0] ?? {}
  const accepted = submissionsResponse.result.filter((item) => item.verdict === 'OK')
  const solved = new Set(accepted.map((item) => problemKey(item.problem)))
  const activity = accepted
    .filter((item) => isCurrentYear(item.creationTimeSeconds))
    .map((item) => activityItem('codeforces', item.creationTimeSeconds))

  return {
    activity,
    href: `https://codeforces.com/profile/${accounts.codeforces}`,
    id: 'codeforces',
    label: 'Codeforces',
    ok: true,
    primary: `${user.rating ?? 'unrated'} rating`,
    recent: accepted.slice(0, 8).map((item) => ({
      date: new Date(item.creationTimeSeconds * 1000),
      href: codeforcesProblemHref(item.problem),
      id: `cf-${item.id}`,
      meta: `${item.programmingLanguage ?? 'submission'} | ${formatContest(item.problem)}`,
      platform: 'codeforces',
      title: item.problem?.name ?? 'Accepted problem',
    })),
    secondary: `${solved.size} solved | max ${user.maxRating ?? 'n/a'}`,
    totalSolved: solved.size,
  }
}

async function fetchAtCoder() {
  const submissions = await fetchJson(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${accounts.atcoder}&from_second=0`,
  )
  const accepted = submissions.filter((item) => item.result === 'AC')
  const solved = new Set(accepted.map((item) => item.problem_id))
  const activity = accepted
    .filter((item) => isCurrentYear(item.epoch_second))
    .map((item) => activityItem('atcoder', item.epoch_second))

  return {
    activity,
    href: `https://atcoder.jp/users/${accounts.atcoder}`,
    id: 'atcoder',
    label: 'AtCoder',
    ok: true,
    primary: `${solved.size} AC`,
    recent: accepted.slice(-8).reverse().map((item) => ({
      date: new Date(item.epoch_second * 1000),
      href: `https://atcoder.jp/contests/${item.contest_id}/tasks/${item.problem_id}`,
      id: `ac-${item.id}`,
      meta: `${item.language} | ${item.point} pts`,
      platform: 'atcoder',
      title: item.problem_id,
    })),
    secondary: `${accepted.length} accepted submissions`,
    totalSolved: solved.size,
  }
}

async function fetchLeetCode() {
  const stats = await fetchJson(`https://leetcode-api-faisalshohag.vercel.app/${accounts.leetcode}`)
  const calendar = stats.submissionCalendar ?? {}
  const activity = Object.entries(calendar)
    .filter(([epochSeconds]) => isCurrentYear(Number(epochSeconds)))
    .map(([epochSeconds, count]) => ({
      count: Number(count),
      date: localDateKey(new Date(Number(epochSeconds) * 1000)),
      platform: 'leetcode',
    }))

  return {
    activity,
    href: `https://leetcode.com/u/${accounts.leetcode}/`,
    id: 'leetcode',
    label: 'LeetCode',
    ok: true,
    primary: `${stats.totalSolved ?? stats.solvedProblem ?? 0} solved`,
    recent: (stats.recentSubmissions ?? [])
      .filter((item) => item.statusDisplay === 'Accepted')
      .slice(0, 8)
      .map((item, index) => ({
        date: new Date(Number(item.timestamp) * 1000),
        href: `https://leetcode.com/problems/${item.titleSlug}/`,
        id: `lc-${item.timestamp}-${index}`,
        meta: item.lang,
        platform: 'leetcode',
        title: item.title,
      })),
    secondary: `easy ${stats.easySolved ?? 0} | med ${stats.mediumSolved ?? 0} | hard ${stats.hardSolved ?? 0}`,
    totalSolved: Number(stats.totalSolved ?? stats.solvedProblem ?? 0),
  }
}

async function fetchGitHub() {
  const [user, events] = await Promise.all([
    fetchJson(`https://api.github.com/users/${accounts.github}`),
    fetchJson(`https://api.github.com/users/${accounts.github}/events/public?per_page=100`),
  ])
  const usefulEvents = events.filter((item) => ['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(item.type))
  const activity = usefulEvents
    .filter((item) => Number(localDateKey(new Date(item.created_at)).slice(0, 4)) === currentYear)
    .map((item) => ({
      count: item.type === 'PushEvent' ? Math.max(1, item.payload?.commits?.length ?? 1) : 1,
      date: localDateKey(new Date(item.created_at)),
      platform: 'github',
    }))

  return {
    activity,
    href: `https://github.com/${accounts.github}`,
    id: 'github',
    label: 'GitHub',
    ok: true,
    primary: `${user.public_repos ?? 0} repos`,
    recent: usefulEvents.slice(0, 8).map((item) => ({
      date: new Date(item.created_at),
      href: `https://github.com/${item.repo?.name ?? accounts.github}`,
      id: `gh-${item.id}`,
      meta: item.type.replace('Event', ''),
      platform: 'github',
      title: item.repo?.name ?? 'GitHub activity',
    })),
    secondary: `${usefulEvents.length} recent public events`,
    totalSolved: 0,
  }
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

function fallbackByIndex(index) {
  const fallbacks = [
    platformFallback('codeforces', 'Codeforces', `@${accounts.codeforces}`, 'public API unavailable'),
    platformFallback('atcoder', 'AtCoder', `@${accounts.atcoder}`, 'public API unavailable'),
    platformFallback('leetcode', 'LeetCode', `@${accounts.leetcode}`, 'unofficial API unavailable'),
    platformFallback('github', 'GitHub', `@${accounts.github}`, 'public API unavailable'),
  ]
  return fallbacks[index]
}

function usacoPlatform() {
  return {
    activity: [],
    href: 'https://usaco.org/',
    id: 'usaco',
    label: 'USACO',
    ok: false,
    primary: `@${accounts.usaco}`,
    recent: [],
    secondary: 'training account linked',
    status: 'linked',
    totalSolved: 0,
  }
}

function platformFallback(id, label, primary, secondary) {
  return {
    activity: [],
    href: profile.links.find((link) => link.id === id)?.href ?? '#',
    id,
    label,
    ok: false,
    primary,
    recent: [],
    secondary,
    totalSolved: 0,
  }
}

function summarizeSolving(solvingData) {
  return {
    githubEvents: solvingData.platforms.find((item) => item.id === 'github')?.activity.length ?? 0,
    livePlatforms: solvingData.platforms.filter((item) => item.ok).length,
    totalSolved: solvingData.platforms.reduce((sum, item) => sum + (item.totalSolved ?? 0), 0),
  }
}

function buildProgress(activity) {
  const counts = activity.reduce((map, item) => {
    map.set(item.date, (map.get(item.date) ?? 0) + item.count)
    return map
  }, new Map())
  const days = buildYearDays(currentYear).map((day) => {
    const count = counts.get(day.date) ?? 0
    return { ...day, count, level: activityLevel(count) }
  })
  const activeDates = new Set(activity.map((item) => item.date))

  return {
    activeDays: activeDates.size,
    currentStreak: latestActiveStreak(activeDates),
    days,
    maxStreak: maxStreak(activeDates),
    monthLabels: buildMonthLabels(currentYear),
    total: activity.reduce((sum, item) => sum + item.count, 0),
  }
}

function filterActivity(activity, filter) {
  if (filter === 'all') return activity
  return activity.filter((item) => item.platform === filter)
}

function filterRecent(recent = [], filter) {
  if (filter === 'all') return recent
  return recent.filter((item) => item.platform === filter)
}

function buildYearDays(year) {
  const start = new Date(Date.UTC(year, 0, 1))
  const startOffset = (start.getUTCDay() + 6) % 7
  const first = new Date(start)
  first.setUTCDate(first.getUTCDate() - startOffset)
  const end = new Date(Date.UTC(year, 11, 31))
  const endOffset = 6 - ((end.getUTCDay() + 6) % 7)
  const last = new Date(end)
  last.setUTCDate(last.getUTCDate() + endOffset)
  const days = []

  for (const date = new Date(first); date <= last; date.setUTCDate(date.getUTCDate() + 1)) {
    const inYear = date.getUTCFullYear() === year
    days.push({
      date: toDateKey(date),
      inYear,
      key: `${toDateKey(date)}-${days.length}`,
    })
  }

  return days
}

function buildMonthLabels(year) {
  return Array.from({ length: 12 }, (_, month) => {
    const date = new Date(Date.UTC(year, month, 1))
    const yearStart = new Date(Date.UTC(year, 0, 1))
    const startOffset = (yearStart.getUTCDay() + 6) % 7
    const dayDiff = Math.floor((date - yearStart) / 86400000) + startOffset
    return {
      column: Math.floor(dayDiff / 7) + 1,
      month: date.toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
    }
  })
}

function activityLevel(count) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function latestActiveStreak(activeDates) {
  const latest = [...activeDates].sort().at(-1)
  if (!latest) return 0

  let streak = 0
  for (const date = new Date(`${latest}T00:00:00Z`); ; date.setUTCDate(date.getUTCDate() - 1)) {
    if (!activeDates.has(toDateKey(date))) break
    streak += 1
  }
  return streak
}

function maxStreak(activeDates) {
  let best = 0
  let current = 0
  for (const day of buildYearDays(currentYear)) {
    if (day.inYear && activeDates.has(day.date)) {
      current += 1
      best = Math.max(best, current)
    } else if (day.inYear) {
      current = 0
    }
  }
  return best
}

function activityItem(platform, epochSeconds) {
  return {
    count: 1,
    date: localDateKey(new Date(epochSeconds * 1000)),
    platform,
  }
}

function isCurrentYear(epochSeconds) {
  return Number(localDateKey(new Date(epochSeconds * 1000)).slice(0, 4)) === currentYear
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function localDateKey(date) {
  const parts = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    timeZone: activityTimeZone,
    year: 'numeric',
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function problemKey(problem = {}) {
  return `${problem.contestId ?? 'gym'}-${problem.index}-${problem.name}`
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatRelativeDate(date) {
  const value = date instanceof Date ? date : new Date(date)
  const diffMs = Date.now() - value.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return value.toLocaleDateString([], { day: '2-digit', month: 'short' })
}

function codeforcesProblemHref(problem = {}) {
  if (!problem.contestId) return `https://codeforces.com/profile/${accounts.codeforces}`
  return `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
}

function formatContest(problem = {}) {
  if (!problem.contestId) return 'practice'
  return `${problem.contestId}${problem.index ?? ''}`
}

function filterProjects(value) {
  const query = value.trim().toLowerCase()
  if (!query) return projects
  return projects.filter((project) => (
    [
      project.title,
      project.kind,
      project.signal,
      project.impact,
      ...project.stack,
      ...project.files.flat(),
    ].join(' ').toLowerCase().includes(query)
  ))
}

function buildSearchHits(value) {
  const projectHits = filterProjects(value).map((project) => ({
    id: project.id,
    label: project.title,
    type: project.kind,
  }))

  const platformHits = profile.links
    .filter((link) => !value || `${link.id} ${link.label}`.toLowerCase().includes(value.toLowerCase()))
    .map((link) => ({ id: link.id, label: link.label, type: 'profile' }))

  const skillHits = skills
    .filter((skill) => !value || `${skill.name} ${skill.note}`.toLowerCase().includes(value.toLowerCase()))
    .map((skill) => ({ id: 'skills', label: skill.name, type: 'skill' }))

  return [...platformHits, ...projectHits, ...skillHits]
}

function findTarget(value) {
  const normalized = value.trim().toLowerCase()
  const project = projects.find((item) => (
    item.id === normalized || item.title.toLowerCase().includes(normalized)
  ))
  if (project) return { type: 'project', project }

  const link = profile.links.find((item) => item.id === normalized || item.label.toLowerCase() === normalized)
  if (link) return { type: 'link', ...link }

  if (sections.includes(normalized)) return { type: 'section', id: normalized, label: normalized }
  return null
}

const asciiMark = String.raw`    /\_/\
   /  _  \
  /__/ \__\
  \  \_/  /
   \_____/
 portfolio`

export default App
