(function(){
  'use strict';

  // Универсальный запуск init
  function ready(run){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once:true });
    } else {
      run();
    }
  }

  ready(function init(){
    const $ = (s,r)=> (r||document).querySelector(s);
    const $all = (s,r)=> (r||document).querySelectorAll(s);
    const on = (e,t,c,o)=>{ if(e) e.addEventListener(t,c,o||false); };

    // Telegram SDK
    const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
    if (tg){ tg.expand && tg.expand(); tg.ready && tg.ready(); }

    // BackButton
    const backBtn = (tg && tg.BackButton) ? tg.BackButton : null;
    const showBack = ()=>{ if (backBtn && typeof backBtn.show==='function') backBtn.show(); };
    const hideBack = ()=>{ if (backBtn && typeof backBtn.hide==='function') backBtn.hide(); };
    hideBack();
    tg && tg.onEvent && tg.onEvent('back_button_pressed', ()=> closeDetails());

    // Данные
    const activities = [
      { type:'sea',   date:'29.12.2025', text:'Пляж Джомтьен + детская зона' },
      { type:'sea',   date:'30.12.2025', text:'Пляж Вонгамат + водные горки' },
      { type:'sight', date:'31.12.2025', text:'Ват Янсангварам + прогулка по парку' },
      { type:'sea',   date:'01.01.2026', text:'Пляж Паттайя + Underwater World' },
      { type:'sea',   date:'02.01.2026', text:'Морская прогулка к Ко Лан (снорклинг)' },
      { type:'sight', date:'03.01.2026', text:'Сад Нонг Нуч + шоу слонов' },
      { type:'sea',   date:'04.01.2026', text:'Пляж Джомтьен' },
      { type:'sea',   date:'05.01.2026', text:'Пляж Вонгамат + аренда байка' },
      { type:'sight', date:'06.01.2026', text:'Ват Кхао Пхра Бат + обзорная площадка' },
      { type:'sea',   date:'07.01.2026', text:'Морская прогулка к Ко Сичанг' },
      { type:'sea',   date:'08.01.2026', text:'Пляж Паттайя' },
      { type:'sight', date:'09.01.2026', text:'Dolphin World + детская зона' },
      { type:'sea',   date:'10.01.2026', text:'Пляж Джомтьен' },
      { type:'sight', date:'11.01.2026', text:'Батискаф (12.969175,100.888124)' },
      { type:'sight', date:'12.01.2026', text:'Art in Paradise + плавучий рынок' },
      { type:'sea',   date:'13.01.2026', text:'Пляж Вонгамат' },
      { type:'sea',   date:'14.01.2026', text:'Пляж Паттайя' },
      { type:'sight', date:'15.01.2026', text:'Мини-Сиам + детские аттракционы' },
      { type:'sea',   date:'16.01.2026', text:'Морская прогулка к Ко Лан' },
      { type:'sea',   date:'17.01.2026', text:'Пляж Джомтьен' },
      { type:'sight', date:'18.01.2026', text:'Sea Life Pattaya (аквариум)' },
      { type:'sea',   date:'19.01.2026', text:'Пляж Вонгамат' },
      { type:'sea',   date:'20.01.2026', text:'Пляж Паттайя' },
      { type:'sight', date:'21.01.2026', text:'Ват Пхра Яй + парк Люксор' },
      { type:'sea',   date:'22.01.2026', text:'Пляж Джомтьен' },
      { type:'sea',   date:'23.01.2026', text:'Пляж Вонгамат' },
      { type:'sight', date:'24.01.2026', text:'Central Festival + фуд-корт' },
      { type:'sea',   date:'25.01.2026', text:'Пляж Паттайя' }
    ];

    // DOM
    const cardsWrap = $('#cards'), skeletons = $('#skeletons'), emptyState = $('#emptyState'), filters = $all('.filter'), tabs = $all('.tab');
    const overlay = $('#overlay'), details = $('#details'), closeBtn = $('#closeBtn'), detailsTitle = $('#detailsTitle'), scheduleList = $('#scheduleList'), resetFilters = $('#resetFilters'), countdownBtn = $('#countdownBtn'), footerVer = $('#appVersionFooter');

    // Версия внизу "Контактов"
    if (footerVer){ footerVer.textContent = document.body.dataset.version || 'v0.0.0'; }

    // Принудительно скрываем модалку
    if (overlay){ overlay.style.display='none'; overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); }
    if (details){ details.style.display='none'; details.classList.add('hidden'); }

    // Время helpers
    const add = (hh,mm,addMin)=>{ const d=new Date(2000,0,1,hh,mm,0); d.setMinutes(d.getMinutes()+addMin); return (`0${d.getHours()}`).slice(-2)+':'+(`0${d.getMinutes()}`).slice(-2); };
    const parseTime = (s)=>{ const a=s.split(':'); return {h:+a[0], m:+a[1]}; };
    const parseDMY = (dmy)=>{ const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy); if(!m) return null; return new Date(+m[3],+m[2]-1,+m[1],0,0,0,0); };

    // UTC‑сутки для «До поездки»
    const daysUntil = (start)=>{ if(!start) return null; const now=new Date(); const s=Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()); const t=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()); return Math.ceil((s-t)/86400000); };

    const updateCountdown = ()=>{ if(!countdownBtn) return; const start=parseDMY(activities[0]&&activities[0].date); const d=daysUntil(start); countdownBtn.textContent=(d>0)?(`⏳ До поездки: ${d} дней`):(d===0?'🎒 Поездка сегодня':'🏝️ Поездка началась'); };
    updateCountdown(); setInterval(updateCountdown, 3600000);

    // Генерация расписания дня
    function generateSchedule(act){
      const departAt='09:00', travelSea=40, travelSight=30, buf=10;
      const rows=[];
      rows.push(`${departAt} — Выход из дома (вода 1 л/чел., SPF 50+, шляпы, наличные)`);
      const trvl=(act.type==='sea')?travelSea:travelSight; const arr1=add(parseTime(departAt).h, parseTime(departAt).m, trvl);
      rows.push(`${departAt}–${arr1} — Дорога (${trvl} мин)`);
      if(act.type==='sea'){
        const loc=act.text.split(' +')[0];
        const startSea=add(parseTime(arr1).h, parseTime(arr1).m, buf), endSea1=add(parseTime(startSea).h, parseTime(startSea).m, 150);
        rows.push(`${startSea}–${endSea1} — Пляж ${loc}`);
        const startLunch=add(parseTime(endSea1).h, parseTime(endSea1).m, buf), endLunch=add(parseTime(startLunch).h, parseTime(startLunch).m, 60);
        rows.push(`${startLunch}–${endLunch} — Обед рядом`);
        const startSea2=add(parseTime(endLunch).h, parseTime(endLunch).m, buf), endSea2=add(parseTime(startSea2).h, parseTime(startSea2).m, 120);
        rows.push(`${startSea2}–${endSea2} — Пляж ${loc}`);
        const startBack=add(parseTime(endSea2).h, parseTime(endSea2).m, buf), endBack=add(parseTime(startBack).h, parseTime(startBack).m, trvl);
        rows.push(`${startBack}–${endBack} — Дорога домой`);
      } else {
        const parts=act.text.split(' +'), main=parts[0], sub=parts[1]||'ближайшая локация';
        const startMain=add(parseTime(arr1).h, parseTime(arr1).m, buf), endMain=add(parseTime(startMain).h, parseTime(startMain).m, 120);
        rows.push(`${startMain}–${endMain} — ${main}`);
        const startSub=add(parseTime(endMain).h, parseTime(endMain).m, buf), endSub=add(parseTime(startSub).h, parseTime(startSub).m, 120);
        rows.push(`${startSub}–${endSub} — ${sub}`);
        const startBackS=add(parseTime(endSub).h, parseTime(endSub).m, buf), endBackS=add(parseTime(startBackS).h, parseTime(startBackS).m, trvl);
        rows.push(`${startBackS}–${endBackS} — Дорога домой`);
      }
      return rows;
    }

    // Показ/скрытие модалки
    function showModal(){
      overlay.classList.remove('hidden');
      details.classList.remove('hidden');
      overlay.style.display='block';
      details.style.display='block';
      overlay.setAttribute('aria-hidden','false');
      showBack();
    }
    function hideModal(){
      overlay.classList.add('hidden');
      details.classList.add('hidden');
      overlay.setAttribute('aria-hidden','true');
      overlay.style.display='none';
      details.style.display='none';
      hideBack();
    }

    function openDetails(idx){
      const act=activities[idx]; if(!act) return;
      detailsTitle.textContent=`День ${idx+1} • ${act.date}`;
      scheduleList.innerHTML='';
      const plan=generateSchedule(act);
      for (let i=0;i<plan.length;i++){ const li=document.createElement('li'); li.textContent=plan[i]; scheduleList.appendChild(li); }
      try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred && tg.HapticFeedback.impactOccurred('medium'); }catch(e){}
      setTimeout(showModal, 0);
    }
    function closeDetails(){ hideModal(); }

    // Закрытие: только клик по фону и кнопке
    on(overlay,'click', (e)=>{ if(e.target===overlay) closeDetails(); });
    on(closeBtn,'click',(e)=>{ e.preventDefault(); e.stopPropagation(); closeDetails(); });

    // Рендер карточек
    function renderCards(list){
      cardsWrap.innerHTML='';
      for (let i=0;i<list.length;i++){
        const a=list[i], card=document.createElement('button');
        card.type='button'; card.className='card '+a.type; card.setAttribute('data-index', String(i));
        card.innerHTML=`<div class="card-header">${i+1}. ${a.date}</div><div class="card-body">${a.text}</div>`;
        on(card,'click',(e)=>{ e.preventDefault(); e.stopPropagation(); const idx=Number(card.getAttribute('data-index')); if(!isNaN(idx)) openDetails(idx); });
        cardsWrap.appendChild(card);
      }
      cardsWrap.classList.remove('hidden');
      cardsWrap.setAttribute('aria-busy','false');
      if (skeletons && skeletons.parentNode){ skeletons.parentNode.removeChild(skeletons); }
      // Делегирование (резерв)
      on(cardsWrap,'click',(e)=>{ const el=e.target.closest?e.target.closest('.card'):null; if(!el) return; e.preventDefault(); e.stopPropagation(); const i=Number(el.getAttribute('data-index')); if(!isNaN(i)) openDetails(i); });
    }
    renderCards(activities);

    // Вкладки
    function showTab(id){
      const panels=$all('.tab-content'); for (let i=0;i<panels.length;i++) panels[i].classList.add('hidden');
      const p=document.getElementById(id); if(p) p.classList.remove('hidden');
      for (let j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id);
    }
    for (let i=0;i<tabs.length;i++){ const btn=tabs[i]; on(btn,'click', ()=>{ showTab(btn.dataset.tab); }); }

    // Фильтры
    function applyFilter(type){
      for (let i=0;i<filters.length;i++){
        const active=(filters[i].dataset.filter===type)||(type==='all'&&filters[i].dataset.filter==='all');
        filters[i].classList.toggle('active', active);
        filters[i].setAttribute('aria-pressed', active?'true':'false');
      }
      const cards=$all('#cards .card'); let visible=0;
      for (let k=0;k<cards.length;k++){
        const show=(type==='all'||cards[k].classList.contains(type));
        cards[k].style.display=show?'flex':'none';
        if (show) visible++;
      }
      emptyState.classList.toggle('hidden', visible>0);
    }
    for (let i=0;i<filters.length;i++){ const btn=filters[i]; on(btn,'click', ()=> applyFilter(btn.dataset.filter)); }
    on(resetFilters,'click', ()=> applyFilter('all'));

    // Единый обработчик ссылок на блюда (класс .dish-link)
    document.addEventListener('click', function(e){
      const a = e.target.closest && e.target.closest('.dish-link');
      if (!a) return;
      e.preventDefault();
      const url = a.getAttribute('href');
      if (!url) return;
      if (tg && typeof tg.openLink === 'function'){
        tg.openLink(url); // встроенный браузер Telegram
      } else {
        window.open(url, '_blank', 'noopener'); // fallback
      }
    }, false);
  });
})();
