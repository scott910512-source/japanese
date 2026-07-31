import { wrongRate } from './srs.js'
import { latestSession } from './storage.js'

// 복습 결과를 반영한 "다음 학습 프롬프트" 생성 — 앱의 핵심 아웃풋.
export function generatePrompt(data) {
  const last = latestSession(data)

  const weakWords = data.words
    .filter((w) => w.srs.wrong > 0 && wrongRate(w.srs) >= 0.4)
    .slice(0, 8)
  const weakGrammar = data.grammar
    .filter((g) => g.srs && g.srs.wrong > 0 && wrongRate(g.srs) >= 0.4)
    .slice(0, 4)

  const nextGrammar = last?.nextGrammar?.[0] || '～てもいいですか'
  const nextTopic = last?.nextTopics?.[0] || '전철역에서 표 사기'

  const lines = []
  lines.push('너는 친절한 일본어 회화 선생님이야. 아래 조건으로 오늘 수업을 진행해줘.')
  lines.push('')
  lines.push(`[내 현재 수준] ${last?.level || 'JLPT N5'}`)
  if (last) {
    lines.push(`[지난 학습] ${last.topic || last.id}`)
  }

  if (weakWords.length || weakGrammar.length) {
    lines.push('')
    lines.push('[취약 항목 — 오늘 수업에 자연스럽게 섞어서 복습시켜줘]')
    for (const w of weakWords) {
      lines.push(`- 단어: ${w.jp}（${w.reading}） ${w.ko} — 오답률 ${Math.round(wrongRate(w.srs) * 100)}%`)
    }
    for (const g of weakGrammar) {
      lines.push(`- 문법: ${g.pattern} (${g.meaning || ''})`)
    }
  }

  lines.push('')
  lines.push(`[오늘 새로 배울 문법] ${nextGrammar}`)
  lines.push(`[오늘 회화 주제] ${nextTopic}`)
  lines.push('')
  lines.push('[진행 방식]')
  lines.push('1. 새 문법을 예문 3개와 함께 설명해줘.')
  lines.push('2. 회화 주제로 역할극을 하자. 네가 상대 역할을 맡고, 내 문장을 교정해줘.')
  lines.push('3. 교정할 때는 "더 자연스러운 표현"과 "왜 그런지"를 꼭 알려줘.')
  lines.push('')
  lines.push('[수업이 끝나면] 오늘 배운 내용을 아래 표준 노트 템플릿 형식 그대로 마크다운으로 정리해줘.')
  lines.push('섹션 제목과 표 형식을 바꾸지 말고, 해당 없는 섹션은 생략해도 돼.')
  lines.push('')
  lines.push(TEMPLATE)
  return lines.join('\n')
}

const TEMPLATE = `--- 표준 노트 템플릿 ---
# 🇯🇵 일본어 학습 노트
> **날짜:** YYYY-MM-DD
> **주제:** (오늘의 주제)

# 📌 오늘의 핵심 문법
## 1. (문법 패턴)
### 뜻
> (한국어 뜻)
### 형태
| 기본형 | 조건형 |
|--------|--------|
| (동사) | (활용형) |
### 예문
(대표 예문)

# 💬 오늘 배운 회화
## 상황 1. (상황 이름)
### 질문
**(상대의 질문)**
> (한국어 해석)
### 내가 말한 문장
**(내 답변)**
### 더 자연스러운 표현
**(교정된 표현)**
### 왜?
(이유)

# 📖 오늘 배운 단어
| 일본어 | 읽기 | 뜻 |
|--------|------|-----|
| (단어) | (히라가나) | (한국어) |

# 🈶 한자 공부
## (한자)（(읽기)）
### 한국 한자
(정자체)
### 한국 한자음
(음)
### 음독
(カタカナ)
### 훈독
(ひらがな)
### 관련 단어
- (단어)（(읽기)） : (뜻)
### 부수
**(부수)**
### 암기 팁(학습용)
(연상 팁)

# ⭐ 일본인이 더 많이 쓰는 표현
| 교과서 | 실제 회화 |
|--------|----------|
| (표현) | (자연스러운 표현) |

# 🔁 복습 문장
①
(문장)

# 📈 학습 기록
## 현재 예상 수준
**(JLPT 레벨)**
## 다음 추천 문법
- (문법)
## 🎯 다음 회화 주제 추천
- (주제)`
