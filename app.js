(function(){
  'use strict';
  
  // Отладка: проверяем загрузку скрипта
  console.log('App.js v2025092510491 загружен');
  
  function $(sel){ return document.querySelector(sel); }
  function $all(sel){ return document.querySelectorAll(sel); }
  function on(el, evt, cb){ if (el) el.addEventListener(evt, cb, false); }

  // Версия
  var ver = document.body.dataset.version || 'dev';
  var verEl = $('#appVersion'); 
  if (verEl) verEl.textContent = 'v' + ver;

  // Telegram SDK
  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
  if (tg){ 
    if (typeof tg.expand==='function') tg.expand(); 
    if (typeof tg.ready==='function') tg.ready(); 
  }

  // BackButton
  var backBtn = tg && tg.BackButton ? tg.BackButton : null;
  function showBack(){ if (backBtn && typeof backBtn.show==='function') backBtn.show(); }
  function hideBack(){ if (backBtn && typeof backBtn.hide==='function') backBtn.hide(); }
  hideBack();
  if (tg && typeof tg.onEvent==='function'){
    tg.onEvent('back_button_pressed', function(){ closeDetails(); });
  }

  // Данные
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

  // DOM
  var cardsWrap = $('#cards');
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

  // Скрыть модалку на старте
  if (overlay) overlay.style.display = 'none';
  if (details) details.style.display = 'none';

  // Время helpers
  function add(hh, mm, addMin){
    var d = new Date(2000,0,1, hh, mm, 0);
    d.setMinutes(d.getMinutes() + addMin);
    return ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2);
  }
  function t(s){ var a = s.split(':'); return {h:+a[0], m:+a[1]}; }

  function generateSchedule(act){
    var rows = [];
    rows.push('09:00 — Выход из дома (вода 1 л/чел., SPF 50+, шляпы, наличные)');
    rows.push('09:30 — Дорога на ' + act.text);
    rows.push('10:30 — Начало активности');
    rows.push('12:30 — Обед рядом');
    rows.push('18:00 — Дорога домой');
    rows.push('19:00 — Душ/ужин/подготовка на завтра');
    return rows;
  }

  // Показ/скрытие модалки
  function showModal(){
    console.log('Показываем модалку');
    overlay.style.display = 'block';
    details.style.display = 'block';
    overlay.classList.remove('hidden');
    details.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    showBack();
  }
  
  function hideModal(){
    console.log('Скрываем модалку');
    overlay.style.display = 'none';
    details.style.display = 'none';
    overlay.classList.add('hidden');
    details.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    hideBack();
  }

  function openDetails(idx){
    console.log('openDetails вызван для индекса:', idx);
    var act = activities[idx];
    if (!act) {
      console.log('Активность не найдена для индекса:', idx);
      return;
    }
    
    detailsTitle.textContent = 'День ' + (idx+1) + ' • ' + act.date;
    scheduleList.innerHTML = '';
    
    var plan = generateSchedule(act);
    for (var i = 0; i < plan.length; i++){
      var li = document.createElement('li');
      li.textContent = plan[i];
      scheduleList.appendChild(li);
    }
    
    if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred==='function'){
      try { tg.HapticFeedback.impactOccurred('medium'); } catch(e){}
    }
    
    showModal();
  }
  
  function closeDetails(){
    hideModal();
  }

  // Закрытие модалки
  on(overlay, 'click', closeDetails);
  on(closeBtn, 'click', closeDetails);

  // Рендер карточек
  function renderCards(list){
    console.log('Рендерим карточки, количество:', list.length);
    cardsWrap.innerHTML = '';
    
    for (var i = 0; i < list.length; i++){
      var act = list[i];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card ' + act.type;
      card.setAttribute('data-index', String(i));
      card.innerHTML = '<div class="card-header">' + (i+1) + '. ' + act.date + '</div><div class="card-body">' + act.text + '</div>';
      
      // Прямой обработчик
      card.onclick = function(){
        var idx = Number(this.getAttribute('data-index'));
        console.log('Клик по карточке с индексом:', idx);
        openDetails(idx);
      };
      
      cardsWrap.appendChild(card);
    }
    
    cardsWrap.classList.remove('hidden');
    cardsWrap.setAttribute('aria-busy', 'false');
    
    if (skeletons && skeletons.parentNode){
      skeletons.parentNode.removeChild(skeletons);
    }
    
    console.log('Карточки отрендерены');
  }

  // Инициализация
  console.log('Вызываем renderCards');
  renderCards(activities);

  // Вкладки
  function showTab(id){
    var panels = $all('.tab-content');
    for (var i = 0; i < panels.length; i++){
      panels[i].classList.add('hidden');
    }
    var panel = document.getElementById(id);
    if (panel) panel.classList.remove('hidden');
    
    for (var j = 0; j < tabs.length; j++){
      tabs[j].classList.toggle('active', tabs[j].dataset.tab === id);
    }
  }
  
  for (var t = 0; t < tabs.length; t++){
    tabs[t].onclick = function(){
      showTab(this.dataset.tab);
    };
  }

  // Фильтры
  function applyFilter(type){
    for (var i = 0; i < filters.length; i++){
      var active = (filters[i].dataset.filter === type) || (type === 'all' && filters[i].dataset.filter === 'all');
      filters[i].classList.toggle('active', active);
      filters[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    
    var cards = $all('#cards .card');
    var visible = 0;
    for (var k = 0; k < cards.length; k++){
      var show = (type === 'all' || cards[k].classList.contains(type));
      cards[k].style.display = show ? 'flex' : 'none';
      if (show) visible++;
    }
    
    emptyState.classList.toggle('hidden', visible > 0);
  }
  
  for (var f = 0; f < filters.length; f++){
    filters[f].onclick = function(){
      applyFilter(this.dataset.filter);
    };
  }
  
  if (resetFilters){
    resetFilters.onclick = function(){
      applyFilter('all');
    };
  }

  // «Сегодня»
  if (todayBtn){
    todayBtn.onclick = function(){
      var first = $('#cards .card');
      if (first){
        first.scrollIntoView({behavior:'smooth', block:'center'});
        first.style.filter = 'brightness(1.08)';
        setTimeout(function(){
          first.style.filter = '';
        }, 600);
      }
    };
  }

  showTab('calendar');
  
  console.log('Инициализация завершена');
  
  // Отладочная проверка
  setTimeout(function(){
    var cards = $all('#cards .card');
    console.log('Проверка через 1 сек: найдено карточек:', cards.length);
    if (cards.length > 0){
      console.log('Первая карточка:', cards[0]);
      console.log('onclick первой карточки:', cards[0].onclick);
    }
  }, 1000);
  
})();
