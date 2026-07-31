// Leitner 5단계 간격 반복. 정답 → 다음 박스, 오답 → 1단계.
const INTERVALS = [1, 2, 4, 7, 15] // 박스 1~5의 복습 간격(일)

export function today() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function newSrs() {
  return { box: 1, due: today(), correct: 0, wrong: 0 }
}

export function applyAnswer(srs, isCorrect) {
  const next = { ...srs }
  if (isCorrect) {
    next.correct += 1
    next.box = Math.min(next.box + 1, INTERVALS.length)
  } else {
    next.wrong += 1
    next.box = 1
  }
  next.due = addDays(today(), INTERVALS[next.box - 1])
  return next
}

export function isDue(srs) {
  return srs.due <= today()
}

export function wrongRate(srs) {
  const total = srs.correct + srs.wrong
  return total === 0 ? 0 : srs.wrong / total
}
