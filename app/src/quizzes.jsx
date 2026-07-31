import { useState } from 'react'

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const HAS_KANJI = /[一-龯]/

// 앱에 저장된 단어·활용표에서 "표기 → 읽기" 맵을 만든다.
// 한자만 보고 발음을 알 수 없는 문제를 해결하기 위해 문항에 읽기를 병기한다.
export function buildReadingMap(data) {
  const map = {}
  for (const w of data.words) {
    if (w.reading && w.jp !== w.reading) map[w.jp] = w.reading
  }
  for (const g of data.grammar) {
    for (const c of g.conjugations || []) {
      if (c.reading) map[c.form] = c.reading
    }
  }
  return map
}

// 한자가 포함된 표기에 읽기를 병기: 行けば → 行けば（いけば）
function annotate(text, readingMap) {
  if (!text || !HAS_KANJI.test(text)) return text
  const r = readingMap[text]
  return r ? `${text}（${r}）` : text
}

// 정답 1개 + 오답 후보 풀에서 중복 없이 최대 3개를 섞어 보기 생성
function buildOptions(answer, pool) {
  const distractors = shuffle([...new Set(pool.filter((p) => p && p !== answer))]).slice(0, 3)
  return shuffle([answer, ...distractors])
}

// ---------- 문항 생성 ----------

// 문법 빈칸: 활용표의 (기본형 → 활용형)을 문항으로. 표기에 읽기 병기.
export function buildGrammarItems(grammar, readingMap = {}) {
  const allForms = grammar.flatMap((g) => g.conjugations.map((c) => annotate(c.form, readingMap)))
  const items = []
  for (const g of grammar) {
    for (const c of g.conjugations) {
      const answer = annotate(c.form, readingMap)
      items.push({
        key: `${g.pattern}:${c.base}`,
        tag: g.pattern,
        q: `「${annotate(c.base, readingMap)}」 → ？`,
        sub: `${g.pattern}${g.meaning ? ` — ${g.meaning}` : ''}`,
        options: buildOptions(answer, allForms),
        answer,
      })
    }
  }
  return shuffle(items)
}

// 한자 퀴즈: 음독 + 한국 한자음
const ONYOMI_POOL = ['エキ', 'コウ', 'シャ', 'デン', 'ガク', 'キン', 'スイ', 'ニチ']
const KSOUND_POOL = ['역', '행', '음', '주', '문', '차', '학', '수']

export function buildKanjiItems(kanji) {
  const onyomiAll = [...kanji.map((k) => k.onyomi), ...ONYOMI_POOL]
  const ksoundAll = [...kanji.map((k) => k.koreanSound), ...KSOUND_POOL]
  const items = []
  for (const k of kanji) {
    if (k.onyomi) {
      items.push({
        key: `${k.char}:on`,
        tag: k.char,
        q: `「${k.char}」의 음독은?`,
        sub: k.mnemonic || null,
        options: buildOptions(k.onyomi, onyomiAll),
        answer: k.onyomi,
      })
    }
    if (k.koreanSound) {
      items.push({
        key: `${k.char}:ko`,
        tag: k.char,
        q: `「${k.char}」의 한국 한자음은?`,
        sub: k.koreanHanja ? `한국 한자: ${k.koreanHanja}` : null,
        options: buildOptions(k.koreanSound, ksoundAll),
        answer: k.koreanSound,
      })
    }
  }
  return shuffle(items)
}

// 자연스러움 퀴즈: 교과서 표현 vs 실제 회화 표현
export function buildNaturalItems(pairs) {
  return shuffle(
    pairs.map((p, i) => ({
      key: `nat:${i}`,
      tag: '실전 표현',
      q: '일본인이 실제 회화에서 더 많이 쓰는 표현은?',
      sub: null,
      options: shuffle([p.textbook, p.natural]),
      answer: p.natural,
    })),
  )
}

// ---------- 공통 객관식 퀴즈 컴포넌트 ----------
// initialIdx/initialResults: 중단했던 퀴즈 이어하기용.
// onProgress: 매 문항 답변 시 호출 — 진행 상황 자동 저장에 사용.

export function MCQuiz({ title, items, onFinish, onProgress, initialIdx = 0, initialResults = [] }) {
  const [idx, setIdx] = useState(initialIdx)
  const [picked, setPicked] = useState(null)
  const [results, setResults] = useState(initialResults)

  const item = items[idx]

  const pick = (opt) => {
    if (picked !== null) return
    setPicked(opt)
    const correct = opt === item.answer
    setTimeout(() => {
      const nextResults = [
        ...results,
        { key: item.key, tag: item.tag, q: item.q, sub: item.sub, answer: item.answer, picked: opt, correct },
      ]
      setResults(nextResults)
      setPicked(null)
      if (idx + 1 >= items.length) {
        onFinish(nextResults)
      } else {
        onProgress?.(idx + 1, nextResults)
        setIdx(idx + 1)
      }
    }, 800)
  }

  return (
    <div className="screen">
      <div className="progress-text">{title} · {idx + 1} / {items.length}</div>
      <div className="quiz-card card">
        <div className="quiz-tag">{item.tag}</div>
        <div className="quiz-q">{item.q}</div>
        {item.sub && <div className="quiz-sub">{item.sub}</div>}
      </div>
      <div className="option-list">
        {item.options.map((opt) => {
          let cls = 'option-btn'
          if (picked !== null) {
            if (opt === item.answer) cls += ' right'
            else if (opt === picked) cls += ' picked-wrong'
          }
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- 결과 화면 (결과는 이미 자동 저장된 상태) ----------

export function QuizResult({ results, onDone }) {
  const correct = results.filter((r) => r.correct).length
  const wrongTags = [...new Set(results.filter((r) => !r.correct).map((r) => r.tag))]
  return (
    <div className="screen">
      <h1 className="page-title">복습 완료 🎉</h1>
      <p className="desc">결과는 자동 저장됐어요. 기록 탭에서 언제든 다시 볼 수 있습니다.</p>
      <div className="card result-card">
        <div className="stat-num">{correct} / {results.length}</div>
        <div className="stat-label">
          정답률 {results.length ? Math.round((correct / results.length) * 100) : 0}%
        </div>
      </div>
      {wrongTags.length > 0 && (
        <div className="card">
          <div className="card-title">다시 볼 항목</div>
          {wrongTags.map((t) => (
            <div key={t} className="weak-item">{t}</div>
          ))}
        </div>
      )}
      <button className="btn-primary" onClick={onDone}>홈으로</button>
    </div>
  )
}
