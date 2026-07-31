import { useState } from 'react'
import { parseNote } from '../parser.js'
import { importParsed } from '../storage.js'
import { SAMPLE_NOTE } from '../sampleNote.js'

export default function Import({ data, setData, go }) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState(null)

  const doParse = (src) => {
    const parsed = parseNote(src)
    setPreview(parsed)
  }

  const doSave = () => {
    setData(importParsed(data, preview))
    setPreview(null)
    setText('')
    go('home')
  }

  return (
    <div className="screen">
      <h1 className="page-title">📥 노트 임포트</h1>
      <p className="desc">
        AI와 학습한 표준 포맷 노트(마크다운)를 붙여넣으면 플래시카드·문법·한자 카드로 자동
        변환됩니다.
      </p>

      {!preview && (
        <>
          <textarea
            className="paste-area"
            placeholder="# 🇯🇵 일본어 학습 노트 ... 를 여기에 붙여넣기"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn-primary" onClick={() => doParse(text)} disabled={!text.trim()}>
            파싱하기
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setText(SAMPLE_NOTE)
              doParse(SAMPLE_NOTE)
            }}
          >
            샘플 노트로 체험하기 (7/31 길 묻기 & 카페)
          </button>
        </>
      )}

      {preview && !preview.ok && (
        <div className="card warn">
          <p>노트를 인식하지 못했어요. 표준 템플릿 형식인지 확인해 주세요.</p>
          <button className="btn-secondary" onClick={() => setPreview(null)}>
            다시 붙여넣기
          </button>
        </div>
      )}

      {preview && preview.ok && (
        <div className="preview">
          <div className="card">
            <div className="card-title">파싱 결과 미리보기</div>
            <div className="preview-meta">
              <b>{preview.session.date}</b> · {preview.session.topic}
            </div>
            <ul className="preview-list">
              <li>📖 단어 {preview.words.length}개</li>
              <li>📌 문법 {preview.grammar.length}개 — {preview.grammar.map((g) => g.pattern).join(', ')}</li>
              <li>🈶 한자 {preview.kanji.length}자 — {preview.kanji.map((k) => k.char).join(', ')}</li>
              <li>💬 회화 상황 {preview.dialogues.length}개</li>
              <li>⭐ 자연스러운 표현 쌍 {preview.naturalPairs.length}개</li>
              <li>🔁 복습 문장 {preview.reviewSentences.length}개</li>
            </ul>
          </div>
          {preview.words.length > 0 && (
            <div className="card">
              <div className="card-title">단어 카드</div>
              <table className="word-table">
                <tbody>
                  {preview.words.map((w) => (
                    <tr key={w.jp}>
                      <td className="jp">{w.jp}</td>
                      <td>{w.reading}</td>
                      <td>{w.ko}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className="btn-primary" onClick={doSave}>
            저장하고 홈으로
          </button>
          <button className="btn-secondary" onClick={() => setPreview(null)}>
            취소
          </button>
        </div>
      )}
    </div>
  )
}
