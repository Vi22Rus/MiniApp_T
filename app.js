(function(){
  'use strict';

  // ---------- Helpers ----------
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return (root||document).querySelectorAll(sel); }
  function on(el, evt, cb, opt){ el && el.addEventListener(evt, cb, opt||false); }

  // Версия
  var ver = (document.body && document.body.dataset && document.body.dataset.version) ? document.body.dataset.version : 'dev';
  var verEl = $('#appVersion'); if (verEl) verEl.textContent = 'v' + ver;

  // Telegram SDK (инициализация/теминг)
  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
  if (tg){ if (typeof tg.expand==='function') tg.expand(); if (typeof tg.ready==='function') tg.ready(); }

  function applyTheme(){
    if (!tg || !tg.themeParams) return;
    var p = tg.themeParams;
    if (p.bg_color)      document.documentElement.style.setProperty('--bg', p.bg_color);
    if (p.text_color)    document.documentElement.style.setProperty('--text', p.text_color);
    if (p.hint_color)    document.documentElement.style.setProperty('--muted', p.hint_color);
    if (p.button_color)  document.documentElement.style.setProperty('--accent', p.button_color);
    if (p.button_text_color) document.documentElement.style.setProperty('--accent-2', p.button_text_color);
  }
  applyTheme();
  if (tg && typeof tg.onEvent==='function') tg.onEvent('themeChanged', function(){ applyTheme(); });

  // ---------- Data (28 дней) ----------
  var activities = [
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

  // ---------- DOM ----------
  var cardsWrap = $('.cards');
  var skeletons = $('#skeletons');
  var emptyState = $('#emptyState');
  var filters = $all('.filter');
  var tabs = $all('.tab');

  var overlay = $('#overlay');
  var details = $('#details');
  var closeBtn = $('#closeBtn');
  var detailsTitle = $('#detailsTitle');
  var scheduleList = $('#scheduleList');
  var todayBtn = $('#todayBtn');
  var resetFilters = $('#resetFilters');
  var scrollTopBtn = $('#scrollTop');
  var snackbar = $('#snackbar');

  // ---------- Schedule generator (реалистичные интервалы) ----------
  function add(hh, mm, addMin){
    var d = new Date(2000,0,1, hh, mm, 0);
    d.setMinutes(d.getMinutes()+addMin);
    return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
  }
  function t(s){ var a=s.split(':'); return {h:+a[0], m:+a[1]}; }

  function generateSchedule(act){
    var departAt = '09:00';    // фиксированный выход
    var travelSea = 40;        // дорога к морю, мин (кастомизируется)
    var travelSight = 30;      // дорога к достопримеч., мин (кастомизируется)
    var buf = 10;              // универсальная подушка, мин

    var rows = [];
    rows.push(departAt+' — Выход из дома (вода 1 л/чел., SPF 50+, шляпы, наличные)');
    var trvl = (act.type==='sea') ? travelSea : travelSight;
    var arr1 = add(t(departAt).h, t(departAt).m, trvl);
    rows.push(departAt+'–'+arr1+' — Дорога ('+trvl+' мин)');

    if (act.type==='sea'){
      var loc = act.text.split(' +')[0];

      var startSea = add(t(arr1).h, t(arr1).m, buf);
      var endSea1  = add(t(startSea).h, t(startSea).m, 150);
      rows.push(startSea+'–'+endSea1+' — Пляж '+loc+' (тень/зонт, купание, перекус, SPF каждые 2 ч)');

      var startLunch = add(t(endSea1).h, t(endSea1).m, buf);
      var endLunch   = add(t(startLunch).h, t(startLunch).m, 60);
      rows.push(startLunch+'–'+endLunch+' — Обед рядом (кондиционер, пополнить воду)');

      var startSiesta = add(t(endLunch).h, t(endLunch).m, buf);
      var endSiesta   = add(t(startSiesta).h, t(startSiesta).m, 60);
      rows.push(startSiesta+'–'+endSiesta+' — Отдых в тени/индор‑зона');

      var startSea2 = add(t(endSiesta).h, t(endSiesta).m, buf);
      var endSea2   = add(t(startSea2).h, t(startSea2).m, 120);
      rows.push(startSea2+'–'+endSea2+' — Пляж '+loc+' (закат/фото/прогулка)');

      var startBack = add(t(endSea2).h, t(endSea2).m, buf);
      var endBack   = add(t(startBack).h, t(startBack).m, trvl);
      rows.push(startBack+'–'+endBack+' — Дорога домой ('+trvl+' мин)');
      rows.push(endBack+' — Душ/ужин/подготовка на завтра');
    } else {
      var parts = act.text.split(' +');
      var main = parts[0];
      var sub  = parts[1] || 'ближайшая локация';

      var startMain = add(t(arr1).h, t(arr1).m, buf);
      var endMain   = add(t(startMain).h, t(startMain).m, 120);
      rows.push(startMain+'–'+endMain+' — '+main+' (билеты/скан, дресс‑код, аудиогид)');

      var startLunchS = add(t(endMain).h, t(endMain).m, buf);
      var endLunchS   = add(t(startLunchS).h, t(startLunchS).m, 60);
      rows.push(startLunchS+'–'+endLunchS+' — Обед поблизости (пополнить воду)');

      var startSub = add(t(endLunchS).h, t(endLunchS).m, buf);
      var endSub   = add(t(startSub).h, t(startSub).m, 120);
      rows.push(startSub+'–'+endSub+' — '+sub+' (прогулка/детская зона/фото)');

      var startBackS = add(t(endSub).h, t(endSub).m, buf);
      var endBackS   = add(t(startBackS).h, t(startBackS).m, trvl);
      rows.push(startBackS+'–'+endBackS+' — Дорога домой ('+trvl+' мин)');
      rows.push(endBackS+' — Душ/ужин/подготовка на завтра');
    }
    return rows;
  }

  // ---------- Render cards ----------
  function renderCards(list){
    cardsWrap.innerHTML = '';
    for (var i=0;i<list.length;i++){
      var a = list[i];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card ' + a.type;
      card.setAttribute('data-index', String(i));
      card.innerHTML = '<div class="card-header">'+(i+1)+'. '+a.date+'</div><div class="card-body">'+a.text+'</div>';
      cardsWrap.appendChild(card);
    }
    cardsWrap.classList.remove('hidden');
    cardsWrap.setAttribute('aria-busy','false');
    skeletons.classList.add('hidden');
  }
  setTimeout(function(){ renderCards(activities); }, 120);

  // ---------- Tabs ----------
  function showTab(id){
    var panels = $all('.tab-content');
    for (var i=0;i<panels.length;i++) panels[i].classList.add('hidden');
    var p = document.getElementById(id); if (p) p.classList.remove('hidden');
    for (var j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id);
  }
  for (var t=0;t<tabs.length;t++){
    (function(btn){ on(btn,'click',function(){ showTab(btn.dataset.tab); }); on(btn,'touchstart',function(){ showTab(btn.dataset.tab); },{passive:true}); })(tabs[t]);
  }

  // ---------- Filters ----------
  function applyFilter(type){
    for (var i=0;i<filters.length;i++){
      var active = (filters[i].dataset.filter===type) || (type==='all' && filters[i].dataset.filter==='all');
      filters[i].classList.toggle('active', active);
      filters[i].setAttribute('aria-pressed', active ? 'true':'false');
    }
    var cards = $all('.card'); var visible = 0;
    for (var k=0;k<cards.length;k++){
      var show = (type==='all' || cards[k].classList.contains(type));
      cards[k].style.display = show ? 'flex' : 'none';
      if (show) visible++;
    }
    emptyState.classList.toggle('hidden', visible>0);
  }
  for (var f=0;f<filters.length;f++){
    (function(btn){ var type=btn.dataset.filter; on(btn,'click',function(){ applyFilter(type); }); on(btn,'touchstart',function(){ applyFilter(type); },{passive:true}); })(filters[f]);
  }
  on(resetFilters,'click',function(){ applyFilter('all'); showToast('Фильтры сброшены'); });

  // ---------- Dialog ----------
  function openDetails(idx){
    var act = activities[idx]; if (!act) return;
    detailsTitle.textContent = 'День '+(idx+1)+' • '+act.date;
    scheduleList.innerHTML = '';
    var plan = generateSchedule(act);
    for (var i=0;i<plan.length;i++){ var li=document.createElement('li'); li.textContent=plan[i]; scheduleList.appendChild(li); }
    overlay.classList.remove('hidden'); details.classList.remove('hidden');
    overlay.style.display='block'; details.style.display='block'; overlay.setAttribute('aria-hidden','false');
  }
  function closeDetails(){
    overlay.classList.add('hidden'); details.classList.add('hidden');
    overlay.style.display='none'; details.style.display='none'; overlay.setAttribute('aria-hidden','true');
  }
  on(overlay,'click',closeDetails); on(closeBtn,'click',closeDetails);

  on(cardsWrap,'click',function(e){
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    openDetails(Number(card.getAttribute('data-index')));
  });
  on(cardsWrap,'touchstart',function(e){
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    openDetails(Number(card.getAttribute('data-index')));
  },{passive:true});

  // ---------- Quick actions ----------
  on(todayBtn,'click',function(){
    var first = $('.card'); if (first){ first.scrollIntoView({behavior:'smooth', block:'center'}); pulse(first); }
  });
  on(scrollTopBtn,'click',function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  function pulse(el){ if (!el) return; el.style.filter='brightness(1.08)'; setTimeout(function(){ el.style.filter=''; }, 600); }

  // Snackbar
  var snackbar = $('#snackbar'); var hideToastTimer;
  function showToast(text){
    if (!snackbar) return;
    snackbar.textContent = text;
    snackbar.className = 'snackbar show';
    clearTimeout(hideToastTimer);
    hideToastTimer = setTimeout(function(){ snackbar.className = 'snackbar'; }, 1800);
  }

  // Стартовая вкладка
  showTab('calendar');
})();
