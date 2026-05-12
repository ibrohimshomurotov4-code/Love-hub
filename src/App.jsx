import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// =====================================================
// SUPABASE — Real-time integratsiya
// =====================================================
const SUPABASE_URL = "https://hkpfqotrssoplwahjeoe.supabase.co";
const SUPABASE_KEY = "sb_publishable_QgrbBIkkHx-icLDHPQXGTA_IHJ7y_kh";

// Supabase SDK (CDN orqali)
let supabase = null;

async function initSupabase() {
  if (supabase) return supabase;
  // Supabase JS CDN dan yuklash
  if (!window.__supabase) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: { params: { eventsPerSecond: 10 } }
  });
  window.__supabase = supabase;
  return supabase;
}

// Telegram user ID olish
function getTgUser() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  } catch { return null; }
}

// LocalStorage dan user ID olish yoki yaratish
function getMyUserId() {
  let id = localStorage.getItem('lh_user_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('lh_user_id', id); }
  return id;
}

// Chat ID (ikki user uchun unique)
function getChatId(a, b) { return [a, b].sort().join(':'); }


const LANGS = {
uz:  { flag:"UZ",  discover:"Qidiruv", matches:"Yozishmalar", go:"GO", stories:"Stories", shop:"Dokon", writeMsg:"Xabar yozing…", online:"Online", cancel:"Bekor", aboutInfo:"haqida malumot", langTitle:"Til tanlash", settingsTitle:"Sozlamalar", support:"Qollab-quvvatlash", suggestion:"Taklif va shikoyatlar", terms:"Foydalanish shartlari", rate:"Ilovani baholash", myProfile:"Mening profilim", noMatch:"Hali yozishmalar yoq", complaintSent:"Shikoyatingiz tez orada administratsiyamiz tomonidan korib chiqiladi. Betibor bolmaganingiz uchun rahmat!" },
kir: { flag:"УЗ", discover:"Қидирув",  matches:"Ёзишмалар",  go:"GO", stories:"Ҳикоялар", shop:"Дўкон", writeMsg:"Хабар ёзинг…", online:"Онлайн", cancel:"Бекор", aboutInfo:"ҳақида маълумот", langTitle:"Тил танлаш", settingsTitle:"Созламалар", support:"Қўллаб-қувватлаш", suggestion:"Таклиф ва шикоятлар", terms:"Фойдаланиш шартлари", rate:"Иловани баҳолаш", myProfile:"Менинг профилим", noMatch:"Ҳали ёзишмалар йўқ", complaintSent:"Шикоятингиз тез орада администратсиямиз томонидан кўриб чиқилади. Раҳмат!" },
ru:  { flag:"RU",  discover:"Поиск",   matches:"Переписки",   go:"GO", stories:"Истории",  shop:"Магазин", writeMsg:"Написать…", online:"Онлайн", cancel:"Отмена", aboutInfo:"подробнее", langTitle:"Выбор языка", settingsTitle:"Настройки", support:"Поддержка", suggestion:"Предложения", terms:"Условия", rate:"Оценить", myProfile:"Мой профиль", noMatch:"Нет переписок", complaintSent:"Ваша жалоба будет рассмотрена администрацией. Спасибо!" },
};

const C = { bg:"#f0f8ff", accent:"#ff6eb4", sky:"#38bdf8", text:"#1e293b", muted:"#94a3b8", border:"#e2edf7", green:"#22c55e", gold:"#f59e0b", purple:"#a855f7", pink:"#f472b6" };

const VILOYATLAR = ["Toshkent shahri","Toshkent viloyati","Samarqand","Buxoro","Fargona","Namangan","Andijon","Qashqadaryo","Surxondaryo","Xorazm","Navoiy","Sirdaryo","Qoraqalpogiston"];
const TOSHKENT_TUMANLARI = ["Toshkent","Yunusobod","Chilonzor","Mirzo Ulugbek","Yakkasaroy","Shayxontohur","Olmazar","Uchtepa","Sergeli","Bektemir","Yashnobod","Mirobod"];
const BANNED = ["dacha","tog","sex","18+","yotiq","tunash","kvartira","mehmonxona","hotel","motel"];

const BAD_WORDS = [
"ahmoq","tentak","qo'tir","nokas","harom","it","eshak","cho'chqa","qanday","la'nat",
"o'lar","o'l","yomon","boshqotirma","ovsar","bema'ni","beadab","bedard","besha'n",
"uyatsiz","sharmsiz","buzuq","qavvod","fahsh","yaramasiz","sassiq","murdor",
"blyad","suka","pizda","huy","ebat","pizdec","mudak","dolboeb","eblan","pidor",
"zalupa","shluha","govno","blyadi","cyka","nahuy","poshel","idi","ublyudok",
"fuck","shit","bitch","asshole","bastard","cunt","dick","pussy","whore","slut",
];

const filterBadWords = (text) => {
  let filtered = text;
  let found = [];
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(filtered)) {
      found.push(word);
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
  });
  return { filtered, found, hasBad: found.length > 0 };
};

const GIFTS = [
  {id:1,emoji:"💐",name:"Guldasta",price:15,color:"#ff6b9d"},
  {id:2,emoji:"🍫",name:"Shokolad",price:10,color:"#92400e"},
  {id:3,emoji:"💍",name:"Uzuk",price:80,color:"#d97706"},
  {id:4,emoji:"🧸",name:"Ayiqcha",price:25,color:"#f97316"},
  {id:5,emoji:"🎀",name:"Lenta",price:8,color:"#ec4899"},
  {id:6,emoji:"⭐",name:"Yulduz",price:40,color:"#eab308"},
];

const TG_EMOJI = [
"😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😙","😚",
"😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥",
"😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐",
"😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓",
"😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","👾","🤖",
"❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟",
"👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍",
"👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👂","🦻","👃",
"🌹","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","⭐","🌠","🌌","☀️","🌤️","⛅","🌦️","🌧️","❄️",
"🍎","🍊","🍋","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌽",
"🎂","🍰","🧁","🥧","🍮","🍭","🍬","🍫","🍩","🍪","🌰","☕","🍵","🧃","🥤","🍺","🍻","🥂","🍷",
"🎮","🕹️","🎲","♟️","🧩","🎯","🎳","🎪","🎨","🖼️","🎭","🎬","🎤","🎧","🎼","🎹","🎸","🎺","🎻",
"⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎽","🛹","🛷","🥌","🎿","⛷️","🏂","🏋️",
"🚗","🚕","🚙","🏎️","🚓","🚑","🚒","🚐","🚌","🚎","🏍️","🛵","🚲","🛴","✈️","🚀","🛸","🚁","⛵","🛥️",
"🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏪","🏫","🏬","🏭","🗼","🗽","⛪","🕌","🕍","⛩️","🕋",
"💻","🖥️","🖨️","⌨️","🖱️","💾","💿","📀","📱","☎️","📞","📟","📠","📺","📷","📸","📹","🎥","📽️",
"💰","💴","💵","💶","💷","💸","💳","💹","📈","📉","📊","📋","📌","📍","🗺️","🧭","📅","📆","🗓️","📇",
"🎁","🎀","🎊","🎉","🎈","🎏","🎐","🎑","🧧","🎆","🎇","✨","🎍","🎋","🎄","🎃","🎗️","🎟️","🎫",
"🌍","🌎","🌏","🌐","🗾","🧭","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🏟️","🏛️","🏗️",
"🦁","🐯","🐻","🐼","🐨","🐸","🐵","🙈","🙉","🙊","🐒","🦊","🦝","🐺","🐗","🐴","🦄","🐝","🐛","🦋",
];
const TG_GIFS = [
  {id:1,emoji:"👋",text:"Salom gif",url:"https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"},
  {id:2,emoji:"❤️",text:"Sevgi gif",url:"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"},
  {id:3,emoji:"😂",text:"Kulgili",url:"https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif"},
  {id:4,emoji:"🎉",text:"Bayram",url:"https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"},
];

const USERS = [
  {id:1,name:"Nilufar Karimova",age:23,city:"Toshkent shahri",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=47",extraPhotos:["https://i.pravatar.cc/400?img=48","https://i.pravatar.cc/400?img=49"],emoji:"👩",bio:"Raqs va musiqa sevaman",online:true,rating:4.8,vip:true,stories:["🌅","🎶","🌺"],kasb:"Raqqosa, musiqa muallimi",gifts:42,likes:187,voiceVerified:true,voiceUrl:null,voiceDeclined:false,tgUsername:"nilufar_demo",tgUserId:"123456789",seeking:"Hayotga ijobiy qarash va maqsadga intilish men uchun muhim. Samimiy, mehnatkash va oilaga e'tibor beradigan yigit qidirmoqdaman. Birgalikda sayr, musiqa tinglash va yangi joylarni kashf etishni yaxshi ko'raman. Jiddiy munosabat uchun tayyor bo'lgan insonni izlayapman 🌸",
    trust:{photo:90,bio:85,kasb:80,phone:100,id:95,activity:92,likeRatio:88,blockRatio:97}},
  {id:2,tgUserId:"234567890",name:"Kamola Yusupova",age:25,city:"Samarqand",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=45",emoji:"👩",bio:"Sayohat qilishni yaxshi koraman",online:false,rating:4.5,vip:false,stories:["🏔️","🌊","🗺️"],kasb:"Sayohat bloggeri",gifts:18,likes:74,seeking:"Dunyo bo'ylab sayohat qilishni orzu qiladigan, hayotdan zavq oladigan do'st yoki hamroh izlayapman. Birgalikda yangi mamlakatlarni ko'rish, turli madaniyatlarni o'rganish — bu mening orzuyim ✈️🌍",
    trust:{photo:75,bio:70,kasb:65,phone:0,id:0,activity:60,likeRatio:72,blockRatio:90}},
  {id:3,tgUserId:"345678901",name:"Dildora Nazarova",age:21,city:"Buxoro",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=44",emoji:"👩",bio:"Kitob oqish va pishiriq",online:true,rating:4.9,vip:true,stories:["📚","🍰","🌸"],kasb:"Konditer, blogger",gifts:67,likes:312,seeking:"Kitob o'qishni, oshxonada yangi retseptlar sinab ko'rishni va tabiatda dam olishni yaxshi ko'raman. O'zimga o'xshash — tinch, oilaviy, maqsadli yigit bilan tanishmoqchiman. Turmush qurishga tayyor bo'lgan samimiy insonni qidiraman 💍📚",
    trust:{photo:95,bio:90,kasb:85,phone:100,id:100,activity:97,likeRatio:95,blockRatio:99}},
  {id:4,tgUserId:"456789012",name:"Mohira Toshmatova",age:27,city:"Namangan",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=41",emoji:"👩",bio:"Sport va sogrom turmush",online:true,rating:4.6,vip:false,stories:["🏋️","🥑","🧘"],kasb:"Fitness murabbiyi",gifts:9,likes:38,seeking:"Sog'lom turmush tarzi yuritadigan, sport bilan shug'ullanadigan yigit izlayapman. Birgalikda yugurish, velosipedda sayr va sog'lom ovqatlanish — mening hayot tarzim. Jiddiy munosabat uchun 💪🥗",
    trust:{photo:80,bio:75,kasb:70,phone:0,id:0,activity:78,likeRatio:74,blockRatio:88}},
  {id:5,tgUserId:"567890123",name:"Jasur Rahimov",age:24,city:"Toshkent shahri",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=12",emoji:"👨",bio:"Futbol va musiqa muxlisi",online:true,rating:4.6,vip:false,stories:["⚽","🎸","🌆"],kasb:"IT dasturchi",gifts:31,likes:142,seeking:"Hayotga ijobiy, quvnoq va o'z maqsadiga ega qiz bilan tanishmoqchiman. Musiqa, futbol va texnologiyani yaxshi ko'raman. Do'stona munosabatdan boshlangan jiddiy aloqani qidiraman 😊⚽",
    trust:{photo:85,bio:80,kasb:90,phone:100,id:0,activity:83,likeRatio:86,blockRatio:93}},
  {id:6,tgUserId:"678901234",name:"Bobur Xolmatov",age:26,city:"Samarqand",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=15",emoji:"👨",bio:"Biznes va sayohat",online:true,rating:4.4,vip:true,stories:["💼","✈️","🌍"],kasb:"Tadbirkor",gifts:54,likes:228,seeking:"O'z oldiga maqsad qo'ya oladigan, oilani qadrlaydigan, mustaqil fikrlaydigan qiz bilan jiddiy munosabat qurmoqchiman. Biznes va sayohat — mening dunyom, shu dunyoni birga kashf etgimiz keladi 💼✈️",
    trust:{photo:88,bio:82,kasb:85,phone:100,id:90,activity:87,likeRatio:89,blockRatio:91}},
  {id:7,name:"Malika Ergasheva",age:24,city:"Toshkent shahri",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=25",extraPhotos:["https://i.pravatar.cc/400?img=26","https://i.pravatar.cc/400?img=27"],emoji:"👩",bio:"Raqs, yoga va tabiat sevaman",online:true,rating:4.9,vip:true,stories:["🌿","💃","🧘"],kasb:"Yoga murabbiyi",seeking:"Tabiatni sevadigan, tinch va baxtli hayot qurishni xohlagan yigit izlayapman. Yoga, meditatsiya va sog'lom ovqatlanish — mening ustuvorliklarim. Oilaga sodiq, samimiy inson bilan uchrashmоqchiman 🧘🌿",
    gifts:88,likes:401,trust:{photo:98,bio:95,kasb:90,phone:100,id:100,activity:99,likeRatio:97,blockRatio:100}},
  {id:8,name:"Nilufar Xasanova",age:22,city:"Fargona",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=32",emoji:"👩",bio:"Musiqa va san'at ixlosmandi",online:false,rating:4.3,vip:false,stories:["🎵","🎨"],kasb:"Musiqachi",gifts:2,likes:11,seeking:"San'at va musiqa sevuvchi, ijodkor yigit bilan tanishmoqchiman. Shunchaki suhbatdosh yoki do'st sifatida boshlanamiz 🎵🎨",
    trust:{photo:60,bio:50,kasb:55,phone:0,id:0,activity:45,likeRatio:52,blockRatio:78}},
  {id:9,name:"Jasur Mirzayev",age:28,city:"Toshkent shahri",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=18",emoji:"👨",bio:"Sport va sog'lom hayot tarzi",online:true,rating:4.7,vip:false,stories:["🏃","💪"],kasb:"Murabbiyi",gifts:0,likes:4,
    trust:{photo:70,bio:65,kasb:60,phone:0,id:0,activity:55,likeRatio:40,blockRatio:70}},
  {id:10,name:"Sherzod Nazarov",age:29,city:"Toshkent shahri",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=20",emoji:"👨",bio:"Musiqa va san'at ixlosmandiman",online:true,rating:4.5,vip:true,stories:["🎸","🌆"],kasb:"Musiqachi, blogger",gifts:73,likes:295,seeking:"Hayotda ikki narsa muhim: sevgi va maqsad. Shu ikkisini bir insonda topmoqchiman. Musiqa, sayohat va ijodiy loyihalar bilan shug'ullanaman. Jiddiy, oilaviy munosabat uchun tayyorman 🎸❤️",
    trust:{photo:90,bio:85,kasb:88,phone:100,id:95,activity:91,likeRatio:90,blockRatio:94}},
  {id:11,name:"Feruza Umarova",age:22,city:"Fargona",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=36",emoji:"👩",bio:"Tabiat va sayr sevaman",online:true,rating:4.6,vip:false,stories:["🌸","🌿"],kasb:"Dizayner",gifts:6,likes:29,seeking:"Ijodkor, quvnoq va hayotga ochiq yigit bilan tanishmoqchiman. Do'stlik asosida munosabat qurishni afzal ko'raman 🌸",
    trust:{photo:78,bio:72,kasb:68,phone:0,id:0,activity:70,likeRatio:68,blockRatio:85}},
  {id:12,name:"Otabek Yusupov",age:25,city:"Namangan",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=22",emoji:"👨",bio:"Sport va sog'lom turmush",online:false,rating:4.3,vip:false,stories:["🏋️","🚴"],kasb:"Fitnes murabbiyi",gifts:0,likes:3,
    trust:{photo:55,bio:45,kasb:50,phone:0,id:0,activity:40,likeRatio:35,blockRatio:65}},
];

// Ishonchlilik hisoblash funksiyasi
const calcTrust = (user, extraLikes=0, extraBlocks=0) => {
  const t = user.trust || {};
  const keys = ['photo','bio','kasb','phone','id','activity','likeRatio','blockRatio'];
  // likeRatio va blockRatio ni like/block soniga qarab dinamik o'zgartir
  const dynamicLikeRatio = Math.min(100, (t.likeRatio||50) + Math.floor(extraLikes/5));
  const dynamicBlockRatio = Math.max(0, (t.blockRatio||80) - extraBlocks*8);
  const vals = keys.map(k=>{
    if(k==='likeRatio') return dynamicLikeRatio;
    if(k==='blockRatio') return dynamicBlockRatio;
    return t[k]||0;
  });
  const avg = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
  return Math.min(100, Math.max(1, avg));
};

const TRUST_CRITERIA = [
  {key:'photo',   icon:'📸', label:'Profil rasmi',        desc:'Haqiqiy va aniq rasm yuklangan'},
  {key:'bio',     icon:'📝', label:'Bio to\'ldirilgan',   desc:'O\'zi haqida ma\'lumot yozilgan'},
  {key:'kasb',    icon:'💼', label:'Kasbi ko\'rsatilgan', desc:'Ish soha va kasbi belgilangan'},
  {key:'phone',   icon:'📞', label:'Telefon tasdiqlangan',desc:'Haqiqiy telefon raqami ulangan'},
  {key:'id',      icon:'🪪', label:'ID tasdiqlanган',     desc:'Shaxsiy hujjat orqali tasdiqlangan'},
  {key:'activity',icon:'⚡', label:'Faollik darajasi',    desc:'Muntazam platformada faol'},
  {key:'likeRatio',icon:'❤️',label:'Yoqtirish nisbati',  desc:'Boshqalar tomonidan yoqtirilgan'},
  {key:'blockRatio',icon:'🛡️',label:'Bloklanmagan',      desc:'Foydalanuvchilar tomonidan kamdan blok'},
];

const DEMO_NEARBY = [
  {id:101,name:"Nilufar",age:23,gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=47",dist:120,angle:45,online:true,status:"Safoda tushlik qilmoqchiman"},
  {id:102,name:"Kamola",age:25,gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=45",dist:280,angle:160,online:true,status:"Parkda sayr qoshiling!"},
  {id:103,name:"Jasur",age:24,gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=12",dist:430,angle:230,online:false,status:""},
  {id:104,name:"Dildora",age:21,gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=44",dist:650,angle:300,online:true,status:"Velik minmoqchiman"},
  {id:105,name:"Bobur",age:26,gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=15",dist:820,angle:80,online:true,status:"Kinoga boramiz"},
  {id:106,name:"Mohira",age:27,gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=41",dist:500,angle:200,online:true,status:"Choyxonada otirganman"},
];

function Stars({r=4.5}) {
  return <span style={{color:C.gold,fontSize:13}}>{"★".repeat(Math.floor(r))}{"☆".repeat(5-Math.floor(r))} <span style={{fontSize:11,color:C.muted}}>{r}</span></span>;
}

// ============================================================
// ISHONCHLILIK KO'RSATKICHI KOMPONENTI
// ============================================================
function TrustMeter({ user, liked, blockedCount }) {
  const [showModal, setShowModal] = useState(false);
  const score = calcTrust(user, liked ? 1 : 0, blockedCount || 0);
  const isOk = score >= 50;
  const color = isOk ? "#22c55e" : "#ef4444";
  const t = user.trust || {};
  const dynamicLikeRatio = Math.min(100, (t.likeRatio||50) + Math.floor((liked?1:0)/5));
  const dynamicBlockRatio = Math.max(0, (t.blockRatio||80) - (blockedCount||0)*8);

  return (
    <>
      {/* MINI BADGE — faqat % va so'z */}
      <span
        onClick={()=>setShowModal(true)}
        style={{
          fontSize:12, fontWeight:700,
          color, cursor:"pointer",
          userSelect:"none"
        }}
      >
        {score}% {isOk ? "Ishonchli" : "Ishonchsiz"}
      </span>

      {/* BATAFSIL MODAL */}
      {showModal&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowModal(false)}>
          <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,padding:"20px 20px 36px",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontWeight:900,fontSize:17,color:"#1e293b"}}>🔍 Ishonchlilik darajasi</div>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{user.name}</div>
              </div>
              <button onClick={()=>setShowModal(false)} style={{background:"#f0f9ff",border:"none",borderRadius:"50%",width:32,height:32,fontSize:16,cursor:"pointer",color:"#94a3b8"}}>✕</button>
            </div>

            {/* Katta doira */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
              <div style={{position:"relative",width:110,height:110}}>
                <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:"rotate(-90deg)"}}>
                  <circle cx="55" cy="55" r="44" fill="none" stroke="#e2edf7" strokeWidth="9"/>
                  <circle cx="55" cy="55" r="44" fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={`${2*Math.PI*44}`}
                    strokeDashoffset={`${2*Math.PI*44*(1-score/100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:28,fontWeight:900,color}}>{score}%</div>
                  <div style={{fontSize:11,fontWeight:700,color}}>{isOk?"Ishonchli":"Ishonchsiz"}</div>
                </div>
              </div>
            </div>

            {/* Har bir mezon */}
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {TRUST_CRITERIA.map((cr)=>{
                const raw = cr.key==='likeRatio' ? dynamicLikeRatio
                  : cr.key==='blockRatio' ? dynamicBlockRatio
                  : (t[cr.key]||0);
                const crColor = raw>=80?"#22c55e":raw>=55?"#38bdf8":raw>=30?"#f59e0b":"#ef4444";
                return (
                  <div key={cr.key} style={{background:"#f8fafc",borderRadius:13,padding:"10px 13px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:16}}>{cr.icon}</span>
                        <div>
                          <div style={{fontWeight:700,fontSize:12,color:"#1e293b"}}>{cr.label}</div>
                          <div style={{fontSize:10,color:"#94a3b8"}}>{cr.desc}</div>
                        </div>
                      </div>
                      <div style={{fontWeight:800,fontSize:13,color:crColor}}>{raw}%</div>
                    </div>
                    <div style={{height:4,background:"#e2edf7",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",background:crColor,borderRadius:2,width:raw+"%"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{marginTop:12,background:"#f8fafc",borderRadius:12,padding:"11px 13px"}}>
              <div style={{fontSize:11,color:"#64748b",lineHeight:1.7}}>
                8 ta ko'rsatkich o'rtachasi · Like ko'paysa ball oshadi · Blok bo'lsa ball kamayadi<br/>
                <b style={{color:"#22c55e"}}>50%+</b> = Ishonchli · <b style={{color:"#ef4444"}}>50%-</b> = Ishonchsiz
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ============================================================

// ============================================================
// MAXSUS QIDIRUV KOMPONENTI
// ============================================================
function AdvancedSearch({ matches, msgs, blocked, users=[], onOpenChat, onOpenProfile, onLike, onDislike, onGift, onWave, onBlock }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Foydalanuvchi bilan muloqot qilinganmi?
  const hasConversation = (userId) => {
    return msgs && msgs[userId] && msgs[userId].length > 0;
  };

  // Do'stmi (match)?
  const isFriend = (userId) => matches.includes(userId);

  // Ramka rangi: do'st + muloqot = tanish (ayol=qizil, erkak=yashil), aks holda ko'k
  const getFrameColor = (user) => {
    const talked = hasConversation(user.id);
    const friend = isFriend(user.id);
    if (talked || friend) {
      return user.gender === "ayol" ? "#ef4444" : "#22c55e";
    }
    return "#3b82f6";
  };

  const getFrameLabel = (user) => {
    const talked = hasConversation(user.id);
    const friend = isFriend(user.id);
    if (friend && talked) return "💬 Do'st & Muloqot";
    if (friend) return "❤️ Do'st";
    if (talked) return "💬 Muloqot qilgan";
    return "👤 Yangi tanishuv";
  };

  const getFrameGlow = (user) => {
    const talked = hasConversation(user.id);
    const friend = isFriend(user.id);
    if (talked || friend) {
      return user.gender === "ayol"
        ? "0 0 18px rgba(239,68,68,0.55), 0 0 6px rgba(239,68,68,0.3)"
        : "0 0 18px rgba(34,197,94,0.55), 0 0 6px rgba(34,197,94,0.3)";
    }
    return "0 0 14px rgba(59,130,246,0.4), 0 0 4px rgba(59,130,246,0.2)";
  };

  const doSearch = (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    const lq = q.toLowerCase().trim();
    const filtered = users.filter(u =>
      !blocked.includes(u.id) &&
      u.name.toLowerCase().includes(lq)
    );
    const sorted = [...filtered].sort((a, b) => {
      const aScore = (matches.includes(a.id) ? 2 : 0) + (msgs[a.id]?.length > 0 ? 1 : 0);
      const bScore = (matches.includes(b.id) ? 2 : 0) + (msgs[b.id]?.length > 0 ? 1 : 0);
      return bScore - aScore;
    });
    setResults(sorted);
    setSearched(true);
  };

  const handleInput = (v) => {
    setQuery(v);
    doSearch(v);
  };

  // Rang legendasi
  const LEGENDS = [
    { color: "#ef4444", label: "Ayol — Siz bilan muloqot qilgan (tanish)", pulse: true },
    { color: "#22c55e", label: "Erkak — Siz bilan muloqot qilgan (tanish)", pulse: true },
    { color: "#3b82f6", label: "Yangi — Hali tanishmagan", pulse: false },
  ];

  return (
    <div style={{padding:"12px 14px"}}>

      {/* SARLAVHA */}
      <div style={{
        background:"linear-gradient(135deg,#1e293b,#0f172a)",
        borderRadius:20,
        padding:"18px 18px 14px",
        marginBottom:16,
        position:"relative",
        overflow:"hidden",
        boxShadow:"0 8px 32px rgba(56,189,248,0.18)"
      }}>
        {/* Decorative blobs */}
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(56,189,248,0.12)",filter:"blur(20px)"}}/>
        <div style={{position:"absolute",bottom:-20,left:-10,width:80,height:80,borderRadius:"50%",background:"rgba(255,110,180,0.1)",filter:"blur(15px)"}}/>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,position:"relative"}}>
          <div style={{
            width:42,height:42,borderRadius:12,
            background:"linear-gradient(135deg,#38bdf8,#ff6eb4)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,
            boxShadow:"0 4px 14px rgba(56,189,248,0.35)"
          }}>🔎</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:17}}>Maxsus Qidiruv</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:1}}>Ism yoki familiya bo'yicha qidiring</div>
          </div>
        </div>

        {/* SEARCH INPUT */}
        <div style={{
          display:"flex",alignItems:"center",gap:10,
          background:focused?"rgba(56,189,248,0.12)":"rgba(255,255,255,0.06)",
          border:"1.5px solid "+(focused?"#38bdf8":"rgba(255,255,255,0.12)"),
          borderRadius:14,padding:"10px 14px",
          transition:"all 0.2s",
          boxShadow:focused?"0 0 0 3px rgba(56,189,248,0.15)":"none"
        }}>
          <span style={{fontSize:18,opacity:0.7}}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Masalan: Nilufar, Jasur Rahimov..."
            style={{
              flex:1,background:"transparent",border:"none",
              color:"#fff",fontSize:15,outline:"none",
              fontFamily:"Nunito,sans-serif",
              fontWeight:600
            }}
          />
          {query.length > 0 && (
            <button onClick={()=>{setQuery("");setResults([]);setSearched(false);inputRef.current?.focus();}}
              style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:24,height:24,color:"#fff",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              ✕
            </button>
          )}
        </div>

        {/* Ramka rangi izohlar */}
        <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5,position:"relative"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:700,marginBottom:2,letterSpacing:0.5}}>RAMKA RANGI MA'NOSI</div>
          {LEGENDS.map((l,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{
                width:14,height:14,borderRadius:"50%",
                background:l.color,flexShrink:0,
                boxShadow:"0 0 8px "+l.color+"88"
              }}/>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NATIJALAR */}
      {!searched && !query && (
        <div style={{textAlign:"center",padding:"30px 20px"}}>
          <div style={{fontSize:56,marginBottom:12,opacity:0.4}}>🔍</div>
          <div style={{fontWeight:800,fontSize:16,color:C.muted,marginBottom:6}}>Qidirishni boshlang</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>
            Ism yoki familiyani kiriting.<br/>
            Do'stlaringiz birinchi ko'rinadi.
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div style={{textAlign:"center",padding:"30px 20px"}}>
          <div style={{fontSize:56,marginBottom:12}}>😔</div>
          <div style={{fontWeight:800,fontSize:16,color:C.text,marginBottom:6}}>Topilmadi</div>
          <div style={{fontSize:13,color:C.muted}}>
            "<b style={{color:C.accent}}>{query}</b>" nomli foydalanuvchi yo'q yoki bloklangan.
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            marginBottom:12
          }}>
            <div style={{fontWeight:800,fontSize:14,color:C.text}}>
              {results.length} ta natija
            </div>
            <div style={{fontSize:11,color:C.muted}}>
              Do'stlar birinchi ko'rinadi
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {results.map((user, idx) => {
              const frameColor = getFrameColor(user);
              const frameGlow = getFrameGlow(user);
              const frameLabel = getFrameLabel(user);
              const friend = isFriend(user.id);
              const talked = hasConversation(user.id);
              const isNew = !friend && !talked;

              return (
                <div key={user.id} onClick={()=>onOpenProfile(user)} style={{
                  background:"#fff",
                  borderRadius:20,
                  overflow:"hidden",
                  border:"2px solid "+frameColor+"44",
                  boxShadow:"0 4px 16px rgba(56,189,248,0.08)",
                  animation:`slideUp 0.3s ease ${idx*0.07}s both`,
                  cursor:"pointer"
                }}>
                  {/* Top renkli chiziq */}
                  <div style={{
                    height:3,
                    background:`linear-gradient(90deg, ${frameColor}, ${frameColor}88, transparent)`
                  }}/>

                  <div style={{padding:"12px 14px",display:"flex",gap:14,alignItems:"flex-start"}}>

                    {/* RASM + RAMKA */}
                    <div style={{position:"relative",flexShrink:0,cursor:"pointer"}} onClick={()=>onOpenProfile(user)}>
                      {/* Tashqi glow ring */}
                      <div style={{
                        position:"absolute",inset:-3,
                        borderRadius:"50%",
                        background:`conic-gradient(${frameColor}, ${frameColor}88, ${frameColor}44, ${frameColor})`,
                        padding:2
                      }}/>
                      <div style={{
                        width:68,height:68,borderRadius:"50%",
                        overflow:"hidden",cursor:"pointer",
                        border:`3px solid ${frameColor}`,
                        boxShadow:frameGlow,
                        position:"relative",zIndex:1,
                        background:"#f0f9ff"
                      }}>
                        {user.demoPhoto
                          ? <img src={user.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <span style={{fontSize:36}}>{user.emoji}</span>
                        }
                      </div>

                      {/* Online dot */}
                      {user.online && (
                        <div style={{
                          position:"absolute",bottom:2,right:2,
                          width:14,height:14,borderRadius:"50%",
                          background:C.green,border:"2.5px solid #fff",
                          zIndex:2,
                          boxShadow:"0 0 6px "+C.green+"99"
                        }}/>
                      )}

                      {/* VIP badge */}
                      {user.vip && (
                        <div style={{
                          position:"absolute",top:-2,left:-2,
                          background:"linear-gradient(135deg,#f59e0b,#fbbf24)",
                          borderRadius:"50%",width:20,height:20,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:10,border:"2px solid #fff",zIndex:2
                        }}>👑</div>
                      )}
                    </div>

                    {/* MA'LUMOTLAR */}
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>onOpenProfile(user)}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <div style={{fontWeight:900,fontSize:16,color:C.accent,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:"underline dotted",textDecorationColor:frameColor+"66"}}>
                          {/* Faqat birinchi ism */}
                          {(()=>{
                            const firstName = user.name.split(" ")[0];
                            const lq = query.toLowerCase();
                            const idx2 = firstName.toLowerCase().indexOf(lq);
                            if (idx2 === -1) return firstName;
                            return (
                              <>
                                {firstName.slice(0,idx2)}
                                <span style={{background:"#fef08a",color:"#854d0e",borderRadius:4,padding:"0 2px"}}>{firstName.slice(idx2,idx2+query.length)}</span>
                                {firstName.slice(idx2+query.length)}
                              </>
                            );
                          })()}
                        </div>
                        {user.vip && <span style={{fontSize:11,color:C.gold}}>VIP</span>}
                      </div>

                      <div style={{fontSize:12,color:C.muted,marginBottom:4}}>
                        {user.age} yosh · 📍 {user.city}
                      </div>

                      {/* Munosabat belgisi */}
                      <div style={{
                        display:"inline-flex",alignItems:"center",gap:5,
                        background:isNew?"#eff6ff":(user.gender==="ayol"?"#fef2f2":"#f0fdf4"),
                        border:"1px solid "+(isNew?"#bfdbfe":(user.gender==="ayol"?"#fecaca":"#bbf7d0")),
                        borderRadius:20,padding:"3px 10px",marginBottom:6
                      }}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:frameColor,boxShadow:"0 0 5px "+frameColor}}/>
                        <span style={{fontSize:10,fontWeight:700,color:frameColor}}>{frameLabel}</span>
                      </div>

                      <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.kasb}</div>
                    </div>
                  </div>

                  {/* TUGMALAR */}
                  <div style={{
                    display:"flex",borderTop:"1px solid "+C.border,
                    background:"#fafafa"
                  }}>
                    {[
                      {icon:"👁️", label:"Ko'rish", color:C.sky, fn:(e)=>{e.stopPropagation();onOpenProfile(user);}},
                      ...(talked || friend
                        ? [{icon:"💬", label:"Xabar", color:"#8b5cf6", fn:(e)=>{e.stopPropagation();onOpenChat(user.id);}}]
                        : [{icon:"👋", label:"Salom", color:C.accent, fn:(e)=>{e.stopPropagation();onWave(user);}}]
                      ),
                      {icon:"🎁", label:"Sovga", color:C.gold, fn:(e)=>{e.stopPropagation();onGift(user);}},
                      ...(friend
                        ? []
                        : [{icon:"❤️", label:"Yoqtir", color:C.accent, fn:(e)=>{e.stopPropagation();onLike(user.id);}}]
                      ),
                      {icon:"🚫", label:"Blok", color:"#94a3b8", fn:(e)=>{e.stopPropagation();onBlock(user);}},
                    ].map((btn,i,arr)=>(
                      <button key={i} onClick={btn.fn} style={{
                        flex:1,padding:"10px 4px",
                        background:"transparent",border:"none",
                        borderRight:i<arr.length-1?"1px solid "+C.border:"none",
                        cursor:"pointer",
                        display:"flex",flexDirection:"column",alignItems:"center",gap:3
                      }}>
                        <span style={{fontSize:18}}>{btn.icon}</span>
                        <span style={{fontSize:9,color:btn.color,fontWeight:700}}>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statistika */}
          <div style={{
            marginTop:16,background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",
            borderRadius:14,padding:"12px 16px",
            border:"1px solid "+C.border,
            display:"flex",gap:16,justifyContent:"center"
          }}>
            {[
              {icon:"❤️",label:"Do'stlar",count:results.filter(u=>isFriend(u.id)).length,color:C.accent},
              {icon:"💬",label:"Muloqot",count:results.filter(u=>hasConversation(u.id)&&!isFriend(u.id)).length,color:"#8b5cf6"},
              {icon:"👤",label:"Yangilar",count:results.filter(u=>!isFriend(u.id)&&!hasConversation(u.id)).length,color:C.sky},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:20}}>{s.icon}</div>
                <div style={{fontWeight:900,fontSize:18,color:s.color}}>{s.count}</div>
                <div style={{fontSize:10,color:C.muted}}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
// ============================================================

export default function App() {
  const [lang, setLang] = useState("uz");
  const T = LANGS[lang];
  const [tab, setTab] = useState("discover");
  const [discoverSubTab, setDiscoverSubTab] = useState("cards");
  const [firstLoad, setFirstLoad] = useState(true);

  // ── SUPABASE ─────────────────────────────────────────────
  const [sb, setSb] = useState(null);
  const [myUserId] = useState(() => getMyUserId());
  const [dbReady, setDbReady] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const realtimeRef = useRef([]);

  useEffect(() => {
    initSupabase().then(async (client) => {
      setSb(client);
      const tgUser = getTgUser();

      // Foydalanuvchini ro'yxatdan o'tkazish
      const { data: existing } = await client.from('users').select('id').eq('id', myUserId).maybeSingle();
      if (!existing) {
        await client.from('users').insert({ id: myUserId, telegram_id: tgUser?.id || null, name: tgUser?.first_name || 'Foydalanuvchi', online: true }).catch(()=>{});
      } else {
        await client.from('users').update({ online: true, last_seen: new Date().toISOString() }).eq('id', myUserId).catch(()=>{});
      }
      setDbReady(true);

      // ── REALTIME: Yangi xabarlar ──────────────────────
      const msgSub = client.channel(`msgs-${myUserId}`)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`receiver_id=eq.${myUserId}` },
          (p) => {
            const m = p.new;
            const t = new Date(m.created_at||Date.now()).toLocaleTimeString('uz',{hour:'2-digit',minute:'2-digit'});
            setMsgs(prev => {
              const existing = prev[m.sender_id]||[];
              if(existing.some(x=>x.id===m.id)) return prev;
              return {...prev, [m.sender_id]: [...existing, {id:m.id, from:'them', text:m.text, time:t, type:m.msg_type&&m.msg_type!=='text'?m.msg_type:undefined, payload:m.payload}]};
            });
          })
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'messages', filter:`receiver_id=eq.${myUserId}` },
          (p) => {
            const m = p.new;
            if (m.deleted) {
              setMsgs(prev => { const u={...prev}; Object.keys(u).forEach(k=>{ u[k]=(u[k]||[]).filter(x=>x.id!==m.id); }); return u; });
            } else if (m.edited) {
              setMsgs(prev => { const u={...prev}; Object.keys(u).forEach(k=>{ u[k]=(u[k]||[]).map(x=>x.id===m.id?{...x,text:m.text,edited:true}:x); }); return u; });
            }
          })
        .subscribe();

      // ── REALTIME: Match ───────────────────────────────
      const matchSub = client.channel(`matchs-${myUserId}`)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'matches' },
          (p) => {
            const m = p.new;
            const other = m.user1_id === myUserId ? m.user2_id : m.user1_id;
            if (m.user1_id === myUserId || m.user2_id === myUserId) {
              setMatches(prev => prev.includes(other) ? prev : [...prev, other]);
              toast$('🎉 Yangi match!', '#22c55e');
            }
          })
        .subscribe();

      // ── REALTIME: GO elonlar ──────────────────────────
      const goSub = client.channel(`goinvs-${myUserId}`)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'go_invites' },
          (p) => {
            const inv = p.new;
            if (inv.user_id !== myUserId) {
              setGoInvites(prev => [{id:inv.id, userId:inv.user_id, name:inv.user_name||'Foydalanuvchi', demoPhoto:inv.user_photo, type:inv.type, text:inv.title+(inv.description?' — '+inv.description:''), city:inv.city||'Toshkent', time:inv.event_time||'—', date:inv.event_date||'—', audience:inv.audience||'barchasi', likes:0}, ...prev]);
              toast$('📍 Yangi uchrashuv taklifi!', '#22c55e');
            }
          })
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'go_invites' },
          (p) => { const inv=p.new; setGoInvites(prev=>prev.map(i=>i.id===inv.id?{...i,likes:inv.likes_count}:i)); })
        .subscribe();

      // ── REALTIME: Online ──────────────────────────────
      const onlineSub = client.channel(`onlines-${myUserId}`)
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'users' },
          (p) => { setOnlineUsers(prev => ({...prev, [p.new.id]: p.new.online})); })
        .subscribe();

      // ── REALTIME: Sovgalar ────────────────────────────
      const giftSub = client.channel(`gifts-${myUserId}`)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'gifts', filter:`to_user_id=eq.${myUserId}` },
          (p) => { const g=p.new; setIncomingGift({ from:{name:'Kimdir',id:g.from_user_id}, gift:{emoji:g.emoji,name:g.gift_type,price:g.price}, note:g.note }); })
        .subscribe();

      // ── REALTIME: Like bildirishnoma ──────────────────
      const likeSub = client.channel(`likes-${myUserId}`)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'likes', filter:`to_user_id=eq.${myUserId}` },
          (p) => {
            const fromId = p.new.from_user_id;
            setLikeNotif(prev => {
              const fromUser = {name:'Kimdir', emoji:'❤️', demoPhoto:null, city:''};
              return {user: fromUser, time: new Date()};
            });
            setTimeout(() => setLikeNotif(null), 5000);
          })
        .subscribe();

      realtimeRef.current = [msgSub, matchSub, goSub, onlineSub, giftSub, likeSub];

      // Online yuborishni davom ettirish
      const iv = setInterval(() => client.from('users').update({online:true,last_seen:new Date().toISOString()}).eq('id',myUserId).catch(()=>{}), 180000);
      const handleUnload = () => client.from('users').update({online:false}).eq('id',myUserId).catch(()=>{});
      window.addEventListener('beforeunload', handleUnload);

      return () => { realtimeRef.current.forEach(s=>s.unsubscribe()); clearInterval(iv); window.removeEventListener('beforeunload',handleUnload); };
    }).catch(() => setDbReady(true));
  }, []);

  // ── SUPABASE: Profilni yuklash ──────────────────────────
  useEffect(()=>{
    if(!sb || !myUserId) return;
    sb.from('users').select('*').eq('id', myUserId).maybeSingle().then(({data})=>{
      if(data){
        const loaded = {
          name:       data.name       || '',
          firstName:  (data.name||'').split(' ')[0]            || '',
          lastName:   (data.name||'').split(' ').slice(1).join(' ') || '',
          age:        data.age        ? String(data.age)  : '',
          city:       data.city       || '',
          gender:     data.gender     || '',
          bio:        data.bio        || '',
          kasb:       data.kasb       || '',
          height:     data.height     ? String(data.height) : '',
          weight:     data.weight     ? String(data.weight) : '',
          seeking:    data.seeking    || '',
          tgUsername: data.tg_username|| '',
          tgUserId:   data.tg_id      ? String(data.tg_id) : '',
        };
        setProfile(p=>({...p, ...loaded}));
        setForm(p=>({...p, ...loaded}));
        if(data.photo_url) setProfilePhoto(data.photo_url);
        if(data.extra_photos) setMyPhotos(data.extra_photos||[]);
      }
    }).catch(()=>{});
  },[sb, myUserId]);

  // ── SUPABASE: Mavjud matchlarni yuklash ─────────────────
  useEffect(()=>{
    if(!sb || !myUserId) return;
    sb.from('matches')
      .select('user1_id,user2_id')
      .or(`user1_id.eq.${myUserId},user2_id.eq.${myUserId}`)
      .then(({data})=>{
        if(!data || !data.length) return;
        const ids = data.map(m => m.user1_id===myUserId ? m.user2_id : m.user1_id);
        setMatches(prev => [...new Set([...prev, ...ids])]);
      }).catch(()=>{});
  },[sb, myUserId]);

  // ── SUPABASE: Xabar tarixini yuklash ────────────────────
  useEffect(()=>{
    if(!sb || !myUserId) return;
    sb.from('messages')
      .select('*')
      .or(`sender_id.eq.${myUserId},receiver_id.eq.${myUserId}`)
      .order('created_at', {ascending:true})
      .limit(300)
      .then(({data})=>{
        if(!data || !data.length) return;
        setMsgs(prev=>{
          const next = {...prev};
          data.forEach(m=>{
            const isMe    = m.sender_id === myUserId;
            const partner = isMe ? m.receiver_id : m.sender_id;
            if(!next[partner]) next[partner] = [];
            if(next[partner].some(x => x.id === m.id)) return;
            const t = new Date(m.created_at||Date.now()).toLocaleTimeString('uz',{hour:'2-digit',minute:'2-digit'});
            next[partner].push({
              id:      m.id,
              from:    isMe ? 'me' : 'them',
              text:    m.text,
              time:    t,
              read:    isMe || !!m.read,
              type:    m.msg_type && m.msg_type!=='text' ? m.msg_type : undefined,
              payload: m.payload,
            });
          });
          return next;
        });
      }).catch(()=>{});
  },[sb, myUserId]);

  // ── SUPABASE: Real foydalanuvchilarni yuklash ───────────
  const [realUsers, setRealUsers] = useState([]);
  useEffect(()=>{
    if(!sb) return;
    sb.from('users').select('*').neq('id', myUserId).limit(50).then(({data})=>{
      if(data && data.length > 0){
        setRealUsers(data.map(u=>({
          id: u.id,
          name: u.name||'Foydalanuvchi',
          age: u.age||25,
          city: u.city||'Toshkent',
          gender: u.gender||'erkak',
          bio: u.bio||'',
          kasb: u.kasb||'',
          height: u.height||'',
          weight: u.weight||'',
          demoPhoto: u.photo_url||null,
          extraPhotos: u.extra_photos||[],
          emoji: u.gender==='ayol'?'👩':'👨',
          online: u.online||false,
          rating: u.rating||4.5,
          vip: u.vip||false,
          tgUserId: u.tg_id||'',
          tgUsername: u.tg_username||'',
          seeking: u.seeking||'',
        })));
      }
    }).catch(()=>{});

    // Realtime: yangi foydalanuvchi qo'shilsa
    const userSub = sb.channel('users-ch')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'users'},
        (p)=>{
          if(p.new.id === myUserId) return;
          setRealUsers(prev=>{
            if(prev.find(u=>u.id===p.new.id)) return prev;
            return [...prev, {
              id:p.new.id, name:p.new.name||'Yangi', age:p.new.age||25,
              city:p.new.city||'Toshkent', gender:p.new.gender||'erkak',
              demoPhoto:p.new.photo_url||null, extraPhotos:p.new.extra_photos||[],
              emoji:p.new.gender==='ayol'?'👩':'👨',
              online:p.new.online||false, rating:p.new.rating||4.5,
              vip:p.new.vip||false, tgUserId:p.new.tg_id||'',
              tgUsername:p.new.tg_username||'',
            }];
          });
        })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'users'},
        (p)=>{
          if(p.new.id === myUserId) return;
          setRealUsers(prev=>prev.map(u=>u.id===p.new.id?{
            ...u, name:p.new.name||u.name, age:p.new.age||u.age,
            city:p.new.city||u.city, gender:p.new.gender||u.gender,
            demoPhoto:p.new.photo_url||u.demoPhoto,
            extraPhotos:p.new.extra_photos||u.extraPhotos,
            online:p.new.online||false, vip:p.new.vip||false,
            rating:p.new.rating||u.rating, kasb:p.new.kasb||u.kasb,
            bio:p.new.bio||u.bio, seeking:p.new.seeking||u.seeking,
            tgUserId:p.new.tg_id||u.tgUserId,
            tgUsername:p.new.tg_username||u.tgUsername,
          }:u));
        })
      .subscribe();

    return ()=>userSub.unsubscribe();
  },[sb]);

  // Real + demo foydalanuvchilarni birlashtirish
  const ALL_USERS = useMemo(()=>{
    const realIds = new Set(realUsers.map(u=>String(u.id)));
    const demoFiltered = USERS.filter(u=>!realIds.has(String(u.id)));
    return [...realUsers, ...demoFiltered];
  },[realUsers]);

  const [profile, setProfile] = useState({name:"Demo Foydalanuvchi",age:"25",city:"Toshkent shahri",gender:"erkak",bio:"Demo rejim",kasb:"Dasturchi",seeking:"Do'st",height:"",weight:""});
  const [form, setForm] = useState(()=>{
    const tg = getTgUser();
    return {
      name: tg ? ((tg.first_name||"")+" "+(tg.last_name||"")).trim() : "",
      firstName: tg?.first_name || "",
      lastName: tg?.last_name || "",
      age:"", city:"", bio:"", gender:"",
      district:"", millat:"", phone:"",
      phoneAnon:false, goal:"", hobbies:[],
      married:"yoq", children:"yoq", kasb:"",
      seeking:"", height:"", weight:"",
      tgUsername: tg?.username || "",
      tgUserId: tg?.id ? String(tg.id) : "",
    };
  });
  const [matches, setMatches] = useState([1,2]);
  const [liked, setLiked] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [blockedTypes, setBlockedTypes] = useState({});
  const [msgs, setMsgs] = useState({1:[{from:"them",text:"Salom! 😊",time:"14:30"}],2:[{from:"them",text:"Assalomu alaykum!",time:"12:15"}]});
  const [chat, setChat] = useState(null);
  const [input, setInput] = useState("");
  const [coins, setCoins] = useState(150);
  const [vip, setVip] = useState(false);
  const [giftModal, setGiftModal] = useState(null);
  const [giftNote, setGiftNote] = useState("");
  const [stickers, setStickers] = useState(false);
  const [stickerTab, setStickerTab] = useState("emoji");
  const [mediaPanel, setMediaPanel] = useState(false);
  const [videoCall, setVideoCall] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(null);
  const [detailPhotoIdx, setDetailPhotoIdx] = useState(0);
  const [cardI, setCardI] = useState(0);
  const [swipe, setSwipe] = useState(null);
  const [cardMenu, setCardMenu] = useState(null);
  const [giftAnim, setGiftAnim] = useState(null);
  const [toast, setToast] = useState(null);
  const [ageF, setAgeF] = useState([18,99]);
  const [cityF, setCityF] = useState("Barchasi");
  const [genderF, setGenderF] = useState("Barchasi");
  const [story, setStory] = useState(null);
  const [storyI, setStoryI] = useState(0);
  const [myStories, setMyStories] = useState([]);
  const [storyAudience, setStoryAudience] = useState("barchasi");
  const [showAddStory, setShowAddStory] = useState(false);
  const [myLocationStatus, setMyLocationStatus] = useState("");
  const [locationSharing, setLocationSharing] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(500);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    likes: true,
    views: true,
    gifts: true,
    blocks: true,
    messages: true,
    matches: true,
  });
  const [showBlockModal, setShowBlockModal] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(null);
  const [complaintReason, setComplaintReason] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [complaintScreenshot, setComplaintScreenshot] = useState(null);
  const [complaintSent, setComplaintSent] = useState(false);
  const [showWaveModal, setShowWaveModal] = useState(null);
  const [waveComment, setWaveComment] = useState("");
  const [incomingWave, setIncomingWave] = useState(null);
  const [incomingGift, setIncomingGift] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [goInvites, setGoInvites] = useState([
    {id:1,userId:1,name:"Nilufar",demoPhoto:"https://i.pravatar.cc/400?img=47",type:"🎬 Kino",text:"Bugun kechqurun kinoga borishni xohlaysizmi?",city:"Toshkent",time:"19:00",date:"Bugun",likes:12,audience:"erkaklar",urgent:true},
    {id:2,userId:3,name:"Dildora",demoPhoto:"https://i.pravatar.cc/400?img=44",type:"🍽️ Ovqatlanish",text:"Toshkentda birgalikda tushlik qilishni taklif etaman",city:"Toshkent",time:"13:00",date:"Ertaga",likes:8,audience:"erkaklar",urgent:false},
    {id:3,userId:5,name:"Jasur",demoPhoto:"https://i.pravatar.cc/400?img=12",type:"🌳 Parkka",text:"Yangi Ozbekiston bogida sayrga taklif! Havo yaxshi",city:"Toshkent",time:"17:00",date:"Shanba",likes:21,audience:"ayollar",urgent:false},
  ]);
  const [myInviteCount, setMyInviteCount] = useState(0);
  const [lastInviteTime, setLastInviteTime] = useState(null);
  const [showBadWordWarn, setShowBadWordWarn] = useState(false);
  const [newInvite, setNewInvite] = useState({type:"🎬 Kino",text:"",time:"",date:"",audience:"barchasi"});
  const [showAddInvite, setShowAddInvite] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showAllChamps, setShowAllChamps] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [surveyDone, setSurveyDone] = useState(false);
  const [surveyStarted, setSurveyStarted] = useState(false);
  const SURVEY = [
    {id:1,q:"Siz online tanishuv platformasidan oldin ham foydalanganmisiz?",opts:["Ha, boshqa platformalarda faolman","Yo'q, men foydalanmayman","Umrimda birinchi marta"]},
    {id:2,q:"Siz online tanishuv va do'stlashuvni qanday baholaysiz?",opts:["Ha, buni yaxshi ko'raman","Normal holat","Yomon ko'raman","Bu yomon narsa"]},
    {id:3,q:"Siz bu yerda aynan kimni qidirmoqdasiz?",opts:["Do'st / Dugona","Munosabatlar uchun yigit yoki qiz","Turmush qurish uchun inson","Shunchaki suhbatdosh"]},
    {id:4,q:"Siz qidirayotgan insoningizni tasavvur qilib ko'rganmisiz?",opts:["Ha, mening o'z tasavvurim bor","Yo'q, menga muhim emas","Endi o'ylab ko'raman","Naf olsa bo'ldi"]},
  ];
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showGiftShop, setShowGiftShop] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const [seenTabs, setSeenTabs] = useState({});
  const [tabHint, setTabHint] = useState(null);

  const TAB_HINTS = {
    discover:{icon:"🔍",title:"Qidiruv bo'limi",desc:"Bu yerda yangi do'stlar topasiz! Kartochkalar bo'yicha yoki 🔎 Maxsus Qidiruv orqali ism bo'yicha qidiring. ❤️ Dost tugmasi bilan yoqtirsangiz, ✕ bilan o'tkazib yuboring.",color:"#ff6eb4"},
    matches:{icon:"🖍️",title:"Lichka bo'limi",desc:"Bu yerda matchlar va do'stlaringiz! Rasmiga bosib profilini ko'ring, ismiga bosib xabar yozing. Stikerlar, GIF va sovgalar yuborishingiz mumkin! 💬",color:"#8b5cf6"},
    go:{icon:"🚀",title:"GO bo'limi",desc:"Real uchrashuv takliflari! Kinoga, tushlikka, parkka birga borishni taklif qiling. Lokatsiyani yoqib atrofingizdagilarni toping! 📍",color:"#22c55e"},
    menu:{icon:"☰",title:"Asosiy menyu",desc:"Bu yerda profil, do'stlarni taklif qilish, so'rovnoma va boshqa bo'limlar mavjud!",color:"#38bdf8"},
    shop:{icon:"🛒",title:"Do'kon bo'limi",desc:"Tangalar sotib olish, sovga yuborish va real mukofotlarga tanga almashtirish! 👑",color:"#f59e0b"},
    profile:{icon:"👤",title:"Profil bo'limi",desc:"Shaxsiy ma'lumotlaringizni to'ldiring! Profilingiz to'liqroq bo'lsa — ko'proq matchlar olasiz! ✨",color:"#ec4899"},
  };
  const [giftShopTab, setGiftShopTab] = useState("ayol");
  const CHAMPIONS = [
    {rank:1,name:"Sherzod A.",count:47,earned:4820,avatar:"👨"},{rank:2,name:"Malika T.",count:38,earned:3900,avatar:"👩"},
    {rank:3,name:"Bobur X.",count:31,earned:3180,avatar:"👨"},{rank:4,name:"Dildora M.",count:26,earned:2660,avatar:"👩"},
    {rank:5,name:"Jasur K.",count:22,earned:2240,avatar:"👨"},{rank:6,name:"Kamola S.",count:19,earned:1940,avatar:"👩"},
    {rank:7,name:"Ulug'bek R.",count:17,earned:1740,avatar:"👨"},{rank:8,name:"Feruza N.",count:15,earned:1520,avatar:"👩"},
    {rank:9,name:"Sanjar O.",count:14,earned:1440,avatar:"👨"},{rank:10,name:"Zulfiya H.",count:12,earned:1220,avatar:"👩"},
  ];
  const [referralFriends, setReferralFriends] = useState([
    {id:1,name:"Jasur",joined:"3 kun oldin",active:true,days:12,bonus:120,avatar:"👨"},
    {id:2,name:"Nilufar",joined:"7 kun oldin",active:false,days:6,bonus:20,avatar:"👩"},
    {id:3,name:"Bobur",joined:"1 kun oldin",active:false,days:1,bonus:20,avatar:"👨"},
  ]);
  const myReferralCode = "LOVEHUB_" + (profile?.name||"USER").toUpperCase().slice(0,5).replace(/[^A-Z]/g,"X") + "777";
  const referralEarned = referralFriends.reduce((s,f)=>s+f.bonus,0);
  const [showCardFilter, setShowCardFilter] = useState(false);
  const [showTopList, setShowTopList] = useState(false);
  const [topListTab, setTopListTab] = useState("ayol");
  const [showStats, setShowStats] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminLogin, setAdminLogin] = useState("");
  const [adminTab, setAdminTab] = useState("users");
  const [adminSelectedUser, setAdminSelectedUser] = useState(null);
  const ADMIN_LOGIN = "admin";
  const ADMIN_PASSWORD = "pepeadmin";
  const [matchGenderTab, setMatchGenderTab] = useState("all");
  const [pinnedChats, setPinnedChats] = useState([]);
  const [archivedChats, setArchivedChats] = useState([]);
  const [matchSearch, setMatchSearch] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [chatVoiceRecording, setChatVoiceRecording] = useState(false);
  const [chatVoiceMR, setChatVoiceMR] = useState(null);
  const [tgRequests, setTgRequests] = useState({});
  const [showTgModal, setShowTgModal] = useState(null);
  const [chatMenuOpen, setChatMenuOpen] = useState(null);
  const [chatBgs, setChatBgs] = useState({});
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [showGoRequestModal, setShowGoRequestModal] = useState(null);
  const [activityTab, setActivityTab] = useState("likes");
  const [activityPeriod, setActivityPeriod] = useState("1d");
  const [likeNotif, setLikeNotif] = useState(null);
  const [detailExpandModal, setDetailExpandModal] = useState(null); // "seeking" | "voice" // {user, time}
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceVerified, setVoiceVerified] = useState(false);
  const [voiceDeclined, setVoiceDeclined] = useState(false);
  const [voiceMediaRecorder, setVoiceMediaRecorder] = useState(null);
  const [voiceInterval, setVoiceInterval] = useState(null);
  const [photoViewer, setPhotoViewer] = useState(null);
  const [photoCheckLoading, setPhotoCheckLoading] = useState(false);
  const [myPhotos, setMyPhotos] = useState([]);
  const [msgMenu, setMsgMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null); // {chatId, idx}
  const [editText, setEditText] = useState("");
  const [showGoFilter, setShowGoFilter] = useState(false);
  const [goGenderFilter, setGoGenderFilter] = useState("barchasi");
  const [goCityFilter, setGoCityFilter] = useState("Barchasi");
  const [goDistrictFilter, setGoDistrictFilter] = useState("Barchasi");
  const [goMainTab, setGoMainTab] = useState("all");
  const [goComments, setGoComments] = useState({}); // {invId: [{id, userId, name, photo, text, time}]}
  const [goCommentInput, setGoCommentInput] = useState({}); // {invId: text}
  const [showGoComments, setShowGoComments] = useState(null); // invId
  const [eventForm, setEventForm] = useState({title:"",type:"🎬 Kino",desc:"",date:"",time:"",location:"",audience:"barchasi",maxPeople:""});
  const [goFilter, setGoFilter] = useState("Barchasi");

  const endRef = useRef(null);
  const storyTimer = useRef(null);
  const fileRef = useRef(null);
  const fileTypeRef = useRef(null);
  const storyFileRef = useRef(null);
  const profilePhotoRef = useRef(null);
  const complaintFileRef = useRef(null);

  useEffect(() => { if(firstLoad){setFirstLoad(false);setTabHint("discover");} }, []);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [chat, msgs]);

  // Chat ochilganda kelgan xabarlarni "o'qildi" deb belgilash
  useEffect(()=>{
    if(!chat) return;
    setMsgs(p=>({
      ...p,
      [chat]:(p[chat]||[]).map(m=>
        m.from!=="me" && !m.read ? {...m, read:true} : m
      )
    }));
  },[chat]);

  const checkTabHint = (tabKey) => { if(!seenTabs[tabKey] && TAB_HINTS[tabKey]) setTabHint(tabKey); };
  const toast$ = (msg, color=C.accent) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  const users = ALL_USERS.filter(u=>u.age>=ageF[0]&&u.age<=ageF[1]&&(cityF==="Barchasi"||u.city===cityF)&&(genderF==="Barchasi"||u.gender===genderF)&&!blocked.includes(u.id));
  const cur = users[cardI % Math.max(users.length,1)];

  const like = id => {
    setSwipe("right");
    setTimeout(async ()=>{
      setSwipe(null); setLiked(p=>[...p,id]);

      // Supabase ga like saqlash
      let isMatch = false;
      if(sb && myUserId) {
        const toId = String(id);
        await sb.from('likes').upsert({from_user_id:myUserId, to_user_id:toId}).catch(()=>{});
        // O'zaro like tekshirish
        const { data } = await sb.from('likes').select('id').eq('from_user_id',toId).eq('to_user_id',myUserId).maybeSingle().catch(()=>({data:null}));
        if(data) {
          const [u1,u2] = [myUserId,toId].sort();
          await sb.from('matches').upsert({user1_id:u1, user2_id:u2}).catch(()=>{});
          isMatch = true;
        }
      } else {
        isMatch = Math.random() > 0.4;
      }

      if(isMatch){ setMatches(p=>[...p,id]); toast$("🎉 Yangi match!",C.green); }
      else toast$("Like bosildingiz! ❤️");
      setCardI(p=>p+1); setCardMenu(null);
    },400);
  };
  const dislike = () => { setSwipe("left"); setTimeout(()=>{setSwipe(null);setCardI(p=>p+1);setCardMenu(null);},400); };

  const send = useCallback(txt => {
    if(!txt.trim()) return;
    const {filtered,hasBad} = filterBadWords(txt);
    if(hasBad){setShowBadWordWarn(true);setInput(filtered);setTimeout(()=>setShowBadWordWarn(false),4000);return;}
    const t = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    const msgId = crypto.randomUUID();
    const reply = replyTo;
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{id:msgId,from:"me",text:txt,time:t,read:false,replyTo:reply||null}]}));
    setInput(""); setStickers(false); setMediaPanel(false); setReplyTo(null);

    // Demo: 3 soniyadan keyin "o'qildi" ✓✓
    setTimeout(()=>{
      setMsgs(p=>({
        ...p,
        [chat]:(p[chat]||[]).map(m=>m.id===msgId?{...m,read:true}:m)
      }));
    }, 3000);

    // Supabase ga saqlash
    if(sb && myUserId && chat) {
      const chatId = getChatId(myUserId, String(chat));
      sb.from('messages').insert({
        id: msgId,
        chat_id: chatId,
        sender_id: myUserId,
        receiver_id: String(chat),
        text: txt,
        msg_type: 'text',
      }).catch(()=>{});
    }

    // Demo javob (faqat local users uchun)
    if(USERS.find(u=>u.id===chat)) {
      setTimeout(()=>{
        const rs=["😊","Zor!","Ha, albatta!","Qiziq…","Rahmat"];
        setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"them",text:rs[Math.floor(Math.random()*rs.length)],time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"})}]}));
      },1200);
    }
  }, [chat, replyTo, myUserId, sb]);

  const sendGift = g => {
    if(coins<g.price){toast$("Tangalar yetarli emas!","#ef4444");return;}
    setCoins(p=>p-g.price); setGiftAnim(g.emoji); setTimeout(()=>setGiftAnim(null),1800);
    const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",text:g.emoji+" "+g.name+(giftNote?" | "+giftNote:""),time:t,gift:true}]}));
    setGiftModal(null); setGiftNote(""); toast$(g.emoji+" Sovga yuborildi!",C.sky);
  };

  const sendWave = toUser => {
    setShowWaveModal(null);
    setTimeout(()=>setIncomingWave({from:{name:profile?.name||"Sarvar",photo:profilePhoto},to:toUser,comment:waveComment}),600);
    setWaveComment(""); toast$("👋 "+toUser.name+"ga salom yubordingiz!",C.accent);
  };

  const handleWaveResponse = accepted => {
    if(!incomingWave) return;
    const nm=incomingWave; setIncomingWave(null);
    if(accepted){setMatches(p=>[...p,999]);toast$("Lichka ochildi!",C.green);}
    else setTimeout(()=>toast$(nm.to?.name+" rad etdi. Dadil boling! 😍","#ef4444"),500);
  };

  const blockUser = (userId, userName, type) => {
    setBlockedTypes(p=>({...p,[userId]:type})); setShowBlockModal(null);
    const msgs2={full:"🚫 "+userName+" butunlay bloklandi",write:userName+" yoza olmaydi",gift:userName+" faqat sovga yuborishi mumkin"};
    toast$(msgs2[type],"#ef4444");
  };

  const startLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      ()=>{setLocationSharing(true);setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=nearbyRadius));toast$("Lokatsiya yoqildi!",C.green);},
      ()=>{setLocationSharing(true);setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=nearbyRadius));toast$("Demo lokatsiya (Toshkent)",C.sky);}
    );
    if(!navigator.geolocation){setLocationSharing(true);setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=nearbyRadius));toast$("Demo lokatsiya",C.sky);}
  };

  const chatUser = useMemo(()=>chat ? ALL_USERS.find(u=>u.id===chat) : null, [chat]);
  const matchUsers = useMemo(()=>ALL_USERS.filter(u=>matches.includes(u.id)&&!blocked.includes(u.id)), [matches, blocked, ALL_USERS]);

  const ov = {position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"};
  const mb = {background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:430,boxShadow:"0 -8px 32px rgba(255,110,180,0.15)",maxHeight:"88vh",overflowY:"auto"};
  const bigBtn = (bg,col="#fff") => ({width:"100%",background:bg,border:"none",borderRadius:13,padding:"13px",color:col,fontWeight:800,fontSize:15,cursor:"pointer",marginTop:8});
  const chipStyle = (active,color) => ({padding:"6px 12px",borderRadius:20,border:"2px solid "+(active?(color||C.accent):C.border),background:active?(color||C.accent):"#f0f9ff",color:active?"#fff":C.text,fontSize:12,fontWeight:active?700:400,cursor:"pointer"});

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"Nunito,sans-serif",color:C.text,maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"); *{box-sizing:border-box;margin:0;padding:0} input,textarea,select{font-size:16px!important} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#ff6eb455;border-radius:3px} @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes bounceHeart{from{transform:scale(1)}to{transform:scale(1.2)}} @keyframes radar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} .rng::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ff6eb4,#38bdf8);cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px #ff6eb455} .rng::-webkit-slider-runnable-track{height:4px;background:transparent} @viewport{zoom:1.0;width:device-width}`}</style>

      {/* Hidden inputs */}
      <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f) return;
        const url=URL.createObjectURL(f);
        const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
        setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t,type:fileTypeRef.current,payload:{url,name:f.name,size:(f.size/1024).toFixed(1)+"KB"}}]}));
        setMediaPanel(false); e.target.value="";
      }}/>
      <input ref={profilePhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{
        const f=e.target.files[0]; if(!f) return;
        const totalPhotos=(profilePhoto?1:0)+myPhotos.length;
        if(totalPhotos>=10){toast$("Maksimum 10 ta rasm joylash mumkin!","#ef4444");e.target.value="";return;}

        const url=URL.createObjectURL(f);
        setPhotoCheckLoading(true);

        try {
          // AI tekshiruvi — base64 ga o'tkazish
          const base64=await new Promise((res,rej)=>{
            const r=new FileReader();
            r.onload=()=>res(r.result.split(",")[1]);
            r.onerror=()=>rej(new Error("Read failed"));
            r.readAsDataURL(f);
          });

          const resp=await fetch("https://api.anthropic.com/v1/messages",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
              model:"claude-sonnet-4-6",
              max_tokens:200,
              messages:[{
                role:"user",
                content:[
                  {type:"image",source:{type:"base64",media_type:f.type||"image/jpeg",data:base64}},
                  {type:"text",text:`Bu rasm dating ilovasi uchun profil rasmi sifatida yaroqlimi? Quyidagilarni tekshir: intim/yalang'och holat, juda ochiq kiyim, fahsh holatlar, zo'ravonlik. Faqat JSON javob ber: {"ok":true/false,"reason":"sabab uz tilida"}`}
                ]
              }]
            })
          });
          const data=await resp.json();
          const text=data.content?.[0]?.text||"{}";
          let result={ok:true,reason:""};
          try{ result=JSON.parse(text.replace(/```json|```/g,"").trim()); }catch(e){}

          if(!result.ok){
            setPhotoCheckLoading(false);
            toast$("🤖 AI: "+( result.reason||"Bu rasm qabul qilinmadi"),"#ef4444");
            setTimeout(()=>toast$("Iltimos, boshqa munosib rasm tanlang 🙏","#f59e0b"),2500);
            e.target.value="";
            return;
          }
        } catch(err) {
          // AI xato bersa, rasmni qabul qil (network yoq holatida)
          console.error("AI check:",err);
        }

        setPhotoCheckLoading(false);
        if(!profilePhoto){
          setProfilePhoto(url);
        } else {
          setMyPhotos(p=>[...p,url]);
        }
        toast$("✅ Rasm qo'shildi!",C.green);
        e.target.value="";
      }}/>
      <input ref={complaintFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f) return;
        setComplaintScreenshot(URL.createObjectURL(f)); e.target.value="";
      }}/>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:20,padding:"8px 18px",fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",fontSize:13,animation:"slideUp 0.3s"}}>
          {toast.msg}
        </div>
      )}

      {/* GIFT ANIM */}
      {giftAnim&&(
        <div style={{position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",fontSize:100,zIndex:9998,pointerEvents:"none",animation:"bounceHeart 0.4s infinite alternate"}}>
          {giftAnim}
        </div>
      )}

      {/* VIDEO CALL */}
      {videoCall&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"linear-gradient(180deg,#1e293b,#0f172a)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",border:"3px solid #38bdf8",margin:"0 auto 14px"}}>
            {videoCall.demoPhoto?<img src={videoCall.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:50}}>{videoCall.emoji}</span>}
          </div>
          <div style={{color:"#fff",fontSize:22,fontWeight:800}}>{videoCall.name}</div>
          <div style={{color:"#64748b",fontSize:13,marginTop:6}}>Video qongiroq...</div>
          <div style={{display:"flex",gap:28,marginTop:44}}>
            <button onClick={()=>{setVideoCall(null);toast$("Bekor qilindi","#ef4444");}} style={{width:62,height:62,borderRadius:"50%",background:"#ef4444",border:"none",fontSize:26,cursor:"pointer",color:"#fff"}}>📵</button>
            <button onClick={()=>{setVideoCall(null);toast$("Ulandi!",C.green);}} style={{width:62,height:62,borderRadius:"50%",background:C.green,border:"none",fontSize:26,cursor:"pointer",color:"#fff"}}>📹</button>
          </div>
        </div>
      )}
      {/* ADD STORY MODAL - REMOVED */}

      {/* WAVE MODAL */}
      {showWaveModal&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:60,marginBottom:8}}>👋</div>
            <div style={{fontWeight:900,fontSize:18,marginBottom:4}}>{showWaveModal.name}ga salom!</div>
            <div style={{color:C.muted,fontSize:13,marginBottom:12}}>Qoshimcha xabar yozishingiz mumkin</div>
            <textarea value={waveComment} onChange={e=>{if(e.target.value.length<=100)setWaveComment(e.target.value);}} placeholder="Masalan: Safoda ekansiz, birga tushlik qilsak?" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:14,padding:"10px 14px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",minHeight:70,resize:"none",fontFamily:"inherit",marginBottom:4}}/>
            <div style={{textAlign:"right",fontSize:10,color:C.muted,marginBottom:12}}>{waveComment.length}/100</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setShowWaveModal(null);setWaveComment("");}} style={{flex:1,background:"#e0f2fe",border:"none",borderRadius:14,padding:"12px",color:C.text,fontWeight:700,cursor:"pointer"}}>Bekor</button>
              <button onClick={()=>sendWave(showWaveModal)} style={{flex:1,background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"12px",color:"#fff",fontWeight:800,cursor:"pointer"}}>👋 Yuborish</button>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING WAVE */}
      {incomingWave&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(15,23,42,0.88)",backdropFilter:"blur(8px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:28,padding:26,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:70,marginBottom:8,animation:"bounceHeart 0.6s infinite alternate"}}>👋</div>
            <div style={{fontWeight:900,fontSize:20,color:C.accent,marginBottom:12}}>{incomingWave.from.name} salom yolladi!</div>
            {incomingWave.comment&&<div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"12px 16px",marginBottom:14,border:"1px solid "+C.border,fontSize:13,color:C.text,fontStyle:"italic"}}>"{incomingWave.comment}"</div>}
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Qabul qilsangiz — lichka ochiladi</div>
            <div style={{display:"flex",gap:10,marginBottom:8}}>
              <button onClick={()=>handleWaveResponse(true)} style={{flex:1,background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>Qabul</button>
              <button onClick={()=>handleWaveResponse(false)} style={{flex:1,background:"#fee2e2",border:"none",borderRadius:14,padding:"13px",color:"#ef4444",fontWeight:800,fontSize:15,cursor:"pointer"}}>Rad</button>
            </div>
            <button onClick={()=>setShowBlockModal({id:999,name:incomingWave.from.name})} style={{width:"100%",background:"#f1f5f9",border:"none",borderRadius:12,padding:"10px",color:C.muted,fontWeight:600,fontSize:12,cursor:"pointer"}}>🚫 Bloklash</button>
          </div>
        </div>
      )}

      {/* INCOMING GIFT */}
      {incomingGift&&notifSettings.gifts&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:28,padding:26,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:90,marginBottom:8,animation:"bounceHeart 0.5s infinite alternate"}}>{incomingGift.gift.emoji}</div>
            <div style={{fontWeight:900,fontSize:20,marginBottom:10}}>{incomingGift.from.name} sovga yolladi!</div>
            {incomingGift.note&&<div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"10px",marginBottom:12,fontSize:13,fontStyle:"italic"}}>"{incomingGift.note}"</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setMatches(p=>[...p,incomingGift.to?.id||0]);setIncomingGift(null);toast$("Sovga qabul qilindi!",C.green);}} style={{flex:1,background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:800,cursor:"pointer"}}>Qabul</button>
              <button onClick={()=>{setCoins(p=>p+(incomingGift.gift.price||0));setIncomingGift(null);toast$("Sovga rad etildi","#ef4444");}} style={{flex:1,background:"#fee2e2",border:"none",borderRadius:14,padding:"13px",color:"#ef4444",fontWeight:800,cursor:"pointer"}}>Rad</button>
            </div>
          </div>
        </div>
      )}

      {/* GIFT MODAL */}
      {giftModal&&(
        <div style={{...ov,zIndex:400}} onClick={()=>setGiftModal(null)}>
          <div style={mb} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:17,marginBottom:4}}>🎁 Sovga yuborish</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>🪙 Tangalar: {coins}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
              {GIFTS.map(g=>(
                <div key={g.id} onClick={()=>sendGift(g)} style={{background:g.color+"18",border:"1px solid "+g.color+"44",borderRadius:13,padding:11,textAlign:"center",cursor:"pointer"}}>
                  <div style={{fontSize:34}}>{g.emoji}</div>
                  <div style={{fontSize:11,fontWeight:700,marginTop:3}}>{g.name}</div>
                  <div style={{fontSize:11,color:C.sky}}>🪙{g.price}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10}}>
              <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Izoh (100 ta harfgacha):</label>
              <textarea value={giftNote} onChange={e=>{if(e.target.value.length<=100)setGiftNote(e.target.value);}} placeholder="Qisqa xabar..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"8px 11px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box",minHeight:50,resize:"none",fontFamily:"inherit"}}/>
              <div style={{textAlign:"right",fontSize:10,color:C.muted}}>{giftNote.length}/100</div>
            </div>
            <button onClick={()=>{setGiftModal(null);setGiftNote("");}} style={{...bigBtn("#e0f2fe"),color:C.text}}>Yopish</button>
          </div>
        </div>
      )}

      {/* MAP MODAL */}
      {showMap&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"#0f172a",zIndex:600,display:"flex",flexDirection:"column"}}>
          <div style={{background:"#1e293b",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #334155"}}>
            <button onClick={()=>setShowMap(false)} style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer"}}>←</button>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:800,fontSize:16}}>📍 Yaqin atrofdagilar</div>
              <div style={{color:"#64748b",fontSize:11}}>{nearbyUsers.filter(u=>u.dist<=nearbyRadius).length} ta foydalanuvchi</div>
            </div>
          </div>
          <div style={{flex:1,position:"relative",overflow:"hidden",background:"#0f172a"}}>
            {[20,40,60,80].map(r=>(
              <div key={r} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:r*2+"%",height:r*2+"%",borderRadius:"50%",border:"1px solid rgba(56,189,248,0.12)",maxWidth:r*5,maxHeight:r*5}}/>
            ))}
            <div style={{position:"absolute",top:"50%",left:"50%",width:"50%",height:"2px",background:"linear-gradient(90deg,rgba(56,189,248,0.7),transparent)",transformOrigin:"left center",animation:"radar 3s linear infinite"}}/>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:10,textAlign:"center"}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#38bdf8,#ff6eb4)",border:"3px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:"0 0 20px rgba(56,189,248,0.5)"}}>
                {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>:<span style={{fontSize:22}}>🧑</span>}
              </div>
              <div style={{color:"#fff",fontSize:9,marginTop:3,fontWeight:700}}>Sen</div>
            </div>
            {nearbyUsers.filter(u=>u.dist<=nearbyRadius).map(u=>{
              const rad=(u.angle*Math.PI)/180;
              const ratio=u.dist/nearbyRadius;
              const maxPx=130;
              const px=Math.sin(rad)*ratio*maxPx;
              const py=-Math.cos(rad)*ratio*maxPx;
              const dotColor=u.gender==="ayol"?"#ff6eb4":"#22c55e";
              return (
                <div key={u.id} style={{position:"absolute",top:"calc(50% + "+py+"px)",left:"calc(50% + "+px+"px)",transform:"translate(-50%,-50%)",zIndex:5,cursor:"pointer"}} onClick={()=>toast$(u.name+" — "+(u.dist>=1000?(u.dist/1000).toFixed(1)+"km":u.dist+"m")+" uzoqda",dotColor)}>
                  <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",border:"3px solid "+dotColor,boxShadow:"0 0 10px "+dotColor+"66"}}>
                    <img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  {u.online&&<div style={{position:"absolute",top:1,right:1,width:10,height:10,borderRadius:"50%",background:"#22c55e",border:"2px solid #0f172a"}}/>}
                  <div style={{position:"absolute",top:44,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.75)",borderRadius:8,padding:"2px 7px",textAlign:"center",whiteSpace:"nowrap"}}>
                    <div style={{color:"#fff",fontSize:9,fontWeight:700}}>{u.name}</div>
                    <div style={{color:dotColor,fontSize:8}}>{u.dist>=1000?(u.dist/1000).toFixed(1)+"km":u.dist+"m"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BLOCK MODAL */}
      {showBlockModal&&(
        <div style={{...ov,zIndex:800}} onClick={()=>setShowBlockModal(null)}>
          <div style={mb} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🚫 Bloklash turi</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{showBlockModal.name} uchun:</div>
            {[
              {type:"full",icon:"⛔",title:"Butunlay bloklash",sub:"Ko'rmaydi, yoza olmaydi",color:"#ef4444"},
              {type:"write",icon:"✍️",title:"Yozishni bloklash",sub:"Lichkaga yoza olmaydi",color:"#f59e0b"},
            ].map(opt=>(
              <div key={opt.type} onClick={()=>blockUser(showBlockModal.id,showBlockModal.name,opt.type)} style={{display:"flex",alignItems:"center",gap:12,background:opt.color+"11",border:"1px solid "+opt.color+"33",borderRadius:14,padding:"12px 14px",marginBottom:9,cursor:"pointer"}}>
                <div style={{fontSize:28}}>{opt.icon}</div>
                <div><div style={{fontWeight:700,fontSize:14,color:opt.color}}>{opt.title}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{opt.sub}</div></div>
              </div>
            ))}
            <div onClick={()=>{setShowComplaintModal(showBlockModal);setShowBlockModal(null);}} style={{display:"flex",alignItems:"center",gap:12,background:"#fff5f5",border:"1px solid #fecaca",borderRadius:14,padding:"12px 14px",marginBottom:9,cursor:"pointer"}}>
              <span style={{fontSize:28}}>🚨</span>
              <div><div style={{fontWeight:700,fontSize:14,color:"#dc2626"}}>Shikoyat bildirish</div><div style={{fontSize:11,color:C.muted}}>Administratsiyaga xabar berish</div></div>
            </div>
            <button onClick={()=>setShowBlockModal(null)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Bekor qilish</button>
          </div>
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {showComplaintModal&&!complaintSent&&(
        <div style={{...ov,zIndex:800}} onClick={()=>{setShowComplaintModal(null);setComplaintText("");setComplaintReason("");setComplaintScreenshot(null);}}>
          <div style={mb} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:17,marginBottom:4}}>🚨 Shikoyat bildirish</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{showComplaintModal.name} haqida</div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:7,fontWeight:600}}>Shikoyat sababi:</label>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["🔞 Kattalar kontent","🤬 Haqorat","🎭 Soxta profil","📛 Spam","⚠️ Xavfli xulq","💰 Firibgarlik"].map(r=>(
                  <button key={r} onClick={()=>setComplaintReason(r)} style={{padding:"6px 11px",borderRadius:20,border:"2px solid "+(complaintReason===r?"#ef4444":C.border),background:complaintReason===r?"#fee2e2":"#f8fafc",color:complaintReason===r?"#dc2626":C.text,fontSize:11,fontWeight:complaintReason===r?700:400,cursor:"pointer"}}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>Nima ayb qilganini yozing:</label>
              <textarea value={complaintText} onChange={e=>setComplaintText(e.target.value)} placeholder="Masalan: Haqoratli xabarlar yuboryapti..." style={{width:"100%",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:12,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",minHeight:80,resize:"none",fontFamily:"inherit"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>Skrinshot (ixtiyoriy):</label>
              {complaintScreenshot
                ? <div style={{position:"relative",display:"inline-block"}}><img src={complaintScreenshot} style={{width:100,height:100,objectFit:"cover",borderRadius:12}}/><button onClick={()=>setComplaintScreenshot(null)} style={{position:"absolute",top:-6,right:-6,background:"#ef4444",border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",fontSize:11,cursor:"pointer"}}>x</button></div>
                : <button onClick={()=>complaintFileRef.current.click()} style={{background:"#fff5f5",border:"2px dashed #fca5a5",borderRadius:12,padding:"10px 18px",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer"}}>📸 Skrinshot qoshish</button>
              }
            </div>
            <button onClick={async ()=>{
              if(!complaintReason){toast$("Sabab tanlang!","#ef4444");return;}
              if(!complaintText.trim()){toast$("Tavsif yozing!","#ef4444");return;}

              // Supabase ga saqlash
              if(sb && myUserId){
                try{
                  await sb.from('complaints').insert({
                    reporter_id: myUserId,
                    reported_id: showComplaintModal.id,
                    reported_name: showComplaintModal.name,
                    reason: complaintReason,
                    description: complaintText,
                    status: 'pending',
                    created_at: new Date().toISOString()
                  });
                }catch(e){console.error('Complaint save error:',e);}
              }

              setComplaintSent(true);
              // Avtomatik bloklash
              blockUser(showComplaintModal.id, showComplaintModal.name, "full");
              setTimeout(()=>{
                setComplaintSent(false);
                setShowComplaintModal(null);
                setComplaintText("");
                setComplaintReason("");
                setComplaintScreenshot(null);
              },4000);
            }} style={bigBtn("linear-gradient(90deg,#ef4444,#dc2626)")}>🚨 Shikoyat yuborish</button>
            <button onClick={()=>{setShowComplaintModal(null);setComplaintText("");setComplaintReason("");}} style={{...bigBtn("#e0f2fe"),color:C.text}}>Bekor qilish</button>
          </div>
        </div>
      )}

      {/* COMPLAINT SUCCESS */}
      {complaintSent&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(135deg,#fff5f5,#fff0f6)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{textAlign:"center",maxWidth:320}}>
            <div style={{fontSize:72,marginBottom:12}}>✅</div>
            <div style={{fontWeight:900,fontSize:22,color:"#dc2626",marginBottom:12}}>Shikoyat yuborildi!</div>
            <div style={{background:"#fff",borderRadius:20,padding:"20px 24px",marginBottom:16,border:"1px solid #fecaca"}}>
              <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>
                {T.complaintSent}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,fontSize:12,color:C.muted}}>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:12,padding:"10px 14px",border:"1px solid "+C.border}}>
                <span style={{fontSize:16}}>🚫</span>
                <span>Foydalanuvchi avtomatik bloklandi</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:12,padding:"10px 14px",border:"1px solid "+C.border}}>
                <span style={{fontSize:16}}>👮</span>
                <span>Administrator 24 soat ichida ko'rib chiqadi</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:12,padding:"10px 14px",border:"1px solid "+C.border}}>
                <span style={{fontSize:16}}>🛡️</span>
                <span>Sizning ma'lumotlaringiz maxfiy</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* BILDIRISHNOMALAR SOZLAMALARI — endi Sozlamalar ichida */}

      {/* SOZLAMALAR TO'LIQ SAHIFASI */}
      {showLangModal&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:700,display:"flex",flexDirection:"column"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button onClick={()=>setShowLangModal(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:18}}>⚙️ Sozlamalar</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,marginTop:1}}>Til va bildirishnomalar</div>
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"16px 14px 30px"}}>

            {/* === TIL === */}
            <div style={{fontWeight:900,fontSize:15,color:C.text,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🌐</span> Tilni o'zgartirish
            </div>
            <div style={{marginBottom:20}}>
              {Object.entries(LANGS).map(([key,l])=>(
                <div key={key} onClick={()=>{setLang(key);toast$("Til o'zgartirildi!",C.green);}} style={{
                  display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                  borderRadius:16,marginBottom:8,
                  border:"2px solid "+(lang===key?C.accent:C.border),
                  background:lang===key?"linear-gradient(135deg,#fff0f6,#e0f2fe)":"#fff",
                  cursor:"pointer"
                }}>
                  <div style={{width:44,height:44,borderRadius:12,background:lang===key?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:lang===key?"#fff":C.text,flexShrink:0}}>{l.flag}</div>
                  <div style={{flex:1,fontWeight:800,fontSize:14,color:lang===key?C.accent:C.text}}>
                    {key==="uz"?"🇺🇿 O'zbek tili (Lotin)":key==="kir"?"🇺🇿 Ўзбек тили (Кирилл)":"🇷🇺 Русский язык"}
                  </div>
                  {lang===key&&<span style={{fontSize:18}}>✅</span>}
                </div>
              ))}
            </div>

            {/* Ajratuvchi */}
            <div style={{height:1,background:C.border,marginBottom:20}}/>

            {/* === BILDIRISHNOMALAR === */}
            <div style={{fontWeight:900,fontSize:15,color:C.text,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🔔</span> Bildirishnomalarni boshqarish
            </div>
            <div style={{marginBottom:8}}>
              {[
                {key:"likes",   icon:"❤️", label:"Sizni yoqtirdi",       sub:"Kimdir ❤️ bossa xabar keladi"},
                {key:"views",   icon:"👁️", label:"Profilingizni ko'rdi",  sub:"Kimdir profilingizga kirsa"},
                {key:"gifts",   icon:"🎁", label:"Sovga yubordi",         sub:"Kimdir sovga yuborsa"},
                {key:"messages",icon:"💬", label:"Yangi xabar",           sub:"Kimdir xabar yozsa"},
                {key:"matches", icon:"🎉", label:"Yangi match",           sub:"O'zaro yoqtirish bo'lsa"},
                {key:"blocks",  icon:"🚫", label:"Sizni blokladi",        sub:"Kimdir sizni bloklasa"},
              ].map(item=>(
                <div key={item.key} style={{
                  background:"#fff",borderRadius:16,padding:"13px 16px",
                  marginBottom:8,border:"1px solid "+C.border,
                  display:"flex",alignItems:"center",gap:12
                }}>
                  <div style={{
                    width:40,height:40,borderRadius:12,flexShrink:0,
                    background:notifSettings[item.key]?"#fff0f6":"#f1f5f9",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
                    border:"1px solid "+(notifSettings[item.key]?C.accent:C.border)
                  }}>{item.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text}}>{item.label}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>{item.sub}</div>
                  </div>
                  {/* Toggle */}
                  <div onClick={()=>setNotifSettings(p=>({...p,[item.key]:!p[item.key]}))} style={{
                    width:48,height:26,borderRadius:13,flexShrink:0,
                    background:notifSettings[item.key]?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#e2e8f0",
                    position:"relative",cursor:"pointer",transition:"background 0.3s"
                  }}>
                    <div style={{
                      position:"absolute",top:3,
                      left:notifSettings[item.key]?24:3,
                      width:20,height:20,borderRadius:"50%",
                      background:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
                      transition:"left 0.3s"
                    }}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:"#f8fafc",borderRadius:12,padding:"10px 14px",border:"1px solid "+C.border}}>
              <div style={{fontSize:10,color:C.muted,textAlign:"center"}}>
                🔔 O'chirilgan bildirishnomalar Supabase da saqlanib qoladi
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SURVEY MODAL */}
      {showSurvey&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
          <div style={{background:profile?.gender==="erkak"?"linear-gradient(135deg,#38bdf8,#22c55e)":"linear-gradient(135deg,#ff6eb4,#f472b6)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button onClick={()=>{setShowSurvey(false);setSurveyStep(0);setSurveyAnswers({});setSurveyDone(false);setSurveyStarted(false);}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>📋 So'rovnoma</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,fontWeight:700}}>{surveyDone?"✅ Tugadi":(surveyStep+1)+"/"+SURVEY.length}</div>
          </div>
          {!surveyDone?(
            <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
              {!surveyStarted?(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",textAlign:"center"}}>
                  <div style={{fontSize:70,marginBottom:16}}>📋</div>
                  <div style={{fontWeight:900,fontSize:22,color:C.text,marginBottom:14}}>So'rovnoma</div>
                  <div style={{background:"#fff",borderRadius:20,padding:"22px 20px",border:"1px solid "+C.border,boxShadow:"0 4px 20px rgba(56,189,248,0.1)",marginBottom:20,textAlign:"left"}}>
                    <div style={{fontSize:14,color:C.text,lineHeight:1.8,marginBottom:14}}>Barcha savollarga iloji boricha <b>samimiy javob bering</b>.</div>
                    <div style={{background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",borderRadius:14,padding:"12px 14px",marginBottom:12,border:"1px solid #bae6fd"}}>
                      <div style={{fontSize:13,color:"#0369a1",lineHeight:1.5}}>🔒 Sizning <b>javoblaringiz hech kimga ko'rinmaydi</b>.</div>
                    </div>
                    <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:14,padding:"12px 14px",border:"1px solid #86efac"}}>
                      <div style={{fontSize:13,color:"#15803d",lineHeight:1.5}}>🎁 <b>Javoblar samimiy bo'lsa — mukofotlar ko'p bo'ladi!</b></div>
                    </div>
                  </div>
                  <button onClick={()=>setSurveyStarted(true)} style={{width:"100%",background:"linear-gradient(135deg,#38bdf8,#6366f1)",border:"none",borderRadius:16,padding:"16px",color:"#fff",fontWeight:900,fontSize:18,cursor:"pointer"}}>Boshladikmi ▶️</button>
                </div>
              ):(
                <>
                  <div style={{background:"#e0f2fe",borderRadius:10,height:8,marginBottom:8,overflow:"hidden"}}>
                    <div style={{height:"100%",background:"linear-gradient(90deg,#38bdf8,#ff6eb4)",borderRadius:10,width:((surveyStep+1)/SURVEY.length*100)+"%",transition:"width 0.4s"}}/>
                  </div>
                  <div style={{textAlign:"right",fontSize:11,color:C.muted,marginBottom:16}}>{surveyStep+1} / {SURVEY.length} savol</div>
                  <div style={{background:"#f0f9ff",borderRadius:20,padding:20,marginBottom:16,border:"2px solid #bae6fd"}}>
                    <div style={{fontSize:12,color:C.sky,fontWeight:700,marginBottom:8}}>Savol {surveyStep+1}</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.text,lineHeight:1.5}}>{SURVEY[surveyStep].q}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {SURVEY[surveyStep].opts.map((opt,i)=>{
                      const selected=surveyAnswers[SURVEY[surveyStep].id]===opt;
                      return (
                        <div key={i} onClick={()=>setSurveyAnswers(p=>({...p,[SURVEY[surveyStep].id]:opt}))} style={{background:selected?"linear-gradient(135deg,#38bdf8,#6366f1)":"#fff",borderRadius:14,padding:"14px 18px",border:"2px solid "+(selected?"#38bdf8":"#bae6fd"),cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                          <div style={{width:24,height:24,borderRadius:"50%",border:"2px solid "+(selected?"#fff":"#38bdf855"),background:selected?"rgba(255,255,255,0.3)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {selected&&<div style={{width:10,height:10,borderRadius:"50%",background:"#fff"}}/>}
                          </div>
                          <span style={{fontSize:14,fontWeight:selected?700:400,color:selected?"#fff":C.text}}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop:20}}>
                    {surveyAnswers[SURVEY[surveyStep].id]&&(
                      <button onClick={()=>{
                        if(surveyStep<SURVEY.length-1) setSurveyStep(p=>p+1);
                        else{setSurveyDone(true);setCoins(p=>p+100);toast$("🎉 +100 🪙 bonus!",C.green);}
                      }} style={{width:"100%",background:"linear-gradient(135deg,#38bdf8,#6366f1)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>
                        {surveyStep<SURVEY.length-1?"Keyingi savol →":"✅ Yakunlash"}
                      </button>
                    )}
                    {surveyStep>0&&<button onClick={()=>setSurveyStep(p=>p-1)} style={{width:"100%",background:"#e0f2fe",border:"none",borderRadius:14,padding:"12px",color:C.text,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:8}}>← Oldingi</button>}
                  </div>
                </>
              )}
            </div>
          ):(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
              <div style={{fontSize:90,marginBottom:16}}>🎉</div>
              <div style={{fontWeight:900,fontSize:26,color:C.sky,marginBottom:8}}>Barakalla!</div>
              <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:20,padding:"20px 30px",marginBottom:24,border:"1px solid #86efac"}}>
                <div style={{fontSize:13,color:"#16a34a",fontWeight:600,marginBottom:4}}>Sizga bonus berildi</div>
                <div style={{fontSize:48,fontWeight:900,color:"#15803d"}}>+100 🪙</div>
              </div>
              <button onClick={()=>setShowSurvey(false)} style={{width:"100%",background:"linear-gradient(90deg,#38bdf8,#6366f1)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>Yopish</button>
            </div>
          )}
        </div>
      )}

      {/* REFERRAL MODAL */}
      {showReferral&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setShowReferral(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>🎁 Do'stlarni taklif qil</div>
          </div>
          <div style={{padding:"16px 14px"}}>
            <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:20,padding:18,marginBottom:14,border:"1px solid #86efac",textAlign:"center"}}>
              <div style={{fontSize:13,color:"#16a34a",fontWeight:600,marginBottom:6}}>Jami ishlab topilgan</div>
              <div style={{fontSize:44,fontWeight:900,color:"#15803d"}}>🪙 {referralEarned}</div>
            </div>
            <div style={{background:"#fff",borderRadius:18,padding:16,marginBottom:14,border:"1px solid "+C.border}}>
              <div style={{fontWeight:800,fontSize:15,marginBottom:8}}>Sizning referal havolangiz:</div>
              <div style={{background:"#f0f9ff",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{flex:1,fontSize:12,color:C.text,fontWeight:600,wordBreak:"break-all"}}>https://t.me/lovehub1bot?start={myReferralCode}</div>
                <button onClick={()=>{navigator.clipboard?.writeText("https://t.me/lovehub1bot?start="+myReferralCode);toast$("Havola nusxalandi!",C.green);}} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",borderRadius:10,padding:"7px 12px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0}}>📋 Nusxalash</button>
              </div>
            </div>
            {/* Champions */}
            <div style={{background:"#fff",borderRadius:18,padding:16,marginBottom:20,border:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:24}}>🏆</span>
                <div style={{fontWeight:900,fontSize:16}}>Chempionlar</div>
              </div>
              {(showAllChamps?CHAMPIONS:CHAMPIONS.slice(0,5)).map(c=>{
                const medal=c.rank===1?"🥇":c.rank===2?"🥈":c.rank===3?"🥉":null;
                return (
                  <div key={c.rank} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:14,marginBottom:6,background:c.rank<=3?"linear-gradient(135deg,#fef3c7,#fde68a)":"#f8fafc",border:"1px solid "+(c.rank<=3?"#fbbf24":C.border)}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:c.rank<=3?"rgba(255,255,255,0.6)":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:c.rank<=3?18:13,flexShrink:0}}>{medal||c.rank}</div>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.avatar}</div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.count} ta do'st</div></div>
                    <div style={{fontWeight:900,fontSize:13,color:C.green}}>🪙 {c.earned}</div>
                  </div>
                );
              })}
              {!showAllChamps&&<button onClick={()=>setShowAllChamps(true)} style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"11px",color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:4}}>Ko'proq ›</button>}
              {showAllChamps&&<button onClick={()=>setShowAllChamps(false)} style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"11px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:4}}>Yopish ↑</button>}
            </div>
          </div>
        </div>
      )}

      {/* BAD WORD WARNING */}
      {showBadWordWarn&&(
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:9999,width:"90%",maxWidth:380}}>
          <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:18,padding:"16px 20px",boxShadow:"0 8px 32px rgba(239,68,68,0.4)",border:"2px solid #ef4444",display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:28,flexShrink:0}}>⚠️</span>
            <div>
              <div style={{fontWeight:900,fontSize:14,color:"#ef4444",marginBottom:4}}>Haqoratli so'z ishlatildi!</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",lineHeight:1.5}}>Iltimos, <b style={{color:"#fbbf24"}}>chiroyli gaplashing</b>! Xabaringiz yuborilmadi. 🙏</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB HINT MODAL */}
      {tabHint&&TAB_HINTS[tabHint]&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:888,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:26,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            <div style={{width:70,height:70,borderRadius:20,background:"linear-gradient(135deg,"+TAB_HINTS[tabHint].color+"33,"+TAB_HINTS[tabHint].color+"11)",border:"2px solid "+TAB_HINTS[tabHint].color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 14px"}}>
              {TAB_HINTS[tabHint].icon}
            </div>
            <div style={{fontWeight:900,fontSize:20,color:C.text,textAlign:"center",marginBottom:12}}>{TAB_HINTS[tabHint].title}</div>
            <div style={{fontSize:14,color:C.text,lineHeight:1.7,background:"linear-gradient(135deg,#f8fafc,#f0f9ff)",borderRadius:16,padding:"14px 16px",marginBottom:20,border:"1px solid "+C.border}}>{TAB_HINTS[tabHint].desc}</div>
            <button onClick={()=>{setSeenTabs(p=>({...p,[tabHint]:true}));setTabHint(null);}} style={{width:"100%",background:"linear-gradient(135deg,"+TAB_HINTS[tabHint].color+","+TAB_HINTS[tabHint].color+"cc)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer"}}>Okey 👍</button>
          </div>
        </div>
      )}

      {/* BETA NOTICE MODAL */}
      {showBetaNotice&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:26,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:60,marginBottom:12}}>🚀</div>
            <div style={{fontWeight:900,fontSize:20,color:C.text,marginBottom:8}}>Sinov rejimi</div>
            <div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:16,padding:"16px 18px",marginBottom:16,border:"1px solid "+C.border,textAlign:"left"}}>
              <div style={{fontSize:14,color:C.text,lineHeight:1.7}}>⚡ <b>Love Hub</b> hozirda <b>sinov rejimida</b> ishlayapti.<br/><br/>🎁 Barcha <b>bonus va mukofotlar</b> tez orada real hayotga ko'chib sizga berilа boshlaydi.<br/><br/>😊 Hozircha shunchaki <b>foydalaning!</b></div>
            </div>
            <button onClick={()=>setShowBetaNotice(false)} style={{width:"100%",background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer"}}>Tushunarli! 🎉</button>
          </div>
        </div>
      )}

      {/* BUY COINS MODAL */}
      {showBuyCoins&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
          <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f172a)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button onClick={()=>setShowBuyCoins(false)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
            <div style={{flex:1,color:"#fbbf24",fontWeight:900,fontSize:18}}>🪙 Tanga sotib olish</div>
            <div style={{background:"rgba(251,191,36,0.2)",borderRadius:20,padding:"5px 12px",color:"#fbbf24",fontWeight:800,fontSize:14}}>🪙 {coins}</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16}}>
            {[
              {a:80,price:"3$",usd:3,col:"#38bdf8",badge:"",desc:"Boshlang'ich"},
              {a:250,price:"9.99$",usd:9.99,col:"#ff6eb4",badge:"🔥 Ommabop",desc:"Eng ko'p tanlanadi"},
              {a:700,price:"25$",usd:25,col:"#a78bfa",badge:"💎 Foydali",desc:"Tejamkorlik"},
              {a:1500,price:"50$",usd:50,col:"#f59e0b",badge:"👑 Elite",desc:"Eng katta"},
            ].map((pkg,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:18,padding:16,marginBottom:10,border:"2px solid "+pkg.col+"44",position:"relative",overflow:"hidden"}}>
                {pkg.badge&&<div style={{position:"absolute",top:10,right:10,background:pkg.col,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{pkg.badge}</div>}
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:52,height:52,borderRadius:14,background:pkg.col+"18",border:"2px solid "+pkg.col+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🪙</div>
                  <div style={{flex:1}}><div style={{fontWeight:900,fontSize:22,color:C.text}}>{pkg.a.toLocaleString()} tanga</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{pkg.desc}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                  <div style={{fontSize:22,fontWeight:900,color:pkg.col}}>{pkg.price}</div>
                  <button onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(90deg,"+pkg.col+","+pkg.col+"cc)",border:"none",borderRadius:14,padding:"12px 22px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer"}}>Tez orada</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APP MENU */}
      {showAppMenu&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",zIndex:600,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:60}} onClick={()=>setShowAppMenu(false)}>
          <div style={{background:"#fff",borderRadius:20,width:"88%",maxWidth:380,overflow:"hidden",boxShadow:"0 8px 40px rgba(255,110,180,0.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",padding:"18px 20px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:34}}>💕</div>
              <div><div style={{fontWeight:900,fontSize:18,color:"#fff"}}>Love Hub</div><div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>Tanishuvlar platformasi</div></div>
              <button onClick={()=>setShowAppMenu(false)} style={{marginLeft:"auto",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:30,height:30,color:"#fff",fontSize:16,cursor:"pointer"}}>✕</button>
            </div>
            {[
              {icon:"👤",label:T.myProfile,sub:profile?profile.name+", "+profile.age+" yosh":"Profilni toldiryng",action:()=>{setShowAppMenu(false);setTab("profile");},hi:true},
              {icon:"⚙️",label:T.settingsTitle,sub:"Til: "+LANGS[lang].flag,action:()=>{setShowAppMenu(false);setShowLangModal(true);}},
              {icon:"🎧",label:T.support,sub:"Yordam va savollar",action:()=>{setShowAppMenu(false);toast$("Operatorga ulanmoqda...",C.sky);}},
              {icon:"💡",label:T.suggestion,sub:"Fikr va takliflaringizni yuboring",action:()=>{setShowAppMenu(false);toast$("Rahmat! 🙏",C.green);}},
              {icon:"📋",label:T.terms,sub:"Qoidalar va maxfiylik",action:()=>{setShowAppMenu(false);toast$("Tez orada!",C.muted);}},
              {icon:"⭐",label:T.rate,sub:"App Store da baho bering",action:()=>{setShowAppMenu(false);toast$("Rahmat! 💕",C.gold);}},
            ].map((item,i)=>(
              <div key={i} onClick={item.action} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",borderBottom:"1px solid "+C.border,cursor:"pointer",background:item.hi?"linear-gradient(135deg,#fff0f6,#e0f2fe)":"#fff"}}>
                <div style={{width:42,height:42,borderRadius:12,background:item.hi?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,overflow:"hidden"}}>
                  {i===0&&profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/>:item.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:item.hi?800:700,fontSize:14,color:item.hi?C.accent:C.text}}>{item.label}</div>
                  <div style={{fontSize:11,color:C.muted}}>{item.sub}</div>
                </div>
                <span style={{color:C.muted,fontSize:18}}>›</span>
              </div>
            ))}
            <div style={{padding:"10px 20px",textAlign:"center",fontSize:11,color:C.muted}}>Love Hub v1.0 💕</div>
          </div>
        </div>
      )}

      {/* SEEKING / VOICE KENGAYTIRILGAN MODAL */}
      {detailExpandModal&&showUserDetail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setDetailExpandModal(null)}>
          <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px"}} onClick={e=>e.stopPropagation()}>
            {/* Handle */}
            <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>

            {detailExpandModal==="seeking"&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"#fff0f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🔍</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:16,color:C.text}}>Kimni qidirmoqda</div>
                    <div style={{fontSize:12,color:C.muted}}>{showUserDetail.name?.split(" ")[0]}</div>
                  </div>
                </div>
                <div style={{fontSize:14,color:C.text,lineHeight:1.8,background:"#f8fafc",borderRadius:14,padding:"14px 16px"}}>
                  {showUserDetail.seeking}
                </div>
              </>
            )}

            {detailExpandModal==="voice"&&(()=>{
              const isMe = showUserDetail.id === myUserId;
              const src = isMe ? (voiceBlob ? URL.createObjectURL(voiceBlob) : null) : showUserDetail.voiceUrl;
              const verified = isMe ? voiceVerified : showUserDetail.voiceVerified;
              return (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{width:40,height:40,borderRadius:12,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🎙️</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:16,color:C.text}}>Ovozli xabar</div>
                      <div style={{fontSize:12,color:C.muted}}>{showUserDetail.name?.split(" ")[0]}</div>
                    </div>
                    {verified&&<div style={{background:"#22c55e",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:"#fff"}}>✅ Tasdiqlangan</div>}
                  </div>
                  {src&&(
                    <audio
                      src={src}
                      controls
                      autoPlay
                      style={{width:"100%",height:48,borderRadius:12}}
                      controlsList="nodownload"
                      onContextMenu={e=>e.preventDefault()}
                    />
                  )}
                  <div style={{marginTop:10,fontSize:11,color:C.muted,textAlign:"center"}}>
                    🔒 Ovozni yuklab olish taqiqlangan
                  </div>
                </>
              );
            })()}

            <button onClick={()=>setDetailExpandModal(null)} style={{
              width:"100%",marginTop:16,padding:"12px",
              borderRadius:14,background:"#f1f5f9",
              border:"none",fontWeight:700,fontSize:14,
              color:C.text,cursor:"pointer"
            }}>Yopish</button>
          </div>
        </div>
      )}

      {/* GO KAMMENT MODALI */}
      {showGoComments&&(()=>{
        const inv = goInvites.find(i=>i.id===showGoComments);
        if(!inv) return null;
        const comments = goComments[inv.id]||[];
        const isOwner = inv.mine || String(inv.userId)===String(myUserId);
        const inputVal = goCommentInput[inv.id]||"";

        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowGoComments(null)}>
            <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,maxHeight:"75vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div style={{padding:"16px 18px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15}}>💬 Kammentlar</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{inv.text?.slice(0,40)}...</div>
                </div>
                <button onClick={()=>setShowGoComments(null)} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16,color:C.muted}}>✕</button>
              </div>

              {/* Kammentlar ro'yxati */}
              <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
                {comments.length===0&&(
                  <div style={{textAlign:"center",padding:"30px",color:C.muted}}>
                    <div style={{fontSize:32,marginBottom:8}}>💬</div>
                    <div style={{fontSize:13}}>Hali kamment yo'q. Birinchi bo'ling!</div>
                  </div>
                )}
                {comments.map((c,i)=>(
                  <div key={c.id} style={{display:"flex",gap:10,marginBottom:14,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"1.5px solid "+C.border}}>
                      {c.photo?<img src={c.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:C.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👤</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontWeight:700,fontSize:13}}>{c.name}</span>
                        <span style={{fontSize:10,color:C.muted}}>{c.time}</span>
                      </div>
                      <div style={{background:"#f8fafc",borderRadius:"4px 14px 14px 14px",padding:"8px 12px",fontSize:13,color:C.text,lineHeight:1.5}}>{c.text}</div>
                      {/* Egasi uchun tugmalar */}
                      {isOwner&&(
                        <div style={{display:"flex",gap:8,marginTop:5}}>
                          <button onClick={()=>{
                            const reply = `@${c.name} `;
                            setGoCommentInput(p=>({...p,[inv.id]:reply}));
                          }} style={{background:"none",border:"none",fontSize:11,color:C.accent,fontWeight:700,cursor:"pointer"}}>↩️ Javob</button>
                          <button onClick={()=>{
                            setGoComments(p=>({...p,[inv.id]:(p[inv.id]||[]).filter(x=>x.id!==c.id)}));
                            toast$("Kamment o'chirildi","#ef4444");
                          }} style={{background:"none",border:"none",fontSize:11,color:"#ef4444",fontWeight:700,cursor:"pointer"}}>🗑️ O'chirish</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{padding:"10px 14px",borderTop:"1px solid "+C.border,display:"flex",gap:8,alignItems:"flex-end",flexShrink:0}}>
                <div style={{flex:1,background:"#f1f5f9",borderRadius:20,padding:"8px 14px"}}>
                  <textarea
                    value={inputVal}
                    onChange={e=>setGoCommentInput(p=>({...p,[inv.id]:e.target.value}))}
                    placeholder="Kamment yozing..."
                    rows={1}
                    style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:14,resize:"none",fontFamily:"inherit",color:C.text}}
                  />
                </div>
                <button onClick={()=>{
                  if(!inputVal.trim()) return;
                  const newC = {
                    id:Date.now(),
                    userId:myUserId,
                    name:(profile?.name||"Men").split(" ")[0],
                    photo:profilePhoto||null,
                    text:inputVal.trim(),
                    time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"})
                  };
                  setGoComments(p=>({...p,[inv.id]:[...(p[inv.id]||[]),newC]}));
                  setGoCommentInput(p=>({...p,[inv.id]:""}));
                }} style={{
                  width:40,height:40,borderRadius:"50%",
                  background:inputVal.trim()?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#e2e8f0",
                  border:"none",cursor:"pointer",color:"#fff",fontSize:18,
                  display:"flex",alignItems:"center",justifyContent:"center"
                }}>➤</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* GO QO'SHILISH SO'ROVI MODALI */}
      {showGoRequestModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:24,width:"100%",maxWidth:360}}>
            {/* Avatar — bosilsa profil ochiladi */}
            <div style={{textAlign:"center",marginBottom:16}}>
              <div
                onClick={()=>{
                  const joiner = ALL_USERS[0];
                  if(joiner){setShowUserDetail(joiner);setDetailPhotoIdx(0);}
                }}
                style={{cursor:"pointer",display:"inline-block"}}
              >
                <div style={{width:72,height:72,borderRadius:"50%",overflow:"hidden",margin:"0 auto 8px",border:"3px solid "+C.accent,boxShadow:"0 4px 16px rgba(255,110,180,0.3)"}}>
                  {ALL_USERS[0]?.demoPhoto
                    ? <img src={USERS[0].demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <div style={{width:"100%",height:"100%",background:"#fff0f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>👤</div>
                  }
                </div>
                <div style={{fontWeight:900,fontSize:15,color:C.accent,textDecoration:"underline dotted"}}>
                  {ALL_USERS[0]?.name?.split(" ")[0]} →
                </div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                  Profilni ko'rish uchun bosing
                </div>
              </div>
            </div>

            {/* Xabar */}
            <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",marginBottom:20,textAlign:"center",border:"1px solid #86efac"}}>
              <div style={{fontSize:28,marginBottom:8}}>🎉</div>
              <div style={{fontWeight:700,fontSize:14,color:"#1e293b",lineHeight:1.6}}>
                <b>{USERS[0]?.name?.split(" ")[0]}</b> siz bilan{" "}
                <span style={{color:C.accent}}>"{showGoRequestModal.inv?.text?.slice(0,30)}..."</span>{" "}
                ga bormoqchi va sizga shaxsiy xabar yozmoqchi.
              </div>
              <div style={{fontSize:12,color:"#64748b",marginTop:8}}>Ruxsat berasizmi?</div>
            </div>

            {/* Tugmalar */}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{
                setShowGoRequestModal(null);
                const joiner = USERS[0];
                if(joiner){
                  const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                  setMsgs(p=>({...p,[joiner.id]:[...(p[joiner.id]||[]),
                    {from:"them",text:"❌ Kechirasiz, taklifingizni rad etdim. Boshqa hamroh qidiring 🙏",time:t2}
                  ]}));
                }
                toast$("❌ Rad etildi","#ef4444");
              }} style={{flex:1,padding:"12px",borderRadius:14,background:"#fff5f5",border:"1px solid #fecaca",color:"#ef4444",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                ❌ Rad etish
              </button>
              <button onClick={()=>{
                const inv = showGoRequestModal.inv;
                const joiner = USERS[0];
                setShowGoRequestModal(null);
                // Match qo'shish — chat ochiladi
                if(joiner) {
                  setMatches(p=>p.includes(joiner.id)?p:[...p,joiner.id]);
                  const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                  setMsgs(p=>({...p,[joiner.id]:[...(p[joiner.id]||[]),
                    {from:"them",text:"🎉 Salom! Men "+inv?.text?.slice(0,20)+"... ga bormoqchiman. Birgami? 😊",time:t2}
                  ]}));
                  toast$("🎉 Ruxsat berildi! Endi xabar yozishingiz mumkin","#22c55e");
                  // Lichkaga o'tish
                  setTimeout(()=>{setTab("matches");},1000);
                }
              }} style={{flex:1,padding:"12px",borderRadius:14,background:"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                ✅ Ruxsat berish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM SO'ROV MODALI */}
      {showTgModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:24,width:"100%",maxWidth:360}}>
            {/* Avatar */}
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:70,height:70,borderRadius:"50%",overflow:"hidden",margin:"0 auto 10px",border:"3px solid #0088cc"}}>
                {showTgModal.demoPhoto
                  ? <img src={showTgModal.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{width:"100%",height:"100%",background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{showTgModal.emoji}</div>
                }
              </div>
              <div style={{fontWeight:900,fontSize:16,color:"#1e293b"}}>{showTgModal.name.split(" ")[0]}</div>
            </div>

            {/* Xabar */}
            <div style={{background:"#f0f9ff",borderRadius:14,padding:"14px 16px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>✈️</div>
              <div style={{fontWeight:700,fontSize:14,color:"#1e293b",lineHeight:1.6}}>
                <b>{showTgModal.name.split(" ")[0]}</b> suhbatni bu yerda emas,{" "}
                <span style={{color:"#0088cc"}}>Telegram</span> orqali davom ettirmoqchi.
              </div>
              <div style={{fontSize:13,color:"#64748b",marginTop:8}}>
                Unga Telegram orqali yozishiga ruxsat berasizmi?
              </div>
              <div style={{marginTop:8,fontSize:11,color:"#94a3b8"}}>
                🔒 Faqat siz ruxsat bersangiz ulanish ochiladi
              </div>
            </div>

            {/* Tugmalar */}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{
                setTgRequests(p=>({...p,[showTgModal.id]:"rejected"}));
                // Chatda xabar qoldirish
                const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                setMsgs(p=>({...p,[showTgModal.id]:[...(p[showTgModal.id]||[]),
                  {from:"them",text:"❌ Telegram taklifingizni rad etdim. Suhbatni shu yerda davom ettiring yoki 🎁 sovga yuborib qaytadan urining.",time:t2}
                ]}));
                setShowTgModal(null);
                toast$("Taklif rad etildi","#ef4444");
              }} style={{
                flex:1,padding:"12px",borderRadius:14,
                background:"#fff5f5",border:"1px solid #fecaca",
                color:"#ef4444",fontWeight:700,fontSize:14,cursor:"pointer"
              }}>❌ Rad etish</button>

              <button onClick={()=>{
                setTgRequests(p=>({...p,[showTgModal.id]:"accepted"}));
                const _u=showTgModal; const _link=_u.tgUsername?"https://t.me/"+_u.tgUsername:_u.tgUserId?"tg://user?id="+_u.tgUserId:null; if(_link)window.Telegram?.WebApp?.openTelegramLink?.(_link)||window.open(_link,"_blank");
                setShowTgModal(null);
                toast$("✅ Ruxsat berildi! Telegram ochilmoqda...","#0088cc");
              }} style={{
                flex:1,padding:"12px",borderRadius:14,
                background:"linear-gradient(135deg,#0088cc,#006699)",
                border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"
              }}>✅ Ruxsat berish</button>
            </div>
          </div>
        </div>
      )}

      {/* RASM QO'SHISH OGOHLANTIRISIH */}
      {showPhotoWarning&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 36px"}}>
            <div style={{width:40,height:4,borderRadius:2,background:"#e2e8f0",margin:"0 auto 20px"}}/>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:40,marginBottom:8}}>🚫</div>
              <div style={{fontWeight:900,fontSize:18,color:"#dc2626",marginBottom:4}}>Taqiqlangan rasmlar</div>
              <div style={{fontSize:12,color:C.muted}}>Quyidagi rasmlarni joylash taqiqlangan</div>
            </div>
            <div style={{background:"#fef2f2",borderRadius:16,padding:"16px",marginBottom:20,border:"1px solid #fecaca"}}>
              {[
                {icon:"🔞",text:"Intim va yalang'och suratlar"},
                {icon:"👙",text:"O'ta ochiq kiyimdagi rasmlar"},
                {icon:"💋",text:"Fahsh holat yoki imo-ishoralar"},
                {icon:"🤳",text:"Boshqa odamning rasmi"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?"1px solid #fecaca":"none"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
                  <span style={{fontSize:13,color:"#dc2626",fontWeight:600}}>{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>{
              setShowPhotoWarning(false);
              profilePhotoRef.current.click();
            }} style={{
              width:"100%",padding:"14px",borderRadius:16,
              background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",
              border:"none",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer"
            }}>✅ Tushunarli, rasm qo'shish</button>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {showAdminPanel&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:1000,display:"flex",flexDirection:"column"}}>

          {/* PAROL KIRISH */}
          {!adminAuth&&(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
              <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",textAlign:"center",boxShadow:"0 8px 32px rgba(124,58,237,0.15)"}}>
                <div style={{fontSize:48,marginBottom:12}}>🔐</div>
                <div style={{fontWeight:900,fontSize:20,color:"#7c3aed",marginBottom:4}}>Admin Panel</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Faqat administrator uchun</div>
                <input
                  type="text"
                  value={adminLogin}
                  onChange={e=>setAdminLogin(e.target.value)}
                  placeholder="Login..."
                  style={{width:"100%",background:"#f5f3ff",border:"2px solid #7c3aed33",borderRadius:14,padding:"12px 16px",fontSize:16,outline:"none",boxSizing:"border-box",marginBottom:10,textAlign:"center"}}
                />
                <input
                  type="password"
                  value={adminPwd}
                  onChange={e=>setAdminPwd(e.target.value)}
                  placeholder="Parol..."
                  onKeyDown={e=>{if(e.key==="Enter"){if(adminLogin===ADMIN_LOGIN&&adminPwd===ADMIN_PASSWORD){setAdminAuth(true);setAdminPwd("");setAdminLogin("");}else{toast$("Login yoki parol noto'g'ri!","#ef4444");setAdminPwd("");}}}}
                  style={{width:"100%",background:"#f5f3ff",border:"2px solid #7c3aed33",borderRadius:14,padding:"12px 16px",fontSize:16,outline:"none",boxSizing:"border-box",marginBottom:12,textAlign:"center",letterSpacing:4}}
                />
                <button onClick={()=>{
                  if(adminLogin===ADMIN_LOGIN&&adminPwd===ADMIN_PASSWORD){setAdminAuth(true);setAdminPwd("");setAdminLogin("");}
                  else{toast$("Login yoki parol noto'g'ri!","#ef4444");setAdminPwd("");}
                }} style={{width:"100%",padding:"13px",borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:10}}>
                  Kirish →
                </button>
                <button onClick={()=>{setShowAdminPanel(false);setAdminPwd("");setAdminLogin("");}} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer"}}>Bekor qilish</button>
              </div>
            </div>
          )}

          {/* ADMIN CONTENT */}
          {adminAuth&&(
            <>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                <button onClick={()=>{setShowAdminPanel(false);setAdminAuth(false);setAdminSelectedUser(null);}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:900,fontSize:17}}>🔐 Admin Panel</div>
                  <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Love Hub boshqaruvi</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"#fff",fontWeight:700}}>
                  {ALL_USERS.length} foydalanuvchi
                </div>
              </div>

              {/* Tablar */}
              <div style={{display:"flex",background:"#fff",borderBottom:"1px solid "+C.border,flexShrink:0}}>
                {[
                  {k:"users",icon:"👥",label:"Foydalanuvchilar"},
                  {k:"complaints",icon:"🚨",label:"Shikoyatlar"},
                  {k:"stats",icon:"📊",label:"Statistika"},
                ].map(t=>(
                  <button key={t.k} onClick={()=>{setAdminTab(t.k);setAdminSelectedUser(null);}} style={{
                    flex:1,padding:"10px 4px",background:"none",border:"none",
                    borderBottom:adminTab===t.k?"3px solid #7c3aed":"3px solid transparent",
                    cursor:"pointer",fontSize:11,fontWeight:adminTab===t.k?800:500,
                    color:adminTab===t.k?"#7c3aed":C.muted
                  }}>{t.icon} {t.label}</button>
                ))}
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"14px"}}>

                {/* FOYDALANUVCHILAR */}
                {adminTab==="users"&&!adminSelectedUser&&(
                  <>
                    <div style={{fontSize:13,color:C.muted,marginBottom:10}}>Jami: {ALL_USERS.length} ta foydalanuvchi</div>
                    {ALL_USERS.map(u=>(
                      <div key={u.id} style={{
                        background:"#fff",borderRadius:16,padding:"12px 14px",marginBottom:8,
                        border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12
                      }}>
                        <div onClick={()=>setAdminSelectedUser(u)} style={{width:48,height:48,borderRadius:"50%",overflow:"hidden",border:"2px solid #7c3aed33",flexShrink:0,cursor:"pointer"}}>
                          {u.demoPhoto?<img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{u.emoji}</div>}
                        </div>
                        <div onClick={()=>setAdminSelectedUser(u)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
                          <div style={{fontWeight:800,fontSize:14}}>{u.name} {u.vip&&"👑"}</div>
                          <div style={{fontSize:11,color:C.muted}}>{u.age} yosh · {u.city}</div>
                          <div style={{fontSize:10,color:u.online?C.green:C.muted,marginTop:2}}>{u.online?"🟢 Online":"⚫ Oflayn"}</div>
                        </div>
                        {/* 3 nuqta */}
                        <div style={{position:"relative"}}>
                          <button onClick={e=>{e.stopPropagation();setAdminSelectedUser(p=>p?.id===u.id&&p?._menu?null:{...u,_menu:true});}} style={{background:"#f5f3ff",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16,color:"#7c3aed",fontWeight:900}}>⋮</button>
                          {adminSelectedUser?.id===u.id&&adminSelectedUser?._menu&&(
                            <div style={{position:"absolute",top:36,right:0,background:"#fff",borderRadius:14,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",minWidth:190,zIndex:100,overflow:"hidden",border:"1px solid "+C.border}} onClick={e=>e.stopPropagation()}>
                              <div onClick={()=>{
                                setShowUserDetail(u);
                                setDetailPhotoIdx(0);
                                setAdminSelectedUser(null);
                              }} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer",borderBottom:"1px solid "+C.border}}>
                                <span style={{fontSize:18}}>👁️</span>
                                <div>
                                  <div style={{fontWeight:700,fontSize:13,color:"#7c3aed"}}>Profilga o'tish</div>
                                  <div style={{fontSize:10,color:C.muted}}>Yashirin ko'rish</div>
                                </div>
                              </div>
                              <div onClick={()=>{setAdminSelectedUser(u);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer",borderBottom:"1px solid "+C.border}}>
                                <span style={{fontSize:18}}>📋</span>
                                <div style={{fontWeight:700,fontSize:13,color:C.text}}>Batafsil ma'lumot</div>
                              </div>
                              <div onClick={()=>{
                                setBlocked(p=>[...p,u.id]);
                                setAdminSelectedUser(null);
                                toast$("🚫 Bloklandi","#ef4444");
                              }} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer"}}>
                                <span style={{fontSize:18}}>🚫</span>
                                <div style={{fontWeight:700,fontSize:13,color:"#ef4444"}}>Bloklash</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* FOYDALANUVCHI DETAIL */}
                {adminTab==="users"&&adminSelectedUser&&(
                  <>
                    <button onClick={()=>setAdminSelectedUser(null)} style={{background:"#f5f3ff",border:"none",borderRadius:12,padding:"8px 16px",color:"#7c3aed",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:14}}>← Orqaga</button>

                    {/* Profil rasmlari */}
                    <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:10,border:"1px solid "+C.border}}>
                      <div style={{fontWeight:800,fontSize:14,marginBottom:10,color:"#7c3aed"}}>📸 Rasmlar</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {[adminSelectedUser.demoPhoto,...(adminSelectedUser.extraPhotos||[])].filter(Boolean).map((p,i)=>(
                          <img key={i} src={p} style={{width:80,height:80,borderRadius:12,objectFit:"cover",border:"2px solid #7c3aed33"}}/>
                        ))}
                        {![adminSelectedUser.demoPhoto,...(adminSelectedUser.extraPhotos||[])].filter(Boolean).length&&(
                          <div style={{color:C.muted,fontSize:12}}>Rasm yo'q</div>
                        )}
                      </div>
                    </div>

                    {/* Shaxsiy ma'lumotlar */}
                    <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:10,border:"1px solid "+C.border}}>
                      <div style={{fontWeight:800,fontSize:14,marginBottom:10,color:"#7c3aed"}}>👤 Shaxsiy ma'lumotlar</div>
                      {[
                        {l:"To'liq ism",v:adminSelectedUser.name},
                        {l:"Yoshi",v:adminSelectedUser.age+" yosh"},
                        {l:"Jinsi",v:adminSelectedUser.gender},
                        {l:"Shahri",v:adminSelectedUser.city},
                        {l:"Kasbi",v:adminSelectedUser.kasb||"—"},
                        {l:"Bo'yi",v:adminSelectedUser.height?adminSelectedUser.height+" sm":"—"},
                        {l:"Vazni",v:adminSelectedUser.weight?adminSelectedUser.weight+" kg":"—"},
                        {l:"Telegram ID",v:adminSelectedUser.tgUserId||"—"},
                        {l:"Telegram username",v:adminSelectedUser.tgUsername?"@"+adminSelectedUser.tgUsername:"—"},
                        {l:"VIP",v:adminSelectedUser.vip?"Ha ✅":"Yo'q"},
                        {l:"Online",v:adminSelectedUser.online?"Ha 🟢":"Yo'q ⚫"},
                        {l:"Rating",v:"⭐ "+adminSelectedUser.rating},
                      ].map((r,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border}}>
                          <span style={{fontSize:12,color:C.muted}}>{r.l}</span>
                          <span style={{fontSize:12,fontWeight:700,color:C.text}}>{r.v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bio */}
                    {adminSelectedUser.bio&&(
                      <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:10,border:"1px solid "+C.border}}>
                        <div style={{fontWeight:800,fontSize:14,marginBottom:8,color:"#7c3aed"}}>📝 O'zi haqida</div>
                        <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{adminSelectedUser.bio}</div>
                      </div>
                    )}

                    {/* Kimni qidirmoqda */}
                    {adminSelectedUser.seeking&&(
                      <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:10,border:"1px solid "+C.border}}>
                        <div style={{fontWeight:800,fontSize:14,marginBottom:8,color:"#7c3aed"}}>🔍 Kimni qidirmoqda</div>
                        <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{adminSelectedUser.seeking}</div>
                      </div>
                    )}

                    {/* Yozishmalar */}
                    <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:10,border:"1px solid "+C.border}}>
                      <div style={{fontWeight:800,fontSize:14,marginBottom:10,color:"#7c3aed"}}>💬 Yozishmalar</div>
                      {Object.entries(msgs).filter(([k,v])=>v&&v.length>0).length===0?(
                        <div style={{fontSize:12,color:C.muted}}>Yozishmalar yo'q</div>
                      ):Object.entries(msgs).filter(([k,v])=>v&&v.length>0).slice(0,5).map(([userId,messages])=>{
                        const chatPartner = ALL_USERS.find(u=>String(u.id)===String(userId));
                        return (
                          <div key={userId} style={{marginBottom:10,background:"#f8fafc",borderRadius:12,padding:"10px"}}>
                            <div style={{fontWeight:700,fontSize:12,marginBottom:6,color:"#7c3aed"}}>
                              {chatPartner?.name||"Foydalanuvchi"} bilan ({messages.length} xabar)
                            </div>
                            {messages.slice(-3).map((m,i)=>(
                              <div key={i} style={{fontSize:11,color:m.from==="me"?"#7c3aed":C.text,marginBottom:3,padding:"4px 8px",background:m.from==="me"?"#f5f3ff":"#fff",borderRadius:8}}>
                                <span style={{fontWeight:700}}>{m.from==="me"?"Men":"Suhbatdosh"}:</span> {m.text||"🎙️ Ovozli xabar"} <span style={{color:C.muted,fontSize:9}}>{m.time}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    {/* GO elonlari */}
                    <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:10,border:"1px solid "+C.border}}>
                      <div style={{fontWeight:800,fontSize:14,marginBottom:10,color:"#7c3aed"}}>🚀 GO elonlari</div>
                      {goInvites.filter(inv=>String(inv.userId)===String(adminSelectedUser.id)).length===0?(
                        <div style={{fontSize:12,color:C.muted}}>E'lonlar yo'q</div>
                      ):goInvites.filter(inv=>String(inv.userId)===String(adminSelectedUser.id)).map((inv,i)=>(
                        <div key={i} style={{background:"#f8fafc",borderRadius:12,padding:"10px",marginBottom:8}}>
                          <div style={{fontWeight:700,fontSize:13}}>{inv.type} — {inv.text?.slice(0,50)}</div>
                          <div style={{fontSize:11,color:C.muted,marginTop:4}}>📅 {inv.date} 🕐 {inv.time} · ❤️ {inv.likes} like {inv.urgent&&"🚨 Shoshilinch"}</div>
                        </div>
                      ))}
                    </div>

                    {/* Admin amallar */}
                    <div style={{background:"#fff",borderRadius:16,padding:"16px",marginBottom:14,border:"1px solid #fecaca"}}>
                      <div style={{fontWeight:800,fontSize:14,marginBottom:10,color:"#ef4444"}}>⚡ Admin amallar</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <button onClick={()=>{
                          // Yashirin ko'rish — foydalanuvchida hech narsa ko'rinmaydi
                          setShowUserDetail(adminSelectedUser);
                          setDetailPhotoIdx(0);
                        }} style={{width:"100%",padding:"11px",borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                          👁️ Profilni yashirin ko'rish
                        </button>
                        <button onClick={()=>{
                          setBlocked(p=>[...p,adminSelectedUser.id]);
                          toast$("🚫 Bloklandi","#ef4444");
                          setAdminSelectedUser(null);
                        }} style={{flex:1,padding:"10px",borderRadius:12,background:"#fff5f5",border:"1px solid #fecaca",color:"#ef4444",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                          🚫 Bloklash
                        </button>
                        <button onClick={()=>{
                          toast$("⚠️ Ogohlantirish yuborildi","#f59e0b");
                        }} style={{flex:1,padding:"10px",borderRadius:12,background:"#fffbeb",border:"1px solid #fde68a",color:"#d97706",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                          ⚠️ Ogohlantirish
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* SHIKOYATLAR */}
                {adminTab==="complaints"&&(
                  <>
                    <div style={{fontSize:13,color:C.muted,marginBottom:10}}>Kelgan shikoyatlar</div>
                    {/* Demo shikoyatlar */}
                    {[
                      {id:1,reporter:"Foydalanuvchi #1",reported:"Jasur Rahimov",reason:"🎭 Soxta profil",desc:"Rasmlar soxta ko'rinadi",status:"pending",time:"2 soat oldin"},
                      {id:2,reporter:"Foydalanuvchi #2",reported:"Bobur Xolmatov",reason:"🤬 Haqorat",desc:"Haqoratli xabarlar yuboryapti",status:"resolved",time:"1 kun oldin"},
                    ].map(c=>(
                      <div key={c.id} style={{background:"#fff",borderRadius:16,padding:"14px",marginBottom:10,border:"1px solid "+(c.status==="pending"?"#fecaca":C.border)}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{fontWeight:800,fontSize:13,color:"#ef4444"}}>{c.reason}</div>
                          <div style={{
                            background:c.status==="pending"?"#fef2f2":"#f0fdf4",
                            color:c.status==="pending"?"#ef4444":"#22c55e",
                            borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700
                          }}>{c.status==="pending"?"⏳ Kutilmoqda":"✅ Hal qilindi"}</div>
                        </div>
                        <div style={{fontSize:12,color:C.text,marginBottom:6}}><b>Kim haqida:</b> {c.reported}</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:6}}>{c.desc}</div>
                        <div style={{fontSize:10,color:C.muted,marginBottom:10}}>🕐 {c.time}</div>
                        {c.status==="pending"&&(
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>toast$("✅ Hal qilindi","#22c55e")} style={{flex:1,padding:"8px",borderRadius:10,background:"#f0fdf4",border:"1px solid #86efac",color:"#22c55e",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Hal qildim</button>
                            <button onClick={()=>toast$("❌ Rad etildi",C.muted)} style={{flex:1,padding:"8px",borderRadius:10,background:"#f8fafc",border:"1px solid "+C.border,color:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>❌ Rad etish</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* STATISTIKA */}
                {adminTab==="stats"&&(
                  <>
                    {[
                      {icon:"👥",label:"Jami foydalanuvchilar",val:ALL_USERS.length,color:"#7c3aed"},
                      {icon:"🟢",label:"Hozir online",val:ALL_USERS.filter(u=>u.online).length,color:"#22c55e"},
                      {icon:"👑",label:"VIP foydalanuvchilar",val:ALL_USERS.filter(u=>u.vip).length,color:"#f59e0b"},
                      {icon:"💬",label:"Jami yozishmalar",val:Object.values(msgs).reduce((a,b)=>a+(b?.length||0),0),color:"#38bdf8"},
                      {icon:"🚀",label:"GO elonlari",val:goInvites.length,color:"#ff6eb4"},
                      {icon:"🚨",label:"Kutilayotgan shikoyatlar",val:2,color:"#ef4444"},
                    ].map((s,i)=>(
                      <div key={i} style={{background:"#fff",borderRadius:16,padding:"14px 16px",marginBottom:8,border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:44,height:44,borderRadius:12,background:s.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:C.muted}}>{s.label}</div>
                          <div style={{fontWeight:900,fontSize:22,color:s.color}}>{s.val}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

              </div>
            </>
          )}
        </div>
      )}

      {/* USER DETAIL */}
      {showUserDetail&&(
        <div style={{...ov,zIndex:900}} onClick={()=>setShowUserDetail(null)}>
          <div
            style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto",position:"relative"}}
            onClick={e=>e.stopPropagation()}
            onTouchStart={e=>{e.stopPropagation();e.currentTarget._touchX=e.touches[0].clientX;}}
            onTouchEnd={e=>{
              e.stopPropagation();
              const dx = e.changedTouches[0].clientX - (e.currentTarget._touchX||0);
              if(dx < -80) setShowUserDetail(null);
            }}
          >
            {/* ORTGA TUGMASI */}
            <div style={{position:"sticky",top:0,zIndex:10,padding:"12px 16px 0",display:"flex",alignItems:"center",background:"transparent",pointerEvents:"none"}}>
              <button
                onClick={()=>setShowUserDetail(null)}
                style={{
                  pointerEvents:"all",
                  width:36,height:36,borderRadius:"50%",
                  background:"rgba(0,0,0,0.45)",
                  backdropFilter:"blur(8px)",
                  border:"none",color:"#fff",
                  fontSize:18,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center"
                }}>←</button>
            </div>
            {(()=>{
              const all=[showUserDetail.demoPhoto,...(showUserDetail.extraPhotos||[])].filter(Boolean);
              const idx=detailPhotoIdx%Math.max(all.length,1);
              return all.length>0?(
                <div style={{position:"relative",height:280,overflow:"hidden",background:"#111",userSelect:"none"}}
                  onContextMenu={e=>e.preventDefault()}
                >
                  {/* Screenshot taqiqi overlay */}
                  <style>{`
                    .no-screenshot { -webkit-user-select:none;user-select:none;-webkit-touch-callout:none; }
                    @media print { .no-screenshot { display:none!important; } }
                  `}</style>
                  <img
                    src={all[idx]}
                    draggable={false}
                    className="no-screenshot"
                    onContextMenu={e=>e.preventDefault()}
                    style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none",userSelect:"none",WebkitUserDrag:"none"}}
                  />
                  {/* Watermark */}
                  <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                    <div style={{color:"rgba(255,255,255,0.08)",fontSize:13,fontWeight:700,transform:"rotate(-30deg)",userSelect:"none",letterSpacing:2}}>
                      💕 LOVE HUB · {showUserDetail.name?.toUpperCase()}
                    </div>
                  </div>
                  {/* Rasm ochish tugmasi */}
                  <button
                    onClick={e=>{e.stopPropagation();setPhotoViewer({user:showUserDetail,idx});}}
                    style={{position:"absolute",top:12,left:12,background:"rgba(0,0,0,0.45)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}
                  >
                    🔍 {all.length} ta rasm
                  </button>
                  {/* Sana/raqam */}
                  <div style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.45)",borderRadius:12,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:600}}>
                    {idx+1}/{all.length}
                  </div>
                  {all.length>1&&(
                    <>
                      {idx>0&&<button onClick={e=>{e.stopPropagation();setDetailPhotoIdx(p=>p-1);}} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.45)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>}
                      {idx<all.length-1&&<button onClick={e=>{e.stopPropagation();setDetailPhotoIdx(p=>p+1);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.45)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>}
                      <div style={{position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:5}}>
                        {all.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setDetailPhotoIdx(i);}} style={{width:i===idx?18:6,height:6,borderRadius:3,background:"#fff",opacity:i===idx?1:0.5,cursor:"pointer"}}/>)}
                      </div>
                    </>
                  )}
                </div>
              ):null;
            })()}
            <div style={{padding:"14px 18px 10px"}}>

              {/* ISHONCHLILIK — MINI */}
              <TrustMeter
                user={showUserDetail}
                liked={liked.includes(showUserDetail.id)}
                blockedCount={blockedTypes[showUserDetail.id]==="full"?1:0}
              />

              <div style={{fontSize:22,fontWeight:900,marginTop:10}}>{showUserDetail.name}, {showUserDetail.age}</div>
              <div style={{fontSize:13,color:C.muted,marginTop:2}}>📍 {showUserDetail.city}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <span style={{fontSize:11,color:C.muted}}>🎁 {showUserDetail.gifts||0}</span>
                <span style={{fontSize:11,color:C.muted}}>❤️ {showUserDetail.likes||0}</span>
              </div>
              {showUserDetail.bio&&<div style={{marginTop:10,background:"#f8fafc",borderRadius:12,padding:"10px 13px",fontSize:13,lineHeight:1.5}}>{showUserDetail.bio}</div>}
              <div style={{marginTop:8}}><Stars r={showUserDetail.rating||4.5}/></div>
            </div>
            <div style={{height:1,background:C.border,margin:"0 18px"}}/>
            <div style={{padding:"8px 18px"}}>
              {[
                {icon:"⚧",label:"Jins",val:showUserDetail.gender==="ayol"?"Ayol":"Erkak"},
                {icon:"💼",label:"Kasbi",val:showUserDetail.kasb||"—"},
                {icon:"📏",label:"Bo'yi",val:showUserDetail.height?(showUserDetail.height+" sm"):"—"},
                {icon:"⚖️",label:"Vazni",val:showUserDetail.weight?(showUserDetail.weight+" kg"):"—"},
                {icon:"💍",label:"Turmush",val:showUserDetail.married==="ha"?"Ha":"Yoq"},
              ].map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border}}>
                  <span style={{fontSize:17,width:22}}>{r.icon}</span>
                  <span style={{fontSize:12,color:C.muted,width:66}}>{r.label}</span>
                  <span style={{fontSize:13,fontWeight:600}}>{r.val}</span>
                </div>
              ))}
              {/* KIMNI QIDIRMOQDA — kichik preview */}
              {showUserDetail.seeking&&(
                <div onClick={()=>setDetailExpandModal("seeking")} style={{
                  marginTop:10,borderRadius:12,padding:"10px 14px",
                  border:"1px solid "+C.border,background:"#fafafa",
                  display:"flex",alignItems:"center",gap:10,cursor:"pointer"
                }}>
                  <span style={{fontSize:16}}>🔍</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:2}}>Kimni qidirmoqda</div>
                    <div style={{fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{showUserDetail.seeking}</div>
                  </div>
                  <span style={{fontSize:14,color:C.muted}}>›</span>
                </div>
              )}

              {/* OVOZLI XABAR — kichik preview */}
              {(()=>{
                const isMe = showUserDetail.id === myUserId;
                const hasVoice = isMe ? voiceBlob : showUserDetail.voiceUrl;
                const declined = isMe ? voiceDeclined : showUserDetail.voiceDeclined;
                const verified = isMe ? voiceVerified : showUserDetail.voiceVerified;
                return (
                  <div onClick={()=>hasVoice&&setDetailExpandModal("voice")} style={{
                    marginTop:8,borderRadius:12,padding:"10px 14px",
                    border:"1px solid "+C.border,background:"#fafafa",
                    display:"flex",alignItems:"center",gap:10,
                    cursor:hasVoice?"pointer":"default"
                  }}>
                    <span style={{fontSize:16}}>🎙️</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:2}}>Ovozli xabar</div>
                      <div style={{fontSize:12,color:hasVoice?"#16a34a":C.muted,fontStyle:!hasVoice?"italic":"normal"}}>
                        {hasVoice?"▶ Tinglash uchun bosing":declined?"Qoldirishni istamadi":"Hali qoldirmagan"}
                      </div>
                    </div>
                    {verified&&<div style={{background:"#22c55e",borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#fff"}}>✅</div>}
                    {hasVoice&&<span style={{fontSize:14,color:C.muted}}>›</span>}
                  </div>
                );
              })()}
            </div>
            <div style={{display:"flex",gap:10,padding:"12px 18px 24px"}}>
              <button onClick={()=>{setShowBlockModal(showUserDetail);setShowUserDetail(null);}} style={{flex:1,background:"#fff5f5",border:"1px solid #fecaca",borderRadius:14,padding:"12px",fontSize:16,cursor:"pointer",fontWeight:700,color:"#ef4444"}}>🚫 Bloklash</button>
              <button onClick={()=>{setGiftModal(showUserDetail);setGiftNote("");setShowUserDetail(null);}} style={{flex:1,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",borderRadius:14,padding:"12px",color:"#fff",fontSize:18,cursor:"pointer",fontWeight:700}}>🎁 Sovga</button>
            </div>
          </div>
        </div>
      )}

      {/* ❤️ LIKE BILDIRISHNOMASI */}
      {likeNotif&&notifSettings.likes&&(
        <div style={{
          position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",
          width:"calc(100% - 32px)",maxWidth:390,
          background:"#fff",borderRadius:20,
          boxShadow:"0 8px 32px rgba(255,110,180,0.3)",
          border:"2px solid #ff6eb4",
          padding:"14px 16px",zIndex:600,
          animation:"slideUp 0.4s ease"
        }}>
          <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(100px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Rasm */}
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",border:"3px solid #ff6eb4"}}>
                {likeNotif.user.demoPhoto
                  ? <img src={likeNotif.user.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{width:"100%",height:"100%",background:"#fff0f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                      {likeNotif.user.emoji||"👤"}
                    </div>
                }
              </div>
              <div style={{position:"absolute",bottom:-2,right:-2,background:"#ff6eb4",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:"2px solid #fff"}}>❤️</div>
            </div>
            {/* Matn */}
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:14,color:"#1e293b"}}>
                {likeNotif.user.name?.split(" ")[0]||"Kimdir"} sizni yoqtirdi! ❤️
              </div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>
                {likeNotif.user.city||""} · Hozirgina
              </div>
            </div>
            {/* Tugmalar */}
            <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
              <button onClick={()=>{
                setLikeNotif(null);
                setShowUserDetail(likeNotif.user);
                setDetailPhotoIdx(0);
              }} style={{
                background:"linear-gradient(135deg,#ff6eb4,#f472b6)",
                border:"none",borderRadius:12,padding:"6px 12px",
                color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"
              }}>Ko'rish</button>
              <button onClick={()=>setLikeNotif(null)} style={{
                background:"#f1f5f9",border:"none",borderRadius:12,
                padding:"6px 12px",color:"#94a3b8",fontWeight:600,
                fontSize:12,cursor:"pointer"
              }}>Yopish</button>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{marginTop:10,height:3,background:"#fee2e2",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",background:"#ff6eb4",borderRadius:2,animation:"progress5s 5s linear forwards"}}/>
          </div>
          <style>{`@keyframes progress5s{from{width:100%}to{width:0%}}`}</style>
        </div>
      )}

      {/* FULLSCREEN PHOTO VIEWER */}
      {photoViewer&&(()=>{
        const all=[photoViewer.user.demoPhoto,...(photoViewer.user.extraPhotos||[])].filter(Boolean);
        const [vi,setVi]=[photoViewer.idx,i=>setPhotoViewer(p=>({...p,idx:i}))];
        const cur=all[vi%Math.max(all.length,1)];
        return (
          <div
            style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"#000",zIndex:999,display:"flex",flexDirection:"column",userSelect:"none"}}
            onContextMenu={e=>e.preventDefault()}
          >
            <style>{`
              .no-ss{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}
              @media print{.no-ss{display:none!important;}}
            `}</style>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"rgba(0,0,0,0.7)",flexShrink:0}}>
              <button onClick={()=>setPhotoViewer(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:36,height:36,color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{photoViewer.user.name} · {(vi%all.length)+1}/{all.length}</div>
              <div style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>🔒</span>
              </div>
            </div>

            {/* Rasm */}
            <div style={{flex:1,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <img
                src={cur}
                draggable={false}
                className="no-ss"
                onContextMenu={e=>e.preventDefault()}
                style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",userSelect:"none",WebkitUserDrag:"none",pointerEvents:"none"}}
              />
              {/* Watermark */}
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",overflow:"hidden"}}>
                {[0,1,2,3,4,5].map(i=>(
                  <div key={i} style={{position:"absolute",color:"rgba(255,255,255,0.06)",fontSize:13,fontWeight:700,whiteSpace:"nowrap",userSelect:"none",
                    top:`${15+i*16}%`,left:`${-10+i*5}%`,transform:"rotate(-30deg)",letterSpacing:2}}>
                    💕 LOVE HUB · {photoViewer.user.name?.toUpperCase()}
                  </div>
                ))}
              </div>
              {/* Chap/O'ng */}
              {all.length>1&&(
                <>
                  <button
                    onClick={()=>setPhotoViewer(p=>({...p,idx:Math.max(0,(p.idx||0)-1)}))}
                    disabled={(vi%all.length)===0}
                    style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:44,height:44,color:"#fff",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:(vi%all.length)===0?0.3:1}}
                  >‹</button>
                  <button
                    onClick={()=>setPhotoViewer(p=>({...p,idx:Math.min(all.length-1,(p.idx||0)+1)}))}
                    disabled={(vi%all.length)===all.length-1}
                    style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:44,height:44,color:"#fff",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:(vi%all.length)===all.length-1?0.3:1}}
                  >›</button>
                </>
              )}
            </div>

            {/* Pastki thumbnail qator */}
            {all.length>1&&(
              <div style={{display:"flex",gap:6,padding:"10px 14px",background:"rgba(0,0,0,0.7)",overflowX:"auto",flexShrink:0}}>
                {all.map((url,i)=>(
                  <div key={i} onClick={()=>setPhotoViewer(p=>({...p,idx:i}))} style={{width:52,height:52,borderRadius:10,overflow:"hidden",flexShrink:0,border:"2px solid "+(i===(vi%all.length)?"#ff6eb4":"transparent"),cursor:"pointer",opacity:i===(vi%all.length)?1:0.55}}>
                    <img src={url} draggable={false} className="no-ss" onContextMenu={e=>e.preventDefault()} style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none"}}/>
                  </div>
                ))}
              </div>
            )}

            {/* Saqlash taqiqi xabari */}
            <div style={{padding:"8px 14px 20px",background:"rgba(0,0,0,0.7)",textAlign:"center"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                🔒 Rasmni saqlash va skrinshot qilish taqiqlangan
              </div>
            </div>
          </div>
        );
      })()}

      {/* CHAT */}
      {chat&&chatUser&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:200,display:"flex",flexDirection:"column"}}>
          <div style={{background:"#fff",padding:"11px 13px",display:"flex",alignItems:"center",gap:9,borderBottom:"1px solid "+C.border}}>
            <button onClick={()=>setChat(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.text}}>←</button>
            <div onClick={()=>{setShowUserDetail(chatUser);setDetailPhotoIdx(0);}} style={{position:"relative",cursor:"pointer"}}>
              <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",border:"2px solid "+C.accent}}>
                {chatUser.demoPhoto?<img src={chatUser.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>{chatUser.emoji}</span>}
              </div>
              <div style={{width:10,height:10,borderRadius:"50%",background:chatUser.online?C.green:C.muted,position:"absolute",bottom:0,right:0,border:"2px solid #fff"}}/>
            </div>
            <div onClick={()=>{setShowUserDetail(chatUser);setDetailPhotoIdx(0);}} style={{flex:1,cursor:"pointer"}}>
              <div style={{fontWeight:800,fontSize:15}}>{chatUser.name.split(" ")[0]} {chatUser.vip&&"👑"}</div>
              <div style={{fontSize:11,color:chatUser.online?C.green:C.muted}}>{chatUser.online?T.online:"Oflayn"}</div>
            </div>

            {/* 3 NUQTA MENYU */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setChatMenuOpen(chatMenuOpen==="header"?null:"header")} style={{
                background:"none",border:"none",fontSize:22,cursor:"pointer",
                color:C.muted,padding:"4px 8px",fontWeight:900
              }}>⋮</button>

              {chatMenuOpen==="header"&&(
                <div style={{
                  position:"absolute",top:36,right:0,
                  background:"#fff",borderRadius:14,
                  boxShadow:"0 8px 32px rgba(0,0,0,0.15)",
                  minWidth:210,zIndex:300,overflow:"hidden",
                  border:"1px solid "+C.border
                }} onClick={e=>e.stopPropagation()}>
                  {/* Telegram taklif */}
                  <div onClick={()=>{
                    setChatMenuOpen(null);
                    const status = tgRequests[chatUser.id];
                    if(status==="pending"){toast$("⏳ Javob kutilmoqda...","#f59e0b");return;}
                    if(status==="accepted"){toast$("✅ Allaqachon qabul qilingan","#22c55e");return;}
                    if(status==="rejected"){toast$("❌ Rad etilgan. Sovga yuborib urining 🎁","#ef4444");return;}
                    setTgRequests(p=>({...p,[chatUser.id]:"pending"}));
                    const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),
                      {from:"me",text:"✈️ Telegram orqali suhbatni davom ettirishni taklif qildim.",time:t2}
                    ]}));
                    setTimeout(()=>setShowTgModal(chatUser), 1500);
                    toast$("✈️ Telegram taklifi yuborildi!","#0088cc");
                  }} style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:"13px 16px",cursor:"pointer",
                    borderBottom:"1px solid "+C.border
                  }}>
                    <span style={{fontSize:20}}>✈️</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:"#0088cc"}}>Telegramga taklif qilish</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                        {tgRequests[chatUser.id]==="pending"?"⏳ Javob kutilmoqda":
                         tgRequests[chatUser.id]==="accepted"?"✅ Qabul qilingan":
                         tgRequests[chatUser.id]==="rejected"?"❌ Rad etilgan":
                         "Telegram orqali davom eting"}
                      </div>
                    </div>
                  </div>
                  {/* Bloklash */}
                  <div onClick={()=>{setChatMenuOpen(null);setShowBlockModal(chatUser);}} style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:"13px 16px",cursor:"pointer",
                    borderBottom:"1px solid "+C.border
                  }}>
                    <span style={{fontSize:20}}>🚫</span>
                    <div style={{fontWeight:700,fontSize:13,color:"#ef4444"}}>Bloklash</div>
                  </div>
                  {/* FON TANLASH */}
                  <div style={{padding:"12px 16px"}}>
                    <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:8}}>🎨 Chat foni</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {[
                        {id:"default", bg:"#e5ddd5", label:"Standart"},
                        {id:"blue", bg:"linear-gradient(135deg,#dbeafe,#e0f2fe)", label:"Ko'k"},
                        {id:"pink", bg:"linear-gradient(135deg,#fce7f3,#fff0f6)", label:"Pushti"},
                        {id:"green", bg:"linear-gradient(135deg,#dcfce7,#d1fae5)", label:"Yashil"},
                        {id:"purple", bg:"linear-gradient(135deg,#f3e8ff,#ede9fe)", label:"Binafsha"},
                        {id:"sunset", bg:"linear-gradient(135deg,#fed7aa,#fecaca)", label:"Quyosh"},
                        {id:"dark", bg:"linear-gradient(135deg,#1e293b,#0f172a)", label:"Qora"},
                        {id:"ocean", bg:"linear-gradient(135deg,#164e63,#0c4a6e)", label:"Okean"},
                        {id:"rose", bg:"linear-gradient(160deg,#ff9a9e,#fad0c4)", label:"Atirgul"},
                        {id:"mint", bg:"linear-gradient(135deg,#a8edea,#fed6e3)", label:"Myata"},
                      ].map(t=>(
                        <div key={t.id} onClick={()=>{
                          setChatBgs(p=>({...p,[chat]:t.id}));
                          setChatMenuOpen(null);
                          toast$("🎨 Fon o'zgartirildi!",C.accent);
                        }} style={{
                          width:36,height:36,borderRadius:10,
                          background:t.bg,cursor:"pointer",
                          border: chatBgs[chat]===t.id?"3px solid "+C.accent:"2px solid transparent",
                          boxShadow: chatBgs[chat]===t.id?"0 0 8px "+C.accent+"88":"none",
                          flexShrink:0,position:"relative"
                        }}>
                          {chatBgs[chat]===t.id&&(
                            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"10px 10px",display:"flex",flexDirection:"column",gap:6,background:(()=>{
  const bgs = {
    default:"#e5ddd5",
    blue:"linear-gradient(135deg,#dbeafe,#e0f2fe)",
    pink:"linear-gradient(135deg,#fce7f3,#fff0f6)",
    green:"linear-gradient(135deg,#dcfce7,#d1fae5)",
    purple:"linear-gradient(135deg,#f3e8ff,#ede9fe)",
    sunset:"linear-gradient(135deg,#fed7aa,#fecaca)",
    dark:"linear-gradient(135deg,#1e293b,#0f172a)",
    ocean:"linear-gradient(135deg,#164e63,#0c4a6e)",
    rose:"linear-gradient(160deg,#ff9a9e,#fad0c4)",
    mint:"linear-gradient(135deg,#a8edea,#fed6e3)",
  };
  return bgs[chatBgs[chat]] || "#e5ddd5";
})()}} onClick={()=>setMsgMenu(null)}>
            {(msgs[chat]||[]).map((m,i)=>{
              const isMe=m.from==="me";
              const base={alignSelf:isMe?"flex-end":"flex-start",maxWidth:"80%",borderRadius:isMe?"18px 4px 18px 18px":"4px 18px 18px 18px",position:"relative"};
              const bg={background:isMe?"#dcf8c6":"#fff",border:"none",padding:"8px 12px",color:"#000",boxShadow:"0 1px 2px rgba(0,0,0,0.13)"};
              const timeEl=(
                <div style={{fontSize:10,color:"rgba(0,0,0,0.4)",marginTop:2,textAlign:isMe?"right":"left",display:"flex",alignItems:"center",justifyContent:isMe?"flex-end":"flex-start",gap:4}}>
                  {m.edited&&<span style={{fontSize:9,fontStyle:"italic",opacity:0.7}}>tahrirlangan</span>}
                  {m.time}
                  {isMe&&(
                    <span style={{fontSize:12,marginLeft:1,lineHeight:1}}>
                      {m.read
                        ? <span style={{color:"#38bdf8"}}>✓✓</span>
                        : <span style={{color:"rgba(0,0,0,0.35)"}}>✓</span>
                      }
                    </span>
                  )}
                </div>
              );
              const isMenuOpen = msgMenu?.chatId===chat && msgMenu?.idx===i;

              // Long press handler
              let pressTimer = null;
              const handleTouchStart = (e) => {
                pressTimer = setTimeout(()=>{
                  e.stopPropagation();
                  setMsgMenu(isMenuOpen ? null : {chatId:chat, idx:i});
                }, 600);
              };
              const handleTouchEnd = () => { clearTimeout(pressTimer); };
              const handleMouseDown = (e) => {
                pressTimer = setTimeout(()=>{
                  e.stopPropagation();
                  setMsgMenu(isMenuOpen ? null : {chatId:chat, idx:i});
                }, 600);
              };
              const handleMouseUp = () => { clearTimeout(pressTimer); };

              // Xabar menyu
              const MsgMenu = () => (
                <div style={{
                  position:"absolute",
                  [isMe?"right":"left"]:0,
                  ...(i < 4 ? {top:"calc(100% + 6px)"} : {bottom:"calc(100% + 6px)"}),
                  background:"#fff",borderRadius:16,
                  boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
                  overflow:"hidden",zIndex:50,
                  minWidth:180,
                }} onClick={e=>e.stopPropagation()}>
                  {/* Javob berish — hammaga */}
                  <div onClick={()=>{
                    setReplyTo({text:m.text||"🎙️ Ovozli xabar", from:m.from==="me"?"Siz":chatUser.name.split(" ")[0], idx:i});
                    setMsgMenu(null);
                  }} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer",borderBottom:"1px solid #f1f5f9"}}>
                    <span style={{fontSize:18}}>↩️</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>Javob berish</span>
                  </div>
                  {/* Tahrirlash — faqat o'z xabarlar */}
                  {isMe && !m.gif && !m.type && !m.voice && (
                    <div onClick={()=>{
                      setEditingMsg({chatId:chat,idx:i});
                      setEditText(m.text||"");
                      setMsgMenu(null);
                    }} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer",borderBottom:"1px solid #f1f5f9"}}>
                      <span style={{fontSize:18}}>✏️</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#3b82f6"}}>Tahrirlash</span>
                    </div>
                  )}
                  {/* O'chirish — faqat o'z xabarlar */}
                  {isMe && (
                    <div onClick={()=>{
                      const msgId = m.id;
                      setMsgs(p=>{
                        const updated = {...p};
                        // Barcha chatlarda shu ID li xabarni o'chirish
                        Object.keys(updated).forEach(key=>{
                          updated[key] = (updated[key]||[]).filter(x=>
                            msgId ? x.id!==msgId : true
                          );
                        });
                        // Index orqali ham o'chirish (ID yo'q bo'lsa)
                        if(!msgId && updated[chat]) {
                          updated[chat] = updated[chat].filter((_,j)=>j!==i);
                        }
                        return updated;
                      });
                      // Supabase dan o'chirish
                      if(sb && msgId) sb.from('messages').delete().eq('id', msgId).catch(()=>{});
                      setMsgMenu(null);
                      toast$("🗑️ Xabar o'chirildi","#ef4444");
                    }} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer"}}>
                      <span style={{fontSize:18}}>🗑️</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#ef4444"}}>O'chirish</span>
                    </div>
                  )}
                  {/* Faqat ko'rish — o'zga xabarlar */}
                  {!isMe && (
                    <div onClick={()=>setMsgMenu(null)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer"}}>
                      <span style={{fontSize:18}}>✕</span>
                      <span style={{fontSize:13,fontWeight:600,color:C.muted}}>Yopish</span>
                    </div>
                  )}
                </div>
              );

              // 3 nuqta tugmasi — xabar ichida
              const ThreeDots = () => (
                <button
                  onClick={e=>{e.stopPropagation();setMsgMenu(isMenuOpen?null:{chatId:chat,idx:i});}}
                  style={{
                    background:"none",border:"none",
                    cursor:"pointer",flexShrink:0,
                    fontSize:16,color:"rgba(0,0,0,0.3)",
                    padding:"0 2px",lineHeight:1,
                    alignSelf:"flex-end",marginBottom:2,
                  }}>⋮</button>
              );

              if(m.voice) return (
                <div key={i} style={{...base,overflow:"visible",display:"flex",alignItems:"flex-end",gap:4,flexDirection:isMe?"row-reverse":"row"}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <div style={{...bg,padding:"8px 12px",minWidth:180,position:"relative"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:34,height:34,borderRadius:"50%",
                        background:isMe?"#007aff":"#ff6eb4",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        flexShrink:0}}>
                        <span style={{fontSize:16}}>🎙️</span>
                      </div>
                      <audio src={m.voiceUrl} controls style={{flex:1,height:32}} controlsList="nodownload" onContextMenu={e=>e.preventDefault()}/>
                      <ThreeDots/>
                    </div>
                    {timeEl}
                    {isMenuOpen&&<MsgMenu/>}
                  </div>
                </div>
              );

              if(m.gif) return (
                <div key={i} style={{...base,overflow:"visible"}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <img src={m.gif} style={{width:"100%",maxWidth:200,borderRadius:"inherit",display:"block"}}/>
                  <div style={{...bg,padding:"4px 10px"}}>{timeEl}</div>
                  {isMenuOpen&&<MsgMenu/>}
                </div>
              );
              if(m.type==="photo") return (
                <div key={i} style={{...base,overflow:"visible"}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <img src={m.payload?.url} alt="" style={{width:"100%",maxWidth:220,borderRadius:14,display:"block"}}/>
                  <div style={{...bg,padding:"4px 8px"}}>{timeEl}</div>
                  {isMenuOpen&&<MsgMenu/>}
                </div>
              );
              if(m.type==="music") return (
                <div key={i} style={{...base,...bg}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>🎵</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700}}>{m.payload?.name}</div><audio src={m.payload?.url} controls style={{width:"100%",height:28}}/></div></div>
                  {timeEl}
                  {isMenuOpen&&<MsgMenu/>}
                </div>
              );
              if(m.type==="file") return (
                <div key={i} style={{...base,...bg}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>📄</span><div><div style={{fontSize:11,fontWeight:700}}>{m.payload?.name}</div><div style={{fontSize:10,opacity:.7}}>{m.payload?.size}</div></div></div>
                  {timeEl}
                  {isMenuOpen&&<MsgMenu/>}
                </div>
              );
              if(m.type==="location") return (
                <div key={i} style={{...base,overflow:"visible"}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <div style={{background:"linear-gradient(135deg,#34d399,#10b981)",padding:"12px 14px",display:"flex",alignItems:"center",gap:8,borderRadius:"inherit"}}><span style={{fontSize:28}}>📍</span><div style={{color:"#fff",fontWeight:700,fontSize:13}}>Joylashuv ulashildi</div></div>
                  <div style={{...bg,padding:"4px 12px"}}>{timeEl}</div>
                  {isMenuOpen&&<MsgMenu/>}
                </div>
              );
              return (
                <div key={i} style={{...base,...bg,fontSize:m.sticker?36:14}} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  {m.replyTo&&(
                    <div style={{
                      background:"rgba(0,0,0,0.07)",borderRadius:8,
                      padding:"5px 8px",marginBottom:5,
                      borderLeft:"3px solid #38bdf8",
                      fontSize:11,color:"rgba(0,0,0,0.6)"
                    }}>
                      <div style={{fontWeight:700,color:"#0284c7",fontSize:10}}>{m.replyTo.from}</div>
                      <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.replyTo.text}</div>
                    </div>
                  )}
                  {m.text?.split("\n").map((line,i,arr)=>(
                    <span key={i}>{line}{i<arr.length-1&&<br/>}</span>
                  ))}
                  <div style={{display:"flex",alignItems:"center",justifyContent:isMe?"flex-end":"flex-start",gap:4}}>
                    {timeEl}
                    <ThreeDots/>
                  </div>
                  {isMenuOpen&&<MsgMenu/>}
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>
          {stickers&&(
            <div style={{background:"#f2f2f7",borderTop:"1px solid #ddd",flexShrink:0}}>
              <div style={{display:"flex",background:"#f2f2f7",borderBottom:"1px solid #e0e0e0",padding:"0 8px"}}>
                {[{k:"emoji",i:"😊"},{k:"gif",i:"GIF"}].map(t=>(
                  <button key={t.k} onClick={()=>setStickerTab(t.k)} style={{padding:"8px 16px",background:"none",border:"none",borderBottom:stickerTab===t.k?"2px solid #007aff":"2px solid transparent",cursor:"pointer",fontSize:13,fontWeight:stickerTab===t.k?600:400,color:stickerTab===t.k?"#007aff":"#8e8e93"}}>{t.i}</button>
                ))}
              </div>
              <div style={{height:200,overflowY:"auto",padding:"6px 4px"}}>
                {stickerTab==="emoji"&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:0}}>
                    {TG_EMOJI.map((em,i)=>(
                      <div key={i} onClick={()=>setInput(prev=>prev+em)} style={{fontSize:28,cursor:"pointer",padding:"4px",borderRadius:8,lineHeight:1.1,textAlign:"center",width:"11.1%"}}>{em}</div>
                    ))}
                  </div>
                )}
                {stickerTab==="gif"&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,padding:"4px"}}>
                    {TG_GIFS.map(g=>(
                      <div key={g.id} onClick={()=>{
                        const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                        setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",text:g.text,time:t,gif:g.url}]}));
                        setStickers(false);
                      }} style={{borderRadius:10,overflow:"hidden",cursor:"pointer",height:80,position:"relative"}}>
                        <img src={g.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        <div style={{position:"absolute",bottom:3,left:3,background:"rgba(0,0,0,0.5)",borderRadius:5,padding:"1px 5px",fontSize:9,color:"#fff",fontWeight:700}}>GIF</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {mediaPanel&&(
            <div style={{background:"#fff",padding:"12px 14px",borderTop:"1px solid "+C.border}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[
                  {icon:"🖼️",label:"Rasm",color:"#3b82f6",fn:()=>{fileTypeRef.current="photo";fileRef.current.accept="image/*";fileRef.current.click();}},
                  {icon:"🎬",label:"Video",color:"#8b5cf6",fn:()=>{fileTypeRef.current="video";fileRef.current.accept="video/*";fileRef.current.click();}},
                  {icon:"🎵",label:"Musiqa",color:"#ec4899",fn:()=>{fileTypeRef.current="music";fileRef.current.accept="audio/*";fileRef.current.click();}},
                  {icon:"📄",label:"Fayl",color:"#f59e0b",fn:()=>{fileTypeRef.current="file";fileRef.current.accept="*/*";fileRef.current.click();}},
                  {icon:"📍",label:"Lokatsiya",color:"#10b981",fn:()=>{
                    const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t,type:"location",payload:{lat:41.2995,lng:69.2401}}]}));
                    setMediaPanel(false);
                  }},
                  {icon:"🎁",label:"Sovga",color:"#ff6eb4",fn:()=>{setGiftModal(chatUser);setMediaPanel(false);}},
                  {icon:"😊",label:"Smaylik",color:"#f97316",fn:()=>{setStickers(true);setMediaPanel(false);}},
                  {icon:"✈️",label:"Telegram",color:"#0088cc",fn:()=>{
                    if(!chatUser.tgUsername && !chatUser.tgUserId){toast$("Bu foydalanuvchi Telegram ma'lumoti yo'q","#ef4444");setMediaPanel(false);return;}
                    const status = tgRequests[chatUser.id];
                    if(status==="accepted"){const _l=chatUser.tgUsername?"https://t.me/"+chatUser.tgUsername:chatUser.tgUserId?"tg://user?id="+chatUser.tgUserId:null;if(_l)window.Telegram?.WebApp?.openTelegramLink?.(_l)||window.open(_l,"_blank");setMediaPanel(false);return;}
                    if(status==="pending"){toast$("So'rov yuborilgan, javob kutilmoqda...","#f59e0b");setMediaPanel(false);return;}
                    if(status==="rejected"){toast$("Taklifingiz rad etildi. Sovga yuborib qaytadan urining 🎁","#ef4444");setMediaPanel(false);return;}
                    // So'rov yuborish
                    setTgRequests(p=>({...p,[chatUser.id]:"pending"}));
                    // Chatda xabar
                    const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                    setMsgs(p=>({...p,[chatUser.id]:[...(p[chatUser.id]||[]),
                      {from:"me",text:"✈️ Telegram orqali suhbatni davom ettirishni taklif qildim. Javob kutilmoqda...",time:t2}
                    ]}));
                    // Demo: 3 soniyadan keyin so'rov keldi deb ko'rsatamiz
                    setTimeout(()=>setShowTgModal(chatUser), 1500);
                    toast$("✈️ Telegram taklifi yuborildi!","#0088cc");
                    setMediaPanel(false);
                  }},
                  {icon:"❌",label:"Yopish",color:"#94a3b8",fn:()=>setMediaPanel(false)},
                ].map((b,i)=>(
                  <div key={i} onClick={b.fn} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",padding:"8px 4px",borderRadius:12,background:b.color+"11",border:"1px solid "+b.color+"33"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,"+b.color+","+b.color+"aa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{b.icon}</div>
                    <div style={{fontSize:9,fontWeight:600,color:b.color}}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{background:"#f2f2f7",padding:"8px 10px",display:"flex",gap:8,alignItems:"flex-end",borderTop:"1px solid #ddd",flexShrink:0,flexDirection:"column"}}>
            {/* REPLY PREVIEW */}
            {replyTo&&(
              <div style={{width:"100%",background:"#e0f2fe",borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:8,borderLeft:"3px solid #38bdf8"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#0284c7"}}>{replyTo.from}</div>
                  <div style={{fontSize:12,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{replyTo.text}</div>
                </div>
                <button onClick={()=>setReplyTo(null)} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",flexShrink:0}}>✕</button>
              </div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"flex-end",width:"100%"}}>
              {chatVoiceRecording&&(
              <div style={{position:"absolute",bottom:60,left:0,right:0,background:"rgba(239,68,68,0.95)",padding:"8px 16px",display:"flex",alignItems:"center",gap:10,zIndex:10}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:"#fff",animation:"pulse 1s infinite"}}/>
                <span style={{color:"#fff",fontWeight:700,fontSize:13}}>🎙️ Yozilmoqda... qo'yib yuboring</span>
              </div>
            )}
            {/* TAHRIRLASH REJIMI */}
            {editingMsg ? (
              <>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
                  <div style={{fontSize:10,color:"#3b82f6",fontWeight:700,paddingLeft:4,display:"flex",alignItems:"center",gap:4}}>
                    ✏️ Xabarni tahrirlash <span onClick={()=>{setEditingMsg(null);setEditText("");}} style={{marginLeft:"auto",color:C.muted,cursor:"pointer",fontSize:13}}>✕ Bekor</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
                    <div style={{flex:1,background:"#fff",borderRadius:20,paddingLeft:14,paddingRight:6,minHeight:36,display:"flex",alignItems:"center",boxShadow:"0 0 0 2px #3b82f6"}}>
                      <input
                        value={editText}
                        onChange={e=>setEditText(e.target.value)}
                        autoFocus
                        style={{flex:1,background:"transparent",border:"none",color:"#000",fontSize:16,outline:"none",padding:"8px 0",fontFamily:"inherit"}}
                      />
                    </div>
                    <button onClick={()=>{
                      if(!editText.trim()){toast$("Matn bo'sh bo'lmasin","#ef4444");return;}
                      const {hasBad}=filterBadWords(editText);
                      if(hasBad){setShowBadWordWarn(true);setTimeout(()=>setShowBadWordWarn(false),4000);return;}
                      setMsgs(p=>({...p,[editingMsg.chatId]:(p[editingMsg.chatId]||[]).map((m,j)=>j===editingMsg.idx?{...m,text:editText,edited:true}:m)}));
                      setEditingMsg(null);setEditText("");
                      toast$("✅ Xabar tahrirlandi","#3b82f6");
                    }} style={{width:36,height:36,borderRadius:"50%",background:"#3b82f6",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{color:"#fff",fontSize:16}}>✓</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button onClick={()=>{setMediaPanel(p=>!p);if(stickers)setStickers(false);}} style={{width:32,height:32,marginBottom:2,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"#8e8e93",flexShrink:0,padding:0}}>📎</button>
                <div style={{flex:1,display:"flex",alignItems:"flex-end",background:"#fff",borderRadius:20,paddingLeft:14,paddingRight:6,minHeight:36,maxHeight:120,boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
                  <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Xabar..." rows={1} style={{flex:1,background:"transparent",border:"none",color:"#000",fontSize:16,outline:"none",padding:"8px 0",fontFamily:"inherit",minWidth:0,resize:"none",maxHeight:80,overflowY:"auto",lineHeight:"1.4",WebkitUserSelect:"text",transform:"translateZ(0)"}}/>
                </div>
                {input.trim() ? (
                  <button onClick={()=>send(input)} style={{width:34,height:34,marginBottom:1,borderRadius:"50%",background:"#007aff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}>
                    <span style={{color:"#fff",fontSize:18,lineHeight:1}}>➤</span>
                  </button>
                ) : (
                  <button
                    onMouseDown={async()=>{
                      try{
                        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
                        const mr = new MediaRecorder(stream);
                        const chunks=[];
                        mr.ondataavailable=e=>chunks.push(e.data);
                        mr.onstop=()=>{
                          stream.getTracks().forEach(t=>t.stop());
                          const blob = new Blob(chunks,{type:"audio/webm"});
                          const url = URL.createObjectURL(blob);
                          const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                          setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t2,voice:true,voiceUrl:url}]}));
                          setChatVoiceRecording(false);
                          toast$("🎙️ Ovozli xabar yuborildi","#22c55e");
                        };
                        mr.start();
                        setChatVoiceMR(mr);
                        setChatVoiceRecording(true);
                      }catch(e){toast$("Mikrofon ruxsati kerak!","#ef4444");}
                    }}
                    onMouseUp={()=>{chatVoiceMR?.stop();}}
                    onTouchStart={async()=>{
                      try{
                        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
                        const mr = new MediaRecorder(stream);
                        const chunks=[];
                        mr.ondataavailable=e=>chunks.push(e.data);
                        mr.onstop=()=>{
                          stream.getTracks().forEach(t=>t.stop());
                          const blob = new Blob(chunks,{type:"audio/webm"});
                          const url = URL.createObjectURL(blob);
                          const t2 = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                          setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t2,voice:true,voiceUrl:url}]}));
                          setChatVoiceRecording(false);
                          toast$("🎙️ Ovozli xabar yuborildi","#22c55e");
                        };
                        mr.start();
                        setChatVoiceMR(mr);
                        setChatVoiceRecording(true);
                      }catch(e){toast$("Mikrofon ruxsati kerak!","#ef4444");}
                    }}
                    onTouchEnd={()=>{chatVoiceMR?.stop();}}
                    style={{
                      width:34,height:34,marginBottom:1,borderRadius:"50%",
                      background:chatVoiceRecording?"#ef4444":"#22c55e",
                      border:"none",cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      flexShrink:0,padding:0,
                      boxShadow:chatVoiceRecording?"0 0 0 4px rgba(239,68,68,0.3)":"none",
                      transition:"all 0.2s"
                    }}>
                    <span style={{color:"#fff",fontSize:18}}>🎙️</span>
                  </button>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#fff,#e0f2fe)",padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+C.border}}>
        <div onClick={()=>setShowAppMenu(true)} style={{fontSize:20,fontWeight:900,background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",cursor:"pointer",userSelect:"none"}}>
          💕 Love Hub ▾
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {vip&&<div style={{background:"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:20,padding:"4px 10px",fontSize:12,fontWeight:800,color:"#fff"}}>👑 VIP</div>}
          <button onClick={()=>setShowLangModal(true)} style={{background:"#e0f2fe",border:"none",borderRadius:12,padding:"5px 10px",fontSize:12,fontWeight:800,cursor:"pointer",color:C.text}}>{LANGS[lang].flag}</button>
          <div onClick={()=>{setTab("shop");checkTabHint("shop");}} style={{background:"linear-gradient(90deg,#38bdf8,#ff6eb4)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff"}}>🛒 {T.shop}</div>
        </div>
      </div>

      {/* TABS CONTENT */}
      <div style={{paddingBottom:80}}>

        {/* DISCOVER */}
        {tab==="discover"&&(
          <div>
            {/* SUB TABS */}
            <div style={{display:"flex",background:"#fff",borderBottom:"1px solid "+C.border,padding:"0 14px"}}>
              {[
                {k:"cards",icon:"⚙️",label:"Qidiruv Parametrlari"},
                {k:"search",icon:"🔎",label:"Maxsus Qidiruv"},
              ].map(st=>(
                <button key={st.k} onClick={()=>{
                  setDiscoverSubTab(st.k);
                  if(st.k==="cards") setShowCardFilter(true);
                }} style={{
                  flex:1,padding:"11px 0",background:"none",border:"none",
                  borderBottom:discoverSubTab===st.k?"3px solid "+C.accent:"3px solid transparent",
                  cursor:"pointer",fontSize:13,fontWeight:discoverSubTab===st.k?800:400,
                  color:discoverSubTab===st.k?C.accent:C.muted,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:5
                }}>
                  {st.icon} {st.label}
                </button>
              ))}
            </div>

            {/* KARTOCHKALAR + FILTR — to'g'ridan */}
            {discoverSubTab==="cards"&&(
              <>
                <div style={{height:10}}/>
                {
                  /* STORIES ROW REMOVED */
                }

                {/* FILTER TAGS — qo'llanilgan filtrlar */}
                {(()=>{
                  const hasFilter = cityF!=="Barchasi" || genderF!=="Barchasi" || ageF[0]!==18 || ageF[1]!==99;
                  if(!hasFilter) return null;
                  return (
                    <div style={{margin:"10px 12px 10px",display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                      {cityF!=="Barchasi"&&<div style={{background:C.accent,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:4}}>📍{cityF}<span onClick={()=>{setCityF("Barchasi");setCardI(0);}} style={{cursor:"pointer",opacity:0.8}}>✕</span></div>}
                      {genderF!=="Barchasi"&&<div style={{background:C.sky,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:4}}>{genderF==="ayol"?"👩":"👨"} {genderF}<span onClick={()=>{setGenderF("Barchasi");setCardI(0);}} style={{cursor:"pointer",opacity:0.8}}>✕</span></div>}
                      {(ageF[0]!==18||ageF[1]!==99)&&<div style={{background:"#8b5cf6",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:4}}>🎂{ageF[0]}-{ageF[1]}<span onClick={()=>{setAgeF([18,99]);setCardI(0);}} style={{cursor:"pointer",opacity:0.8}}>✕</span></div>}
                    </div>
                  );
                })()}

                {/* FILTER BOTTOM SHEET MODAL */}
                {showCardFilter&&(
                  <div style={{...ov,zIndex:500}} onClick={()=>setShowCardFilter(false)}>
                    <div style={{...mb,maxHeight:"85vh"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                        <div style={{fontWeight:900,fontSize:18,color:C.text}}>⚙️ Qidiruv filtri</div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{setCityF("Barchasi");setGenderF("Barchasi");setAgeF([18,99]);setCardI(0);toast$("Filtr tozalandi",C.muted);}} style={{background:"#fee2e2",border:"none",borderRadius:20,padding:"5px 12px",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>Tozalash</button>
                          <button onClick={()=>setShowCardFilter(false)} style={{background:"#f0f9ff",border:"none",borderRadius:"50%",width:30,height:30,fontSize:16,cursor:"pointer",color:C.muted}}>✕</button>
                        </div>
                      </div>
                      <div style={{marginBottom:16}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span>📍</span> Viloyat / Shahar</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {["Barchasi",...VILOYATLAR].map(c=>(
                            <button key={c} onClick={()=>{setCityF(c);setCardI(0);}} style={{padding:"7px 13px",borderRadius:20,border:"2px solid "+(cityF===c?C.accent:C.border),background:cityF===c?C.accent:"#f8fafc",color:cityF===c?"#fff":C.text,fontSize:12,fontWeight:cityF===c?700:400,cursor:"pointer"}}>{c==="Barchasi"?"🌐 Barchasi":c}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{marginBottom:16}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span>⚧</span> Jins</div>
                        <div style={{display:"flex",gap:8}}>
                          {[{v:"Barchasi",l:"🌐 Barchasi",c:C.sky},{v:"ayol",l:"👩 Ayol",c:C.accent},{v:"erkak",l:"👨 Erkak",c:"#3b82f6"}].map(g=>(
                            <button key={g.v} onClick={()=>{setGenderF(g.v);setCardI(0);}} style={{flex:1,padding:"10px 6px",borderRadius:13,border:"2px solid "+(genderF===g.v?g.c:C.border),background:genderF===g.v?g.c:"#f8fafc",color:genderF===g.v?"#fff":C.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>{g.l}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{marginBottom:20}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                          <div style={{fontSize:12,fontWeight:700,color:C.muted,display:"flex",alignItems:"center",gap:6}}><span>🎂</span> Yosh oralig'i</div>
                          <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:900,color:"#fff"}}>{ageF[0]} – {ageF[1]}</div>
                        </div>
                        <div style={{position:"relative",height:40,paddingTop:8}}>
                          <div style={{position:"absolute",top:"50%",left:0,right:0,height:5,background:"#e0f2fe",borderRadius:3,transform:"translateY(-50%)"}}/>
                          <div style={{position:"absolute",top:"50%",height:5,background:"linear-gradient(90deg,"+C.accent+","+C.sky+")",borderRadius:3,transform:"translateY(-50%)",left:((ageF[0]-18)/81*100)+"%",right:(100-(ageF[1]-18)/81*100)+"%"}}/>
                          <input type="range" min={18} max={99} value={ageF[0]} onChange={e=>{const v=+e.target.value;if(v<ageF[1]-1){setAgeF([v,ageF[1]]);setCardI(0);}}} style={{position:"absolute",width:"100%",top:"50%",transform:"translateY(-50%)",appearance:"none",WebkitAppearance:"none",background:"transparent",outline:"none",zIndex:3}} className="rng"/>
                          <input type="range" min={18} max={99} value={ageF[1]} onChange={e=>{const v=+e.target.value;if(v>ageF[0]+1){setAgeF([ageF[0],v]);setCardI(0);}}} style={{position:"absolute",width:"100%",top:"50%",transform:"translateY(-50%)",appearance:"none",WebkitAppearance:"none",background:"transparent",outline:"none",zIndex:3}} className="rng"/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                          {[18,25,30,40,50,60,70,99].map(y=>(<span key={y} style={{fontSize:9,color:C.muted}}>{y}</span>))}
                        </div>
                      </div>
                      <button onClick={()=>{setShowCardFilter(false);toast$("Filtr qo'llandi!",C.accent);}} style={{width:"100%",background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:"0 4px 16px rgba(255,110,180,0.3)"}}>✅ Qo'llash</button>
                    </div>
                  </div>
                )}
                {cur&&(
                  <div style={{borderRadius:24,margin:"0 12px 14px",overflow:"hidden",boxShadow:"0 8px 32px rgba(56,189,248,0.1)",transition:"transform 0.45s,opacity 0.4s",transform:swipe==="right"?"translateX(130%) rotate(22deg)":swipe==="left"?"translateX(-130%) rotate(-22deg)":"none",opacity:swipe?0:1,position:"relative"}}>
                    <div style={{height:480,position:"relative",overflow:"hidden",background:"#111"}}>
                      <div onClick={()=>{setShowUserDetail(cur);setDetailPhotoIdx(0);}} style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                        {cur.demoPhoto?<img src={cur.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:130}}>{cur.emoji}</div>}
                      </div>
                      {/* Gradient overlay */}
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:200,background:"linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",pointerEvents:"none"}}/>
                      {/* Online badge */}
                      {cur.online&&<div style={{position:"absolute",top:14,left:14,background:C.green,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>🟢 Online</div>}
                      {/* 3 dot menu */}
                      <div style={{position:"absolute",top:12,right:12,zIndex:5}}>
                        <button onClick={e=>{e.stopPropagation();setCardMenu(cardMenu===cur.id?null:cur.id);}} style={{width:34,height:34,borderRadius:"50%",background:"rgba(0,0,0,0.4)",border:"none",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>•••</button>
                        {cardMenu===cur.id&&(
                          <div style={{position:"absolute",top:40,right:0,background:"#fff",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",minWidth:170,zIndex:10,overflow:"hidden"}}>
                            <div onClick={e=>{e.stopPropagation();setShowBlockModal(cur);setCardMenu(null);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer"}}>
                              <span style={{fontSize:18}}>🚫</span>
                              <div><div style={{fontWeight:700,fontSize:13,color:"#ef4444"}}>Bloklash / Shikoyat</div></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Ism + shahar */}
                      <div onClick={()=>{setShowUserDetail(cur);setDetailPhotoIdx(0);}} style={{position:"absolute",bottom:72,left:16,right:16,cursor:"pointer",zIndex:3}}>
                        <div style={{fontSize:24,fontWeight:900,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,0.5)"}}>{cur.name.split(" ")[0]}, {cur.age} {cur.vip&&"👑"}</div>
                        <div style={{fontSize:13,color:"rgba(255,255,255,0.85)",marginTop:2}}>📍 {cur.city}</div>
                      </div>
                      {/* Tugmalar — foto ichida pastda */}
                      <div style={{position:"absolute",bottom:12,left:0,right:0,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"0 24px",zIndex:4}}>
                        <button onClick={dislike} style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.2)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,255,255,0.3)",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                        <button onClick={()=>{setGiftModal(cur);setGiftNote("");}} style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",fontSize:20,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(245,158,11,0.5)"}}>🎁</button>
                        <button onClick={()=>like(cur.id)} style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#ff6eb4,#f472b6)",border:"none",fontSize:24,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(255,110,180,0.5)"}}>❤️</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* MAXSUS QIDIRUV */}
            {discoverSubTab==="search"&&(
              <AdvancedSearch
                matches={matches} msgs={msgs} blocked={blocked}
                users={ALL_USERS}
                onOpenChat={(userId)=>setChat(userId)}
                onOpenProfile={(user)=>{setShowUserDetail(user);setDetailPhotoIdx(0);}}
                onLike={(userId)=>like(userId)} onDislike={dislike}
                onGift={(user)=>{setGiftModal(user);setGiftNote("");}}
                onWave={(user)=>setShowWaveModal(user)}
                onBlock={(user)=>setShowBlockModal(user)}
              />
            )}

          </div>
        )}

        {/* LICHKA */}
        {tab==="matches"&&(
          <div style={{padding:"12px 14px"}}>

            {/* SARLAVHA + ONLINE FILTER */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:16,fontWeight:800}}>💬 Yozishmalar ({matchUsers.length})</div>
              <button onClick={()=>setShowOnlineOnly(p=>!p)} style={{
                background:showOnlineOnly?"#22c55e":"#f1f5f9",
                border:"none",borderRadius:20,padding:"5px 12px",
                color:showOnlineOnly?"#fff":C.muted,
                fontSize:11,fontWeight:700,cursor:"pointer",
                display:"flex",alignItems:"center",gap:5
              }}>
                <div style={{width:7,height:7,borderRadius:"50%",background:showOnlineOnly?"#fff":"#22c55e"}}/>
                Onlayn
              </button>
            </div>

            {/* QIDIRUV */}
            {matchUsers.length>0&&(
              <div style={{
                display:"flex",alignItems:"center",gap:8,
                background:"#f1f5f9",borderRadius:12,
                padding:"8px 12px",marginBottom:10
              }}>
                <span style={{fontSize:14,color:C.muted}}>🔍</span>
                <input
                  value={matchSearch}
                  onChange={e=>setMatchSearch(e.target.value)}
                  placeholder="Ism bo'yicha qidirish..."
                  style={{flex:1,background:"transparent",border:"none",
                    color:C.text,fontSize:16,outline:"none",fontFamily:"inherit"}}
                />
                {matchSearch&&<button onClick={()=>setMatchSearch("")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>✕</button>}
              </div>
            )}

            {/* JINS FILTRI */}
            {matchUsers.length>0&&(
              <div style={{display:"flex",background:"#f1f5f9",borderRadius:16,padding:4,marginBottom:12}}>
                {[
                  {k:"all",   label:"🌐 Barchasi", activeColor:"#1e293b"},
                  {k:"ayol",  label:"👩 Ayollar",  activeColor:"#ff6eb4"},
                  {k:"erkak", label:"👨 Erkaklar", activeColor:"#1e293b"},
                ].map(t=>{
                  const count = t.k==="all" ? matchUsers.length : matchUsers.filter(u=>u.gender===t.k).length;
                  return (
                    <button key={t.k} onClick={()=>setMatchGenderTab(t.k)} style={{
                      flex:1,padding:"8px 4px",borderRadius:12,border:"none",cursor:"pointer",
                      background:matchGenderTab===t.k?"#fff":"transparent",
                      color:matchGenderTab===t.k?t.activeColor:C.muted,
                      fontWeight:matchGenderTab===t.k?800:500,
                      fontSize:12,
                      boxShadow:matchGenderTab===t.k?"0 2px 8px rgba(0,0,0,0.08)":"none",
                      transition:"all 0.2s"
                    }}>
                      {t.label} <span style={{fontSize:10,opacity:0.7}}>({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {matchUsers.length===0&&<div style={{color:C.muted,textAlign:"center",padding:40}}>{T.noMatch}</div>}

            {(()=>{
              // Filtr
              let filtered = matchGenderTab==="all" ? matchUsers : matchUsers.filter(u=>u.gender===matchGenderTab);
              if(showOnlineOnly) filtered = filtered.filter(u=>u.online);
              if(matchSearch.trim()) filtered = filtered.filter(u=>u.name.toLowerCase().includes(matchSearch.toLowerCase()));
              const sorted = [...filtered].sort((a,b)=>{
                const aPinned = pinnedChats.includes(a.id);
                const bPinned = pinnedChats.includes(b.id);
                if(aPinned && !bPinned) return -1;
                if(!aPinned && bPinned) return 1;
                const aMsg = (msgs[a.id]||[]).slice(-1)[0];
                const bMsg = (msgs[b.id]||[]).slice(-1)[0];
                if(!aMsg && !bMsg) return 0;
                if(!aMsg) return 1;
                if(!bMsg) return -1;
                return aMsg.time < bMsg.time ? 1 : -1;
              });

              const renderUser = (u) => {
                const isPinned = pinnedChats.includes(u.id);
                const isArchived = archivedChats.includes(u.id);
                const unread = (msgs[u.id]||[]).filter(m=>m.from!=="me").length;
                const lastMsg = (msgs[u.id]||[]).slice(-1)[0];
                const isTyping = typingUsers[u.id];

                // Vaqt formatlash
                const getTime = () => {
                  if(!lastMsg) return "";
                  const now = Date.now();
                  const diff = now - (lastMsg.ts || now);
                  if(diff < 60000) return "hozirgina";
                  if(diff < 3600000) return Math.floor(diff/60000)+"daq";
                  if(diff < 86400000) return Math.floor(diff/3600000)+"soat";
                  return Math.floor(diff/86400000)+"kun";
                };

                // Oxirgi xabar holati
                const getMsgStatus = () => {
                  if(!lastMsg || lastMsg.from !== "me") return null;
                  return lastMsg.read
                    ? <span style={{color:"#38bdf8",fontSize:11}}>✓✓</span>
                    : <span style={{color:C.muted,fontSize:11}}>✓</span>;
                };

                return (
                  <div key={u.id} style={{
                    background: isPinned?"linear-gradient(135deg,#fff0f6,#f0f9ff)":"#fff",
                    borderRadius:16,padding:"10px 12px",marginBottom:8,
                    border:"1px solid "+(isPinned?C.accent:u.gender==="ayol"?"#fce7f3":"#e0f2fe"),
                    display:"flex",alignItems:"center",gap:11,position:"relative"
                  }}>
                    {isPinned&&<div style={{position:"absolute",top:6,right:8,fontSize:10,color:C.accent}}>📌</div>}

                    {/* Avatar */}
                    <div onClick={()=>{setShowUserDetail(u);setDetailPhotoIdx(0);}} style={{position:"relative",flexShrink:0,cursor:"pointer"}}>
                      <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",
                        border:"2px solid "+(u.gender==="ayol"?"#ff6eb4":"#38bdf8")}}>
                        {u.demoPhoto?<img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:30}}>{u.emoji}</span>}
                      </div>
                      {/* Online dot */}
                      <div style={{width:12,height:12,borderRadius:"50%",
                        background:u.online?"#22c55e":"#cbd5e1",
                        position:"absolute",bottom:0,right:0,border:"2px solid #fff",
                        boxShadow:u.online?"0 0 6px #22c55e":""}}/>
                    </div>

                    {/* Mazmun */}
                    <div onClick={()=>setChat(u.id)} style={{flex:1,cursor:"pointer",minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontWeight:800,fontSize:14,color:C.text}}>
                          {u.name.split(" ")[0]}, {u.age} {u.vip&&"👑"}
                        </div>
                        <div style={{fontSize:10,color:C.muted,flexShrink:0,display:"flex",alignItems:"center",gap:3}}>
                          {getMsgStatus()} {getTime()}
                        </div>
                      </div>
                      <div style={{fontSize:12,color:isTyping?"#22c55e":C.muted,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                        fontStyle:isTyping?"italic":"normal",marginTop:2}}>
                        {isTyping ? "✍️ yozmoqda..." :
                          lastMsg ? (lastMsg.voice ? "🎙️ Ovozli xabar" :
                          lastMsg.from==="me" ? "Siz: "+lastMsg.text : lastMsg.text)
                          : T.writeMsg}
                      </div>
                    </div>

                    {/* O'ng: unread + pin */}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0}}>
                      {unread > 0 ? (
                        <div style={{width:22,height:22,borderRadius:"50%",background:"#22c55e",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:10,fontWeight:900,color:"#fff"}}>
                          {unread>99?"99+":unread}
                        </div>
                      ) : <div style={{width:22}}/>}
                      <button onClick={e=>{e.stopPropagation();
                        setPinnedChats(p=>isPinned?p.filter(id=>id!==u.id):[...p,u.id]);
                        toast$(isPinned?"Pin olib tashlandi":"📌 Pinlandi!",C.accent);
                      }} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",
                        color:isPinned?C.accent:C.muted,padding:2}}>📌</button>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {sorted.length===0&&(
                    <div style={{textAlign:"center",padding:40,color:C.muted}}>
                      <div style={{fontSize:36,marginBottom:8}}>💬</div>
                      <div style={{fontSize:13}}>
                        {matchSearch?"Topilmadi":showOnlineOnly?"Onlayn do'st yo'q":"Hali yozishmalar yo'q"}
                      </div>
                    </div>
                  )}
                  {sorted.map(renderUser)}
                </>
              );
            })()}
          </div>
        )}

        {/* GO */}
        {tab==="go"&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{background:locationSharing?"linear-gradient(135deg,#f0fdf4,#e0f2fe)":"#fff",borderRadius:18,padding:14,marginBottom:14,border:"2px solid "+(locationSharing?C.green:"#c7d9f0")}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:locationSharing?10:0}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15,color:locationSharing?C.green:C.text}}>📍 {locationSharing?"Lokatsiya yoqiq":"Yaqin atrofdagilar"}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{locationSharing?nearbyUsers.filter(u=>u.dist<=nearbyRadius).length+" ta foydalanuvchi":"Lokatsiyani yoqib toping"}</div>
                </div>
                <button onClick={locationSharing?()=>{setLocationSharing(false);setNearbyUsers([]);toast$("Lokatsiya ochirildi",C.muted);}:startLocation} style={{background:locationSharing?"#fee2e2":"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",borderRadius:20,padding:"8px 14px",color:locationSharing?"#ef4444":"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>{locationSharing?"Ochirish":"📍 Yoqish"}</button>
              </div>
              {locationSharing&&(
                <>
                  <textarea value={myLocationStatus} onChange={e=>{if(e.target.value.length<=60)setMyLocationStatus(e.target.value);}} placeholder="Nima qilmoqchisiz? (60 harf)" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"7px 11px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box",resize:"none",fontFamily:"inherit",minHeight:36,marginBottom:8}}/>
                  <div style={{display:"flex",gap:6,marginBottom:10}}>
                    {[500,1000,2000,5000].map(r=><button key={r} onClick={()=>{setNearbyRadius(r);setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=r));}} style={chipStyle(nearbyRadius===r,C.green)}>{r>=1000?r/1000+"km":r+"m"}</button>)}
                  </div>
                  {nearbyUsers.length>0&&(
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{fontSize:11,color:C.muted}}>Atrofingizdagilar:</div>
                        <button onClick={()=>setShowMap(true)} style={{background:"linear-gradient(135deg,#38bdf8,#ff6eb4)",border:"none",borderRadius:12,padding:"4px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Xaritada korish</button>
                      </div>
                      <div style={{display:"flex",gap:10,overflowX:"auto"}}>
                        {nearbyUsers.filter(u=>u.dist<=nearbyRadius).sort((a,b)=>a.dist-b.dist).map(u=>(
                          <div key={u.id} style={{flexShrink:0,textAlign:"center",width:70}}>
                            <div style={{width:54,height:54,borderRadius:"50%",overflow:"hidden",border:"2px solid "+(u.gender==="ayol"?C.accent:C.green),margin:"0 auto 3px"}}>
                              <img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            </div>
                            <div style={{fontSize:10,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                            <div style={{fontSize:9,color:C.green}}>{u.dist>=1000?(u.dist/1000).toFixed(1)+"km":u.dist+"m"}</div>
                            <div style={{display:"flex",gap:3,marginTop:3,justifyContent:"center"}}>
                              <button onClick={()=>setShowWaveModal(u)} style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:8,padding:"3px 8px",fontSize:10,color:"#fff",cursor:"pointer"}}>👋</button>
                              <button onClick={()=>setShowBlockModal(u)} style={{background:"#fee2e2",border:"none",borderRadius:8,padding:"3px 6px",fontSize:10,color:"#ef4444",cursor:"pointer"}}>🚫</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* GO TAVSIF BANNERI */}
            <div style={{
              background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",
              borderRadius:16,padding:"14px 16px",marginBottom:12,
              border:"1px solid #fbcfe8"
            }}>
              <div style={{fontWeight:900,fontSize:15,color:C.accent,marginBottom:4}}>
                🚀 GO — Real uchrashuv va Sayohat
              </div>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.7}}>
                Bu yerda siz kinoga, tushlikka, parkka yoki sayohatga birga borish uchun e'lon qo'yishingiz mumkin. Manzilingizni yoqing va atrofdagilarni toping. Taklifga qo'shilish uchun so'rov yuboring — egasi ruxsat bersa, yozishmalar boshlanadi! 🎯
              </div>
            </div>

            {/* TAB: Barcha | Mening */}
            <div style={{display:"flex",background:"#f1f5f9",borderRadius:16,padding:4,marginBottom:12}}>
              <button onClick={()=>setGoMainTab("all")} style={{
                flex:1,padding:"9px 4px",borderRadius:12,border:"none",cursor:"pointer",
                background:goMainTab==="all"?"#fff":"transparent",
                color:"#1e293b",
                fontWeight:goMainTab==="all"?800:500,fontSize:13,
                boxShadow:goMainTab==="all"?"0 2px 8px rgba(0,0,0,0.08)":"none",
                transition:"all 0.2s"
              }}>🌐 Barcha e'lonlar</button>
              <button onClick={()=>setGoMainTab("mine")} style={{
                flex:1,padding:"9px 4px",borderRadius:12,border:"none",cursor:"pointer",
                background:goMainTab==="mine"?"#fff":"transparent",
                color:"#1e293b",
                fontWeight:goMainTab==="mine"?800:500,fontSize:13,
                boxShadow:goMainTab==="mine"?"0 2px 8px rgba(0,0,0,0.08)":"none",
                transition:"all 0.2s"
              }}>📋 Mening e'lonlarim</button>
            </div>

            {/* MENING E'LONLARIM */}
            {goMainTab==="mine"&&(()=>{
              const myEvs = goInvites.filter(inv=>inv.mine || String(inv.userId)===String(myUserId));
              const now = new Date();
              const active = myEvs.filter(inv=>{
                if(!inv.date||inv.date==="—") return true;
                const d = new Date(inv.date);
                return isNaN(d) || d >= now;
              });
              const old = myEvs.filter(inv=>{
                if(!inv.date||inv.date==="—") return false;
                const d = new Date(inv.date);
                return !isNaN(d) && d < now;
              });

              return (
                <>
                  {/* + Elon tugmasi */}
                  <button onClick={()=>{
                    if(lastInviteTime&&(Date.now()-lastInviteTime)<24*60*60*1000){
                      const r=Math.ceil((24*60*60*1000-(Date.now()-lastInviteTime))/3600000);
                      toast$("⏳ "+r+" soatdan so'ng!","#f59e0b");return;
                    }
                    setShowCreateEvent(true);
                  }} style={{
                    width:"100%",padding:"12px",marginBottom:12,
                    borderRadius:14,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border:"none",color:"#fff",fontWeight:800,fontSize:14,
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6
                  }}>➕ Elon qo'shish</button>

                  {myEvs.length===0 ? (
                    <div style={{textAlign:"center",padding:"30px 20px",color:C.muted}}>
                      <div style={{fontSize:40,marginBottom:10}}>🚀</div>
                      <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Hali e'lon yo'q</div>
                      <div style={{fontSize:13}}>Yuqoridagi tugma orqali birinchi e'loningizni joylang!</div>
                    </div>
                  ) : null}

                  {(()=>{
                  const renderInv = (inv, isOld) => (
                <div key={inv.id} style={{
                  background:isOld?"#f8fafc":"#fff",
                  borderRadius:16,padding:"14px",marginBottom:10,
                  border:"1px solid "+(isOld?C.border:inv.urgent?"#f97316":C.accent+"44"),
                  opacity:isOld?0.7:1
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{
                      background:isOld?"#f1f5f9":C.accent+"18",
                      borderRadius:10,padding:"4px 10px",
                      fontSize:11,fontWeight:700,
                      color:isOld?C.muted:C.accent
                    }}>{inv.type}</div>
                    {inv.urgent&&!isOld&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:900,borderRadius:20,padding:"2px 7px"}}>🚨 SHOSHILINCH</span>}
                    {isOld&&<span style={{background:"#f1f5f9",color:C.muted,fontSize:9,fontWeight:700,borderRadius:20,padding:"2px 7px"}}>⏰ Tugagan</span>}
                  </div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{inv.text?.split(" — ")[0]}</div>
                  {inv.text?.includes(" — ")&&<div style={{fontSize:12,color:C.muted,marginBottom:6}}>{inv.text.split(" — ")[1]}</div>}
                  <div style={{display:"flex",gap:10,fontSize:11,color:C.muted,marginBottom:8}}>
                    <span>📅 {inv.date}</span>
                    <span>🕐 {inv.time}</span>
                    <span>📍 {inv.city}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:10,fontSize:12,color:C.muted,alignItems:"center"}}>
                      <span>❤️ {inv.likes} like</span>
                      <button onClick={()=>setShowGoComments(inv.id)} style={{background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:C.text,display:"flex",alignItems:"center",gap:3}}>
                        💬 {(goComments[inv.id]||[]).length}
                      </button>
                    </div>
                    {!isOld&&(
                      <button onClick={()=>{
                        setGoInvites(p=>p.filter(i=>i.id!==inv.id));
                        toast$("E'lon o'chirildi","#ef4444");
                      }} style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:"#ef4444",cursor:"pointer"}}>🗑️ O'chirish</button>
                    )}
                  </div>
                </div>
              );

              return (
                <>
                  {active.length>0&&(
                    <>
                      <div style={{fontSize:12,fontWeight:800,color:C.accent,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:C.green}}/>
                        Aktual e'lonlar ({active.length})
                      </div>
                      {active.map(inv=>renderInv(inv,false))}
                    </>
                  )}
                  {old.length>0&&(
                    <>
                      <div style={{fontSize:12,fontWeight:800,color:C.muted,marginBottom:8,marginTop:12,display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:C.muted}}/>
                        Eski e'lonlar ({old.length})
                      </div>
                      {old.map(inv=>renderInv(inv,true))}
                    </>
                  )}
                  </>);
                  })()}
                </>
              );
            })()}

            {/* BARCHA E'LONLAR */}
            {goMainTab==="all"&&(
              <>
              <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
                {["Barchasi","🎬 Kino","🍽️ Ovqatlanish","🌳 Parkka","🚗 Avtomobilda sayr","💪 GYM zal","🛍️ Shoping"].map(f=><button key={f} onClick={()=>setGoFilter(f)} style={{...chipStyle(goFilter===f),flexShrink:0,whiteSpace:"nowrap"}}>{f}</button>)}
              </div>
              {goInvites.filter(inv=>{
              const typeOk=goFilter==="Barchasi"||inv.type===goFilter;
              const genderOk=goGenderFilter==="barchasi"||inv.audience===goGenderFilter||inv.audience==="barchasi";
              const cityOk=goCityFilter==="Barchasi"||inv.city===goCityFilter||inv.city?.includes(goCityFilter);
              return typeOk&&genderOk&&cityOk;
            }).map(inv=>(
              <div key={inv.id} style={{background:"#fff",borderRadius:18,padding:14,marginBottom:12,border:"1px solid "+C.border}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                  <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",border:"2px solid "+C.accent,flexShrink:0}}>
                    {inv.demoPhoto?<img src={inv.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>👤</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                      {inv.name}
                      {inv.urgent&&(
                        <span style={{
                          background:"linear-gradient(135deg,#ef4444,#f97316)",
                          color:"#fff",fontSize:9,fontWeight:900,
                          borderRadius:20,padding:"2px 7px",
                          animation:"pulse 1s infinite",
                          letterSpacing:0.5
                        }}>🚨 SHOSHILINCH</span>
                      )}
                    </div>
                    <div style={{fontSize:11,color:C.muted}}>📍 {inv.city}</div>
                  </div>
                  <div style={{background:C.accent+"18",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:700,color:C.accent}}>{inv.type}</div>
                </div>
                <div style={{fontSize:14,marginBottom:10}}>{inv.text}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8}}><span style={{fontSize:12,color:C.muted}}>📅 {inv.date}</span><span style={{fontSize:12,color:C.muted}}>🕐 {inv.time}</span></div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setGoInvites(p=>p.map(i=>i.id===inv.id?{...i,likes:i.liked?i.likes-1:i.likes+1,liked:!i.liked}:i))} style={{background:inv.liked?C.accent:"#f0f9ff",border:"1px solid "+(inv.liked?C.accent:C.border),borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:inv.liked?"#fff":C.text}}>❤️ {inv.likes}</button>
                    <button onClick={()=>setShowGoComments(inv.id)} style={{background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:C.text,display:"flex",alignItems:"center",gap:4}}>
                      💬 {(goComments[inv.id]||[]).length}
                    </button>
                    <button onClick={()=>{
                      // Post egasiga so'rov yuborish
                      // Bildirishnoma
                      toast$("✅ So'rovingiz yuborildi! Javob kutilmoqda...","#22c55e");
                      // Demo: 2 soniyadan keyin post egasiga modal keladi
                      setTimeout(()=>setShowGoRequestModal({inv}), 2000);
                    }} style={{background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff"}}>Qoshilish</button>
                  </div>
                </div>
              </div>
            ))}
            </>
            )}
            {/* GO FILTER MODAL */}
            {showGoFilter&&(
              <div style={{...ov,zIndex:350}} onClick={()=>setShowGoFilter(false)}>
                <div style={mb} onClick={e=>e.stopPropagation()}>
                  <div style={{fontWeight:900,fontSize:18,marginBottom:16}}>⚙️ Filtr</div>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>👥 Kim qo'ygan:</div>
                    <div style={{display:"flex",gap:8}}>
                      {[{v:"barchasi",l:"Barchasi"},{v:"ayollar",l:"Ayollar"},{v:"erkaklar",l:"Erkaklar"}].map(g=>(
                        <button key={g.v} onClick={()=>setGoGenderFilter(g.v)} style={{flex:1,padding:"9px 6px",borderRadius:12,border:"2px solid "+(goGenderFilter===g.v?C.accent:C.border),background:goGenderFilter===g.v?C.accent:"#f0f9ff",color:goGenderFilter===g.v?"#fff":C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>{g.l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>📍 Hudud:</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {["Barchasi",...VILOYATLAR].map(v=>(
                        <button key={v} onClick={()=>setGoCityFilter(v)} style={{padding:"6px 12px",borderRadius:20,border:"2px solid "+(goCityFilter===v?C.accent:C.border),background:goCityFilter===v?C.accent:"#f0f9ff",color:goCityFilter===v?"#fff":C.text,fontSize:11,fontWeight:goCityFilter===v?700:400,cursor:"pointer",flexShrink:0}}>{v==="Barchasi"?"Barchasi":v}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={()=>setShowGoFilter(false)} style={bigBtn("linear-gradient(90deg,#38bdf8,#6366f1)")}>✅ Qo'llash</button>
                  <button onClick={()=>setShowGoFilter(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Yopish</button>
                </div>
              </div>
            )}
            {/* CREATE EVENT MODAL */}
            {showCreateEvent&&(
              <div style={{...ov,zIndex:350}} onClick={()=>setShowCreateEvent(false)}>
                <div style={mb} onClick={e=>e.stopPropagation()}>
                  <div style={{fontWeight:900,fontSize:18,marginBottom:4}}>➕ Elon Qoshish</div>
                  <div style={{marginBottom:10}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>📌 Elon nomi:</label>
                    <input value={eventForm.title} onChange={e=>setEventForm(p=>({...p,title:e.target.value}))} placeholder="Kinoga birga boramiz!" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"10px 12px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontWeight:600}}/>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6,fontWeight:600}}>Turi:</label>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["🎬 Kino","🍽️ Ovqatlanish","🌳 Parkka","🚗 Avtomobilda sayr","💪 GYM zal","🛍️ Shoping","🏊 Suzish"].map(t=>(
                        <button key={t} onClick={()=>setEventForm(p=>({...p,type:t}))} style={{padding:"6px 12px",borderRadius:20,border:"2px solid "+(eventForm.type===t?C.accent:C.border),background:eventForm.type===t?C.accent:"#f0f9ff",color:eventForm.type===t?"#fff":C.text,fontSize:11,fontWeight:eventForm.type===t?700:400,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>Tavsif:</label>
                    <textarea value={eventForm.desc} onChange={e=>setEventForm(p=>({...p,desc:e.target.value}))} placeholder="Batafsil..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",minHeight:70,resize:"none",fontFamily:"inherit"}}/>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>📍 Joylashuv:</label>
                    <input value={eventForm.location} onChange={e=>setEventForm(p=>({...p,location:e.target.value}))} placeholder="Toshkent, Safo restoran" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>📅 Sana:</label><input value={eventForm.date} onChange={e=>setEventForm(p=>({...p,date:e.target.value}))} placeholder="Bugun" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/></div>
                    <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>🕐 Vaqt:</label><input value={eventForm.time} onChange={e=>setEventForm(p=>({...p,time:e.target.value}))} placeholder="19:00" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/></div>
                  </div>

                  {/* SHOSHILINCH GO TOGGLE */}
                  <div onClick={()=>setEventForm(p=>({...p,urgent:!p.urgent}))} style={{
                    display:"flex",alignItems:"center",gap:12,
                    padding:"12px 14px",marginBottom:10,
                    borderRadius:14,cursor:"pointer",
                    background:eventForm.urgent?"linear-gradient(135deg,#fff7ed,#fef2f2)":"#f8fafc",
                    border:"1.5px solid "+(eventForm.urgent?"#f97316":C.border),
                    transition:"all 0.2s"
                  }}>
                    <div style={{fontSize:22}}>🚨</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:eventForm.urgent?"#ea580c":C.text}}>Shoshilinch GO</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:1}}>1 soat ichida jo'nash — tezkor hamroh topish</div>
                    </div>
                    <div style={{
                      width:44,height:24,borderRadius:12,
                      background:eventForm.urgent?"#f97316":"#e2e8f0",
                      position:"relative",transition:"background 0.3s",flexShrink:0
                    }}>
                      <div style={{
                        position:"absolute",top:2,
                        left:eventForm.urgent?22:2,
                        width:20,height:20,borderRadius:"50%",
                        background:"#fff",boxShadow:"0 2px 4px rgba(0,0,0,0.2)",
                        transition:"left 0.3s"
                      }}/>
                    </div>
                  </div>
                  {/* KIM KORSIN */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:8,fontWeight:700}}>👁️ Bu e'lonni kimlar ko'rsin?</label>
                    <div style={{display:"flex",gap:8}}>
                      {[
                        {v:"barchasi", icon:"🌐", label:"Barchasi"},
                        {v:"ayollar",  icon:"👩", label:"Ayollar"},
                        {v:"erkaklar", icon:"👨", label:"Erkaklar"},
                      ].map(opt=>(
                        <button key={opt.v} onClick={()=>setEventForm(p=>({...p,audience:opt.v}))} style={{
                          flex:1,padding:"9px 4px",borderRadius:12,border:"2px solid",
                          borderColor:eventForm.audience===opt.v?C.accent:C.border,
                          background:eventForm.audience===opt.v?"linear-gradient(135deg,#fff0f6,#e0f2fe)":"#f8fafc",
                          color:eventForm.audience===opt.v?C.accent:C.text,
                          fontWeight:eventForm.audience===opt.v?800:500,
                          fontSize:12,cursor:"pointer"
                        }}>
                          <div style={{fontSize:18,marginBottom:2}}>{opt.icon}</div>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"9px 12px",marginBottom:12,fontSize:11,color:"#dc2626"}}>Taqiqlangan: dacha, tog, uy, mehmonxona takliflari ochiriladi</div>
                  <button onClick={()=>{
                    if(!eventForm.title.trim()){toast$("Elon nomini kiriting!","#ef4444");return;}
                    if(!eventForm.desc.trim()){toast$("Tavsif yozing!","#ef4444");return;}
                    if(BANNED.some(w=>eventForm.desc.toLowerCase().includes(w)||eventForm.title.toLowerCase().includes(w))){toast$("Bu elon taqiqlangan!","#ef4444");return;}
                    const {hasBad:hb}=filterBadWords(eventForm.title+" "+eventForm.desc);
                    if(hb){toast$("⚠️ Haqoratli so'z!","#ef4444");return;}
                    const now2=Date.now();
                    if(lastInviteTime&&(now2-lastInviteTime)<24*60*60*1000){toast$("⏳ 24 soat kutish kerak!","#ef4444");return;}
                    const newEv={id:now2,userId:myUserId||"me",name:profile?.name||"Men",demoPhoto:profilePhoto||null,type:eventForm.type,text:eventForm.title+(eventForm.desc?" — "+eventForm.desc:""),city:eventForm.location||profile?.city||"Toshkent",time:eventForm.time||"—",date:eventForm.date||"—",audience:eventForm.audience,likes:0,mine:true,urgent:eventForm.urgent||false};
                    setGoInvites(p=>[newEv,...p]);
                    // Supabase ga saqlash
                    if(sb && myUserId) {
                      sb.from('go_invites').insert({
                        user_id:myUserId, user_name:profile?.name||'Men', user_photo:profilePhoto||null,
                        type:eventForm.type, title:eventForm.title, description:eventForm.desc,
                        city:eventForm.location||profile?.city||'Toshkent',
                        event_date:eventForm.date, event_time:eventForm.time,
                        audience:eventForm.audience,
                        max_people:eventForm.maxPeople?parseInt(eventForm.maxPeople):null
                      }).catch(()=>{});
                    }
                    setLastInviteTime(now2);
                    setShowCreateEvent(false);
                    setEventForm({title:"",type:"🎬 Kino",desc:"",date:"",time:"",location:"",audience:"barchasi",maxPeople:""});
                    toast$("Elon joylashtirildi!",C.green);
                  }} style={bigBtn("linear-gradient(90deg,#6366f1,#8b5cf6)")}>➕ Elon Qoshish</button>
                  <button onClick={()=>setShowCreateEvent(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Bekor qilish</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN MENU TAB */}
        {tab==="menu"&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:18,fontWeight:900,marginBottom:14}}>☰ Asosiy menyu</div>
            <div onClick={()=>setTab("profile")} style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:18,padding:16,marginBottom:14,border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
              <div style={{width:56,height:56,borderRadius:"50%",overflow:"hidden",border:"3px solid "+C.accent,background:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:30}}>{profile?.gender==="ayol"?"👩":"👨"}</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:16,color:C.accent}}>{profile?.name||"Profilni toldiryng"}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{profile?.city||"Shahar belgilanmagan"}</div>
                {vip&&<div style={{fontSize:11,color:C.gold,fontWeight:700,marginTop:2}}>👑 VIP azo</div>}
              </div>
              <span style={{color:C.muted,fontSize:20}}>›</span>
            </div>
            <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:8,paddingLeft:4}}>BOLIMLAR</div>
            {[
              {icon:"🎁",label:"Do'stlarni taklif qil — Mukofot ol!",sub:"Har taklif uchun +20 🪙, faol do'st uchun +100 🪙",color:"#22c55e",action:()=>setShowReferral(true),highlight:true},
              {icon:"🎁",label:"Sovgalar",sub:"Do'stlarga sovga yuboring",color:"#ec4899",action:()=>setTab("shop")},
              {icon:"👑",label:"VIP azolik",sub:"Cheksiz imkoniyatlar",color:"#f59e0b",action:()=>setTab("shop")},
              {icon:"🏆",label:"Top foydalanuvchilar",sub:"Eng ko'p sovga va yoqtirish olganlar",color:"#ef4444",action:()=>setShowTopList(true)},
              {icon:"📊",label:"Statistika",sub:"Dastur va shaxsiy statistikangiz",color:"#6366f1",action:()=>setShowStats(true)},
            ].map((item,i)=>(
              <div key={i} onClick={item.action} style={{background:item.highlight?"linear-gradient(135deg,#f0fdf4,#e0f2fe)":item.highlight2?"linear-gradient(135deg,#f0f9ff,#e0f2fe)":"#fff",borderRadius:16,padding:"13px 16px",marginBottom:8,border:"1px solid "+(item.highlight?C.green:item.highlight2?C.sky:C.border),display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
                <div style={{width:46,height:46,borderRadius:13,background:item.color+"22",border:"1px solid "+item.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:(item.highlight||item.highlight2)?800:700,fontSize:14,color:item.highlight?C.green:item.highlight2?C.sky:C.text}}>{item.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.sub}</div>
                </div>
                <span style={{color:C.muted,fontSize:18}}>›</span>
              </div>
            ))}
            <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:8,paddingLeft:4,marginTop:14}}>SOZLAMALAR</div>
            {[
              {icon:"⚙️",label:"Sozlamalar",sub:"Til, bildirishnoma",color:C.muted,action:()=>setShowLangModal(true)},
              {icon:"🎧",label:"Qollab-quvvatlash",sub:"Yordam va savollar",color:C.sky,action:()=>toast$("Operatorga ulanmoqda...",C.sky)},
              {icon:"💡",label:"Taklif va shikoyatlar",sub:"Fikr va takliflaringizni yuboring",color:C.green,action:()=>toast$("Rahmat!",C.green)},
              {icon:"📋",label:"Foydalanish shartlari",sub:"Qoidalar va maxfiylik",color:C.muted,action:()=>toast$("Tez orada!",C.muted)},
              {icon:"⭐",label:"Ilovani baholash",sub:"App Store da baho bering",color:C.gold,action:()=>toast$("Rahmat! 💕",C.gold)},
              {icon:"🔐",label:"Admin Panel",sub:"Faqat administrator uchun",color:"#7c3aed",action:()=>setShowAdminPanel(true)},
            ].map((item,i)=>(
              <div key={i} onClick={item.action} style={{background:"#fff",borderRadius:16,padding:"13px 16px",marginBottom:8,border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
                <div style={{width:46,height:46,borderRadius:13,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:C.text}}>{item.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.sub}</div>
                </div>
                <span style={{color:C.muted,fontSize:18}}>›</span>
              </div>
            ))}
            <div style={{padding:"16px 0",textAlign:"center",fontSize:11,color:C.muted}}>Love Hub v1.0 · Barcha huquqlar himoyalangan 💕</div>
          </div>
        )}

        {/* TOP LIST SAHIFASI */}
        {showTopList&&(
          <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
            {/* Header */}
            <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f172a)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <button onClick={()=>setShowTopList(false)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
              <div style={{flex:1}}>
                <div style={{color:"#fbbf24",fontWeight:900,fontSize:18}}>🏆 Top Foydalanuvchilar</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:1}}>Eng ko'p sovga va yoqtirish olganlar</div>
              </div>
            </div>

            {/* Gender tabs */}
            <div style={{display:"flex",background:"#fff",borderBottom:"2px solid "+C.border,flexShrink:0}}>
              {[{k:"ayol",icon:"👩",label:"Ayollar",col:"#ec4899"},{k:"erkak",icon:"👨",label:"Erkaklar",col:"#3b82f6"}].map(t=>(
                <button key={t.k} onClick={()=>setTopListTab(t.k)} style={{
                  flex:1,padding:"13px 0",background:"none",border:"none",
                  borderBottom:topListTab===t.k?"3px solid "+t.col:"3px solid transparent",
                  cursor:"pointer",fontSize:14,fontWeight:topListTab===t.k?800:400,
                  color:topListTab===t.k?t.col:C.muted,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6
                }}>
                  <span style={{fontSize:20}}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"14px 14px"}}>
              {(()=>{
                // Hisoblash: score = gifts*3 + likes
                const genderUsers = USERS
                  .filter(u=>u.gender===topListTab)
                  .map(u=>({...u, score:(u.gifts||0)*3+(u.likes||0)}))
                  .sort((a,b)=>b.score-a.score);

                // Top 10 global (ikkala jins ichida)
                const allSorted = USERS
                  .map(u=>({...u,score:(u.gifts||0)*3+(u.likes||0)}))
                  .sort((a,b)=>b.score-a.score);
                const getGlobalRank = (id) => allSorted.findIndex(u=>u.id===id)+1;

                const isTop10 = (id) => getGlobalRank(id)<=10;

                return genderUsers.map((user, idx)=>{
                  const rank = idx+1; // bu jins ichidagi o'rin
                  const globalRank = getGlobalRank(user.id);
                  const isTop = isTop10(user.id);
                  const isNew = (user.gifts||0)<=0 && (user.likes||0)<5;
                  const isSuperTop = (user.gifts||0)>5 && (user.likes||0)>20;

                  // Rank medal
                  const medal = rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":null;
                  const rankColor = rank===1?"#f59e0b":rank===2?"#94a3b8":rank===3?"#cd7c2f":C.muted;

                  // Card bg
                  const cardBg = rank===1
                    ?"linear-gradient(135deg,#fefce8,#fef3c7)"
                    :rank===2
                    ?"linear-gradient(135deg,#f8fafc,#f1f5f9)"
                    :rank===3
                    ?"linear-gradient(135deg,#fff7ed,#ffedd5)"
                    :"#fff";
                  const cardBorder = rank===1?"#fbbf24":rank===2?"#94a3b8":rank===3?"#fb923c":C.border;

                  const tabColor = topListTab==="ayol"?"#ec4899":"#3b82f6";

                  return (
                    <div key={user.id} onClick={()=>{setShowUserDetail(user);setDetailPhotoIdx(0);}} style={{
                      background:cardBg,
                      borderRadius:18,
                      padding:"12px 14px",
                      marginBottom:10,
                      border:"2px solid "+cardBorder,
                      display:"flex",alignItems:"center",gap:12,
                      cursor:"pointer",
                      boxShadow:rank<=3?"0 4px 16px "+rankColor+"33":"0 2px 8px rgba(56,189,248,0.06)",
                      animation:`slideUp 0.25s ease ${idx*0.05}s both`,
                      position:"relative",overflow:"hidden"
                    }}>
                      {/* Rank shimmer for top 3 */}
                      {rank<=3&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${rankColor},${rankColor}44,transparent)`}}/>}

                      {/* RANK RAQAMI */}
                      <div style={{
                        width:36,height:36,borderRadius:10,flexShrink:0,
                        background:rank<=3?rankColor+"22":"#f0f9ff",
                        border:"1.5px solid "+rankColor+"55",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:900,fontSize:rank<=3?20:14,
                        color:rankColor
                      }}>
                        {medal||rank}
                      </div>

                      {/* RASM */}
                      <div style={{position:"relative",flexShrink:0}}>
                        <div style={{
                          width:52,height:52,borderRadius:"50%",overflow:"hidden",
                          border:"2.5px solid "+(isTop?C.gold:tabColor),
                          boxShadow:isTop?"0 0 12px rgba(245,158,11,0.5)":"none"
                        }}>
                          {user.demoPhoto
                            ?<img src={user.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            :<span style={{fontSize:28}}>{user.emoji}</span>
                          }
                        </div>
                        {/* Online dot */}
                        {user.online&&<div style={{position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:C.green,border:"2px solid #fff"}}/>}
                        {/* VIP */}
                        {user.vip&&<div style={{position:"absolute",top:-3,left:-3,fontSize:12,background:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>👑</div>}
                      </div>

                      {/* MA'LUMOTLAR */}
                      <div style={{flex:1,minWidth:0}}>
                        {/* Ism + TOP 10 💎 */}
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontWeight:900,fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
                          {isTop&&<span style={{fontSize:16}}>💎</span>}
                        </div>

                        {/* Kasb + Shahar */}
                        <div style={{fontSize:11,color:C.muted,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.kasb} · 📍{user.city}</div>

                        {/* Status badge */}
                        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                          {isNew?(
                            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,color:"#16a34a",display:"inline-flex",alignItems:"center",gap:3}}>
                              🌱 Yangi foydalanuvchi
                            </div>
                          ):isSuperTop?(
                            <div style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)",border:"1px solid #fbbf24",borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,color:"#92400e",display:"inline-flex",alignItems:"center",gap:3}}>
                              🏆 TOP {globalRank}-o'rin
                            </div>
                          ):(
                            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,color:"#1d4ed8",display:"inline-flex",alignItems:"center",gap:3}}>
                              📈 Faol
                            </div>
                          )}
                        </div>
                      </div>

                      {/* STATISTIKA */}
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
                            <span style={{fontSize:12}}>🎁</span>
                            <span style={{fontWeight:800,fontSize:13,color:C.accent}}>{user.gifts||0}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
                            <span style={{fontSize:12}}>❤️</span>
                            <span style={{fontWeight:800,fontSize:13,color:"#ef4444"}}>{user.likes||0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Izoh */}
              <div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"12px 16px",marginTop:4,border:"1px solid "+C.border}}>
                <div style={{fontSize:12,color:C.text,fontWeight:700,marginBottom:6}}>📊 Reytinq haqida</div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:6}}><span>🌱</span> Yangi foydalanuvchi — sovga va yoqtirish yoq</div>
                  <div style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:6}}><span>🏆</span> TOP — 5+ sovga va 20+ yoqtirish olgan</div>
                  <div style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:6}}><span>💎</span> Global TOP 10 da turadi</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATISTIKA SAHIFASI */}
        {showStats&&(
          <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>

            {/* Header */}
            <div style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <button onClick={()=>setShowStats(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontWeight:900,fontSize:18}}>📊 Statistika</div>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,marginTop:1}}>Dastur va shaxsiy ma'lumotlar</div>
              </div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"14px 14px 30px"}}>

              {(()=>{
                // ===== DASTUR STATISTIKASI (demo) =====
                const APP_STATS = {
                  total:   {all:48320, ayol:27840, erkak:20480},
                  year:    {all:18650, ayol:10720, erkak:7930},
                  half:    {all:9240,  ayol:5310,  erkak:3930},
                  month:   {all:2180,  ayol:1250,  erkak:930},
                  day:     {all:347,   ayol:199,   erkak:148},
                };

                // ===== SHAXSIY STATISTIKA =====
                const joinDate = profile ? "2024-11-15" : null;
                const joinFormatted = joinDate ? new Date(joinDate).toLocaleDateString("uz-UZ",{year:"numeric",month:"long",day:"numeric"}) : "—";
                const daysSince = joinDate ? Math.floor((Date.now()-new Date(joinDate))/86400000) : 0;
                const myFriends = matchUsers.length;
                const myLikedMe = liked.length + 3; // demo
                const myChats = Object.keys(msgs).filter(k=>msgs[k]?.length>0).length;

                const StatCard = ({icon,label,val,sub,color="#6366f1",big=false})=>(
                  <div style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(99,102,241,0.06)"}}>
                    <div style={{width:44,height:44,borderRadius:13,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:C.muted,fontWeight:600}}>{label}</div>
                      <div style={{fontSize:big?26:20,fontWeight:900,color,lineHeight:1.2}}>{typeof val==="number"?val.toLocaleString():val}</div>
                      {sub&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>{sub}</div>}
                    </div>
                  </div>
                );

                const GenderBar = ({label,all,ayol,erkak,color})=>{
                  const aPct = all>0?Math.round(ayol/all*100):0;
                  const ePct = 100-aPct;
                  return (
                    <div style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:"1px solid "+C.border,marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontWeight:700,fontSize:13,color:C.text}}>{label}</div>
                        <div style={{fontWeight:900,fontSize:15,color}}>{all.toLocaleString()}</div>
                      </div>
                      {/* Progress bar */}
                      <div style={{height:8,borderRadius:4,overflow:"hidden",display:"flex",marginBottom:6}}>
                        <div style={{width:aPct+"%",background:"#ec4899",transition:"width 0.5s"}}/>
                        <div style={{width:ePct+"%",background:"#3b82f6",transition:"width 0.5s"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#ec4899"}}/>
                          <span style={{fontSize:11,color:C.muted}}>👩 Ayol: <b style={{color:"#ec4899"}}>{ayol.toLocaleString()}</b> ({aPct}%)</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#3b82f6"}}/>
                          <span style={{fontSize:11,color:C.muted}}>👨 Erkak: <b style={{color:"#3b82f6"}}>{erkak.toLocaleString()}</b> ({ePct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {/* === DASTUR STATISTIKASI === */}
                    <div style={{fontWeight:900,fontSize:16,color:C.text,marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:20}}>🌐</span> Dastur statistikasi
                    </div>

                    {/* Jami */}
                    <div style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:20,padding:"18px 20px",marginBottom:10,position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.08}}>👥</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:600,marginBottom:4}}>Jami ro'yxatdan o'tganlar</div>
                      <div style={{fontSize:44,fontWeight:900,color:"#fff",lineHeight:1}}>{APP_STATS.total.all.toLocaleString()}</div>
                      <div style={{display:"flex",gap:16,marginTop:10}}>
                        <div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>👩 Ayollar</div>
                          <div style={{fontSize:18,fontWeight:800,color:"#fce7f3"}}>{APP_STATS.total.ayol.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>👨 Erkaklar</div>
                          <div style={{fontSize:18,fontWeight:800,color:"#dbeafe"}}>{APP_STATS.total.erkak.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Vaqt bo'yicha */}
                    <GenderBar label="📅 So'nggi 1 yil" all={APP_STATS.year.all} ayol={APP_STATS.year.ayol} erkak={APP_STATS.year.erkak} color="#6366f1"/>
                    <GenderBar label="📅 So'nggi 6 oy" all={APP_STATS.half.all} ayol={APP_STATS.half.ayol} erkak={APP_STATS.half.erkak} color="#8b5cf6"/>
                    <GenderBar label="📅 So'nggi 1 oy" all={APP_STATS.month.all} ayol={APP_STATS.month.ayol} erkak={APP_STATS.month.erkak} color="#a855f7"/>

                    {/* Bugungi */}
                    <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:16,padding:"14px 16px",border:"1px solid #86efac",marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontWeight:700,fontSize:13,color:C.text}}>🕐 Bugun qo'shilganlar</div>
                        <div style={{fontWeight:900,fontSize:18,color:"#16a34a"}}>{APP_STATS.day.all}</div>
                      </div>
                      <div style={{display:"flex",gap:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:16}}>👩</span>
                          <span style={{fontSize:13,fontWeight:800,color:"#ec4899"}}>{APP_STATS.day.ayol}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:16}}>👨</span>
                          <span style={{fontSize:13,fontWeight:800,color:"#3b82f6"}}>{APP_STATS.day.erkak}</span>
                        </div>
                        <div style={{fontSize:10,color:C.muted,alignSelf:"center",marginLeft:"auto"}}>Yangilanadi: har soatda</div>
                      </div>
                    </div>

                    {/* === SHAXSIY STATISTIKA === */}
                    <div style={{fontWeight:900,fontSize:16,color:C.text,marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:20}}>👤</span> Mening statistikam
                    </div>

                    {!profile?(
                      <div style={{background:"#fff",borderRadius:16,padding:"20px",textAlign:"center",border:"1px solid "+C.border,marginBottom:8}}>
                        <div style={{fontSize:40,marginBottom:8}}>👤</div>
                        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Profil to'ldirilmagan</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Shaxsiy statistikani ko'rish uchun profilingizni to'ldiring</div>
                        <button onClick={()=>{setShowStats(false);setTab("profile");}} style={{background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Profilni to'ldirish →</button>
                      </div>
                    ):(
                      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
                        {/* Ro'yxatdan o'tgan sana */}
                        <div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:16,padding:"14px 16px",border:"1px solid #fbcfe8",display:"flex",alignItems:"center",gap:12}}>
                          <div style={{width:44,height:44,borderRadius:13,background:"#ff6eb422",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📅</div>
                          <div>
                            <div style={{fontSize:11,color:C.muted,fontWeight:600}}>Ro'yxatdan o'tgan sana</div>
                            <div style={{fontSize:15,fontWeight:900,color:C.accent}}>15 Noyabr 2024</div>
                            <div style={{fontSize:10,color:C.muted,marginTop:1}}>{daysSince} kun oldin</div>
                          </div>
                        </div>

                        {/* Qo'shimcha */}
                        <div style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:"1px solid "+C.border}}>
                          <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:10}}>📈 Batafsil</div>
                          {[
                            {icon:"🎁",label:"Yuborgan sovgalarim",val:liked.length*2+"ta"},
                            {icon:"⭐",label:"Yoqtirglarim",val:liked.length+"ta"},
                            {icon:"🔥",label:"Faollik davri",val:daysSince+" kun"},
                            {icon:"📸",label:"Joylashgan rasmlar",val:(profilePhoto?1:0)+myPhotos.length+"ta"},
                          ].map((r,i,arr)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?"1px solid "+C.border:"none"}}>
                              <span style={{fontSize:18,width:24}}>{r.icon}</span>
                              <span style={{flex:1,fontSize:12,color:C.muted}}>{r.label}</span>
                              <span style={{fontWeight:700,fontSize:13,color:C.text}}>{r.val}</span>
                            </div>
                          ))}
                          {/* TELEGRAM ID */}
                          {(()=>{
                            const tg = getTgUser();
                            const tgId = tg?.id || profile?.tgUserId;
                            if(!tgId) return null;
                            return (
                              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid "+C.border,marginTop:4}}>
                                <span style={{fontSize:18,width:24}}>🔒</span>
                                <span style={{flex:1,fontSize:12,color:C.muted}}>Sizning ID</span>
                                <span style={{fontWeight:800,fontSize:13,color:C.text,letterSpacing:1}}>{tgId}</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* === FAOLIYAT STATISTIKASI === */}
                        <div style={{fontWeight:900,fontSize:15,color:C.text,marginTop:8,marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:18}}>🔔</span> Faoliyat tarixi
                        </div>

                        {/* Kichik kartalar */}
                        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                          {[
                            {icon:"❤️",label:"Sizni yoqtirganlar",count:7,color:"#ff6eb4",tab:"likes"},
                            {icon:"👁️",label:"Profilingizni ko'rib chiqdi",count:24,color:"#38bdf8",tab:"views"},
                            {icon:"🎁",label:"Sizga sovga berganlar",count:3,color:"#f59e0b",tab:"gifts"},
                            {icon:"🚫",label:"Sizni blokladilar",count:0,color:"#ef4444",tab:"blocks"},
                            {icon:"💬",label:"Chatlar",count:Object.keys(msgs).filter(k=>msgs[k]?.length>0).length,color:"#8b5cf6",tab:"chats"},
                          ].map(s=>(
                            <div key={s.tab} onClick={()=>setActivityTab(s.tab)} style={{
                              background:activityTab===s.tab?s.color+"11":"#fff",
                              borderRadius:14,padding:"10px 14px",
                              border:"1.5px solid "+(activityTab===s.tab?s.color:C.border),
                              cursor:"pointer",display:"flex",alignItems:"center",gap:12
                            }}>
                              <div style={{fontSize:20,flexShrink:0}}>{s.icon}</div>
                              <div style={{flex:1,fontSize:13,fontWeight:600,color:C.text}}>{s.label}</div>
                              <div style={{background:s.color,borderRadius:20,padding:"2px 10px",fontSize:13,fontWeight:900,color:"#fff",flexShrink:0}}>{s.count}</div>
                            </div>
                          ))}
                        </div>

                        {/* Davr filtri */}
                        <div style={{display:"flex",gap:6,marginBottom:12,background:"#f1f5f9",borderRadius:16,padding:4}}>
                          {[{k:"1d",l:"Bugun"},{k:"7d",l:"7 kun"},{k:"30d",l:"30 kun"},{k:"all",l:"Barchasi"}].map(p=>(
                            <button key={p.k} onClick={()=>setActivityPeriod(p.k)} style={{
                              flex:1,padding:"7px 4px",borderRadius:12,border:"none",
                              background:activityPeriod===p.k?"#fff":"transparent",
                              color:activityPeriod===p.k?C.accent:C.muted,
                              fontWeight:700,fontSize:11,cursor:"pointer",
                              boxShadow:activityPeriod===p.k?"0 2px 8px rgba(0,0,0,0.08)":"none"
                            }}>{p.l}</button>
                          ))}
                        </div>

                        {/* Natijalar ro'yxati */}
                        {(()=>{
                          const now = Date.now();
                          const cutoffs = {"1d":86400000,"7d":7*86400000,"30d":30*86400000,"all":9999*86400000};
                          const cutoff = now - cutoffs[activityPeriod];

                          const demoActivity = {
                            likes: [
                              {user:USERS[0], time: new Date(now-1800000).toISOString()},
                              {user:USERS[2], time: new Date(now-7200000).toISOString()},
                              {user:USERS[4], time: new Date(now-86400000).toISOString()},
                              {user:USERS[1], time: new Date(now-3*86400000).toISOString()},
                              {user:USERS[3], time: new Date(now-5*86400000).toISOString()},
                              {user:USERS[6], time: new Date(now-8*86400000).toISOString()},
                              {user:USERS[5], time: new Date(now-15*86400000).toISOString()},
                            ],
                            views: [
                              {user:USERS[1], count:5, time: new Date(now-900000).toISOString()},
                              {user:USERS[3], count:3, time: new Date(now-3600000).toISOString()},
                              {user:USERS[0], count:8, time: new Date(now-10800000).toISOString()},
                              {user:USERS[5], count:2, time: new Date(now-86400000).toISOString()},
                              {user:USERS[2], count:4, time: new Date(now-2*86400000).toISOString()},
                              {user:USERS[7], count:1, time: new Date(now-4*86400000).toISOString()},
                              {user:USERS[6], count:6, time: new Date(now-10*86400000).toISOString()},
                            ],
                            gifts: [
                              {user:USERS[0], emoji:"🌹", name:"Atirgul", time: new Date(now-3600000).toISOString()},
                              {user:USERS[4], emoji:"🎁", name:"Sovg'a", time: new Date(now-2*86400000).toISOString()},
                              {user:USERS[2], emoji:"💍", name:"Uzuk", time: new Date(now-12*86400000).toISOString()},
                            ],
                            blocks: [],
                          };

                          const items = (demoActivity[activityTab]||[]).filter(x=> new Date(x.time).getTime() >= cutoff);

                          if(items.length===0) return (
                            <div style={{textAlign:"center",padding:"24px",background:"#fff",borderRadius:16,border:"1px solid "+C.border}}>
                              <div style={{fontSize:36,marginBottom:8}}>
                                {activityTab==="likes"?"💔":activityTab==="views"?"👁️":activityTab==="gifts"?"🎁":"🚫"}
                              </div>
                              <div style={{fontSize:13,color:C.muted}}>
                                {activityPeriod==="1d"?"Bugun hali faoliyat yo'q":
                                 activityPeriod==="7d"?"Oxirgi 7 kunda yo'q":
                                 activityPeriod==="30d"?"Oxirgi 30 kunda yo'q":"Hali faoliyat yo'q"}
                              </div>
                            </div>
                          );

                          return (
                            <div style={{display:"flex",flexDirection:"column",gap:8}}>
                              {items.map((item,i)=>{
                                const u = item.user;
                                const t = new Date(item.time);
                                const diff = Date.now() - t.getTime();
                                const timeStr = diff < 3600000 ? Math.floor(diff/60000)+" daqiqa oldin" :
                                                diff < 86400000 ? Math.floor(diff/3600000)+" soat oldin" :
                                                Math.floor(diff/86400000)+" kun oldin";
                                return (
                                  <div key={i} onClick={()=>{setShowStats(false);setShowUserDetail(u);setDetailPhotoIdx(0);}} style={{
                                    background:"#fff",borderRadius:16,padding:"12px 14px",
                                    border:"1px solid "+C.border,
                                    display:"flex",alignItems:"center",gap:12,cursor:"pointer",
                                    boxShadow:"0 2px 8px rgba(0,0,0,0.04)"
                                  }}>
                                    <div style={{position:"relative",flexShrink:0}}>
                                      <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",border:"2px solid "+C.border}}>
                                        {u.demoPhoto?<img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
                                          <div style={{width:"100%",height:"100%",background:C.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{u.emoji}</div>}
                                      </div>
                                      {u.online&&<div style={{position:"absolute",bottom:0,right:0,width:14,height:14,borderRadius:"50%",background:"#22c55e",border:"2px solid #fff"}}/>}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontWeight:800,fontSize:14,color:C.text}}>{u.name.split(" ")[0]}</div>
                                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{u.age} yosh · {u.city}</div>
                                      <div style={{fontSize:10,color:C.muted,marginTop:1}}>🕐 {timeStr}</div>
                                    </div>
                                    <div style={{flexShrink:0,textAlign:"center"}}>
                                      {activityTab==="likes"&&<div style={{fontSize:24}}>❤️</div>}
                                      {activityTab==="views"&&(
                                        <div style={{background:"#e0f2fe",borderRadius:12,padding:"4px 8px"}}>
                                          <div style={{fontSize:16,fontWeight:900,color:"#0284c7"}}>{item.count}x</div>
                                          <div style={{fontSize:9,color:"#0284c7"}}>ko'rdi</div>
                                        </div>
                                      )}
                                      {activityTab==="gifts"&&<div style={{fontSize:28}}>{item.emoji}</div>}
                                      {activityTab==="blocks"&&<div style={{fontSize:22}}>🚫</div>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div style={{background:"#f8fafc",borderRadius:12,padding:"10px 14px",marginTop:4,border:"1px solid "+C.border}}>
                      <div style={{fontSize:10,color:C.muted,textAlign:"center"}}>📊 Statistika har kuni yangilanib boradi · Love Hub v1.0</div>
                    </div>

                    {/* TELEGRAM ID — faqat o'zida ko'rinadi */}
                    {(()=>{
                      const tg = getTgUser();
                      const tgId = tg?.id || form?.tgUserId || profile?.tgUserId;
                      if(!tgId) return null;
                      return (
                        <div style={{
                          marginTop:8,
                          background:"#f8fafc",
                          borderRadius:12,
                          padding:"10px 14px",
                          border:"1px solid "+C.border,
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"space-between"
                        }}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:14}}>🔒</span>
                            <div>
                              <div style={{fontSize:10,color:C.muted,fontWeight:600}}>Sizning Telegram ID raqamingiz</div>
                              <div style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:1}}>{tgId}</div>
                            </div>
                          </div>
                          <div style={{fontSize:10,color:C.muted,textAlign:"right"}}>
                            Faqat<br/>siz ko'rasiz
                          </div>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* SHOP */}
        {tab==="shop"&&(
          <div style={{padding:"12px 14px"}}>
            <div onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:16,padding:"12px 16px",marginBottom:14,border:"1px solid rgba(255,110,180,0.3)",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,110,180,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🚀</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:13,color:"#ff6eb4"}}>Sinov rejimi • Beta</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>Mukofotlar tez orada real bo'ladi!</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}}/>
            </div>
            {/* Coins */}
            <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:20,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:6,fontWeight:600}}>💰 Mening tangalarim</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:38}}>🪙</span>
                <span style={{fontSize:42,fontWeight:900,color:"#fbbf24"}}>{coins}</span>
                <span style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginTop:8}}>tanga</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowBuyCoins(true)} style={{flex:1,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",border:"none",borderRadius:12,padding:"10px",color:"#1e293b",fontWeight:800,fontSize:13,cursor:"pointer"}}>+ To'ldirish</button>
                <button onClick={()=>setShowRedeem(true)} style={{flex:1,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:"10px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>🎁 Almashtirish</button>
              </div>
            </div>
            {/* Gift Shop */}
            <div onClick={()=>setShowGiftShop(true)} style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:20,padding:18,marginBottom:14,border:"2px solid #fbcfe8",cursor:"pointer"}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:600}}>🎁 Sovga do'koni</div>
              <div style={{fontWeight:900,fontSize:18,color:C.text,marginBottom:12}}>Do'stlarga sovga yuboring!</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:4}}>
                  {["⌚","👔","🎮","💐","💍","🌹","🎀","🧸"].map((e,i)=><span key={i} style={{fontSize:20}}>{e}</span>)}
                </div>
                <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",borderRadius:12,padding:"8px 14px",color:"#fff",fontWeight:800,fontSize:13}}>Ko'rish ›</div>
              </div>
            </div>
            {/* Gift Shop Modal */}
            {showGiftShop&&(
              <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
                <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  <button onClick={()=>setShowGiftShop(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
                  <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>🎁 Sovga do'koni</div>
                </div>
                <div style={{display:"flex",borderBottom:"1px solid "+C.border,background:"#fff",flexShrink:0}}>
                  {[{k:"erkak",l:"👨 Erkaklar"},{k:"ayol",l:"👩 Ayollar"}].map(t=>(
                    <button key={t.k} onClick={()=>setGiftShopTab(t.k)} style={{flex:1,padding:"12px 0",background:"none",border:"none",borderBottom:giftShopTab===t.k?"3px solid "+(t.k==="erkak"?"#3b82f6":C.accent):"3px solid transparent",cursor:"pointer",fontSize:13,fontWeight:giftShopTab===t.k?800:400,color:giftShopTab===t.k?(t.k==="erkak"?"#3b82f6":C.accent):C.muted}}>{t.l}</button>
                  ))}
                </div>
                <div style={{flex:1,overflowY:"auto",padding:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                    {(giftShopTab==="erkak"
                      ?[{e:"⌚",n:"Soat",p:30},{e:"👔",n:"Ko'ylak",p:20},{e:"🎮",n:"Gamepad",p:45},{e:"👟",n:"Krossovka",p:60},{e:"🧢",n:"Kepka",p:15},{e:"📱",n:"Gadjet",p:80}]
                      :[{e:"💐",n:"Guldasta",p:15},{e:"💍",n:"Uzuk",p:80},{e:"🌹",n:"Atirgul",p:12},{e:"🎀",n:"Lenta",p:8},{e:"🧸",n:"Ayiqcha",p:25},{e:"🍫",n:"Shokolad",p:10}]
                    ).map((g,i)=>(
                      <div key={i} style={{background:giftShopTab==="erkak"?"linear-gradient(135deg,#eff6ff,#dbeafe)":"linear-gradient(135deg,#fff0f6,#fce7f3)",borderRadius:16,padding:12,textAlign:"center",cursor:"pointer",border:"1px solid "+(giftShopTab==="erkak"?"#bfdbfe":"#fbcfe8")}}>
                        <div style={{fontSize:36,marginBottom:6}}>{g.e}</div>
                        <div style={{fontSize:12,fontWeight:800,color:giftShopTab==="erkak"?"#1d4ed8":"#be185d",marginBottom:3}}>{g.n}</div>
                        <div style={{fontSize:12,fontWeight:700,color:giftShopTab==="erkak"?"#3b82f6":C.accent,marginBottom:8}}>🪙 {g.p}</div>
                        <button onClick={()=>toast$("🎁 "+g.n+" yuborildi!",giftShopTab==="erkak"?"#3b82f6":C.accent)} style={{width:"100%",background:giftShopTab==="erkak"?"linear-gradient(90deg,#3b82f6,#2563eb)":"linear-gradient(90deg,#ff6eb4,#f472b6)",border:"none",borderRadius:10,padding:"7px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sovga</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* VIP Packages */}
            <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>💎 Azolik paketlari</div>
            <div style={{display:"flex",gap:12,marginBottom:14,overflowX:"auto",paddingBottom:8}}>
              {[
                {icon:"👑",name:"VIP",sub:"1 oylik",price:"9.99$",col:"#f59e0b",features:["✅ 1 oy to'liq kirish","🪙 +100 tanga","👑 VIP nishon"]},
                {icon:"💎",name:"DIAMOND",sub:"15 kunlik",price:"6.99$",col:"#a78bfa",features:["✅ 15 kunlik kirish","🪙 +50 tanga","💎 Diamond nishon"]},
                {icon:"🥈",name:"SILVER",sub:"7 kunlik",price:"5.00$",col:"#94a3b8",features:["✅ 7 kunlik kirish","🪙 +50 tanga","🥈 Silver nishon"]},
              ].map((pkg,i)=>(
                <div key={i} style={{background:"linear-gradient(135deg,#1a1a2e,#0f172a)",borderRadius:20,padding:18,border:"2px solid "+pkg.col+"66",minWidth:240,flexShrink:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:26}}>{pkg.icon}</span>
                    <div><div style={{fontWeight:900,fontSize:18,color:pkg.col}}>{pkg.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{pkg.sub}</div></div>
                  </div>
                  {pkg.features.map((f,fi)=><div key={fi} style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginBottom:4}}>{f}</div>)}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                    <div style={{fontSize:18,fontWeight:900,color:pkg.col}}>{pkg.price}</div>
                    <button onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(90deg,"+pkg.col+","+pkg.col+"cc)",border:"none",borderRadius:12,padding:"9px 16px",color:"#1a1a2e",fontWeight:900,fontSize:13,cursor:"pointer"}}>Tez orada</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Redeem */}
            {showRedeem&&(
              <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
                <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f172a)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  <button onClick={()=>setShowRedeem(false)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
                  <div style={{flex:1,color:"#fbbf24",fontWeight:900,fontSize:18}}>🏆 Mukofotlar do'koni</div>
                  <div style={{background:"rgba(251,191,36,0.2)",borderRadius:20,padding:"5px 12px",color:"#fbbf24",fontWeight:800,fontSize:13}}>🪙 {coins}</div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:14}}>
                  {[
                    {e:"👜",name:"Love Hub sumkasi",price:800,col:"#8b5cf6",desc:"Brendli sumka (~25$)"},
                    {e:"🎫",name:"Konsertga bilet",price:1200,col:"#f59e0b",desc:"Toshkent konsert biletlari"},
                    {e:"👕",name:"Love Hub futbolkasi",price:500,col:"#38bdf8",desc:"Premium futbolka (~15$)"},
                    {e:"💎",name:"Pandora brasleti",price:3000,col:"#ec4899",desc:"Original Pandora (~100$)"},
                  ].map((item,i)=>(
                    <div key={i} style={{background:"#fff",borderRadius:18,padding:16,marginBottom:10,border:"2px solid "+item.col+"33"}}>
                      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
                        <div style={{width:58,height:58,borderRadius:16,background:item.col+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{item.e}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:800,fontSize:15}}>{item.name}</div>
                          <div style={{fontSize:11,color:C.muted,marginTop:3}}>{item.desc}</div>
                          <div style={{fontSize:14,fontWeight:900,color:item.col,marginTop:5}}>🪙 {item.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <button onClick={()=>setShowBetaNotice(true)} style={{width:"100%",background:"linear-gradient(90deg,"+item.col+","+item.col+"cc)",border:"none",borderRadius:12,padding:"10px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>Tez orada →</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab==="profile"&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:10}}>👤 {T.myProfile}</div>
            {profile?(
              <div style={{background:"#fff",borderRadius:20,padding:18,border:"1px solid "+C.border}}>
                <div style={{textAlign:"center",marginBottom:14}}>
                  <div onClick={()=>profilePhotoRef.current.click()} style={{width:90,height:90,borderRadius:"50%",margin:"0 auto 8px",overflow:"hidden",border:"3px solid "+C.accent,cursor:"pointer",background:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:52}}>{profile.gender==="ayol"?"👩":"👨"}</span>}
                  </div>
                  {vip&&<div style={{color:C.gold,fontWeight:800,fontSize:12}}>👑 VIP</div>}
                  <div style={{fontWeight:900,fontSize:20,marginTop:4}}>{profile.name}</div>
                  <Stars r={4.5}/>
                </div>
                {[{icon:"🎂",label:"Yosh",val:profile.age+" yosh"},{icon:"📍",label:"Shahar",val:profile.city||"—"},{icon:"⚧",label:"Jins",val:profile.gender==="ayol"?"Ayol":"Erkak"},{icon:"💼",label:"Kasbi",val:profile.kasb||"—"}].map(r=>(
                  <div key={r.label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border}}>
                    <span style={{fontSize:17,width:22}}>{r.icon}</span>
                    <span style={{fontSize:11,color:C.muted,width:66}}>{r.label}</span>
                    <span style={{fontSize:13,fontWeight:600}}>{r.val}</span>
                  </div>
                ))}
                {profile.bio&&<div style={{marginTop:10,background:"#f8fafc",borderRadius:11,padding:"9px 12px",fontSize:13}}>{profile.bio}</div>}

                {/* KIMNI QIDIRMOQDA */}
                {profile.seeking&&(
                  <div style={{marginTop:12,background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"12px 14px",border:"1px solid #fbcfe8"}}>
                    <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:5}}>🔍 Kimni qidirmoqda</div>
                    <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{profile.seeking}</div>
                  </div>
                )}

                <button onClick={()=>setProfile(null)} style={bigBtn("linear-gradient(90deg,#ff6eb4,#38bdf8)")}>Tahrirlash</button>
              </div>
            ):(
              <div style={{background:"#fff",borderRadius:20,padding:16,border:"1px solid "+C.border}}>
                <div style={{textAlign:"center",marginBottom:16}}>
                  {/* ASOSIY RASM */}
                  <div onClick={()=>profilePhotoRef.current.click()} style={{width:100,height:100,borderRadius:"50%",margin:"0 auto 10px",overflow:"hidden",border:"3px dashed "+C.accent,cursor:"pointer",background:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {profilePhoto
                      ?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<div style={{textAlign:"center"}}><div style={{fontSize:32}}>📷</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>Foto qoshish</div></div>
                    }
                    {photoCheckLoading&&(
                      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}>
                        <div style={{color:"#fff",fontSize:10,fontWeight:700}}>🤖 Tekshirilmoqda...</div>
                      </div>
                    )}
                  </div>

                  {/* KO'P RASM qo'shish */}
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:11,color:C.muted,fontWeight:600}}>📸 Rasmlarim ({myPhotos.length+( profilePhoto?1:0)}/10)</span>
                      {myPhotos.length<9&&(
                        <button onClick={()=>setShowPhotoWarning(true)} style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:20,padding:"4px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Rasm qo'shish</button>
                      )}
                    </div>
                    {myPhotos.length>0&&(
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {myPhotos.map((url,i)=>(
                          <div key={i} style={{position:"relative",width:56,height:56,borderRadius:10,overflow:"hidden",border:"2px solid "+C.border}}>
                            <img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            <button onClick={()=>setMyPhotos(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-4,right:-4,background:"#ef4444",border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profil rasmi haqida maslahat */}
                  <div style={{background:"linear-gradient(135deg,#f0fdf4,#e0f2fe)",borderRadius:13,padding:"10px 13px",textAlign:"left",border:"1px solid #86efac"}}>
                    <div style={{fontSize:11,color:"#16a34a",fontWeight:700,marginBottom:4}}>💡 Nima uchun rasm muhim?</div>
                    <div style={{fontSize:10,color:"#15803d",lineHeight:1.7}}>
                      ✅ O'z rasmingizni qo'yish — ishonchlilik ballini oshiradi<br/>
                      ✅ Ko'proq odam suhbatga kirishadi<br/>
                      ✅ Tezroq o'zingizga mos insonni topasiz<br/>
                      ⚠️ Kamida 1 ta, maksimum 10 ta rasm joylang
                    </div>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>Jins:</label>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setForm(p=>({...p,gender:"ayol"}))} style={{flex:1,padding:10,borderRadius:12,border:"2px solid "+(form.gender==="ayol"?C.accent:C.border),background:form.gender==="ayol"?C.accent:"#f0f9ff",color:form.gender==="ayol"?"#fff":C.text,fontWeight:700,cursor:"pointer"}}>Ayol</button>
                    <button onClick={()=>setForm(p=>({...p,gender:"erkak"}))} style={{flex:1,padding:10,borderRadius:12,border:"2px solid "+(form.gender==="erkak"?C.sky:C.border),background:form.gender==="erkak"?C.sky:"#f0f9ff",color:form.gender==="erkak"?"#fff":C.text,fontWeight:700,cursor:"pointer"}}>Erkak</button>
                  </div>
                </div>
                {/* ISM VA FAMILIYA — yonma-yon */}
                {(form.firstName||form.tgUsername)&&getTgUser()&&(
                  <div style={{background:"linear-gradient(135deg,#e0f2fe,#f0fdf4)",borderRadius:12,padding:"10px 13px",marginBottom:10,border:"1px solid #86efac",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>✈️</span>
                    <div style={{fontSize:11,color:"#16a34a",fontWeight:600}}>
                      Telegram dan avtomatik to'ldirildi. Zarur bo'lsa o'zgartiring.
                    </div>
                  </div>
                )}
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Ism:</label>
                    <input value={form.firstName||""} onChange={e=>setForm(p=>({...p,firstName:e.target.value,name:(e.target.value+" "+(p.lastName||"")).trim()}))} placeholder="Nilufar" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Familiya:</label>
                    <input value={form.lastName||""} onChange={e=>setForm(p=>({...p,lastName:e.target.value,name:((p.firstName||"")+" "+e.target.value).trim()}))} placeholder="Karimova" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>
                {/* SHAHAR */}
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Shahar:</label>
                  <input value={form.city||""} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="Toshkent..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
                {/* O'ZINGIZ HAQINGIZDA */}
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>O'zingiz haqingizda qisqacha:</label>
                  <input value={form.bio||""} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} placeholder="Ozingiz haqida..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>💼 Kasbi:</label>
                  <input value={form.kasb||""} onChange={e=>setForm(p=>({...p,kasb:e.target.value}))} placeholder="Dasturchi, muallim, shifokor..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>

                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>✈️ Telegram username (ixtiyoriy):</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:13}}>@</span>
                    <input
                      value={form.tgUsername||""}
                      onChange={e=>setForm(p=>({...p,tgUsername:e.target.value.replace("@","")}))}
                      placeholder="username"
                      style={{width:"100%",background: form.tgUsername?"#f0fdf4":"#f0f9ff",border:"1px solid "+(form.tgUsername?"#86efac":C.border),borderRadius:11,padding:"9px 12px 9px 26px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    {form.tgUsername&&getTgUser()?.username===form.tgUsername&&(
                      <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:14}}>✅</span>
                    )}
                  </div>
                  <div style={{fontSize:10,color:"#16a34a",marginTop:3,display:"flex",alignItems:"center",gap:4}}>
                    {getTgUser()?.username
                      ? "✈️ Telegram dan avtomatik aniqlandi — boshqalarga ko'rinmaydi"
                      : "🔒 Boshqalarga ko'rinmaydi — faqat Telegram ga o'tishda ishlatiladi"}
                  </div>
                </div>

                {/* BOY VA VAZN */}
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>📏 Bo'yi (sm):</label>
                    <input
                      type="number" min={100} max={200}
                      value={form.height||""}
                      onChange={e=>setForm(p=>({...p,height:e.target.value}))}
                      placeholder="Taxminiy bo'yingiz"
                      style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>100–200 sm</div>
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>⚖️ Vazni (kg):</label>
                    <input
                      type="number" min={40} max={150}
                      value={form.weight||""}
                      onChange={e=>setForm(p=>({...p,weight:e.target.value}))}
                      placeholder="Taxminiy vazni"
                      style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>40–150 kg</div>
                  </div>
                </div>

                {/* KIMNI QIDIRMOQDA */}
                <div style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <label style={{fontSize:12,color:C.muted,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                      <span>🔍</span> Kimni qidirmoqda
                    </label>
                    <span style={{fontSize:11,color:(form.seeking||"").length>450?"#ef4444":C.muted,fontWeight:600}}>
                      {(form.seeking||"").length}/500
                    </span>
                  </div>

                  {/* Quick chips */}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                    {["Do'st / Dugona","Jiddiy munosabat","Turmush o'rtog'i","Suhbatdosh"].map(opt=>(
                      <button key={opt} onClick={()=>{
                        const cur=form.seeking||"";
                        if(!cur.includes(opt)) setForm(p=>({...p,seeking:(cur?cur+" ":"")+opt}));
                      }} style={{padding:"5px 11px",borderRadius:20,border:"1.5px solid "+C.border,background:"#f0f9ff",color:C.text,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                        {opt}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={form.seeking||""}
                    onChange={e=>{
                      const val = e.target.value;
                      if(val.length > 500) return;

                      // Taqiqlangan so'zlar va iboralar
                      const BANNED_SEEKING = [
                        // Karta / pul so'rash
                        "karta","kart","kapcha","kapcha raqam","plastik","click","humo","uzcard","visa","mastercard",
                        "pul ber","pul so'r","pul berasiz","pul kerak","dollar","so'm ber","transfer","to'lov",
                        // Fahsh / intim
                        "sex","intim","eskort","escort","xizmat","bir kecha","bir tun","yotish","yotoq",
                        "intimate","adult","18+","porn","fohisha","beparda","yalang","ochiq",
                        // Taklif shakllari
                        "xizmat ko'rsataman","xizmat beraman","tanishib chiqamiz","uy kelasiz","kvartira",
                      ];
                      const lower = val.toLowerCase();
                      const hasBanned = BANNED_SEEKING.some(w => lower.includes(w));
                      if(hasBanned){
                        setShowBadWordWarn(true);
                        setTimeout(()=>setShowBadWordWarn(false),4000);
                        return;
                      }
                      const {hasBad} = filterBadWords(val);
                      if(hasBad){
                        setShowBadWordWarn(true);
                        setTimeout(()=>setShowBadWordWarn(false),4000);
                        return;
                      }
                      setForm(p=>({...p,seeking:val}));
                    }}
                    placeholder="Maqsadingizni yozing... Masalan: Jiddiy munosabat uchun samimiy, maqsadli yigit qidirmoqdaman. Birgalikda sayr, kitob o'qish va hayotdan zavq olishni yaxshi ko'raman."
                    style={{
                      width:"100%",background:"#f0f9ff",
                      border:"1.5px solid "+C.border,
                      borderRadius:13,padding:"11px 13px",
                      color:C.text,fontSize:13,outline:"none",
                      boxSizing:"border-box",minHeight:100,
                      resize:"none",fontFamily:"inherit",lineHeight:1.6
                    }}
                  />

                  {/* Taqiq haqida ogohlantirish */}
                  <div style={{marginTop:8,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:11,padding:"9px 12px"}}>
                    <div style={{fontSize:10,color:"#dc2626",fontWeight:700,marginBottom:4}}>🚫 Bu bo'limda taqiqlangan:</div>
                    <div style={{fontSize:10,color:"#ef4444",lineHeight:1.7}}>
                      💳 Karta raqam yoki pul so'rash · 🔞 Fahsh va intim g'oyalar · 💋 Eskort va intim xizmatlar taklifi · 🤑 Pul maqsadida murojaat
                    </div>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Yoshingiz:</label>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[18,19,20,21,22,23,24,25,26,27,28,29,30,32,35,38,40,43,45,48,50,55,60,65,70].map(y=>(
                      <button key={y} onClick={()=>setForm(p=>({...p,age:String(y)}))} style={{padding:"5px 10px",borderRadius:20,border:"2px solid "+(form.age===String(y)?C.accent:C.border),background:form.age===String(y)?C.accent:"#f0f9ff",color:form.age===String(y)?"#fff":C.text,fontSize:12,fontWeight:form.age===String(y)?700:400,cursor:"pointer"}}>{y}</button>
                    ))}
                  </div>
                </div>
                {/* OVOZLI TASDIQLASH */}
                <div style={{marginBottom:14,background:"linear-gradient(135deg,#f0fdf4,#e0f2fe)",borderRadius:16,padding:"16px",border:"1px solid #86efac"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:24}}>🎙️</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900,fontSize:14,color:"#16a34a"}}>Ovozli xabar qoldiring!</div>
                      <div style={{fontSize:11,color:"#15803d",marginTop:1}}>Ishonchlilik +15 ball ⬆️</div>
                    </div>
                    {voiceVerified&&<div style={{background:"#22c55e",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>✅ Tasdiqlandi</div>}
                  </div>

                  {!voiceVerified&&!voiceDeclined&&(
                    <div style={{background:"rgba(255,255,255,0.7)",borderRadius:12,padding:"12px",marginBottom:12}}>
                      <div style={{fontSize:13,fontWeight:800,color:"#166534",marginBottom:6}}>
                        💡 Ovoz qoldiring — insonlar sizga ko'proq ishonadi!
                      </div>
                      <div style={{fontSize:12,color:"#15803d",lineHeight:1.8}}>
                        Faqat ismingiz, yoshingiz yoki qayerdanligingizni ayting — bu yetarli! Masalan:<br/>
                        <span style={{fontStyle:"italic",color:"#166534"}}>
                          "Salom, men Nilufar, 23 yoshdaman, Toshkentdanman" 🌸
                        </span>
                      </div>
                      <div style={{marginTop:8,fontSize:11,color:"#16a34a",display:"flex",alignItems:"center",gap:5}}>
                        🔒 <span>Ovozingiz <b>faqat profilingizda</b> eshitiladi — hech kim yuklab ololmaydi</span>
                      </div>
                    </div>
                  )}

                  {voiceBlob&&!voiceVerified&&(
                    <div style={{marginBottom:10}}>
                      <audio src={URL.createObjectURL(voiceBlob)} controls style={{width:"100%",height:32}}/>
                      <div style={{fontSize:10,color:"#15803d",marginTop:4}}>⏱️ {voiceDuration} soniya yozildi</div>
                    </div>
                  )}

                  {voiceVerified&&voiceBlob&&(
                    <div style={{marginBottom:8}}>
                      <audio src={URL.createObjectURL(voiceBlob)} controls style={{width:"100%",height:32}}/>
                      <div style={{fontSize:11,color:"#16a34a",marginTop:6,textAlign:"center",fontWeight:600}}>
                        🎉 Ajoyib! Ovozingiz profilingizga qo'shildi
                      </div>
                    </div>
                  )}

                  {voiceDeclined&&(
                    <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px 0",fontStyle:"italic"}}>
                      🔇 Ovozli xabar qoldirishni istamadiniz
                      <button onClick={()=>setVoiceDeclined(false)} style={{display:"block",margin:"8px auto 0",background:"none",border:"1px solid #86efac",borderRadius:20,padding:"4px 12px",fontSize:11,color:"#16a34a",cursor:"pointer"}}>
                        Qayta urinib ko'rish
                      </button>
                    </div>
                  )}

                  {!voiceVerified&&!voiceDeclined&&(
                    <div style={{display:"flex",gap:8}}>
                      {!voiceRecording?(
                        <>
                          <button onClick={async()=>{
                            try{
                              const stream = await navigator.mediaDevices.getUserMedia({audio:true});
                              const mr = new MediaRecorder(stream);
                              const chunks=[];
                              mr.ondataavailable=e=>chunks.push(e.data);
                              mr.onstop=()=>{
                                const blob=new Blob(chunks,{type:"audio/webm"});
                                stream.getTracks().forEach(t=>t.stop());
                                if(voiceDuration<5){toast$("Kamida 5 soniya yozing!","#ef4444");setVoiceDuration(0);return;}
                                setVoiceBlob(blob);
                              };
                              setVoiceRecording(true);
                              setVoiceDuration(0);
                              mr.start();
                              setVoiceMediaRecorder(mr);
                              const interval=setInterval(()=>{
                                setVoiceDuration(p=>{
                                  if(p>=60){mr.stop();setVoiceRecording(false);clearInterval(interval);return 60;}
                                  return p+1;
                                });
                              },1000);
                              setVoiceInterval(interval);
                            }catch(e){toast$("Mikrofon ruxsati kerak!","#ef4444");}
                          }} style={{flex:1,padding:"11px",borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                            🎙️ Boshlash
                          </button>
                          {voiceBlob&&(
                            <button onClick={()=>{
                              if(voiceDuration>=5){setVoiceVerified(true);toast$("✅ Ovoz tasdiqlandi! +15 ball","#22c55e");}
                            }} style={{flex:1,padding:"11px",borderRadius:12,background:"#3b82f6",border:"none",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>
                              ✅ Tasdiqlash
                            </button>
                          )}
                        </>
                      ):(
                        <button onClick={()=>{
                          voiceMediaRecorder?.stop();
                          setVoiceRecording(false);
                          clearInterval(voiceInterval);
                        }} style={{flex:1,padding:"11px",borderRadius:12,background:"#ef4444",border:"none",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                          ⏹️ To'xtatish ({voiceDuration}s / 60s)
                        </button>
                      )}
                    </div>
                  )}

                  {!voiceVerified&&!voiceDeclined&&(
                    <button onClick={()=>setVoiceDeclined(true)} style={{
                      width:"100%",marginTop:10,padding:"9px",
                      borderRadius:12,background:"transparent",
                      border:"1px dashed #86efac",
                      color:"#94a3b8",fontWeight:600,fontSize:12,cursor:"pointer"
                    }}>
                      Ovozli xabar qoldirishni istamayman
                    </button>
                  )}
                </div>

                <button onClick={async ()=>{
                  if(!form.name||!form.age){toast$("Ism va yosh majburiy!","#ef4444");return;}
                  if(!form.gender){toast$("Jinsni tanlang!","#ef4444");return;}
                  setProfile(form);
                  // Supabase ga saqlash
                  if(sb && myUserId) {
                    const updateData = {
                      name: form.name,
                      age: parseInt(form.age)||null,
                      city: form.city,
                      gender: form.gender,
                      bio: form.bio,
                      kasb: form.kasb,
                      height: form.height ? parseInt(form.height) : null,
                      weight: form.weight ? parseInt(form.weight) : null,
                      seeking: form.seeking,
                      tg_username: form.tgUsername,
                      tg_id: form.tgUserId,
                      photo_url: profilePhoto||null,
                      extra_photos: myPhotos||[],
                      updated_at: new Date().toISOString(),
                    };
                    const {error} = await sb.from('users').upsert({id:myUserId, ...updateData}, {onConflict:'id'});
                    if(error) { toast$("Saqlashda xatolik: "+error.message, "#ef4444"); return; }
                  }
                  toast$("✅ Profil saqlandi!",C.green);
                }} style={bigBtn("linear-gradient(90deg,#ff6eb4,#38bdf8)")}>Saqlash</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid "+C.border,display:"flex",zIndex:100}}>
        {[{key:"discover",icon:"🔍",label:T.discover},{key:"matches",icon:"🖍️",label:T.matches},{key:"go",icon:"🚀",label:T.go},{key:"menu",icon:"☰",label:"Menyu"}].map(item=>(
          <div key={item.key} onClick={()=>{setTab(item.key);checkTabHint(item.key);}} style={{flex:1,padding:"10px 0",textAlign:"center",cursor:"pointer",background:tab===item.key?"rgba(255,110,180,0.06)":"transparent",borderTop:tab===item.key?"2px solid "+C.accent:"2px solid transparent"}}>
            <div style={{fontSize:20}}>{item.icon}</div>
            <div style={{fontSize:9,color:tab===item.key?C.accent:C.muted,fontWeight:tab===item.key?700:400,marginTop:2}}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
