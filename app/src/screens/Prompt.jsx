import { useMemo, useState } from 'react'
import { generatePrompt, generateExpansionPrompt } from '../promptGen.js'

export default function Prompt({ data }) {
  const [kind, setKind] = useState('lesson') // lesson | expand
  const prompt = useMemo(
    () => (kind === 'lesson' ? generatePrompt(data) : generateExpansionPrompt(data)),
    [data, kind],
  )
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 미지원 환경 — 사용자가 직접 선택 복사
    }
  }

  return (
    <div className="screen">
      <h1 className="page-title">✨ 프롬프트 생성</h1>

      <div className="seg-row">
        <button
          className={`seg-btn ${kind === 'lesson' ? 'active' : ''}`}
          onClick={() => setKind('lesson')}
        >
          📚 다음 수업
        </button>
        <button
          className={`seg-btn ${kind === 'expand' ? 'active' : ''}`}
          onClick={() => setKind('expand')}
        >
          ➕ 문제 확장
        </button>
      </div>

      <p className="desc">
        {kind === 'lesson'
          ? '복습 결과(취약 단어·추천 문법·추천 주제)가 반영된 다음 수업용 프롬프트입니다. AI에게 붙여넣으면 수업이 시작되고, 결과 노트를 다시 임포트하면 루프가 이어집니다.'
          : '지금까지의 학습 로그 전체를 담은 프롬프트입니다. AI에게 붙여넣으면 배운 내용만으로 새 연습 문제 세트를 표준 노트 형식으로 만들어주고, 그걸 다시 임포트하면 문제가 확장됩니다.'}
      </p>

      <button className="btn-primary" onClick={copy}>
        {copied ? '복사 완료! ✅' : '📋 프롬프트 복사하기'}
      </button>
      <pre className="prompt-box">{prompt}</pre>
    </div>
  )
}
