import { useState } from 'react'
import { applyAnswer, isDue, newSrs, today } from '../srs.js'
import {
  clearActiveQuiz,
  commitQuizResult,
  loadActiveQuiz,
  saveActiveQuiz,
} from '../storage.js'
import {
  MCQuiz,
  QuizResult,
  buildGrammarItems,
  buildKanjiItems,
  buildNaturalItems,
  buildReadingMap,
} from '../quizzes.jsx'

const MODE_LABELS = {
  flash: '🃏 단어 플래시카드',
  grammar: '✏️ 문법 빈칸',
  kanji: '🈶 한자 퀴즈',
  natural: '🎯 자연스러움',
}

export default function Review({ data, setData, go }) {
  const [session, setSession] = useState(null) // {mode, items, idx, results}
  const [pending, setPending] = useState(() => loadActiveQuiz()) // 중단된 퀴즈

  const exit = () => {
    setSession(null)
    setPending(loadActiveQuiz())
    go('home')
  }

  // 풀고 나면 SRS가 다음 복습일을 잡으므로, 오늘 몫(due)만 출제한다.
  const dueOf = (mode) => {
    const readingMap = buildReadingMap(data)
    if (mode === 'flash') return data.words.filter((w) => isDue(w.srs)).map((w) => w.jp)
    if (mode === 'grammar')
      return buildGrammarItems(data.grammar.filter((g) => isDue(g.srs || newSrs())), readingMap)
    if (mode === 'kanji') return buildKanjiItems(data.kanji.filter((k) => isDue(k.srs || newSrs())))
    return buildNaturalItems(data.naturalPairs.filter((p) => isDue(p.srs || newSrs())))
  }

  const start = (mode) => {
    const state = { mode, items: dueOf(mode), idx: 0, results: [] }
    saveActiveQuiz(state)
    setPending(null)
    setSession(state)
  }

  const resume = () => {
    setSession(pending)
    setPending(null)
  }

  if (session?.mode === 'flash') {
    return <Flashcards data={data} setData={setData} initial={session} done={exit} />
  }
  if (session) {
    return <QuizSession data={data} setData={setData} initial={session} done={exit} />
  }

  const due = dueOf('flash').length
  const grammarCount = dueOf('grammar').length
  const kanjiCount = dueOf('kanji').length
  const naturalCount = dueOf('natural').length
  const allDone = due + grammarCount + kanjiCount + naturalCount === 0

  return (
    <div className="screen">
      <h1 className="page-title">🔁 복습</h1>
      {allDone && data.words.length > 0 && (
        <div className="card">
          <div className="card-title">오늘 복습 완료 🎉</div>
          <p className="desc">틀렸던 항목은 내일, 맞힌 항목은 간격을 늘려 다시 나옵니다.</p>
        </div>
      )}

      {pending && pending.results && pending.idx < pending.items.length && (
        <div className="card resume-card">
          <div className="card-title">진행 중이던 복습이 있어요</div>
          <div className="resume-info">
            {MODE_LABELS[pending.mode] || pending.mode} · {pending.idx} / {pending.items.length} 완료
          </div>
          <div className="answer-row">
            <button className="btn-primary" onClick={resume}>이어서 하기</button>
            <button
              className="btn-secondary"
              onClick={() => {
                clearActiveQuiz()
                setPending(null)
              }}
            >
              버리기
            </button>
          </div>
        </div>
      )}

      <p className="desc">모드를 선택하세요. 답을 고를 때마다 자동 저장됩니다.</p>
      <button className="mode-btn" onClick={() => start('flash')} disabled={due === 0}>
        🃏 단어 플래시카드 <span className="badge">{due}장</span>
      </button>
      <button className="mode-btn" onClick={() => start('grammar')} disabled={grammarCount === 0}>
        ✏️ 문법 빈칸 채우기 <span className="badge">{grammarCount}문항</span>
      </button>
      <button className="mode-btn" onClick={() => start('kanji')} disabled={kanjiCount === 0}>
        🈶 한자 퀴즈 <span className="badge">{kanjiCount}문항</span>
      </button>
      <button className="mode-btn" onClick={() => start('natural')} disabled={naturalCount === 0}>
        🎯 자연스러움 퀴즈 <span className="badge">{naturalCount}문항</span>
      </button>
      <button className="mode-btn" disabled>
        🗣️ 회화 롤플레이 <span className="badge soon">Phase 3</span>
      </button>
    </div>
  )
}

function QuizSession({ data, setData, initial, done }) {
  const [results, setResults] = useState(null)

  if (results) {
    return <QuizResult results={results} onDone={done} />
  }

  const finish = (finalResults) => {
    const next = commitQuizResult(data, { mode: initial.mode, results: finalResults })
    // 항목별 SRS 반영: 같은 항목(ref)의 문항이 하나라도 틀리면 오답 처리
    const byRef = {}
    for (const r of finalResults) {
      if (!r.ref) continue
      byRef[r.ref] = (byRef[r.ref] ?? true) && r.correct
    }
    const targets = {
      grammar: (ref) => next.grammar.find((x) => x.pattern === ref),
      kanji: (ref) => next.kanji.find((x) => x.char === ref),
      natural: (ref) => next.naturalPairs.find((x) => x.natural === ref),
    }
    const findTarget = targets[initial.mode]
    if (findTarget) {
      for (const [ref, ok] of Object.entries(byRef)) {
        const t = findTarget(ref)
        if (t) t.srs = applyAnswer(t.srs || newSrs(), ok)
      }
    }
    setData(next)
    clearActiveQuiz()
    setResults(finalResults)
  }

  return (
    <MCQuiz
      title={MODE_LABELS[initial.mode] || initial.mode}
      items={initial.items}
      initialIdx={initial.idx}
      initialResults={initial.results}
      onProgress={(idx, r) => saveActiveQuiz({ ...initial, idx, results: r })}
      onFinish={finish}
    />
  )
}

function Flashcards({ data, setData, initial, done }) {
  const [queue] = useState(initial.items)
  const [idx, setIdx] = useState(initial.idx)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState(initial.results)
  const [finished, setFinished] = useState(false)

  if (finished || (idx >= queue.length && results.length > 0)) {
    return <QuizResult results={results} onDone={done} />
  }
  if (queue.length === 0) {
    done()
    return null
  }

  const word = data.words.find((w) => w.jp === queue[idx])

  const answer = (isCorrect) => {
    const entry = {
      key: word.jp,
      tag: word.jp,
      q: word.jp,
      sub: null,
      answer: `${word.reading} · ${word.ko}`,
      picked: isCorrect ? '알아요' : '몰라요',
      correct: isCorrect,
    }
    const nextResults = [...results, entry]
    let next = structuredClone(data)
    const w = next.words.find((x) => x.jp === word.jp)
    w.srs = applyAnswer(w.srs, isCorrect)

    if (idx + 1 >= queue.length) {
      // 마지막 카드: 결과를 즉시 자동 저장
      next = commitQuizResult(next, { mode: 'flashcard', results: nextResults })
      clearActiveQuiz()
      setData(next)
      setResults(nextResults)
      setFinished(true)
    } else {
      saveActiveQuiz({ mode: 'flash', items: queue, idx: idx + 1, results: nextResults })
      setData(next)
      setResults(nextResults)
      setFlipped(false)
      setIdx(idx + 1)
    }
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
