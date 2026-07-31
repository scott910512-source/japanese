import { useMemo, useState } from 'react'
import { generatePrompt } from '../promptGen.js'

export default function Prompt({ data }) {
  const prompt = useMemo(() => generatePrompt(data), [data])
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
      <h1 className="page-title">✨ 다음 학습 프롬프트</h1>
      <p className="desc">
        복습 결과(취약 단어·추천 문법·추천 주제)가 반영된 프롬프트입니다. 복사해서 AI에게
        붙여넣으면 다음 수업이 시작되고, 수업 결과 노트를 다시 임포트하면 루프가 이어집니다.
      </p>
      <button className="btn-primary" onClick={copy}>
        {copied ? '복사 완료! ✅' : '📋 프롬프트 복사하기'}
      </button>
      <pre className="prompt-box">{prompt}</pre>
    </div>
  )
}
