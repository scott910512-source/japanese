import { wrongRate } from '../srs.js'
import { downloadJsonBackup, downloadMarkdownLog } from '../exporter.js'

const MODE_LABELS = {
  flashcard: '🃏 플래시카드',
  flash: '🃏 플래시카드',
  grammar: '✏️ 문법 빈칸',
  kanji: '🈶 한자 퀴즈',
  natural: '🎯 자연스러움',
  bword: '📚 기본 단어',
  bgrammar: '📘 기본 문법',
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

      <div className="answer-row">
        <button className="btn-secondary" onClick={() => downloadJsonBackup(data)}>
          📦 데이터 백업 (JSON)
        </button>
        <button className="btn-secondary" onClick={() => downloadMarkdownLog(data)}>
          📝 학습 로그 (MD)
        </button>
      </div>

      <h2 className="section-title">취약 항목</h2>
      {data.grammar
        .filter((g) => g.srs && g.srs.wrong > 0 && wrongRate(g.srs) >= 0.4)
        .map((g) => (
          <div className="card weak-card" key={g.pattern}>
            <span className="jp">{g.pattern}</span>
            <span>{g.meaning}</span>
            <span className="weak-rate">오답률 {Math.round(wrongRate(g.srs) * 100)}%</span>
          </div>
        ))}
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

      <h2 className="section-title">푼 문제 다시보기</h2>
      {data.quizHistory.length === 0 ? (
        <p className="empty">복습 기록이 없습니다.</p>
      ) : (
        [...data.quizHistory].reverse().map((h, i) => (
          <details className="card history-details" key={i}>
            <summary className="log-card-summary">
              <span>{h.date}</span>
              <span>{MODE_LABELS[h.mode] || h.mode}</span>
              <span>
                {h.correct}/{h.total} ({h.total ? Math.round((h.correct / h.total) * 100) : 0}%)
              </span>
            </summary>
            {h.items ? (
              <div className="history-items">
                {h.items.map((item, j) => (
                  <div className={`history-item ${item.correct ? 'ok' : 'no'}`} key={j}>
                    <div className="history-q">
                      {item.correct ? '✅' : '❌'} {item.q}
                    </div>
                    <div className="history-a">
                      정답: <b>{item.answer}</b>
                      {!item.correct && item.picked && <span className="history-picked"> · 내 답: {item.picked}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">이 기록은 문제 상세가 저장되기 전 버전이라 요약만 남아 있어요.</p>
            )}
          </details>
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
