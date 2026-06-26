import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const panes = ['shell', 'files', 'stats']
const commandNames = [
  'help',
  'about',
  'projects',
  'skills',
  'contact',
  'clear',
  'theme',
  'ls',
  'cd',
  'cat',
  'pwd',
  'whoami',
  'fastfetch',
  'stats',
  'btop',
  'yazi',
  'files',
  'history',
  'open',
]
const openTargets = ['github', 'cf', 'lc', 'linkedin', 'neovim', 'linux', 'react', 'resume']

const profile = {
  user: 'cage',
  host: 'archbox',
  role: 'terminal-first developer',
  wm: 'Hyprland',
  shell: 'zsh',
  terminal: "xterm-kitty",
  editor: 'nvim',
  uptime: '21 years',
  palette: ['#f59e0b', '#f8fafc', '#171717', '#737373'],
}

const commandOutput = {
  help: [
    'movement',
    '  alt+1/2/3        focus shell/files/stats',
    '  alt+arrows       move between windows',
    '',
    'commands',
    '  help             show this screen',
    '  about            short intro',
    '  projects         project list',
    '  skills           stack list',
    '  contact          contact links',
    '  clear            clear terminal output',
    '  theme            toggle amber/paper',
    '  theme amber      switch to amber theme',
    '  theme paper      switch to paper theme',
    '  ls               list files in current yazi folder',
    '  cd <folder>      jump yazi folder: ~, projects, notes',
    '  cat <file>       print a file from yazi',
    '  pwd              print current path',
    '  whoami           print profile identity',
    '  fastfetch        print system/profile summary',
    '  stats | btop     print stat summary and focus btop',
    '  yazi | files     focus file manager',
    '  history          print command history',
    '  open <target>    open github/cf/lc/linkedin/neovim/linux/react',
    '',
    'examples',
    '  cd projects',
    '  cat portfolio.term',
    '  open github',
    '  theme paper',
    '',
    'inside focused panes',
    '  files: arrows or h/j/k/l browse folders and files',
    '  stats: up/down select, right expand, left collapse, enter open',
  ],
  about: [
    'I like compact interfaces, Linux desktops, fast tooling, and code that feels direct.',
    'This portfolio is a browser page pretending to be a small tiling desktop.',
  ],
  projects: [
    'hypr.portfolio       keyboard-first React portfolio',
    'dotfiles             Hyprland, Waybar, tmux, nvim workflow',
    'cp-notebook          algorithms and problem solving notes',
  ],
  skills: ['React', 'Tailwind CSS', 'Linux', 'C++', 'JavaScript', 'Neovim', 'Git'],
  contact: [
    'github    https://github.com/',
    'leetcode  https://leetcode.com/',
    'cf        https://codeforces.com/',
    'mail      hello@example.com',
  ],
  fastfetch: [
    `${profile.user}@${profile.host}`,
    `role    ${profile.role}`,
    `wm      ${profile.wm}`,
    `shell   ${profile.shell}`,
    `editor  ${profile.editor}`,
    `uptime  ${profile.uptime}`,
  ],
  whoami: [`${profile.user} - ${profile.role}`],
  pwd: ['~/portfolio'],
}

const tree = [
  {
    name: '~',
    files: [
      {
        name: 'readme.md',
        type: 'md',
        body: [
          '# cage',
          'Developer profile in a terminal desktop.',
          'Use Alt+2 for files and Alt+3 for stats. Plain arrows control the active window.',
        ],
      },
      {
        name: 'now.txt',
        type: 'txt',
        body: [
          'Currently building a portfolio that looks less like a template and more like a daily-driver desktop.',
          'The important part is the interaction model: no mouse required, no browser input trap.',
        ],
      },
    ],
  },
  {
    name: 'projects',
    files: [
      {
        name: 'portfolio.term',
        type: 'term',
        body: [
          'A Hyprland-inspired portfolio with real keyboard routing.',
          'Shell is fake but stateful. File manager and stats pane are fully navigable.',
        ],
      },
      {
        name: 'dotfiles.rice',
        type: 'rice',
        body: [
          'Hyprland + Waybar + tmux + nvim + zsh.',
          'Suckless-inspired: small pieces, readable configs, no unnecessary animation.',
        ],
      },
      {
        name: 'algorithms.cpp',
        type: 'cpp',
        body: [
          'Codeforces and LeetCode progress belongs here.',
          'Replace placeholder ratings with API-backed stats later if you want live data.',
        ],
      },
      {
        name: 'terminal-ui.jsx',
        type: 'jsx',
        body: [
          'Keyboard routing lives in React state instead of browser inputs.',
          'That keeps Alt navigation reliable and lets arrows belong to the active terminal.',
        ],
      },
      {
        name: 'rice-gallery.md',
        type: 'md',
        body: [
          'Visual direction: old amber terminals, paper desktops, thin borders, dense but readable panels.',
          'Next strong move: add screenshots or generated bitmap backdrops that feel personal.',
        ],
      },
    ],
  },
  {
    name: 'notes',
    files: [
      {
        name: 'design.txt',
        type: 'txt',
        body: [
          'Pitch black background, amber window chrome, dense text, small status bars.',
          'Inspired by old Unix themes, terminal file managers, and clean unixporn desktops.',
        ],
      },
      {
        name: 'todo.md',
        type: 'md',
        body: [
          '- replace placeholder links',
          '- add real profile text',
          '- decide whether stats should be static JSON or fetched from APIs',
          '- add a light paper theme variant if needed',
        ],
      },
      {
        name: 'commands.txt',
        type: 'txt',
        body: [
          'help, ls, cd, cat, pwd, whoami, fastfetch, stats, projects, skills, contact, theme, clear, history, open',
          'Examples: cd projects, cat portfolio.term, open github, theme paper',
        ],
      },
    ],
  },
]

const stats = [
  {
    name: 'Codeforces',
    value: 68,
    meta: 'rating: 1159 | solved: 240',
    href: 'https://codeforces.com/',
    lines: ['graphs + dp improving', 'contest rhythm: rebuilding', 'next target: specialist'],
  },
  {
    name: 'LeetCode',
    value: 61,
    meta: 'solved: 310 | streak: 17',
    href: 'https://leetcode.com/',
    lines: ['arrays, trees, binary search', 'systematic revision queue', 'weekly contests tracked'],
  },
  {
    name: 'GitHub',
    value: 76,
    meta: 'repos: 28 | commits: active',
    href: 'https://github.com/',
    lines: ['dotfiles and small tools', 'portfolio experiments', 'clean public project readmes'],
  },
  {
    name: 'LinkedIn',
    value: 42,
    meta: 'profile: draft',
    href: 'https://linkedin.com/',
    lines: ['needs final copy', 'add project screenshots', 'link resume when ready'],
  },
  {
    name: 'Neovim',
    value: 79,
    meta: 'daily driver | lua config',
    href: 'https://neovim.io/',
    lines: ['fast editing workflow', 'tmux-friendly layout', 'plugins kept intentionally small'],
  },
  {
    name: 'Linux',
    value: 84,
    meta: 'arch | hyprland | zsh',
    href: 'https://wiki.archlinux.org/',
    lines: ['desktop workflow as portfolio language', 'shell scripts and dotfiles', 'keyboard-first habits'],
  },
  {
    name: 'React',
    value: 70,
    meta: 'stateful UI | keyboard apps',
    href: 'https://react.dev/',
    lines: ['component-driven interfaces', 'state machines for interactions', 'Tailwind for fast styling'],
  },
  {
    name: 'Resume',
    value: 35,
    meta: 'draft | needs final PDF',
    href: '#',
    lines: ['add PDF later', 'turn projects into concise impact bullets', 'link from shell command once ready'],
  },
]

const paneMap = {
  shell: { left: 'shell', right: 'files', up: 'shell', down: 'shell' },
  files: { left: 'shell', right: 'files', up: 'files', down: 'stats' },
  stats: { left: 'shell', right: 'stats', up: 'files', down: 'stats' },
}

const bootLines = [
  `${profile.user}@${profile.host}`,
  `role    ${profile.role}`,
  `wm      ${profile.wm}`,
  `shell   ${profile.shell}`,
  `editor  ${profile.editor}`,
  '',
  'movement: alt+1/2/3 or alt+arrows',
  'local: files/stats use arrows or h/j/k/l',
  'try: help, ls, cd projects, cat portfolio.term, stats, theme',
]
const shellPrompt = `[${profile.user}@${profile.host} ~]$`

function App() {
  const [focusedPane, setFocusedPane] = useState('shell')
  const [line, setLine] = useState('')
  const [output, setOutput] = useState(bootLines)
  const [completionOptions, setCompletionOptions] = useState([])
  const [completionCycle, setCompletionCycle] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(null)
  const [folderIndex, setFolderIndex] = useState(0)
  const [fileIndex, setFileIndex] = useState(0)
  const [fileColumn, setFileColumn] = useState('folders')
  const [statIndex, setStatIndex] = useState(0)
  const [expandedStat, setExpandedStat] = useState(0)
  const [theme, setTheme] = useState('amber')
  const meterListRef = useRef(null)
  const inputRef = useRef(null)

  const activeFolder = tree[folderIndex]
  const activeFile = activeFolder.files[Math.min(fileIndex, activeFolder.files.length - 1)]
  const activeStat = stats[statIndex]
  const completeLine = useCallback((currentLine) => {
    const cycleMatch = completionCycle?.options.some(
      (option) => formatCompletion(completionCycle, option) === currentLine,
    )
    const baseLine = cycleMatch ? completionCycle.baseLine : currentLine
    const normalizedLine = baseLine.trimStart()
    const hasLeadingSpace = baseLine.length !== normalizedLine.length
    const parts = normalizedLine.split(/\s+/)
    const command = parts[0] ?? ''
    const partial = parts.slice(1).join(' ')

    if (!normalizedLine) {
      setCompletionOptions([])
      setCompletionCycle(null)
      return baseLine
    }

    if (parts.length === 1) {
      const matches = commandNames.filter((item) => item.startsWith(command.toLowerCase()))

      if (matches.length === 1) {
        setCompletionOptions([])
        setCompletionCycle(null)
        return `${hasLeadingSpace ? ' ' : ''}${matches[0]} `
      }
      if (matches.length > 1) {
        const nextIndex = cycleMatch ? (completionCycle.index + 1) % matches.length : 0
        const nextCycle = {
          baseLine,
          command: '',
          hasLeadingSpace,
          index: nextIndex,
          options: matches,
          trailingSpace: true,
        }
        setCompletionOptions(matches)
        setCompletionCycle(nextCycle)
        return formatCompletion(nextCycle, matches[nextIndex])
      }
      setCompletionOptions([])
      setCompletionCycle(null)
      return baseLine
    }

    const candidates = getCompletionCandidates(command, activeFolder)
    const matches = candidates.filter((item) => item.toLowerCase().startsWith(partial.toLowerCase()))

    if (matches.length === 1) {
      setCompletionOptions([])
      setCompletionCycle(null)
      return `${command} ${matches[0]}`
    }
    if (matches.length > 1) {
      const nextIndex = cycleMatch ? (completionCycle.index + 1) % matches.length : 0
      const nextCycle = {
        baseLine,
        command,
        hasLeadingSpace: false,
        index: nextIndex,
        options: matches,
        trailingSpace: false,
      }
      setCompletionOptions(matches)
      setCompletionCycle(nextCycle)
      return formatCompletion(nextCycle, matches[nextIndex])
    }
    setCompletionOptions([])
    setCompletionCycle(null)
    return baseLine
  }, [activeFolder, completionCycle])

  const runCommand = useCallback((rawCommand) => {
    const input = rawCommand.trim()
    if (!input) return

    const [cmd, ...args] = input.toLowerCase().split(/\s+/)
    const arg = args.join(' ')
    const submitted = `${shellPrompt} ${input}`
    setCompletionOptions([])
    setCompletionCycle(null)
    setHistory((items) => [...items, input])
    setHistoryIndex(null)

    if (cmd === 'clear') {
      setOutput([])
      return
    }

    if (cmd === 'theme') {
      if (arg === 'amber' || arg === 'paper') {
        setTheme(arg)
        setOutput((items) => [...items, submitted, `theme set to ${arg}`])
        return
      }

      setTheme((current) => {
        const next = current === 'amber' ? 'paper' : 'amber'
        setOutput((items) => [...items, submitted, `theme set to ${next}`])
        return next
      })
      return
    }

    if (cmd === 'focus' && panes.includes(arg)) {
      setFocusedPane(arg)
      setOutput((items) => [...items, submitted, `focused ${arg}`])
      return
    }

    if (cmd === 'open') {
      const target = findStat(arg)
      if (target) {
        if (target.href !== '#') window.open(target.href, '_blank', 'noopener,noreferrer')
        setOutput((items) => [...items, submitted, `opening ${target.name}`])
        return
      }
    }

    if (cmd === 'ls') {
      setOutput((items) => [
        ...items,
        submitted,
        ...activeFolder.files.map((file) => `${file.name.padEnd(18)} ${file.type}`),
      ])
      return
    }

    if (cmd === 'cd') {
      const nextFolder = !arg || arg === '~'
        ? 0
        : tree.findIndex((folder) => folder.name.toLowerCase() === arg || `~/${folder.name}` === arg)
      if (nextFolder >= 0) {
        setFolderIndex(nextFolder)
        setFileIndex(0)
        setFileColumn('files')
        setFocusedPane('files')
        setOutput((items) => [...items, submitted, `~/portfolio/${tree[nextFolder].name}`])
        return
      }

      setOutput((items) => [...items, submitted, `cd: no such folder: ${arg || '<empty>'}`])
      return
    }

    if (cmd === 'cat') {
      const file = tree.flatMap((folder) => folder.files).find((item) => item.name.toLowerCase() === arg)
      if (file) {
        setOutput((items) => [...items, submitted, ...file.body])
        return
      }

      setOutput((items) => [...items, submitted, `cat: no such file: ${arg || '<empty>'}`])
      return
    }

    if (cmd === 'stats' || cmd === 'btop') {
      setFocusedPane('stats')
      setOutput((items) => [
        ...items,
        submitted,
        ...stats.map((item) => `${item.name.padEnd(12)} ${String(item.value).padStart(3)}%  ${item.meta}`),
      ])
      return
    }

    if (cmd === 'yazi' || cmd === 'files') {
      setFocusedPane('files')
      setOutput((items) => [...items, submitted, 'focused files'])
      return
    }

    if (cmd === 'history') {
      setOutput((items) => [...items, submitted, ...history.map((item, index) => `${index + 1}  ${item}`)])
      return
    }

    setOutput((items) => [
      ...items,
      submitted,
      ...(commandOutput[cmd] ?? [`command not found: ${cmd}`, 'try `help`']),
    ])
  }, [activeFolder.files, history])

  const moveFiles = useCallback((direction) => {
    if (direction === 'left') {
      setFileColumn('folders')
      return
    }

    if (direction === 'right') {
      setFileColumn('files')
      return
    }

    if (fileColumn === 'folders') {
      setFolderIndex((current) => {
        const next = clamp(current + (direction === 'down' ? 1 : -1), 0, tree.length - 1)
        setFileIndex(0)
        return next
      })
      return
    }

    setFileIndex((current) => (
      clamp(current + (direction === 'down' ? 1 : -1), 0, activeFolder.files.length - 1)
    ))
  }, [activeFolder.files.length, fileColumn])

  const moveStats = useCallback((direction) => {
    if (direction === 'up' || direction === 'down') {
      setStatIndex((current) => {
        const next = clamp(current + (direction === 'down' ? 1 : -1), 0, stats.length - 1)
        setExpandedStat((expanded) => (expanded === null ? null : next))
        return next
      })
      return
    }

    if (direction === 'right') setExpandedStat(statIndex)
    if (direction === 'left') setExpandedStat(null)
  }, [statIndex])

  const handleShellKey = useCallback((event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      setLine((value) => completeLine(value))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(line)
      setLine('')
      setCompletionOptions([])
      setCompletionCycle(null)
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      setCompletionOptions([])
      setCompletionCycle(null)
      setLine((value) => value.slice(0, -1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!history.length) return
      setCompletionOptions([])
      setCompletionCycle(null)
      setHistoryIndex((current) => {
        const next = current === null ? history.length - 1 : clamp(current - 1, 0, history.length - 1)
        setLine(history[next])
        return next
      })
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex === null) return
      setCompletionOptions([])
      setCompletionCycle(null)
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(null)
        setLine('')
        return
      }
      setHistoryIndex(next)
      setLine(history[next])
      return
    }

    if (event.key.length === 1 && !event.altKey && !event.metaKey && !event.ctrlKey) {
      event.preventDefault()
      setCompletionOptions([])
      setCompletionCycle(null)
      setLine((value) => `${value}${event.key}`)
    }
  }, [completeLine, history, historyIndex, line, runCommand])

  const handleInputKeyDown = useCallback((event) => {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      handleShellKey(event)
      return
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      setCompletionOptions([])
      setCompletionCycle(null)
    }
  }, [handleShellKey])

  const handleInputChange = useCallback((event) => {
    setCompletionOptions([])
    setCompletionCycle(null)
    setLine(event.target.value)
  }, [])

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const resetScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    resetScroll()
    requestAnimationFrame(resetScroll)
    const timeout = window.setTimeout(resetScroll, 120)
    const lateTimeout = window.setTimeout(resetScroll, 450)
    window.addEventListener('pageshow', resetScroll)

    return () => {
      window.clearTimeout(timeout)
      window.clearTimeout(lateTimeout)
      window.removeEventListener('pageshow', resetScroll)
    }
  }, [])

  useEffect(() => {
    const selectedMeter = meterListRef.current?.querySelector('.meter.selected')
    scrollChildIntoContainer(meterListRef.current, selectedMeter)
  }, [statIndex])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return

      const arrowDirection = getArrowDirection(event.key)
      const localDirection = getLocalDirection(event.key)
      const isPromptInput = event.target === inputRef.current

      if (event.key === 'Tab') {
        event.preventDefault()
        if (focusedPane === 'shell') handleShellKey(event)
        return
      }

      if (event.altKey && event.key >= '1' && event.key <= '3') {
        event.preventDefault()
        setFocusedPane(panes[Number(event.key) - 1])
        return
      }

      if (event.altKey && arrowDirection) {
        event.preventDefault()
        setFocusedPane((pane) => paneMap[pane][arrowDirection])
        return
      }

      if (event.altKey && event.key.toLowerCase() === 'o' && focusedPane === 'stats') {
        event.preventDefault()
        if (activeStat.href !== '#') window.open(activeStat.href, '_blank', 'noopener,noreferrer')
        return
      }

      if (isPromptInput) return

      if (focusedPane === 'shell') {
        handleShellKey(event)
        return
      }

      if (focusedPane === 'files' && localDirection) {
        event.preventDefault()
        moveFiles(localDirection)
        return
      }

      if (focusedPane === 'stats' && localDirection) {
        event.preventDefault()
        moveStats(localDirection)
        return
      }

      if (focusedPane === 'stats' && event.key === 'Enter') {
        event.preventDefault()
        if (activeStat.href !== '#') window.open(activeStat.href, '_blank', 'noopener,noreferrer')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeStat.href, focusedPane, handleShellKey, moveFiles, moveStats])

  const desktopClass = theme === 'amber' ? 'theme-amber' : 'theme-paper'

  return (
    <main className={`desktop ${desktopClass}`}>
      <MatrixRain />
      <TopBar focusedPane={focusedPane} theme={theme} onFocus={setFocusedPane} />

      <section className="workspace" aria-label="Terminal portfolio workspace">
        <TerminalWindow
          pane="shell"
          title="fastfetch.sh"
          focusedPane={focusedPane}
          className="shell-window"
          onFocus={setFocusedPane}
        >
          <Fastfetch />
          <div className="terminal-divider" />
          <div className="hint-grid">
            <span>alt+1 shell</span>
            <span>alt+2 files</span>
            <span>alt+3 stats</span>
            <span>alt+arrows move</span>
            <span>theme</span>
            <span>help</span>
          </div>
          <ShellOutput
            lines={output}
            currentLine={line}
            completionOptions={completionOptions}
            completionIndex={completionCycle?.index ?? null}
            inputRef={inputRef}
            onInputChange={handleInputChange}
            onInputKeyDown={handleInputKeyDown}
            onInputFocus={() => setFocusedPane('shell')}
          />
        </TerminalWindow>

        <TerminalWindow
          pane="files"
          title="yazi ~/portfolio"
          focusedPane={focusedPane}
          className="files-window"
          onFocus={setFocusedPane}
        >
          <div className="file-manager">
            <FileColumn
              label="places"
              active={focusedPane === 'files' && fileColumn === 'folders'}
              items={tree.map((folder) => folder.name)}
              selected={folderIndex}
              onSelect={(index) => {
                setFolderIndex(index)
                setFileIndex(0)
                setFileColumn('folders')
              }}
            />
            <FileColumn
              label={activeFolder.name}
              active={focusedPane === 'files' && fileColumn === 'files'}
              items={activeFolder.files.map((file) => `${file.name}  ${file.type}`)}
              selected={fileIndex}
              onSelect={(index) => {
                setFileIndex(index)
                setFileColumn('files')
              }}
            />
            <article className="preview">
              <header>{activeFile.name}</header>
              <div>
                {activeFile.body.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          </div>
        </TerminalWindow>

        <TerminalWindow
          pane="stats"
          title="btop --profile"
          focusedPane={focusedPane}
          className="stats-window"
          onFocus={setFocusedPane}
        >
          <div className="stats-layout">
            <section className="meter-list" ref={meterListRef}>
              {stats.map((item, index) => (
                <div
                  key={item.name}
                  className={`meter ${index === statIndex ? 'selected' : ''}`}
                  onClick={() => {
                    setStatIndex(index)
                    setExpandedStat(index)
                  }}
                >
                  <div className="meter-head">
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="meter-track">
                    <span style={{ width: `${item.value}%` }} />
                  </div>
                  <small>{item.meta}</small>
                </div>
              ))}
            </section>
            <section className="stat-detail">
              {expandedStat === null ? (
                <p>right arrow expands the selected row</p>
              ) : (
                <div key={expandedStat}>
                  <div className="big-number">{stats[expandedStat].value}</div>
                  <h2>{stats[expandedStat].name}</h2>
                  <p className="stat-meta">{stats[expandedStat].meta}</p>
                  {stats[expandedStat].lines.map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                  <a href={stats[expandedStat].href} target="_blank" rel="noreferrer" tabIndex={-1}>
                    open with enter / alt+o
                  </a>
                </div>
              )}
            </section>
          </div>
        </TerminalWindow>
      </section>

      <footer className="status-bar">
        <span>HYPRLAND</span>
        <span>ALT SWITCHES WINDOWS</span>
        <span>ARROWS NAVIGATE ACTIVE TERMINAL</span>
      </footer>
    </main>
  )
}

function TopBar({ focusedPane, theme, onFocus }) {
  return (
    <header className="top-bar">
      <nav>
        {panes.map((pane, index) => (
          <button
            key={pane}
            type="button"
            className={focusedPane === pane ? 'active' : ''}
            aria-label={`workspace ${index + 1} ${pane}`}
            onClick={() => onFocus(pane)}
            tabIndex={-1}
          >
            {index + 1}
          </button>
        ))}
      </nav>
      <div className="song">♪ Lamp - quiet terminal hour</div>
      <div className="sys">
        <span>{theme}</span>
        <span>68%</span>
        <span>23:00</span>
      </div>
    </header>
  )
}

function TerminalWindow({ children, title, pane, focusedPane, className, onFocus }) {
  const active = pane === focusedPane

  return (
    <section
      className={`terminal-window ${active ? 'focused' : ''} ${className}`}
      onClick={() => onFocus(pane)}
    >
      <header className="window-title">
        <span>{title}</span>
        <div>
          <i />
          <i />
          <i />
        </div>
      </header>
      <div className="window-body">{children}</div>
    </section>
  )
}

function Fastfetch() {
  return (
    <section className="fastfetch">
      <pre aria-hidden="true">
{`⣿⣿⣿⣿⡿⢟⣛⣫⡍⡉⢩⣭⣛⡻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⠟⢥⣾⡿⣿⣿⡻⡄⠀⣿⣿⣿⢦⠈⡛⢿⣿⣿⣿⣿⣿⣿
⣿⢣⡎⠸⣿⠘⡜⢿⣿⢿⡄⢸⣿⢻⡏⠀⠈⢳⠝⢿⣿⣿⣿⣿
⣇⢸⢱⢀⠹⣆⠈⢆⠻⣦⠂⠀⡇⠘⠃⠀⠀⠀⠉⠃⠹⣿⣿⣿
⠈⢸⠈⢸⡆⡌⢂⠀⢂⠈⢣⠀⠁⡇⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿
⠀⢸⢀⠀⣿⣜⣆⠁⠀⠑⣀⠡⠀⡇⠀⠤⡀⠀⢠⣐⣶⣦⣤⣬
⠀⠸⠈⣦⢸⣿⣾⣿⣶⠂⠈⠁⡀⡇⠀⣿⡇⠀⡀⣿⣿⣿⣿⣿
⢠⡀⠀⠈⠁⠹⣿⣿⣧⣧⣀⣤⡇⠃⠀⡩⠃⠀⣧⢹⣿⣿⣿⣿
⣼⡇⠀⠀⢧⣴⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⢹⣸⣿⣿⣿⣿
⣿⡇⢀⠀⠸⣿⣷⣿⣛⣿⣿⡿⠀⠀⠀⠀⠀⠀⠘⡇⣿⣿⣿⣿
⣿⣷⢸⠀⠀⠈⠛⠿⣿⠿⣫⣴⠀⠀⠀⠀⠀⢠⠀⢡⢻⣿⣿⣿
⣿⣿⡀⡇⠀⠀⠀⠀⠀⢸⣿⡟⠀⢰⡀⠀⠀⢸⡇⠸⣸⣿⣿⣿
⣿⣿⡇⢰⠀⠀⠀⣠⣴⠿⣟⠁⠀⣞⣿⡶⡠⣈⡃⠀⠀⣿⣿⣿
⣿⣿⣷⠈⢰⢎⣾⣿⣵⣿⣿⠀⠰⠿⢟⡜⣼⣿⣿⡆⠀⢻⣿⣿
⣿⣿⣧⡃⠀⣿⡟⠛⠿⣶⠆⢀⣿⣾⣿⢇⣿⣿⣿⣷⠀⢸⣿⣿`}
      </pre>
      <div>
        <Info label="user" value={`${profile.user}@${profile.host}`} />
        <Info label="role" value={profile.role} />
        <Info label="wm" value={profile.wm} />
        <Info label="shell" value={profile.shell} />
        <Info label="terminal" value={profile.terminal} />
        <Info label="editor" value={profile.editor} />
        <Info label="uptime" value={profile.uptime} />
        <div className="swatches">
          {profile.palette.map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Info({ label, value }) {
  return (
    <p className="info-row">
      <span>{label}</span>
      <b>{value}</b>
    </p>
  )
}

function ShellOutput({
  lines,
  currentLine,
  completionOptions,
  completionIndex,
  inputRef,
  onInputChange,
  onInputFocus,
  onInputKeyDown,
}) {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines, currentLine, completionOptions])

  return (
    <div className="shell-output" onClick={() => inputRef.current?.focus()} ref={outputRef}>
      {lines.map((item, index) => (
        item === ''
          ? <br key={`${item}-${index}`} />
          : <p className={item.startsWith(shellPrompt) ? 'submitted-line' : ''} key={`${item}-${index}`}>{item}</p>
      ))}
      <div className="prompt-line">
        <span className="prompt">{shellPrompt}</span>
        <input
          ref={inputRef}
          aria-label="Terminal command"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          className="terminal-input"
          inputMode="text"
          onChange={onInputChange}
          onFocus={onInputFocus}
          onKeyDown={onInputKeyDown}
          spellCheck="false"
          value={currentLine}
        />
      </div>
      {completionOptions.length > 0 && (
        <div className="completion-menu">
          {completionOptions.map((item, index) => (
            <span className={index === completionIndex ? 'active' : ''} key={item}>{item}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function FileColumn({ label, active, items, selected, onSelect }) {
  const columnRef = useRef(null)

  useEffect(() => {
    const selectedItem = columnRef.current?.querySelector('.selected')
    scrollChildIntoContainer(columnRef.current, selectedItem)
  }, [selected])

  return (
    <section className={`file-column ${active ? 'active' : ''}`} ref={columnRef}>
      <header>{label}</header>
      {items.map((item, index) => (
        <div
          key={item}
          className={index === selected ? 'selected' : ''}
          onClick={() => onSelect(index)}
        >
          <span>{index === selected ? '>' : ' '}</span>
          {item}
        </div>
      ))}
    </section>
  )
}

function MatrixRain() {
  const columns = Array.from({ length: 64 }, (_, index) => {
    const delay = `${-(index % 11) * 0.8}s`
    const duration = `${8 + (index % 7)}s`
    const left = `${(index / 64) * 100}%`
    const text = '01x#{}[]<>$~/'.repeat(4)

    return (
      <span key={index} style={{ left, animationDelay: delay, animationDuration: duration }}>
        {text}
      </span>
    )
  })

  return <div className="matrix-rain" aria-hidden="true">{columns}</div>
}

function getArrowDirection(key) {
  const map = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  }

  return map[key]
}

function getLocalDirection(key) {
  const map = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    h: 'left',
    l: 'right',
    k: 'up',
    j: 'down',
  }

  return map[key] ?? map[key.toLowerCase()]
}

function findStat(query) {
  const aliases = {
    cf: 'codeforces',
    codeforces: 'codeforces',
    lc: 'leetcode',
    leetcode: 'leetcode',
    gh: 'github',
    github: 'github',
    li: 'linkedin',
    linkedin: 'linkedin',
    nvim: 'neovim',
    neovim: 'neovim',
    linux: 'linux',
    react: 'react',
    resume: 'resume',
  }

  const normalized = aliases[query] ?? query
  return stats.find((item) => item.name.toLowerCase() === normalized)
}

function getCompletionCandidates(command, activeFolder) {
  if (command === 'cd') return tree.map((folder) => folder.name)
  if (command === 'cat') return tree.flatMap((folder) => folder.files.map((file) => file.name))
  if (command === 'open') return openTargets
  if (command === 'theme') return ['amber', 'paper']
  if (command === 'focus') return panes
  if (command === 'ls') return activeFolder.files.map((file) => file.name)

  return commandNames
}

function formatCompletion(cycle, option) {
  if (cycle.command) return `${cycle.command} ${option}`
  return `${cycle.hasLeadingSpace ? ' ' : ''}${option}${cycle.trailingSpace ? ' ' : ''}`
}

function scrollChildIntoContainer(container, child) {
  if (!container || !child) return

  const containerRect = container.getBoundingClientRect()
  const childRect = child.getBoundingClientRect()

  if (childRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - childRect.top
  } else if (childRect.bottom > containerRect.bottom) {
    container.scrollTop += childRect.bottom - containerRect.bottom
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default App
