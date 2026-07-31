// 표준 학습 노트(마크다운) 파서 — docs/prompt-template.md 포맷을 파싱한다.
// 섹션은 h1(#) 제목의 키워드로 식별하고, 이모지는 무시한다.

function stripMd(s) {
  return s.replace(/\*\*/g, '').replace(/^>\s?/, '').trim()
}

function splitSections(md) {
  const lines = md.split(/\r?\n/)
  const sections = []
  let current = { title: '__head__', lines: [] }
  for (const line of lines) {
    const m = line.match(/^#\s+(.*)/)
    if (m) {
      sections.push(current)
      current = { title: m[1].trim(), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  sections.push(current)
  return sections
}

function splitSubsections(lines) {
  const subs = []
  let current = null
  for (const line of lines) {
    const m = line.match(/^##\s+(.*)/)
    if (m) {
      if (current) subs.push(current)
      current = { title: m[1].trim(), lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) subs.push(current)
  return subs
}

// "### 제목" 아래 다음 ###까지의 본문을 맵으로 수집
function fieldMap(lines) {
  const map = {}
  let key = null
  for (const line of lines) {
    const m = line.match(/^###\s+(.*)/)
    if (m) {
      key = m[1].trim()
      map[key] = []
    } else if (key) {
      map[key].push(line)
    }
  }
  return map
}

function firstText(fieldLines) {
  if (!fieldLines) return null
  for (const l of fieldLines) {
    const t = stripMd(l)
    if (t && !t.startsWith('|') && !t.startsWith('-')) return t
  }
  return null
}

function allText(fieldLines) {
  if (!fieldLines) return []
  return fieldLines.map(stripMd).filter((t) => t && !t.startsWith('|'))
}

function bullets(fieldLines) {
  if (!fieldLines) return []
  return fieldLines
    .filter((l) => /^\s*-\s+/.test(l))
    .map((l) => stripMd(l.replace(/^\s*-\s+/, '')))
}

function tableRows(lines, cols, maxCols) {
  const max = maxCols ?? cols
  const rows = []
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
    if (cells.length < cols || cells.length > max) continue
    if (cells.some((c) => /^[-\s:]+$/.test(c))) continue // 구분선
    rows.push(cells)
  }
  return rows.slice(1) // 헤더 제거
}

function findSection(sections, keyword) {
  return sections.find((s) => s.title.includes(keyword))
}

export function parseNote(md) {
  const sections = splitSections(md)
  const head = sections.find((s) => s.title.includes('학습 노트')) || sections[0]

  const meta = { date: null, topic: null }
  for (const line of head.lines) {
    const d = stripMd(line).match(/날짜:\s*(\d{4}-\d{2}-\d{2})/)
    if (d) meta.date = d[1]
    const t = stripMd(line).match(/주제:\s*(.+)/)
    if (t) meta.topic = t[1].trim()
  }

  // 문법
  const grammar = []
  const gSec = findSection(sections, '핵심 문법')
  if (gSec) {
    for (const sub of splitSubsections(gSec.lines)) {
      const f = fieldMap(sub.lines)
      grammar.push({
        pattern: sub.title.replace(/^\d+\.\s*/, ''),
        meaning: allText(f['뜻']).join(' / ') || null,
        conjugations: tableRows(f['형태'] || [], 2, 3).map(([base, form, reading]) => ({
          base,
          form,
          reading: reading || null,
        })),
        example: firstText(f['예문']),
      })
    }
  }

  // 회화
  const dialogues = []
  const dSec = findSection(sections, '배운 회화')
  if (dSec) {
    for (const sub of splitSubsections(dSec.lines)) {
      const f = fieldMap(sub.lines)
      const qLines = f['질문'] || []
      const question = firstText(qLines)
      const translation = qLines.map((l) => l.trim()).filter((l) => l.startsWith('>')).map(stripMd).join(' ') || null
      dialogues.push({
        situation: sub.title.replace(/^상황\s*\d+\.\s*/, ''),
        question,
        translation,
        myAnswer: firstText(f['내가 말한 문장']),
        better: allText(f['더 자연스러운 표현']).filter((t) => t !== '또는'),
        why: allText(f['왜?']).join(' ') || null,
      })
    }
  }

  // 단어
  const words = []
  const wSec = findSection(sections, '배운 단어')
  if (wSec) {
    for (const [jp, reading, ko] of tableRows(wSec.lines, 3)) {
      words.push({ jp, reading, ko })
    }
  }

  // 한자
  const kanji = []
  const kSec = findSection(sections, '한자 공부')
  if (kSec) {
    for (const sub of splitSubsections(kSec.lines)) {
      const f = fieldMap(sub.lines)
      const m = sub.title.match(/^(\S+?)（(.+?)）/)
      kanji.push({
        char: m ? m[1] : sub.title,
        reading: m ? m[2] : null,
        koreanHanja: firstText(f['한국 한자']),
        koreanSound: firstText(f['한국 한자음']),
        onyomi: firstText(f['음독']),
        kunyomi: firstText(f['훈독']),
        radical: firstText(f['부수']),
        related: bullets(f['관련 단어']),
        mnemonic: firstText(f['암기 팁(학습용)'] || f['암기 팁']),
      })
    }
  }

  // 교과서 vs 실제 회화
  const naturalPairs = []
  const nSec = findSection(sections, '더 많이 쓰는 표현')
  if (nSec) {
    for (const [textbook, natural] of tableRows(nSec.lines, 2)) {
      naturalPairs.push({ textbook, natural })
    }
  }

  // 복습 문장
  const reviewSentences = []
  const rSec = findSection(sections, '복습 문장')
  if (rSec) {
    for (const line of rSec.lines) {
      const t = stripMd(line)
      if (!t || /^[①-⑳]$/.test(t) || t === '---') continue
      reviewSentences.push(t.replace(/^[①-⑳]\s*/, ''))
    }
  }

  // 학습 기록
  const record = { level: null, nextGrammar: [], nextTopics: [] }
  const pSec = findSection(sections, '학습 기록')
  if (pSec) {
    const subs = splitSubsections(pSec.lines)
    for (const sub of subs) {
      if (sub.title.includes('현재 예상 수준')) record.level = firstText(sub.lines)
      if (sub.title.includes('다음 추천 문법')) record.nextGrammar = bullets(sub.lines)
      if (sub.title.includes('다음 회화 주제')) record.nextTopics = bullets(sub.lines)
    }
  }

  const ok = words.length > 0 || grammar.length > 0 || dialogues.length > 0
  return {
    ok,
    session: {
      id: meta.date || new Date().toISOString().slice(0, 10),
      date: meta.date,
      topic: meta.topic,
      level: record.level,
      nextGrammar: record.nextGrammar,
      nextTopics: record.nextTopics,
      counts: {
        words: words.length,
        grammar: grammar.length,
        kanji: kanji.length,
        dialogues: dialogues.length,
      },
    },
    grammar,
    dialogues,
    words,
    kanji,
    naturalPairs,
    reviewSentences,
  }
}
