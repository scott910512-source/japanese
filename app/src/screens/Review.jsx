import { useState } from 'react'
import { applyAnswer, isDue, newSrs, today } from '../srs.js'
import {
  MCQuiz,
  QuizResult,
  buildGrammarItems,
  buildKanjiItems,
  buildNaturalItems,
} from '../quizzes.jsx'

export default function Review({ data, setData, go }) {
  const [mode, setMode] = useState(null)

  const exit = () => {
    setMode(null)
    go('home')
  }

  if (mode === 'flash') return <Flashcards data={data} setData={setData} done={exit} />
  if (mode) {
    return (
      <QuizSession
        mode={mode}
        data={data}
        setData={setData}
        done={exit}
        back={() => setMode(null)}
      />
    )
  }

  const due = data.words.filter((w) => isDue(w.srs)).length
  const grammarCount = buildGrammarItems(data.grammar).length
  const kanjiCount = buildKanjiItems(data.kanji).length
  const naturalCount = buildNaturalItems(data.naturalPairs).length

  return (
    <div className="screen">
      <h1 className="page-title">🔁 복습</h1>
      <p className="desc">모드를 선택하세요.</p>
      <button className="mode-btn" onClick={() => setMode('flash')} disabled={due === 0}>
        🃏 단어 플래시카드 <span className="badge">{due}장</span>
      </button>
      <button className="mode-btn" onClick={() => setMode('grammar')} disabled={grammarCount === 0}>
        ✏️ 문법 빈칸 채우기 <span className="badge">{grammarCount}문항</span>
      </button>
      <button className="mode-btn" onClick={() => setMode('kanji')} disabled={kanjiCount === 0}>
        🈶 한자 퀴즈 <span className="badge">{kanjiCount}문항</span>
      </button>
      <button className="mode-btn" onClick={() => setMode('natural')} disabled={naturalCount === 0}>
        🎯 자연스러움 퀴즈 <span className="badge">{naturalCount}문항</span>
      </button>
      <button className="mode-btn" disabled>
        🗣️ 회화 롤플레이 <span className="badge soon">Phase 3</span>
      </button>
    </div>
  )
}

const QUIZ_DEFS = {
  grammar: { title: '✏️ 문법 빈칸', build: (d) => buildGrammarItems(d.grammar) },
  kanji: { title: '🈶 한자 퀴즈', build: (d) => buildKanjiItems(d.kanji) },
  natural: { title: '🎯 자연스러움', build: (d) => buildNaturalItems(d.naturalPairs) },
}

function QuizSession({ mode, data, setData, done, back }) {
  const def = QUIZ_DEFS[mode]
  const [items] = useState(() => def.build(data))
  const [results, setResults] = useState(null)

  if (items.length === 0) {
    back()
    return null
  }

  if (results) {
    return (
      <QuizResult
        results={results}
        onSave={() => {
          const next = structuredClone(data)
          const correct = results.filter((r) => r.correct).length
          next.reviewLog.push({
            date: today(),
            mode,
            total: results.length,
            correct,
            weakItems: [...new Set(results.filter((r) => !r.correct).map((r) => r.tag))],
          })
          // 문법 퀴즈는 문법 카드 SRS에도 반영 (한 문항이라도 틀리면 오답 처리)
          if (mode === 'grammar') {
            const byPattern = {}
            for (const r of results) {
              byPattern[r.tag] = (byPattern[r.tag] ?? true) && r.correct
            }
            for (const [pattern, ok] of Object.entries(byPattern)) {
              const g = next.grammar.find((x) => x.pattern === pattern)
              if (g) g.srs = applyAnswer(g.srs || newSrs(), ok)
            }
          }
          setData(next)
          done()
        }}
      />
    )
  }

  return <MCQuiz title={def.title} items={items} onFinish={setResults} />
}

function Flashcards({ data, setData, done }) {
  const [queue] = useState(() => data.words.filter((w) => isDue(w.srs)).map((w) => w.jp))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])

  if (idx >= queue.length) {
    const correct = results.filter((r) => r.correct).length
    const wrongItems = results.filter((r) => !r.correct)
    return (
      <div className="screen">
        <h1 className="page-title">복습 완료 🎉</h1>
        <div className="card result-card">
          <div className="stat-num">{correct} / {results.length}</div>
          <div className="stat-label">
            정답률 {results.length ? Math.round((correct / results.length) * 100) : 0}%
          </div>
        </div>
        {wrongItems.length > 0 && (
          <div className="card">
            <div className="card-title">다시 볼 카드</div>
            {wrongItems.map((r) => (
              <div key={r.jp} className="weak-item">{r.jp}</div>
            ))}
          </div>
        )}
        <button
          className="btn-primary"
          onClick={() => {
            const next = structuredClone(data)
            next.reviewLog.push({
              date: today(),
              mode: 'flashcard',
              total: results.length,
              correct,
              weakItems: wrongItems.map((r) => r.jp),
            })
            setData(next)
            done()
          }}
        >
          결과 저장
        </button>
      </div>
    )
  }

  const word = data.words.find((w) => w.jp === queue[idx])

  const answer = (isCorrect) => {
    const next = structuredClone(data)
    const w = next.words.find((x) => x.jp === word.jp)
    w.srs = applyAnswer(w.srs, isCorrect)
    setData(next)
    setResults([...results, { jp: word.jp, correct: isCorrect }])
    setFlipped(false)
    setIdx(idx + 1)
  }

  return (
    <div className="screen">
      <div className="progress-text">{idx + 1} / {queue.length}</div>
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        {!flipped ? (
          <div className="flash-front">{word.jp}</div>
        ) : (
          <div className="flash-back">
            <div className="flash-reading">{word.reading}</div>
            <div className="flash-meaning">{word.ko}</div>
          </div>
        )}
        <div className="flash-hint">{flipped ? '' : '탭해서 뜻 보기'}</div>
      </div>
      {flipped && (
        <div className="answer-row">
          <button className="btn-wrong" onClick={() => answer(false)}>몰라요 😵</button>
          <button className="btn-correct" onClick={() => answer(true)}>알아요 ✅</button>
        </div>
      )}
    </div>
  )
}
