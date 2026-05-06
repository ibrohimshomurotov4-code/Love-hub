import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#f0f8ff", card: "#fff", accent: "#ff6eb4", sky: "#38bdf8",
  pink: "#f472b6", text: "#1e293b", muted: "#94a3b8", border: "#e2edf7",
  green: "#22c55e", gold: "#f59e0b", purple: "#a855f7",
};

const GIFTS = [
  { id:1, emoji:"💐", name:"Guldasta", price:50, color:"#ff6b9d" },
  { id:2, emoji:"🍫", name:"Shokolad", price:30, color:"#92400e" },
  { id:3, emoji:"💍", name:"Uzuk", price:200, color:"#d97706" },
  { id:4, emoji:"🧸", name:"Ayiqcha", price:80, color:"#f97316" },
  { id:5, emoji:"🎀", name:"Lenta", price:20, color:"#ec4899" },
  { id:6, emoji:"⭐", name:"Yulduz", price:100, color:"#eab308" },
];

const STICKERS = [
  { id:1, emoji:"❤️", price:10 }, { id:2, emoji:"😍", price:15 },
  { id:3, emoji:"🔥", price:20 }, { id:4, emoji:"💋", price:25 },
  { id:5, emoji:"🌹", price:30 }, { id:6, emoji:"✨", price:12 },
  { id:7, emoji:"🦋", price:18 }, { id:8, emoji:"💫", price:22 },
];

const USERS = [
  { id:1, name:"Nilufar", age:23, city:"Toshkent",  gender:"ayol",  emoji:"👩‍🦱", bio:"Raqs va musiqa sevaman 🎵",           online:true,  rating:4.8, vip:true,  stories:["🌅","🎶","🌺"],  photos:["🌸","🎨","📚"] },
  { id:2, name:"Kamola",  age:25, city:"Samarqand", gender:"ayol",  emoji:"👩‍🦰", bio:"Sayohat qilishni yaxshi ko'raman ✈️", online:false, rating:4.5, vip:false, stories:["🏔️","🌊","🗺️"], photos:["🌍","📸","☕"] },
  { id:3, name:"Dildora", age:21, city:"Buxoro",    gender:"ayol",  emoji:"👱‍♀️", bio:"Kitob o'qish va pishiriq 📖",         online:true,  rating:4.9, vip:true,  stories:["📚","🍰","🌸"],  photos:["📖","🍰","🌺"] },
  { id:4, name:"Mohira",  age:27, city:"Namangan",  gender:"ayol",  emoji:"👩",          bio:"Sport va sog'lom turmush 💪",         online:true,  rating:4.6, vip:false, stories:["🏋️","🥑","🧘"], photos:["🏃‍♀️","🥗","🧘‍♀️"] },
  { id:5, name:"Zulfiya", age:22, city:"Andijon",   gender:"ayol",  emoji:"👩‍🦲", bio:"San'at va ijodkorlik 🎭",             online:false, rating:4.7, vip:true,  stories:["🎨","🎭","🌙"],  photos:["🎭","🖌️","🎬"] },
  { id:6, name:"Jasur",   age:24, city:"Toshkent",  gender:"erkak", emoji:"👨‍🦱", bio:"Futbol va musiqa muxlisi ⚽",         online:true,  rating:4.6, vip:false, stories:["⚽","🎸","🌆"],  photos:["🏟️","🎸","🌃"] },
  { id:7, name:"Bobur",   age:26, city:"Samarqand", gender:"erkak", emoji:"👨",          bio:"Biznes va sayohat 💼",                online:true,  rating:4.4, vip:true,  stories:["💼","✈️","🌍"],  photos:["💼","🌍","📱"] },
  { id:8, name:"Sherzod", age:22, city:"Buxoro",    gender:"erkak", emoji:"👨‍🦰", bio:"IT va dasturlash 💻",                 online:false, rating:4.7, vip:false, stories:["💻","🎮","☕"],  photos:["💻","🎮","📚"] },
];

const initMsgs = {
  1:[{ from:"them", text:"Salom! 😊", time:"14:30" }],
  2:[{ from:"them", text:"Assalomu alaykum!", time:"12:15" }],
};

function Stars({ r }) {
  return <span style={{ color:C.gold, fontSize:13 }}>{"★".repeat(Math.floor(r))}{"☆".repeat(5-Math.floor(r))} <span style={{fontSize:11}}>{r}</span></span>;
}

// ── Telegram Web App SDK ──
const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#ffffff");
  tg.setBackgroundColor("#f0f8ff");
}

// Telegram foydalanuvchi ma'lumotlari
const getTgUser = () => {
  if (!tg) return null;
  return tg.initDataUnsafe?.user || null;
};

export default function App() {
  const [tab, setTab]               = useState("discover");
  const [profile, setProfile]       = useState(null);
  // Telegram user data (agar mavjud bo'lsa)
  const tgUser = getTgUser();

  const [form, setForm] = useState({
    name: tgUser ? (tgUser.first_name + (tgUser.last_name ? " " + tgUser.last_name : "")) : "", age:"", city:"", bio:"", gender:"",
    phone:"", instagram:"", telegram:"",
    phoneAnon:false, instagramAnon:false, telegramAnon:false,
    car:"",
    hobbies:[], goal:"", millat:"",
    married:"yoq", children:"yoq"
  });
  const [genderFilter, setGenderFilter] = useState("Barchasi");
  const [matches, setMatches]       = useState([1,2]);
  const [liked, setLiked]           = useState([]);
  const [superLiked, setSuperLiked]     = useState([]);
  const [showGiftSend, setShowGiftSend] = useState(null);   // user to send gift to
  const [showUserDetail, setShowUserDetail] = useState(null); // full profile detail
  const [giftNote, setGiftNote]         = useState("");
  const [incomingGift, setIncomingGift] = useState(null);   // {gift, from, note}
  const [giftAccepted, setGiftAccepted] = useState(false);
  const [pendingGifts, setPendingGifts]   = useState({});     // {userId: gift}
  const [rejectedGift, setRejectedGift]   = useState(null);  // show suggestion after reject
  const [blocked, setBlocked]       = useState([]);
  const [msgs, setMsgs]             = useState(initMsgs);
  const [chat, setChat]             = useState(null);
  const [input, setInput]           = useState("");
  const [coins, setCoins]           = useState(150);
  const [vip, setVip]               = useState(false);
  const [giftModal, setGiftModal]   = useState(null);
  const [stickers, setStickers]     = useState(false);
  const [mediaPanel, setMediaPanel]   = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const fileRef = useRef(null);
  const [report, setReport]         = useState(null);
  const [videoCall, setVideoCall]   = useState(null);
  const [story, setStory]           = useState(null);
  const [storyI, setStoryI]         = useState(0);
  const [myStories, setMyStories]   = useState([]); // {id, type:'photo'|'video', url, name, reactions:{emoji:count}}
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyReactions, setStoryReactions] = useState({}); // {userId_storyIdx: {emoji: count}}
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const storyFileRef = useRef(null);
  const storyFileType = useRef(null);
  const todayKey = new Date().toDateString();
  const [storyDayKey, setStoryDayKey] = useState(todayKey);
  const todayStoryCount = storyDayKey === todayKey ? myStories.length : 0;
  const FREE_STORY_LIMIT = 2;
  const REACTION_EMOJIS = ["💋","❤️","🔥","😍","💩","😂","👏","🥰"];
  const [ageF, setAgeF]             = useState([18,99]);
  const [cityF, setCityF]           = useState("Barchasi");
  const [toast, setToast]           = useState(null);
  const [giftAnim, setGiftAnim]     = useState(null);
  const [cardI, setCardI]           = useState(0);
  const [swipe, setSwipe]           = useState(null);
  const [superAnim, setSuperAnim]   = useState(false);
  const endRef    = useRef(null);
  const storyRef  = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chat, msgs]);

  useEffect(() => {
    if (!story) return;
    storyRef.current = setTimeout(() => {
      if (storyI < story.stories.length - 1) setStoryI(p => p+1);
      else { setStory(null); setStoryI(0); }
    }, 3000);
    return () => clearTimeout(storyRef.current);
  }, [story, storyI]);

  const toast$ = (msg, color=C.accent) => { setToast({ msg, color }); setTimeout(()=>setToast(null), 2500); };

  const users = USERS.filter(u => {
    return u.age>=ageF[0] && u.age<=ageF[1] &&
      (cityF==="Barchasi" || u.city===cityF) &&
      (genderFilter==="Barchasi" || u.gender===genderFilter) &&
      !blocked.includes(u.id);
  });
  const cur = users[cardI % Math.max(users.length,1)];

  const like = id => {
    setSwipe("right");
    setTimeout(()=>{
      setSwipe(null); setLiked(p=>[...p,id]);
      if (Math.random()>0.4) { setMatches(p=>[...p,id]); toast$("🎉 Yangi match!",C.green); }
      else toast$("❤️ Like bosildingiz!");
      setCardI(p=>p+1);
    },400);
  };
  const dislike = ()=>{ setSwipe("left"); setTimeout(()=>{ setSwipe(null); setCardI(p=>p+1); },400); };
  const sendProfileGift = (user, gift, note) => {
    if (coins < gift.price){ toast$("❌ Tangalar yetarli emas!","#ef4444"); return; }
    setCoins(p=>p-gift.price);
    setShowGiftSend(null);
    setGiftNote("");
    // Simulate incoming gift notification (as if we are the receiver)
    setTimeout(()=>{
      setIncomingGift({ gift, from:user, note, accepted:false });
    }, 800);
    toast$(`${gift.emoji} Sovg'a yuborildi!`, C.accent);
  };

  const send = txt => {
    if (!txt.trim()) return;
    const t = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{ from:"me", text:txt, time:t }]}));
    setInput(""); setStickers(false);
    setTimeout(()=>{
      const rs=["😊","Zo'r!","Ha, albatta!","Qiziq...","❤️","Menga ham!","Rahmat 🌸"];
      const r = rs[Math.floor(Math.random()*rs.length)];
      setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{ from:"them", text:r, time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"}) }]}));
    },1200);
  };

  const sendGift = g => {
    if (coins<g.price){ toast$("❌ Tangalar yetarli emas!","#ef4444"); return; }
    setCoins(p=>p-g.price); setGiftAnim(g.emoji); setTimeout(()=>setGiftAnim(null),1800);
    const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{ from:"me", text:`${g.emoji} ${g.name} yuborildi!`, time:t, gift:true }]}));
    setGiftModal(null); toast$(`${g.emoji} Sovg'a yuborildi!`,C.sky);
  };

  const sendSticker = s => {
    if (coins<s.price){ toast$("❌ Tangalar yetarli emas!","#ef4444"); return; }
    setCoins(p=>p-s.price);
    const t=new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{ from:"me", text:s.emoji, time:t, sticker:true }]}));
    setStickers(false); toast$(`${s.emoji} Smaylik! -${s.price} 🪙`,C.pink);
  };

  const sendMedia = (type, payload) => {
    const t = new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"});
    const msg = { from:"me", time:t, type, payload };
    setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),msg]}));
    setMediaPanel(false);
    const autoReplies = {
      photo:["Wow, chiroyli! 😍","Go'zal 🌸","Yaxshi rasm 📸"],
      video:["Video tashlabsiz 🎬","Ko'rib chiqaman 😊","Rahmat! 🙏"],
      file:["Fayl qabul qilindi 📁","Rahmat! ✅","Ko'rib chiqaman 👀"],
      location:["Joylashuvingizni ko'rdim 📍","Tanish joy ekan 😊","Yaxshi! 👌"],
      music:["Ajoyib qo'shiq! 🎵","Menga ham yoqdi 🎶","Barakalla! 🎤"],
    };
    setTimeout(()=>{
      const rs = autoReplies[type]||["👍"];
      const r = rs[Math.floor(Math.random()*rs.length)];
      setMsgs(p=>({...p,[chat]:[...(p[chat]||[]),{ from:"them", text:r, time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"}) }]}));
    },1200);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sendMedia(type, { url, name:file.name, size:(file.size/1024).toFixed(1)+"KB" });
    e.target.value = "";
  };

  const block = (id,name) => {
    setBlocked(p=>[...p,id]); setReport(null); setChat(null);
    toast$(`🚫 ${name} bloklandi`,"#ef4444");
  };

  const buyVip = plan => {
    const pr={month:500,quarter:1200,year:3500};
    if (coins<pr[plan]){ toast$("❌ Tangalar yetarli emas!","#ef4444"); return; }
    setCoins(p=>p-pr[plan]); setVip(true); toast$("👑 VIP faollashtirildi!",C.gold);
  };

  const cities = ["Barchasi",...new Set(USERS.map(u=>u.city))];
  const matchUsers = USERS.filter(u=>matches.includes(u.id)&&!blocked.includes(u.id));
  const chatUser = chat ? USERS.find(u=>u.id===chat) : null;

  // ── RENDER ──
  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Nunito',sans-serif", color:C.text, maxWidth:430, margin:"0 auto", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#ff6eb455;border-radius:3px}
        @keyframes superPop{0%{opacity:1;transform:translate(-50%,-50%) scale(0.2)}70%{transform:translate(-50%,-50%) scale(1.5);opacity:1}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}
        @keyframes bounceG{from{transform:scale(1) rotate(-6deg)}to{transform:scale(1.2) rotate(6deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .range-thumb::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ff6eb4,#38bdf8);cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px #ff6eb455;margin-top:-9px}
        .range-thumb::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ff6eb4,#38bdf8);cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px #ff6eb455}
        .range-thumb::-webkit-slider-runnable-track{height:4px;background:transparent}
        .range-thumb::-moz-range-track{height:4px;background:transparent}
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",borderRadius:20,padding:"8px 18px",fontWeight:700,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px #0002",fontSize:13,animation:"slideIn 0.3s" }}>
          {toast.msg}
        </div>
      )}

      {/* SUPER ANIM */}

      {/* GIFT ANIM */}
      {giftAnim && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:997,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
          <div style={{ fontSize:120,animation:"bounceG 0.4s infinite alternate" }}>{giftAnim}</div>
        </div>
      )}

      {/* ── VIDEO CALL ── */}
      {videoCall && (
        <div style={{ position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"linear-gradient(180deg,#1e293b,#0f172a)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
          <div style={{ fontSize:90,marginBottom:14 }}>{videoCall.emoji}</div>
          <div style={{ color:"#fff",fontSize:22,fontWeight:800 }}>{videoCall.name}</div>
          <div style={{ color:"#64748b",fontSize:13,marginTop:6,animation:"blink 1.5s infinite" }}>Video qo'ng'iroq ketmoqda...</div>
          <div style={{ display:"flex",gap:28,marginTop:44 }}>
            <button onClick={()=>{ setVideoCall(null); toast$("📵 Bekor qilindi","#ef4444"); }} style={{ width:62,height:62,borderRadius:"50%",background:"#ef4444",border:"none",fontSize:26,cursor:"pointer",color:"#fff" }}>📵</button>
            <button onClick={()=>{ setVideoCall(null); toast$("📹 Ulandi!",C.green); }} style={{ width:62,height:62,borderRadius:"50%",background:C.green,border:"none",fontSize:26,cursor:"pointer",color:"#fff" }}>📹</button>
          </div>
          <div style={{ color:C.gold,fontSize:12,marginTop:18 }}>👑 VIP a'zo — cheksiz qo'ng'iroq!</div>
        </div>
      )}

      {/* ── STORY VIEWER ── */}
      {story && (
        <div style={{ position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:"#0f172a",zIndex:400,display:"flex",flexDirection:"column" }}>
          {/* progress bars */}
          <div style={{ display:"flex",gap:4,padding:"46px 14px 10px",zIndex:2,position:"relative" }}>
            {(story.isMyStory ? myStories : story.stories).map((_,i)=>(
              <div key={i} style={{ flex:1,height:3,background:"#ffffff33",borderRadius:2,overflow:"hidden" }}>
                <div style={{ height:"100%",background:"#fff",width:i<=storyI?"100%":"0%",transition:i===storyI?"width 4s linear":"none" }}/>
              </div>
            ))}
          </div>
          {/* header */}
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"0 14px 12px",zIndex:2,position:"relative" }}>
            <span style={{ fontSize:32 }}>{story.emoji||"🧑"}</span>
            <div>
              <div style={{ color:"#fff",fontWeight:800,fontSize:15 }}>{story.name||"Men"} {story.vip&&"👑"}</div>
              <div style={{ color:"#ffffff66",fontSize:11 }}>{story.online?"Online":"Bugun"}</div>
            </div>
            <button onClick={()=>{ setStory(null); setStoryI(0); setShowReactionPicker(false); }} style={{ marginLeft:"auto",background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer" }}>✕</button>
          </div>

          {/* MEDIA CONTENT */}
          <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden" }}>
            {(() => {
              const items = story.isMyStory ? myStories : story.stories;
              const item = items[storyI];
              if (!item) return null;
              if (story.isMyStory || (item && item.type)) {
                const s = story.isMyStory ? item : item;
                if (s && s.type === "photo") return <img src={s.url} alt="" style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain" }}/>;
                if (s && s.type === "video") return <video src={s.url} autoPlay loop muted style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain" }}/>;
              }
              return (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:110 }}>{item}</div>
                </div>
              );
            })()}

            {/* REACTIONS DISPLAY on story */}
            {(() => {
              const key = `${story.id}_${storyI}`;
              const r = storyReactions[key] || {};
              const entries = Object.entries(r).filter(([,c])=>c>0);
              if (!entries.length) return null;
              return (
                <div style={{ position:"absolute",bottom:80,left:14,display:"flex",gap:6,flexWrap:"wrap" }}>
                  {entries.map(([em,cnt])=>(
                    <div key={em} style={{ background:"rgba(0,0,0,0.5)",borderRadius:20,padding:"4px 10px",fontSize:13,color:"#fff",fontWeight:700,backdropFilter:"blur(4px)" }}>
                      {em} {cnt}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* REACTION PICKER */}
          {showReactionPicker && (
            <div style={{ position:"absolute",bottom:70,left:"50%",transform:"translateX(-50%)",background:"rgba(30,41,59,0.95)",borderRadius:30,padding:"10px 14px",display:"flex",gap:10,zIndex:5,backdropFilter:"blur(8px)",boxShadow:"0 4px 20px #0004" }}>
              {REACTION_EMOJIS.map(em=>(
                <div key={em} onClick={()=>{
                  const key = `${story.id}_${storyI}`;
                  setStoryReactions(p=>({
                    ...p,
                    [key]:{ ...(p[key]||{}), [em]:((p[key]||{})[em]||0)+1 }
                  }));
                  setShowReactionPicker(false);
                  toast$(em+" Reaktsiya yuborildi!",C.accent);
                }} style={{ fontSize:28,cursor:"pointer",transition:"transform 0.15s" }}>
                  {em}
                </div>
              ))}
            </div>
          )}

          {/* BOTTOM BAR — reaction + my stories info */}
          {!story.isMyStory && (
            <div style={{ padding:"10px 14px 24px",display:"flex",alignItems:"center",gap:10,zIndex:2,position:"relative" }}>
              <button onClick={()=>setShowReactionPicker(p=>!p)}
                style={{ flex:1,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:24,padding:"10px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                😊 Reaktsiya bildirish
              </button>
            </div>
          )}

          {/* MY STORY bottom — reactions received */}
          {story.isMyStory && (
            <div style={{ padding:"10px 14px 24px",zIndex:2,position:"relative" }}>
              <div style={{ color:"#ffffff88",fontSize:11,marginBottom:6 }}>👁 Reaktsiyalar:</div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {(() => {
                  const key = `${story.id}_${storyI}`;
                  const r = storyReactions[key]||{};
                  const entries = Object.entries(r).filter(([,c])=>c>0);
                  if (!entries.length) return <span style={{ color:"#ffffff44",fontSize:12 }}>Hali reaktsiya yo'q</span>;
                  return entries.map(([em,cnt])=>(
                    <div key={em} style={{ background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"5px 12px",fontSize:14,color:"#fff",fontWeight:700 }}>{em} {cnt}</div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* tap zones */}
          <div style={{ position:"absolute",top:0,left:0,width:"40%",height:"70%",cursor:"pointer",zIndex:1 }} onClick={()=>{ setShowReactionPicker(false); setStoryI(p=>Math.max(0,p-1)); }}/>
          <div style={{ position:"absolute",top:0,right:0,width:"60%",height:"70%",cursor:"pointer",zIndex:1 }} onClick={()=>{ setShowReactionPicker(false); const items=story.isMyStory?myStories:story.stories; if(storyI<items.length-1) setStoryI(p=>p+1); else{ setStory(null); setStoryI(0); } }}/>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {report && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"#38bdf822",backdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={()=>setReport(null)}>
          <div style={{ background:"#fff",borderRadius:"20px 20px 0 0",padding:18,width:"100%",maxWidth:430,boxShadow:"0 -8px 32px #ff6eb422" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800,fontSize:16,marginBottom:4 }}>⚠️ Shikoyat / Bloklash</div>
            <div style={{ color:C.muted,fontSize:13,marginBottom:12 }}>{report.name} haqida:</div>
            {["Spam yuboryapti","Noto'g'ri rasm","Haqorat qildi","Boshqa sabab"].map(r=>(
              <div key={r} onClick={()=>{ toast$(`✅ Shikoyat: ${r}`,C.muted); setReport(null); }}
                style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:11,padding:"9px 13px",marginBottom:7,cursor:"pointer",fontSize:13,color:"#dc2626",fontWeight:600 }}>
                🚩 {r}
              </div>
            ))}
            <button onClick={()=>block(report.id,report.name)} style={{ width:"100%",background:"#ef4444",border:"none",borderRadius:11,padding:"11px",color:"#fff",fontWeight:800,cursor:"pointer",marginTop:2,fontSize:14 }}>🚫 Bloklash</button>
            <button onClick={()=>setReport(null)} style={{ width:"100%",background:"#e0f2fe",border:"none",borderRadius:11,padding:"9px",color:C.text,fontWeight:700,cursor:"pointer",marginTop:7 }}>Bekor qilish</button>
          </div>
        </div>
      )}

      {/* ── GIFT MODAL ── */}
      {giftModal && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"#38bdf822",backdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={()=>setGiftModal(null)}>
          <div style={{ background:"#fff",borderRadius:"20px 20px 0 0",padding:18,width:"100%",maxWidth:430,boxShadow:"0 -8px 32px #ff6eb422" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800,fontSize:16 }}>🎁 Sovg'a yuborish</div>
            <div style={{ fontSize:12,color:C.muted,marginBottom:4 }}>🪙 Tangalar: {coins}</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginTop:10 }}>
              {GIFTS.map(g=>(
                <div key={g.id} onClick={()=>sendGift(g)} style={{ background:`${g.color}18`,border:`1px solid ${g.color}44`,borderRadius:13,padding:11,textAlign:"center",cursor:"pointer" }}>
                  <div style={{ fontSize:34 }}>{g.emoji}</div>
                  <div style={{ fontSize:11,fontWeight:700,marginTop:3 }}>{g.name}</div>
                  <div style={{ fontSize:11,color:C.sky }}>🪙{g.price}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setGiftModal(null)} style={{ width:"100%",background:"#e0f2fe",border:"none",borderRadius:11,padding:"10px",color:C.text,fontWeight:700,cursor:"pointer",marginTop:10 }}>Yopish</button>
          </div>
        </div>
      )}

      {/* ── ACTIVE CHAT ── */}
      {chat && chatUser && (
        <div style={{ position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"100vh",background:C.bg,zIndex:200,display:"flex",flexDirection:"column" }}>
          {/* chat header */}
          <div style={{ background:"#fff",padding:"11px 13px",display:"flex",alignItems:"center",gap:9,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 8px #38bdf814" }}>
            <button onClick={()=>setChat(null)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.text }}>←</button>
            <div style={{ position:"relative" }}>
              <span style={{ fontSize:36 }}>{chatUser.emoji}</span>
              <div style={{ width:10,height:10,borderRadius:"50%",background:chatUser.online?C.green:C.muted,position:"absolute",bottom:2,right:2,border:"2px solid #fff" }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800,fontSize:15 }}>{chatUser.name} {chatUser.vip&&"👑"}</div>
              <div style={{ fontSize:11,color:chatUser.online?C.green:C.muted }}>{chatUser.online?"Online":"Oflayn"}</div>
            </div>
            <button onClick={()=>{
              if (!vip){ toast$("👑 Video qo'ng'iroq faqat VIP uchun!",C.gold); return; }
              setVideoCall(chatUser);
            }} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",opacity:vip?1:0.4 }} title={vip?"Video qo'ng'iroq":"VIP kerak"}>📹</button>
            <button onClick={()=>{
              if (!vip){ toast$("👑 Qo'ng'iroq faqat VIP uchun!",C.gold); return; }
              toast$("📞 Qo'ng'iroq ketmoqda...",C.green);
            }} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",opacity:vip?1:0.4 }} title={vip?"Qo'ng'iroq":"VIP kerak"}>📞</button>
            <button onClick={()=>setGiftModal(chatUser)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer" }}>🎁</button>
            <button onClick={()=>setReport(chatUser)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer" }}>⚠️</button>
          </div>

          {/* messages */}
          <div style={{ flex:1,overflowY:"auto",padding:"13px 11px",display:"flex",flexDirection:"column",gap:8 }}>
            {(msgs[chat]||[]).map((m,i)=>{
              const isMe = m.from==="me";
              const bubbleBase = { alignSelf:isMe?"flex-end":"flex-start", maxWidth:"78%", borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px", boxShadow:"0 2px 8px #0001", overflow:"hidden" };
              const bubbleBg = { background:isMe?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#fff", border:isMe?"none":`1px solid ${C.border}`, padding:"9px 12px", color:isMe?"#fff":C.text };
              const timeEl = <div style={{ fontSize:10,color:isMe?"#ffffff66":C.muted,textAlign:isMe?"right":"left",marginTop:3 }}>{m.time}</div>;

              if (m.type==="photo") return (
                <div key={i} style={bubbleBase}>
                  <div style={{ ...bubbleBg, padding:4 }}>
                    <img src={m.payload.url} alt="foto" style={{ width:"100%",maxWidth:220,borderRadius:14,display:"block" }}/>
                    <div style={{ padding:"4px 8px 4px" }}>{timeEl}</div>
                  </div>
                </div>
              );
              if (m.type==="video") return (
                <div key={i} style={bubbleBase}>
                  <div style={{ ...bubbleBg, padding:4 }}>
                    <video src={m.payload.url} controls style={{ width:"100%",maxWidth:220,borderRadius:14,display:"block" }}/>
                    <div style={{ padding:"4px 8px 4px" }}>{timeEl}</div>
                  </div>
                </div>
              );
              if (m.type==="music") return (
                <div key={i} style={{ ...bubbleBase }}>
                  <div style={{ ...bubbleBg, display:"flex",alignItems:"center",gap:10,minWidth:180 }}>
                    <div style={{ width:42,height:42,borderRadius:"50%",background:isMe?"rgba(255,255,255,0.25)":"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🎵</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.payload.name}</div>
                      <audio src={m.payload.url} controls style={{ width:"100%",height:28,marginTop:4 }}/>
                    </div>
                    {timeEl}
                  </div>
                </div>
              );
              if (m.type==="file") return (
                <div key={i} style={bubbleBase}>
                  <div style={{ ...bubbleBg, display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:isMe?"rgba(255,255,255,0.25)":"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>📄</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.payload.name}</div>
                      <div style={{ fontSize:10,opacity:0.7,marginTop:2 }}>{m.payload.size}</div>
                    </div>
                    {timeEl}
                  </div>
                </div>
              );
              if (m.type==="location") return (
                <div key={i} style={bubbleBase}>
                  <div style={{ ...bubbleBg, padding:0, overflow:"hidden" }}>
                    <div style={{ background:"linear-gradient(135deg,#34d399,#10b981)",padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ fontSize:32 }}>📍</div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#fff" }}>Joylashuv ulashildi</div>
                        <div style={{ fontSize:11,color:"rgba(255,255,255,0.8)" }}>{m.payload.lat?.toFixed(4)}, {m.payload.lng?.toFixed(4)}</div>
                      </div>
                    </div>
                    <div style={{ background:"#f0fdf4",padding:"6px 12px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <span style={{ fontSize:11,color:"#10b981",fontWeight:600 }}>Xaritada ko'rish</span>
                      {timeEl}
                    </div>
                  </div>
                </div>
              );
              // default text/sticker
              return (
                <div key={i} style={{ ...bubbleBase, ...bubbleBg, fontSize:m.sticker?36:14 }}>
                  {m.text}
                  {timeEl}
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>

          {/* hidden file inputs */}
          <input ref={fileRef} type="file" style={{ display:"none" }} onChange={e=>handleFileUpload(e, fileRef._type||"file")}/>

          {/* STICKER PANEL */}
          {stickers && (
            <div style={{ background:"#f0f9ff",padding:11,borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11,color:C.muted,marginBottom:6 }}>💎 Premium smayliklar</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
                {STICKERS.map(s=>(
                  <div key={s.id} onClick={()=>sendSticker(s)} style={{ background:"#e0f2fe",borderRadius:10,padding:7,textAlign:"center",cursor:"pointer" }}>
                    <div style={{ fontSize:24 }}>{s.emoji}</div>
                    <div style={{ fontSize:9,color:C.sky,marginTop:2 }}>🪙{s.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA PANEL */}
          {mediaPanel && (
            <div style={{ background:"#fff",padding:"12px 14px",borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11,color:C.muted,marginBottom:10 }}>Media ulashish</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
                {[
                  { icon:"🖼️", label:"Rasm",       color:"#3b82f6", action:()=>{ fileRef.current._type="photo"; fileRef.current.accept="image/*"; fileRef.current.click(); }},
                  { icon:"🎬", label:"Video",       color:"#8b5cf6", action:()=>{ fileRef.current._type="video"; fileRef.current.accept="video/*"; fileRef.current.click(); }},
                  { icon:"🎵", label:"Musiqa",      color:"#ec4899", action:()=>{ fileRef.current._type="music"; fileRef.current.accept="audio/*"; fileRef.current.click(); }},
                  { icon:"📄", label:"Fayl",        color:"#f59e0b", action:()=>{ fileRef.current._type="file";  fileRef.current.accept="*/*";     fileRef.current.click(); }},
                  { icon:"📍", label:"Geolokatsiya",color:"#10b981", action:()=>{
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        pos => sendMedia("location",{ lat:pos.coords.latitude, lng:pos.coords.longitude }),
                        ()  => sendMedia("location",{ lat:41.2995, lng:69.2401 })
                      );
                    } else {
                      sendMedia("location",{ lat:41.2995, lng:69.2401 });
                    }
                    setMediaPanel(false);
                  }},
                  { icon:"🎁", label:"Sovg'a",      color:"#ff6eb4", action:()=>{ setGiftModal(chatUser); setMediaPanel(false); }},
                  { icon:"😊", label:"Smaylik",     color:"#f97316", action:()=>{ setStickers(true);  setMediaPanel(false); }},
                  { icon:"❌", label:"Yopish",      color:"#94a3b8", action:()=>setMediaPanel(false) },
                ].map((btn,i)=>(
                  <div key={i} onClick={btn.action}
                    style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",padding:"8px 4px",borderRadius:12,background:`${btn.color}11`,border:`1px solid ${btn.color}33` }}>
                    <div style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${btn.color},${btn.color}aa)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{btn.icon}</div>
                    <div style={{ fontSize:9,fontWeight:600,color:btn.color,textAlign:"center" }}>{btn.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INPUT BAR */}
          <div style={{ background:"#fff",padding:"8px 11px",display:"flex",gap:6,alignItems:"center",borderTop:`1px solid ${C.border}` }}>
            <button onClick={()=>{ setMediaPanel(p=>!p); setStickers(false); }}
              style={{ width:36,height:36,borderRadius:"50%",background:mediaPanel?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#f0f9ff",border:`1px solid ${C.border}`,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {mediaPanel?"✕":"➕"}
            </button>
            <button onClick={()=>{ setStickers(p=>!p); setMediaPanel(false); }}
              style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",flexShrink:0 }}>😊</button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)}
              placeholder="Xabar yozing..."
              style={{ flex:1,background:"#f0f9ff",border:`1px solid ${C.border}`,borderRadius:20,padding:"8px 12px",color:C.text,fontSize:14,outline:"none" }}/>
            <button onClick={()=>send(input)} style={{ width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",fontSize:17,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>➤</button>
          </div>
        </div>
      )}

      {/* ── GIFT SEND MODAL ── */}
      {showGiftSend && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"#00000077",backdropFilter:"blur(6px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={()=>setShowGiftSend(null)}>
          <div style={{ background:"#fff",borderRadius:"24px 24px 0 0",padding:20,width:"100%",maxWidth:430,boxShadow:"0 -8px 40px #ff6eb433" }} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center",marginBottom:14 }}>
              <div style={{ fontSize:52 }}>{showGiftSend.emoji}</div>
              <div style={{ fontWeight:900,fontSize:18 }}>{showGiftSend.name}ga sovg'a yuborish</div>
              <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>Sovg'ani qabul qilsa — lichkaga yozish ochiladi!</div>
            </div>

            {/* Gift grid */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:14 }}>
              {GIFTS.map(g=>(
                <div key={g.id} onClick={()=>sendProfileGift(showGiftSend, g, giftNote)}
                  style={{ background:`${g.color}18`,border:`2px solid ${g.color}55`,borderRadius:14,padding:12,textAlign:"center",cursor:"pointer",transition:"transform 0.15s" }}>
                  <div style={{ fontSize:36 }}>{g.emoji}</div>
                  <div style={{ fontSize:11,fontWeight:700,marginTop:4 }}>{g.name}</div>
                  <div style={{ fontSize:11,color:C.sky,marginTop:2 }}>🪙{g.price}</div>
                </div>
              ))}
            </div>

            {/* Note input */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12,color:C.muted,display:"block",marginBottom:5 }}>💬 Qo'shimcha yozuv (ixtiyoriy)</label>
              <input value={giftNote} onChange={e=>setGiftNote(e.target.value)}
                placeholder="Masalan: Siz menga yoqdingiz 🌸"
                style={{ width:"100%",background:"#f0f9ff",border:`1px solid ${C.border}`,borderRadius:12,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box" }}/>
            </div>

            <div style={{ fontSize:11,color:C.muted,textAlign:"center",marginBottom:10 }}>🪙 Tangalar: {coins}</div>
            <button onClick={()=>setShowGiftSend(null)} style={{ width:"100%",background:"#e0f2fe",border:"none",borderRadius:12,padding:"10px",color:C.text,fontWeight:700,cursor:"pointer" }}>Bekor qilish</button>
          </div>
        </div>
      )}

      {/* ── INCOMING GIFT NOTIFICATION ── */}
      {incomingGift && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(180deg,#00000088,#000000aa)",backdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"#fff",borderRadius:28,padding:28,width:"100%",maxWidth:380,boxShadow:"0 20px 60px #ff6eb466",textAlign:"center",animation:"slideIn 0.4s" }}>
            {/* Big gift animation */}
            <div style={{ fontSize:100,marginBottom:8,animation:"bounceG 0.6s infinite alternate" }}>{incomingGift.gift.emoji}</div>
            <div style={{ fontSize:13,color:C.muted,marginBottom:6 }}>Sizga sovg'a keldi!</div>
            <div style={{ fontWeight:900,fontSize:22,marginBottom:4 }}>{incomingGift.from.name} 💌</div>
            <div style={{ fontSize:20,marginBottom:4 }}>{incomingGift.from.emoji}</div>

            {/* Gift info */}
            <div style={{ background:"linear-gradient(135deg,#fff0f6,#e0f2fe)",borderRadius:16,padding:"12px 16px",margin:"12px 0",border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:15,fontWeight:700 }}>{incomingGift.gift.emoji} {incomingGift.gift.name}</div>
              {incomingGift.note && (
                <div style={{ fontSize:13,color:C.text,marginTop:6,fontStyle:"italic" }}>"{incomingGift.note}"</div>
              )}
            </div>

            <div style={{ fontSize:12,color:C.muted,marginBottom:16 }}>
              Qabul qilsangiz — lichkaga yozish imkoni ochiladi ❤️
            </div>

            {/* Accept / Reject */}
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>{
                setMatches(p=>[...p, incomingGift.from.id]);
                setPendingGifts(p=>({...p,[incomingGift.from.id]:incomingGift.gift}));
                setIncomingGift(null);
                toast$(`🎁 Sovg'a qabul qilindi! Endi yozishingiz mumkin 💬`,C.green);
              }} style={{ flex:1,background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer" }}>
                🎁 Qabul qilish
              </button>
              <button onClick={()=>{
                const from = incomingGift.from;
                const gift = incomingGift.gift;
                setIncomingGift(null);
                const alt = USERS.find(u=>u.id!==from.id && u.gender===from.gender && !blocked.includes(u.id));
                setRejectedGift({ from, gift, alt });
              }} style={{ flex:1,background:"#fee2e2",border:"none",borderRadius:14,padding:"13px",color:"#ef4444",fontWeight:800,fontSize:15,cursor:"pointer" }}>
                ❌ Rad etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GIFT REJECTED — similar suggestion ── */}
      {rejectedGift && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(180deg,#1e293b,#0f172a)",backdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"#fff",borderRadius:28,padding:26,width:"100%",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px #0006" }}>
            <div style={{ fontSize:60,marginBottom:8 }}>💔</div>
            <div style={{ fontWeight:900,fontSize:18,marginBottom:6 }}>Sovg'a rad etildi</div>

            {/* Return gift */}
            <div style={{ background:"#fff0f6",borderRadius:16,padding:"12px",marginBottom:14,border:"1px solid #fecdd3" }}>
              <div style={{ fontSize:13,color:"#e11d48",fontWeight:600 }}>🎁 {rejectedGift.gift.emoji} {rejectedGift.gift.name} sizga qaytarildi</div>
              <div style={{ fontSize:11,color:C.muted,marginTop:3 }}>Tangalar hisobingizga qaytarildi ✅</div>
            </div>

            {/* Suggestion */}
            {rejectedGift.alt && (
              <div style={{ background:"linear-gradient(135deg,#f0f9ff,#fff0f6)",borderRadius:18,padding:16,marginBottom:16,border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:11,color:C.muted,marginBottom:8 }}>💡 Shunga o'xshash yangi do'st tavsiya:</div>
                <div style={{ fontSize:52 }}>{rejectedGift.alt.emoji}</div>
                <div style={{ fontWeight:900,fontSize:18,marginTop:4 }}>{rejectedGift.alt.name}, {rejectedGift.alt.age}</div>
                <div style={{ fontSize:12,color:C.muted }}>📍 {rejectedGift.alt.city}</div>
                <div style={{ fontSize:12,marginTop:4 }}>{rejectedGift.alt.bio}</div>
                <div style={{ fontSize:12,color:C.muted,marginTop:8,fontStyle:"italic",lineHeight:1.5 }}>
                  "Xafa bo'lmang! Sizga bundan ham go'zalroq do'st topib beraman 🌸"
                </div>
              </div>
            )}

            <div style={{ display:"flex",gap:9 }}>
              {rejectedGift.alt && (
                <button onClick={()=>{
                  setRejectedGift(null);
                  setShowGiftSend(rejectedGift.alt);
                  setGiftNote("");
                  setCoins(p=>p+rejectedGift.gift.price); // return coins
                }} style={{ flex:1,background:"linear-gradient(135deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:13,padding:"11px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer" }}>
                  🎁 Sovg'a yuborish
                </button>
              )}
              <button onClick={()=>{
                setCoins(p=>p+rejectedGift.gift.price); // return coins
                setRejectedGift(null);
              }} style={{ flex:1,background:"#e0f2fe",border:"none",borderRadius:13,padding:"11px",color:C.text,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#fff,#e0f2fe)",padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 12px #38bdf814" }}>
        <div style={{ fontSize:20,fontWeight:900,background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>💕 Love Hub</div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {vip && <div style={{ background:"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:20,padding:"4px 10px",fontSize:12,fontWeight:800,color:"#fff" }}>👑 VIP</div>}
          <div onClick={()=>setTab("shop")} style={{ background:"linear-gradient(90deg,#38bdf8,#ff6eb4)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff" }}>🪙 {coins}</div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ paddingBottom:80,paddingTop:4 }}>

        {/* DISCOVER */}
        {tab==="discover" && (
          <div>
            {/* Stories row */}
            <div style={{ display:"flex",gap:10,padding:"12px 14px 6px",overflowX:"auto" }}>

              {/* MY STORY — add button + reactions summary */}
              <div style={{ textAlign:"center",flexShrink:0 }}>
                <div style={{ position:"relative" }}>
                  <div onClick={()=>{
                    const canAdd = vip || todayStoryCount < FREE_STORY_LIMIT;
                    if (!canAdd){ toast$("👑 Kunlik 2 ta bepul stories tugadi! VIP oling",C.gold); return; }
                    setShowAddStory(true);
                  }}
                    style={{ width:60,height:60,borderRadius:"50%",border:`3px dashed ${myStories.length>0?C.accent:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,cursor:"pointer",background:"#f0f9ff",position:"relative" }}>
                    {myStories.length>0 ? "🧑" : "➕"}
                    {myStories.length>0 && (
                      <div style={{ position:"absolute",top:-4,right:-4,background:C.accent,borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>{myStories.length}</div>
                    )}
                  </div>
                  {/* Reaction mini badges */}
                  {myStories.length>0 && (()=>{
                    const allReactions = {};
                    myStories.forEach((_,i)=>{
                      const r = storyReactions[`my_${i}`]||{};
                      Object.entries(r).forEach(([em,cnt])=>{ allReactions[em]=(allReactions[em]||0)+cnt; });
                    });
                    const top = Object.entries(allReactions).sort((a,b)=>b[1]-a[1]).slice(0,2);
                    if (!top.length) return null;
                    return (
                      <div style={{ position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:2 }}>
                        {top.map(([em])=>(
                          <div key={em} style={{ background:"#fff",borderRadius:"50%",width:18,height:18,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px #0002",border:`1px solid ${C.border}` }}>{em}</div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div style={{ fontSize:9,color:C.text,fontWeight:600,marginTop:8 }}>
                  {vip?"👑 VIP":`${todayStoryCount}/${FREE_STORY_LIMIT}`}
                </div>
                {myStories.length>0 && (
                  <div onClick={()=>{ setStory({ id:"my", name:"Men", emoji:"🧑", isMyStory:true, online:true }); setStoryI(0); }}
                    style={{ fontSize:8,color:C.accent,fontWeight:700,cursor:"pointer",marginTop:1 }}>Ko'rish</div>
                )}
              </div>

              {/* OTHER USERS STORIES */}
              {USERS.filter(u=>!blocked.includes(u.id)).map(u=>(
                <div key={u.id} style={{ textAlign:"center",flexShrink:0 }}>
                  <div onClick={()=>{ setStory({...u, isMyStory:false}); setStoryI(0); setShowReactionPicker(false); }}
                    style={{ width:60,height:60,borderRadius:"50%",border:`3px solid ${u.vip?C.gold:C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,cursor:"pointer",background:"#fff",boxShadow:`0 0 10px ${u.vip?C.gold+"44":C.accent+"44"}`,position:"relative" }}>
                    {u.emoji}
                  </div>
                  {/* reaction mini badges below circle */}
                  {(()=>{
                    const r = storyReactions[`${u.id}_0`]||{};
                    const top = Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,2);
                    if (!top.length) return null;
                    return <div style={{ fontSize:11,marginTop:1 }}>{top.map(([em])=>em).join("")}</div>;
                  })()}
                  <div style={{ fontSize:9,textAlign:"center",color:C.text,fontWeight:600,marginTop:2,maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.name}</div>
                </div>
              ))}
            </div>

            {/* STORY FILE INPUT */}
            <input ref={storyFileRef} type="file" style={{ display:"none" }}
              onChange={e=>{
                const file = e.target.files[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                const type = storyFileType.current;
                const newCount = todayStoryCount + 1;
                if (!vip && newCount > FREE_STORY_LIMIT){
                  toast$("👑 Kunlik 2 ta bepul limit tugadi! VIP oling",C.gold);
                  setShowAddStory(false); return;
                }
                setMyStories(p=>[...p,{ type, url, name:file.name, time:new Date().toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"}) }]);
                setShowAddStory(false);
                toast$("✅ Story qo'shildi!",C.green);
                e.target.value="";
              }}/>

            {/* ADD STORY MODAL */}
            {showAddStory && (
              <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"#00000066",backdropFilter:"blur(4px)",zIndex:350,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={()=>setShowAddStory(false)}>
                <div style={{ background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:430,boxShadow:"0 -8px 32px #ff6eb422" }} onClick={e=>e.stopPropagation()}>
                  <div style={{ fontWeight:800,fontSize:16,marginBottom:4 }}>📖 Story qo'shish</div>
                  <div style={{ fontSize:12,color:C.muted,marginBottom:14 }}>
                    Bugun: {todayStoryCount} ta · {vip?"👑 VIP — cheksiz":"Bepul: 2 tagacha"}
                  </div>

                  {/* Photo & Video upload */}
                  <div style={{ display:"flex",gap:12,marginBottom:16 }}>
                    {[
                      { icon:"🖼️", label:"Surat yuklash", type:"photo", accept:"image/*", color:"#3b82f6" },
                      { icon:"🎬", label:"Video yuklash", type:"video", accept:"video/*", color:"#8b5cf6" },
                    ].map(opt=>(
                      <div key={opt.type} onClick={()=>{
                        if (!vip && todayStoryCount >= FREE_STORY_LIMIT){
                          toast$("👑 Kunlik limit tugadi! VIP oling",C.gold);
                          setShowAddStory(false); return;
                        }
                        storyFileType.current = opt.type;
                        storyFileRef.current.accept = opt.accept;
                        storyFileRef.current.click();
                      }}
                        style={{ flex:1,background:`${opt.color}11`,border:`2px solid ${opt.color}44`,borderRadius:16,padding:"18px 10px",textAlign:"center",cursor:"pointer" }}>
                        <div style={{ fontSize:40,marginBottom:6 }}>{opt.icon}</div>
                        <div style={{ fontSize:12,fontWeight:700,color:opt.color }}>{opt.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* My uploaded stories preview */}
                  {myStories.length>0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12,color:C.muted,marginBottom:6 }}>Mening storilarim:</div>
                      <div style={{ display:"flex",gap:8,overflowX:"auto" }}>
                        {myStories.map((s,i)=>{
                          const rKey=`my_${i}`;
                          const r=storyReactions[rKey]||{};
                          const topR=Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,3);
                          return (
                            <div key={i} style={{ flexShrink:0,textAlign:"center" }}>
                              <div style={{ width:52,height:52,borderRadius:10,overflow:"hidden",border:`2px solid ${C.accent}`,position:"relative" }}>
                                {s.type==="photo"
                                  ? <img src={s.url} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                                  : <video src={s.url} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                                }
                              </div>
                              {topR.length>0 && (
                                <div style={{ fontSize:11,marginTop:2 }}>{topR.map(([em])=>em).join("")}</div>
                              )}
                              <div style={{ fontSize:9,color:C.muted }}>{s.time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!vip && todayStoryCount >= FREE_STORY_LIMIT && (
                    <div style={{ background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#92400e",fontWeight:600 }}>
                      ⚠️ Kunlik 2 ta bepul limit tugadi. VIP olib cheksiz story qo'shing!
                    </div>
                  )}
                  {!vip && (
                    <button onClick={()=>{ setShowAddStory(false); setTab("shop"); }}
                      style={{ width:"100%",background:"linear-gradient(90deg,#f59e0b,#fbbf24)",border:"none",borderRadius:13,padding:"11px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:8 }}>
                      👑 VIP oling — Cheksiz story!
                    </button>
                  )}
                  <button onClick={()=>setShowAddStory(false)}
                    style={{ width:"100%",background:"#e0f2fe",border:"none",borderRadius:13,padding:"10px",color:C.text,fontWeight:700,fontSize:14,cursor:"pointer" }}>
                    Yopish
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={{ padding:"4px 14px 8px" }}>
              <div style={{ fontSize:11,color:C.muted,marginBottom:5 }}>📍 Shahar:</div>
              <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
                {cities.map(c=>(
                  <button key={c} onClick={()=>{ setCityF(c); setCardI(0); }}
                    style={{ background:cityF===c?C.accent:"#e0f2fe",borderRadius:20,padding:"4px 11px",fontSize:11,cursor:"pointer",fontWeight:cityF===c?700:400,border:"none",color:cityF===c?"#fff":C.text }}>
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11,color:C.muted,marginBottom:5 }}>⚧ Jins:</div>
              <div style={{ display:"flex",gap:5,marginBottom:8 }}>
                {["Barchasi","ayol","erkak"].map(g=>(
                  <button key={g} onClick={()=>{ setGenderFilter(g); setCardI(0); }}
                    style={{ background:genderFilter===g?C.accent:"#e0f2fe",borderRadius:20,padding:"4px 11px",fontSize:11,cursor:"pointer",fontWeight:genderFilter===g?700:400,border:"none",color:genderFilter===g?"#fff":C.text }}>
                    {g==="Barchasi"?"🌐 Barchasi":g==="ayol"?"👩 Ayol":"👨 Erkak"}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                <span style={{ fontSize:11,color:C.muted }}>🎂 Yosh oralig'i:</span>
                <span style={{ fontSize:12,fontWeight:800,color:C.accent }}>{ageF[0]} – {ageF[1]} yosh</span>
              </div>
              {/* DUAL RANGE SLIDER */}
              <div style={{ position:"relative",height:36,marginBottom:2 }}>
                {/* Track background */}
                <div style={{ position:"absolute",top:"50%",left:0,right:0,height:4,background:"#e0f2fe",borderRadius:2,transform:"translateY(-50%)" }}/>
                {/* Active track */}
                <div style={{ position:"absolute",top:"50%",height:4,background:`linear-gradient(90deg,${C.accent},${C.sky})`,borderRadius:2,transform:"translateY(-50%)",left:`${(ageF[0]-18)/81*100}%`,right:`${100-(ageF[1]-18)/81*100}%` }}/>
                {/* Min thumb */}
                <input type="range" min={18} max={99} value={ageF[0]}
                  onChange={e=>{ const v=+e.target.value; if(v<ageF[1]-1){ setAgeF([v,ageF[1]]); setCardI(0); } }}
                  style={{ position:"absolute",width:"100%",top:"50%",transform:"translateY(-50%)",appearance:"none",WebkitAppearance:"none",background:"transparent",outline:"none",pointerEvents:"all",zIndex:3 }}
                  className="range-thumb"
                />
                {/* Max thumb */}
                <input type="range" min={18} max={99} value={ageF[1]}
                  onChange={e=>{ const v=+e.target.value; if(v>ageF[0]+1){ setAgeF([ageF[0],v]); setCardI(0); } }}
                  style={{ position:"absolute",width:"100%",top:"50%",transform:"translateY(-50%)",appearance:"none",WebkitAppearance:"none",background:"transparent",outline:"none",pointerEvents:"all",zIndex:3 }}
                  className="range-thumb"
                />
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted }}>
                <span>18</span><span>99</span>
              </div>
            </div>

            {/* Card — MINIMALIST */}
            {cur && (
              <div style={{ background:"#fff",borderRadius:24,margin:"0 12px 14px",overflow:"hidden",border:`1px solid ${C.border}`,boxShadow:"0 8px 32px #38bdf814",transition:"transform 0.45s cubic-bezier(.4,0,.2,1),opacity 0.4s",transform:swipe==="right"?"translateX(130%) rotate(22deg)":swipe==="left"?"translateX(-130%) rotate(-22deg)":"none",opacity:swipe?0:1 }}>

                {/* BIG AVATAR — tap to see detail */}
                <div onClick={()=>setShowUserDetail(cur)}
                  style={{ height:320,background:"linear-gradient(180deg,#f0f9ff,#fff0f6)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative" }}>
                  <div style={{ fontSize:140,filter:"drop-shadow(0 8px 32px #ff6eb433)" }}>{cur.emoji}</div>
                  {cur.vip && <div style={{ position:"absolute",top:14,right:14,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:800,color:"#fff" }}>👑 VIP</div>}
                  {cur.online && <div style={{ position:"absolute",top:14,left:14,background:C.green,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff" }}>🟢 Online</div>}
                  {/* tap hint */}
                  <div style={{ position:"absolute",bottom:12,left:16,background:"rgba(0,0,0,0.35)",borderRadius:20,padding:"5px 14px",fontSize:12,color:"#fff",backdropFilter:"blur(4px)",fontWeight:700 }}>
                    {cur.name} haqida ✍️
                  </div>
                </div>

                {/* NAME + CITY */}
                <div style={{ padding:"14px 18px 6px" }}>
                  <div style={{ display:"flex",alignItems:"baseline",gap:8 }}>
                    <span style={{ fontSize:24,fontWeight:900,color:C.text }}>{cur.name},</span>
                    <span style={{ fontSize:24,fontWeight:900,color:C.text }}>{cur.age}</span>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}>
                    <span style={{ fontSize:13,color:C.muted }}>📍 {cur.city}</span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display:"flex",justifyContent:"space-around",padding:"12px 24px 18px",alignItems:"center" }}>
                  <button onClick={dislike}
                    style={{ width:58,height:58,borderRadius:"50%",background:"#f1f5f9",border:"none",fontSize:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px #0001" }}>✕</button>
                  <button onClick={()=>{ setShowGiftSend(cur); setGiftNote(""); }}
                    style={{ width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",fontSize:22,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px #f59e0b33" }}>🎁</button>
                  <button onClick={()=>like(cur.id)}
                    style={{ width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#ff6eb4,#f472b6)",border:"none",fontSize:26,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px #ff6eb433" }}>❤️</button>
                </div>
              </div>
            )}

            {/* USER DETAIL MODAL */}
            {showUserDetail && (
              <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"#00000066",backdropFilter:"blur(6px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={()=>setShowUserDetail(null)}>
                <div style={{ background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 -8px 40px #ff6eb433" }} onClick={e=>e.stopPropagation()}>
                  {/* Header */}
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 18px 8px" }}>
                    <div>
                      <div style={{ fontSize:22,fontWeight:900 }}>{showUserDetail.name}, {showUserDetail.age}</div>
                      <div style={{ fontSize:13,color:C.muted,marginTop:2 }}>📍 {showUserDetail.city}</div>
                    </div>
                    <div style={{ fontSize:52 }}>{showUserDetail.emoji}</div>
                  </div>
                  <div style={{ height:1,background:C.border,margin:"0 18px" }}/>

                  {/* Info rows */}
                  <div style={{ padding:"10px 18px" }}>
                    {[
                      { icon:"⚧",  label:"Jins",    val:showUserDetail.gender==="ayol"?"👩 Ayol":"👨 Erkak" },
                      { icon:"🌍", label:"Millat",  val:showUserDetail.millat||"—" },
                      { icon:"💑", label:"Maqsad",  val:showUserDetail.goal||"—" },
                      { icon:"💍", label:"Turmush", val:showUserDetail.married==="ha"?"Ha, bo'lgan":"Yo'q" },
                      { icon:"👶", label:"Farzand", val:showUserDetail.children==="ha"?"Ha, bor":"Yo'q" },
                    ].map(r=>(
                      <div key={r.label} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:18,width:24 }}>{r.icon}</span>
                        <span style={{ fontSize:12,color:C.muted,width:68 }}>{r.label}</span>
                        <span style={{ fontSize:13,fontWeight:600 }}>{r.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  {showUserDetail.bio && (
                    <div style={{ margin:"0 18px 12px",background:"#f8fafc",borderRadius:14,padding:"12px 14px" }}>
                      <div style={{ fontSize:11,color:C.muted,marginBottom:4 }}>📝 Bio</div>
                      <div style={{ fontSize:14,color:C.text }}>{showUserDetail.bio}</div>
                    </div>
                  )}

                  {/* Hobbies */}
                  {showUserDetail.hobbies?.length>0 && (
                    <div style={{ padding:"0 18px 14px" }}>
                      <div style={{ fontSize:11,color:C.muted,marginBottom:6 }}>🎯 Qiziqishlar</div>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        {showUserDetail.hobbies.map(h=><span key={h} style={{ background:"#e0f2fe",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600,color:C.sky }}>{h}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div style={{ padding:"0 18px 8px" }}><Stars r={showUserDetail.rating}/></div>

                  {/* Action buttons */}
                  <div style={{ display:"flex",gap:10,padding:"10px 18px 24px" }}>
                    <button onClick={()=>{ dislike(); setShowUserDetail(null); }}
                      style={{ flex:1,background:"#f1f5f9",border:"none",borderRadius:14,padding:"12px",fontSize:20,cursor:"pointer",fontWeight:700 }}>✕ Inkor</button>
                    <button onClick={()=>{ setShowGiftSend(showUserDetail); setGiftNote(""); setShowUserDetail(null); }}
                      style={{ flex:1,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",borderRadius:14,padding:"12px",color:"#fff",fontSize:20,cursor:"pointer",fontWeight:700 }}>🎁 Sovg'a</button>
                    <button onClick={()=>{ like(showUserDetail.id); setShowUserDetail(null); }}
                      style={{ flex:1,background:"linear-gradient(135deg,#ff6eb4,#f472b6)",border:"none",borderRadius:14,padding:"12px",color:"#fff",fontSize:20,cursor:"pointer",fontWeight:700 }}>❤️ Do'st</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MATCHES */}
        {tab==="matches" && (
          <div style={{ padding:"12px 14px" }}>
            <div style={{ fontSize:16,fontWeight:800,marginBottom:10 }}>💞 Matchlar ({matchUsers.length})</div>
            {matchUsers.length===0 && <div style={{ color:C.muted,textAlign:"center",padding:40 }}>Hali matchlar yo'q. Like bosing! ❤️</div>}
            {matchUsers.map(u=>(
              <div key={u.id} onClick={()=>setChat(u.id)} style={{ display:"flex",alignItems:"center",gap:11,background:"#fff",borderRadius:15,padding:"10px 12px",marginBottom:8,cursor:"pointer",border:`1px solid ${C.border}`,boxShadow:"0 2px 8px #38bdf810" }}>
                <div style={{ position:"relative" }}>
                  <span style={{ fontSize:38 }}>{u.emoji}</span>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:u.online?C.green:C.muted,position:"absolute",bottom:2,right:2,border:"2px solid #fff" }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:5 }}>
                    {u.name}, {u.age}
                    {u.vip&&<span>👑</span>}
                    {superLiked.includes(u.id)&&<span style={{ fontSize:12,color:C.purple }}>⚡</span>}
                  </div>
                  <div style={{ fontSize:12,color:C.muted }}>{(msgs[u.id]||[]).slice(-1)[0]?.text||"Xabar yozing..."}</div>
                  <Stars r={u.rating}/>
                </div>
                <button onClick={e=>{ e.stopPropagation(); setReport(u); }} style={{ background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.muted }}>⚠️</button>
              </div>
            ))}
          </div>
        )}

        {/* SHOP */}
        {tab==="shop" && (
          <div style={{ padding:"12px 14px" }}>
            {/* VIP card */}
            <div style={{ background:"linear-gradient(135deg,#fef3c7,#fde68a)",borderRadius:18,padding:15,marginBottom:14,border:"1px solid #fcd34d" }}>
              <div style={{ fontWeight:900,fontSize:17,color:"#92400e" }}>👑 VIP A'zolik</div>
              <div style={{ fontSize:12,color:"#92400e",marginBottom:10,opacity:0.8 }}>Cheksiz like, superlike, video qo'ng'iroq, reklamsiz!</div>
              {vip ? (
                <div style={{ color:"#15803d",fontWeight:800,fontSize:14 }}>✅ Siz VIP a'zosiz!</div>
              ) : (
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {[{ label:"1 oy",plan:"month",price:500 },{ label:"3 oy",plan:"quarter",price:1200 },{ label:"1 yil",plan:"year",price:3500 }].map(p=>(
                    <button key={p.plan} onClick={()=>buyVip(p.plan)} style={{ background:`linear-gradient(90deg,${C.gold},#fbbf24cc)`,border:"none",borderRadius:11,padding:"7px 13px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12 }}>
                      {p.label}<br/><span style={{ fontSize:10 }}>🪙{p.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize:15,fontWeight:800,marginBottom:9 }}>🪙 Tanga sotib olish</div>
            {[{ amount:100,cost:"1$",color:C.sky },{ amount:300,cost:"2.5$",color:C.accent },{ amount:700,cost:"5$",color:C.purple },{ amount:1500,cost:"9$",color:C.green }].map(pkg=>(
              <div key={pkg.amount} style={{ background:"#fff",borderRadius:14,padding:13,marginBottom:8,border:`1px solid ${C.border}`,boxShadow:"0 2px 8px #38bdf810",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:800,fontSize:17 }}>🪙 {pkg.amount} tanga</div>
                  <div style={{ color:C.muted,fontSize:12 }}>{pkg.cost} narxida</div>
                </div>
                <button onClick={()=>{ setCoins(p=>p+pkg.amount); toast$(`✅ +${pkg.amount} tanga!`,C.green); }}
                  style={{ background:`linear-gradient(90deg,${pkg.color},${pkg.color}cc)`,border:"none",borderRadius:11,padding:"7px 14px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12 }}>
                  Sotib olish
                </button>
              </div>
            ))}

            <div style={{ fontSize:15,fontWeight:800,margin:"12px 0 8px" }}>🎁 Sovg'alar</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
              {GIFTS.map(g=>(
                <div key={g.id} style={{ background:`${g.color}18`,border:`1px solid ${g.color}44`,borderRadius:13,padding:10,textAlign:"center" }}>
                  <div style={{ fontSize:30 }}>{g.emoji}</div>
                  <div style={{ fontSize:11,fontWeight:700,marginTop:3 }}>{g.name}</div>
                  <div style={{ fontSize:11,color:C.sky }}>🪙{g.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab==="profile" && (
          <div style={{ padding:"12px 14px" }}>
            <div style={{ fontSize:16,fontWeight:800,marginBottom:10 }}>👤 Mening profilim</div>
            {profile ? (
              <div style={{ background:"#fff",borderRadius:20,padding:18,border:`1px solid ${C.border}`,boxShadow:"0 4px 16px #38bdf810" }}>
                <div style={{ textAlign:"center",marginBottom:14 }}>
                  <div style={{ fontSize:68 }}>{profile.gender==="ayol"?"👩":"👨"}</div>
                  {vip && <div style={{ color:C.gold,fontWeight:800,fontSize:12 }}>👑 VIP A'zo</div>}
                  <div style={{ fontWeight:900,fontSize:20,marginTop:4 }}>{profile.name}</div>
                  <div style={{ marginTop:4 }}><Stars r={4.5}/></div>
                </div>
                {[
                  { icon:"🎂", label:"Yosh",      val:`${profile.age} yosh` },
                  { icon:"📍", label:"Shahar",    val:profile.city||"—" },
                  { icon:"⚧",  label:"Jins",      val:profile.gender==="ayol"?"👩 Ayol":"👨 Erkak" },
                  { icon:"🌍", label:"Millat",    val:profile.millat||"—" },
                  { icon:"📞", label:"Telefon",   val:profile.phoneAnon?"🔒 Anonim":profile.phone||"—" },
                  { icon:"📸", label:"Instagram", val:profile.instagramAnon?"🔒 Anonim":profile.instagram||"—" },
                  { icon:"✈️", label:"Telegram",  val:profile.telegramAnon?"🔒 Anonim":profile.telegram||"—" },
                  { icon:"💑", label:"Maqsad",    val:profile.goal||"—" },
                  { icon:"💍", label:"Turmush",   val:profile.married==="ha"?"Ha, bo'lgan":"Yo'q" },
                  { icon:"👶", label:"Farzand",   val:profile.children==="ha"?"Ha, bor":"Yo'q" },
                  ...(profile.gender==="erkak"?[{ icon:"🚗", label:"Mashina", val:profile.car==="bor"?"🚗 Ha, bor":profile.car==="yoq"?"🚶 Yo'q":"—" }]:[]),
                ].map(row=>(
                  <div key={row.label} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:17,width:22,textAlign:"center" }}>{row.icon}</span>
                    <span style={{ fontSize:11,color:C.muted,width:70,flexShrink:0 }}>{row.label}</span>
                    <span style={{ fontSize:13,fontWeight:600,color:C.text,wordBreak:"break-all" }}>{row.val}</span>
                  </div>
                ))}
                {profile.hobbies&&profile.hobbies.length>0&&(
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:11,color:C.muted,marginBottom:5 }}>🎯 Qiziqishlar</div>
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                      {profile.hobbies.map(h=><span key={h} style={{ background:"#e0f2fe",borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:600,color:C.sky }}>{h}</span>)}
                    </div>
                  </div>
                )}
                {profile.bio&&(
                  <div style={{ marginTop:10,background:"#f8fafc",borderRadius:11,padding:"9px 12px" }}>
                    <div style={{ fontSize:11,color:C.muted,marginBottom:2 }}>📝 Bio</div>
                    <div style={{ fontSize:13,color:C.text }}>{profile.bio}</div>
                  </div>
                )}
                <div style={{ display:"flex",gap:8,marginTop:13 }}>
                  <button onClick={()=>setProfile(null)} style={{ flex:1,background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:12,padding:"9px",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:13 }}>✏️ Tahrirlash</button>
                  {!vip&&<button onClick={()=>setTab("shop")} style={{ flex:1,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",border:"none",borderRadius:12,padding:"9px",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:13 }}>👑 VIP</button>}
                </div>
              </div>
            ) : (
              <div>
                {/* JINS */}
                <div style={{ marginBottom:11 }}>
                  <label style={{ fontSize:12,color:C.muted,marginBottom:5,display:"block" }}>⚧ Jinsingiz</label>
                  <div style={{ display:"flex",gap:8 }}>
                    {["ayol","erkak"].map(g=>(
                      <button key={g} onClick={()=>setForm(p=>({...p,gender:g}))}
                        style={{ flex:1,padding:"9px",borderRadius:11,border:`2px solid ${form.gender===g?C.accent:C.border}`,background:form.gender===g?(g==="ayol"?"linear-gradient(135deg,#ff6eb4,#f472b6)":"linear-gradient(135deg,#38bdf8,#3b82f6)"):"#f0f9ff",color:form.gender===g?"#fff":C.text,fontWeight:700,cursor:"pointer",fontSize:13 }}>
                        {g==="ayol"?"👩 Ayol":"👨 Erkak"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ASOSIY MAYDONLAR */}
                {[
                  { key:"name", label:"👤 Ism va familiya", ph:"Ism Familiya" },
                  { key:"age",  label:"🎂 Yoshingiz (18-99)", ph:"Masalan: 24", type:"number", min:18, max:99 },
                  { key:"city", label:"📍 Shahringiz",      ph:"Toshkent, Samarqand..." },
                  { key:"bio",  label:"📝 O'zingiz haqida", ph:"Qisqacha o'zingizni tanishtiring..." },
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:10 }}>
                    <label style={{ fontSize:12,color:C.muted,marginBottom:4,display:"block" }}>{f.label}</label>
                    <input value={form[f.key]} onChange={e=>{
                        let v=e.target.value;
                        if(f.key==="age"){ if(v&&(+v<18||+v>99)) return; }
                        setForm(p=>({...p,[f.key]:v}));
                      }} placeholder={f.ph} type={f.type||"text"} min={f.min} max={f.max}
                      style={{ width:"100%",background:"#f0f9ff",border:`1px solid ${C.border}`,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box" }}/>
                  </div>
                ))}

                {/* MILLAT */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12,color:C.muted,marginBottom:6,display:"block" }}>🌍 Millat</label>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {[
                      { label:"🇺🇿 O'zbek", val:"O'zbek" },
                      { label:"🇹🇯 Tojik",   val:"Tojik" },
                      { label:"🇰🇿 Qozoq",   val:"Qozoq" },
                      { label:"🇷🇺 Rus",     val:"Rus" },
                      { label:"🇰🇬 Qirg'iz", val:"Qirg'iz" },
                      { label:"🌐 Boshqa",   val:"Boshqa" },
                    ].map(m=>(
                      <button key={m.val} onClick={()=>setForm(p=>({...p,millat:m.val}))}
                        style={{ padding:"7px 13px",borderRadius:20,border:`2px solid ${form.millat===m.val?C.accent:C.border}`,background:form.millat===m.val?"linear-gradient(135deg,#ff6eb4,#38bdf8)":"#f0f9ff",color:form.millat===m.val?"#fff":C.text,fontWeight:form.millat===m.val?700:400,cursor:"pointer",fontSize:12,transition:"all 0.2s" }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ALOQA MA'LUMOTLARI - ANONIM VARIANT */}
                {[
                  { key:"phone", anonKey:"phoneAnon", icon:"📞", label:"Telefon raqam", ph:"+998 90 123 45 67" },
                  { key:"instagram", anonKey:"instagramAnon", icon:"📸", label:"Instagram", ph:"@username" },
                  { key:"telegram", anonKey:"telegramAnon", icon:"✈️", label:"Telegram", ph:"@username" },
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                      <label style={{ fontSize:12,color:C.muted }}>{f.icon} {f.label}</label>
                      <button onClick={()=>setForm(p=>({...p,[f.anonKey]:!p[f.anonKey]}))}
                        style={{ display:"flex",alignItems:"center",gap:5,background:form[f.anonKey]?"#fef3c7":"#f0f9ff",border:`1px solid ${form[f.anonKey]?C.gold:C.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",fontSize:11,fontWeight:600,color:form[f.anonKey]?C.gold:C.muted }}>
                        {form[f.anonKey]?"🔒 Anonim":"👁 Ko'rsatish"}
                      </button>
                    </div>
                    {form[f.anonKey] ? (
                      <div style={{ background:"#fef9ec",border:`1px dashed ${C.gold}`,borderRadius:11,padding:"9px 12px",fontSize:12,color:C.gold,fontWeight:600 }}>
                        🔒 Bu ma'lumot yashirin — faqat siz ko'rasiz
                      </div>
                    ) : (
                      <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                        style={{ width:"100%",background:"#f0f9ff",border:`1px solid ${C.border}`,borderRadius:11,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box" }}/>
                    )}
                  </div>
                ))}

                {/* MUNOSABAT MAQSADI */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12,color:C.muted,marginBottom:5,display:"block" }}>💑 Munosabat maqsadi</label>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {["Do'stlik","Jiddiy munosabat","Nikoh","Suhbat","Hali bilmayman"].map(g=>(
                      <button key={g} onClick={()=>setForm(p=>({...p,goal:g}))}
                        style={{ padding:"5px 11px",borderRadius:20,border:`2px solid ${form.goal===g?C.accent:C.border}`,background:form.goal===g?C.accent:"#f0f9ff",color:form.goal===g?"#fff":C.text,fontWeight:form.goal===g?700:400,cursor:"pointer",fontSize:11 }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QIZIQISHLAR */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12,color:C.muted,marginBottom:5,display:"block" }}>🎯 Qiziqishlar (hobbies)</label>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {["🎵 Musiqa","📚 Kitob","⚽ Sport","✈️ Sayohat","🎬 Kino","🍳 Pishiriq","🎮 O'yin","💻 IT","🎨 San'at","🧘 Yoga","📸 Foto","🌿 Tabiat"].map(h=>(
                      <button key={h} onClick={()=>setForm(p=>({ ...p, hobbies: p.hobbies.includes(h)?p.hobbies.filter(x=>x!==h):[...p.hobbies,h] }))}
                        style={{ padding:"5px 10px",borderRadius:20,border:`2px solid ${form.hobbies.includes(h)?C.sky:C.border}`,background:form.hobbies.includes(h)?C.sky:"#f0f9ff",color:form.hobbies.includes(h)?"#fff":C.text,fontWeight:form.hobbies.includes(h)?700:400,cursor:"pointer",fontSize:11 }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OLDIN TURMUSH */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12,color:C.muted,marginBottom:5,display:"block" }}>💍 Oldin turmush qurganmisiz?</label>
                  <div style={{ display:"flex",gap:8 }}>
                    {["yoq","ha"].map(v=>(
                      <button key={v} onClick={()=>setForm(p=>({...p,married:v}))}
                        style={{ flex:1,padding:"8px",borderRadius:11,border:`2px solid ${form.married===v?C.accent:C.border}`,background:form.married===v?C.accent:"#f0f9ff",color:form.married===v?"#fff":C.text,fontWeight:700,cursor:"pointer",fontSize:13 }}>
                        {v==="yoq"?"✅ Yo'q":"⚠️ Ha"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FARZAND */}
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12,color:C.muted,marginBottom:5,display:"block" }}>👶 Farzandingiz bormi?</label>
                  <div style={{ display:"flex",gap:8 }}>
                    {["yoq","ha"].map(v=>(
                      <button key={v} onClick={()=>setForm(p=>({...p,children:v}))}
                        style={{ flex:1,padding:"8px",borderRadius:11,border:`2px solid ${form.children===v?C.sky:C.border}`,background:form.children===v?C.sky:"#f0f9ff",color:form.children===v?"#fff":C.text,fontWeight:700,cursor:"pointer",fontSize:13 }}>
                        {v==="yoq"?"✅ Yo'q":"👶 Ha"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MASHINA - FAQAT ERKAKLAR */}
                {form.gender==="erkak" && (
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12,color:C.muted,marginBottom:5,display:"block" }}>🚗 Mashinangiz bormi?</label>
                    <div style={{ display:"flex",gap:8 }}>
                      {["bor","yoq"].map(v=>(
                        <button key={v} onClick={()=>setForm(p=>({...p,car:v}))}
                          style={{ flex:1,padding:"10px",borderRadius:11,border:`2px solid ${form.car===v?(v==="bor"?"#3b82f6":C.border):C.border}`,background:form.car===v?(v==="bor"?"linear-gradient(135deg,#38bdf8,#3b82f6)":"#f0f9ff"):"#f0f9ff",color:form.car===v&&v==="bor"?"#fff":C.text,fontWeight:700,cursor:"pointer",fontSize:13,transition:"all 0.2s" }}>
                          {v==="bor"?"🚗 Ha, bor":"🚶 Yo'q"}
                        </button>
                      ))}
                    </div>
                    {form.car==="bor" && (
                      <div style={{ marginTop:8,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:11,padding:"8px 12px",fontSize:12,color:"#2563eb",fontWeight:600 }}>
                        🚗 Mashinangiz bor — bu ayollar uchun jozibali!
                      </div>
                    )}
                  </div>
                )}

                <button onClick={()=>{
                  if (!form.name||!form.age){ toast$("Ism va yosh majburiy!","#ef4444"); return; }
                  if (!form.gender){ toast$("Jinsni tanlang!","#ef4444"); return; }
                  setProfile(form); toast$("✅ Profil saqlandi!",C.green);
                }} style={{ width:"100%",background:"linear-gradient(90deg,#ff6eb4,#38bdf8)",border:"none",borderRadius:13,padding:"12px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",marginTop:2 }}>
                  💾 Saqlash
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:`1px solid ${C.border}`,display:"flex",zIndex:100,boxShadow:"0 -4px 20px #38bdf814" }}>
        {[{ key:"discover",icon:"🔥",label:"Kashf et" },{ key:"matches",icon:"💞",label:"Matchlar" },{ key:"shop",icon:"🛒",label:"Do'kon" },{ key:"profile",icon:"👤",label:"Profil" }].map(item=>(
          <div key={item.key} onClick={()=>setTab(item.key)}
            style={{ flex:1,padding:"10px 0",textAlign:"center",cursor:"pointer",background:tab===item.key?"rgba(255,110,180,0.07)":"transparent",borderTop:tab===item.key?`2px solid ${C.accent}`:"2px solid transparent" }}>
            <div style={{ fontSize:20 }}>{item.icon}</div>
            <div style={{ fontSize:9,color:tab===item.key?C.accent:C.muted,fontWeight:tab===item.key?700:400 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
