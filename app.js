(function(){
  'use strict';

  // ===== Utilities =====
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return (root||document).querySelectorAll(sel); }
  function on(el, evt, cb, opt){ el && el.addEventListener(evt, cb, opt||false); }

  // ===== Version in UI =====
  var ver = (document.body && document.body.dataset && document.body.dataset.version) ? document.body.dataset.version : 'dev';
  var verEl = $('#appVersion'); if (verEl) verEl.textContent = 'v' + ver;

  // ===== Telegram SDK & Theming =====
  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
  if (tg){ if (typeof tg.expand==='function') tg.expand(); if (typeof tg.ready==='function') tg.ready(); }

  function applyTheme(){
    if (!tg || !tg.themeParams) return;
    var p = tg.themeParams;

    // base
    if (p.bg_color)      document.documentElement.style.setProperty('--bg', p.bg_color);
    if (p.text_color)    document.documentElement.style.setProperty('--text', p.text_color);
    if (p.hint_color)    document.documentElement.style.setProperty('--muted', p.hint_color);
    if (p.button_color)  document.documentElement.style.setProperty('--accent', p.button_color);
    if (p.button_text_color) document.documentElement.style.setProperty('--accent-2', p.button_text_color); // контраст/доп. оттенок

    // оттенки карточек при темных темах — легкий сдвиг
    if (p.secondary_bg_color){
      document.documentElement.style.setProperty('--surface', 'rgba(255,255,255,0.06)');
      document.documentElement.style.setProperty('--glass', 'rgba(255,255,255,0.08)');
    }
  }
  applyTheme();
  if (tg && typeof tg.onEvent==='function') tg.onEvent('themeChanged', function(){ applyTheme(); });

  // ===== Data (28 дней) =====
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

  // ===== DOM =====
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

  // ===== Render =====
  function renderCards(list){
    cardsWrap.innerHTML = '';
    for (var i=0;i<list.length;i++){
      var a = list[i];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card ' + a.type;
      card.setAttribute('data-index', String(i));
      card.innerHTML =
        '<div class="card-header">'+ (i+1) +'. '+ a.date +'</div>' +
        '<div class="card-body">'+ a.text +'</div>';
      cardsWrap.appendChild(card);
    }
    cardsWrap.classList.remove('hidden');
    cardsWrap.setAttribute('aria-busy','false');
    skeletons.classList.add('hidden');
  }
  // имитация небольшой задержки загрузки для показа скелетона
  setTimeout(function(){ renderCards(activities); }, 120);

  // ===== Tabs =====
  function showTab(id){
    var panels = $all('.tab-content');
    for (var i=0;i<panels.length;i++) panels[i].classList.add('hidden');
    var p = document.getElementById(id); if (p) p.classList.remove('hidden');
    for (var j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id);
  }
  for (var t=0;t<tabs.length;t++){
    (function(btn){ on(btn,'click',function(){ showTab(btn.dataset.tab); }); on(btn,'touchstart',function(){ showTab(btn.dataset.tab); },{passive:true}); })(tabs[t]);
  }

  // ===== Filters =====
  function applyFilter(type){
    for (var i=0;i<filters.length;i++){
      var active = (filters[i].dataset.filter===type) || (type==='all' && filters[i].dataset.filter==='all');
      filters[i].classList.toggle('active', active);
      filters[i].setAttribute('aria-pressed', active ? 'true':'false');
    }
    var cards = $all('.card');
    var visible = 0;
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

  // ===== Dialog (Schedule) =====
  function openDetails(idx){
    var act = activities[idx]; if (!act) return;
    detailsTitle.textContent = 'День '+ (idx+1) +' • '+ act.date;
    scheduleList.innerHTML = '';

    var rows = ['09:00 — Выход из дома'];
    if (act.type==='sea'){
      var loc = act.text.split(' +')[0];
      rows.push('10:00–13:00 — Пляж '+loc);
      rows.push('13:00–14:00 — Обед');
      rows.push('14:00–17:00 — Пляж '+loc);
      rows.push('17:00–18:00 — Возвращение домой');
    } else {
      var parts = act.text.split(' +'); var main=parts[0]; var sub=parts[1]||'ближайшая локация';
      rows.push('10:00–12:00 — Посещение '+main);
      rows.push('12:00–13:00 — Обед');
      rows.push('13:00–15:00 — Прогулка в '+sub);
      rows.push('15:00–17:00 — Детская зона в '+sub);
      rows.push('17:00–18:00 — Возвращение домой');
    }
    for (var r=0;r<rows.length;r++){ var li=document.createElement('li'); li.textContent=rows[r]; scheduleList.appendChild(li); }

    overlay.classList.remove('hidden'); details.classList.remove('hidden');
    overlay.style.display='block'; details.style.display='block';
    overlay.setAttribute('aria-hidden','false');
  }
  function closeDetails(){
    overlay.classList.add('hidden'); details.classList.add('hidden');
    overlay.style.display='none'; details.style.display='none';
    overlay.setAttribute('aria-hidden','true');
  }
  on(overlay,'click',closeDetails);
  on(closeBtn,'click',closeDetails);

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

  // ===== Today quick filter (ищем ближайший будущий день) =====
  on(todayBtn,'click',function(){
    // упрощенно: подсветим первую карточку типа 'sea' как пример "сегодня"
    var first = $('.card');
    if (first){ first.scrollIntoView({behavior:'smooth', block:'center'}); pulse(first); }
  });

  // ===== Scroll to top FAB =====
  on(scrollTopBtn,'click',function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // ===== Micro-interaction helpers =====
  function pulse(el){
    if (!el) return;
    el.style.filter='brightness(1.08)';
    setTimeout(function(){ el.style.filter=''; }, 600);
  }

  // ===== Snackbar =====
  var hideToastTimer;
  function showToast(text){
    if (!snackbar) return;
    snackbar.textContent = text;
    snackbar.classList.add('show');
    clearTimeout(hideToastTimer);
    hideToastTimer = setTimeout(function(){ snackbar.classList.remove('show'); }, 1800);
  }

  // стартовая вкладка
  showTab('calendar');
})();
