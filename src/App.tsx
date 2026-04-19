import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Stethoscope, ArrowRight, Search, Users, Zap, MousePointerClick, ChevronRight, Share2, Sparkles, Pill, X, ExternalLink, AlertTriangle, Heart, ShieldAlert, Skull, ShieldCheck } from 'lucide-react';

type Step = 'home' | 'onboarding' | 'game' | 'result';
type Instinct = 'investigate' | 'ask' | 'intuition' | 'action';

type Dimension = { caution: number, rational: number, skeptic: number, independent: number };
type CaseOption = { text: string, dims: Dimension };
type Evidence = { id: string, label: string, content: string };

type Case = {
  patientName: string;
  age: number;
  occupation: string;
  type: string;
  severity: string;
  symptom: string;
  evidence: Evidence[];
  options: CaseOption[];
  difficulty?: 'normal' | 'severe';
  hint?: string;
  eliminatedOptionIndex?: number;
};

const INSTINCT_MAP: Record<Instinct, { label: string, desc: string, icon: any }> = {
  investigate: { label: '馬上查證', desc: '先 Google 再說', icon: Search },
  ask: { label: '問別人意見', desc: '傳給朋友確認', icon: Users },
  intuition: { label: '憑感覺判斷', desc: '感覺怪就不理', icon: Zap },
  action: { label: '先行動再想', desc: '點了再說', icon: MousePointerClick }
};

const CASES: Case[] = [
  {
    patientName: '王大明', age: 65, occupation: '退休廚師',
    type: 'AI 變聲詐騙', severity: '極高風險',
    symptom: '病患半夜被送來急診，心跳飆高、全身發抖。他拿著手機說：「我剛接到我弟電話，他哭著說出車禍撞到人，對方要10萬現金和解，背景還有警察的聲音...我要趕快去匯款救人！」',
    evidence: [
      { id: 'e1', label: '通話紀錄', content: '無顯示號碼，時間是深夜 11:00。' },
      { id: 'e2', label: '病患描述', content: '「聲音真的很像我弟，還有哭聲，不可能有假！」' },
      { id: 'e3', label: '背景音分析', content: '警察的對講機聲音聽起來像重複播放的罐頭音效。' }
    ],
    options: [
        { text: '「請病患立刻掛掉，直接用另一支手機打給弟弟確認人在哪。」', dims: {caution:2,rational:1,skeptic:2,independent:1} },
        { text: '「請病患問對方『你現在在哪裡、旁邊有誰』，用只有真弟弟才知道的問題測試。」', dims: {caution:1,rational:2,skeptic:2,independent:1} },
        { text: '「這攸關人命，請他趕快問對方帳號，先匯一筆過去救人再說！」', dims: {caution:0,rational:0,skeptic:0,independent:0} },
        { text: '「覺得聲音不太對，但還是先建議他打給媽媽或家裡長輩確認看看。」', dims: {caution:1,rational:1,skeptic:1,independent:0} }
    ],
    difficulty: 'severe',
    hint: 'ScamAdviser 資料庫比對：AI 變聲詐騙 92% 伴隨「深夜時段 + 罐頭背景音 + 要求緊急匯款」三特徵。證據 e3（罐頭警察對講機）是本案決定性線索，優先採信。',
    eliminatedOptionIndex: 2
  },
  {
    patientName: '林美玲', age: 48, occupation: '會計',
    type: '假投資 LINE 群', severity: '極高風險',
    symptom: '掛號單寫著「長期失眠」。她給你看一個 LINE 畫面：「這是朋友拉我進去的『AI教父黃仁勳內部投資群』，裡面 200 人每天曬對帳單，朋友上週說賺了 8000 元。我好心動，該跟單嗎？」',
    evidence: [
      { id: 'e1', label: '群組截圖', content: '群組名稱有「飆股」、「內部」、「黃仁勳」等字眼。' },
      { id: 'e2', label: '對帳單分析', content: '曬出的對帳單格式過於統一，且獲利數字不合理的高。' },
      { id: 'e3', label: '朋友說詞', content: '「老師報的牌週週翻倍，你信我準沒錯。」' }
    ],
    options: [
      { text: '「請她直接退群，這種東西一看就知道是詐騙。」', dims: {caution:2,rational:1,skeptic:2,independent:2} },
      { text: '「建議她先觀望，看群裡的人到底有沒有真的在賺錢，不要急著下決定。」', dims: {caution:1,rational:1,skeptic:1,independent:0} },
      { text: '「告訴她投個一兩千塊測試看看，小錢無所謂當作買經驗。」', dims: {caution:0,rational:0,skeptic:0,independent:0} },
      { text: '「建議她去搜尋這個群組有沒有被爆料或被警政署標記，再決定要不要留。」', dims: {caution:1,rational:2,skeptic:2,independent:1} }
    ]
  },
  {
    patientName: '陳志豪', age: 24, occupation: '大學生',
    type: '假物流簡訊', severity: '高風險',
    symptom: '他拿著手機衝進來：「我最近確實有在等一個網購包裹！剛剛收到『黑貓宅急便』簡訊說地址不詳無法投遞，叫我 24 小時內點連結更新資料，不然要退件了。我很怕包裹被退！」',
    evidence: [
      { id: 'e1', label: '簡訊內容', content: '「您有一件包裹因地址不詳無法投遞，請在24小時內點擊連結...」' },
      { id: 'e2', label: '網址分析', content: '連結結尾是奇怪的 .vip 或 .xyz，不是官方的 .com.tw。' },
      { id: 'e3', label: '寄件人號碼', content: '來自 +886 或境外號碼，非常奇怪。' }
    ],
    options: [
      { text: '「請他先點擊看看，既然有在等包裹，確認一下也無妨。」', dims: {caution:0,rational:0,skeptic:0,independent:0} },
      { text: '「嚴禁他點連結！請他直接去黑貓官網用當初的單號查詢。」', dims: {caution:2,rational:2,skeptic:2,independent:2} },
      { text: '「看他不知所措，你幫他把簡訊轉傳給你其他同事問問看這是不是詐騙。」', dims: {caution:1,rational:1,skeptic:1,independent:0} },
      { text: '「感覺怪怪的，建議他直接刪掉，到時候如果真的有包裹物流士自然會再打來。」', dims: {caution:2,rational:0,skeptic:2,independent:2} }
    ]
  },
  {
    patientName: '張雅婷', age: 28, occupation: '待業中',
    type: '假求職陷阱', severity: '高風險',
    symptom: '她在急診室門口來回踱步，看起來很焦慮：「我在 104 看到社群小編月薪 45K，完全遠端。今天投履歷馬上錄取，但 HR 說要先繳 3000 元『設備保證金』，下個月會加倍返還...」',
    evidence: [
      { id: 'e1', label: '職缺描述', content: '「社群小編，月薪45K，完全遠端，每天只需發1小時限動。」條件好得不現實。' },
      { id: 'e2', label: '錄取過程', content: '投了履歷當天就錄取，沒有任何正式的面試流程。' },
      { id: 'e3', label: '匯款要求', content: '「設備保證金」需匯入一個個人帳戶，並非公司帳戶。' }
    ],
    options: [
      { text: '「3000 元不多，請她先繳了再說，這種遠端工作機會難得。」', dims: {caution:0,rational:0,skeptic:0,independent:0} },
      { text: '「請她要求對方先簽合約、提供公司統編，確認一切合法後再談保證金。」', dims: {caution:2,rational:2,skeptic:1,independent:1} },
      { text: '「建議她去 Dcard 和 PTT 搜尋這家公司的評價，看看有沒有被爆料過。」', dims: {caution:1,rational:2,skeptic:2,independent:1} },
      { text: '「告訴她正規公司絕不會要求求職者先繳保證金，請她直接封鎖不回覆。」', dims: {caution:2,rational:1,skeptic:2,independent:2} }
    ],
    difficulty: 'severe',
    hint: 'ScamAdviser 資料庫比對：要求求職者先繳「設備費 / 保證金」的職缺 97% 為詐騙；台灣《就業服務法》第 5 條亦明文禁止。匯款到個人帳戶（非公司統編帳戶）為決定性紅旗。',
    eliminatedOptionIndex: 0
  },
  {
    patientName: '吳宗恩', age: 35, occupation: '工程師',
    type: '假公益募款', severity: '中風險',
    symptom: '他滑著 IG 滿臉疑惑：「颱風剛過，我追蹤很久、有 30 萬粉而且有藍勾勾的網紅在幫受災戶募款。底下 5000 多則留言都在刷『已捐』。我也很想幫忙，該直接匯款嗎？」',
    evidence: [
      { id: 'e1', label: '網紅帳號', content: '雖然有藍勾勾，但近期貼文風格大變，疑似被盜號。' },
      { id: 'e2', label: '募款資訊', content: '沒有提供衛福部核准的勸募字號。' },
      { id: 'e3', label: '留言分析', content: '5000 多則留言有很多罐頭訊息或假帳號特徵。' }
    ],
    options: [
      { text: '「既然這麼多人捐了，網紅也有藍勾勾，應該是真的，請他放心捐。」', dims: {caution:0,rational:0,skeptic:0,independent:0} },
      { text: '「建議他先去搜尋這個募款活動是否有新聞媒體報導或衛福部核准字號。」', dims: {caution:1,rational:2,skeptic:2,independent:1} },
      { text: '「勸他如果不確定就什麼都別做，等看看政府或其他更可信的公益團體管道。」', dims: {caution:2,rational:1,skeptic:1,independent:1} },
      { text: '「建議他直接私訊那個網紅本人或經紀公司，再次確認這個活動的合法性。」', dims: {caution:1,rational:1,skeptic:1,independent:2} }
    ]
  }
];

const SCAM_ADV_URL = 'https://www.scamadviser.com';

const PERSONALITIES = [
  {
    id: 'analyst', title: '冷血分析師', typeShort: '理性×懷疑×獨立', rank: '防詐免疫 VIP', rankColor: 'text-[#38A169]',
    v1: 'S+', v1c: 'text-[#38A169]', v2: 'A', v2c: 'text-[#38A169]', v3: '鐵甲型', v3c: 'text-[#38A169]',
    stampClass: 'border-[#38A169] text-[#38A169]', stampText: '免疫\n出院',
    remark: '每封可疑郵件都要查網域，每通電話都要先掛掉再回撥。家人覺得你很煩，詐騙集團覺得你很無聊，但你的帳戶從來沒少過任何一分錢。',
    weaknesses: ['過度自信的盲點', '家人中招時的延遲反應', 'AI 新型變種話術'],
    prescription: '頒發「家庭防詐疫苗接種員」證書',
    prescriptionDesc: '體質優良到連詐騙集團都懶得跟你浪費話術。建議每週到 ScamAdviser 首頁巡一下最新詐騙案例，保持戰鬥力；順手把這張診斷書轉發給家中那位相信「一天十顆酪梨會瘦」的阿姨，她比你更需要。還不服氣？下方「重新實習」歡迎挑戰下一回合。',
    primaryCta: { label: '前往 ScamAdviser 查看最新詐騙案例', url: SCAM_ADV_URL }
  },
  {
    id: 'guardian', title: '善良受難者', typeShort: '感性×衝動×信任×從眾', rank: '急救常客', rankColor: 'text-[#DD6B20]',
    v1: 'C-', v1c: 'text-[#DD6B20]', v2: 'D', v2c: 'text-[#E53E3E]', v3: '高危體質', v3c: 'text-[#DD6B20]',
    stampClass: 'border-[#DD6B20] text-[#DD6B20]', stampText: '需要\n住院',
    remark: '你不是笨，你只是太好了。看到有限時特價手會抖，看到人落難就想幫。詐騙集團最愛你這種人。建議每次行動前先深呼吸三秒。',
    weaknesses: ['情緒勒索型詐騙', '假愛情 / 交友陷阱', '假公益募款'],
    prescription: '7 日防詐免疫療程（每日服用，症狀消退前勿停藥）',
    prescriptionDesc: '你不是笨，只是太好了——詐騙集團最愛你這款的。建議立刻裝一個 ScamAdviser 瀏覽器外掛當作防禦機制，讓它在你手滑前幫你喊停；再到 ScamAdviser 首頁翻閱最新詐騙案例，當作心理預防針每日服用。吞完可以按下方「重新實習」複測，看這次會不會少掉一顆愛心。',
    primaryCta: { label: '前往 ScamAdviser 翻閱詐騙案例庫', url: SCAM_ADV_URL }
  },
  {
    id: 'expert', title: '嘴砲專家', typeShort: '理性×衝動×懷疑×從眾', rank: '觀察病例', rankColor: 'text-[#2B6CB0]',
    v1: 'B', v1c: 'text-[#2B6CB0]', v2: 'A-', v2c: 'text-[#2B6CB0]', v3: '知行落差型', v3c: 'text-[#2B6CB0]',
    stampClass: 'border-[#2B6CB0] text-[#2B6CB0]', stampText: '需\n觀察',
    remark: '你知道所有詐騙手法，但真的遇到的時候，你還是會猶豫三秒然後點下去。懂很多但執行力是零，你的腳正踩在知識與行動的鴻溝上。',
    weaknesses: ['假投資 / AI 老師話術', '限時促銷倒數', '專業偽裝身份'],
    prescription: '知識充足，執行力補強 — 隨身急救外掛 1 組',
    prescriptionDesc: '你可以在酒桌上滔滔不絕講 3 小時防詐話術，但真的滑到可疑連結還是會手抖。建議裝一個會在你手滑前幫你叫救命的 ScamAdviser 外掛，再每週去首頁翻閱最新案例維持戰感。下方「重新實習」歡迎你再證明一次自己是嘴砲派還是行動派。',
    primaryCta: { label: '前往 ScamAdviser 看最新詐騙案例', url: SCAM_ADV_URL }
  },
  {
    id: 'hunter', title: '直覺獵人', typeShort: '感性×謹慎×信任×獨立', rank: '急診室熟面孔', rankColor: 'text-[#805AD5]',
    v1: 'B+', v1c: 'text-[#805AD5]', v2: 'C', v2c: 'text-[#DD6B20]', v3: '不穩定型', v3c: 'text-[#805AD5]',
    stampClass: 'border-[#805AD5] text-[#805AD5]', stampText: '觀察\n中',
    remark: '靠感覺行動，有時候比任何人都早發現不對勁，說不出哪裡怪就是怪。但有時候又被騙得莫名其妙，這就是你的直覺雙刃劍。',
    weaknesses: ['高擬真 AI 變聲', '精心設計的釣魚網站', '深層情境式劇本'],
    prescription: '直覺 + 工具雙保險組合（副駕駛同行）',
    prescriptionDesc: '你的直覺很準但不穩定，就像擲骰子。配一個 ScamAdviser 當副駕駛，遇到可疑網址或電話先查一下再相信你的第六感；順手裝一下外掛讓潛意識自動升級。下方按鈕按下去，看看這次你的直覺還夠不夠敏銳。',
    primaryCta: { label: '用 ScamAdviser 檢查網址 / 電話', url: SCAM_ADV_URL }
  },
  {
    id: 'believer', title: '制度信徒', typeShort: '理性×謹慎×信任×從眾', rank: '慢性信任症病友', rankColor: 'text-[#E53E3E]',
    v1: 'B-', v1c: 'text-[#E53E3E]', v2: 'B+', v2c: 'text-[#2B6CB0]', v3: '弱點明確型', v3c: 'text-[#E53E3E]',
    stampClass: 'border-[#E53E3E] text-[#E53E3E]', stampText: '需\n補修',
    remark: '相信官方、相信程序。這讓你在一般情況下非常可靠，但也正因如此，最容易被「假官方」騙。只要穿制服你就信了。',
    weaknesses: ['假公務員 / 假警察', '假銀行 / 假政府通知', '假官方客服電話'],
    prescription: '假官方辨識特訓（含標本辨識 + 查驗指南）',
    prescriptionDesc: '你看到制服就自動點頭，這輩子大概要少看公民課、多逛 ScamAdviser 的詐騙案例庫——那裡面的假警察、假銀行都有標本給你認臉。每次收到「官方」通知前先上去查一下，藥效 5 分鐘內生效。下方「重新實習」等你來證明不再輕易被制服收買。',
    primaryCta: { label: '前往 ScamAdviser 逛假官方案例庫', url: SCAM_ADV_URL }
  },
  {
    id: 'chaos', title: '混沌中立者', typeShort: '感性×衝動×懷疑×獨立', rank: '謎之病例', rankColor: 'text-[#805AD5]',
    v1: 'C+', v1c: 'text-[#805AD5]', v2: 'B-', v2c: 'text-[#805AD5]', v3: '謎型', v3c: 'text-[#805AD5]',
    stampClass: 'border-[#805AD5] text-[#805AD5]', stampText: '特殊\n體質',
    remark: '你的選項完全無法預測。詐騙集團不知怎麼對付你，你自己也不知道。有時候識破詐騙，純粹是因為你懶得點連結而已。',
    weaknesses: ['連你自己也不知道', '運氣用完的那一天', '衝動期的致命一點'],
    prescription: '長期隨機體檢（請做好被驚喜的心理準備）',
    prescriptionDesc: '你的選項連你自己都無法預測，這種體質極稀有。建議每週到 ScamAdviser 做隨機體檢（查幾個你覺得可疑的網址或電話），累積資料讓演算法幫你建檔；附贈外掛當作潛意識副駕駛。下方可以再測一次，反正你也猜不到下次會被診斷成什麼。',
    primaryCta: { label: '做 ScamAdviser 隨機體檢（網址 / 電話）', url: SCAM_ADV_URL }
  }
];

const MAX_HEARTS = 3;
const CONSULT_COST = 25;
const XP_PER_DIM = 5;

type FreqKey = 'daily3' | 'daily4' | 'beforeSleep' | 'singlePack';
type MealKey = 'before' | 'after' | 'any';
type ExternalKey = 'ointment' | 'patch' | 'eye' | 'other';

type MedData = {
  name: string;
  dose: string;
  liquid: string;
  freqChecks: FreqKey[];
  mealChecks: MealKey[];
  special: string;
  boxCount: string;
  externalChecks: ExternalKey[];
  externalNote: string;
};

// 「自我認知對照」：使用者宣告的直覺 vs 實際被診斷的人格，製造反差 / 自嘲哏
const SELF_AWARENESS: Record<Instinct, Record<string, string>> = {
  investigate: {
    analyst: '自我認知 100% 準確——你以為自己是查證派，診斷也證實了。你阿嬤應該很驕傲（雖然也很煩）。',
    guardian: '你以為自己會馬上查證？知道跟做到之間，差了 5 通詐騙電話的距離。',
    expert: '你宣稱會查證，但你的選項顯示——懂很多，手卻慢了一步。',
    hunter: '你說你會查證，結果診斷你是靠直覺吃飯的。查證太慢，你心裡的急性子等不了。',
    believer: '你以為自己會查證，但其實你只信「官方蓋章」過的查證。',
    chaos: '你宣稱會查證，結果選項毫無規律。你可能真的會查證，也可能是心情看看。',
  },
  ask: {
    believer: '自我認知精準——你相信群體的智慧，雖然群體也可能整群是假的。',
    analyst: '你以為會問人，結果是單兵作戰的類型——比你宣告的更冷靜獨立。',
    guardian: '你宣稱會問人，可惜詐騙集團給你看的「朋友」也是假的。',
    expert: '「問人」是你的說法，下意識卻想自己證明自己懂。',
    hunter: '你想問人，實際上最後還是自己靠第六感決定。',
    chaos: '你宣稱會問人，看你答案大概連要問誰都會看心情挑。',
  },
  intuition: {
    hunter: '100% 自我認知——你就是靠直覺吃飯的那掛。準確率不穩但氣場強大。',
    analyst: '你以為自己憑感覺？你的選擇其實極度理性——可能你的直覺就是叫你查證。',
    guardian: '你的直覺告訴你：相信別人。這在別的事上 OK，在防詐上是災難。',
    expert: '你宣稱憑感覺，其實你懂的比你承認的多，只是懶得動。',
    believer: '你的「感覺」比較像是「看誰說的」——權威感就是你的直覺。',
    chaos: '你說你憑感覺，結果你的感覺每題都不一樣。這體質極稀有。',
  },
  action: {
    guardian: '自我認知準到可怕——你真的是手比腦快的類型。詐騙集團統計學最愛你這款。',
    analyst: '你以為自己是先行動派？你的選項顯示你其實一直在觀望。嘴硬派。',
    expert: '你宣稱先行動再想，但你每題都在心裡算了 3 秒。誠實點吧。',
    hunter: '你說先行動，其實行動前你的直覺已經先幫你判斷過了。',
    believer: '你說先行動，但前提是對方要有官方蓋章。你沒你想的那麼衝動。',
    chaos: '你說先行動，結果每次行動都像亂數產生器。或許這就是你的天賦。',
  },
};

const MED_BY_ID: Record<string, MedData> = {
  analyst: {
    name: '過度冷靜錠',
    dose: '500mg × 90 錠（終身劑量）',
    liquid: '30',
    freqChecks: ['daily3', 'singlePack'],
    mealChecks: ['any'],
    special: '任何可疑訊息前請先查網域三次；家人覺得你囉唆是正常副作用。',
    boxCount: '∞',
    externalChecks: ['eye', 'other'],
    externalNote: '請持續監測高危家人，建議每週陪看新聞補強免疫。',
  },
  guardian: {
    name: '良心過剩膠囊',
    dose: '250mg × 30 粒',
    liquid: '50',
    freqChecks: ['daily4', 'beforeSleep'],
    mealChecks: ['before'],
    special: '同情心發作時緊急加服 1 粒，搭配深呼吸十秒效果更佳。',
    boxCount: '3',
    externalChecks: ['patch', 'other'],
    externalNote: '酸痛貼布請貼於手機「立即匯款」鍵前方，阻斷神經反射。',
  },
  expert: {
    name: '知行合一糖漿',
    dose: '100ml × 2 瓶',
    liquid: '100',
    freqChecks: ['singlePack'],
    mealChecks: ['any'],
    special: '點任何連結前 3 秒吞服；嚴禁「先點再說」，謝謝。',
    boxCount: '2',
    externalChecks: ['patch'],
    externalNote: '貼於鍵盤 Enter 鍵附近，每次手癢時自動黏住手指。',
  },
  hunter: {
    name: '第六感維他命',
    dose: '50mg × 60 粒',
    liquid: '—',
    freqChecks: ['singlePack'],
    mealChecks: ['any'],
    special: '直覺警報響起時立即服用；請相信身體，不用懷疑自己。',
    boxCount: '2',
    externalChecks: ['eye'],
    externalNote: '眼藥請睡前點，有助於第六感在夢中自動升級。',
  },
  believer: {
    name: '假官方辨識丸',
    dose: '200mg × 30 粒',
    liquid: '80',
    freqChecks: ['daily3', 'singlePack'],
    mealChecks: ['before'],
    special: '收到「官方」來電前吞服，等藥效發作（約5分鐘）後再回電 165。',
    boxCount: '1',
    externalChecks: ['other'],
    externalNote: '請於手機殼內側貼「先回撥 165」便條紙做為第二道保險。',
  },
  chaos: {
    name: '謎之安慰劑',
    dose: '適量 × 30 粒（可依心情增減）',
    liquid: '適量',
    freqChecks: ['daily3', 'daily4', 'beforeSleep', 'singlePack'],
    mealChecks: ['before', 'after', 'any'],
    special: '服用時機請憑當日心情自行決定；主治亦無法預測療效，祝你好運。',
    boxCount: '若干',
    externalChecks: ['ointment', 'patch', 'eye', 'other'],
    externalNote: '外用用量請自行決定，本院醫師中立不干預。',
  },
};

export default function App() {
  const [step, setStep] = useState<Step>('home');
  const [doctorName, setDoctorName] = useState('');
  const [instinct, setInstinct] = useState<Instinct>('investigate');

  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [dims, setDims] = useState<Dimension>({caution: 0, rational: 0, skeptic: 0, independent: 0});
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [xp, setXp] = useState(0);

  // Demo 捷徑：網址帶 ?p=<人格 id> 直接跳到結算頁
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const forcedId = new URLSearchParams(window.location.search).get('p');
    if (forcedId && PERSONALITIES.find(x => x.id === forcedId)) {
      setDoctorName(prev => prev || '示範醫師');
      setStep('result');
    }
  }, []);

  const handleStartOnboarding = () => setStep('onboarding');

  const handleStartGame = () => {
    if (!doctorName.trim()) setDoctorName('無名醫師');
    setStep('game');
  };

  const handleDiagnosis = (optionDims: Dimension) => {
    setDims(prev => ({
      caution: prev.caution + optionDims.caution,
      rational: prev.rational + optionDims.rational,
      skeptic: prev.skeptic + optionDims.skeptic,
      independent: prev.independent + optionDims.independent,
    }));

    if (currentCaseIndex < CASES.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
    } else {
      setStep('result');
    }
  };

  const spendXp = (amount: number) => setXp(prev => Math.max(0, prev - amount));

  const restart = () => {
    setStep('home');
    setDoctorName('');
    setCurrentCaseIndex(0);
    setDims({caution: 0, rational: 0, skeptic: 0, independent: 0});
    setHearts(MAX_HEARTS);
    setXp(0);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full relative">
        <AnimatePresence mode="wait">
           {step === 'home' && <Home key="home" onStart={handleStartOnboarding} />}
           {step === 'onboarding' && (
             <Onboarding key="onboarding" name={doctorName} setName={setDoctorName} instinct={instinct} setInstinct={setInstinct} onStart={handleStartGame} />
           )}
           {step === 'game' && (
             <Game
               key="game"
               caseData={CASES[currentCaseIndex]}
               caseNumber={currentCaseIndex + 1}
               totalCases={CASES.length}
               doctorName={doctorName}
               instinct={instinct}
               hearts={hearts}
               xp={xp}
               maxHearts={MAX_HEARTS}
               consultCost={CONSULT_COST}
               xpPerDim={XP_PER_DIM}
               onUpdateHearts={setHearts}
               onSpendXp={spendXp}
               onGainXp={(amount: number) => setXp(prev => prev + amount)}
               onDiagnose={handleDiagnosis}
             />
           )}
           {step === 'result' && (
             <Result key="result" dims={dims} userName={doctorName} instinct={instinct} instinctLabel={INSTINCT_MAP[instinct].label} onRestart={restart} />
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Home({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="p-8 flex flex-col items-center text-center space-y-6 bg-white border-[4px] border-[#2C3E50] rounded-[32px] shadow-[10px_10px_0_#A0AEC0] min-h-[500px] justify-center w-full max-w-md mx-auto text-[#2C3E50]"
    >
      <div className="w-20 h-20 bg-[#FF5252] rounded-full border-[4px] border-[#2C3E50] flex items-center justify-center mb-4 shadow-[0_0_15px_#FF5252]">
        <Activity className="w-10 h-10 text-white animate-pulse" />
      </div>
      <h1 className="text-4xl font-black tracking-tight leading-tight">
        人間清醒醫院<br/>
        <span className="text-[#FF5252] text-2xl font-black mt-2 block uppercase tracking-wider">反詐體質門診</span>
      </h1>
      <p className="text-[#4A5568] font-bold text-lg leading-relaxed">
        最近可疑訊息收到手軟嗎？<br/>
        本院為您開辦「反詐體質健檢」，主治 Dr. 清醒<br/>
        全程 5 題情境，完診頒發您的防詐人格證書 + 個人化處方箋。
      </p>
      <button
        onClick={onStart}
        className="w-full bg-[#4FD1C5] text-white border-[3px] border-[#2C3E50] hover:bg-[#38B2AC] hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] font-black text-xl py-4 rounded-[20px] flex items-center justify-center gap-2 mt-8 transition-all"
      >
        <Stethoscope className="w-6 h-6" />
        前往掛號處
      </button>
    </motion.div>
  );
}

function Onboarding({ name, setName, instinct, setInstinct, onStart }: any) {
  const dateStr = useMemo(() => {
    const today = new Date();
    const rocYear = today.getFullYear() - 1911;
    return `${String(rocYear).padStart(3, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  }, []);
  const pseudoId = 'A165165165';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="p-6 md:p-8 flex flex-col min-h-[600px] bg-white border-[4px] border-[#2C3E50] rounded-[32px] shadow-[10px_10px_0_#A0AEC0] w-full max-w-md mx-auto text-[#2C3E50]"
    >
      <div className="flex items-center gap-2 mb-4 bg-[#F0F4F8] self-start px-4 py-2 border-[3px] border-[#2C3E50] rounded-full shadow-[4px_4px_0_#CBD5E0]">
        <div className="w-3 h-3 rounded-full bg-[#FF5252] animate-pulse"></div>
        <span className="text-[#2C3E50] font-black text-sm uppercase tracking-widest">掛號櫃檯 · REGISTRATION</span>
      </div>

      <h2 className="text-2xl font-black mb-2">初診掛號單</h2>
      <p className="text-sm font-bold text-[#718096] mb-5">請出示您的「全民防詐健康保險卡」</p>

      {/* 健保卡 */}
      <div
        className="relative rounded-[18px] border-[3px] border-[#2C3E50] overflow-hidden shadow-[6px_6px_0_#2C3E50] mb-5"
        style={{
          background: 'linear-gradient(135deg, #E0F7FA 0%, #B2DFDB 48%, #A5D6C5 100%)',
          fontFamily: '"PMingLiU", "新細明體", "Microsoft JhengHei", sans-serif',
        }}
      >
        {/* 背景「手牽手」浮水印 */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          <svg viewBox="0 0 100 100" className="w-[65%] h-auto" style={{ opacity: 0.1, color: '#1B4332' }}>
            <g stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* 左邊人 */}
              <circle cx="30" cy="22" r="7" fill="currentColor" />
              <line x1="30" y1="29" x2="30" y2="58" />
              <line x1="30" y1="40" x2="17" y2="52" />
              <line x1="30" y1="40" x2="50" y2="52" />
              <line x1="30" y1="58" x2="23" y2="82" />
              <line x1="30" y1="58" x2="37" y2="82" />
              {/* 右邊人 */}
              <circle cx="70" cy="22" r="7" fill="currentColor" />
              <line x1="70" y1="29" x2="70" y2="58" />
              <line x1="70" y1="40" x2="83" y2="52" />
              <line x1="70" y1="40" x2="50" y2="52" />
              <line x1="70" y1="58" x2="63" y2="82" />
              <line x1="70" y1="58" x2="77" y2="82" />
              {/* 手牽手交會點 */}
              <circle cx="50" cy="52" r="2.5" fill="currentColor" stroke="none" />
            </g>
          </svg>
        </div>

        {/* Header row */}
        <div className="relative flex items-center gap-2 px-3 pt-3 pb-2">
          <div className="w-11 h-11 rounded-full bg-white border-[2px] border-[#1B4332] flex items-center justify-center shrink-0 shadow-sm">
            <div className="text-[#1B4332] font-black text-xl leading-none">H</div>
          </div>
          <div className="leading-tight">
            <div className="font-black text-[17px] text-[#1B4332] tracking-[2px]">全民防詐健康保險</div>
            <div className="text-[9px] font-bold text-[#2D6A4F] tracking-[1.5px]">NATIONAL ANTI-SCAM INSURANCE</div>
          </div>
        </div>

        {/* Body: ◀ 晶片 | 姓名+ID+日期 中央置中 | Avatar 右置中（同一水平線） */}
        <div className="relative grid grid-cols-[74px_1fr_74px] gap-2 px-3 pt-1 pb-3 items-center">
          {/* 左側：箭頭 + 晶片 */}
          <div className="flex items-center gap-1.5">
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#1B4332] shrink-0" />
            <div
              className="w-11 h-8 rounded-[3px] shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F6E27A 0%, #D4AF37 45%, #B8860B 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
              }}
            >
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px p-0.5" style={{ opacity: 0.4 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-[#8B6914]" />
                ))}
              </div>
            </div>
          </div>

          {/* 姓名 + 身分證字號 + 初診日期（整組水平置中） */}
          <div className="text-center min-w-0">
            <div
              className="font-black text-[#111] leading-none mb-2 truncate"
              style={{ fontSize: name ? '28px' : '20px', letterSpacing: '4px' }}
            >
              {name || '（請輸入姓名）'}
            </div>
            <div className="font-mono text-[12px] text-[#1a1a1a]">{pseudoId}</div>
            <div className="font-mono text-[11px] text-[#333] mt-0.5">初診 {dateStr}</div>
          </div>

          {/* Avatar 右側垂直置中 */}
          <div className="w-[74px] h-[88px] bg-white rounded-[3px] border-[1.5px] border-[#1B4332] flex items-center justify-center shadow-sm">
            <div className="text-[44px] leading-none">🤒</div>
          </div>
        </div>

        {/* Card number */}
        <div className="relative bg-white/20 px-3 py-1 border-t border-[#1B4332]/30">
          <div className="font-mono text-[11px] text-[#1a1a1a] tracking-[2px]">0000 165 5678</div>
        </div>
      </div>

      <div className="space-y-5 flex-1">
        <div>
          <label className="block text-xs font-black text-[#2C3E50] mb-2 uppercase tracking-wide">姓名 / PATIENT NAME</label>
          <input
            type="text"
            className="w-full border-[3px] border-[#2C3E50] rounded-[16px] bg-[#F7FAFC] p-3 text-lg font-bold focus:border-[#4FD1C5] focus:outline-none transition-colors shadow-[0_3px_0_#CBD5E0]"
            placeholder="例：王小明"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-black text-[#2C3E50] mb-3 uppercase tracking-wide">初診問卷 · 收到可疑訊息，您第一反應通常是？</label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(INSTINCT_MAP) as Instinct[]).map((s) => {
              const info = INSTINCT_MAP[s];
              const Icon = info.icon;
              const isActive = instinct === s;
              return (
                <div
                  key={s} onClick={() => setInstinct(s)}
                  className={`p-3 border-[3px] rounded-[18px] cursor-pointer flex flex-col gap-2 transition-all ${
                    isActive ? 'border-[#2C3E50] bg-[#4FD1C5] text-white shadow-[0_4px_0_#2C3E50] transform -translate-y-[2px]'
                             : 'border-[#CBD5E0] bg-white text-[#2C3E50] hover:border-[#2C3E50] hover:shadow-[0_4px_0_#CBD5E0]'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <div>
                    <h3 className="font-black text-sm leading-tight">{info.label}</h3>
                    <p className={`text-[11px] mt-1 font-bold ${isActive ? 'text-[#E6FFFA]' : 'text-[#718096]'}`}>{info.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onStart} disabled={!name}
        className="w-full bg-[#FF5252] text-white border-[3px] border-[#2C3E50] font-black text-lg py-3 rounded-[16px] flex items-center justify-center gap-2 mt-6 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        完成掛號，進入看診
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function Game({
  caseData, caseNumber, totalCases, doctorName, instinct,
  hearts, xp, maxHearts, consultCost, xpPerDim,
  onUpdateHearts, onSpendXp, onGainXp, onDiagnose
}: any) {
  const [openedChips, setOpenedChips] = useState<Record<string, boolean>>({});
  const [consulted, setConsulted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ xp: number; heartLost: boolean } | null>(null);
  const [deathPending, setDeathPending] = useState<Dimension | null>(null);

  const toggleChip = (id: string) => setOpenedChips(prev => ({ ...prev, [id]: true }));

  useEffect(() => {
    setOpenedChips({});
    setConsulted(false);
    setLocked(false);
    setFeedback(null);
  }, [caseNumber]);

  const isSevere = caseData.difficulty === 'severe';
  const canConsult = isSevere && !consulted && xp >= consultCost;

  const handleConsult = () => {
    if (!canConsult) return;
    onSpendXp(consultCost);
    setConsulted(true);
  };

  const handleSelect = (opt: CaseOption, optIndex: number) => {
    if (locked) return;
    if (consulted && caseData.eliminatedOptionIndex === optIndex) return;

    setLocked(true);
    const dimSum = opt.dims.caution + opt.dims.rational + opt.dims.skeptic + opt.dims.independent;
    const xpGain = dimSum * xpPerDim;
    const lostHeart = dimSum === 0;

    if (xpGain > 0) onGainXp(xpGain);
    if (lostHeart) onUpdateHearts(Math.max(0, hearts - 1));

    setFeedback({ xp: xpGain, heartLost: lostHeart });

    const willDie = lostHeart && hearts - 1 <= 0;
    window.setTimeout(() => {
      setFeedback(null);
      if (willDie) {
        setDeathPending(opt.dims);
      } else {
        onDiagnose(opt.dims);
      }
    }, 1100);
  };

  const handleAcceptPunishment = () => {
    const dims = deathPending;
    setDeathPending(null);
    if (dims) onDiagnose(dims);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -50 }}
      className="flex flex-col w-full max-w-5xl mx-auto gap-[20px]"
    >
      <header className="flex flex-wrap justify-between items-center gap-3 bg-white px-6 md:px-8 py-4 rounded-[24px] shadow-[0_8px_0_#CBD5E0] border-[3px] border-[#2C3E50]">
        <div className="flex items-center gap-[15px] flex-wrap">
          <div className="flex items-center gap-[10px]">
            <div className="w-5 h-5 bg-[#FF5252] rounded-full shadow-[0_0_15px_#FF5252] animate-pulse"></div>
            <div className="text-[18px] md:text-[22px] font-black uppercase tracking-[1px] text-[#2C3E50] flex items-center gap-2">
              人間清醒醫院 <span className="text-[#FF5252]">門診區</span>
            </div>
          </div>
          {/* 主治醫師 */}
          <div className="flex items-center gap-1.5 bg-white border-[2px] border-[#2C3E50] rounded-full px-3 py-1 shadow-[2px_2px_0_#2C3E50]">
            <Stethoscope className="w-3.5 h-3.5 text-[#4FD1C5]" />
            <span className="text-[11px] md:text-xs font-black text-[#2C3E50] whitespace-nowrap">主治 · Dr. 清醒</span>
          </div>
          {/* 掛號病患 */}
          <div className="flex items-center gap-2 bg-[#4FD1C5] border-[2px] border-[#2C3E50] rounded-full pl-2.5 pr-2 py-1 shadow-[2px_2px_0_#285E61]">
            <span className="text-base leading-none">🤒</span>
            <span className="font-black text-sm text-white whitespace-nowrap">{doctorName}</span>
            <span className="bg-[#234E52] text-white text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap">
              {React.createElement(INSTINCT_MAP[instinct as Instinct].icon, { className: "w-3 h-3" })}
              {INSTINCT_MAP[instinct as Instinct].label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <HeartsBar hearts={hearts} max={maxHearts} />
          <XpBadge xp={xp} />
          <div className="font-black text-sm md:text-base text-[#718096] ml-1">{caseNumber}/{totalCases}</div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-[20px] items-start">
        <section className="bg-white rounded-[32px] border-[4px] border-[#2C3E50] p-6 md:p-8 relative flex flex-col gap-[20px] shadow-[10px_10px_0_#A0AEC0]">
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2">
            {isSevere && (
              <div className="bg-[#D69E2E] text-white px-3 py-2 rounded-full font-black text-xs border-[3px] border-[#2C3E50] flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> 重症
              </div>
            )}
            <div className="bg-[#FF5252] text-white px-5 py-2 rounded-full font-black text-sm border-[3px] border-[#2C3E50]">
              🚨 {caseData.severity}
            </div>
          </div>

          <div className="flex gap-4 md:gap-6 items-center mt-12 md:mt-0">
            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-[#E2E8F0] rounded-[24px] flex items-center justify-center text-[40px] border-[3px] border-[#2C3E50]">
              👤
            </div>
            <div>
              <h2 className="text-[24px] md:text-[32px] font-black text-[#2C3E50] m-0">{caseData.patientName} ({caseData.age}歲)</h2>
              <p className="text-[16px] md:text-[18px] opacity-70 m-0 mt-1 font-bold text-[#2C3E50]">職業：{caseData.occupation}</p>
            </div>
          </div>

          <div className="bg-[#F7FAFC] p-6 rounded-[20px] border-2 border-dashed border-[#CBD5E0] text-[18px] md:text-[20px] leading-[1.6] text-[#4A5568]">
            <b className="text-[#2C3E50] block mb-2 font-black">【急訴情境】</b>{caseData.symptom}
          </div>

          <div>
            <div className="text-[20px] font-black mb-[10px] text-[#2C3E50]">🩺 看看醫師怎麼說</div>
            <div className="flex flex-wrap gap-[12px]">
              {caseData.evidence.map((ev: any) => {
                if (!openedChips[ev.id]) {
                  return (
                    <button
                      key={ev.id} onClick={() => toggleChip(ev.id)}
                      className="bg-[#EBF8FF] border-[2px] border-[#4299E1] text-[#2B6CB0] font-bold px-5 py-2.5 rounded-[16px] cursor-pointer text-sm hover:bg-[#BEE3F8] transition-colors"
                    >
                      <span>檢視：{ev.label}</span>
                    </button>
                  );
                }
                return (
                  <div key={ev.id} className="p-4 rounded-[16px] border-[2px] w-full flex flex-col gap-2 text-[15px] bg-white border-[#3182CE]">
                    <span className="font-black text-[#2C3E50] text-[16px]">{ev.label}</span>
                    <span className="text-[#4A5568] font-bold leading-relaxed">{ev.content}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {consulted && caseData.hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFBEB] border-[3px] border-[#D69E2E] rounded-[20px] p-5 shadow-[4px_4px_0_#D69E2E] relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#D69E2E] rounded-full border-[2px] border-[#2C3E50] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-black text-[#975A16] uppercase tracking-widest">ScamAdviser 給你的提示</span>
              </div>
              <p className="text-sm font-bold text-[#4A5568] leading-relaxed">{caseData.hint}</p>
            </motion.div>
          )}
        </section>

        <div className="flex flex-col gap-[20px] h-full">
          <section className="bg-white border-[4px] border-[#2C3E50] rounded-[32px] p-6 flex flex-col gap-4 shadow-[8px_8px_0_#CBD5E0]">
            <div className="text-[20px] font-black text-[#2C3E50]">🤔 如果是您，會建議怎麼做？</div>
            <div className="grid gap-[16px]">
              {caseData.options.map((opt: CaseOption, i: number) => {
                const isEliminated = consulted && caseData.eliminatedOptionIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt, i)}
                    disabled={isEliminated || locked}
                    className={
                      isEliminated
                        ? 'w-full bg-[#FFF5F5] border-[3px] border-[#FC8181] py-[15px] px-[20px] rounded-[20px] font-bold text-[14px] text-left text-[#A0AEC0] line-through cursor-not-allowed flex justify-between items-center leading-[1.6] relative'
                        : 'w-full bg-white border-[3px] border-[#2C3E50] py-[15px] px-[20px] rounded-[20px] font-bold text-[15px] text-left text-[#2C3E50] hover:-translate-y-[2px] hover:shadow-[0_4px_0_#2C3E50] hover:bg-[#F0FFF4] transition-all flex justify-between items-center group leading-[1.6] disabled:opacity-60'
                    }
                  >
                    <span className="pr-2">{opt.text}</span>
                    {isEliminated ? (
                      <span className="text-[10px] font-black text-[#E53E3E] bg-white border-[2px] border-[#E53E3E] rounded-full px-2 py-0.5 shrink-0 no-underline">ScamAdviser 標記</span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#A0AEC0] group-hover:text-[#2C3E50] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {isSevere && (
            <ConsultButton
              consulted={consulted}
              canConsult={canConsult}
              xp={xp}
              cost={consultCost}
              onClick={handleConsult}
            />
          )}
        </div>
      </main>

      <AnimatePresence>
        {feedback && <FeedbackPop feedback={feedback} />}
      </AnimatePresence>

      <AnimatePresence>
        {deathPending && <DeathScreen doctorName={doctorName} onAccept={handleAcceptPunishment} />}
      </AnimatePresence>
    </motion.div>
  );
}

function HeartsBar({ hearts, max }: { hearts: number; max: number }) {
  return (
    <div className="flex items-center gap-1 bg-[#FFF5F5] border-[2px] border-[#2C3E50] rounded-full px-3 py-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <Heart
          key={i}
          className={`w-4 h-4 ${i < hearts ? 'text-[#E53E3E] fill-[#E53E3E]' : 'text-[#CBD5E0] fill-[#CBD5E0]'}`}
        />
      ))}
    </div>
  );
}

function XpBadge({ xp }: { xp: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#F0FFF4] border-[2px] border-[#2C3E50] rounded-full px-3 py-1.5">
      <Sparkles className="w-4 h-4 text-[#D69E2E]" />
      <span className="text-sm font-black text-[#2C3E50] tabular-nums">XP {xp}</span>
    </div>
  );
}

function ConsultButton({ consulted, canConsult, xp, cost, onClick }: any) {
  if (consulted) {
    return (
      <div className="bg-[#FFFBEB] border-[3px] border-[#D69E2E] rounded-[24px] p-4 text-center shadow-[4px_4px_0_#D69E2E]">
        <div className="text-xs font-black text-[#975A16] uppercase tracking-widest mb-1">已獲得 ScamAdviser 協助</div>
        <div className="text-sm font-black text-[#2C3E50]">提示已顯示在案例線索中</div>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={!canConsult}
      className={
        canConsult
          ? 'bg-[#D69E2E] text-white border-[3px] border-[#2C3E50] rounded-[24px] p-4 font-black text-sm flex flex-col items-center gap-1 shadow-[4px_4px_0_#2C3E50] hover:-translate-y-1 hover:shadow-[4px_6px_0_#2C3E50] transition-all'
          : 'bg-[#F7FAFC] text-[#A0AEC0] border-[3px] border-[#CBD5E0] rounded-[24px] p-4 font-black text-sm flex flex-col items-center gap-1 cursor-not-allowed'
      }
    >
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5" />
        <span>使用 ScamAdviser 協助你度過難關</span>
      </div>
      <div className="text-xs font-bold opacity-90">
        {canConsult ? `消耗 ${cost} XP（剩餘 ${xp}）` : `需 ${cost} XP（目前 ${xp}）`}
      </div>
    </button>
  );
}

function FeedbackPop({ feedback }: { feedback: { xp: number; heartLost: boolean } }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 20 }}
        animate={{ scale: 1.1, y: -30 }}
        exit={{ scale: 0.8, y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260 }}
        className="flex flex-col items-center gap-2"
      >
        {feedback.xp > 0 && (
          <div className="bg-white border-[4px] border-[#38A169] text-[#38A169] rounded-full px-6 py-3 shadow-[6px_6px_0_#38A169] font-black text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> +{feedback.xp} XP
          </div>
        )}
        {feedback.xp === 0 && !feedback.heartLost && (
          <div className="bg-white border-[4px] border-[#A0AEC0] text-[#718096] rounded-full px-6 py-3 shadow-[6px_6px_0_#A0AEC0] font-black text-xl">
            +0 XP
          </div>
        )}
        {feedback.heartLost && (
          <div className="bg-white border-[4px] border-[#E53E3E] text-[#E53E3E] rounded-full px-6 py-3 shadow-[6px_6px_0_#E53E3E] font-black text-2xl flex items-center gap-2">
            <Heart className="w-6 h-6 fill-[#E53E3E]" /> -1 愛心
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function DeathScreen({ doctorName, onAccept }: { doctorName: string; onAccept: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E50]/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 240 }}
        className="bg-white border-[4px] border-[#2C3E50] rounded-[28px] shadow-[10px_10px_0_#E53E3E] w-full max-w-md p-8 text-center"
      >
        <div className="w-20 h-20 bg-[#E53E3E] rounded-full border-[4px] border-[#2C3E50] mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_#FC8181]">
          <Skull className="w-10 h-10 text-white" />
        </div>
        <div className="text-xs font-black text-[#E53E3E] uppercase tracking-[3px] mb-1">CODE RED · 防詐警報</div>
        <h2 className="text-2xl font-black text-[#2C3E50] mb-3">反詐觀察病房通知</h2>
        <p className="text-sm font-bold text-[#4A5568] leading-relaxed mb-6">
          {doctorName} 病患：您在本次健檢中已不幸「被詐騙」3 次，<br />
          主治醫師 Dr. 清醒 建議您立即轉入反詐觀察病房留觀。
        </p>
        <div className="bg-[#FFF5F5] border-[3px] border-[#E53E3E] rounded-[16px] p-4 mb-5 text-left">
          <div className="text-xs font-black text-[#E53E3E] uppercase tracking-widest mb-1">療養建議</div>
          <p className="text-sm font-bold text-[#2C3E50] leading-relaxed">
            前往 <b>ScamAdviser</b> 翻閱最新詐騙案例庫，補強防詐知識後即可取得「出院許可證」，回到診間完成剩餘健檢。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={SCAM_ADV_URL}
            target="_blank" rel="noopener noreferrer"
            className="w-full bg-[#FF5252] text-white border-[3px] border-[#2C3E50] font-black py-3 rounded-[16px] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all"
          >
            <ShieldCheck className="w-5 h-5" /> 前往 ScamAdviser 補課出院
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onAccept}
            className="w-full bg-white text-[#4A5568] border-[3px] border-[#2C3E50] font-black text-sm py-2.5 rounded-[16px] hover:bg-[#EDF2F7] transition-colors"
          >
            接受留觀，繼續完成剩餘健檢題
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Result({ dims, userName, instinct, instinctLabel, onRestart }: any) {
  const total = dims.caution + dims.rational + dims.skeptic + dims.independent;
  const cp=dims.caution, rp=dims.rational, sp=dims.skeptic, ip=dims.independent;

  let p;
  // 分析師最高門檻（接近滿分 34 的 top 玩家）
  if (total >= 32) p = PERSONALITIES[0];
  // 具體人格優先判定
  else if (cp <= 3 && sp <= 3 && rp <= 3) p = PERSONALITIES[1]; // guardian
  else if (ip >= 7 && cp >= 5 && rp <= 5) p = PERSONALITIES[3]; // hunter
  else if (rp >= 6 && sp >= 5 && cp <= 5) p = PERSONALITIES[2]; // expert
  else if (rp >= 6 && cp >= 6 && sp <= 5) p = PERSONALITIES[4]; // believer
  // 分析師備用：不符具體 pattern 但理性 + 懷疑都極高
  else if (sp >= 7 && rp >= 7) p = PERSONALITIES[0];
  // 混沌判定（4 維差異小 或 其餘都不匹配）
  else if (Math.max(cp,rp,sp,ip) - Math.min(cp,rp,sp,ip) <= 3) p = PERSONALITIES[5];
  else p = PERSONALITIES[5]; // fallback 一律到混沌中立者

  // Demo override: 網址加 ?p=<id> 可直接強制該人格 (供 demo / 截圖使用)
  if (typeof window !== 'undefined') {
    const forcedId = new URLSearchParams(window.location.search).get('p');
    if (forcedId) {
      const forced = PERSONALITIES.find(x => x.id === forcedId);
      if (forced) p = forced;
    }
  }

  const [showRx, setShowRx] = useState(false);
  const [showMedBag, setShowMedBag] = useState(false);

  const handleShare = () => setShowMedBag(true);
  const handleWeakness = () => setShowRx(true);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-[600px] w-full max-w-lg mx-auto bg-[#F0F4F8] text-[#2C3E50]"
    >
      <div className="p-8 flex-1 flex flex-col bg-white border-[4px] border-[#2C3E50] rounded-[32px] shadow-[10px_10px_0_#A0AEC0]">
        
        <div className="flex justify-between items-start border-b-[3px] border-[#CBD5E0] pb-4 mb-6">
          <div>
            <div className="font-black text-sm tracking-widest text-[#718096] uppercase">人間清醒醫院防詐人格診斷書</div>
            <div className="text-xl font-black text-[#2C3E50] mt-1">STAY-WOKE REPORT</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[#A0AEC0]">{new Date().toLocaleDateString('zh-TW')}</div>
            <div className="text-xs text-[#A0AEC0] font-mono mt-1">NO. ER-2026</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-black text-[#4A5568]">
          <div className="flex justify-between border-b-2 border-dashed border-[#CBD5E0] pb-1"><span className="text-[#A0AEC0]">受測醫師</span><span>{userName}</span></div>
          <div className="flex justify-between border-b-2 border-dashed border-[#CBD5E0] pb-1"><span className="text-[#A0AEC0]">初始反應</span><span>{instinctLabel}</span></div>
          <div className="flex justify-between border-b-2 border-dashed border-[#CBD5E0] pb-1 col-span-2"><span className="text-[#A0AEC0]">人格類型標籤</span><span className="text-base text-[#2C3E50]">{p.typeShort}</span></div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#F0F4F8] border-[3px] border-[#2C3E50] rounded-[20px] p-2 mb-6">
          <div className="bg-white p-3 text-center rounded-[12px] border-[2px] border-[#2C3E50]">
            <div className="text-xs font-black text-[#718096] mb-1">警覺指數</div>
            <div className={`text-xl font-black ${p.v1c}`}>{p.v1}</div>
          </div>
          <div className="bg-white p-3 text-center rounded-[12px] border-[2px] border-[#2C3E50]">
            <div className="text-xs font-black text-[#718096] mb-1">理性指數</div>
            <div className={`text-xl font-black ${p.v2c}`}>{p.v2}</div>
          </div>
          <div className="bg-white p-3 text-center rounded-[12px] border-[2px] border-[#2C3E50]">
            <div className="text-xs font-black text-[#718096] mb-1">防詐體質</div>
            <div className={`text-xl font-black ${p.v3c}`}>{p.v3}</div>
          </div>
        </div>

        <div className="bg-[#EBF8FF] border-[3px] border-[#2C3E50] rounded-[24px] p-6 mb-6 shadow-[4px_4px_0_#4299E1] relative overflow-hidden">
           <div className={`absolute -right-4 -bottom-4 w-28 h-28 border-[4px] rounded-full flex justify-center items-center font-black text-xl rotate-[-15deg] opacity-80 bg-white ${p.stampClass}`}>
              <span className="text-center">{p.stampText}</span>
           </div>
           
           <div className="text-xs font-black text-[#2B6CB0] uppercase mb-1">防詐人格最終診斷</div>
           <div className="text-3xl font-black text-[#2C3E50] mb-2">{p.title}</div>
           <div className={`inline-block px-3 py-1 bg-white border-[2px] border-[#2C3E50] rounded-full text-sm font-black mb-4 ${p.rankColor}`}>{p.rank}</div>
           
           <div className="bg-white/60 p-4 border-[2px] border-dashed border-[#2C3E50] rounded-[16px] relative z-10">
              <div className="text-xs font-black text-[#4A5568] mb-1">臨床備註</div>
              <p className="text-sm font-bold text-[#2C3E50] leading-relaxed">{p.remark}</p>
           </div>
        </div>

        <div className="bg-[#FFFBEB] border-[3px] border-[#2C3E50] rounded-[20px] p-5 mb-6 shadow-[4px_4px_0_#D69E2E]">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-[#975A16] uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4" /> 自我認知對照 · Self-Awareness Check
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-black mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#A0AEC0]">你宣稱:</span>
              <span className="bg-white border-[2px] border-[#2C3E50] text-[#2C3E50] px-2 py-0.5 rounded-full whitespace-nowrap">{instinctLabel}</span>
            </div>
            <span className="text-[#A0AEC0]">→</span>
            <div className="flex items-center gap-2">
              <span className="text-[#A0AEC0]">診斷結果:</span>
              <span className={`bg-white border-[2px] border-[#2C3E50] px-2 py-0.5 rounded-full whitespace-nowrap ${p.rankColor}`}>{p.title}</span>
            </div>
          </div>
          <p className="text-sm font-bold text-[#2C3E50] leading-relaxed">
            {SELF_AWARENESS[instinct as Instinct]?.[p.id] ?? '你的選擇無法歸類，本院醫師也無從評論，祝你好運。'}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-2">
          <button
            onClick={handleWeakness}
            className="w-full bg-[#FF5252] text-white border-[3px] border-[#2C3E50] font-black text-base py-4 rounded-[16px] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all relative"
          >
            <Pill className="w-5 h-5" /> 領取我的個人化處方箋 RX
            <span className="absolute -top-2 -right-2 bg-[#D69E2E] text-white text-[10px] font-black px-2 py-0.5 rounded-full border-[2px] border-[#2C3E50]">
              NEW
            </span>
          </button>
          <button onClick={handleShare} className="w-full bg-[#4FD1C5] text-white border-[3px] border-[#2C3E50] font-black text-sm py-3 rounded-[16px] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all">
            <Share2 className="w-4 h-4" /> 分享我的防詐人格
          </button>
        </div>
      </div>

      <div className="pt-6 flex justify-center pb-4">
         <button onClick={onRestart} className="bg-white border-2 border-[#2C3E50] px-6 py-2 rounded-full text-[#4A5568] hover:bg-[#EDF2F7] hover:text-[#2C3E50] text-sm font-bold transition-colors shadow-[0_2px_0_#2C3E50]">
            重新實習 (再測一次)
         </button>
      </div>
    </motion.div>
    <AnimatePresence>
      {showRx && (
        <Prescription
          key="rx"
          personality={p}
          userName={userName}
          onClose={() => setShowRx(false)}
        />
      )}
      {showMedBag && (
        <MedBagModal
          key="medbag"
          personality={p}
          med={MED_BY_ID[p.id]}
          userName={userName}
          onClose={() => setShowMedBag(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}

function Prescription({ personality, userName, onClose }: any) {
  const rxNumber = `RX-${String(Math.floor(Math.random() * 900000) + 100000)}`;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#2C3E50]/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-[#FFFDF7] border-[4px] border-[#2C3E50] rounded-[28px] shadow-[10px_10px_0_#2C3E50] w-full max-w-lg max-h-[92vh] overflow-y-auto relative"
      >
        <div className="flex justify-between items-center px-6 py-5 border-b-[3px] border-dashed border-[#CBD5E0] bg-[#FFFBEB] rounded-t-[24px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D69E2E] rounded-full border-[3px] border-[#2C3E50] flex items-center justify-center shadow-[0_0_12px_#F6E05E]">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-black text-[#975A16] uppercase tracking-[3px]">PRESCRIPTION</div>
              <div className="text-2xl font-black text-[#2C3E50] leading-none mt-1">處方箋 Rx</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="關閉" className="p-2 hover:bg-white rounded-full border-[2px] border-transparent hover:border-[#2C3E50] transition-colors">
            <X className="w-5 h-5 text-[#718096]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm font-black border-b-2 border-dashed border-[#CBD5E0] pb-4">
            <div className="flex flex-col"><span className="text-[#A0AEC0] text-[10px] uppercase tracking-widest">受測醫師</span><span className="text-[#2C3E50] mt-0.5">{userName}</span></div>
            <div className="flex flex-col"><span className="text-[#A0AEC0] text-[10px] uppercase tracking-widest">診斷人格</span><span className="text-[#2C3E50] mt-0.5">{personality.title}</span></div>
            <div className="flex flex-col col-span-2"><span className="text-[#A0AEC0] text-[10px] uppercase tracking-widest">人格標籤</span><span className="text-[#4A5568] mt-0.5">{personality.typeShort}</span></div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#E53E3E] mb-2 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> 高風險詐騙暴露
            </div>
            <div className="flex flex-wrap gap-2">
              {personality.weaknesses.map((w: string, i: number) => (
                <span key={i} className="bg-[#FFF5F5] border-[2px] border-[#E53E3E] text-[#C53030] text-xs font-black px-3 py-1.5 rounded-full">
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#F0FFF4] border-[3px] border-[#2C3E50] rounded-[20px] p-5 shadow-[4px_4px_0_#38A169] relative">
            <div className="absolute -top-3 left-4 bg-[#38A169] text-white text-[10px] font-black px-3 py-1 rounded-full border-[2px] border-[#2C3E50] tracking-widest">
              ✚ 建議療程
            </div>
            <div className="text-lg font-black text-[#2C3E50] mt-2 mb-2">{personality.prescription}</div>
            <p className="text-sm font-bold text-[#4A5568] leading-relaxed">{personality.prescriptionDesc}</p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <a
              href={personality.primaryCta.url} target="_blank" rel="noopener noreferrer"
              className="w-full bg-[#FF5252] text-white border-[3px] border-[#2C3E50] font-black py-3 px-4 rounded-[16px] flex items-center justify-center gap-2 leading-tight text-sm md:text-base text-center hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all"
            >
              <Stethoscope className="w-5 h-5 shrink-0" />
              <span>{personality.primaryCta.label}</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            {personality.secondaryCta && (
            <a
              href={personality.secondaryCta.url} target="_blank" rel="noopener noreferrer"
              className="w-full bg-white text-[#2C3E50] border-[3px] border-[#2C3E50] font-black text-sm py-3 rounded-[16px] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#D69E2E]" />
              <span>{personality.secondaryCta.label}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            )}
          </div>

          <div className="flex justify-between items-end border-t-2 border-dashed border-[#CBD5E0] pt-3 mt-1 text-[10px] text-[#A0AEC0] font-mono uppercase tracking-widest">
            <span>Dr. 清醒</span>
            <span>{rxNumber}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const MED_GREEN = '#2D6A4F';

function Check({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${on ? 'text-[#111]' : 'text-[#A0AEC0]'}`}>
      <span
        className={`inline-flex items-center justify-center w-[14px] h-[14px] border-[1.5px] text-[10px] font-black leading-none ${on ? 'border-[#111] bg-white' : 'border-[#A0AEC0] bg-white'}`}
      >
        {on ? '✓' : ''}
      </span>
      <span className="text-[12px]">{children}</span>
    </span>
  );
}

function MedBag({ personality, med, userName }: { personality: any; med: MedData; userName: string }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}　　${today.getMonth() + 1}　月　${today.getDate()}　日`;
  const rxNo = `RX-${String(Math.floor(Math.random() * 900000) + 100000)}`;

  return (
    <div
      className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
      style={{
        width: '540px',
        fontFamily: '"PMingLiU", "新細明體", "Noto Serif TC", "Songti TC", "Microsoft JhengHei", serif',
        color: '#111',
      }}
    >
      {/* plastic handle area */}
      <div
        className="relative flex justify-center items-center"
        style={{ height: '60px', background: 'linear-gradient(180deg,#F5F5F0 0%, #FFFFFF 100%)' }}
      >
        <div
          className="border-[2px] border-[#CBD5E0] bg-white"
          style={{ width: '130px', height: '22px', borderRadius: '11px' }}
        />
      </div>

      {/* Green bordered label */}
      <div className="mx-5 mb-5 border-[3px]" style={{ borderColor: MED_GREEN }}>
        {/* Header row */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b-[2px]"
          style={{ borderColor: MED_GREEN }}
        >
          <div
            className="flex items-center justify-center text-white font-black text-xl shrink-0"
            style={{ background: MED_GREEN, width: '44px', height: '44px', borderRadius: '6px' }}
          >
            清
          </div>
          <div className="flex-1">
            <div className="font-black text-[22px] leading-none tracking-[2px]" style={{ color: '#111' }}>
              人間清醒醫院
            </div>
            <div className="text-[10px] tracking-[1px] mt-1" style={{ color: MED_GREEN, fontWeight: 700 }}>
              STAY-WOKE HOSPITAL · 全民防詐保險特約急診
            </div>
          </div>
        </div>

        {/* Name row */}
        <div
          className="flex flex-wrap items-center gap-y-1 px-4 py-2 text-[13px] border-b-[2px]"
          style={{ borderColor: MED_GREEN, background: '#F9F9F4' }}
        >
          <span className="font-black mr-2" style={{ color: MED_GREEN }}>姓名</span>
          <span className="flex-1 border-b border-dashed border-[#666] pb-0.5 mr-4">{userName}</span>
          <span className="font-black mr-2" style={{ color: MED_GREEN }}>性別</span>
          <span className="flex gap-2">
            <Check on={false}>男</Check>
            <Check on={false}>女</Check>
          </span>
        </div>

        {/* Diagnosis strip */}
        <div
          className="flex flex-wrap items-center gap-y-1 px-4 py-2 text-[12px] border-b-[2px]"
          style={{ borderColor: MED_GREEN }}
        >
          <span className="font-black mr-2" style={{ color: MED_GREEN }}>診斷 Dx</span>
          <span className="font-black text-[14px] mr-3" style={{ color: '#111' }}>{personality.title}</span>
          <span
            className="text-[10px] font-black px-2 py-0.5 border-[1.5px]"
            style={{ color: MED_GREEN, borderColor: MED_GREEN }}
          >
            {personality.rank}
          </span>
        </div>

        {/* 內服藥 block */}
        <div className="flex border-b-[2px]" style={{ borderColor: MED_GREEN }}>
          <div
            className="flex items-center justify-center font-black text-[14px] shrink-0 px-2"
            style={{
              width: '32px',
              background: MED_GREEN,
              color: 'white',
              writingMode: 'vertical-rl',
              letterSpacing: '8px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            內服藥
          </div>
          <div className="flex-1 px-3 py-3 space-y-1.5">
            <div className="flex justify-between items-center pb-1 border-b border-dashed border-[#999]">
              <span className="font-black text-[14px]">{med.name}</span>
              <span className="text-[11px]">{med.dose}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
              <Check on={med.freqChecks.includes('daily3')}>每日3次（間隔6小時 早．中．晚）</Check>
              <span className="text-[11px]">藥水 {med.liquid} CC</span>
              <Check on={med.freqChecks.includes('daily4')}>每日4次（三餐時間 + 睡前）</Check>
              <span className="text-[11px] text-[#888]">—</span>
              <Check on={med.freqChecks.includes('beforeSleep')}>睡前</Check>
              <Check on={med.freqChecks.includes('singlePack')}>服用1包（粒）</Check>
            </div>
            <div className="flex gap-3 pt-1">
              <Check on={med.mealChecks.includes('before')}>飯前</Check>
              <Check on={med.mealChecks.includes('after')}>飯後</Check>
              <Check on={med.mealChecks.includes('any')}>飯前飯後 都可以</Check>
            </div>
            <div className="pt-1 text-[12px] leading-[1.55]">
              <span className="font-black">其它用藥指示：</span>
              <span>{med.special}</span>
            </div>
          </div>
        </div>

        {/* 外用藥 block */}
        <div className="flex border-b-[2px]" style={{ borderColor: MED_GREEN }}>
          <div
            className="flex items-center justify-center font-black text-[14px] shrink-0 px-2"
            style={{
              width: '32px',
              background: MED_GREEN,
              color: 'white',
              writingMode: 'vertical-rl',
              letterSpacing: '8px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            外用藥
          </div>
          <div className="flex-1 px-3 py-3 space-y-1.5">
            <div className="flex items-center gap-1 text-[12px] pb-1 border-b border-dashed border-[#999]">
              <span className="font-black">人格軟膏</span>
              <span className="ml-1">共</span>
              <span className="inline-block border-b border-[#666] min-w-[20px] text-center px-1">{med.boxCount}</span>
              <span>盒；一天3次</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <Check on={med.externalChecks.includes('ointment')}>藥膏 / 擦劑</Check>
              <Check on={med.externalChecks.includes('patch')}>酸痛貼布</Check>
              <Check on={med.externalChecks.includes('eye')}>眼藥</Check>
              <Check on={med.externalChecks.includes('other')}>其他（依醫囑）</Check>
            </div>
            <div className="pt-1 text-[12px] leading-[1.55]">
              <span className="font-black">使用指示：</span>
              <span>{med.externalNote}</span>
            </div>
          </div>
        </div>

        {/* Pharmacist / date row */}
        <div
          className="flex flex-wrap items-center gap-y-1 px-4 py-2 text-[12px] border-b-[2px]"
          style={{ borderColor: MED_GREEN, background: '#F9F9F4' }}
        >
          <span className="font-black mr-2" style={{ color: MED_GREEN }}>調劑藥師</span>
          <span className="flex gap-3 mr-4">
            <Check on={true}>Dr. 清醒</Check>
          </span>
          <span className="ml-auto font-black mr-2" style={{ color: MED_GREEN }}>日期</span>
          <span className="text-[11px]">{dateStr}</span>
        </div>

        {/* Green inverted banner */}
        <div
          className="text-center font-black text-[16px] py-2 tracking-[3px]"
          style={{ background: MED_GREEN, color: 'white' }}
        >
          免費　防詐免疫終身處方箋（不分科別）
        </div>

        {/* Footer clinic info */}
        <div className="px-4 py-3 text-[11px] leading-[1.7]" style={{ color: '#222' }}>
          <div className="flex">
            <span className="font-black w-[90px] shrink-0" style={{ color: MED_GREEN }}>反詐騙專線</span>
            <span>165（24H 急診）</span>
          </div>
          <div className="flex">
            <span className="font-black w-[90px] shrink-0" style={{ color: MED_GREEN }}>線上查詢</span>
            <span>scamadviser.com ・ 全球最大反詐資料庫</span>
          </div>
          <div className="flex">
            <span className="font-black w-[90px] shrink-0" style={{ color: MED_GREEN }}>營業時間</span>
            <span>全年無休．急診不打烊</span>
          </div>
          <div className="flex items-start justify-between pt-1 mt-1 border-t border-dashed border-[#CBD5E0]">
            <div>
              <div className="font-black" style={{ color: MED_GREEN }}>急 診 室 地 址</div>
              <div>人間清醒醫院．網路急診部 · 門診室</div>
            </div>
            <div
              className="flex items-center justify-center font-black text-[10px] text-center leading-tight shrink-0 ml-3"
              style={{
                width: '62px',
                height: '62px',
                border: `2px solid ${MED_GREEN}`,
                color: MED_GREEN,
                borderRadius: '50%',
                transform: 'rotate(-8deg)',
              }}
            >
              人間<br />清醒<br />院印
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-[#E2E8F0] text-center text-[10px] tracking-[2px]" style={{ color: '#888' }}>
            No. {rxNo} · 本處方箋僅供網路分享，非實體藥物
          </div>
        </div>
      </div>
    </div>
  );
}

function MedBagModal({ personality, med, userName, onClose }: any) {
  const medBagRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [scale, setScale] = useState(1);
  const [bagHeight, setBagHeight] = useState<number | null>(null);

  const safeName = (userName || '無名醫師').replace(/[^\w\u4e00-\u9fa5]/g, '');
  const fileName = `人間清醒醫院-${safeName}-${personality.id}藥袋.png`;

  // 根據視窗寬度計算 scale，讓藥袋完整呈現於手機螢幕
  useEffect(() => {
    const recalc = () => {
      if (typeof window === 'undefined') return;
      const available = Math.min(window.innerWidth - 48, 540); // -48 留 modal padding + close button 空間
      setScale(Math.min(1, available / 540));
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // 量藥袋原始（未縮放）高度以撐開外層容器
  useEffect(() => {
    if (medBagRef.current) {
      setBagHeight(medBagRef.current.scrollHeight);
    }
  }, [personality]);

  const renderPng = async () => {
    if (!medBagRef.current) return null;
    const { toPng } = await import('html-to-image');
    // PNG 輸出時重設 transform 為 scale(1)，保持圖檔維持 540px 全尺寸
    // pixelRatio 調降為 1.5 讓檔案不至於過大（原本 2x 會產出 1080×~2600 的巨圖）
    return toPng(medBagRef.current, {
      pixelRatio: 1.5,
      cacheBust: true,
      width: 540,
      style: {
        width: '540px',
        maxWidth: 'none',
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const url = await renderPng();
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error(err);
      alert('下載失敗，請截圖分享本頁面');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const url = await renderPng();
      if (!url) return;
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      const shareText = `我在「人間清醒醫院」被診斷為：${personality.title}（${personality.rank}）。醫師開了這包藥給我 👇 你也來測看看你需要吃什麼？`;
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: '我的防詐藥袋', text: shareText });
      } else {
        await handleDownload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E50]/70 backdrop-blur-sm p-4 overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="relative w-full max-w-[580px] my-6"
      >
        <button
          onClick={onClose}
          aria-label="關閉"
          className="absolute top-6 right-6 z-10 w-11 h-11 bg-white border-[3px] border-[#2C3E50] rounded-full flex items-center justify-center shadow-[3px_3px_0_#2C3E50] hover:-translate-y-0.5 transition-transform"
        >
          <X className="w-5 h-5 text-[#2C3E50]" />
        </button>

        <div
          className="rounded-[8px] overflow-hidden mx-auto"
          style={{
            width: `${540 * scale}px`,
            height: bagHeight ? `${bagHeight * scale}px` : undefined,
          }}
        >
          <div
            ref={medBagRef}
            style={{
              width: '540px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <MedBag personality={personality} med={med} userName={userName} />
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShare}
            disabled={sharing || downloading}
            className="flex-1 bg-[#4FD1C5] text-white border-[3px] border-[#2C3E50] font-black py-3 rounded-[16px] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            {sharing ? '產出分享檔…' : '分享到…'}
          </button>
          <button
            onClick={handleDownload}
            disabled={sharing || downloading}
            className="flex-1 bg-white text-[#2C3E50] border-[3px] border-[#2C3E50] font-black py-3 rounded-[16px] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_0_#2C3E50] transition-all disabled:opacity-50"
          >
            <Pill className="w-5 h-5 text-[#D69E2E]" />
            {downloading ? '產出藥袋圖檔…' : '下載藥袋 PNG'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
