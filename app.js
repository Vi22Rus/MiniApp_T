(function(){
  'use strict';
  function $(s,r){return (r||document).querySelector(s)} function $all(s,r){return (r||document).querySelectorAll(s)} function on(e,t,c,o){e&&e.addEventListener(t,c,o||false)}

  // Telegram SDK
  var tg=(window.Telegram&&window.Telegram.WebApp)?window.Telegram.WebApp:null;
  if(tg){ tg.expand&&tg.expand(); tg.ready&&tg.ready(); }

  // BackButton
  var backBtn=tg&&tg.BackButton?tg.BackButton:null; function showBack(){backBtn&&backBtn.show&&backBtn.show()} function hideBack(){backBtn&&backBtn.hide&&backBtn.hide()} hideBack();
  tg&&tg.onEvent&&tg.onEvent('back_button_pressed', function(){ closeDetails(); });

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
  var cardsWrap=$('#cards'), skeletons=$('#skeletons'), emptyState=$('#emptyState'), filters=$all('.filter'), tabs=$all('.tab');
  var overlay=$('#overlay'), details=$('#details'), closeBtn=$('#closeBtn'), detailsTitle=$('#detailsTitle'), scheduleList=$('#scheduleList'), resetFilters=$('#resetFilters');
  var countdownBtn=$('#countdownBtn');

  // Вспомогательные функции времени
  function add(hh,mm,addMin){ var d=new Date(2000,0,1,hh,mm,0); d.setMinutes(d.getMinutes()+addMin); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }
  function t(s){ var a=s.split(':'); return {h:+a[0], m:+a[1]}; }

  // Парсинг dd.mm.yyyy -> Date
  function parseDMY(dmy){
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy);
    if(!m) return null;
    return new Date(Number(m[3]), Number(m[2])-1, Number(m[1]), 0, 0, 0, 0);
  }

  // Дни до даты (UTC-полночь -> UTC-полночь), чтобы исключить искажения из-за часовых поясов [web:169][web:170]
  function daysUntil(startDate){
    if(!startDate) return null;
    var now=new Date();
    var startUTC=Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()); // UTC timestamp [web:169]
    var todayUTC=Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()); // UTC timestamp [web:169]
    var diffMs=startUTC - todayUTC; // миллисекунды между датами [web:170][web:182]
    return Math.ceil(diffMs / 86400000); // миллисекунд в сутках 24*60*60*1000 [web:181][web:182]
  }

  // Кнопка обратного отсчёта
  function updateCountdown(){
    if(!countdownBtn) return;
    var start=parseDMY(activities[0] && activities[0].date);
    var d=daysUntil(start);
    var txt = (d>0) ? ('⏳ До поездки: '+d+' дней') : (d===0 ? '🎒 Поездка сегодня' : '🏝️ Поездка началась');
    countdownBtn.textContent = txt;
  }

  // Генерация дневного плана
  function generateSchedule(act){
    var departAt='09:00', travelSea=40, travelSight=30, buf=10;
    var rows=[]; rows.push(departAt+' — Выход из дома (вода 1 л/чел., SPF 50+, шляпы, наличные)');
    var trvl=(act.type==='sea')?travelSea:travelSight; var arr1=add(t(departAt).h,t(departAt).m,trvl);
    rows.push(departAt+'–'+arr1+' — Дорога ('+trvl+' мин)');
    if(act.type==='sea'){ var loc=act.text.split(' +')[0];
      var startSea=add(t(arr1).h,t(arr1).m,buf), endSea1=add(t(startSea).h,t(startSea).m,150);
      rows.push(startSea+'–'+endSea1+' — Пляж '+loc+' (тень/зонт, купание, перекус, SPF каждые 2 ч)');
      var startLunch=add(t(endSea1).h,t(endSea1).m,buf), endLunch=add(t(startLunch).h,t(startLunch).m,60);
      rows.push(startLunch+'–'+endLunch+' — Обед рядом (кондиционер, пополнить воду)');
      var startSiesta=add(t(endLunch).h,t(endLunch).m,buf), endSiesta=add(t(startSiesta).h,t(startSiesta).m,60);
      rows.push(startSiesta+'–'+endSiesta+' — Отдых в тени/индор‑зона');
      var startSea2=add(t(endSiesta).h,t(endSiesta).m,buf), endSea2=add(t(startSea2).h,t(startSea2).m,120);
      rows.push(startSea2+'–'+endSea2+' — Пляж '+loc+' (закат/фото/прогулка)');
      var startBack=add(t(endSea2).h,t(endSea2).m,buf), endBack=add(t(startBack).h,t(startBack).m,trvl);
      rows.push(startBack+'–'+endBack+' — Дорога домой ('+trvl+' мин)'); rows.push(endBack+' — Душ/ужин/подготовка на завтра');
    } else { var parts=act.text.split(' +'), main=parts[0], sub=parts[1]||'ближайшая локация';
      var startMain=add(t(arr1).h,t(arr1).m,buf), endMain=add(t(startMain).h,t(startMain).m,120);
      rows.push(startMain+'–'+endMain+' — '+main+' (билеты/скан, дресс‑код, аудиогид)');
      var startLunchS=add(t(endMain).h,t(endMain).m,buf), endLunchS=add(t(startLunchS).h,t(startLunchS).m,60);
      rows.push(startLunchS+'–'+endLunchS+' — Обед поблизости (пополнить воду)');
      var startSub=add(t(endLunchS).h,t(endLunchS).m,buf), endSub=add(t(startSub).h,t(startSub).m,120);
      rows.push(startSub+'–'+endSub+' — '+sub+' (прогулка/детская зона/фото)');
      var startBackS=add(t(endSub).h,t(endSub).m,buf), endBackS=add(t(startBackS).h,t(startBackS).m,trvl);
      rows.push(startBackS+'–'+endBackS+' — Дорога домой ('+trvl+' мин)'); rows.push(endBackS+' — Душ/ужин/подготовка на завтра');
    }
    return rows;
  }

  // Диалог
  function showModal(){ overlay.style.display='block'; details.style.display='block'; overlay.classList.remove('hidden'); details.classList.remove('hidden'); overlay.setAttribute('aria-hidden','false'); showBack(); }
  function hideModal(){ overlay.style.display='none'; details.style.display='none'; overlay.classList.add('hidden'); details.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); hideBack(); }

  function openDetails(idx){
    var act=activities[idx]; if(!act) return;
    detailsTitle.textContent='День '+(idx+1)+' • '+act.date;
    scheduleList.innerHTML='';
    var plan=generateSchedule(act);
    for (var i=0;i<plan.length;i++){ var li=document.createElement('li'); li.textContent=plan[i]; scheduleList.appendChild(li); }
    if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred==='function'){ try { tg.HapticFeedback.impactOccurred('medium'); } catch(e){} }
    showModal();
  }
  function closeDetails(){ hideModal(); }
  on(overlay,'click',closeDetails); on(closeBtn,'click',closeDetails);

  // Рендер карточек
  function renderCards(list){
    cardsWrap.innerHTML='';
    for (var i=0;i<list.length;i++){
      var a=list[i], card=document.createElement('button');
      card.type='button'; card.className='card '+a.type; card.setAttribute('data-index', String(i));
      card.innerHTML='<div class="card-header">'+(i+1)+'. '+a.date+'</div><div class="card-body">'+a.text+'</div>';
      on(card,'click',function(){ var idx=Number(this.getAttribute('data-index')); openDetails(idx); });
      cardsWrap.appendChild(card);
    }
    cardsWrap.classList.remove('hidden');
    cardsWrap.setAttribute('aria-busy','false');
    if (skeletons && skeletons.parentNode){ skeletons.parentNode.removeChild(skeletons); }
  }
  renderCards(activities);

  // Вкладки
  function showTab(id){
    var panels=$all('.tab-content'); for (var i=0;i<panels.length;i++) panels[i].classList.add('hidden');
    var p=document.getElementById(id); if (p) p.classList.remove('hidden');
    for (var j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id);
  }
  for (var t=0;t<tabs.length;t++){ (function(btn){ on(btn,'click',function(){ showTab(btn.dataset.tab); }); })(tabs[t]); }

  // Фильтры
  function applyFilter(type){
    for (var i=0;i<filters.length;i++){
      var active=(filters[i].dataset.filter===type)||(type==='all'&&filters[i].dataset.filter==='all');
      filters[i].classList.toggle('active', active);
      filters[i].setAttribute('aria-pressed', active?'true':'false');
    }
    var cards = $all('#cards .card'); var visible=0;
    for (var k=0;k<cards.length;k++){
      var show=(type==='all'||cards[k].classList.contains(type));
      cards[k].style.display = show ? 'flex' : 'none';
      if (show) visible++;
    }
    emptyState.classList.toggle('hidden', visible>0);
  }
  for (var f=0;f<filters.length;f++){ (function(btn){ var type=btn.dataset.filter; on(btn,'click',function(){ applyFilter(type); }); })(filters[f]); }
  on(resetFilters,'click',function(){ applyFilter('all'); });

  // Обновляем обратный отсчёт на старте и раз в час
  updateCountdown(); // первичный рендер [web:169][web:170]
  setInterval(updateCountdown, 60*60*1000); // чтобы текст обновлялся без перезапуска [web:182]

  showTab('calendar');
})();
