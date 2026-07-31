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

// ---------- 같은 동사의 "그럴듯한 틀린 활용형" 생성 ----------
// 다른 동사를 보기로 내면 한자만 보고 맞힐 수 있으므로,
// 정답 활용형의 어미를 변형해 같은 동사의 가짜 활용형을 만든다.
// 見れば → 見らば・見りば・見れる・見ければ ...
const E_ROW_VARIANTS = {
  け: 'かきくこ', せ: 'さしすそ', て: 'たちつと', ね: 'なにぬの', へ: 'はひふほ',
  め: 'まみむも', れ: 'らりるろ', え: 'あいうお', げ: 'がぎぐご', ぜ: 'ざじずぞ',
  で: 'だぢづど', べ: 'ばびぶぼ', ぺ: 'ぱぴぷぽ',
}

function mutateBaForm(text) {
  const out = []
  if (!text || text.length < 2 || !text.endsWith('ば')) return out
  const k = text[text.length - 2]
  const stem = text.slice(0, -2)
  const row = E_ROW_VARIANTS[k]
  if (row) {
    for (const c of row) out.push(stem + c + 'ば') // 見らば, 見りば, 見るば, 見ろば
  }
  out.push(stem + k + 'る') // 見れる (가능형처럼 보이는 오답)
  if (k !== 'け') out.push(stem + 'け' + k + 'ば') // 見ければ
  return out
}

// 활용형과 읽기가 같은 어미를 공유하므로, 같은 변형을 읽기에도 적용해 짝을 만든다.
function fakeFormPairs(form, reading) {
  const forms = mutateBaForm(form)
  const readings = reading ? mutateBaForm(reading) : []
  return forms.map((f, i) => ({ form: f, reading: readings[i] || null }))
}

function display(form, reading) {
  return reading && HAS_KANJI.test(form) ? `${form}（${reading}）` : form
}

// ---------- 문항 생성 ----------

// 문법 빈칸: 활용표의 (기본형 → 활용형)을 문항으로.
// 보기는 같은 동사의 가짜 활용형으로 구성하고 읽기를 병기한다.
export function buildGrammarItems(grammar, readingMap = {}) {
  const allForms = grammar.flatMap((g) => g.conjugations.map((c) => annotate(c.form, readingMap)))
  const items = []
  for (const g of grammar) {
    for (const c of g.conjugations) {
      const reading = readingMap[c.form] || null
      const answer = display(c.form, reading) === c.form ? annotate(c.form, readingMap) : display(c.form, reading)
      const fakes = shuffle(fakeFormPairs(c.form, reading))
        .slice(0, 3)
        .map((p) => display(p.form, p.reading))
      const options =
        fakes.length >= 2
          ? shuffle([answer, ...fakes])
          : buildOptions(answer, allForms) // ば형이 아닌 문법은 기존 방식 폴백
      items.push({
        key: `${g.pattern}:${c.base}`,
        ref: g.pattern,
        tag: g.pattern,
        q: `「${annotate(c.base, readingMap)}」 → ？`,
        sub: `${g.pattern}${g.meaning ? ` — ${g.meaning}` : ''}`,
        options,
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
        ref: k.char,
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
        ref: k.char,
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

// ---------- 매일 기본기 테스트 ----------
import { BASIC_WORDS, FORM_LABELS } from './basics.js'

// 기본 단어 테스트: 단어당 1문항 — 뜻 맞히기 또는 (한자어는) 읽기 맞히기
export function buildBasicWordItems(words) {
  const meaningPool = BASIC_WORDS.map((w) => w.ko)
  const readingPool = BASIC_WORDS.map((w) => w.reading)
  const items = []
  for (const w of words) {
    const askReading = HAS_KANJI.test(w.jp) && Math.random() < 0.5
    if (askReading) {
      items.push({
        key: `bw:${w.jp}:r`,
        ref: w.jp,
        tag: '기본 단어',
        q: `「${w.jp}」의 읽기는?`,
        sub: null,
        options: buildOptions(w.reading, readingPool),
        answer: w.reading,
      })
    } else {
      items.push({
        key: `bw:${w.jp}:m`,
        ref: w.jp,
        tag: '기본 단어',
        q: `「${w.jp}${w.jp !== w.reading ? `（${w.reading}）` : ''}」의 뜻은?`,
        sub: null,
        options: buildOptions(w.ko, meaningPool),
        answer: w.ko,
      })
    }
  }
  return shuffle(items)
}

// 기본 문법 테스트: 동사당 2문항 — 요구한 활용형 고르기.
// 보기는 같은 동사의 다른 활용형이라 형태를 정확히 알아야 맞힐 수 있다.
export function buildBasicGrammarItems(verbs) {
  const items = []
  for (const v of verbs) {
    const formKeys = shuffle(Object.keys(v.forms)).slice(0, 2)
    for (const fk of formKeys) {
      const answerForm = v.forms[fk]
      const options = shuffle(
        Object.values(v.forms).map((x) => display(x.f, x.r === x.f ? null : x.r)),
      )
      items.push({
        key: `bv:${v.base}:${fk}`,
        ref: v.base,
        tag: '기본 문법',
        q: `「${v.base}${v.base !== v.reading ? `（${v.reading}）` : ''}」의 ${FORM_LABELS[fk]}은?`,
        sub: `${v.ko}`,
        options,
        answer: display(answerForm.f, answerForm.r === answerForm.f ? null : answerForm.r),
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
      ref: p.natural,
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
        { key: item.key, ref: item.ref, tag: item.tag, q: item.q, sub: item.sub, answer: item.answer, picked: opt, correct },
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
