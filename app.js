(function(){
  'use strict';

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

    const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
    if (tg){ tg.expand && tg.expand(); tg.ready && tg.ready(); }

    const backBtn = (tg && tg.BackButton) ? tg.BackButton : null;
    const showBack = ()=>{ if (backBtn && typeof backBtn.show==='function') backBtn.show(); };
    const hideBack = ()=>{ if (backBtn && typeof backBtn.hide==='function') backBtn.hide(); };
    hideBack();
    tg && tg.onEvent && tg.onEvent('back_button_pressed', ()=> closeDetails());

    const activities = [/* ... тот же массив дат и текстов ... */];

    const cardsWrap = $('#cards'), skeletons = $('#skeletons'), emptyState = $('#emptyState'), filters = $all('.filter'), tabs = $all('.tab');
    const overlay = $('#overlay'), details = $('#details'), closeBtn = $('#closeBtn'), detailsTitle = $('#detailsTitle'), scheduleList = $('#scheduleList'), resetFilters = $('#resetFilters'), countdownBtn = $('#countdownBtn'), footerVer = $('#appVersionFooter');

    if (footerVer){ footerVer.textContent = document.body.dataset.version || 'v0.0.0'; }
    if (overlay){ overlay.style.display='none'; overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); }
    if (details){ details.style.display='none'; details.classList.add('hidden'); }

    const add = (hh,mm,addMin)=>{ const d=new Date(2000,0,1,hh,mm,0); d.setMinutes(d.getMinutes()+addMin); return (`0${d.getHours()}`).slice(-2)+':'+(`0${d.getMinutes()}`).slice(-2); };
    const parseTime = (s)=>{ const a=s.split(':'); return {h:+a[0], m:+a[1]}; };
    const parseDMY = (dmy)=>{ const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy); if(!m) return null; return new Date(+m[3],+m[2]-1,+m[1],0,0,0,0); };
    const daysUntil = (start)=>{ if(!start) return null; const now=new Date(); const s=Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()); const t=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()); return Math.ceil((s-t)/86400000); };

    const updateCountdown = ()=>{ if(!countdownBtn) return; const start=parseDMY(activities[0]&&activities[0].date); const d=daysUntil(start); countdownBtn.textContent=(d>0)?(`⏳ До поездки: ${d} дней`):(d===0?'🎒 Поездка сегодня':'🏝️ Поездка началась'); };
    updateCountdown(); setInterval(updateCountdown, 3600000);

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

    // Наборы иконок и выбор по индексу
    const ICONS = {
      sea:   ['🏖️','🌊','🐠','⛱️','🛶'],
      sight: ['🏛️','🗿','🗺️','🏯','📸']
    };
    const pickIcon = (type, idx)=>{
      const set = ICONS[type] || ['📌'];
      // Выбираем по остатку от деления для равномерного распределения [MDN % оператор]
      return set[idx % set.length]; // [web:281]
    };

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

    function renderCards(list){
      cardsWrap.innerHTML='';
      for (let i=0;i<list.length;i++){
        const a=list[i], card=document.createElement('button');
        card.type='button'; card.className='card '+a.type; card.setAttribute('data-index', String(i));
        const icon = pickIcon(a.type, i); // ← выбираем «весёлую» иконку по типу и индексу [web:281]
        card.innerHTML=`<div class="card-header">${icon} ${a.date}</div><div class="card-body">${a.text}</div>`;
        on(card,'click',(e)=>{ e.preventDefault(); e.stopPropagation(); const idx=Number(card.getAttribute('data-index')); if(!isNaN(idx)) openDetails(idx); });
        cardsWrap.appendChild(card);
      }
      cardsWrap.classList.remove('hidden');
      cardsWrap.setAttribute('aria-busy','false');
      if (skeletons && skeletons.parentNode){ skeletons.parentNode.removeChild(skeletons); }
      on(cardsWrap,'click',(e)=>{ const el=e.target.closest?e.target.closest('.card'):null; if(!el) return; e.preventDefault(); e.stopPropagation(); const i=Number(el.getAttribute('data-index')); if(!isNaN(i)) openDetails(i); });
    }
    renderCards(activities);

    function showTab(id){
      const panels=$all('.tab-content'); for (let i=0;i<panels.length;i++) panels[i].classList.add('hidden');
      const p=document.getElementById(id); if(p) p.classList.remove('hidden');
      for (let j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id);
    }
    for (let i=0;i<tabs.length;i++){ const btn=tabs[i]; on(btn,'click', ()=>{ showTab(btn.dataset.tab); }); }

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

    // Ссылки на блюда: открыть во встроенном браузере Telegram
    document.addEventListener('click', function(e){
      const a = e.target.closest && e.target.closest('.dish-link');
      if (!a) return;
      e.preventDefault();
      const url = a.getAttribute('href');
      if (!url) return;
      if (tg && typeof tg.openLink === 'function'){
        tg.openLink(url);
      } else {
        window.open(url, '_blank', 'noopener');
      }
    }, false);
  });
})();
