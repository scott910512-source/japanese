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
  RepeatQuiz,
  buildBasicGrammarItems,
  buildBasicWordItems,
  buildDailyQuizItems,
  buildDailyStudy,
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
  bword: '📚 기본 단어',
  bgrammar: '📘 기본 문법',
  daily: '📅 데일리 학습',
  song: '🎵 노래로 배우기',
}

// 오답 반복(RepeatQuiz) 기반 모드 — 저장 상태의 items가 "남은 문제"를 뜻한다
const REPEAT_MODES = ['daily', 'song']

export default function Review({ data, setData, go }) {
  const [session, setSession] = useState(null) // {mode, items, idx, results}
  const [pending, setPending] = useState(() => loadActiveQuiz()) // 중단된 퀴즈

  // 퀴즈가 끝나면 홈이 아니라 복습 목록으로 돌아온다 (다음 테스트 바로 선택)
  const exit = () => {
    setSession(null)
    setPending(loadActiveQuiz())
  }

  // 풀고 나면 SRS가 다음 복습일을 잡으므로, 오늘 몫(due)만 출제한다.
  const dueOf = (mode) => {
    const readingMap = buildReadingMap(data)
    if (mode === 'flash') return data.words.filter((w) => isDue(w.srs)).map((w) => w.jp)
    if (mode === 'grammar')
      return buildGrammarItems(data.grammar.filter((g) => isDue(g.srs || newSrs())), readingMap)
    if (mode === 'kanji') return buildKanjiItems(data.kanji.filter((k) => isDue(k.srs || newSrs())))
    if (mode === 'bword')
      return buildBasicWordItems((data.basicWords || []).filter((w) => isDue(w.srs)))
    if (mode === 'bgrammar')
      return buildBasicGrammarItems((data.basicVerbs || []).filter((v) => isDue(v.srs)))
    return buildNaturalItems(data.naturalPairs.filter((p) => isDue(p.srs || newSrs())))
  }

  const startSong = (songId) => {
    setPending(null)
    setSession({ mode: 'song', songId })
  }

  const start = (mode) => {
    if (mode === 'daily') {
      // 데일리 학습은 학습(설명) 단계부터 시작 — 테스트 시작 시점에 저장된다
      setPending(null)
      setSession({ mode: 'daily' })
      return
    }
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
  if (session?.mode === 'daily') {
    return <DailySession data={data} setData={setData} initial={session} done={exit} />
  }
  if (session?.mode === 'song') {
    return <SongSession data={data} setData={setData} initial={session} done={exit} />
  }
  if (session) {
    return <QuizSession data={data} setData={setData} initial={session} done={exit} />
  }

  const due = dueOf('flash').length
  const grammarCount = dueOf('grammar').length
  const kanjiCount = dueOf('kanji').length
  const naturalCount = dueOf('natural').length
  const bwordCount = dueOf('bword').length
  const bgrammarCount = dueOf('bgrammar').length
  const allDone =
    due + grammarCount + kanjiCount + naturalCount + bwordCount + bgrammarCount === 0

  return (
    <div className="screen">
      <h1 className="page-title">🔁 복습</h1>
      {allDone && (data.words.length > 0 || (data.basicWords || []).length > 0) && (
        <div className="card">
          <div className="card-title">오늘 복습 완료 🎉</div>
          <p className="desc">틀렸던 항목은 내일, 맞힌 항목은 간격을 늘려 다시 나옵니다.</p>
        </div>
      )}

      {pending && pending.results && pending.items.length > (REPEAT_MODES.includes(pending.mode) ? 0 : pending.idx) && (
        <div className="card resume-card">
          <div className="card-title">진행 중이던 복습이 있어요</div>
          <div className="resume-info">
            {MODE_LABELS[pending.mode] || pending.mode} ·{' '}
            {REPEAT_MODES.includes(pending.mode)
              ? `남은 ${pending.items.length}문제`
              : `${pending.idx} / ${pending.items.length} 완료`}
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

      <button className="btn-primary" onClick={() => start('daily')}>
        📅 데일리 학습 시작
      </button>
      <p className="desc">
        오늘의 단어·문법을 먼저 배우고, 최소 20문항 테스트로 확인합니다. 틀린 문제는 맞힐 때까지
        다시 나와요.
      </p>

      <h2 className="section-title">개별 복습</h2>
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

      <h2 className="section-title">매일 기본기 테스트</h2>
      <p className="desc">
        노트와 별개로 매일 새 기본 단어 5개·동사 활용 2개가 자동 배정됩니다. 틀리면 다음날 다시
        나와요.
      </p>
      <button className="mode-btn" onClick={() => start('bword')} disabled={bwordCount === 0}>
        📚 기본 단어 테스트 <span className="badge">{bwordCount}문항</span>
      </button>
      <button className="mode-btn" onClick={() => start('bgrammar')} disabled={bgrammarCount === 0}>
        📘 기본 문법 테스트 <span className="badge">{bgrammarCount}문항</span>
      </button>

      <h2 className="section-title">🎵 노래로 배우기</h2>
      <p className="desc">
        인기 J-POP의 핵심 단어·문법·표현을 곡별로 학습합니다. 완료한 곡의 단어는 데일리 학습에도
        추가돼요. (저작권 보호를 위해 가사 전문 대신 핵심 어휘로 구성)
      </p>
      {SONGS.map((s) => (
        <button className="mode-btn" key={s.id} onClick={() => startSong(s.id)}>
          <span className="song-title">
            {s.title} <span className="song-meta">{s.titleKo} · {s.artist}</span>
          </span>
          <span className={`badge ${(data.songsDone || []).includes(s.id) ? 'done' : ''}`}>
            {(data.songsDone || []).includes(s.id) ? '완료 ✓' : '학습하기'}
          </span>
        </button>
      ))}
    </div>
  )
}

import { FORM_LABELS } from '../basics.js'
import { SONGS } from '../songs.js'
import { buildSongQuizItems } from '../quizzes.jsx'

// 가사 안에서 이 곡의 학습 단어를 하이라이트해서 렌더링
function HighlightedLyrics({ text, words }) {
  const targets = words.map((w) => w.jp).filter(Boolean)
  if (targets.length === 0) return <pre className="lyrics-box">{text}</pre>
  const escaped = targets.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'g'))
  return (
    <pre className="lyrics-box">
      {parts.map((p, i) =>
        targets.includes(p) ? (
          <mark className="lyric-hit" key={i}>{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </pre>
  )
}

// 노래로 배우기: ① 곡 소개·단어·문법·표현 학습 → ② 테스트(오답 반복)
function SongSession({ data, setData, initial, done }) {
  const song = SONGS.find((s) => s.id === initial.songId)
  const [phase, setPhase] = useState(initial.items ? 'quiz' : 'study')
  const [quizState, setQuizState] = useState(
    initial.items
      ? { queue: initial.items, results: initial.results || [], total: initial.total || initial.items.length }
      : null,
  )
  const [finalResults, setFinalResults] = useState(null)
  const [lyricsDraft, setLyricsDraft] = useState('')
  const [editingLyrics, setEditingLyrics] = useState(false)

  if (!song) {
    done()
    return null
  }
  if (finalResults) return <QuizResult results={finalResults} onDone={done} />

  if (phase === 'study') {
    const savedLyrics = (data.songLyrics || {})[song.id]
    const saveLyrics = (text) => {
      const next = structuredClone(data)
      next.songLyrics = { ...(next.songLyrics || {}) }
      if (text) next.songLyrics[song.id] = text
      else delete next.songLyrics[song.id]
      setData(next)
      setEditingLyrics(false)
      setLyricsDraft('')
    }
    const searchUrl = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`
    const startQuiz = () => {
      const items = buildSongQuizItems(song)
      saveActiveQuiz({ mode: 'song', songId: song.id, items, idx: 0, results: [], total: items.length })
      setQuizState({ queue: items, results: [], total: items.length })
      setPhase('quiz')
    }
    return (
      <div className="screen">
        <h1 className="page-title">🎵 {song.title}</h1>
        <div className="card">
          <div className="study-verb-head">
            <span className="study-jp">{song.titleKo}</span>
            <span className="study-ko">{song.artist}</span>
          </div>
          <p className="desc">{song.intro}</p>
          <div className="answer-row">
            <a
              className="btn-secondary link-btn"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} ${song.artist}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              🎬 뮤직비디오
            </a>
            <a
              className="btn-secondary link-btn"
              href={searchUrl(`${song.title} ${song.artist} 歌詞`)}
              target="_blank"
              rel="noreferrer"
            >
              📝 공식 가사 찾기
            </a>
          </div>
        </div>

        <h2 className="section-title">가사로 공부하기</h2>
        {savedLyrics && !editingLyrics ? (
          <div className="card">
            <p className="desc">배운 단어가 가사에서 하이라이트됩니다. (내 기기에만 저장됨)</p>
            <HighlightedLyrics text={savedLyrics} words={[...song.words, ...song.expressions]} />
            <div className="answer-row">
              <button
                className="btn-secondary"
                onClick={() => {
                  setLyricsDraft(savedLyrics)
                  setEditingLyrics(true)
                }}
              >
                수정
              </button>
              <button className="btn-secondary" onClick={() => saveLyrics('')}>
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="desc">
              공식 가사를 직접 붙여넣으면 배운 단어가 하이라이트됩니다. 가사는 서버에 올라가지 않고
              <b> 이 기기에만</b> 저장돼요.
            </p>
            <textarea
              className="paste-area lyrics-input"
              placeholder="여기에 가사를 붙여넣기…"
              value={lyricsDraft}
              onChange={(e) => setLyricsDraft(e.target.value)}
            />
            <button
              className="btn-secondary"
              onClick={() => saveLyrics(lyricsDraft.trim())}
              disabled={!lyricsDraft.trim()}
            >
              가사 저장 (기기 전용)
            </button>
          </div>
        )}

        <h2 className="section-title">이 곡의 핵심 단어 ({song.words.length})</h2>
        {song.words.map((w) => (
          <div className="card study-word" key={w.jp}>
            <span className="study-jp">
              {w.jp}
              {w.reading !== w.jp ? <span className="study-reading">（{w.reading}）</span> : null}
            </span>
            <span className="study-ko">{w.ko}</span>
          </div>
        ))}

        <h2 className="section-title">이 곡의 문법 ({song.grammar.length})</h2>
        {song.grammar.map((g) => (
          <div className="card" key={g.pattern}>
            <div className="study-verb-head">
              <span className="study-jp">{g.pattern}</span>
              <span className="study-ko">{g.meaning}</span>
            </div>
            <p className="desc">
              {g.example}
              <br />
              {g.exampleKo}
            </p>
          </div>
        ))}

        <h2 className="section-title">이 곡의 표현 ({song.expressions.length})</h2>
        {song.expressions.map((e) => (
          <div className="card study-word" key={e.jp}>
            <span className="study-jp">
              {e.jp}
              {e.reading !== e.jp ? <span className="study-reading">（{e.reading}）</span> : null}
            </span>
            <span className="study-ko">{e.ko}</span>
          </div>
        ))}

        <button className="btn-primary" onClick={startQuiz}>
          테스트 시작
        </button>
        <button className="btn-secondary" onClick={done}>
          나가기
        </button>
      </div>
    )
  }

  const finish = (results) => {
    const next = commitQuizResult(data, { mode: 'song', results })
    // 곡 단어를 기본 단어 풀에 추가 → 데일리 학습에서 계속 반복
    const known = new Set(next.basicWords.map((w) => w.jp))
    for (const w of song.words) {
      if (!known.has(w.jp)) next.basicWords.push({ ...w, srs: newSrs(), from: `song:${song.id}` })
    }
    if (!(next.songsDone || []).includes(song.id)) {
      next.songsDone = [...(next.songsDone || []), song.id]
    }
    setData(next)
    clearActiveQuiz()
    setFinalResults(results)
  }

  return (
    <RepeatQuiz
      title={`🎵 ${song.titleKo}`}
      initialQueue={quizState.queue}
      initialResults={quizState.results}
      total={quizState.total}
      onProgress={(q, r) =>
        saveActiveQuiz({ mode: 'song', songId: song.id, items: q, idx: r.length, results: r, total: quizState.total })
      }
      onFinish={finish}
    />
  )
}

// 데일리 학습: ① 오늘의 단어·문법 학습(설명) → ② 최소 20문항 테스트(오답 반복)
function DailySession({ data, setData, initial, done }) {
  const [phase, setPhase] = useState(initial.items ? 'quiz' : 'study')
  const [quizState, setQuizState] = useState(
    initial.items
      ? { queue: initial.items, results: initial.results || [], total: initial.total || initial.items.length }
      : null,
  )
  const [finalResults, setFinalResults] = useState(null)

  if (finalResults) return <QuizResult results={finalResults} onDone={done} />

  if (phase === 'study') {
    const study = buildDailyStudy(data)
    const empty = study.words.length + study.verbs.length + study.grammar.length === 0
    const startQuiz = () => {
      const items = buildDailyQuizItems(data)
      if (items.length === 0) {
        done()
        return
      }
      saveActiveQuiz({ mode: 'daily', items, idx: 0, results: [], total: items.length })
      setQuizState({ queue: items, results: [], total: items.length })
      setPhase('quiz')
    }
    return (
      <div className="screen">
        <h1 className="page-title">📅 오늘의 학습</h1>
        {empty ? (
          <p className="desc">
            오늘 새로 배울 항목은 이미 다 봤어요. 테스트는 배운 항목 중 익숙도가 낮은 것들로
            구성됩니다.
          </p>
        ) : (
          <p className="desc">먼저 오늘의 단어와 문법을 눈에 익힌 뒤 테스트를 시작하세요.</p>
        )}

        {study.words.length > 0 && (
          <>
            <h2 className="section-title">오늘의 단어 ({study.words.length})</h2>
            {study.words.map((w) => (
              <div className="card study-word" key={w.jp}>
                <span className="study-jp">
                  {w.jp}
                  {w.reading && w.reading !== w.jp ? <span className="study-reading">（{w.reading}）</span> : null}
                </span>
                <span className="study-ko">{w.ko}</span>
              </div>
            ))}
          </>
        )}

        {study.verbs.length > 0 && (
          <>
            <h2 className="section-title">오늘의 동사 활용 ({study.verbs.length})</h2>
            {study.verbs.map((v) => (
              <div className="card" key={v.base}>
                <div className="study-verb-head">
                  <span className="study-jp">
                    {v.base}
                    {v.reading !== v.base ? <span className="study-reading">（{v.reading}）</span> : null}
                  </span>
                  <span className="study-ko">{v.ko}</span>
                </div>
                <table className="study-forms">
                  <tbody>
                    {Object.entries(v.forms).map(([fk, f]) => (
                      <tr key={fk}>
                        <td className="form-label">{FORM_LABELS[fk]}</td>
                        <td className="form-value">
                          {f.f}
                          {f.r !== f.f ? <span className="study-reading">（{f.r}）</span> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}

        {study.grammar.length > 0 && (
          <>
            <h2 className="section-title">노트에서 배운 문법 복습 ({study.grammar.length})</h2>
            {study.grammar.map((g) => (
              <div className="card" key={g.pattern}>
                <div className="study-verb-head">
                  <span className="study-jp">{g.pattern}</span>
                  <span className="study-ko">{g.meaning}</span>
                </div>
                {g.example && <p className="desc">{g.example}</p>}
              </div>
            ))}
          </>
        )}

        <button className="btn-primary" onClick={startQuiz}>
          테스트 시작 (최소 20문항)
        </button>
        <button className="btn-secondary" onClick={done}>
          나가기
        </button>
      </div>
    )
  }

  const finish = (results) => {
    const next = commitQuizResult(data, { mode: 'daily', results })
    // 항목별 SRS 반영 (첫 시도 기준, 같은 항목 문항이 하나라도 틀리면 오답)
    const byRef = {}
    for (const r of results) {
      if (!r.ref || !r.rt) continue
      const k = `${r.rt}|${r.ref}`
      byRef[k] = (byRef[k] ?? true) && r.correct
    }
    const find = {
      bw: (ref) => next.basicWords.find((x) => x.jp === ref),
      bv: (ref) => next.basicVerbs.find((x) => x.base === ref),
      g: (ref) => next.grammar.find((x) => x.pattern === ref),
      w: (ref) => next.words.find((x) => x.jp === ref),
    }
    for (const [k, ok] of Object.entries(byRef)) {
      const [rt, ref] = [k.slice(0, k.indexOf('|')), k.slice(k.indexOf('|') + 1)]
      const t = find[rt]?.(ref)
      if (t) t.srs = applyAnswer(t.srs || newSrs(), ok)
    }
    setData(next)
    clearActiveQuiz()
    setFinalResults(results)
  }

  return (
    <RepeatQuiz
      title="📅 데일리 학습"
      initialQueue={quizState.queue}
      initialResults={quizState.results}
      total={quizState.total}
      onProgress={(q, r) =>
        saveActiveQuiz({ mode: 'daily', items: q, idx: r.length, results: r, total: quizState.total })
      }
      onFinish={finish}
    />
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
      bword: (ref) => next.basicWords.find((x) => x.jp === ref),
      bgrammar: (ref) => next.basicVerbs.find((x) => x.base === ref),
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
