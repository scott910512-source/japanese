// 🎵 노래로 배우기 — 인기 J-POP 5곡의 핵심 단어·문법·표현.
// 저작권 보호를 위해 가사 전문은 싣지 않고, 곡에 등장하는 핵심 어휘와
// 문법 패턴을 자체 제작 예문과 함께 학습한다.

export const SONGS = [
  {
    id: 'bansanka',
    title: '晩餐歌',
    titleKo: '만찬가',
    artist: 'tuki.',
    intro:
      '이별과 사랑의 맛을 저녁 식사에 비유한 발라드. 사랑·감정 표현이 많이 나오는 곡이라 마음을 말하는 어휘를 배우기 좋아요.',
    words: [
      { jp: '晩餐', reading: 'ばんさん', ko: '만찬/저녁 식사' },
      { jp: '歌', reading: 'うた', ko: '노래' },
      { jp: '愛', reading: 'あい', ko: '사랑' },
      { jp: '味', reading: 'あじ', ko: '맛' },
      { jp: '涙', reading: 'なみだ', ko: '눈물' },
      { jp: '幸せ', reading: 'しあわせ', ko: '행복' },
      { jp: '気持ち', reading: 'きもち', ko: '기분/마음' },
      { jp: '最後', reading: 'さいご', ko: '마지막' },
    ],
    grammar: [
      {
        pattern: '～てほしい',
        meaning: '~해 줬으면 좋겠다 (바람)',
        example: 'そばにいてほしい。',
        exampleKo: '곁에 있어 줬으면 좋겠어.',
      },
      {
        pattern: '～ながら',
        meaning: '~하면서 (동시 동작)',
        example: '泣きながら歌を歌った。',
        exampleKo: '울면서 노래를 불렀다.',
      },
    ],
    expressions: [
      { jp: '会いたい', reading: 'あいたい', ko: '보고 싶다' },
      { jp: 'ずっと', reading: 'ずっと', ko: '계속/쭉' },
    ],
  },
  {
    id: 'pretender',
    title: 'Pretender',
    titleKo: '프리텐더',
    artist: 'Official髭男dism',
    intro:
      '이루어질 수 없는 사랑 앞에서 "괜찮은 척"하는 마음을 그린 곡. 연애·운명에 관한 어휘와 아쉬움을 나타내는 문법이 핵심이에요.',
    words: [
      { jp: '嘘', reading: 'うそ', ko: '거짓말' },
      { jp: '恋人', reading: 'こいびと', ko: '연인' },
      { jp: '運命', reading: 'うんめい', ko: '운명' },
      { jp: '心', reading: 'こころ', ko: '마음' },
      { jp: '別れ', reading: 'わかれ', ko: '이별' },
      { jp: '声', reading: 'こえ', ko: '목소리' },
      { jp: '世界', reading: 'せかい', ko: '세계' },
      { jp: '痛い', reading: 'いたい', ko: '아프다' },
    ],
    grammar: [
      {
        pattern: '～たらいいのに',
        meaning: '~라면 좋을 텐데 (이룰 수 없는 바람)',
        example: 'もっと話せたらいいのに。',
        exampleKo: '더 이야기할 수 있다면 좋을 텐데.',
      },
      {
        pattern: '～けど',
        meaning: '~지만 (역접)',
        example: '好きだけど、言えない。',
        exampleKo: '좋아하지만, 말할 수 없어.',
      },
    ],
    expressions: [
      { jp: '運命の人', reading: 'うんめいのひと', ko: '운명의 상대' },
      { jp: 'さよなら', reading: 'さよなら', ko: '안녕(작별)' },
    ],
  },
  {
    id: 'betelgeuse',
    title: 'ベテルギウス',
    titleKo: '베텔기우스',
    artist: 'Yuuri（優里）',
    intro:
      '멀리 있어도 서로를 비추는 별처럼 이어져 있다는 노래. 별·빛·소원 같은 밤하늘 어휘와 기원을 나타내는 문법을 배워요.',
    words: [
      { jp: '星', reading: 'ほし', ko: '별' },
      { jp: '光', reading: 'ひかり', ko: '빛' },
      { jp: '空', reading: 'そら', ko: '하늘' },
      { jp: '願い', reading: 'ねがい', ko: '소원/바람' },
      { jp: '遠い', reading: 'とおい', ko: '멀다' },
      { jp: '繋ぐ', reading: 'つなぐ', ko: '잇다/맞잡다' },
      { jp: '見上げる', reading: 'みあげる', ko: '올려다보다' },
      { jp: '永遠', reading: 'えいえん', ko: '영원' },
    ],
    grammar: [
      {
        pattern: '～ように',
        meaning: '~하기를/~하도록 (기원·목적)',
        example: '星に届くように願った。',
        exampleKo: '별에 닿기를 바랐다.',
      },
      {
        pattern: '～ても',
        meaning: '~해도 (양보)',
        example: '遠くても心は繋がっている。',
        exampleKo: '멀어도 마음은 이어져 있다.',
      },
    ],
    expressions: [
      { jp: '大丈夫', reading: 'だいじょうぶ', ko: '괜찮아' },
      { jp: 'そば', reading: 'そば', ko: '곁/옆' },
    ],
  },
  {
    id: 'suiheisen',
    title: '水平線',
    titleKo: '수평선',
    artist: 'back number',
    intro:
      '여름의 끝, 이루지 못한 것들을 수평선 너머로 떠나보내며 위로하는 곡. 바다·여름 어휘와 "~인 채로" 같은 상태 표현을 배워요.',
    words: [
      { jp: '水平線', reading: 'すいへいせん', ko: '수평선' },
      { jp: '海', reading: 'うみ', ko: '바다' },
      { jp: '波', reading: 'なみ', ko: '파도' },
      { jp: '夏', reading: 'なつ', ko: '여름' },
      { jp: '思い出', reading: 'おもいで', ko: '추억' },
      { jp: '綺麗', reading: 'きれい', ko: '예쁨/깨끗함' },
      { jp: '泣く', reading: 'なく', ko: '울다' },
      { jp: '届く', reading: 'とどく', ko: '닿다/도착하다' },
    ],
    grammar: [
      {
        pattern: '～ままで',
        meaning: '~인 채로 (상태 유지)',
        example: 'その気持ちのままでいい。',
        exampleKo: '그 마음 그대로면 돼.',
      },
      {
        pattern: '～なくても',
        meaning: '~하지 않아도',
        example: '泣かなくてもいいよ。',
        exampleKo: '울지 않아도 돼.',
      },
    ],
    expressions: [
      { jp: '思い出す', reading: 'おもいだす', ko: '떠올리다/기억나다' },
      { jp: 'いつか', reading: 'いつか', ko: '언젠가' },
    ],
  },
  {
    id: 'lemon',
    title: 'Lemon',
    titleKo: '레몬',
    artist: '米津玄師（요네즈 켄시）',
    intro:
      '떠난 사람에 대한 기억을 레몬의 씁쓸한 향에 비유한 국민적 히트곡. 기억·꿈 어휘와 "~했더라면" 가정 표현이 포인트예요.',
    words: [
      { jp: '夢', reading: 'ゆめ', ko: '꿈' },
      { jp: '記憶', reading: 'きおく', ko: '기억' },
      { jp: '影', reading: 'かげ', ko: '그림자' },
      { jp: '雨', reading: 'あめ', ko: '비' },
      { jp: '匂い', reading: 'におい', ko: '냄새/향기' },
      { jp: '忘れる', reading: 'わすれる', ko: '잊다' },
      { jp: '苦い', reading: 'にがい', ko: '(맛이) 쓰다' },
      { jp: '切ない', reading: 'せつない', ko: '애틋하다/먹먹하다' },
    ],
    grammar: [
      {
        pattern: '～ていたら',
        meaning: '~했더라면 (과거 가정)',
        example: 'あの日会えていたら、違ったかな。',
        exampleKo: '그날 만날 수 있었더라면, 달랐을까.',
      },
      {
        pattern: '未だに（いまだに）',
        meaning: '아직도/여전히',
        example: '未だに忘れられない。',
        exampleKo: '아직도 잊을 수 없다.',
      },
    ],
    expressions: [
      { jp: '胸', reading: 'むね', ko: '가슴' },
      { jp: 'あの日', reading: 'あのひ', ko: '그날' },
    ],
  },
]
