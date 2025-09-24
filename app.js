document.addEventListener('DOMContentLoaded', () => {
  const activities = [
    { type:'sea',   date:'29.12.2025', text:'Пляж Джомтьен + детская зона' },
    { type:'sea',   date:'30.12.2025', text:'Пляж Вонгамат + водные горки' },
    { type:'sight', date:'31.12.2025', text:'Ват Янсангварам + парк' },
    { type:'sea',   date:'01.01.2026', text:'Пляж Паттайя + Underwater World' },
    { type:'sea',   date:'02.01.2026', text:'Ко Лан (снорклинг)' },
    { type:'sight', date:'03.01.2026', text:'Сад Нонг Нуч + шоу слонов' },
    { type:'sea',   date:'04.01.2026', text:'Пляж Джомтьен' },
    { type:'sea',   date:'05.01.2026', text:'Пляж Вонгамат + байк' },
    { type:'sight', date:'06.01.2026', text:'Ват Кхао Пхра Бат + обзор' },
    { type:'sea',   date:'07.01.2026', text:'Ко Сичанг' },
    { type:'sea',   date:'08.01.2026', text:'Пляж Паттайя' },
    { type:'sight', date:'09.01.2026', text:'Dolphin World + зона' },
    { type:'sea',   date:'10.01.2026', text:'Пляж Джомтьен' },
    { type:'sight', date:'11.01.2026', text:'Батискаф' },
    { type:'sight', date:'12.01.2026', text:'Art in Paradise + рынок' },
    { type:'sea',   date:'13.01.2026', text:'Пляж Вонгамат' },
    { type:'sea',   date:'14.01.2026', text:'Пляж Паттайя' },
    { type:'sight', date:'15.01.2026', text:'Мини-Сиам + аттракционы' },
    { type:'sea',   date:'16.01.2026', text:'Ко Лан' },
    { type:'sea',   date:'17.01.2026', text:'Пляж Джомтьен' },
    { type:'sight', date:'18.01.2026', text:'Sea Life Pattaya' },
    { type:'sea',   date:'19.01.2026', text:'Пляж Вонгамат' },
    { type:'sea',   date:'20.01.2026', text:'Пляж Паттайя' },
    { type:'sight', date:'21.01.2026', text:'Ват Пхра Яй + Люксор' },
    { type:'sea',   date:'22.01.2026', text:'Пляж Джомтьен' },
    { type:'sea',   date:'23.01.2026', text:'Пляж Вонгамат' },
    { type:'sight', date:'24.01.2026', text:'Central Festival' },
    { type:'sea',   date:'25.01.2026', text:'Пляж Паттайя' }
  ];

  const cards = document.querySelector('.cards');
  activities.forEach((a,i) => {
    const card = document.createElement('div');
    card.className = `card ${a.type}`;
    card.dataset.index = i;
    card.innerHTML = `
      <div class="card-header">${i+1}. ${a.date}</div>
      <div class="card-body">${a.text}</div>
    `;
    cards.append(card);
  });

  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(sec=>sec.classList.add('hidden'));
      document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
  });

  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(f=>f.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.filter;
      document.querySelectorAll('.card').forEach(c=>{
        c.style.display = (type==='all'||c.classList.contains(type))?'block':'none';
      });
    });
  });

  const overlay = document.getElementById('overlay');
  const details = document.getElementById('details');
  const title = document.getElementById('detailsTitle');
  const list = document.getElementById('scheduleList');
  const closeBtn = document.getElementById('closeBtn');

  cards.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const act = activities[card.dataset.index];
    title.textContent = `День ${+card.dataset.index+1} • ${act.date}`;
    list.innerHTML = `<li>09:00 — Выход из дома</li>`;

    if (act.type==='sea') {
      const loc=act.text.split(' +')[0];
      list.innerHTML+=`<li>10:00–13:00 — Пляж ${loc}</li>`;
      list.innerHTML+=`<li>13:00–14:00 — Обед</li>`;
      list.innerHTML+=`<li>14:00–17:00 — Пляж ${loc}</li>`;
      list.innerHTML+=`<li>17:00–18:00 — Возвращение домой</li>`;
    } else {
      const [m,s]=act.text.split(' +');
      list.innerHTML+=`<li>10:00–12:00 — Посещение ${m}</li>`;
      list.innerHTML+=`<li>12:00–13:00 — Обед</li>`;
      list.innerHTML+=`<li>13:00–15:00 — Прогулка в ${s}</li>`;
      list.innerHTML+=`<li>15:00–17:00 — Детская зона в ${s}</li>`;
      list.innerHTML+=`<li>17:00–18:00 — Возвращение домой</li>`;
    }

    overlay.classList.remove('hidden');
    details.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', ()=> {
    overlay.classList.add('hidden');
    details.classList.add('hidden');
  });
  overlay.addEventListener('click', ()=> {
    overlay.classList.add('hidden');
    details.classList.add('hidden');
  });

  if (window.Telegram?.WebApp) Telegram.WebApp.ready();
});
