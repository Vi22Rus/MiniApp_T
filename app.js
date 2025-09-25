(function(){
  'use strict';
  function $(s,r){return (r||document).querySelector(s)} function $all(s,r){return (r||document).querySelectorAll(s)} function on(e,t,c,o){e&&e.addEventListener(t,c,o||false)}

  // Версия
  var ver=(document.body&&document.body.dataset&&document.body.dataset.version)?document.body.dataset.version:'dev';
  var verEl=$('#appVersion'); if(verEl) verEl.textContent='v'+ver;

  var tg=(window.Telegram&&window.Telegram.WebApp)?window.Telegram.WebApp:null;
  if(tg){ tg.expand&&tg.expand(); tg.ready&&tg.ready(); }

  // Helpers для контраста
  function hexToRgb(hex){ if(!hex) return null; var h=hex.replace('#',''); if(h.length===3) h=h.split('').map(function(c){return c+c}).join(''); var n=parseInt(h,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
  function luminance(rgb){ if(!rgb) return 0; function f(v){v=v/255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);} var r=f(rgb.r),g=f(rgb.g),b=f(rgb.b); return 0.2126*r+0.7152*g+0.0722*b; }
  function ensureContrast(bgHex,textHex){ var h=hexToRgb(bgHex), t=hexToRgb(textHex); if(!h||!t) return null; var L1=Math.max(luminance(h),luminance(t))+0.05, L2=Math.min(luminance(h),luminance(t))+0.05; return (L1/L2)>=4.5; }
  function pickTextForBg(bg){ var dark='#111111', light='#0b1220'; var okL=ensureContrast(bg,light), okD=ensureContrast(bg,dark); if(okL&&!okD) return light; if(okD&&!okL) return dark; var lum=luminance(hexToRgb(bg)); return lum<0.5?light:dark; }

  // Темизация
  function applyTheme(){
    if(!tg||!tg.themeParams) return;
    var p=tg.themeParams;
    if(p.bg_color){ document.documentElement.style.setProperty('--bg', p.bg_color); document.body.style.backgroundColor=p.bg_color; }
    var text=p.text_color?p.text_color:pickTextForBg(p.bg_color||'#ffffff'); if(text) document.documentElement.style.setProperty('--text', text);
    if(p.hint_color) document.documentElement.style.setProperty('--muted', p.hint_color);
    if(p.button_color) document.documentElement.style.setProperty('--accent', p.button_color);
    if(p.button_text_color) document.documentElement.style.setProperty('--accent-2', p.button_text_color);
    var isDark=(function(){ var rgb=hexToRgb(p.bg_color||'#ffffff'); return luminance(rgb)<0.5; })();
    document.body.classList.toggle('tg-dark', !!isDark);
    if(typeof tg.setHeaderColor==='function') tg.setHeaderColor('bg_color');
    if(typeof tg.setBackgroundColor==='function') tg.setBackgroundColor('bg_color');
  }
  applyTheme();
  tg&&tg.onEvent&&tg.onEvent('themeChanged', function(){ applyTheme(); });

  // BackButton
  var backBtn=tg&&tg.BackButton?tg.BackButton:null; function showBack(){backBtn&&backBtn.show&&backBtn.show()} function hideBack(){backBtn&&backBtn.hide&&backBtn.hide()} hideBack();
  tg&&tg.onEvent&&tg.onEvent('back_button_pressed', function(){ closeDetails(); });

  // Данные
  var activities=[
    {type:'sea',date:'29.12.2025',text:'Пляж Джомтьен + детская зона'},
    {type:'sea',date:'30.12.2025',text:'Пляж Вонгамат + водные горки'},
    {type:'sight',date:'31.12.2025',text:'Ват Янсангварам + прогулка по парку'},
    {type:'sea',date:'01.01.2026',text:'Пляж Паттайя + Underwater World'},
    {type:'sea',date:'02.01.2026',text:'Морская прогулка к Ко Лан (снорклинг)'},
    {type:'sight',date:'03.01.2026',text:'Сад Нонг Нуч + шоу слонов'},
    {type:'sea',date:'04.01.2026',text:'Пляж Джомтьен'},
    {type:'sea',date:'05.01.2026',text:'Пляж Вонгамат + аренда байка'},
    {type:'sight',date:'06.01.2026',text:'Ват Кхао Пхра Бат + обзорная площадка'},
    {type:'sea',date:'07.01.2026',text:'Морская прогулка к Ко Сичанг'},
    {type:'sea',date:'08.01.2026',text:'Пляж Паттайя'},
    {type:'sight',date:'09.01.2026',text:'Dolphin World + детская зона'},
    {type:'sea',date:'10.01.2026',text:'Пляж Джомтьен'},
    {type:'sight',date:'11.01.2026',text:'Батискаф (12.969175,100.888124)'},
    {type:'sight',date:'12.01.2026',text:'Art in Paradise + плавучий рынок'},
    {type:'sea',date:'13.01.2026',text:'Пляж Вонгамат'},
    {type:'sea',date:'14.01.2026',text:'Пляж Паттайя'},
    {type:'sight',date:'15.01.2026',text:'Мини-Сиам + детские аттракционы'},
    {type:'sea',date:'16.01.2026',text:'Морская прогулка к Ко Лан'},
    {type:'sea',date:'17.01.2026',text:'Пляж Джомтьен'},
    {type:'sight',date:'18.01.2026',text:'Sea Life Pattaya (аквариум)'},
    {type:'sea',date:'19.01.2026',text:'Пляж Вонгамат'},
    {type:'sea',date:'20.01.2026',text:'Пляж Паттайя'},
    {type:'sight',date:'21.01.2026',text:'Ват Пхра Яй + парк Люксор'},
    {type:'sea',date:'22.01.2026',text:'Пляж Джомтьен'},
    {type:'sea',date:'23.01.2026',text:'Пляж Вонгамат'},
    {type:'sight',date:'24.01.2026',text:'Central Festival + фуд-корт'},
    {type:'sea',date:'25.01.2026',text:'Пляж Паттайя'}
  ];

  // DOM
  var cardsWrap=$('#cards'), skeletons=$('#skeletons'), emptyState=$('#emptyState'), filters=$all('.filter'), tabs=$all('.tab');
  var overlay=$('#overlay'), details=$('#details'), closeBtn=$('#closeBtn'), detailsTitle=$('#detailsTitle'), scheduleList=$('#scheduleList'), todayBtn=$('#todayBtn'), resetFilters=$('#resetFilters');

  // Гарантированное скрытие модалки на старте
  if(overlay) overlay.style.display='none';
  if(details) details.style.display='none';

  // Время helpers
  function add(hh,mm,addMin){var d=new Date(2000,0,1,hh,mm,0);d.setMinutes(d.getMinutes()+addMin);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
  function t(s){var a=s.split(':');return {h:+a[0],m:+a[1]}}

  function generateSchedule(act){
    var departAt='09:00', travelSea=40, travelSight=30, buf=10, rows=[];
    rows.push(departAt+' — Выход из дома (вода 1 л/чел., SPF 50+, шляпы, наличные)');
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
    } else {
      var parts=act.text.split(' +'), main=parts[0], sub=parts[1]||'ближайшая локация';
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

  // Показ модалки — единый путь
  function showModal(){ overlay.style.display='block'; details.style.display='block'; overlay.classList.remove('hidden'); details.classList.remove('hidden'); overlay.setAttribute('aria-hidden','false'); showBack(); }
  function hideModal(){ overlay.style.display='none'; details.style.display='none'; overlay.classList.add('hidden'); details.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); hideBack(); }

  function openDetails(idx){
    var act=activities[idx]; if(!act) return;
    detailsTitle.textContent='День '+(idx+1)+' • '+act.date;
    scheduleList.innerHTML='';
    var plan=generateSchedule(act);
    for(var i=0;i<plan.length;i++){ var li=document.createElement('li'); li.textContent=plan[i]; scheduleList.appendChild(li); }
    if(tg&&tg.HapticFeedback&&typeof tg.HapticFeedback.impactOccurred==='function'){ try{ tg.HapticFeedback.impactOccurred('medium'); }catch(e){} }
    showModal();
  }
  function closeDetails(){ hideModal(); }

  on(overlay,'click',closeDetails); on(closeBtn,'click',closeDetails);

  // Рендер карточек + собственные обработчики
  function renderCards(list){
    cardsWrap.innerHTML='';
    for(var i=0;i<list.length;i++){
      (function(i){
        var a=list[i], card=document.createElement('button');
        card.type='button'; card.className='card '+a.type; card.setAttribute('data-index', String(i));
        card.innerHTML='<div class="card-header">'+(i+1)+'. '+a.date+'</div><div class="card-body">'+a.text+'</div>';
        on(card,'click',function(){ openDetails(i); });
        var sx=0,sy=0,st=0;
        on(card,'touchstart',function(e){ var t=e.touches[0]; sx=t.clientX; sy=t.clientY; st=Date.now(); },{passive:true});
        on(card,'touchend',function(e){ var dt=Date.now()-st; if(dt>300) return; var t=e.changedTouches[0]; var dx=Math.abs(t.clientX-sx), dy=Math.abs(t.clientY-sy); if(dx<10&&dy<10) openDetails(i); });
        cardsWrap.appendChild(card);
      })(i);
    }
    cardsWrap.classList.remove('hidden');
    cardsWrap.setAttribute('aria-busy','false');
    if(skeletons&&skeletons.parentNode) skeletons.parentNode.removeChild(skeletons);
  }
  renderCards(activities);

  // Доп. делегирование (резервный путь на случай экзотических WebView)
  on(cardsWrap,'click',function(e){ var el=e.target.closest?e.target.closest('.card'):null; if(el){ var i=Number(el.getAttribute('data-index')); if(!isNaN(i)) openDetails(i); } });

  // Вкладки
  function showTab(id){ var panels=$all('.tab-content'); for(var i=0;i<panels.length;i++) panels[i].classList.add('hidden'); var p=document.getElementById(id); if(p) p.classList.remove('hidden'); for(var j=0;j<tabs.length;j++) tabs[j].classList.toggle('active', tabs[j].dataset.tab===id); }
  for(var t=0;t<tabs.length;t++){ (function(btn){ on(btn,'click',function(){ showTab(btn.dataset.tab); }); })(tabs[t]); }

  // Фильтры
  function applyFilter(type){
    for(var i=0;i<filters.length;i++){ var active=(filters[i].dataset.filter===type)||(type==='all'&&filters[i].dataset.filter==='all'); filters[i].classList.toggle('active',active); filters[i].setAttribute('aria-pressed',active?'true':'false'); }
    var cards=$all('#cards .card'); var visible=0; for(var k=0;k<cards.length;k++){ var show=(type==='all'||cards[k].classList.contains(type)); cards[k].style.display=show?'flex':'none'; if(show)visible++; }
    emptyState.classList.toggle('hidden', visible>0);
  }
  for(var f=0; f<filters.length; f++){ (function(btn){ var type=btn.dataset.filter; on(btn,'click',function(){ applyFilter(type); }); })(filters[f]); }
  on(resetFilters,'click',function(){ applyFilter('all'); });

  // «Сегодня»
  on(todayBtn,'click',function(){ var first=$('#cards .card'); if(first){ first.scrollIntoView({behavior:'smooth',block:'center'}); first.style.filter='brightness(1.08)'; setTimeout(function(){ first.style.filter=''; }, 600); } });

  showTab('calendar');
})();
