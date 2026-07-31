import { newSrs, today } from './srs.js'

const KEY = 'nihongo-loop-v1'

const EMPTY = {
  sessions: [],
  words: [],
  grammar: [],
  kanji: [],
  dialogues: [],
  naturalPairs: [],
  reviewSentences: [],
  reviewLog: [],
  quizHistory: [], // 푼 문제 전체 보관: {date, mode, total, correct, items:[{q, answer, picked, correct}]}
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    const data = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY }
    // 구버전 데이터 마이그레이션: 문제 상세가 없던 reviewLog를 quizHistory로 승격
    if (data.quizHistory.length === 0 && data.reviewLog.length > 0) {
      data.quizHistory = data.reviewLog.map((r) => ({ ...r, items: null }))
    }
    // 구버전 데이터에 SRS가 없는 항목 보충 (문법·한자·자연스러움도 간격 반복 대상)
    for (const g of data.grammar) if (!g.srs) g.srs = newSrs()
    for (const k of data.kanji) if (!k.srs) k.srs = newSrs()
    for (const p of data.naturalPairs) if (!p.srs) p.srs = newSrs()
    return data
  } catch {
    return { ...EMPTY }
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

// ---------- 진행 중 퀴즈 자동 저장 (중단 후 이어하기) ----------
const ACTIVE_KEY = 'nihongo-loop-active-quiz'

export function saveActiveQuiz(state) {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(state))
}

export function loadActiveQuiz() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearActiveQuiz() {
  localStorage.removeItem(ACTIVE_KEY)
}

// 완료된 퀴즈를 즉시 기록에 반영 (저장 버튼 없이 자동 저장)
export function commitQuizResult(data, { mode, results }) {
  const next = structuredClone(data)
  const correct = results.filter((r) => r.correct).length
  const entry = {
    date: today(),
    mode,
    total: results.length,
    correct,
    weakItems: [...new Set(results.filter((r) => !r.correct).map((r) => r.tag || r.q))],
  }
  next.reviewLog.push(entry)
  next.quizHistory.push({
    ...entry,
    items: results.map((r) => ({
      q: r.q,
      sub: r.sub || null,
      answer: r.answer,
      picked: r.picked ?? null,
      correct: r.correct,
    })),
  })
  return next
}

// 파싱된 노트를 병합 저장. 단어는 표기(jp) 기준으로 중복 제거(기존 SRS 유지).
export function importParsed(data, parsed) {
  const next = structuredClone(data)
  const sid = parsed.session.id

  next.sessions = next.sessions.filter((s) => s.id !== sid)
  next.sessions.push({ ...parsed.session, importedAt: today() })
  next.sessions.sort((a, b) => (a.id < b.id ? 1 : -1))

  const known = new Set(next.words.map((w) => w.jp))
  for (const w of parsed.words) {
    if (!known.has(w.jp)) {
      next.words.push({ ...w, sessionId: sid, srs: newSrs() })
      known.add(w.jp)
    }
  }

  // 문법·한자는 이미 있으면 내용만 갱신(읽기 열 추가 등 반영)하고 SRS는 유지
  for (const g of parsed.grammar) {
    const existing = next.grammar.find((x) => x.pattern === g.pattern)
    if (existing) {
      Object.assign(existing, g, { srs: existing.srs || newSrs() })
    } else {
      next.grammar.push({ ...g, sessionId: sid, srs: newSrs() })
    }
  }

  for (const k of parsed.kanji) {
    const existing = next.kanji.find((x) => x.char === k.char)
    if (existing) {
      Object.assign(existing, k, { srs: existing.srs || newSrs() })
    } else {
      next.kanji.push({ ...k, sessionId: sid, srs: newSrs() })
    }
  }

  // 같은 세션을 다시 임포트하면 회화는 교체 (중복 누적 방지)
  next.dialogues = next.dialogues.filter((d) => d.sessionId !== sid)
  for (const d of parsed.dialogues) next.dialogues.push({ ...d, sessionId: sid })
  for (const p of parsed.naturalPairs) {
    if (!next.naturalPairs.some((x) => x.natural === p.natural)) {
      next.naturalPairs.push({ ...p, sessionId: sid, srs: newSrs() })
    }
  }
  for (const s of parsed.reviewSentences) {
    if (!next.reviewSentences.some((r) => r.text === s)) {
      next.reviewSentences.push({ text: s, sessionId: sid })
    }
  }
  return next
}

export function latestSession(data) {
  return data.sessions[0] || null
}

// 연속 학습일: reviewLog + 임포트 날짜 기준
export function streak(data) {
  const days = new Set([
    ...data.reviewLog.map((r) => r.date),
    ...data.sessions.map((s) => s.importedAt),
  ])
  let count = 0
  const d = new Date()
  // 오늘 활동이 없으면 어제부터 계산
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    count += 1
    d.setDate(d.getDate() - 1)
  }
  return count
}
