import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import resumeUrl from '../resume.pdf?url'

const activityPlatforms = [
  { id: 'all', label: 'All platforms' },
  { id: 'codeforces', label: 'Codeforces' },
  { id: 'atcoder', label: 'AtCoder' },
  { id: 'leetcode', label: 'LeetCode' },
]
const handles = { codeforces: 'd1vyxn5h', atcoder: 'qvark', leetcode: 'dvyn5h' }

const work = [
  { name: 'Ranked', description: 'Practice Codeforces rounds, create custom contests, review submissions, and track a virtual-contest rating estimate.', stack: 'Codeforces · Virtual contests', href: 'https://rankedcf.vercel.app/', source: 'https://github.com/L0calised/ranked' },
  { name: 'Linux setup', description: 'My Arch Linux desktop configuration, built around Hyprland.', stack: 'Arch Linux · Hyprland', href: 'https://github.com/L0calised' },
  { name: 'Algorithms', description: 'Solutions and practice in data structures and problem solving.', stack: 'C++ · Codeforces', href: 'https://codeforces.com/profile/d1vyxn5h' },
  { name: 'Web development', description: 'Interfaces and small utilities built with React and JavaScript.', stack: 'React · JavaScript', href: 'https://github.com/L0calised' },
]

const profiles = [
  ['GitHub', '@L0calised', 'https://github.com/L0calised'],
  ['Codeforces', '@d1vyxn5h', 'https://codeforces.com/profile/d1vyxn5h'],
  ['AtCoder', '@qvark', 'https://atcoder.jp/users/qvark'],
  ['LeetCode', '@dvyn5h', 'https://leetcode.com/u/dvyn5h/'],
  ['LinkedIn', 'divyansh-sharma', 'https://linkedin.com/in/divyansh-sharma-15a530414'],
  ['Email', 'localisedchange@gmail.com', 'mailto:localisedchange@gmail.com'],
]

function App() {
  const [activity, setActivity] = useState([])
  const [activityStatus, setActivityStatus] = useState('loading')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [availableSources, setAvailableSources] = useState([])
  const [today, setToday] = useState(() => new Date())
  const [easterEggKey, setEasterEggKey] = useState(0)
  const eggTimer = useRef(null)

  useEffect(() => {
    let typedKeys = ''
    const onKeyDown = (event) => {
      if (!/^\d$/.test(event.key)) {
        typedKeys = ''
        return
      }

      typedKeys = `${typedKeys}${event.key}`.slice(-2)
      if (typedKeys === '67') {
        setEasterEggKey((key) => key + 1)
        window.clearTimeout(eggTimer.current)
        eggTimer.current = window.setTimeout(() => setEasterEggKey(0), 1500)
        typedKeys = ''
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(eggTimer.current)
    }
  }, [])

  const loadActivity = async () => {
    setActivityStatus('loading')
    const results = await Promise.allSettled([fetchCodeforcesActivity(), fetchAtCoderActivity(), fetchLeetCodeActivity()])
    const available = results.filter((result) => result.status === 'fulfilled')
    setAvailableSources(results.flatMap((result, index) => result.status === 'fulfilled' ? [activityPlatforms[index + 1].id] : []))
    const now = new Date()
    const startKey = dateKey(rollingStart(now))
    const endKey = dateKey(now)
    setActivity(available.flatMap((result) => result.value).filter((item) => item.date >= startKey && item.date <= endKey))
    setActivityStatus(available.length ? 'ready' : 'unavailable')
    setLastUpdated(new Date())
  }

  useEffect(() => {
    loadActivity()
    let timer
    const updateAtMidnight = () => {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 5, 0)
      timer = window.setTimeout(() => {
        setToday(new Date())
        loadActivity()
        updateAtMidnight()
      }, nextMidnight.getTime() - now.getTime())
    }
    updateAtMidnight()
    return () => window.clearTimeout(timer)
  }, [])
  const dateRange = useMemo(() => {
    const end = new Date(today)
    end.setHours(0, 0, 0, 0)
    return { start: dateKey(rollingStart(end)), end: dateKey(end) }
  }, [today])
  const visibleActivity = useMemo(() => selectedPlatform === 'all' ? activity : activity.filter((item) => item.platform === selectedPlatform), [activity, selectedPlatform])
  const dayCounts = useMemo(() => visibleActivity.filter((item) => item.date >= dateRange.start && item.date <= dateRange.end).reduce((counts, item) => {
    counts[item.date] = (counts[item.date] ?? 0) + 1
    return counts
  }, {}), [visibleActivity, dateRange])

  return (
    <main className="portfolio" id="top">
      {easterEggKey > 0 && <span key={easterEggKey} className="meme-easter-egg" aria-hidden="true"><span>6</span><span>7</span></span>}
      <header className="header">
        <a className="nameplate" href="#top">qvark<span>.</span></a>
        <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#profiles">Profiles</a><a href={resumeUrl} download="Divyansh-Sharma-Resume.pdf">Resume ↓</a></nav>
      </header>

      <section className="intro">
        <div className="intro-copy">
          <p className="kicker">SHIMLA <span>·</span> INDIA</p>
          <h1>Hi, I’m<br />qvark.</h1>
          <p className="real-name">Divyansh Sharma</p>
          <p className="intro-text">I build web interfaces and enjoy working close to the tools and systems behind them.</p>
          <a className="intro-link" href="#work">Selected work <span>↓</span></a>
        </div>
        <aside className="intro-details">
          <p><span>INTERESTS</span>Frontend development<br />Linux systems<br />Algorithms</p>
          <p><span>TOOLS</span>React, JavaScript, C++, Git</p>
          <p><span>EDUCATION</span>Third year · 5th sem</p>
        </aside>
      </section>

      <section className="activity" aria-labelledby="activity-title">
        <div className="activity-heading"><div><h2 id="activity-title">Coding activity</h2><p>Daily activity across public coding profiles · Past 12 months</p></div><button className="refresh-activity" onClick={loadActivity} disabled={activityStatus === 'loading'}>{activityStatus === 'loading' ? 'Loading…' : 'Refresh ↻'}</button></div>
        <div className="activity-controls" aria-label="Filter activity by platform">{activityPlatforms.map((platform) => <button key={platform.id} className={selectedPlatform === platform.id ? 'selected' : ''} onClick={() => setSelectedPlatform(platform.id)} aria-pressed={selectedPlatform === platform.id}>{platform.label}</button>)}</div>
        <ActivityHeatmap today={today} dayCounts={dayCounts} />
        <div className="activity-footer" aria-live="polite"><span>{activityStatus === 'loading' ? 'Fetching public profile activity…' : activityStatus === 'unavailable' ? 'Activity could not be loaded right now.' : selectedPlatform !== 'all' && !availableSources.includes(selectedPlatform) ? 'This platform’s activity is unavailable right now.' : `${visibleActivity.length} activity entries · ${Object.keys(dayCounts).length} active days${availableSources.length < 3 ? ' · Some sources unavailable' : ''}`}</span><span>{lastUpdated && activityStatus === 'ready' ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Public profile data'}</span></div>
      </section>

      <section className="work" id="work">
        <div className="section-title"><h2>Focus areas</h2><p>Topics I spend time building and practicing.</p></div>
        <div className="work-list">{work.map((item) => <div className="work-row" key={item.name}><a className="work-name" href={item.href} target="_blank" rel="noreferrer">{item.name}</a><span className="work-description">{item.description}</span><span className="work-stack">{item.stack}{item.source && <> · <a className="work-source" href={item.source} target="_blank" rel="noreferrer">Source ↗</a></>}</span><a className="work-arrow" href={item.href} target="_blank" rel="noreferrer" aria-label={`Open ${item.name}`}>↗</a></div>)}</div>
      </section>

      <section className="about" id="about">
        <h2>About</h2>
        <div className="about-copy"><p>I like making software that is clear and useful. I’m interested in how an interface feels to use, as well as how it works underneath.</p><p>I’m currently in my third year, fifth semester. Most of my learning happens by building small projects, configuring my Linux setup, and practicing algorithms in C++.</p></div>
      </section>

      <footer className="footer" id="profiles">
        <div className="footer-heading"><h2>Profiles</h2><p>Code and contact</p></div>
        <div className="profile-list">{profiles.map(([label, handle, href]) => <a href={href} key={label} target="_blank" rel="noreferrer"><span>{label}</span><small>{handle}</small><b>↗</b></a>)}</div>
        <div className="footer-bottom"><a className="nameplate" href="#top">qvark<span>.</span></a><span>India · {new Date().getFullYear()}</span><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  )
}

function ActivityHeatmap({ today, dayCounts }) {
  const days = useMemo(() => {
    const end = new Date(today)
    end.setHours(0, 0, 0, 0)
    const start = rollingStart(end)
    const lastDay = new Date(end)
    lastDay.setDate(lastDay.getDate() + (6 - ((lastDay.getDay() + 6) % 7)))
    const result = []
    for (const cursor = new Date(start); cursor <= lastDay; cursor.setDate(cursor.getDate() + 1)) {
      const date = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      const inRange = cursor >= start && cursor <= end
      result.push({ date, count: inRange ? dayCounts[date] ?? 0 : 0, inRange })
    }
    return result
  }, [today, dayCounts])
  const months = []
  let previousMonth = -1
  let previousColumn = 0
  days.forEach((day, index) => {
    const date = new Date(`${day.date}T12:00:00`)
    const label = date.toLocaleString('en', { month: 'short' })
    const column = Math.floor(index / 7) + 1
    if (day.inRange && date.getMonth() !== previousMonth && column > previousColumn) {
      months.push({ label, column })
      previousColumn = column
    }
    previousMonth = date.getMonth()
  })

  const weekCount = Math.ceil(days.length / 7)
  return <div className="heatmap-wrap">
    <div className="heatmap-layout">
      <div className="weekday-labels" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
      <div className="heatmap-scroll" tabIndex={0} role="region" aria-label="Scrollable daily coding activity for the past year">
        <div className="heatmap-content" style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}>
          <div className="month-labels" style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}>{months.map((month) => <span key={`${month.label}-${month.column}`} style={{ gridColumn: month.column }}>{month.label}</span>)}</div>
          <div className="heatmap-grid" role="group" aria-label="Daily coding activity for the past year">
            {days.map((day, index) => <span className={`heat-day level-${activityLevel(day.count)}${day.inRange ? '' : ' outside-window'}`} key={`${day.date}-${index}`} title={day.inRange ? `${day.date}: ${day.count} activity ${day.count === 1 ? 'entry' : 'entries'}` : undefined} aria-label={day.inRange ? `${day.date}: ${day.count} activity entries` : undefined} />)}
          </div>
        </div>
      </div>
    </div>
    <div className="heatmap-bottom"><div className="heatmap-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className={`level-${level}`} key={level} />)}<span>More</span></div><span className="scroll-hint">Scroll to see the full year →</span></div>
  </div>
}

function activityLevel(count) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

async function fetchCodeforcesActivity() {
  const response = await fetch(`https://codeforces.com/api/user.status?handle=${handles.codeforces}`)
  if (!response.ok) throw new Error('Codeforces request failed')
  const data = await response.json()
  if (data.status !== 'OK') throw new Error('Codeforces response failed')
  return data.result.filter((item) => item.verdict === 'OK').map((item) => ({ date: localDate(item.creationTimeSeconds * 1000), platform: 'codeforces' }))
}

async function fetchAtCoderActivity() {
  const response = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${handles.atcoder}&from_second=0`)
  if (!response.ok) throw new Error('AtCoder request failed')
  const data = await response.json()
  return data.filter((item) => item.result === 'AC').map((item) => ({ date: localDate(item.epoch_second * 1000), platform: 'atcoder' }))
}

async function fetchLeetCodeActivity() {
  const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${handles.leetcode}`)
  if (!response.ok) throw new Error('LeetCode request failed')
  const data = await response.json()
  if (!data.submissionCalendar) throw new Error('LeetCode activity unavailable')
  return Object.entries(data.submissionCalendar).flatMap(([timestamp, count]) => Array.from({ length: Number(count) }, () => ({ date: localDate(Number(timestamp) * 1000), platform: 'leetcode' })))
}

function localDate(timestamp) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function rollingStart(date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 364)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return start
}

export default App
