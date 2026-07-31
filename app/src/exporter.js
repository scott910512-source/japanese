import { today, wrongRate } from './srs.js'

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 전체 데이터 JSON 백업 — 기기 이전/복원용
export function downloadJsonBackup(data) {
  downloadBlob(
    JSON.stringify(data, null, 2),
    `nihongo-loop-backup-${today()}.json`,
    'application/json',
  )
}

// 학습 로그 마크다운 — AI에게 주고 문제를 확장 생성시키거나 사람이 훑어보는 용도
export function buildMarkdownLog(data) {
  const lines = []
  lines.push('# 📚 니혼고 루프 학습 로그')
  lines.push(`> 내보낸 날짜: ${today()}`)
  lines.push('')

  lines.push('## 학습 세션')
  for (const s of data.sessions) {
    lines.push(`- ${s.date || s.id} · ${s.topic || '(주제 없음)'} · 레벨 ${s.level || '-'}`)
  }
  lines.push('')

  lines.push('## 단어 (정답/오답 포함)')
  lines.push('| 일본어 | 읽기 | 뜻 | 정답 | 오답 | SRS 단계 |')
  lines.push('|--------|------|-----|------|------|----------|')
  for (const w of data.words) {
    lines.push(`| ${w.jp} | ${w.reading} | ${w.ko} | ${w.srs.correct} | ${w.srs.wrong} | ${w.srs.box} |`)
  }
  lines.push('')

  lines.push('## 문법')
  for (const g of data.grammar) {
    lines.push(`- ${g.pattern} — ${g.meaning || ''}${g.example ? ` (예: ${g.example})` : ''}`)
  }
  lines.push('')

  if (data.kanji.length) {
    lines.push('## 한자')
    for (const k of data.kanji) {
      lines.push(`- ${k.char}（${k.reading || ''}） 음독 ${k.onyomi || '-'} / 한국 한자 ${k.koreanHanja || '-'}(${k.koreanSound || '-'})`)
    }
    lines.push('')
  }

  if (data.naturalPairs.length) {
    lines.push('## 자연스러운 표현')
    for (const p of data.naturalPairs) {
      lines.push(`- 교과서: ${p.textbook} → 실제 회화: ${p.natural}`)
    }
    lines.push('')
  }

  if (data.quizHistory.length) {
    lines.push('## 푼 문제 이력')
    for (const h of data.quizHistory) {
      lines.push(`### ${h.date} · ${h.mode} · ${h.correct}/${h.total}`)
      for (const item of h.items || []) {
        lines.push(`- [${item.correct ? 'O' : 'X'}] ${item.q} → 정답: ${item.answer}${item.correct ? '' : ` (내 답: ${item.picked})`}`)
      }
      lines.push('')
    }
  }

  const weak = data.words.filter((w) => w.srs.wrong > 0 && wrongRate(w.srs) >= 0.4)
  if (weak.length) {
    lines.push('## 취약 항목')
    for (const w of weak) {
      lines.push(`- ${w.jp}（${w.reading}） ${w.ko} — 오답률 ${Math.round(wrongRate(w.srs) * 100)}%`)
    }
  }

  return lines.join('\n')
}

export function downloadMarkdownLog(data) {
  downloadBlob(buildMarkdownLog(data), `nihongo-loop-log-${today()}.md`, 'text/markdown')
}
