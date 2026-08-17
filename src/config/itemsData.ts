export type ZhuazhouItem = {
  id: string;
  name: string;
  meaning: string;
  iconPath: string;
  symbol: string;
  category: string;
  desc: string;
};

const base = import.meta.env.BASE_URL || '/';

export const BABY_AVATAR_IMG = `${base}assets/baby/08.png`;

export const ZHUAZHOU_ITEMS: ZhuazhouItem[] = [
  { id: 'item_01', name: '烏克麗麗', meaning: '音樂家', iconPath: `${base}assets/items/ukulele.svg`, symbol: '🎸', category: 'Arts', desc: '天生音感敏銳，創造動人旋律' },
  { id: 'item_02', name: '相機', meaning: '攝影師', iconPath: `${base}assets/items/camera.svg`, symbol: '📷', category: 'Media', desc: '捕捉世間光影，記錄最美瞬間' },
  { id: 'item_03', name: '放大鏡', meaning: '科學家', iconPath: `${base}assets/items/magnifier.svg`, symbol: '🔬', category: 'Tech', desc: '洞察萬物真理，推動人類認知' },
  { id: 'item_04', name: '算盤', meaning: '商人', iconPath: `${base}assets/items/abacus.svg`, symbol: '🧮', category: 'Business', desc: '精打細算、商業嗅覺敏銳' },
  { id: 'item_05', name: '木車', meaning: '旅行家', iconPath: `${base}assets/items/car.svg`, symbol: '🚗', category: 'Adventure', desc: '放眼全球天地，踏遍壯麗山河' },
  { id: 'item_06', name: '木劍', meaning: '軍警', iconPath: `${base}assets/items/sword.svg`, symbol: '⚔️', category: 'Justice', desc: '英勇正義無畏，保家衛國之士' },
  { id: 'item_07', name: '指南針', meaning: '探險家', iconPath: `${base}assets/items/compass.svg`, symbol: '🧭', category: 'Adventure', desc: '永不迷失方向，開闢未知新境' },
  { id: 'item_08', name: '調色盤', meaning: '藝術家', iconPath: `${base}assets/items/palette.svg`, symbol: '🎨', category: 'Arts', desc: '豐富色彩美學，綻放靈魂畫作' },
  { id: 'item_09', name: '元寶', meaning: '金融家', iconPath: `${base}assets/items/ingot.svg`, symbol: '💰', category: 'Business', desc: '財富運籌帷幄，掌握資本命脈' },
  { id: 'item_10', name: '孫子兵法', meaning: '文學家', iconPath: `${base}assets/items/book.svg`, symbol: '📜', category: 'Academia', desc: '滿腹經綸智謀，著書立說傳世' },
  { id: 'item_11', name: '印章', meaning: '領導者', iconPath: `${base}assets/items/stamp.svg`, symbol: '👑', category: 'Leadership', desc: '一諾千金領袖，掌握核心決策' },
  { id: 'item_12', name: '橄欖球', meaning: '運動員', iconPath: `${base}assets/items/rugby.svg`, symbol: '🏉', category: 'Sports', desc: '體魄強健熱血，勇奪榮耀金牌' },
  { id: 'item_13', name: '黑板', meaning: '教師', iconPath: `${base}assets/items/blackboard.svg`, symbol: '👨‍🏫', category: 'Academia', desc: '春風化雨傳承，啟迪後輩英才' },
  { id: 'item_14', name: '波浪鼓', meaning: '自由業', iconPath: `${base}assets/items/drum.svg`, symbol: '🥁', category: 'Creative', desc: '無拘無束自由，樂活自在人生' },
  { id: 'item_15', name: '法槌', meaning: '法官律師', iconPath: `${base}assets/items/gavel.svg`, symbol: '⚖️', category: 'Justice', desc: '秉持公正法治，明辨是非公理' },
  { id: 'item_16', name: '積木', meaning: '工程師', iconPath: `${base}assets/items/blocks.svg`, symbol: '🏗️', category: 'Tech', desc: '巧手建構架構，打造未來世界' },
];

export const BABY_STICKERS = [
  {
    id: 'sticker_01',
    name: '啾咪',
    tag: '啾咪 💋',
    description: '嘟嘟嘴送愛心！幸福滿滿',
    image: `${base}assets/baby/07.png`,
    rawFile: `${base}assets/baby/07.png`,
  },
  {
    id: 'sticker_02',
    name: '嘿嘿',
    tag: '嘿嘿 😜',
    description: '俏皮吐舌頭！萌翻全場',
    image: `${base}assets/baby/01.png`,
    rawFile: `${base}assets/baby/01.png`,
  },
  {
    id: 'sticker_03',
    name: '開心',
    tag: '開心！ ✨',
    description: '暖心大笑燦爛！滿滿正能量',
    image: `${base}assets/baby/05.png`,
    rawFile: `${base}assets/baby/05.png`,
  },
];
