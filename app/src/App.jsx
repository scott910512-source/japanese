import { useState } from 'react'
import Home from './screens/Home.jsx'
import Import from './screens/Import.jsx'
import Review from './screens/Review.jsx'
import History from './screens/History.jsx'
import Prompt from './screens/Prompt.jsx'
import { ensureDailyBasics, load, save } from './storage.js'

const TABS = [
  { id: 'home', icon: '🏠', label: '홈' },
  { id: 'import', icon: '📥', label: '임포트' },
  { id: 'review', icon: '🔁', label: '복습' },
  { id: 'history', icon: '📈', label: '기록' },
  { id: 'prompt', icon: '✨', label: '프롬프트' },
]

export default function App() {
  const [tab, setTab] = useState('home')
  const [data, setDataRaw] = useState(() => {
    // 앱을 열 때마다 오늘 몫의 기본 단어·동사를 은행에서 배정
    const d = ensureDailyBasics(load())
    save(d)
    return d
  })

  const setData = (next) => {
    save(next)
    setDataRaw(next)
  }

  const props = { data, setData, go: setTab }

  return (
    <div className="app">
      <main className="content">
        {tab === 'home' && <Home {...props} />}
        {tab === 'import' && <Import {...props} />}
        {tab === 'review' && <Review {...props} />}
        {tab === 'history' && <History {...props} />}
        {tab === 'prompt' && <Prompt {...props} />}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
