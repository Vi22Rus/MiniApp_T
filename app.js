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

    // Данные поездки (с базовой практической инфой)
    const activities = [
      { type:'sight', date:'31.12.2025', title:'Ват Ян (Wat Yansangwararam)',
        gps:{lat:12.7889,lng:100.9581}, open:'ежедн. ~08:00–17:00', price:'донейшн',
        transport:[
          'Сонгтео: центр→Сукхумвит (10+20 бат), далее такси',
          'Тук‑тук (как такси): от 100 бат'
        ],
        lunch:[ 'Фудкорт Central Festival (11:00–23:00)' ],
        tips:[ 'Дресс‑код: закрытые плечи/колени', 'Пить бутилированную воду' ]
      },
      { type:'sea', date:'01.01.2026', title:'Пляж Джомтьен',
        gps:{lat:12.8750,lng:100.8889}, open:'24/7', price:'бесплатно',
        transport:[ 'Сонгтео центр↔Джомтьен: 10 бат', 'Белые сонгтео по Сукхумвит: 20 бат' ],
        lunch:[ 'The Glass House: блюда ~200–500 бат' ],
        tips:[ 'Лучшее время: до 11:00 и после 16:00', 'SPF и вода 1 л/чел.' ]
      },
      { type:'sight', date:'24.01.2026', title:'Central Festival Pattaya',
        gps:{lat:12.934546,lng:100.883775}, open:'ежедн. 11:00–23:00', price:'вход свободный',
        transport:[ 'Сонгтео по Beach/Second Rd: 10 бат' ],
        lunch:[ 'Фудкорт: большой выбор, кондиционер' ],
        tips:[ 'Удобный ориентир в центре', 'Есть зоны отдыха' ]
      },
      // Добавьте остальные дни по аналогии…
      { type:'sea',   date:'29.12.2025', title:'Пляж Вонгамат' },
      { type:'sight', date:'03.01.2026', title:'Сад Нонг Нуч' },
      { type:'sea',   date:'02.01.2026', title:'Ко Лан (снорклинг)' },
      { type:'sight', date:'18.01.2026', title:'Sea Life Pattaya' },
      { type:'sea',   date:'25.01.2026', title:'Пляж Паттайя' }
    ];

    // DOM
    const cardsWrap = $('#cards'), skeletons = $('#skeletons'), emptyState = $('#emptyState'), filters = $all('.filter'), tabs = $all('.tab');
    const overlay = $('#overlay'), details = $('#details'), closeBtn = $('#closeBtn'), detailsTitle = $('#detailsTitle'), scheduleList = $('#scheduleList'), resetFilters = $('#resetFilters'), countdownBtn = $('#countdownBtn'), footerVer = $('#appVersionFooter');

    // Версия внизу "Контактов"
    if (footerVer){ footerVer.textContent = document.body.dataset.version || 'v0.0.0'; }

    // Принудительно скрываем модалку
    if (overlay){ overlay.style.display='none'; overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); }
    if (details){ details.style.display='none'; details.classList.add('hidden'); }

    // Helpers
    const add = (hh,mm,addMin)=>{ const d=new Date(2000,0,1,hh,mm,0); d.setMinutes(d.getMinutes()+addMin); return (`0${d.getHours()}`).slice(-2)+':'+(`0${d.getMinutes()}`).slice(-2); };
    const parseTime = (s)=>{ const a=s.split(':'); return {h:+a[0], m:+a[1]}; };
    const parseDMY = (dmy)=>{ const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy); if(!m) return null; return new Date(+m[3],+m[2]-1,+m[1],0,0,0,0); };

    // Ближайшая будущая дата (UTC‑полуночь)
    function nextFutureDate(list){
      const now = new Date();
      const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      let best = null;
      for (let i=0;i<list.length;i++){
        const d = parseDMY(list[i].date); if(!d) continue;
        const ts = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        if (ts >= todayUTC && (best===null || ts < best)) best = ts;
      }
      return best;
    }

    // Счётчик «До поездки»
    function updateCountdown(){
      if(!countdownBtn) return;
      if (!activities || activities.length===0){ countdownBtn.textContent='ℹ️ Добавьте даты поездки'; return; }
      const startTs = nextFutureDate(activities);
      if (startTs===null){ countdownBtn.textContent='🏝️ Поездка началась'; return; }
      const now = new Date();
      const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()); // UTC‑полуночь [MDN]
      const diffDays = Math.ceil((startTs - todayUTC)/86400000);
      countdownBtn.textContent = (diffDays>0) ? `⏳ До поездки: ${diffDays} дней` : '🎒 Поездка сегодня';
    }
    updateCountdown(); setInterval(updateCountdown, 3600000); // раз в час

    // Иконки по типу
    const ICONS = { sea:['🏖️','🌊','🐠','⛱️','🛶'], sight:['🏛️','🗿','🗺️','🏯','📸'] };
    const pickIcon = (type, i)=> (ICONS[type]||['📌'])[ i % (ICONS[type]||['📌']).length ];

    // Расписание дня с конкретикой
    function generateSchedule(act){
      const departAt='09:00', travelSea=40, travelSight=30, buf=10;
      const rows=[];
      rows.push(`${departAt} — Выход из дома (вода, SPF, шляпы, наличные)`);
      const travel = (act.type==='sea')?travelSea:travelSight;
      const arr1 = add(parseTime(departAt).h, parseTime(departAt).m, travel);
      if (act.transport && act.transport.length){
        rows.push(`${departAt}–${arr1} — Как добраться: ${act.transport.join(' / ')}`);
      } else {
        rows.push(`${departAt}–${arr1} — Дорога по маршруту (уточнить на месте)`);
      }
      rows.push(`10:00 — Прибытие: ${act.title||act.text||'Локация'}`);
      if (act.gps) rows.push(`— Координаты: ${act.gps.lat.toFixed(6)}, ${act.gps.lng.toFixed(6)}`);
      if (act.open) rows.push(`— Время работы: ${act.open}`);
      if (act.price) rows.push(`— Вход/ценовой ориентир: ${act.price}`);
      rows.push('10:15–12:15 — Основная активность/осмотр');
      if (act.lunch && act.lunch.length){
        rows.push(`12:30–13:30 — Обед: ${act.lunch.join(' / ')}`);
      } else {
        rows.push('12:30–13:30 — Обед рядом (фудкорт/кафе)');
      }
      if (act.tips && act.tips.length){
        rows.push(`13:40 — Советы: ${act.tips.join(' • ')}`);
      }
      rows.push('14:00–15:00 — Возврат (сонгтео/такси)');
      rows.push('15:00 — Отдых/план следующего дня');
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
      setTimeout(showModal, 0);
    }
    function closeDetails(){ hideModal(); }

    on(overlay,'click', (e)=>{ if(e.target===overlay) closeDetails(); });
    on(closeBtn,'click',(e)=>{ e.preventDefault(); e.stopPropagation(); closeDetails(); });

    // Рендер карточек (без порядковых номеров — только иконка и дата)
    function renderCards(list){
      cardsWrap.innerHTML='';
      if (!list || list.length===0){
        emptyState.classList.remove('hidden');
        cardsWrap.classList.remove('hidden');
        cardsWrap.setAttribute('aria-busy','false');
        if (skeletons && skeletons.parentNode){ skeletons.parentNode.removeChild(skeletons); }
        return;
      }
      for (let i=0;i<list.length;i++){
        const a=list[i], card=document.createElement('button');
        card.type='button'; card.className='card '+(a.type||''); card.setAttribute('data-index', String(i));
        const icon = pickIcon(a.type, i);
        card.innerHTML = `<div class="card-header">${icon} ${a.date}</div><div class="card-body">${a.title||a.text||''}</div>`;
        on(card,'click',(e)=>{ e.preventDefault(); e.stopPropagation(); const idx=Number(card.getAttribute('data-index')); if(!isNaN(idx)) openDetails(idx); });
        cardsWrap.appendChild(card);
      }
      emptyState.classList.add('hidden');
      cardsWrap.classList.remove('hidden');
      cardsWrap.setAttribute('aria-busy','false');
      if (skeletons && skeletons.parentNode){ skeletons.parentNode.removeChild(skeletons); }
      // Делегирование на контейнер (резерв)
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

    // Ссылки на блюда (раздел «Советы»): открывать во встроенном браузере Telegram
    document.addEventListener('click', function(e){
      const a = e.target.closest && e.target.closest('.dish-link');
      if (!a) return;
      e.preventDefault();
      const url = a.getAttribute('href');
      if (!url) return;
      if (tg && typeof tg.openLink === 'function'){ tg.openLink(url); } else { window.open(url, '_blank', 'noopener'); }
    }, false);
  });
})();
