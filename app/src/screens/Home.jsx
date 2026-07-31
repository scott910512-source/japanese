import { isDue, newSrs } from '../srs.js'
import { latestSession, streak } from '../storage.js'

export const APP_VERSION = 'v0.7.0'

export default function Home({ data, go }) {
  const due =
    data.words.filter((w) => isDue(w.srs)).length +
    data.grammar.filter((g) => isDue(g.srs || newSrs())).length +
    data.kanji.filter((k) => isDue(k.srs || newSrs())).length +
    data.naturalPairs.filter((p) => isDue(p.srs || newSrs())).length +
    (data.basicWords || []).filter((w) => isDue(w.srs)).length +
    (data.basicVerbs || []).filter((v) => isDue(v.srs)).length
  const last = latestSession(data)
  const days = streak(data)

  return (
    <div className="screen">
      <header className="hero">
        <h1>니혼고 루프</h1>
        <p className="sub">日本語ループ — AI 학습 노트 복습 루프</p>
      </header>

      <div className="stat-row">
        <div className="stat card">
          <span className="stat-num">{due}</span>
          <span className="stat-label">오늘 복습 카드</span>
        </div>
        <div className="stat card">
          <span className="stat-num">{days}🔥</span>
          <span className="stat-label">연속 학습일</span>
        </div>
        <div className="stat card">
          <span className="stat-num">{data.words.length}</span>
          <span className="stat-label">누적 단어</span>
        </div>
      </div>

      {last && (
        <div className="card level-card">
          <div className="card-title">현재 예상 수준</div>
          <div className="level">{last.level || '—'}</div>
        </div>
      )}

      <button className="btn-primary" onClick={() => go('review')} disabled={due === 0}>
        {due > 0 ? `복습 시작 (${due}개 항목)` : '오늘 복습 완료! 🎉'}
      </button>
      {data.sessions.length === 0 && (
        <button className="btn-secondary" onClick={() => go('import')}>
          첫 학습 노트 가져오기 →
        </button>
      )}

      <h2 className="section-title">최근 학습 세션</h2>
      {data.sessions.length === 0 ? (
        <p className="empty">아직 세션이 없어요. 임포트 탭에서 학습 노트를 붙여넣어 보세요.</p>
      ) : (
        data.sessions.slice(0, 5).map((s) => (
          <div className="card session-card" key={s.id}>
            <div className="session-date">{s.date || s.id}</div>
            <div className="session-topic">{s.topic || '(주제 없음)'}</div>
            <div className="session-counts">
              단어 {s.counts?.words ?? 0} · 문법 {s.counts?.grammar ?? 0} · 한자{' '}
              {s.counts?.kanji ?? 0} · 회화 {s.counts?.dialogues ?? 0}
            </div>
          </div>
        ))
      )}
      <div className="version">니혼고 루프 {APP_VERSION}</div>
    </div>
  )
}
