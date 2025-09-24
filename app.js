(function(){
  'use strict';

  // ===== Версия в UI =====
  var ver = (document.body && document.body.dataset && document.body.dataset.version) ? document.body.dataset.version : 'dev';
  var verEl = document.getElementById('appVersion');
  if (verEl) verEl.textContent = 'v' + ver;

  // ===== Telegram SDK =====
  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
  if (tg) { if (typeof tg.expand === 'function') tg.expand(); if (typeof tg.ready === 'function') tg.ready(); }

  // Применение темы Telegram к CSS custom properties
  function applyTheme() {
    if (!tg || !tg.themeParams) return;
    var p = tg.themeParams;
    // Базовые
    if (p.bg_color)    document.documentElement.style.setProperty('--tg-bg', p.bg_color);
    if (p.text_color)  document.documentElement.style.setProperty('--tg-text', p.text_color);
    if (p.hint_color)  document.documentElement.style.setProperty('--tg-subtle', p.hint_color);
    // Акцентные
    if (p.button_color) document.documentElement.style.setProperty('--tg-accent', p.button_color);
    // Цвета карточек можно подмешать к акценту при тёмной теме
    if (p.secondary_bg_color) {
      document.documentElement.style.setProperty('--tg-card-sea', p.secondary_bg_color);
    }
  }
  applyTheme();
  if (tg && typeof tg.onEvent === 'function') {
    tg.onEvent('themeChanged', function(){ applyTheme(); });
  }

  // ===== Данные =====
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
  var cardsContainer = document.querySelector('.cards');
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.tab-content');
  var filters = document.querySelectorAll('.filter');

  var overlay = document.getElementById('overlay');
  var details = document.getElementById('details');
  var closeBtn = document.getElementById('closeBtn');
  var detailsTitle = document.getElementById('detailsTitle');
  var scheduleList = document.getElementById('scheduleList');

  // ===== Рендер карточек =====
  function renderCards(list){
    cardsContainer.innerHTML = '';
    for (var i=0;i<list.length;i++){
      var a = list[i];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card ' + a.type;
      card.setAttribute('data-index', String(i));
      // Структура карточки: заголовок (дата) + подзаголовок (активность)
      card.innerHTML = '<div class="card-header">'+(i+1)+'. '+a.date+'</div><div class="card-body">'+a.text+'</div>';
      cardsContainer.appendChild(card);
    }
    cardsContainer.setAttribute('aria-busy','false');
  }
  renderCards(activities);

  // ===== Вкладки =====
  function showTab(id){
    for (var i=0;i<panels.length;i++) panels[i].classList.add('hidden');
    var p = document.getElementById(id); if (p) p.classList.remove('hidden');
    for (var j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id);
  }
  for (var t=0;t<tabs.length;t++){
    (function(btn){
      btn.addEventListener('click', function(){ showTab(btn.dataset.tab); });
      btn.addEventListener('touchstart', function(){ showTab(btn.dataset.tab); }, {passive:true});
    })(tabs[t]);
  }

  // ===== Фильтры =====
  function applyFilter(type){
    for (var f=0;f<filters.length;f++){
      var active = (filters[f].dataset.filter===type) || (type==='all' && filters[f].dataset.filter==='all');
      filters[f].classList.toggle('active', active);
      filters[f].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    var cards = document.querySelectorAll('.card');
    for (var k=0;k<cards.length;k++){
      var show = (type==='all' || cards[k].classList.contains(type));
      cards[k].style.display = show ? 'flex' : 'none';
    }
  }
  for (var i=0;i<filters.length;i++){
    (function(btn){
      var type = btn.dataset.filter;
      btn.addEventListener('click', function(){ applyFilter(type); });
      btn.addEventListener('touchstart', function(){ applyFilter(type); }, {passive:true});
    })(filters[i]);
  }

  // ===== Модалка с расписанием =====
  function openDetails(idx){
    var act = activities[idx]; if (!act) return;
    detailsTitle.textContent = 'День '+(idx+1)+' • '+act.date;
    scheduleList.innerHTML = '';

    var rows = ['09:00 — Выход из дома'];
    if (act.type==='sea'){
      var loc = act.text.split(' +')[0];
      rows.push('10:00–13:00 — Пляж '+loc);
      rows.push('13:00–14:00 — Обед');
      rows.push('14:00–17:00 — Пляж '+loc);
      rows.push('17:00–18:00 — Возвращение домой');
    } else {
      var parts = act.text.split(' +'); var main = parts[0]; var sub = parts[1] || 'ближайшая локация';
      rows.push('10:00–12:00 — Посещение '+main);
      rows.push('12:00–13:00 — Обед');
      rows.push('13:00–15:00 — Прогулка в '+sub);
      rows.push('15:00–17:00 — Детская зона в '+sub);
      rows.push('17:00–18:00 — Возвращение домой');
    }
    for (var r=0;r<rows.length;r++){ var li=document.createElement('li'); li.textContent=rows[r]; scheduleList.appendChild(li); }

    overlay.classList.remove('hidden'); details.classList.remove('hidden');
    overlay.style.display='block'; details.style.display='block'; overlay.setAttribute('aria-hidden','false');
  }
  function closeDetails(){
    overlay.classList.add('hidden'); details.classList.add('hidden');
    overlay.style.display='none'; details.style.display='none'; overlay.setAttribute('aria-hidden','true');
  }

  if (cardsContainer){
    cardsContainer.addEventListener('click', function(e){
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      openDetails(Number(card.getAttribute('data-index')));
    });
    cardsContainer.addEventListener('touchstart', function(e){
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      openDetails(Number(card.getAttribute('data-index')));
    }, {passive:true});
  }
  if (overlay) overlay.addEventListener('click', closeDetails);
  if (closeBtn) closeBtn.addEventListener('click', closeDetails);

  // По умолчанию — вкладка "Календарь"
  showTab('calendar');
})();
