import { useState } from 'react'

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 정답 1개 + 오답 후보 풀에서 중복 없이 최대 3개를 섞어 보기 생성
function buildOptions(answer, pool) {
  const distractors = shuffle([...new Set(pool.filter((p) => p && p !== answer))]).slice(0, 3)
  return shuffle([answer, ...distractors])
}

// ---------- 문항 생성 ----------

// 문법 빈칸: 활용표의 (기본형 → 활용형)을 문항으로
export function buildGrammarItems(grammar) {
  const allForms = grammar.flatMap((g) => g.conjugations.map((c) => c.form))
  const items = []
  for (const g of grammar) {
    for (const c of g.conjugations) {
      items.push({
        key: `${g.pattern}:${c.base}`,
        tag: g.pattern,
        q: `「${c.base}」 → ？`,
        sub: `${g.pattern}${g.meaning ? ` — ${g.meaning}` : ''}`,
        options: buildOptions(c.form, allForms),
        answer: c.form,
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

export function MCQuiz({ title, items, onFinish }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null) // 선택한 보기 (피드백 표시 중)
  const [results, setResults] = useState([])

  const item = items[idx]

  const pick = (opt) => {
    if (picked !== null) return
    setPicked(opt)
    const correct = opt === item.answer
    setTimeout(() => {
      const nextResults = [...results, { key: item.key, tag: item.tag, correct }]
      setResults(nextResults)
      setPicked(null)
      if (idx + 1 >= items.length) {
        onFinish(nextResults)
      } else {
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

// ---------- 결과 화면 ----------

export function QuizResult({ results, onSave }) {
  const correct = results.filter((r) => r.correct).length
  const wrongTags = [...new Set(results.filter((r) => !r.correct).map((r) => r.tag))]
  return (
    <div className="screen">
      <h1 className="page-title">복습 완료 🎉</h1>
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
      <button className="btn-primary" onClick={onSave}>결과 저장</button>
    </div>
  )
}
