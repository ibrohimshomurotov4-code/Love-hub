import { useState, useEffect, useRef } from "react";

const LANGS = {
  uz:  { flag:"UZ",  discover:"Qidiruv", matches:"Lichka", go:"GO", stories:"Stories", shop:"Dokon", writeMsg:"Xabar yozing...", online:"Online", cancel:"Bekor", aboutInfo:"haqida malumot", langTitle:"Til tanlash", settingsTitle:"Sozlamalar", support:"Qollab-quvvatlash", suggestion:"Taklif va shikoyatlar", terms:"Foydalanish shartlari", rate:"Ilovani baholash", myProfile:"Mening profilim", noMatch:"Hali matchlar yoq", complaintSent:"Shikoyatingiz tez orada administratsiyamiz tomonidan korib chiqiladi. Betibor bolmaganingiz uchun rahmat!" },
  kir: { flag:"УЗ", discover:"Қидирув",  matches:"Лички",  go:"GO", stories:"Ҳикоялар", shop:"Дўкон", writeMsg:"Хабар ёзинг...", online:"Онлайн", cancel:"Бекор", aboutInfo:"ҳақида маълумот", langTitle:"Тил танлаш", settingsTitle:"Созламалар", support:"Қўллаб-қувватлаш", suggestion:"Таклиф ва шикоятлар", terms:"Фойдаланиш шартлари", rate:"Иловани баҳолаш", myProfile:"Менинг профилим", noMatch:"Ҳали матчлар йўқ", complaintSent:"Шикоятингиз тез орада администратсиямиз томонидан кўриб чиқилади. Раҳмат!" },
  ru:  { flag:"RU",  discover:"Поиск",   matches:"Чаты",   go:"GO", stories:"Истории",  shop:"Магазин", writeMsg:"Написать...", online:"Онлайн", cancel:"Отмена", aboutInfo:"подробнее", langTitle:"Выбор языка", settingsTitle:"Настройки", support:"Поддержка", suggestion:"Предложения", terms:"Условия", rate:"Оценить", myProfile:"Мой профиль", noMatch:"Нет совпадений", complaintSent:"Ваша жалоба будет рассмотрена администрацией. Спасибо!" },
};

const C = { bg:"#f0f8ff", accent:"#ff6eb4", sky:"#38bdf8", text:"#1e293b", muted:"#94a3b8", border:"#e2edf7", green:"#22c55e", gold:"#f59e0b", purple:"#a855f7", pink:"#f472b6" };

const VILOYATLAR = ["Toshkent shahri","Toshkent viloyati","Samarqand","Buxoro","Fargona","Namangan","Andijon","Qashqadaryo","Surxondaryo","Xorazm","Navoiy","Sirdaryo","Qoraqalpogiston"];
const TOSHKENT_TUMANLARI = ["Toshkent","Yunusobod","Chilonzor","Mirzo Ulugbek","Yakkasaroy","Shayxontohur","Olmazar","Uchtepa","Sergeli","Bektemir","Yashnobod","Mirobod"];
const BANNED = ["dacha","tog","sex","18+","yotiq","tunash","kvartira","mehmonxona","hotel","motel"];

// Haqoratli va nojo'ya so'zlar
const BAD_WORDS = [
  // O'zbek
  "ahmoq","tentak","qo'tir","nokas","harom","it","eshak","cho'chqa","qanday","la'nat",
  "o'lar","o'l","yomon","boshqotirma","ovsar","bema'ni","beadab","bedard","besha'n",
  "uyatsiz","sharmsiz","buzuq","qavvod","fahsh","yaramasiz","sassiq","murdor",
  // Rus
  "blyad","suka","pizda","huy","ebat","pizdec","mudak","dolboeb","eblan","pidor",
  "zalupa","shluha","govno","blyadi","cyka","nahuy","poshel","idi","ublyudok",
  // Ingliz (asosiy)
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
  "😺","😸","😹","😻","😼","😽","🙀","😿","😾",
  "👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍",
  "👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👂","🦻","👃",
  "🌹","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌟",
  "⭐","🌠","🌌","☀️","🌤️","⛅","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌈","🌊","🌀","🌪️","🌫️",
  "🍎","🍊","🍋","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌽",
  "🍕","🍔","🍟","🌭","🍿","🧂","🥓","🥚","🍳","🧇","🥞","🧈","🍞","🥐","🥨","🥯","🧀","🥗","🥘",
  "🎂","🍰","🧁","🥧","🍮","🍭","🍬","🍫","🍩","🍪","🌰","🥜","☕","🍵","🧃","🥤","🍺","🍻","🥂","🍷",
  "🎮","🕹️","🎲","♟️","🧩","🎯","🎳","🎰","🎪","🎨","🖼️","🎭","🎬","🎤","🎧","🎼","🎹","🎸","🎺","🎻",
  "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎽","🛹","🛷","🥌","🎿","⛷️","🏂","🏋️",
  "🚗","🚕","🚙","🏎️","🚓","🚑","🚒","🚐","🚌","🚎","🏍️","🛵","🚲","🛴","✈️","🚀","🛸","🚁","⛵","🛥️",
  "🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏪","🏫","🏬","🏭","🗼","🗽","⛪","🕌","🕍","⛩️","🕋",
  "💻","🖥️","🖨️","⌨️","🖱️","🖲️","💾","💿","📀","📱","☎️","📞","📟","📠","📺","📷","📸","📹","🎥","📽️",
  "💰","💴","💵","💶","💷","💸","💳","💹","📈","📉","📊","📋","📌","📍","🗺️","🧭","📅","📆","🗓️","📇",
  "🎁","🎀","🎊","🎉","🎈","🎏","🎐","🎑","🧧","🎆","🎇","✨","🎍","🎋","🎄","🎃","🎑","🎗️","🎟️","🎫",
  "🌍","🌎","🌏","🌐","🗾","🧭","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🏟️","🏛️","🏗️",
  "🦁","🐯","🐻","🐼","🐨","🐸","🐵","🙈","🙉","🙊","🐒","🦊","🦝","🐺","🐗","🐴","🦄","🐝","🐛","🦋",
];
const TG_STICKERS = [
  {id:1,emoji:"😊",label:"Yaxshi"},{id:2,emoji:"😍",label:"Sevgi"},{id:3,emoji:"🔥",label:"Ajoyib"},
  {id:4,emoji:"💋",label:"Opich"},{id:5,emoji:"🌹",label:"Atirgul"},{id:6,emoji:"✨",label:"Sehrli"},
  {id:7,emoji:"🦋",label:"Kapalak"},{id:8,emoji:"💫",label:"Yulduz"},{id:9,emoji:"🎉",label:"Bayram"},
  {id:10,emoji:"🥰",label:"Oshiq"},{id:11,emoji:"😂",label:"Kulgili"},{id:12,emoji:"👏",label:"Brava"},
];
const TG_GIFS = [
  {id:1,emoji:"👋",text:"Salom gif",url:"https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif"},
  {id:2,emoji:"❤️",text:"Sevgi gif",url:"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"},
  {id:3,emoji:"😂",text:"Kulgili",url:"https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif"},
  {id:4,emoji:"🎉",text:"Bayram",url:"https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"},
];

const USERS = [
  {id:1,name:"Nilufar",age:23,city:"Toshkent shahri",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=47",extraPhotos:["https://i.pravatar.cc/400?img=48","https://i.pravatar.cc/400?img=49"],emoji:"👩",bio:"Raqs va musiqa sevaman",online:true,rating:4.8,vip:true,stories:["🌅","🎶","🌺"],kasb:"Raqqosa, musiqa muallimi"},
  {id:2,name:"Kamola",age:25,city:"Samarqand",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=45",emoji:"👩",bio:"Sayohat qilishni yaxshi koraman",online:false,rating:4.5,vip:false,stories:["🏔️","🌊","🗺️"],kasb:"Sayohat bloggeri"},
  {id:3,name:"Dildora",age:21,city:"Buxoro",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=44",emoji:"👩",bio:"Kitob oqish va pishiriq",online:true,rating:4.9,vip:true,stories:["📚","🍰","🌸"],kasb:"Konditer, blogger"},
  {id:4,name:"Mohira",age:27,city:"Namangan",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=41",emoji:"👩",bio:"Sport va sogrom turmush",online:true,rating:4.6,vip:false,stories:["🏋️","🥑","🧘"],kasb:"Fitness murabbiyi"},
  {id:5,name:"Jasur",age:24,city:"Toshkent shahri",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=12",emoji:"👨",bio:"Futbol va musiqa muxlisi",online:true,rating:4.6,vip:false,stories:["⚽","🎸","🌆"],kasb:"IT dasturchi"},
  {id:6,name:"Bobur",age:26,city:"Samarqand",gender:"erkak",demoPhoto:"https://i.pravatar.cc/400?img=15",emoji:"👨",bio:"Biznes va sayohat",online:true,rating:4.4,vip:true,stories:["💼","✈️","🌍"],kasb:"Tadbirkor"},
  {id:7,name:"Malika",age:24,city:"Toshkent shahri",gender:"ayol",demoPhoto:"https://i.pravatar.cc/400?img=25",extraPhotos:["https://i.pravatar.cc/400?img=26","https://i.pravatar.cc/400?img=27"],emoji:"👩",bio:"Raqs, yoga va tabiat sevaman",online:true,rating:4.9,vip:true,stories:["🌿","💃","🧘"],kasb:"Yoga murabbiyi"},
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

export default function App() {
  const [lang, setLang] = useState("uz");
  const T = LANGS[lang];
  const [tab, setTab] = useState("discover");
  const [firstLoad, setFirstLoad] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({name:"",age:"",city:"",bio:"",gender:"",district:"",millat:"",phone:"",phoneAnon:false,goal:"",hobbies:[],married:"yoq",children:"yoq",kasb:""});
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
    {id:1,userId:1,name:"Nilufar",demoPhoto:"https://i.pravatar.cc/400?img=47",type:"🎬 Kino",text:"Bugun kechqurun kinoga borishni xohlaysizmi?",city:"Toshkent",time:"19:00",date:"Bugun",likes:12,audience:"erkaklar"},
    {id:2,userId:3,name:"Dildora",demoPhoto:"https://i.pravatar.cc/400?img=44",type:"🍽️ Ovqatlanish",text:"Toshkentda birgalikda tushlik qilishni taklif etaman",city:"Toshkent",time:"13:00",date:"Ertaga",likes:8,audience:"erkaklar"},
    {id:3,userId:5,name:"Jasur",demoPhoto:"https://i.pravatar.cc/400?img=12",type:"🌳 Parkka",text:"Yangi Ozbekiston bogida sayrga taklif! Havo yaxshi",city:"Toshkent",time:"17:00",date:"Shanba",likes:21,audience:"ayollar"},
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
    discover: {
      icon:"🔍",
      title:"Qidiruv bo'limi",
      desc:"Bu yerda yangi do'stlar va tanishlar topasiz! Yoshi, shahri va jinsiga qarab filtrlab qidiring. ❤️ Dost tugmasi bilan yoqtirsangiz, ✕ bilan o'tkazib yuboring. Kimnidir profili qiziqtirsa — rasmiga bosib batafsil ko'ring!",
      color:"#ff6eb4",
    },
    matches: {
      icon:"🖍️",
      title:"Lichka bo'limi",
      desc:"Bu yerda sizni yoqtirganlар va o'zaro match bo'lgan do'stlaringiz ro'yxati! Rasmiga bosib profilini ko'ring, ismiga bosib xabar yozing. Stikerlar, GIF va sovgalar ham yuborishingiz mumkin! 💬",
      color:"#8b5cf6",
    },
    go: {
      icon:"🚀",
      title:"GO bo'limi",
      desc:"Bu yerda real uchrashuv va taklif elonlarini ko'rasiz! Kinoga, tushlikka, parkka birga borishni taklif qiling yoki boshqalarning takliflariga qo'shiling. Lokatsiyani yoqib atrofingizdagilarni ham toping! 📍",
      color:"#22c55e",
    },
    menu: {
      icon:"☰",
      title:"Asosiy menyu",
      desc:"Bu yerda profil, do'stlarni taklif qilish, so'rovnoma va boshqa bo'limlar mavjud! Do'stlaringizni taklif qilib bonus tangalar ishlang, so'rovnomani to'ldiring va +100 tanga oling! 🎁",
      color:"#38bdf8",
    },
    shop: {
      icon:"🛒",
      title:"Do'kon bo'limi",
      desc:"Bu yerda tangalar sotib olish, do'stlarga sovga yuborish va real mukofotlarga tanga almashtirish mumkin! Azolik paketlari orqali VIP, Diamond yoki Silver maqomiga ega bo'ling! 👑",
      color:"#f59e0b",
    },
    profile: {
      icon:"👤",
      title:"Profil bo'limi",
      desc:"Bu yerda shaxsiy ma'lumotlaringizni to'ldiring! Ism, yosh, shahar, kasb, bio va boshqalarni kiriting. Profilingiz to'liqroq bo'lsa — ko'proq e'tibor va matchlar olasiz! ✨",
      color:"#ec4899",
    },
  };
  const [giftShopTab, setGiftShopTab] = useState("ayol");
  const CHAMPIONS = [
    {rank:1,name:"Sherzod A.",count:47,earned:4820,avatar:"👨"},
    {rank:2,name:"Malika T.",count:38,earned:3900,avatar:"👩"},
    {rank:3,name:"Bobur X.",count:31,earned:3180,avatar:"👨"},
    {rank:4,name:"Dildora M.",count:26,earned:2660,avatar:"👩"},
    {rank:5,name:"Jasur K.",count:22,earned:2240,avatar:"👨"},
    {rank:6,name:"Kamola S.",count:19,earned:1940,avatar:"👩"},
    {rank:7,name:"Ulug'bek R.",count:17,earned:1740,avatar:"👨"},
    {rank:8,name:"Feruza N.",count:15,earned:1520,avatar:"👩"},
    {rank:9,name:"Sanjar O.",count:14,earned:1440,avatar:"👨"},
    {rank:10,name:"Zulfiya H.",count:12,earned:1220,avatar:"👩"},
    {rank:11,name:"Timur B.",count:11,earned:1120,avatar:"👨"},
    {rank:12,name:"Munira A.",count:10,earned:1020,avatar:"👩"},
    {rank:13,name:"Otabek Y.",count:9,earned:920,avatar:"👨"},
    {rank:14,name:"Sarvinoz I.",count:8,earned:820,avatar:"👩"},
    {rank:15,name:"Ravshan P.",count:7,earned:720,avatar:"👨"},
    {rank:16,name:"Nozima Q.",count:6,earned:620,avatar:"👩"},
    {rank:17,name:"Firdavs L.",count:5,earned:520,avatar:"👨"},
    {rank:18,name:"Hulkar V.",count:4,earned:420,avatar:"👩"},
    {rank:19,name:"Azizbek T.",count:3,earned:320,avatar:"👨"},
    {rank:20,name:"Mohira C.",count:2,earned:220,avatar:"👩"},
  ];
  const [referralFriends, setReferralFriends] = useState([
    {id:1,name:"Jasur",joined:"3 kun oldin",active:true,days:12,bonus:120,avatar:"👨"},
    {id:2,name:"Nilufar",joined:"7 kun oldin",active:false,days:6,bonus:20,avatar:"👩"},
    {id:3,name:"Bobur",joined:"1 kun oldin",active:false,days:1,bonus:20,avatar:"👨"},
  ]);
  const myReferralCode = "LOVEHUB_" + (profile?.name||"USER").toUpperCase().slice(0,5).replace(/[^A-Z]/g,"X") + "777";
  const referralEarned = referralFriends.reduce((s,f)=>s+f.bonus,0);
  const [showGoFilter, setShowGoFilter] = useState(false);
  const [goGenderFilter, setGoGenderFilter] = useState("barchasi");
  const [goCityFilter, setGoCityFilter] = useState("Barchasi");
  const [goDistrictFilter, setGoDistrictFilter] = useState("Barchasi");
  const [eventForm, setEventForm] = useState({title:"",type:"🎬 Kino",desc:"",date:"",time:"",location:"",audience:"barchasi",maxPeople:""});
  const [goFilter, setGoFilter] = useState("Barchasi");

  const endRef = useRef(null);
  const storyTimer = useRef(null);
  const fileRef = useRef(null);
  const fileTypeRef = useRef(null);
  const storyFileRef = useRef(null);
  const profilePhotoRef = useRef(null);
  const complaintFileRef = useRef(null);

  useEffect(() => {
    if (firstLoad) { setFirstLoad(false); setTabHint("discover"); }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [chat, msgs]);
  useEffect(() => {
    if (!story) return;
    storyTimer.current = setTimeout(() => {
      const items = story.isMyStory ? myStories : (story.stories||[]);
      if (storyI < items.length - 1) setStoryI(p => p+1);
      else { setStory(null); setStoryI(0); }
    }, 3000);
    return () => clearTimeout(storyTimer.current);
  }, [story, storyI, myStories]);

  const checkTabHint = (tabKey) => {
    if (!seenTabs[tabKey] && TAB_HINTS[tabKey]) {
      setTabHint(tabKey);
    }
  };

  const toast$ = (msg, color=C.accent) => {
    setToast({msg,color});
    setTimeout(() => setToast(null), 2500);
  };

  const users = USERS.filter(u => {
    return u.age>=ageF[0] && u.age<=ageF[1]
      && (cityF==="Barchasi" || u.city===cityF)
      && (genderF==="Barchasi" || u.gender===genderF)
      && !blocked.includes(u.id);
  });
  const cur = users[cardI % Math.max(users.length, 1)];

  const like = id => {
    setSwipe("right");
    setTimeout(() => {
      setSwipe(null); setLiked(p=>[...p,id]);
      if (Math.random() > 0.4) { setMatches(p=>[...p,id]); toast$("Yangi match!", C.green); }
      else toast$("Like bosildingiz!");
      setCardI(p=>p+1); setCardMenu(null);
    }, 400);
  };
  const dislike = () => {
    setSwipe("left");
    setTimeout(() => { setSwipe(null); setCardI(p=>p+1); setCardMenu(null); }, 400);
  };

  const send = txt => {
    if (!txt.trim()) return;
    const {filtered, hasBad} = filterBadWords(txt);
    if (hasBad) {
      setShowBadWordWarn(true);
      setInput(filtered);
      setTimeout(()=>setShowBadWordWarn(false), 4000);
      return;
    }
    const t = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p => ({...p,[chat]:[...(p[chat]||[]),{from:"me",text:txt,time:t}]}));
    setInput(""); setStickers(false); setMediaPanel(false);
    setTimeout(() => {
      const rs = ["😊","Zor!","Ha, albatta!","Qiziq...","Rahmat"];
      setMsgs(p => ({...p,[chat]:[...(p[chat]||[]),{from:"them",text:rs[Math.floor(Math.random()*rs.length)],time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"})}]}));
    }, 1200);
  };

  const sendGift = g => {
    if (coins < g.price) { toast$("Tangalar yetarli emas!","#ef4444"); return; }
    setCoins(p=>p-g.price); setGiftAnim(g.emoji); setTimeout(()=>setGiftAnim(null),1800);
    const t = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",text:g.emoji+" "+g.name+(giftNote?" | "+giftNote:""),time:t,gift:true}]}));
    setGiftModal(null); setGiftNote(""); toast$(g.emoji+" Sovga yuborildi!",C.sky);
  };

  const sendWave = toUser => {
    setShowWaveModal(null);
    setTimeout(() => setIncomingWave({from:{name:profile?.name||"Sarvar",photo:profilePhoto},to:toUser,comment:waveComment}), 600);
    setWaveComment(""); toast$("👋 "+toUser.name+"ga salom yubordingiz!",C.accent);
  };

  const handleWaveResponse = accepted => {
    if (!incomingWave) return;
    const nm = incomingWave;
    setIncomingWave(null);
    if (accepted) { setMatches(p=>[...p,999]); toast$("Lichka ochildi!",C.green); }
    else setTimeout(() => toast$(nm.to?.name+" rad etdi. Dadil boling! 😍","#ef4444"), 500);
  };

  const blockUser = (userId, userName, type) => {
    setBlockedTypes(p=>({...p,[userId]:type}));
    setShowBlockModal(null);
    const msgs2 = {full:"🚫 "+userName+" butunlay bloklandi",write:userName+" yoza olmaydi",gift:userName+" faqat sovga yuborishi mumkin"};
    toast$(msgs2[type],"#ef4444");
  };

  const startLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      () => { setLocationSharing(true); setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=nearbyRadius)); toast$("Lokatsiya yoqildi!",C.green); },
      () => { setLocationSharing(true); setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=nearbyRadius)); toast$("Demo lokatsiya (Toshkent)",C.sky); }
    );
    if (!navigator.geolocation) { setLocationSharing(true); setNearbyUsers(DEMO_NEARBY.filter(u=>u.dist<=nearbyRadius)); toast$("Demo lokatsiya",C.sky); }
  };

  const filterInput = (val, key) => {
    const {filtered, hasBad} = filterBadWords(val);
    if (hasBad) setShowBadWordWarn(true);
    setTimeout(()=>setShowBadWordWarn(false), 4000);
    return hasBad ? filtered : val;
  };

  const chatUser = chat ? USERS.find(u=>u.id===chat) : null;
  const matchUsers = USERS.filter(u=>matches.includes(u.id) && !blocked.includes(u.id));

  const ov = {position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"};
  const mb = {background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:430,boxShadow:"0 -8px 32px rgba(255,110,180,0.15)",maxHeight:"88vh",overflowY:"auto"};
  const bigBtn = (bg,col="#fff") => ({width:"100%",background:bg,border:"none",borderRadius:13,padding:"13px",color:col,fontWeight:800,fontSize:15,cursor:"pointer",marginTop:8});
  const chipStyle = (active,color) => ({padding:"6px 12px",borderRadius:20,border:"2px solid "+(active?(color||C.accent):C.border),background:active?(color||C.accent):"#f0f9ff",color:active?"#fff":C.text,fontSize:12,fontWeight:active?700:400,cursor:"pointer"});


  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"Nunito,sans-serif",color:C.text,maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap");
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#ff6eb455;border-radius:3px}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounceHeart{from{transform:scale(1)}to{transform:scale(1.2)}}
        @keyframes radar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .rng::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ff6eb4,#38bdf8);cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px #ff6eb455}
        .rng::-webkit-slider-runnable-track{height:4px;background:transparent}
      `}</style>

      {/* Hidden inputs */}
      <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f) return;
        const url=URL.createObjectURL(f);
        const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
        setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t,type:fileTypeRef.current,payload:{url,name:f.name,size:(f.size/1024).toFixed(1)+"KB"}}]}));
        setMediaPanel(false); e.target.value="";
      }}/>
      <input ref={profilePhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f) return;
        setProfilePhoto(URL.createObjectURL(f)); e.target.value="";
      }}/>
      <input ref={complaintFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f) return;
        setComplaintScreenshot(URL.createObjectURL(f)); e.target.value="";
      }}/>
      <input ref={storyFileRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f) return;
        if(!vip && myStories.length>=2){toast$("Kunlik limit! VIP oling",C.gold);return;}
        const url=URL.createObjectURL(f);
        const type=f.type.startsWith("video")?"video":"photo";
        setMyStories(p=>[...p,{type,url,name:f.name,time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"}),audience:storyAudience}]);
        setShowAddStory(false); toast$("Story qoshildi!",C.green); e.target.value="";
      }}/>

      {/* TOAST */}
      {toast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:20,padding:"8px 18px",fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",fontSize:13,animation:"slideUp 0.3s"}}>
          {toast.msg}
        </div>
      )}

      {/* GIFT ANIM */}
      {giftAnim && (
        <div style={{position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",fontSize:100,zIndex:9998,pointerEvents:"none",animation:"bounceHeart 0.4s infinite alternate"}}>
          {giftAnim}
        </div>
      )}

      {/* VIDEO CALL */}
      {videoCall && (
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

      {/* STORY VIEWER */}
      {story && (
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"#0f172a",zIndex:400,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",gap:4,padding:"46px 14px 10px"}}>
            {(story.isMyStory?myStories:(story.stories||[])).map((_,i)=>(
              <div key={i} style={{flex:1,height:3,background:"rgba(255,255,255,0.25)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",background:"#fff",width:i<=storyI?"100%":"0%",transition:i===storyI?"width 3s linear":"none"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px 12px"}}>
            <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",border:"2px solid "+C.accent}}>
              {story.demoPhoto?<img src={story.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:24}}>{story.emoji||"👤"}</span>}
            </div>
            <div style={{flex:1,color:"#fff",fontWeight:800}}>{story.name||"Men"}</div>
            <button onClick={()=>{setStory(null);setStoryI(0);}} style={{background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {(()=>{
              const items=story.isMyStory?myStories:(story.stories||[]);
              const item=items[storyI];
              if(!item) return null;
              if(item.type==="photo") return <img src={item.url} alt="" style={{maxWidth:"100%",maxHeight:"80vh",objectFit:"contain"}}/>;
              if(item.type==="video") return <video src={item.url} autoPlay loop muted style={{maxWidth:"100%",maxHeight:"80vh",objectFit:"contain"}}/>;
              return <div style={{fontSize:100}}>{item}</div>;
            })()}
          </div>
          <div style={{position:"absolute",top:80,left:0,width:"40%",height:"70%",cursor:"pointer"}} onClick={()=>setStoryI(p=>Math.max(0,p-1))}/>
          <div style={{position:"absolute",top:80,right:0,width:"60%",height:"70%",cursor:"pointer"}} onClick={()=>{
            const items=story.isMyStory?myStories:(story.stories||[]);
            if(storyI<items.length-1) setStoryI(p=>p+1);
            else{setStory(null);setStoryI(0);}
          }}/>
        </div>
      )}

      {/* ADD STORY MODAL */}
      {showAddStory && (
        <div style={{...ov,zIndex:350}} onClick={()=>setShowAddStory(false)}>
          <div style={mb} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>📖 Story qoshish</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Bugun: {myStories.length} ta · {vip?"VIP — cheksiz":"Bepul: 2 tagacha"}</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,color:C.muted,fontWeight:600,marginBottom:8}}>Storini kimlar korsin?</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{v:"barchasi",l:"Barchasi",c:C.sky},{v:"matchlar",l:"Faqat matchlar",c:C.accent},{v:"ayollar",l:"Faqat ayollar",c:"#ec4899"},{v:"erkaklar",l:"Faqat erkaklar",c:"#3b82f6"}].map(a=>(
                  <button key={a.v} onClick={()=>setStoryAudience(a.v)} style={chipStyle(storyAudience===a.v,a.c)}>{a.l}</button>
                ))}
              </div>
            </div>
            {!vip && myStories.length>=2 && <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#92400e"}}>Kunlik 2 ta bepul limit tugadi. VIP oling!</div>}
            <button onClick={()=>storyFileRef.current.click()} style={bigBtn("linear-gradient(135deg,#ff6eb4,#38bdf8)")}>📷 Rasm / Video yuklash</button>
            <button onClick={()=>setShowAddStory(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Yopish</button>
          </div>
        </div>
      )}

      {/* WAVE MODAL */}
      {showWaveModal && (
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
      {incomingWave && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(15,23,42,0.88)",backdropFilter:"blur(8px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:28,padding:26,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:70,marginBottom:8,animation:"bounceHeart 0.6s infinite alternate"}}>👋</div>
            <div style={{fontWeight:900,fontSize:20,color:C.accent,marginBottom:12}}>{incomingWave.from.name} salom yolladi!</div>
            {incomingWave.comment && <div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"12px 16px",marginBottom:14,border:"1px solid "+C.border,fontSize:13,color:C.text,fontStyle:"italic"}}>"{incomingWave.comment}"</div>}
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
      {incomingGift && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:28,padding:26,width:"100%",maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:90,marginBottom:8,animation:"bounceHeart 0.5s infinite alternate"}}>{incomingGift.gift.emoji}</div>
            <div style={{fontWeight:900,fontSize:20,marginBottom:10}}>{incomingGift.from.name} sovga yolladi!</div>
            {incomingGift.note && <div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"10px",marginBottom:12,fontSize:13,fontStyle:"italic"}}>"{incomingGift.note}"</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setMatches(p=>[...p,incomingGift.to?.id||0]);setIncomingGift(null);toast$("Sovga qabul qilindi!",C.green);}} style={{flex:1,background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:800,cursor:"pointer"}}>Qabul</button>
              <button onClick={()=>{setCoins(p=>p+(incomingGift.gift.price||0));setIncomingGift(null);toast$("Sovga rad etildi, tangalar qaytarildi","#ef4444");}} style={{flex:1,background:"#fee2e2",border:"none",borderRadius:14,padding:"13px",color:"#ef4444",fontWeight:800,cursor:"pointer"}}>Rad</button>
            </div>
          </div>
        </div>
      )}

      {/* GIFT MODAL */}
      {giftModal && (
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
      {showMap && (
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"#0f172a",zIndex:600,display:"flex",flexDirection:"column"}}>
          <div style={{background:"#1e293b",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #334155"}}>
            <button onClick={()=>setShowMap(false)} style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer"}}>←</button>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:800,fontSize:16}}>📍 Yaqin atrofdagilar</div>
              <div style={{color:"#64748b",fontSize:11}}>{nearbyUsers.filter(u=>u.dist<=nearbyRadius).length} ta foydalanuvchi</div>
            </div>
            <div style={{display:"flex",gap:8,fontSize:11}}>
              <span style={{color:"#ff6eb4"}}>● Qiz</span>
              <span style={{color:"#22c55e"}}>● Ogil</span>
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
              {myLocationStatus && <div style={{background:"rgba(255,110,180,0.85)",borderRadius:8,padding:"2px 8px",fontSize:8,color:"#fff",marginTop:2,whiteSpace:"nowrap"}}>{myLocationStatus}</div>}
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
                  {u.online && <div style={{position:"absolute",top:1,right:1,width:10,height:10,borderRadius:"50%",background:"#22c55e",border:"2px solid #0f172a"}}/>}
                  <div style={{position:"absolute",top:44,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.75)",borderRadius:8,padding:"2px 7px",textAlign:"center",whiteSpace:"nowrap"}}>
                    <div style={{color:"#fff",fontSize:9,fontWeight:700}}>{u.name}</div>
                    <div style={{color:dotColor,fontSize:8}}>{u.dist>=1000?(u.dist/1000).toFixed(1)+"km":u.dist+"m"}</div>
                    {u.status && <div style={{color:"#cbd5e1",fontSize:7,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>💬 {u.status}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{background:"#1e293b",padding:"10px 14px",borderTop:"1px solid #334155"}}>
            <div style={{display:"flex",gap:8,overflowX:"auto"}}>
              {nearbyUsers.filter(u=>u.dist<=nearbyRadius).sort((a,b)=>a.dist-b.dist).map(u=>(
                <div key={u.id} style={{flexShrink:0,textAlign:"center",width:60}}>
                  <div style={{width:46,height:46,borderRadius:"50%",overflow:"hidden",border:"2px solid "+(u.gender==="ayol"?"#ff6eb4":"#22c55e"),margin:"0 auto 3px"}}>
                    <img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <div style={{color:"#fff",fontSize:9,fontWeight:700}}>{u.name}</div>
                  <div style={{color:u.gender==="ayol"?"#ff6eb4":"#22c55e",fontSize:8}}>{u.dist>=1000?(u.dist/1000).toFixed(1)+"km":u.dist+"m"}</div>
                  <div style={{display:"flex",gap:2,marginTop:2,justifyContent:"center"}}>
                    <button onClick={()=>{setShowWaveModal(u);setShowMap(false);}} style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:6,padding:"2px 6px",fontSize:8,color:"#fff",cursor:"pointer"}}>👋</button>
                    <button onClick={()=>{setShowBlockModal(u);setShowMap(false);}} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"2px 5px",fontSize:8,color:"#ef4444",cursor:"pointer"}}>🚫</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BLOCK MODAL */}
      {showBlockModal && (
        <div style={{...ov,zIndex:800}} onClick={()=>setShowBlockModal(null)}>
          <div style={mb} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🚫 Bloklash turi</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{showBlockModal.name} uchun:</div>
            {[
              {type:"full",icon:"⛔",title:"Butunlay bloklash",sub:"Kormaydi, yoza olmaydi, reaktsiya bildira olmaydi",color:"#ef4444"},
              {type:"write",icon:"✍️",title:"Yozishni bloklash",sub:"Lichkaga yoza olmaydi, lekin kuzatishi va pullik stiker + 100 harfli izoh bilan xabar yuborishi mumkin",color:"#f59e0b"},
            ].map(opt=>(
              <div key={opt.type} onClick={()=>blockUser(showBlockModal.id,showBlockModal.name,opt.type)} style={{display:"flex",alignItems:"center",gap:12,background:opt.color+"11",border:"1px solid "+opt.color+"33",borderRadius:14,padding:"12px 14px",marginBottom:9,cursor:"pointer"}}>
                <div style={{fontSize:28}}>{opt.icon}</div>
                <div><div style={{fontWeight:700,fontSize:14,color:opt.color}}>{opt.title}</div><div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{opt.sub}</div></div>
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
      {showComplaintModal && !complaintSent && (
        <div style={{...ov,zIndex:800}} onClick={()=>{setShowComplaintModal(null);setComplaintText("");setComplaintReason("");setComplaintScreenshot(null);}}>
          <div style={mb} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:17,marginBottom:4}}>🚨 Shikoyat bildirish</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{showComplaintModal.name} haqida</div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:7,fontWeight:600}}>Shikoyat sababi:</label>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["🔞 Kattalar kontent","🤬 Haqorat","🎭 Soxta profil","📛 Spam","⚠️ Xavfli xulq","💰 Firibgarlik","🧒 Voyaga yetmagan","📸 Begona rasm"].map(r=>(
                  <button key={r} onClick={()=>setComplaintReason(r)} style={{padding:"6px 11px",borderRadius:20,border:"2px solid "+(complaintReason===r?"#ef4444":C.border),background:complaintReason===r?"#fee2e2":"#f8fafc",color:complaintReason===r?"#dc2626":C.text,fontSize:11,fontWeight:complaintReason===r?700:400,cursor:"pointer"}}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>Nima ayb qilganini yozing (majburiy):</label>
              <textarea value={complaintText} onChange={e=>setComplaintText(e.target.value)} placeholder="Masalan: Haqoratli xabarlar yuboryapti..." style={{width:"100%",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:12,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",minHeight:80,resize:"none",fontFamily:"inherit"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>Skrinshot (ixtiyoriy):</label>
              {complaintScreenshot
                ? <div style={{position:"relative",display:"inline-block"}}><img src={complaintScreenshot} style={{width:100,height:100,objectFit:"cover",borderRadius:12}}/><button onClick={()=>setComplaintScreenshot(null)} style={{position:"absolute",top:-6,right:-6,background:"#ef4444",border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",fontSize:11,cursor:"pointer"}}>x</button></div>
                : <button onClick={()=>complaintFileRef.current.click()} style={{background:"#fff5f5",border:"2px dashed #fca5a5",borderRadius:12,padding:"10px 18px",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer"}}>📸 Skrinshot qoshish</button>
              }
            </div>
            <button onClick={()=>{
              if(!complaintReason){toast$("Sabab tanlang!","#ef4444");return;}
              if(!complaintText.trim()){toast$("Tavsif yozing!","#ef4444");return;}
              setComplaintSent(true);
              setTimeout(()=>{setComplaintSent(false);setShowComplaintModal(null);setComplaintText("");setComplaintReason("");setComplaintScreenshot(null);},3500);
            }} style={bigBtn("linear-gradient(90deg,#ef4444,#dc2626)")}>🚨 Shikoyat yuborish</button>
            <button onClick={()=>{setShowComplaintModal(null);setComplaintText("");setComplaintReason("");}} style={{...bigBtn("#e0f2fe"),color:C.text}}>Bekor qilish</button>
          </div>
        </div>
      )}

      {/* COMPLAINT SUCCESS */}
      {complaintSent && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:80,marginBottom:16,animation:"bounceHeart 0.5s infinite alternate"}}>❤️</div>
            <div style={{fontWeight:900,fontSize:22,color:C.accent,marginBottom:12}}>Rahmat!</div>
            <div style={{fontSize:14,color:C.text,lineHeight:1.6,background:"#fff",borderRadius:20,padding:"20px 24px",maxWidth:320}}>{T.complaintSent}</div>
          </div>
        </div>
      )}

      {/* LANG MODAL */}
      {showLangModal && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowLangModal(false)}>
          <div style={{background:"#fff",borderRadius:24,padding:24,width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:18,textAlign:"center",marginBottom:18}}>🌐 {T.langTitle}</div>
            {Object.entries(LANGS).map(([key,l])=>(
              <div key={key} onClick={()=>{setLang(key);setShowLangModal(false);toast$("Til ozgartirildi!",C.green);}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,marginBottom:8,border:"2px solid "+(lang===key?C.accent:C.border),background:lang===key?"linear-gradient(135deg,#fff0f6,#e0f2fe)":"#f8fafc",cursor:"pointer"}}>
                <div style={{width:44,height:44,borderRadius:12,background:lang===key?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:lang===key?"#fff":C.text,flexShrink:0}}>{l.flag}</div>
                <div style={{flex:1,fontWeight:800,fontSize:14,color:lang===key?C.accent:C.text}}>
                  {key==="uz"?"🇺🇿 O'zbek tili (Lotin)":key==="kir"?"🇺🇿 Ўзбек тили (Кирилл)":"🇷🇺 Русский язык"}
                </div>
                {lang===key && <span style={{fontSize:18}}>✅</span>}
              </div>
            ))}
            <button onClick={()=>setShowLangModal(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>{T.cancel}</button>
          </div>
        </div>
      )}

      {/* SURVEY MODAL */}
      {showSurvey && (
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
          {/* Header */}
          {(()=>{
            const isMale = profile?.gender==="erkak";
            const surveyGrad = isMale?"linear-gradient(135deg,#38bdf8,#22c55e)":"linear-gradient(135deg,#ff6eb4,#f472b6)";
            const surveyAccent = isMale?C.sky:C.accent;
            const surveyLight = isMale?"#f0f9ff":"#fff0f6";
            const surveyBorder = isMale?"#bae6fd":"#fbcfe8";
            const surveyBtn = isMale?"linear-gradient(90deg,#38bdf8,#22c55e)":"linear-gradient(90deg,#ff6eb4,#f472b6)";
            return null;
          })()}
          <div style={{background:profile?.gender==="erkak"?"linear-gradient(135deg,#38bdf8,#22c55e)":"linear-gradient(135deg,#ff6eb4,#f472b6)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button onClick={()=>{setShowSurvey(false);setSurveyStep(0);setSurveyAnswers({});setSurveyDone(false);setSurveyStarted(false);}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>📋 So'rovnoma</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,fontWeight:700}}>{surveyDone?"✅ Tugadi":(surveyStep+1)+"/"+SURVEY.length}</div>
          </div>

          {!surveyDone ? (
            <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>

              {/* INTRO SCREEN */}
              {!surveyStarted ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",textAlign:"center"}}>
                  <div style={{fontSize:70,marginBottom:16}}>📋</div>
                  <div style={{fontWeight:900,fontSize:22,color:C.text,marginBottom:14}}>So'rovnoma</div>
                  <div style={{background:"#fff",borderRadius:20,padding:"22px 20px",border:"1px solid "+C.border,boxShadow:"0 4px 20px rgba(56,189,248,0.1)",marginBottom:20,textAlign:"left"}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:14}}>
                      <span style={{fontSize:24,flexShrink:0}}>🤝</span>
                      <div style={{fontSize:15,fontWeight:800,color:C.text,lineHeight:1.5}}>Hurmatli foydalanuvchi!</div>
                    </div>
                    <div style={{fontSize:14,color:C.text,lineHeight:1.8,marginBottom:14}}>
                      Barcha savollarga iloji boricha <b>samimiy javob bering</b>.
                    </div>
                    <div style={{background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",borderRadius:14,padding:"12px 14px",marginBottom:12,border:"1px solid #bae6fd"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:20}}>🔒</span>
                        <div style={{fontSize:13,color:"#0369a1",lineHeight:1.5}}>Sizning <b>shaxsiy ma'lumotlaringiz va javoblaringiz hech kimga ko'rinmaydi</b> — bu faqat statistika va qulaylik uchun.</div>
                      </div>
                    </div>
                    <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:14,padding:"12px 14px",border:"1px solid #86efac"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:20}}>🎁</span>
                        <div style={{fontSize:13,color:"#15803d",lineHeight:1.5}}><b>Javoblar qanchalik samimiy bo'lsa — mukofotlar shunchalik ko'p bo'ladi!</b></div>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>setSurveyStarted(true)} style={{width:"100%",background:"linear-gradient(135deg,#38bdf8,#6366f1)",border:"none",borderRadius:16,padding:"16px",color:"#fff",fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:"0 6px 20px rgba(56,189,248,0.35)"}}>
                    Boshladikmi ▶️
                  </button>
                </div>
              ) : (
                <>
                  {(()=>{
                    const male = profile?.gender==="erkak";
                    const sGrad = male?"linear-gradient(135deg,#38bdf8,#22c55e)":"linear-gradient(135deg,#ff6eb4,#f472b6)";
                    const sAccent = male?C.sky:C.accent;
                    const sLight = male?"#f0f9ff":"#fff0f6";
                    const sBorder = male?"#bae6fd":"#fbcfe8";
                    const sGlow = male?"rgba(56,189,248,0.25)":"rgba(255,110,180,0.25)";
                    const sBarBg = male?"#e0f2fe":"#fce7f3";
                    return (
                      <>
                        {/* Progress bar */}
                        <div style={{background:sBarBg,borderRadius:10,height:8,marginBottom:8,overflow:"hidden"}}>
                          <div style={{height:"100%",background:sGrad,borderRadius:10,width:((surveyStep+1)/SURVEY.length*100)+"%",transition:"width 0.4s"}}/>
                        </div>
                        <div style={{textAlign:"right",fontSize:11,color:C.muted,marginBottom:16}}>{surveyStep+1} / {SURVEY.length} savol</div>

                        {/* Question card */}
                        <div style={{background:sLight,borderRadius:20,padding:20,marginBottom:16,border:"2px solid "+sBorder,boxShadow:"0 4px 16px "+sGlow}}>
                          <div style={{fontSize:12,color:sAccent,fontWeight:700,marginBottom:8}}>Savol {surveyStep+1}</div>
                          <div style={{fontSize:16,fontWeight:800,color:C.text,lineHeight:1.5}}>{SURVEY[surveyStep].q}</div>
                        </div>

                        {/* Options */}
                        <div style={{display:"flex",flexDirection:"column",gap:10}}>
                          {SURVEY[surveyStep].opts.map((opt,i)=>{
                            const selected = surveyAnswers[SURVEY[surveyStep].id]===opt;
                            return (
                              <div key={i} onClick={()=>setSurveyAnswers(p=>({...p,[SURVEY[surveyStep].id]:opt}))}
                                style={{background:selected?sGrad:"#fff",borderRadius:14,padding:"14px 18px",border:"2px solid "+(selected?sAccent:sBorder),cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxShadow:selected?"0 4px 14px "+sGlow:"0 2px 8px rgba(0,0,0,0.04)",transition:"all 0.2s"}}>
                                <div style={{width:24,height:24,borderRadius:"50%",border:"2px solid "+(selected?"#fff":sAccent+"66"),background:selected?"rgba(255,255,255,0.3)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                  {selected && <div style={{width:10,height:10,borderRadius:"50%",background:"#fff"}}/>}
                                </div>
                                <span style={{fontSize:14,fontWeight:selected?700:400,color:selected?"#fff":C.text}}>{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Buttons */}
                        <div style={{marginTop:20}}>
                          {surveyAnswers[SURVEY[surveyStep].id] && (
                            <button onClick={()=>{
                              if(surveyStep < SURVEY.length-1){ setSurveyStep(p=>p+1); }
                              else { setSurveyDone(true); setCoins(p=>p+100); toast$("🎉 +100 🪙 bonus! Rahmat!",C.green); }
                            }} style={{width:"100%",background:sGrad,border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 4px 14px "+sGlow}}>
                              {surveyStep < SURVEY.length-1 ? "Keyingi savol →" : "✅ Yakunlash va bonus olish"}
                            </button>
                          )}
                          {surveyStep > 0 && (
                            <button onClick={()=>setSurveyStep(p=>p-1)} style={{width:"100%",background:sBarBg,border:"none",borderRadius:14,padding:"12px",color:C.text,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:8}}>
                              ← Oldingi savol
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          ) : (
            /* Done screen */
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
              <div style={{fontSize:90,marginBottom:16}}>🎉</div>
              <div style={{fontWeight:900,fontSize:26,color:C.sky,marginBottom:8}}>Barakalla!</div>
              <div style={{fontSize:15,color:C.text,marginBottom:20,lineHeight:1.6}}>So'rovnomani to'liq bajardingiz!</div>
              <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:20,padding:"20px 30px",marginBottom:24,border:"1px solid #86efac"}}>
                <div style={{fontSize:13,color:"#16a34a",fontWeight:600,marginBottom:4}}>Sizga bonus berildi</div>
                <div style={{fontSize:48,fontWeight:900,color:"#15803d"}}>+100 🪙</div>
                <div style={{fontSize:12,color:"#16a34a",marginTop:4}}>Tangalar hisobingizga qo'shildi</div>
              </div>
              <div style={{background:"#f0f9ff",borderRadius:16,padding:"14px 18px",marginBottom:20,border:"1px solid "+C.border,width:"100%"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>Sizning javoblaringiz saqlandi</div>
                <div style={{fontSize:12,color:C.muted}}>Bu ma'lumotlar sizga mos do'stlar topishda yordam beradi ❤️</div>
              </div>
              <button onClick={()=>{setShowSurvey(false);}} style={{width:"100%",background:"linear-gradient(90deg,#38bdf8,#6366f1)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>
                Yopish
              </button>
            </div>
          )}
        </div>
      )}

      {/* REFERRAL MODAL */}
      {showReferral && (
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column",overflowY:"auto"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setShowReferral(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>🎁 Do'stlarni taklif qil</div>
          </div>

          <div style={{padding:"16px 14px"}}>
            {/* Total earned */}
            <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:20,padding:18,marginBottom:14,border:"1px solid #86efac",textAlign:"center"}}>
              <div style={{fontSize:13,color:"#16a34a",fontWeight:600,marginBottom:6}}>Jami ishlab topilgan</div>
              <div style={{fontSize:44,fontWeight:900,color:"#15803d"}}>🪙 {referralEarned}</div>
              <div style={{fontSize:12,color:"#16a34a",marginTop:4}}>{referralFriends.length} ta do'st taklif qilindi</div>
            </div>

            {/* Referral link */}
            <div style={{background:"#fff",borderRadius:18,padding:16,marginBottom:14,border:"1px solid "+C.border}}>
              <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>Sizning referal havolangiz:</div>
              <div style={{background:"#f0f9ff",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{flex:1,fontSize:13,color:C.text,fontWeight:600,wordBreak:"break-all"}}>https://t.me/lovehub1bot?start={myReferralCode}</div>
                <button onClick={()=>{
                  navigator.clipboard?.writeText("https://t.me/lovehub1bot?start="+myReferralCode);
                  toast$("Havola nusxalandi!",C.green);
                }} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",borderRadius:10,padding:"7px 12px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0}}>
                  📋 Nusxalash
                </button>
              </div>
              <button onClick={()=>{
                navigator.share?.({title:"Love Hub",text:"Love Hubga qoshing!",url:"https://t.me/lovehub1bot?start="+myReferralCode});
                toast$("Ulashildi!",C.green);
              }} style={{width:"100%",background:"linear-gradient(90deg,#22c55e,#16a34a)",border:"none",borderRadius:13,padding:"12px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>
                📤 Ulashish
              </button>
            </div>

            {/* Bonus tizimi */}
            <div style={{background:"#fff",borderRadius:18,padding:16,marginBottom:14,border:"1px solid "+C.border}}>
              <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>💰 Bonus tizimi:</div>
              {[
                {icon:"✅",title:"Do'st ro'yxatdan o'tganda",amount:"+20 🪙",color:"#22c55e",sub:"Referal havola orqali kirib ro'yxatdan o'tsa"},
                {icon:"🔥",title:"Do'st 10+ kun faol bo'lsa",amount:"+100 🪙",color:"#f59e0b",sub:"Har kuni 10 daqiqadan ko'p foydalansa (10 kundan so'ng)"},
                {icon:"👥",title:"Ko'proq do'st = ko'proq bonus",amount:"♾️",color:C.accent,sub:"Taklif soni cheklanmagan!"},
              ].map((b,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 0",borderBottom:i<2?"1px solid "+C.border:"none"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:b.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{b.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text}}>{b.title}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{b.sub}</div>
                  </div>
                  <div style={{fontWeight:900,fontSize:14,color:b.color,flexShrink:0}}>{b.amount}</div>
                </div>
              ))}
            </div>

            {/* Friends list */}
            {referralFriends.length > 0 && (
              <div style={{background:"#fff",borderRadius:18,padding:16,marginBottom:14,border:"1px solid "+C.border}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>👥 Taklif qilingan do'stlar:</div>
                {(showAllFriends ? referralFriends : referralFriends.slice(0,3)).map((f,i,arr)=>(
                  <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<arr.length-1?"1px solid "+C.border:"none"}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"2px solid "+C.border}}>{f.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{f.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>Qo'shilgan: {f.joined}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                        {f.days>=10
                          ? <span style={{background:"#dcfce7",color:"#15803d",borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:700}}>🔥 {f.days} kun faol</span>
                          : <span style={{background:"#fef3c7",color:"#92400e",borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:700}}>⏳ {f.days} kun ({10-f.days} kun qoldi)</span>
                        }
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:900,fontSize:15,color:C.green}}>+{f.bonus}</div>
                      <div style={{fontSize:10,color:C.muted}}>🪙 bonus</div>
                    </div>
                  </div>
                ))}
                {referralFriends.length > 3 && !showAllFriends && (
                  <button onClick={()=>setShowAllFriends(true)} style={{width:"100%",background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",border:"1px solid "+C.border,borderRadius:12,padding:"11px",color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:8}}>
                    Qolgan {referralFriends.length-3} ta do'stni ko'rish ›
                  </button>
                )}
                {showAllFriends && referralFriends.length > 3 && (
                  <button onClick={()=>setShowAllFriends(false)} style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"11px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:8}}>
                    Yopish ↑
                  </button>
                )}
              </div>
            )}

            {referralFriends.length === 0 && (
              <div style={{textAlign:"center",padding:"30px 20px",color:C.muted}}>
                <div style={{fontSize:50,marginBottom:10}}>👥</div>
                <div style={{fontSize:14,fontWeight:600}}>Hali taklif qilinmagan</div>
                <div style={{fontSize:12,marginTop:4}}>Havolani ulashing va bonus oling!</div>
              </div>
            )}

            {/* CHAMPIONS */}
            <div style={{background:"#fff",borderRadius:18,padding:16,marginBottom:20,border:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:24}}>🏆</span>
                <div style={{fontWeight:900,fontSize:16}}>Taklif qilish boyicha Chempionlar</div>
              </div>

              {(showAllChamps ? CHAMPIONS : CHAMPIONS.slice(0,5)).map((c,i)=>{
                const isTop3 = c.rank <= 3;
                const medal = c.rank===1?"🥇":c.rank===2?"🥈":c.rank===3?"🥉":null;
                const badge = isTop3 ? "💎" : "🌟";
                const bgColor = c.rank===1?"linear-gradient(135deg,#fef3c7,#fde68a)":c.rank===2?"linear-gradient(135deg,#f1f5f9,#e2e8f0)":c.rank===3?"linear-gradient(135deg,#fff7ed,#fed7aa)":"#f8fafc";
                const borderColor = c.rank===1?"#fbbf24":c.rank===2?"#94a3b8":c.rank===3?"#fb923c":C.border;
                return (
                  <div key={c.rank} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:14,marginBottom:6,background:bgColor,border:"1px solid "+borderColor}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:isTop3?"rgba(255,255,255,0.6)":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:isTop3?18:13,flexShrink:0,border:"1px solid "+borderColor}}>
                      {medal||c.rank}
                    </div>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:"1px solid "+C.border}}>{c.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:4}}>
                        <span>{badge}</span>
                        <span>{c.name}</span>
                      </div>
                      <div style={{fontSize:11,color:C.muted,marginTop:1}}>{c.count} ta do'st taklif qildi</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontWeight:900,fontSize:13,color:C.green}}>🪙 {c.earned}</div>
                      <div style={{fontSize:10,color:C.muted}}>bonus</div>
                    </div>
                  </div>
                );
              })}

              {!showAllChamps && (
                <button onClick={()=>setShowAllChamps(true)} style={{width:"100%",background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",border:"1px solid "+C.border,borderRadius:12,padding:"11px",color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:4}}>
                  Qolgan {CHAMPIONS.length-5} ta chempionni korish ›
                </button>
              )}
              {showAllChamps && (
                <button onClick={()=>setShowAllChamps(false)} style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"11px",color:C.muted,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:4}}>
                  Yopish ↑
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BAD WORD WARNING */}
      {showBadWordWarn && (
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:9999,width:"90%",maxWidth:380}}>
          <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:18,padding:"16px 20px",boxShadow:"0 8px 32px rgba(239,68,68,0.4)",border:"2px solid #ef4444",display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:28,flexShrink:0}}>⚠️</span>
            <div>
              <div style={{fontWeight:900,fontSize:14,color:"#ef4444",marginBottom:4}}>Haqoratli so'z ishlatildi!</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",lineHeight:1.5}}>Iltimos, <b style={{color:"#fbbf24"}}>chiroyli gaplashing</b> va bu so'zni boshqa ishlatmang! Xabaringiz yuborilmadi va so'z o'chirildi. 🙏</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB HINT MODAL */}
      {tabHint && TAB_HINTS[tabHint] && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:888,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:26,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            {/* Icon */}
            <div style={{width:70,height:70,borderRadius:20,background:"linear-gradient(135deg,"+TAB_HINTS[tabHint].color+"33,"+TAB_HINTS[tabHint].color+"11)",border:"2px solid "+TAB_HINTS[tabHint].color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 14px"}}>
              {TAB_HINTS[tabHint].icon}
            </div>
            {/* Title */}
            <div style={{fontWeight:900,fontSize:20,color:C.text,textAlign:"center",marginBottom:12}}>
              {TAB_HINTS[tabHint].title}
            </div>
            {/* Description */}
            <div style={{fontSize:14,color:C.text,lineHeight:1.7,background:"linear-gradient(135deg,#f8fafc,#f0f9ff)",borderRadius:16,padding:"14px 16px",marginBottom:20,border:"1px solid "+C.border}}>
              {TAB_HINTS[tabHint].desc}
            </div>
            {/* OK button */}
            <button onClick={()=>{
              setSeenTabs(p=>({...p,[tabHint]:true}));
              setTabHint(null);
            }} style={{width:"100%",background:"linear-gradient(135deg,"+TAB_HINTS[tabHint].color+","+TAB_HINTS[tabHint].color+"cc)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer",boxShadow:"0 4px 16px "+TAB_HINTS[tabHint].color+"44"}}>
              Okey 👍
            </button>
          </div>
        </div>
      )}

      {/* BETA NOTICE MODAL */}
      {showBetaNotice&&(
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:24,padding:26,width:"100%",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(255,110,180,0.3)"}}>
            <div style={{fontSize:60,marginBottom:12}}>🚀</div>
            <div style={{fontWeight:900,fontSize:20,color:C.text,marginBottom:8}}>Sinov rejimi</div>
            <div style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:16,padding:"16px 18px",marginBottom:16,border:"1px solid "+C.border,textAlign:"left"}}>
              <div style={{fontSize:14,color:C.text,lineHeight:1.7}}>
                ⚡ <b>Love Hub</b> hozirda <b>sinov rejimida</b> ishlayapti.<br/><br/>
                🎁 Barcha <b>bonus va mukofotlar</b> tez orada real hayotga ko'chib, sizga berilа boshlaydi.<br/><br/>
                😊 Hozircha shunchaki <b>foydalaning va zavqlaning!</b>
              </div>
            </div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Savol va takliflar: @lovehub_support</div>
            <button onClick={()=>setShowBetaNotice(false)} style={{width:"100%",background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer"}}>
              Tushunarli, davom etaman! 🎉
            </button>
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
            <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:16,padding:14,marginBottom:16,border:"1px solid rgba(251,191,36,0.2)"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:4}}>Joriy hisobingiz</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:32}}>🪙</span><span style={{fontSize:36,fontWeight:900,color:"#fbbf24"}}>{coins}</span><span style={{fontSize:14,color:"rgba(255,255,255,0.4)"}}>tanga</span></div>
            </div>
            <div style={{fontSize:13,color:C.muted,marginBottom:12,lineHeight:1.5}}>Qanchalik ko'p sotib olsangiz, narx deyarli bir xil — bu sizga qulaylik uchun!</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {a:80,   price:"3$",   usd:3,   col:"#38bdf8", badge:"",           desc:"Boshlang'ich paket"},
                {a:250,  price:"9.99$",usd:9.99,col:"#ff6eb4", badge:"🔥 Ommabop", desc:"Eng ko'p tanlanadi"},
                {a:700,  price:"25$",  usd:25,  col:"#a78bfa", badge:"💎 Foydali",  desc:"Tejamkorlik paketi"},
                {a:1500, price:"50$",  usd:50,  col:"#f59e0b", badge:"👑 Elite",    desc:"Eng katta paket"},
              ].map((pkg,i)=>(
                <div key={i} style={{background:"#fff",borderRadius:18,padding:16,border:"2px solid "+pkg.col+"44",position:"relative",overflow:"hidden"}}>
                  {pkg.badge&&<div style={{position:"absolute",top:10,right:10,background:pkg.col,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{pkg.badge}</div>}
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:52,height:52,borderRadius:14,background:pkg.col+"18",border:"2px solid "+pkg.col+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🪙</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900,fontSize:22,color:C.text}}>{pkg.a.toLocaleString()} tanga</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{pkg.desc}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                    <div>
                      <div style={{fontSize:22,fontWeight:900,color:pkg.col}}>{pkg.price}</div>
                      <div style={{fontSize:10,color:C.muted}}>≈ {(pkg.usd/pkg.a*100).toFixed(1)} cent / tanga</div>
                    </div>
                    <button onClick={()=>{setShowBetaNotice(true);}} style={{background:"linear-gradient(90deg,"+pkg.col+","+pkg.col+"cc)",border:"none",borderRadius:14,padding:"12px 22px",color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px "+pkg.col+"44"}}>
                      Tez orada
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:14,background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"14px 16px",border:"1px solid "+C.border}}>
              <div style={{fontSize:13,color:C.text,fontWeight:700,marginBottom:4}}>🚀 Sinov rejimi haqida</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Love Hub hozirda sinov rejimida. Barcha bonus va mukofotlar tez orada real hayotga ko'chib sizga berilа boshlaydi. Hozircha shunchaki foydalaning va zavqlaning! 😊</div>
            </div>
          </div>
        </div>
      )}

      {/* APP MENU */}
      {showAppMenu && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",zIndex:600,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:60}} onClick={()=>setShowAppMenu(false)}>
          <div style={{background:"#fff",borderRadius:20,width:"88%",maxWidth:380,overflow:"hidden",boxShadow:"0 8px 40px rgba(255,110,180,0.2)"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",padding:"18px 20px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:34}}>💕</div>
              <div><div style={{fontWeight:900,fontSize:18,color:"#fff"}}>Love Hub</div><div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>Tanishuvlar platformasi</div></div>
              <button onClick={()=>setShowAppMenu(false)} style={{marginLeft:"auto",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:30,height:30,color:"#fff",fontSize:16,cursor:"pointer"}}>✕</button>
            </div>
            {[
              {icon:"👤",label:T.myProfile,sub:profile?profile.name+", "+profile.age+" yosh":"Profilni toldiryng",action:()=>{setShowAppMenu(false);setTab("profile");},hi:true},
              {icon:"📝",label:"Shaxsiy malumotlar",sub:"Ism, yosh, shahar va boshqalar",action:()=>{setShowAppMenu(false);setTab("profile");if(profile)setProfile(null);}},
              {icon:"⚙️",label:T.settingsTitle,sub:"Til: "+LANGS[lang].flag,action:()=>{setShowAppMenu(false);setShowLangModal(true);}},
              {icon:"🎧",label:T.support,sub:"Yordam va savollar",action:()=>{setShowAppMenu(false);toast$("Operatorga ulanmoqda...",C.sky);}},
              {icon:"💡",label:T.suggestion,sub:"Fikr va takliflaringizni yuboring",action:()=>{setShowAppMenu(false);toast$("Rahmat! 🙏",C.green);}},
              {icon:"📋",label:T.terms,sub:"Qoidalar va maxfiylik siyosati",action:()=>{setShowAppMenu(false);toast$("Tez orada!",C.muted);}},
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

      {/* USER DETAIL */}
      {showUserDetail && (
        <div style={{...ov,zIndex:400}} onClick={()=>setShowUserDetail(null)}>
          <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            {(()=>{
              const all=[showUserDetail.demoPhoto,...(showUserDetail.extraPhotos||[])].filter(Boolean);
              const idx=detailPhotoIdx%Math.max(all.length,1);
              return all.length>0?(
                <div style={{position:"relative",height:260,overflow:"hidden"}}>
                  <img src={all[idx]} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  {all.length>1&&(
                    <>
                      {idx>0&&<button onClick={e=>{e.stopPropagation();setDetailPhotoIdx(p=>p-1);}} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.4)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:18,cursor:"pointer"}}>‹</button>}
                      {idx<all.length-1&&<button onClick={e=>{e.stopPropagation();setDetailPhotoIdx(p=>p+1);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.4)",border:"none",borderRadius:"50%",width:32,height:32,color:"#fff",fontSize:18,cursor:"pointer"}}>›</button>}
                      <div style={{position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:5}}>
                        {all.map((_,i)=><div key={i} style={{width:i===idx?18:6,height:6,borderRadius:3,background:"#fff",opacity:i===idx?1:0.55,cursor:"pointer"}} onClick={()=>setDetailPhotoIdx(i)}/>)}
                      </div>
                      <div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.45)",borderRadius:12,padding:"3px 10px",fontSize:11,color:"#fff"}}>📷 {idx+1}/{all.length}</div>
                    </>
                  )}
                </div>
              ):null;
            })()}
            <div style={{padding:"14px 18px 10px"}}>
              <div style={{fontSize:22,fontWeight:900}}>{showUserDetail.name}, {showUserDetail.age}</div>
              <div style={{fontSize:13,color:C.muted,marginTop:2}}>📍 {showUserDetail.city}</div>
              {showUserDetail.bio&&<div style={{marginTop:10,background:"#f8fafc",borderRadius:12,padding:"10px 13px",fontSize:13,lineHeight:1.5}}>{showUserDetail.bio}</div>}
              <div style={{marginTop:8}}><Stars r={showUserDetail.rating||4.5}/></div>
            </div>
            <div style={{height:1,background:C.border,margin:"0 18px"}}/>
            <div style={{padding:"8px 18px"}}>
              {[
                {icon:"⚧",label:"Jins",val:showUserDetail.gender==="ayol"?"Ayol":"Erkak"},
                {icon:"💼",label:"Kasbi",val:showUserDetail.kasb||"—"},
                {icon:"🌍",label:"Millat",val:showUserDetail.millat||"—"},
                {icon:"💍",label:"Turmush",val:showUserDetail.married==="ha"?"Ha, bolgan":"Yoq"},
                {icon:"👶",label:"Farzand",val:showUserDetail.children==="ha"?"Ha, bor":"Yoq"},
              ].map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border}}>
                  <span style={{fontSize:17,width:22}}>{r.icon}</span>
                  <span style={{fontSize:12,color:C.muted,width:66}}>{r.label}</span>
                  <span style={{fontSize:13,fontWeight:600}}>{r.val}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,padding:"12px 18px 24px"}}>
              <button onClick={()=>{dislike();setShowUserDetail(null);}} style={{flex:1,background:"#f1f5f9",border:"none",borderRadius:14,padding:"12px",fontSize:18,cursor:"pointer",fontWeight:700}}>✕ Inkor</button>
              <button onClick={()=>{setGiftModal(showUserDetail);setGiftNote("");setShowUserDetail(null);}} style={{flex:1,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",borderRadius:14,padding:"12px",color:"#fff",fontSize:18,cursor:"pointer",fontWeight:700}}>🎁 Sovga</button>
              <button onClick={()=>{like(showUserDetail.id);setShowUserDetail(null);}} style={{flex:1,background:"linear-gradient(135deg,#ff6eb4,#f472b6)",border:"none",borderRadius:14,padding:"12px",color:"#fff",fontSize:18,cursor:"pointer",fontWeight:700}}>❤️ Dost</button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT */}
      {chat && chatUser && (
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
              <div style={{fontWeight:800,fontSize:15}}>{chatUser.name} {chatUser.vip&&"👑"}</div>
              <div style={{fontSize:11,color:chatUser.online?C.green:C.muted}}>{chatUser.online?T.online:"Oflayn"}</div>
            </div>
            <button onClick={()=>{if(!vip){toast$("VIP kerak!",C.gold);return;}setVideoCall(chatUser);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",opacity:vip?1:0.4}}>📹</button>
            <button onClick={()=>{setGiftModal(chatUser);setGiftNote("");}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>🎁</button>
            <button onClick={()=>setShowBlockModal(chatUser)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>🚫</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"10px 10px",display:"flex",flexDirection:"column",gap:6,background:"#e5ddd5"}}>
            {(msgs[chat]||[]).map((m,i)=>{
              const isMe=m.from==="me";
              const base={alignSelf:isMe?"flex-end":"flex-start",maxWidth:"80%",borderRadius:isMe?"18px 4px 18px 18px":"4px 18px 18px 18px"};
              const bg={background:isMe?"#dcf8c6":"#fff",border:"none",padding:"8px 12px",color:"#000",boxShadow:"0 1px 2px rgba(0,0,0,0.13)"};
              const timeEl=<div style={{fontSize:10,color:"rgba(0,0,0,0.4)",marginTop:2,textAlign:isMe?"right":"left"}}>{m.time}</div>;
              if(m.gif) return <div key={i} style={{...base,overflow:"hidden"}}><img src={m.gif} style={{width:"100%",maxWidth:200,borderRadius:"inherit",display:"block"}}/><div style={{...bg,padding:"4px 10px"}}>{timeEl}</div></div>;
              if(m.type==="photo") return <div key={i} style={{...base,overflow:"hidden"}}><img src={m.payload?.url} alt="" style={{width:"100%",maxWidth:220,borderRadius:14,display:"block"}}/><div style={{...bg,padding:"4px 8px"}}>{timeEl}</div></div>;
              if(m.type==="music") return <div key={i} style={{...base,...bg}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>🎵</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700}}>{m.payload?.name}</div><audio src={m.payload?.url} controls style={{width:"100%",height:28}}/></div></div>{timeEl}</div>;
              if(m.type==="file") return <div key={i} style={{...base,...bg}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>📄</span><div><div style={{fontSize:11,fontWeight:700}}>{m.payload?.name}</div><div style={{fontSize:10,opacity:.7}}>{m.payload?.size}</div></div></div>{timeEl}</div>;
              if(m.type==="location") return <div key={i} style={{...base,overflow:"hidden"}}><div style={{background:"linear-gradient(135deg,#34d399,#10b981)",padding:"12px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:28}}>📍</span><div style={{color:"#fff",fontWeight:700,fontSize:13}}>Joylashuv ulashildi</div></div><div style={{...bg,padding:"4px 12px"}}>{timeEl}</div></div>;
              return <div key={i} style={{...base,...bg,fontSize:m.sticker?36:14}}>{m.text}{timeEl}</div>;
            })}
            <div ref={endRef}/>
          </div>
          {/* EMOJI PANEL - always below input, Telegram style */}
          {stickers&&(
            <div style={{background:"#f2f2f7",borderTop:"1px solid #ddd",flexShrink:0}}>
              {/* Tabs */}
              <div style={{display:"flex",background:"#f2f2f7",borderBottom:"1px solid #e0e0e0",padding:"0 8px"}}>
                {[{k:"emoji",i:"😊"},{k:"gif",i:"GIF"}].map(t=>(
                  <button key={t.k} onClick={()=>setStickerTab(t.k)} style={{padding:"8px 16px",background:"none",border:"none",borderBottom:stickerTab===t.k?"2px solid #007aff":"2px solid transparent",cursor:"pointer",fontSize:13,fontWeight:stickerTab===t.k?600:400,color:stickerTab===t.k?"#007aff":"#8e8e93"}}>
                    {t.i}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div style={{height:200,overflowY:"auto",padding:"6px 4px"}}>
                {stickerTab==="emoji"&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:0}}>
                    {TG_EMOJI.map((em,i)=>(
                      <div key={i} onClick={()=>setInput(prev=>prev+em)}
                        style={{fontSize:28,cursor:"pointer",padding:"4px",borderRadius:8,lineHeight:1.1,textAlign:"center",width:"11.1%"}}>
                        {em}
                      </div>
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
                    navigator.geolocation?.getCurrentPosition(pos=>{
                      const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                      setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t,type:"location",payload:{lat:pos.coords.latitude,lng:pos.coords.longitude}}]}));
                    },()=>{
                      const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
                      setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{from:"me",time:t,type:"location",payload:{lat:41.2995,lng:69.2401}}]}));
                    });
                    setMediaPanel(false);
                  }},
                  {icon:"🎁",label:"Sovga",color:"#ff6eb4",fn:()=>{setGiftModal(chatUser);setMediaPanel(false);}},
                  {icon:"😊",label:"Smaylik",color:"#f97316",fn:()=>{setStickers(true);setMediaPanel(false);}},
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
          <div style={{background:"#f2f2f7",padding:"8px 10px",display:"flex",gap:8,alignItems:"flex-end",borderTop:"1px solid #ddd",flexShrink:0}}>
            {/* Attach */}
            <button onClick={()=>{setMediaPanel(p=>!p);if(stickers)setStickers(false);}} style={{width:32,height:32,marginBottom:2,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"#8e8e93",flexShrink:0,padding:0}}>
              📎
            </button>
            {/* Input + emoji */}
            <div style={{flex:1,display:"flex",alignItems:"flex-end",background:"#fff",borderRadius:20,paddingLeft:14,paddingRight:6,minHeight:36,maxHeight:120,boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")e.preventDefault();}}
                placeholder="Xabar..."
                style={{flex:1,background:"transparent",border:"none",color:"#000",fontSize:16,outline:"none",padding:"8px 0",fontFamily:"inherit",minWidth:0}}
              />
              <button onClick={()=>{setStickers(p=>!p);setMediaPanel(false);}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",padding:"4px",color:stickers?"#007aff":"#8e8e93",flexShrink:0,lineHeight:1,marginBottom:2}}>
                🙂
              </button>
            </div>
            {/* Send */}
            <button onClick={()=>send(input)} style={{width:34,height:34,marginBottom:1,borderRadius:"50%",background:input.trim()?"#007aff":"#8e8e93",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,transition:"all 0.15s",boxShadow:input.trim()?"0 2px 8px rgba(0,122,255,0.4)":"none"}}>
              <span style={{color:"#fff",fontSize:18,lineHeight:1}}>➤</span>
            </button>
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
            <div style={{display:"flex",gap:10,padding:"10px 14px 4px",overflowX:"auto"}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div onClick={()=>setShowAddStory(true)} style={{width:60,height:60,borderRadius:"50%",border:"3px dashed "+(myStories.length>0?C.accent:C.border),display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#f0f9ff",overflow:"hidden"}}>
                  {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(myStories.length>0?"🧑":"➕")}
                </div>
                <div style={{fontSize:9,color:C.muted,marginTop:3}}>{vip?"VIP":myStories.length+"/2"}</div>
              </div>
              {USERS.filter(u=>!blocked.includes(u.id)).map(u=>(
                <div key={u.id} style={{textAlign:"center",flexShrink:0}}>
                  <div onClick={()=>{setStory({...u,isMyStory:false});setStoryI(0);}} style={{width:60,height:60,borderRadius:"50%",border:"3px solid "+(u.vip?C.gold:C.accent),cursor:"pointer",background:"#fff",overflow:"hidden"}}>
                    {u.demoPhoto?<img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28}}>{u.emoji}</span>}
                  </div>
                  <div style={{fontSize:9,color:C.text,fontWeight:600,marginTop:3,maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"4px 14px 8px"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Viloyat:</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                {["Barchasi",...VILOYATLAR].map(c=><button key={c} onClick={()=>{setCityF(c);setCardI(0);}} style={chipStyle(cityF===c)}>{c==="Barchasi"?"Barchasi":c}</button>)}
              </div>
              {cityF==="Toshkent shahri"&&(
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Tuman:</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {TOSHKENT_TUMANLARI.map(t=><button key={t} onClick={()=>setCardI(0)} style={chipStyle(false)}>{t}</button>)}
                  </div>
                </div>
              )}
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Jins:</div>
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                {[{v:"Barchasi",l:"Barchasi"},{v:"ayol",l:"Ayol"},{v:"erkak",l:"Erkak"}].map(g=><button key={g.v} onClick={()=>{setGenderF(g.v);setCardI(0);}} style={chipStyle(genderF===g.v)}>{g.l}</button>)}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:C.muted}}>Yosh:</span>
                <span style={{fontSize:12,fontWeight:800,color:C.accent}}>{ageF[0]} – {ageF[1]}</span>
              </div>
              <div style={{position:"relative",height:34,marginBottom:2}}>
                <div style={{position:"absolute",top:"50%",left:0,right:0,height:4,background:"#e0f2fe",borderRadius:2,transform:"translateY(-50%)"}}/>
                <div style={{position:"absolute",top:"50%",height:4,background:"linear-gradient(90deg,"+C.accent+","+C.sky+")",borderRadius:2,transform:"translateY(-50%)",left:((ageF[0]-18)/81*100)+"%",right:(100-(ageF[1]-18)/81*100)+"%"}}/>
                <input type="range" min={18} max={99} value={ageF[0]} onChange={e=>{const v=+e.target.value;if(v<ageF[1]-1){setAgeF([v,ageF[1]]);setCardI(0);}}} style={{position:"absolute",width:"100%",top:"50%",transform:"translateY(-50%)",appearance:"none",WebkitAppearance:"none",background:"transparent",outline:"none",zIndex:3}} className="rng"/>
                <input type="range" min={18} max={99} value={ageF[1]} onChange={e=>{const v=+e.target.value;if(v>ageF[0]+1){setAgeF([ageF[0],v]);setCardI(0);}}} style={{position:"absolute",width:"100%",top:"50%",transform:"translateY(-50%)",appearance:"none",WebkitAppearance:"none",background:"transparent",outline:"none",zIndex:3}} className="rng"/>
              </div>
            </div>
            {cur&&(
              <div style={{background:"#fff",borderRadius:24,margin:"0 12px 14px",overflow:"hidden",border:"1px solid "+C.border,boxShadow:"0 8px 32px rgba(56,189,248,0.1)",transition:"transform 0.45s,opacity 0.4s",transform:swipe==="right"?"translateX(130%) rotate(22deg)":swipe==="left"?"translateX(-130%) rotate(-22deg)":"none",opacity:swipe?0:1}}>
                <div style={{height:320,background:"linear-gradient(180deg,#f0f9ff,#fff0f6)",position:"relative",overflow:"hidden"}}>
                  <div onClick={()=>{setShowUserDetail(cur);setDetailPhotoIdx(0);}} style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    {cur.demoPhoto?<img src={cur.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:130}}>{cur.emoji}</div>}
                  </div>
                  {cur.online&&<div style={{position:"absolute",top:14,left:14,background:C.green,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>🟢 Online</div>}
                  <div style={{position:"absolute",top:12,right:12,zIndex:5}}>
                    <button onClick={e=>{e.stopPropagation();setCardMenu(cardMenu===cur.id?null:cur.id);}} style={{width:34,height:34,borderRadius:"50%",background:"rgba(0,0,0,0.4)",border:"none",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>•••</button>
                    {cardMenu===cur.id&&(
                      <div style={{position:"absolute",top:40,right:0,background:"#fff",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",minWidth:170,zIndex:10,overflow:"hidden"}}>
                        <div onClick={e=>{e.stopPropagation();setShowBlockModal(cur);setCardMenu(null);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer"}}>
                          <span style={{fontSize:18}}>🚫</span>
                          <div>
                            <div style={{fontWeight:700,fontSize:13,color:"#ef4444"}}>Bloklash / Shikoyat</div>
                            <div style={{fontSize:10,color:C.muted}}>Bloklash yoki shikoyat</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div onClick={()=>{setShowUserDetail(cur);setDetailPhotoIdx(0);}} style={{position:"absolute",bottom:12,left:16,background:cur.gender==="ayol"?"rgba(255,110,180,0.88)":"rgba(34,197,94,0.88)",borderRadius:20,padding:"6px 16px",fontSize:12,color:"#fff",fontWeight:700,cursor:"pointer",zIndex:3}}>
                    {cur.name} {T.aboutInfo} ✍️
                  </div>
                </div>
                <div style={{padding:"14px 18px 6px"}}>
                  <div style={{fontSize:24,fontWeight:900}}>{cur.name}, {cur.age}</div>
                  <div style={{fontSize:13,color:C.muted,marginTop:4}}>📍 {cur.city}</div>
                </div>
                <div style={{display:"flex",justifyContent:"space-around",padding:"12px 24px 18px",alignItems:"center"}}>
                  <button onClick={dislike} style={{width:58,height:58,borderRadius:"50%",background:"#f1f5f9",border:"none",fontSize:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  <button onClick={()=>{setGiftModal(cur);setGiftNote("");}} style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",fontSize:22,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>🎁</button>
                  <button onClick={()=>like(cur.id)} style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#ff6eb4,#f472b6)",border:"none",fontSize:26,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>❤️</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LICHKA */}
        {tab==="matches"&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:10}}>💞 Matchlar ({matchUsers.length})</div>
            {matchUsers.length===0&&<div style={{color:C.muted,textAlign:"center",padding:40}}>{T.noMatch}</div>}
            {matchUsers.map(u=>(
              <div key={u.id} style={{background:"#fff",borderRadius:16,padding:"10px 12px",marginBottom:8,border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:11}}>
                <div onClick={()=>{setShowUserDetail(u);setDetailPhotoIdx(0);}} style={{position:"relative",width:52,height:52,flexShrink:0,cursor:"pointer"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",border:"2px solid "+C.accent}}>
                    {u.demoPhoto?<img src={u.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:30}}>{u.emoji}</span>}
                  </div>
                  <div style={{width:10,height:10,borderRadius:"50%",background:u.online?C.green:C.muted,position:"absolute",bottom:0,right:0,border:"2px solid #fff"}}/>
                </div>
                <div onClick={()=>setChat(u.id)} style={{flex:1,cursor:"pointer"}}>
                  <div style={{fontWeight:800,fontSize:14}}>{u.name}, {u.age} {u.vip&&"👑"}</div>
                  <div style={{fontSize:12,color:C.muted}}>{(msgs[u.id]||[]).slice(-1)[0]?.text||T.writeMsg}</div>
                  <Stars r={u.rating||4.5}/>
                </div>
                <button onClick={e=>{e.stopPropagation();setShowBlockModal(u);}} style={{background:"#fff5f5",border:"none",borderRadius:8,padding:"4px 8px",fontSize:13,cursor:"pointer"}}>🚫</button>
              </div>
            ))}
          </div>
        )}

        {/* GO */}
        {tab==="go"&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{background:locationSharing?"linear-gradient(135deg,#f0fdf4,#e0f2fe)":"#fff",borderRadius:18,padding:14,marginBottom:14,border:"2px solid "+(locationSharing?C.green:"#c7d9f0"),boxShadow:"0 4px 16px rgba(56,189,248,0.12)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:locationSharing?10:0}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15,color:locationSharing?C.green:C.text}}>📍 {locationSharing?"Lokatsiya yoqiq":"Yaqin atrofdagilar"}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{locationSharing?nearbyUsers.filter(u=>u.dist<=nearbyRadius).length+" ta, "+(nearbyRadius>=1000?nearbyRadius/1000+"km":nearbyRadius+"m")+" radius":"Lokatsiyani yoqib, atrofingizdagilarni toping"}</div>
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
                            {u.status&&<div style={{fontSize:8,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💬 {u.status}</div>}
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontWeight:900,fontSize:18}}>Uchrashuvlar</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{
                  if(lastInviteTime&&(Date.now()-lastInviteTime)<24*60*60*1000){
                    const r=Math.ceil((24*60*60*1000-(Date.now()-lastInviteTime))/3600000);
                    toast$("⏳ "+r+" soatdan so'ng elon qo'yishingiz mumkin!","#f59e0b");return;
                  }
                  setShowCreateEvent(true);
                }} style={{background:lastInviteTime&&(Date.now()-lastInviteTime)<24*60*60*1000?"#e2e8f0":"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:20,padding:"7px 12px",color:lastInviteTime&&(Date.now()-lastInviteTime)<24*60*60*1000?C.muted:"#fff",fontWeight:800,fontSize:11,cursor:"pointer"}}>➕ Elon Qoshish</button>
                <button onClick={()=>setShowGoFilter(true)} style={{background:"linear-gradient(90deg,#38bdf8,#6366f1)",border:"none",borderRadius:20,padding:"7px 12px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer"}}>🔍 Qidiruv</button>
              </div>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
              {["Barchasi","🎬 Kino","🍽️ Ovqatlanish","🌳 Parkka","🚗 Avtomobilda sayr","💪 GYM zal","🛍️ Shoping","🏊 Suzish","🏠 Mexmonga","📚 Dars qilish","🎥 Syomka"].map(f=><button key={f} onClick={()=>setGoFilter(f)} style={{...chipStyle(goFilter===f),flexShrink:0,whiteSpace:"nowrap"}}>{f}</button>)}
            </div>
            {goInvites.filter(inv=>{
              const typeOk = goFilter==="Barchasi" || inv.type===goFilter;
              const genderOk = goGenderFilter==="barchasi" || inv.audience===goGenderFilter || inv.audience==="barchasi";
              const cityOk = goCityFilter==="Barchasi" || inv.city===goCityFilter || inv.city?.includes(goCityFilter);
              const districtOk = goDistrictFilter==="Barchasi" || !inv.district || inv.district===goDistrictFilter;
              return typeOk && genderOk && cityOk && districtOk;
            }).map(inv=>(
              <div key={inv.id} style={{background:"#fff",borderRadius:18,padding:14,marginBottom:12,border:"1px solid "+C.border}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                  <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",border:"2px solid "+C.accent,flexShrink:0}}>
                    {inv.demoPhoto?<img src={inv.demoPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>👤</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14}}>{inv.name}</div>
                    <div style={{fontSize:11,color:C.muted}}>📍 {inv.city}</div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <div style={{background:C.accent+"18",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:700,color:C.accent}}>{inv.type}</div>
                    {inv.audience!=="barchasi"&&<div style={{background:inv.audience==="ayollar"?"#fce7f3":"#dbeafe",borderRadius:12,padding:"4px 8px",fontSize:11,fontWeight:700,color:inv.audience==="ayollar"?"#ec4899":"#3b82f6"}}>{inv.audience==="ayollar"?"Ayollar":"Erkaklar"}</div>}
                  </div>
                </div>
                <div style={{fontSize:14,marginBottom:10}}>{inv.text}</div>
                {inv.location&&<div style={{fontSize:12,color:C.sky,marginBottom:6}}>📍 {inv.location}</div>}
                {inv.maxPeople&&<div style={{fontSize:11,color:C.muted,marginBottom:6}}>Max: {inv.maxPeople} kishi</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8}}><span style={{fontSize:12,color:C.muted}}>📅 {inv.date}</span><span style={{fontSize:12,color:C.muted}}>🕐 {inv.time}</span></div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setGoInvites(p=>p.map(i=>i.id===inv.id?{...i,likes:i.liked?i.likes-1:i.likes+1,liked:!i.liked}:i))} style={{background:inv.liked?C.accent:"#f0f9ff",border:"1px solid "+(inv.liked?C.accent:C.border),borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:inv.liked?"#fff":C.text}}>❤️ {inv.likes}</button>
                    <button onClick={()=>{setMatches(p=>[...p,inv.userId]);toast$("Taklif qabul qilindi!",C.green);}} style={{background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff"}}>Qoshilish</button>
                  </div>
                </div>
              </div>
            ))}
            {/* GO FILTER MODAL */}
            {showGoFilter&&(
              <div style={{...ov,zIndex:350}} onClick={()=>setShowGoFilter(false)}>
                <div style={mb} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{fontWeight:900,fontSize:18}}>⚙️ Qidiruvni sozlash</div>
                    <button onClick={()=>{setGoGenderFilter("barchasi");setGoCityFilter("Barchasi");setGoDistrictFilter("Barchasi");toast$("Filtrlar tozalandi",C.muted);}} style={{background:"#fee2e2",border:"none",borderRadius:10,padding:"5px 12px",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>Tozalash</button>
                  </div>

                  {/* Jins filtri */}
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:C.text}}>👥 Kim qoygan elonlar:</div>
                    <div style={{display:"flex",gap:8}}>
                      {[{v:"barchasi",l:"🌐 Barchasi"},{v:"ayollar",l:"👩 Faqat ayollar"},{v:"erkaklar",l:"👨 Faqat erkaklar"}].map(g=>(
                        <button key={g.v} onClick={()=>setGoGenderFilter(g.v)} style={{flex:1,padding:"9px 6px",borderRadius:12,border:"2px solid "+(goGenderFilter===g.v?C.accent:C.border),background:goGenderFilter===g.v?C.accent:"#f0f9ff",color:goGenderFilter===g.v?"#fff":C.text,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center"}}>{g.l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Viloyat filtri */}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:C.text}}>📍 Qaysi hudud:</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {["Barchasi",...VILOYATLAR].map(v=>(
                        <button key={v} onClick={()=>{setGoCityFilter(v);setGoDistrictFilter("Barchasi");}} style={{padding:"6px 12px",borderRadius:20,border:"2px solid "+(goCityFilter===v?C.accent:C.border),background:goCityFilter===v?C.accent:"#f0f9ff",color:goCityFilter===v?"#fff":C.text,fontSize:11,fontWeight:goCityFilter===v?700:400,cursor:"pointer",flexShrink:0}}>{v==="Barchasi"?"🌐 Barchasi":v}</button>
                      ))}
                    </div>
                  </div>

                  {/* Toshkent tumanlari */}
                  {goCityFilter==="Toshkent shahri"&&(
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:C.text}}>🏙️ Toshkent tumani:</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {["Barchasi",...TOSHKENT_TUMANLARI].map(t=>(
                          <button key={t} onClick={()=>setGoDistrictFilter(t)} style={{padding:"6px 12px",borderRadius:20,border:"2px solid "+(goDistrictFilter===t?C.sky:C.border),background:goDistrictFilter===t?C.sky:"#f0f9ff",color:goDistrictFilter===t?"#fff":C.text,fontSize:11,fontWeight:goDistrictFilter===t?700:400,cursor:"pointer",flexShrink:0}}>{t==="Barchasi"?"🌐 Barchasi":t}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tanlangan filtrlar */}
                  <div style={{background:"#f0f9ff",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:12,color:C.muted}}>
                    Tanlangan: <b style={{color:C.text}}>{goGenderFilter==="barchasi"?"Barcha jinslar":goGenderFilter==="ayollar"?"Faqat ayollar":"Faqat erkaklar"}</b>
                    {goCityFilter!=="Barchasi"&&<span> · <b style={{color:C.text}}>{goCityFilter}</b></span>}
                    {goDistrictFilter!=="Barchasi"&&<span> · <b style={{color:C.text}}>{goDistrictFilter}</b></span>}
                  </div>

                  <button onClick={()=>setShowGoFilter(false)} style={bigBtn("linear-gradient(90deg,#38bdf8,#6366f1)")}>✅ Qollash</button>
                  <button onClick={()=>setShowGoFilter(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Yopish</button>
                </div>
              </div>
            )}

            {/* CREATE EVENT MODAL */}
            {showCreateEvent&&(
              <div style={{...ov,zIndex:350}} onClick={()=>setShowCreateEvent(false)}>
                <div style={mb} onClick={e=>e.stopPropagation()}>
                  <div style={{fontWeight:900,fontSize:18,marginBottom:4}}>➕ Elon Qoshish</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Uchrashuv yoki taklif eloni joylashtiring</div>

                  {/* Elon nomi */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>📌 Elon nomi:</label>
                    <input value={eventForm.title} onChange={e=>setEventForm(p=>({...p,title:e.target.value}))} placeholder="Masalan: Kinoga birga boramiz!" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"10px 12px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontWeight:600}}/>
                  </div>

                  {/* Tur */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6,fontWeight:600}}>Turi:</label>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["🎬 Kino","🍽️ Ovqatlanish","🌳 Parkka","🚗 Avtomobilda sayr","💪 GYM zal","🛍️ Shoping","🏊 Suzish","🏠 Mexmonga","📚 Dars qilish","🎥 Syomka"].map(t=>(
                        <button key={t} onClick={()=>setEventForm(p=>({...p,type:t}))} style={{padding:"6px 12px",borderRadius:20,border:"2px solid "+(eventForm.type===t?C.accent:C.border),background:eventForm.type===t?C.accent:"#f0f9ff",color:eventForm.type===t?"#fff":C.text,fontSize:11,fontWeight:eventForm.type===t?700:400,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Kimlar uchun */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6,fontWeight:600}}>Kimlar korsin?</label>
                    <div style={{display:"flex",gap:8}}>
                      {[{v:"barchasi",l:"Barchasi",c:C.sky},{v:"ayollar",l:"Ayollar",c:"#ec4899"},{v:"erkaklar",l:"Erkaklar",c:"#3b82f6"}].map(a=>(
                        <button key={a.v} onClick={()=>setEventForm(p=>({...p,audience:a.v}))} style={{flex:1,padding:"8px",borderRadius:11,border:"2px solid "+(eventForm.audience===a.v?a.c:C.border),background:eventForm.audience===a.v?a.c:"#f0f9ff",color:eventForm.audience===a.v?"#fff":C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>{a.l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tavsif */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>Tavsif:</label>
                    <textarea value={eventForm.desc} onChange={e=>setEventForm(p=>({...p,desc:e.target.value}))} placeholder="Elon haqida batafsil yozing..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",minHeight:80,resize:"none",fontFamily:"inherit"}}/>
                  </div>

                  {/* Joylashuv */}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5,fontWeight:600}}>📍 Joylashuv:</label>
                    <input value={eventForm.location} onChange={e=>setEventForm(p=>({...p,location:e.target.value}))} placeholder="Masalan: Toshkent, Safo restoran" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>

                  {/* Sana, Vaqt, Max kishilar */}
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    <div style={{flex:1}}>
                      <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>📅 Sana:</label>
                      <input value={eventForm.date} onChange={e=>setEventForm(p=>({...p,date:e.target.value}))} placeholder="Bugun" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{flex:1}}>
                      <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>🕐 Vaqt:</label>
                      <input value={eventForm.time} onChange={e=>setEventForm(p=>({...p,time:e.target.value}))} placeholder="19:00" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <div style={{flex:1}}>
                      <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Max kishi:</label>
                      <input value={eventForm.maxPeople} onChange={e=>setEventForm(p=>({...p,maxPeople:e.target.value}))} placeholder="10" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  </div>

                  {/* Taqiqlangan */}
                  <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"9px 12px",marginBottom:12,fontSize:11,color:"#dc2626"}}>
                    Taqiqlangan: dacha, tog, uy, mehmonxona takliflari darhol ochiriladi
                  </div>

                  <button onClick={()=>{
                    if(!eventForm.title.trim()){toast$("Elon nomini kiriting!","#ef4444");return;}
                    if(!eventForm.desc.trim()){toast$("Tavsif yozing!","#ef4444");return;}
                    if(BANNED.some(w=>eventForm.desc.toLowerCase().includes(w)||eventForm.title.toLowerCase().includes(w))){toast$("Bu elon taqiqlangan!","#ef4444");return;}
                    const {hasBad:hasBadEv} = filterBadWords(eventForm.title+" "+eventForm.desc);
                    if(hasBadEv){toast$("⚠️ Haqoratli so'z ishlatildi! Iltimos chiroyli gaplashing!","#ef4444");return;}
                    const now2 = Date.now();
                    if(lastInviteTime && (now2 - lastInviteTime) < 24*60*60*1000){
                      const rem2 = Math.ceil((24*60*60*1000-(now2-lastInviteTime))/3600000);
                      toast$("⏳ Keyingi elon uchun "+rem2+" soat kutish kerak!","#ef4444");return;
                    }
                    const newEv = {id:now2,userId:"me",name:profile?.name||"Men",demoPhoto:profilePhoto||null,type:eventForm.type,text:eventForm.title+(eventForm.desc?" — "+eventForm.desc:""),city:eventForm.location||profile?.city||"Toshkent",time:eventForm.time||"—",date:eventForm.date||"—",audience:eventForm.audience,maxPeople:eventForm.maxPeople||null,likes:0,mine:true,isEvent:true};
                    setGoInvites(p=>[newEv,...p]);
                    setLastInviteTime(now2);
                    setShowCreateEvent(false);
                    setEventForm({title:"",type:"🎬 Kino",desc:"",date:"",time:"",location:"",audience:"barchasi",maxPeople:""});
                    toast$("Elon joylashtirildi!",C.green);
                  }} style={bigBtn("linear-gradient(90deg,#6366f1,#8b5cf6)")}>➕ Elon Qoshish</button>
                  <button onClick={()=>setShowCreateEvent(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Bekor qilish</button>
                </div>
              </div>
            )}

            {showAddInvite&&(
              <div style={{...ov,zIndex:350}} onClick={()=>setShowAddInvite(false)}>
                <div style={mb} onClick={e=>e.stopPropagation()}>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:14}}>Yangi taklif</div>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Taklif turi:</label>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["🎬 Kino","☕ Tushlik","🌳 Sayr","🎭 Kongilochar","🎾 Sport","🎨 Sanat"].map(t=><button key={t} onClick={()=>setNewInvite(p=>({...p,type:t}))} style={chipStyle(newInvite.type===t)}>{t}</button>)}
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Kimlar korsin?</label>
                    <div style={{display:"flex",gap:8}}>
                      {[{v:"barchasi",l:"Barchasi",c:C.sky},{v:"ayollar",l:"Ayollar",c:"#ec4899"},{v:"erkaklar",l:"Erkaklar",c:"#3b82f6"}].map(a=><button key={a.v} onClick={()=>setNewInvite(p=>({...p,audience:a.v}))} style={{flex:1,padding:"7px",borderRadius:10,border:"2px solid "+(newInvite.audience===a.v?a.c:C.border),background:newInvite.audience===a.v?a.c:"#f0f9ff",color:newInvite.audience===a.v?"#fff":C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>{a.l}</button>)}
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>Taklif matni:</label>
                    <textarea value={newInvite.text} onChange={e=>setNewInvite(p=>({...p,text:e.target.value}))} placeholder="Kinoga borishni xohlaysizmi? 🍿" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:12,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",minHeight:70,resize:"none",fontFamily:"inherit"}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Sana:</label><input value={newInvite.date} onChange={e=>setNewInvite(p=>({...p,date:e.target.value}))} placeholder="Bugun" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/></div>
                    <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4}}>Vaqt:</label><input value={newInvite.time} onChange={e=>setNewInvite(p=>({...p,time:e.target.value}))} placeholder="19:00" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/></div>
                  </div>
                  <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#92400e"}}>Bepul: 2 ta taklif. {myInviteCount>=2?"Keyingisi 50 tanga.":""}</div>
                  <button onClick={()=>{
                    if(!newInvite.text.trim()){toast$("Matn kiriting!","#ef4444");return;}
                    if(BANNED.some(w=>newInvite.text.toLowerCase().includes(w))){toast$("Bu taklif taqiqlangan!","#ef4444");return;}
                    const {hasBad:hasBadInv} = filterBadWords(newInvite.text);
                    if(hasBadInv){toast$("⚠️ Haqoratli so'z ishlatildi! Iltimos chiroyli gaplashing!","#ef4444");return;}
                    if(myInviteCount>=2){if(coins<50){toast$("50 tanga kerak!","#ef4444");return;}setCoins(p=>p-50);}
                    setGoInvites(p=>[{id:Date.now(),userId:"me",name:profile?.name||"Men",demoPhoto:profilePhoto||null,type:newInvite.type,text:newInvite.text,city:profile?.city||"Toshkent",time:newInvite.time||"—",date:newInvite.date||"—",audience:newInvite.audience,likes:0,mine:true},...p]);
                    setMyInviteCount(p=>p+1);setShowAddInvite(false);setNewInvite({type:"🎬 Kino",text:"",time:"",date:"",audience:"barchasi"});toast$("Taklif qoshildi!",C.green);
                  }} style={bigBtn(myInviteCount<2?"linear-gradient(90deg,#ff6eb4,#38bdf8)":"linear-gradient(90deg,#f59e0b,#fbbf24)")}>{myInviteCount<2?"Bepul joylash":"50 tanga - Joylash"}</button>
                  <button onClick={()=>setShowAddInvite(false)} style={{...bigBtn("#e0f2fe"),color:C.text}}>Bekor</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN MENU TAB */}
        {tab==="menu"&&(
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:18,fontWeight:900,marginBottom:14}}>☰ Asosiy menyu</div>
            
            {/* User profile card */}
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

            {/* Menu sections */}
            <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:8,paddingLeft:4}}>BOLIMLAR</div>
            {[
              {icon:"🎁",label:"Do'stlarni taklif qil — Mukofot ol!",sub:"Har taklif uchun +20 🪙, faol do'st uchun +100 🪙",color:"#22c55e",action:()=>setShowReferral(true),highlight:true},
              {icon:"📋",label:"So'rovnomada qatnash — Mukofot ol!",sub:"8 ta savolga javob bering va +100 🪙 bonus oling",color:"#38bdf8",action:()=>setShowSurvey(true),highlight2:true},
              {icon:"🎮",label:"Oyinlar",sub:"Tez orada...",color:"#8b5cf6",action:()=>toast$("🎮 Oyinlar tez orada!",C.purple)},
              {icon:"📍",label:"Uchrashuv joyi",sub:"Yaqin atrofda uchrashuv joylash",color:"#22c55e",action:()=>setTab("go")},
              {icon:"📖",label:"Hikoyalar",sub:"Foydalanuvchilar storylari",color:"#f59e0b",action:()=>toast$("📖 Stories tez orada!",C.gold)},
              {icon:"🎁",label:"Sovgalar",sub:"Do'stlarga sovga yuboring",color:"#ec4899",action:()=>setTab("shop")},
              {icon:"👑",label:"VIP azolik",sub:"Cheksiz imkoniyatlar",color:"#f59e0b",action:()=>setTab("shop")},
              {icon:"🏆",label:"Top foydalanuvchilar",sub:"Tez orada...",color:"#ef4444",action:()=>toast$("🏆 Top royxat tez orada!","#ef4444")},
              {icon:"💬",label:"Jamoat suhbatlari",sub:"Tez orada...",color:"#38bdf8",action:()=>toast$("💬 Jamoat chat tez orada!",C.sky)},
              {icon:"🌐",label:"Xalqaro tanishuv",sub:"Tez orada...",color:"#6366f1",action:()=>toast$("🌐 Xalqaro tez orada!","#6366f1")},
            ].map((item,i)=>(
              <div key={i} onClick={item.action} style={{background:item.highlight?"linear-gradient(135deg,#f0fdf4,#e0f2fe)":item.highlight2?"linear-gradient(135deg,#f0f9ff,#e0f2fe)":"#fff",borderRadius:16,padding:"13px 16px",marginBottom:8,border:"1px solid "+(item.highlight?C.green:item.highlight2?C.sky:C.border),display:"flex",alignItems:"center",gap:14,cursor:"pointer",boxShadow:item.highlight?"0 4px 14px rgba(34,197,94,0.15)":item.highlight2?"0 4px 14px rgba(56,189,248,0.15)":"0 2px 8px rgba(56,189,248,0.06)"}}>
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
              {icon:"⚙️",label:"Sozlamalar",sub:"Til, bildirishnoma, maxfiylik",color:C.muted,action:()=>setShowLangModal(true)},
              {icon:"🎧",label:"Qollab-quvvatlash",sub:"Yordam va savollar",color:C.sky,action:()=>toast$("Operatorga ulanmoqda...",C.sky)},
              {icon:"💡",label:"Taklif va shikoyatlar",sub:"Fikr va takliflaringizni yuboring",color:C.green,action:()=>toast$("Rahmat!",C.green)},
              {icon:"📋",label:"Foydalanish shartlari",sub:"Qoidalar va maxfiylik",color:C.muted,action:()=>toast$("Tez orada!",C.muted)},
              {icon:"⭐",label:"Ilovani baholash",sub:"App Store da baho bering",color:C.gold,action:()=>toast$("Rahmat! 💕",C.gold)},
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

        {/* SHOP */}
        {tab==="shop"&&(
          <div style={{padding:"12px 14px"}}>
            {/* BETA NOTICE BANNER */}
            <div onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:16,padding:"12px 16px",marginBottom:14,border:"1px solid rgba(255,110,180,0.3)",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,110,180,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🚀</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:13,color:"#ff6eb4"}}>Sinov rejimi • Beta</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>Mukofotlar tez orada real bo'ladi! Batafsil →</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}}/>
            </div>

            {/* 1. MENING TANGALARIM */}
            <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:20,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.08}}>🪙</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:6,fontWeight:600}}>💰 Mening tangalarim</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:38}}>🪙</span>
                <span style={{fontSize:42,fontWeight:900,color:"#fbbf24"}}>{coins}</span>
                <span style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginTop:8}}>tanga</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowBuyCoins(true)} style={{flex:1,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",border:"none",borderRadius:12,padding:"10px",color:"#1e293b",fontWeight:800,fontSize:13,cursor:"pointer"}}>+ To'ldirish</button>
                <button onClick={()=>document.getElementById("redeem-section")?.scrollIntoView({behavior:"smooth"})} style={{flex:1,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:"10px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>🎁 Almashtirish</button>
              </div>
            </div>

            {/* 2. SOVGALAR BO'LIMI - compact card */}
            <div onClick={()=>setShowGiftShop(true)} style={{background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:20,padding:18,marginBottom:14,border:"2px solid #fbcfe8",cursor:"pointer",position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(255,110,180,0.15)"}}>
              <div style={{position:"absolute",top:-15,right:-15,fontSize:70,opacity:0.1}}>🎁</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:600}}>🎁 Sovga do'koni</div>
              <div style={{fontWeight:900,fontSize:18,color:C.text,marginBottom:6}}>Do'stlarga sovga yuboring!</div>
              <div style={{fontSize:15,color:C.text,fontWeight:900,marginBottom:12}}>💝 Sovgalar sizni yanayam yaqinroq qiladi</div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div onClick={()=>{setShowGiftShop(true);setGiftShopTab("erkak");}} style={{flex:1,background:"linear-gradient(135deg,#dbeafe,#eff6ff)",borderRadius:14,padding:"10px 8px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",border:"1px solid #bfdbfe"}}>
                  <span style={{fontSize:18}}>👨</span>
                  <span style={{fontSize:12,color:"#1d4ed8",fontWeight:800}}>Erkaklar uchun</span>
                </div>
                <div onClick={()=>{setShowGiftShop(true);setGiftShopTab("ayol");}} style={{flex:1,background:"linear-gradient(135deg,#fce7f3,#fff0f6)",borderRadius:14,padding:"10px 8px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",border:"1px solid #fbcfe8"}}>
                  <span style={{fontSize:18}}>👩</span>
                  <span style={{fontSize:12,color:"#be185d",fontWeight:800}}>Ayollar uchun</span>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:4}}>
                  {["⌚","👔","🎮","💐","💍","🌹","🎀","🧸"].map((e,i)=><span key={i} style={{fontSize:20}}>{e}</span>)}
                </div>
                <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",borderRadius:12,padding:"8px 14px",color:"#fff",fontWeight:800,fontSize:13}}>Ko'rish ›</div>
              </div>
            </div>

            {/* GIFT SHOP MODAL */}
            {showGiftShop&&(
              <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
                <div style={{background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  <button onClick={()=>setShowGiftShop(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
                  <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>🎁 Sovga do'koni</div>
                </div>
                <div style={{display:"flex",borderBottom:"1px solid "+C.border,background:"#fff",flexShrink:0}}>
                  {[{k:"erkak",l:"👨 Erkaklar uchun"},{k:"ayol",l:"👩 Ayollar uchun"}].map(t=>(
                    <button key={t.k} onClick={()=>setGiftShopTab(t.k)} style={{flex:1,padding:"12px 0",background:"none",border:"none",borderBottom:giftShopTab===t.k?"3px solid "+(t.k==="erkak"?"#3b82f6":C.accent):"3px solid transparent",cursor:"pointer",fontSize:13,fontWeight:giftShopTab===t.k?800:400,color:giftShopTab===t.k?(t.k==="erkak"?"#3b82f6":C.accent):C.muted}}>{t.l}</button>
                  ))}
                </div>
                <div style={{flex:1,overflowY:"auto",padding:14}}>
                  {giftShopTab==="erkak"&&(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {[
                        {e:"⌚",n:"Soat",p:30,desc:"Chiroyli qo'l soati"},{e:"👔",n:"Ko'ylak",p:20,desc:"Zamonaviy ko'ylak"},
                        {e:"🎮",n:"Gamepad",p:45,desc:"O'yin kontroleri"},{e:"👟",n:"Krossovka",p:60,desc:"Sport poyafzal"},
                        {e:"🧢",n:"Kepka",p:15,desc:"Trendy kepka"},{e:"📱",n:"Gadjet",p:80,desc:"Texnologiya sovgasi"},
                        {e:"🏋️",n:"Sport",p:35,desc:"Sport abonementi"},{e:"🎧",n:"Naushnik",p:40,desc:"Sifatli naushnik"},
                        {e:"☕",n:"Kofe",p:10,desc:"Premium kofe"},{e:"🍕",n:"Pizza",p:12,desc:"Mazali pizza"},
                      ].map((g,i)=>(
                        <div key={i} style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",borderRadius:16,padding:12,textAlign:"center",cursor:"pointer",border:"1px solid #bfdbfe",boxShadow:"0 2px 8px rgba(59,130,246,0.1)"}}>
                          <div style={{fontSize:36,marginBottom:6}}>{g.e}</div>
                          <div style={{fontSize:12,fontWeight:800,color:"#1d4ed8",marginBottom:3}}>{g.n}</div>
                          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{g.desc}</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#3b82f6",marginBottom:8}}>🪙 {g.p}</div>
                          <button onClick={()=>toast$("🎁 "+g.n+" sovgasi yuborildi!","#3b82f6")} style={{width:"100%",background:"linear-gradient(90deg,#3b82f6,#2563eb)",border:"none",borderRadius:10,padding:"7px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sovga qilish</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {giftShopTab==="ayol"&&(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {[
                        {e:"💐",n:"Guldasta",p:15,desc:"Chiroyli gullar"},{e:"💍",n:"Uzuk",p:80,desc:"Olmos uzuk"},
                        {e:"🌹",n:"Atirgul",p:12,desc:"Qizil atirgul"},{e:"🎀",n:"Lenta",p:8,desc:"Ipak lenta"},
                        {e:"🧸",n:"Ayiqcha",p:25,desc:"Yumshoq o'yinchoq"},{e:"🍾",n:"Shampan",p:35,desc:"Tantanali shampan"},
                        {e:"💎",n:"Marjon",p:70,desc:"Qimmatbaho marjon"},{e:"🍫",n:"Shokolad",p:10,desc:"Belgiya shokolad"},
                        {e:"❤️‍🔥",n:"Sevgi",p:5,desc:"Issiq his-tuyg'u"},{e:"🎁",n:"Maxsus",p:20,desc:"Maxsus sovg'a"},
                      ].map((g,i)=>(
                        <div key={i} style={{background:"linear-gradient(135deg,#fff0f6,#fce7f3)",borderRadius:16,padding:12,textAlign:"center",cursor:"pointer",border:"1px solid #fbcfe8",boxShadow:"0 2px 8px rgba(255,110,180,0.1)"}}>
                          <div style={{fontSize:36,marginBottom:6}}>{g.e}</div>
                          <div style={{fontSize:12,fontWeight:800,color:"#be185d",marginBottom:3}}>{g.n}</div>
                          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{g.desc}</div>
                          <div style={{fontSize:12,fontWeight:700,color:C.accent,marginBottom:8}}>🪙 {g.p}</div>
                          <button onClick={()=>toast$("🎁 "+g.n+" sovgasi yuborildi!",C.accent)} style={{width:"100%",background:"linear-gradient(90deg,#ff6eb4,#f472b6)",border:"none",borderRadius:10,padding:"7px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sovga qilish</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TARIF PAKETLARI */}
            <div style={{fontWeight:900,fontSize:16,marginBottom:12}}>💎 Azolik paketlari</div>
            <div style={{display:"flex",gap:12,marginBottom:14,overflowX:"auto",paddingBottom:8,scrollSnapType:"x mandatory"}}>

              {/* VIP - OLTIN */}
              <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",borderRadius:20,padding:18,border:"2px solid #f59e0b",position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(245,158,11,0.3)",minWidth:260,flexShrink:0,scrollSnapAlign:"start"}}>
                <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.08}}>👑</div>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:28}}>👑</span>
                  <div>
                    <div style={{fontWeight:900,fontSize:20,color:"#fbbf24",letterSpacing:1}}>VIP</div>
                    <div style={{fontSize:11,color:"rgba(251,191,36,0.7)"}}>1 oylik · Oltin chipta</div>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:900,color:"#fbbf24"}}>9.99$</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>oyiga</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                  {["✅ 1 oy to'liq platformadan foydalanish","🪙 +100 tanga bonus","🎰 Sovgali baraban o'yini — 3 imkoniyat","👑 VIP nishon profilda"].map((f,i)=>(
                    <div key={i} style={{fontSize:12,color:"rgba(255,255,255,0.85)",display:"flex",alignItems:"center",gap:6}}>{f}</div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:18,fontWeight:900,color:"#fbbf24"}}>9.99 $</div>
                  <button onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(90deg,#f59e0b,#fbbf24)",border:"none",borderRadius:12,padding:"10px 20px",color:"#1a1a2e",fontWeight:900,fontSize:13,cursor:"pointer",boxShadow:"0 4px 14px rgba(245,158,11,0.4)"}}>Tez orada →</button>
                </div>
              </div>

              {/* DIAMOND */}
              <div style={{background:"linear-gradient(135deg,#0c0c1e,#1a0a3e,#2d1b69)",borderRadius:20,padding:18,border:"2px solid #a78bfa",position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(167,139,250,0.25)",minWidth:260,flexShrink:0,scrollSnapAlign:"start"}}>
                <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.08}}>💎</div>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#a78bfa,#7c3aed,#a78bfa)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:28}}>💎</span>
                  <div>
                    <div style={{fontWeight:900,fontSize:20,color:"#c4b5fd",letterSpacing:1}}>DIAMOND</div>
                    <div style={{fontSize:11,color:"rgba(196,181,253,0.7)"}}>15 kunlik · Premium</div>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:900,color:"#c4b5fd"}}>6.99$</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>15 kunga</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                  {["✅ 15 kunlik to'liq kirish","🪙 +50 tanga sovga","🎰 Baraban o'yini — 1 imkoniyat","💎 Diamond nishon profilda"].map((f,i)=>(
                    <div key={i} style={{fontSize:12,color:"rgba(255,255,255,0.85)",display:"flex",alignItems:"center",gap:6}}>{f}</div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:18,fontWeight:900,color:"#c4b5fd"}}>6.99 $</div>
                  <button onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(90deg,#7c3aed,#a78bfa)",border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:900,fontSize:13,cursor:"pointer",boxShadow:"0 4px 14px rgba(124,58,237,0.4)"}}>Tez orada →</button>
                </div>
              </div>

              {/* SILVER */}
              <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b,#334155)",borderRadius:20,padding:18,border:"2px solid #94a3b8",position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(148,163,184,0.2)",minWidth:260,flexShrink:0,scrollSnapAlign:"start"}}>
                <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.08}}>🥈</div>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#94a3b8,#cbd5e1,#94a3b8)"}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:28}}>🥈</span>
                  <div>
                    <div style={{fontWeight:900,fontSize:20,color:"#cbd5e1",letterSpacing:1}}>SILVER</div>
                    <div style={{fontSize:11,color:"rgba(203,213,225,0.7)"}}>7 kunlik · Boshlang'ich</div>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:900,color:"#cbd5e1"}}>5.00$</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>7 kunga</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                  {["✅ 7 kunlik to'liq kirish","🪙 +50 tanga sovga","🥈 Silver nishon profilda"].map((f,i)=>(
                    <div key={i} style={{fontSize:12,color:"rgba(255,255,255,0.85)",display:"flex",alignItems:"center",gap:6}}>{f}</div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:18,fontWeight:900,color:"#cbd5e1"}}>5.00 $</div>
                  <button onClick={()=>setShowBetaNotice(true)} style={{background:"linear-gradient(90deg,#64748b,#94a3b8)",border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:900,fontSize:13,cursor:"pointer",boxShadow:"0 4px 14px rgba(100,116,139,0.4)"}}>Tez orada →</button>
                </div>
              </div>

            </div>



            {/* 5. REAL SOVGALARGA ALMASHTIRISH - compact card */}
            <div id="redeem-section" onClick={()=>setShowRedeem(true)} style={{background:"linear-gradient(135deg,#2d0a1e,#1a0a2e,#0d1a3a)",borderRadius:20,padding:18,marginBottom:14,border:"2px solid rgba(255,110,180,0.4)",cursor:"pointer",position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(255,110,180,0.2)"}}>
              {/* Decorative glow */}
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,110,180,0.15)",filter:"blur(20px)"}}/>
              <div style={{position:"absolute",bottom:-20,left:-20,width:80,height:80,borderRadius:"50%",background:"rgba(245,158,11,0.1)",filter:"blur(15px)"}}/>

              {/* Exchange icon row */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,110,180,0.15)",borderRadius:12,padding:"8px 12px",border:"1px solid rgba(255,110,180,0.3)"}}>
                  <span style={{fontSize:20}}>🪙</span>
                  <span style={{color:"#ff6eb4",fontWeight:900,fontSize:15}}>Tanga</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:28,height:2,background:"linear-gradient(90deg,#ff6eb4,#f59e0b)",borderRadius:2}}/>
                  <span style={{fontSize:14}}>🔄</span>
                  <div style={{width:28,height:2,background:"linear-gradient(90deg,#f59e0b,#ff6eb4)",borderRadius:2}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(245,158,11,0.15)",borderRadius:12,padding:"8px 12px",border:"1px solid rgba(245,158,11,0.3)"}}>
                  <span style={{fontSize:20}}>🎁</span>
                  <span style={{color:"#fbbf24",fontWeight:900,fontSize:15}}>Sovga</span>
                </div>
              </div>

              <div style={{fontSize:12,color:"rgba(255,110,180,0.8)",marginBottom:4,fontWeight:700}}>🏆 Mukofotlar do'koni</div>
              <div style={{fontWeight:900,fontSize:17,color:"#fff",marginBottom:6}}>Tangalarni real sovgalarga almashtiring!</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:12}}>Yig'ilgan tangalaringizni qimmatbaho sovgalar va vaucherlarga aylantiring</div>

              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                {["👜 Sumka","🎫 Bilet","👕 Futbolka","💎 Braslet","🚗 Avtomobil"].map((e,i)=>(
                  <span key={i} style={{background:"rgba(255,110,180,0.12)",borderRadius:20,padding:"4px 10px",fontSize:11,color:"#ff6eb4",fontWeight:600,border:"1px solid rgba(255,110,180,0.25)"}}>{e}</span>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>5 ta maxsus mukofot</div>
                <div style={{background:"linear-gradient(90deg,#ff6eb4,#f59e0b)",borderRadius:12,padding:"8px 16px",color:"#fff",fontWeight:900,fontSize:13,boxShadow:"0 4px 14px rgba(255,110,180,0.3)"}}>Ko'rish ›</div>
              </div>
            </div>

            {/* REDEEM MODAL */}
            {showRedeem&&(
              <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:500,display:"flex",flexDirection:"column"}}>
                <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f172a)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  <button onClick={()=>setShowRedeem(false)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:34,height:34,color:"#fff",fontSize:18,cursor:"pointer"}}>←</button>
                  <div style={{flex:1,color:"#fbbf24",fontWeight:900,fontSize:18}}>🏆 Mukofotlar do'koni</div>
                  <div style={{background:"rgba(251,191,36,0.2)",borderRadius:20,padding:"5px 12px",color:"#fbbf24",fontWeight:800,fontSize:13}}>🪙 {coins}</div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:14}}>
                  <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>To'plangan tangalaringizni quyidagi mukofotlar va vaucherlarga almashtiring!</div>
                  {[
                    {e:"👜",name:"Love Hub maxsus sumkasi",price:800,col:"#8b5cf6",desc:"Brendli sumka (~25$) · Cheklangan miqdor",badge:""},
                    {e:"🎫",name:"Konsertga bilet",price:1200,col:"#f59e0b",desc:"Toshkent konsert biletlari (~40$)",badge:"🎵 Vouch"},
                    {e:"👕",name:"Love Hub futbolkasi",price:500,col:"#38bdf8",desc:"Premium futbolka (~15$) · Cheklangan",badge:""},
                    {e:"💎",name:"Pandora brasleti",price:3000,col:"#ec4899",desc:"Original Pandora brasleti (~100$)",badge:"💎 VIP"},
                    {e:"🚗",name:"Qora Tracker 2",price:150000,col:"#ef4444",desc:"Grand prize! Faqat bitta! (~4500$)",badge:"🔥 GRAND"},
                  ].map((item,i)=>(
                    <div key={i} style={{background:"#fff",borderRadius:18,padding:16,marginBottom:10,border:"2px solid "+item.col+"33",position:"relative",overflow:"hidden",boxShadow:"0 4px 14px "+item.col+"18"}}>
                      {item.badge&&<div style={{position:"absolute",top:10,right:10,background:item.col,color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{item.badge}</div>}
                      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
                        <div style={{width:58,height:58,borderRadius:16,background:item.col+"18",border:"2px solid "+item.col+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{item.e}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:800,fontSize:15,color:C.text}}>{item.name}</div>
                          <div style={{fontSize:11,color:C.muted,marginTop:3}}>{item.desc}</div>
                          <div style={{fontSize:14,fontWeight:900,color:item.col,marginTop:5}}>🪙 {item.price.toLocaleString()} tanga</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{fontSize:11,color:coins>=item.price?C.green:"#ef4444",fontWeight:600}}>{coins>=item.price?"✅ Yetarli tanga bor":"❌ "+( item.price-coins).toLocaleString()+" tanga yetmaydi"}</div>
                        <button onClick={()=>{
                          if(coins<item.price){toast$("Yetarli tanga yo'q!","#ef4444");return;}
                          setCoins(p=>p-item.price);
                          toast$("🎉 "+item.e+" "+item.name+" qo'lga kiritildi!",item.col);
                          setShowRedeem(false);
                        }} style={{background:"linear-gradient(90deg,"+item.col+","+item.col+"cc)",border:"none",borderRadius:12,padding:"10px 18px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}} onClick={(e)=>{e.stopPropagation();setShowBetaNotice(true);}}>
                          Tez orada →
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:8,background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:14,padding:"14px 16px",border:"1px solid "+C.border}}>
                    <div style={{fontSize:13,color:C.accent,fontWeight:800,marginBottom:4}}>🚀 Sinov rejimi</div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Love Hub hozirda <b>sinov rejimida</b> ishlayapti. Barcha bonus va mukofotlar tez orada real hayotga ko'chib, sizga berilа boshlaydi. Hozircha shunchaki foydalaning va zavqlaning! 😊<br/><br/>Savol va takliflar: <b>@lovehub_support</b></div>
                  </div>
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
                {[{icon:"🎂",label:"Yosh",val:profile.age+" yosh"},{icon:"📍",label:"Shahar",val:profile.city||"—"},{icon:"⚧",label:"Jins",val:profile.gender==="ayol"?"Ayol":"Erkak"},{icon:"💼",label:"Kasbi",val:profile.kasb||"—"},{icon:"🌍",label:"Millat",val:profile.millat||"—"},{icon:"💍",label:"Turmush",val:profile.married==="ha"?"Ha":"Yoq"},{icon:"👶",label:"Farzand",val:profile.children==="ha"?"Ha":"Yoq"},{icon:"📞",label:"Telefon",val:profile.phoneAnon?"Anonim":profile.phone||"—"}].map(r=>(
                  <div key={r.label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border}}>
                    <span style={{fontSize:17,width:22}}>{r.icon}</span>
                    <span style={{fontSize:11,color:C.muted,width:66}}>{r.label}</span>
                    <span style={{fontSize:13,fontWeight:600}}>{r.val}</span>
                  </div>
                ))}
                {profile.bio&&<div style={{marginTop:10,background:"#f8fafc",borderRadius:11,padding:"9px 12px",fontSize:13}}>{profile.bio}</div>}
                <button onClick={()=>setProfile(null)} style={bigBtn("linear-gradient(90deg,#ff6eb4,#38bdf8)")}>Tahrirlash</button>
              </div>
            ):(
              <div style={{background:"#fff",borderRadius:20,padding:16,border:"1px solid "+C.border}}>
                <input ref={profilePhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setProfilePhoto(URL.createObjectURL(f));e.target.value="";}}}/>
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div onClick={()=>profilePhotoRef.current.click()} style={{width:100,height:100,borderRadius:"50%",margin:"0 auto 10px",overflow:"hidden",border:"3px dashed "+C.accent,cursor:"pointer",background:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center"}}><div style={{fontSize:32}}>📷</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>Foto qoshish</div></div>}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>Jins:</label>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setForm(p=>({...p,gender:"ayol"}))} style={{flex:1,padding:10,borderRadius:12,border:"2px solid "+(form.gender==="ayol"?C.accent:C.border),background:form.gender==="ayol"?C.accent:"#f0f9ff",color:form.gender==="ayol"?"#fff":C.text,fontWeight:700,cursor:"pointer"}}>Ayol</button>
                    <button onClick={()=>setForm(p=>({...p,gender:"erkak"}))} style={{flex:1,padding:10,borderRadius:12,border:"2px solid "+(form.gender==="erkak"?C.sky:C.border),background:form.gender==="erkak"?C.sky:"#f0f9ff",color:form.gender==="erkak"?"#fff":C.text,fontWeight:700,cursor:"pointer"}}>Erkak</button>
                  </div>
                </div>
                {[{k:"name",l:"Ism va familiya",ph:"Ism Familiya"},{k:"city",l:"Shahar",ph:"Toshkent, Samarqand..."},{k:"bio",l:"Bio",ph:"Ozingiz haqida..."}].map(f=>(
                  <div key={f.k} style={{marginBottom:10}}>
                    <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>{f.l}:</label>
                    <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>💼 Kasbi / Ish sohasi (max 10 soz):</label>
                  <input value={form.kasb||""} onChange={e=>{
                    const v=e.target.value;
                    const wc=v.trim().split(" ").filter(Boolean).length;
                    if(wc<=10||(form.kasb||"").length>v.length) setForm(p=>({...p,kasb:v}));
                  }} placeholder="Masalan: Dasturchi, muallim, shifokor..." style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  <div style={{textAlign:"right",fontSize:10,color:(form.kasb||"").trim().split(" ").filter(Boolean).length>=10?"#ef4444":C.muted,marginTop:3}}>{(form.kasb||"").trim().split(" ").filter(Boolean).length}/10 soz</div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Yoshingiz (18-99):</label>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[18,19,20,21,22,23,24,25,26,27,28,29,30,32,35,38,40,43,45,48,50,55,60,65,70,75,80,90,99].map(y=>(
                      <button key={y} onClick={()=>setForm(p=>({...p,age:String(y)}))} style={{padding:"5px 10px",borderRadius:20,border:"2px solid "+(form.age===String(y)?C.accent:C.border),background:form.age===String(y)?C.accent:"#f0f9ff",color:form.age===String(y)?"#fff":C.text,fontSize:12,fontWeight:form.age===String(y)?700:400,cursor:"pointer"}}>{y}</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Millat:</label>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {["Ozbek","Qozoq","Tojik","Qirgiz","Turk","Rus","Metis","Boshqa"].map(m=>(
                      <button key={m} onClick={()=>setForm(p=>({...p,millat:m}))} style={chipStyle(form.millat===m)}>{m}</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:5}}>Telefon raqam:</label>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <button onClick={()=>setForm(p=>({...p,phoneAnon:false}))} style={chipStyle(!form.phoneAnon)}>Korsatish</button>
                    <button onClick={()=>setForm(p=>({...p,phoneAnon:true}))} style={chipStyle(form.phoneAnon)}>Anonim</button>
                  </div>
                  {!form.phoneAnon&&<input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+998 90 123 45 67" style={{width:"100%",background:"#f0f9ff",border:"1px solid "+C.border,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
                </div>
                <button onClick={()=>{
                  if(!form.name||!form.age){toast$("Ism va yosh majburiy!","#ef4444");return;}
                  if(!form.gender){toast$("Jinsni tanlang!","#ef4444");return;}
                  setProfile(form);toast$("Profil saqlandi!",C.green);
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
