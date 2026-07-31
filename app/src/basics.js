// 내장 기본기 은행 — 임포트한 노트와 별개로 매일 새 항목이 배정된다.
// JLPT N5 수준의 핵심 단어와 동사 활용.

export const NEW_WORDS_PER_DAY = 5
export const NEW_VERBS_PER_DAY = 2

export const BASIC_WORDS = [
  { jp: '水', reading: 'みず', ko: '물' },
  { jp: '人', reading: 'ひと', ko: '사람' },
  { jp: '時間', reading: 'じかん', ko: '시간' },
  { jp: '今日', reading: 'きょう', ko: '오늘' },
  { jp: '明日', reading: 'あした', ko: '내일' },
  { jp: '昨日', reading: 'きのう', ko: '어제' },
  { jp: '朝', reading: 'あさ', ko: '아침' },
  { jp: '昼', reading: 'ひる', ko: '낮/점심' },
  { jp: '夜', reading: 'よる', ko: '밤' },
  { jp: '食べ物', reading: 'たべもの', ko: '음식' },
  { jp: '電車', reading: 'でんしゃ', ko: '전철' },
  { jp: '車', reading: 'くるま', ko: '자동차' },
  { jp: '家', reading: 'いえ', ko: '집' },
  { jp: '学校', reading: 'がっこう', ko: '학교' },
  { jp: '会社', reading: 'かいしゃ', ko: '회사' },
  { jp: '店', reading: 'みせ', ko: '가게' },
  { jp: 'お金', reading: 'おかね', ko: '돈' },
  { jp: '本', reading: 'ほん', ko: '책' },
  { jp: '手', reading: 'て', ko: '손' },
  { jp: '目', reading: 'め', ko: '눈(신체)' },
  { jp: '友達', reading: 'ともだち', ko: '친구' },
  { jp: '先生', reading: 'せんせい', ko: '선생님' },
  { jp: '日本', reading: 'にほん', ko: '일본' },
  { jp: '韓国', reading: 'かんこく', ko: '한국' },
  { jp: '言葉', reading: 'ことば', ko: '말/언어' },
  { jp: '名前', reading: 'なまえ', ko: '이름' },
  { jp: '電話', reading: 'でんわ', ko: '전화' },
  { jp: '写真', reading: 'しゃしん', ko: '사진' },
  { jp: '部屋', reading: 'へや', ko: '방' },
  { jp: '天気', reading: 'てんき', ko: '날씨' },
  { jp: '雨', reading: 'あめ', ko: '비' },
  { jp: '雪', reading: 'ゆき', ko: '눈(날씨)' },
  { jp: '空港', reading: 'くうこう', ko: '공항' },
  { jp: '切符', reading: 'きっぷ', ko: '표/티켓' },
  { jp: '荷物', reading: 'にもつ', ko: '짐' },
  { jp: '道', reading: 'みち', ko: '길' },
  { jp: '右', reading: 'みぎ', ko: '오른쪽' },
  { jp: '左', reading: 'ひだり', ko: '왼쪽' },
  { jp: '前', reading: 'まえ', ko: '앞' },
  { jp: '後ろ', reading: 'うしろ', ko: '뒤' },
  { jp: '上', reading: 'うえ', ko: '위' },
  { jp: '下', reading: 'した', ko: '아래' },
  { jp: '中', reading: 'なか', ko: '안/속' },
  { jp: '外', reading: 'そと', ko: '밖' },
  { jp: '大きい', reading: 'おおきい', ko: '크다' },
  { jp: '小さい', reading: 'ちいさい', ko: '작다' },
  { jp: '高い', reading: 'たかい', ko: '비싸다/높다' },
  { jp: '安い', reading: 'やすい', ko: '싸다' },
  { jp: '新しい', reading: 'あたらしい', ko: '새롭다' },
  { jp: '古い', reading: 'ふるい', ko: '오래되다' },
  { jp: '早い', reading: 'はやい', ko: '이르다/빠르다' },
  { jp: '遅い', reading: 'おそい', ko: '늦다' },
  { jp: '暑い', reading: 'あつい', ko: '덥다' },
  { jp: '寒い', reading: 'さむい', ko: '춥다' },
  { jp: 'おいしい', reading: 'おいしい', ko: '맛있다' },
  { jp: '楽しい', reading: 'たのしい', ko: '즐겁다' },
  { jp: '好き', reading: 'すき', ko: '좋아함' },
  { jp: '嫌い', reading: 'きらい', ko: '싫어함' },
  { jp: '元気', reading: 'げんき', ko: '건강함/기운참' },
  { jp: '静か', reading: 'しずか', ko: '조용함' },
]

export const FORM_LABELS = {
  masu: 'ます형(정중형)',
  te: 'て형(연결)',
  nai: 'ない형(부정)',
  ta: 'た형(과거)',
}

export const BASIC_VERBS = [
  {
    base: '行く', reading: 'いく', ko: '가다',
    forms: {
      masu: { f: '行きます', r: 'いきます' },
      te: { f: '行って', r: 'いって' },
      nai: { f: '行かない', r: 'いかない' },
      ta: { f: '行った', r: 'いった' },
    },
  },
  {
    base: '食べる', reading: 'たべる', ko: '먹다',
    forms: {
      masu: { f: '食べます', r: 'たべます' },
      te: { f: '食べて', r: 'たべて' },
      nai: { f: '食べない', r: 'たべない' },
      ta: { f: '食べた', r: 'たべた' },
    },
  },
  {
    base: '飲む', reading: 'のむ', ko: '마시다',
    forms: {
      masu: { f: '飲みます', r: 'のみます' },
      te: { f: '飲んで', r: 'のんで' },
      nai: { f: '飲まない', r: 'のまない' },
      ta: { f: '飲んだ', r: 'のんだ' },
    },
  },
  {
    base: '見る', reading: 'みる', ko: '보다',
    forms: {
      masu: { f: '見ます', r: 'みます' },
      te: { f: '見て', r: 'みて' },
      nai: { f: '見ない', r: 'みない' },
      ta: { f: '見た', r: 'みた' },
    },
  },
  {
    base: 'する', reading: 'する', ko: '하다',
    forms: {
      masu: { f: 'します', r: 'します' },
      te: { f: 'して', r: 'して' },
      nai: { f: 'しない', r: 'しない' },
      ta: { f: 'した', r: 'した' },
    },
  },
  {
    base: '来る', reading: 'くる', ko: '오다',
    forms: {
      masu: { f: '来ます', r: 'きます' },
      te: { f: '来て', r: 'きて' },
      nai: { f: '来ない', r: 'こない' },
      ta: { f: '来た', r: 'きた' },
    },
  },
  {
    base: '買う', reading: 'かう', ko: '사다',
    forms: {
      masu: { f: '買います', r: 'かいます' },
      te: { f: '買って', r: 'かって' },
      nai: { f: '買わない', r: 'かわない' },
      ta: { f: '買った', r: 'かった' },
    },
  },
  {
    base: '話す', reading: 'はなす', ko: '말하다',
    forms: {
      masu: { f: '話します', r: 'はなします' },
      te: { f: '話して', r: 'はなして' },
      nai: { f: '話さない', r: 'はなさない' },
      ta: { f: '話した', r: 'はなした' },
    },
  },
  {
    base: '読む', reading: 'よむ', ko: '읽다',
    forms: {
      masu: { f: '読みます', r: 'よみます' },
      te: { f: '読んで', r: 'よんで' },
      nai: { f: '読まない', r: 'よまない' },
      ta: { f: '読んだ', r: 'よんだ' },
    },
  },
  {
    base: '書く', reading: 'かく', ko: '쓰다',
    forms: {
      masu: { f: '書きます', r: 'かきます' },
      te: { f: '書いて', r: 'かいて' },
      nai: { f: '書かない', r: 'かかない' },
      ta: { f: '書いた', r: 'かいた' },
    },
  },
  {
    base: '待つ', reading: 'まつ', ko: '기다리다',
    forms: {
      masu: { f: '待ちます', r: 'まちます' },
      te: { f: '待って', r: 'まって' },
      nai: { f: '待たない', r: 'またない' },
      ta: { f: '待った', r: 'まった' },
    },
  },
  {
    base: '帰る', reading: 'かえる', ko: '돌아가다',
    forms: {
      masu: { f: '帰ります', r: 'かえります' },
      te: { f: '帰って', r: 'かえって' },
      nai: { f: '帰らない', r: 'かえらない' },
      ta: { f: '帰った', r: 'かえった' },
    },
  },
]
