(function(){
  'use strict';
  const $ = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> (r||document).querySelectorAll(s);
  const on = (e,ev,cb,o)=> e&&e.addEventListener(ev,cb,o||false);

  // Версия
  const ver = document.body?.dataset?.version || 'dev';
  const verEl = $('#appVersion'); if (verEl) verEl.textContent = 'v'+ver;

  // Telegram SDK + теминг
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg){ tg.expand && tg.expand(); tg.ready && tg.ready(); }
  function applyTheme(){
    if (!tg?.themeParams) return;
    const p = tg.themeParams;
    p.bg_color && document.documentElement.style.setProperty('--bg', p.bg_color);
    p.text_color && document.documentElement.style.setProperty('--text', p.text_color);
    p.hint_color && document.documentElement.style.setProperty('--muted', p.hint_color);
    p.button_color && document.documentElement.style.setProperty('--accent', p.button_color);
    p.button_text_color && document.documentElement.style.setProperty('--accent-2', p.button_text_color);
  }
  applyTheme();
  tg?.onEvent?.('themeChanged', applyTheme);

  // Данные
  const activities=[{type:'sea',date:'29.12.2025',text:'Пляж Джомтьен + детская зона'},{type:'sea',date:'30.12.2025',text:'Пляж Вонгамат + водные горки'},{type:'sight',date:'31.12.2025',text:'Ват Янсангварам + прогулка по парку'},{type:'sea',date:'01.01.2026',text:'Пляж Паттайя + Underwater World'},{type:'sea',date:'02.01.2026',text:'Морская прогулка к Ко Лан (снорклинг)'},{type:'sight',date:'03.01.2026',text:'Сад Нонг Нуч + шоу слонов'},{type:'sea',date:'04.01.2026',text:'Пляж Джомтьен'},{type:'sea',date:'05.01.2026',text:'Пляж Вонгамат + аренда байка'},{type:'sight',date:'06.01.2026',text:'Ват Кхао Пхра Бат + обзорная площадка'},{type:'sea',date:'07.01.2026',text:'Морская прогулка к Ко Сичанг'},{type:'sea',date:'08.01.2026',text:'Пляж Паттайя'},{type:'sight',date:'09.01.2026',text:'Dolphin World + детская зона'},{type:'sea',date:'10.01.2026',text:'Пляж Джомтьен'},{type:'sight',date:'11.01.2026',text:'Батискаф (12.969175,100.888124)'},{type:'sight',date:'12.01.2026',text:'Art in Paradise + плавучий рынок'},{type:'sea',date:'13.01.2026',text:'Пляж Вонгамат'},{type:'sea',date:'14.01.2026',text:'Пляж Паттайя'},{type:'sight',date:'15.01.2026',text:'Мини-Сиам + детские аттракционы'},{type:'sea',date:'16.01.2026',text:'Морская прогулка к Ко Лан'},{type:'sea',date:'17.01.2026',text:'Пляж Джомтьен'},{type:'sight',date:'18.01.2026',text:'Sea Life Pattaya (аквариум)'},{type:'sea',date:'19.01.2026',text:'Пляж Вонгамат'},{type:'sea',date:'20.01.2026',text:'Пляж Паттайя'},{type:'sight',date:'21.01.2026',text:'Ват Пхра Яй + парк Люксор'},{type:'sea',date:'22.01.2026',text:'Пляж Джомтьен'},{type:'sea',date:'23.01.2026',text:'Пляж Вонгамат'},{type:'sight',date:'24.01.2026',text:'Central Festival + фуд-корт'},{type:'sea',date:'25.01.2026',text:'Пляж Паттайя'}];

  // DOM
  const cardsWrap = $('#cards');         // ВАЖНО: отдельный контейнер
  const skeletons = $('#skeletons');    // отдельный контейнер скелетонов
  const emptyState = $('#emptyState');
  const filters = $$('.filter');
  const tabs = $$('.tab');
  const overlay = $('#overlay');
  const details = $('#details');
  const closeBtn = $('#closeBtn');
  const detailsTitle = $('#detailsTitle');
  const scheduleList = $('#scheduleList');
  const todayBtn = $('#todayBtn');
  const resetFilters = $('#resetFilters');

  // Время утилиты
  const add=(h,m,add)=>{const d=new Date(2000,0,1,h,m,0);d.setMinutes(d.getMinutes()+add);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)};
  const t=s=>{const a=s.split(':');return {h:+a[0],m:+a[1]}};

  function generateSchedule(act){
    const departAt='09:00', travelSea=40, travelSight=30, buf=10;
    const rows=[];
    rows.push(`${departAt} — Выход из дома (вода 1 л/чел., SPF 50+, шляпы, наличные)`);
    const trvl = act.type==='sea'?travelSea:travelSight;
    const arr1 = add(t(departAt).h, t(departAt).m, trvl);
    rows.push(`${departAt}–${arr1} — Дорога (${trvl} мин)`);

    if (act.type==='sea'){
      const loc = act.text.split(' +')[0];
      const startSea=add(t(arr1).h,t(arr1).m,buf), endSea1=add(t(startSea).h,t(startSea).m,150);
      rows.push(`${startSea}–${endSea1} — Пляж ${loc} (тень/зонт, купание, перекус, SPF каждые 2 ч)`);
      const startLunch=add(t(endSea1).h,t(endSea1).m,buf), endLunch=add(t(startLunch).h,t(startLunch).m,60);
      rows.push(`${startLunch}–${endLunch} — Обед рядом (кондиционер, пополнить воду)`);
      const startSiesta=add(t(endLunch).h,t(endLunch).m,buf), endSiesta=add(t(startSiesta).h,t(startSiesta).m,60);
      rows.push(`${startSiesta}–${endSiesta} — Отдых в тени/индор‑зона`);
      const startSea2=add(t(endSiesta).h,t(endSiesta).m,buf), endSea2=add(t(startSea2).h,t(startSea2).m,120);
      rows.push(`${startSea2}–${endSea2} — Пляж ${loc} (закат/фото/прогулка)`);
      const startBack=add(t(endSea2).h,t(endSea2).m,buf), endBack=add(t(startBack).h,t(startBack).m,trvl);
      rows.push(`${startBack}–${endBack} — Дорога домой (${trvl} мин)`);
      rows.push(`${endBack} — Душ/ужин/подготовка на завтра`);
    } else {
      const [main, sub='ближайшая локация'] = act.text.split(' +');
      const startMain=add(t(arr1).h,t(arr1).m,buf), endMain=add(t(startMain).h,t(startMain).m,120);
      rows.push(`${startMain}–${endMain} — ${main} (билеты/скан, дресс‑код, аудиогид)`);
      const startLunch=add(t(endMain).h,t(endMain).m,buf), endLunch=add(t(startLunch).h,t(startLunch).m,60);
      rows.push(`${startLunch}–${endLunch} — Обед поблизости (пополнить воду)`);
      const startSub=add(t(endLunch).h,t(endLunch).m,buf), endSub=add(t(startSub).h,t(startSub).m,120);
      rows.push(`${startSub}–${endSub} — ${sub} (прогулка/детская зона/фото)`);
      const startBack=add(t(endSub).h,t(endSub).m,buf), endBack=add(t(startBack).h,t(startBack).m,trvl);
      rows.push(`${startBack}–${endBack} — Дорога домой (${trvl} мин)`);
      rows.push(`${endBack} — Душ/ужин/подготовка на завтра`);
    }
    return rows;
  }

  function renderCards(list){
    cardsWrap.innerHTML='';
    list.forEach((a,i)=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='card '+a.type;
      card.dataset.index=String(i);
      card.innerHTML=`<div class="card-header">${i+1}. ${a.date}</div><div class="card-body">${a.text}</div>`;
      cardsWrap.appendChild(card);
    });
    cardsWrap.classList.remove('hidden');
    cardsWrap.setAttribute('aria-busy','false');
    skeletons.classList.add('hidden');
  }
  // Рендер сразу (без таймера) — чтобы избежать мигания
  renderCards(activities);

  function showTab(id){
    $$('.tab-content').forEach(p=>p.classList.add('hidden'));
    document.getElementById(id)?.classList.remove('hidden');
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===id));
  }
  tabs.forEach(btn=>{
    on(btn,'click',()=>showTab(btn.dataset.tab));
    on(btn,'touchstart',()=>showTab(btn.dataset.tab),{passive:true});
  });

  function applyFilter(type){
    filters.forEach(f=>{
      const active = (f.dataset.filter===type) || (type==='all'&&f.dataset.filter==='all');
      f.classList.toggle('active', active);
      f.setAttribute('aria-pressed', active?'true':'false');
    });
    const cards=$$('#cards .card'); let visible=0;
    cards.forEach(c=>{ const show=(type==='all'||c.classList.contains(type)); c.style.display=show?'flex':'none'; if(show)visible++; });
    emptyState.classList.toggle('hidden', visible>0);
  }
  filters.forEach(btn=>{
    const type=btn.dataset.filter;
    on(btn,'click',()=>applyFilter(type));
    on(btn,'touchstart',()=>applyFilter(type),{passive:true});
  });
  on(resetFilters,'click',()=>applyFilter('all'));

  function openDetails(idx){
    const act=activities[idx]; if(!act) return;
    detailsTitle.textContent=`День ${idx+1} • ${act.date}`;
    scheduleList.innerHTML='';
    generateSchedule(act).forEach(row=>{const li=document.createElement('li'); li.textContent=row; scheduleList.appendChild(li);});
    overlay.classList.remove('hidden'); details.classList.remove('hidden');
    overlay.style.display='block'; details.style.display='block'; overlay.setAttribute('aria-hidden','false');
  }
  function closeDetails(){ overlay.classList.add('hidden'); details.classList.add('hidden'); overlay.style.display='none'; details.style.display='none'; overlay.setAttribute('aria-hidden','true'); }

  on(overlay,'click',closeDetails); on(closeBtn,'click',closeDetails);
  on(cardsWrap,'click',e=>{const card=e.target.closest('.card'); if(!card)return; openDetails(+card.dataset.index);});
  on(cardsWrap,'touchstart',e=>{const card=e.target.closest('.card'); if(!card)return; openDetails(+card.dataset.index);},{passive:true});

  on(todayBtn,'click',()=>{ const first=$('#cards .card'); if(first){ first.scrollIntoView({behavior:'smooth',block:'center'}); first.style.filter='brightness(1.08)'; setTimeout(()=>first.style.filter='',600);} });

  showTab('calendar');
})();
