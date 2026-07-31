import { wrongRate } from '../srs.js'

const MODE_LABELS = {
  flashcard: '🃏 플래시카드',
  grammar: '✏️ 문법 빈칸',
  kanji: '🈶 한자 퀴즈',
  natural: '🎯 자연스러움',
}

export default function History({ data }) {
  const weak = data.words
    .filter((w) => w.srs.wrong > 0 && wrongRate(w.srs) >= 0.4)
    .sort((a, b) => wrongRate(b.srs) - wrongRate(a.srs))

  return (
    <div className="screen">
      <h1 className="page-title">📈 학습 기록</h1>

      <div className="stat-row">
        <div className="stat card">
          <span className="stat-num">{data.sessions.length}</span>
          <span className="stat-label">총 세션</span>
        </div>
        <div className="stat card">
          <span className="stat-num">{data.words.length}</span>
          <span className="stat-label">누적 단어</span>
        </div>
        <div className="stat card">
          <span className="stat-num">{data.grammar.length}</span>
          <span className="stat-label">누적 문법</span>
        </div>
      </div>

      <h2 className="section-title">취약 항목</h2>
      {weak.length === 0 ? (
        <p className="empty">아직 취약 항목이 없어요. 복습을 진행하면 자동으로 표시됩니다.</p>
      ) : (
        weak.map((w) => (
          <div className="card weak-card" key={w.jp}>
            <span className="jp">{w.jp}</span>
            <span>{w.reading} · {w.ko}</span>
            <span className="weak-rate">오답률 {Math.round(wrongRate(w.srs) * 100)}%</span>
          </div>
        ))
      )}

      <h2 className="section-title">복습 이력</h2>
      {data.reviewLog.length === 0 ? (
        <p className="empty">복습 기록이 없습니다.</p>
      ) : (
        [...data.reviewLog].reverse().map((r, i) => (
          <div className="card log-card" key={i}>
            <span>{r.date}</span>
            <span>{MODE_LABELS[r.mode] || r.mode}</span>
            <span>{r.correct}/{r.total} ({r.total ? Math.round((r.correct / r.total) * 100) : 0}%)</span>
          </div>
        ))
      )}

      <h2 className="section-title">세션 타임라인</h2>
      {data.sessions.map((s) => (
        <div className="card session-card" key={s.id}>
          <div className="session-date">{s.date || s.id}</div>
          <div className="session-topic">{s.topic}</div>
          <div className="session-counts">
            단어 {s.counts?.words ?? 0} · 문법 {s.counts?.grammar ?? 0} · 한자 {s.counts?.kanji ?? 0}
          </div>
        </div>
      ))}
    </div>
  )
}
