(function () {
  'use strict';

  // Telegram SDK init
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg) { tg.expand && tg.expand(); tg.ready(); }

  const activities = [
    { type: 'sea',   date: '29.12.2025', text: 'Пляж Джомтьен + детская зона' },
    { type: 'sea',   date: '30.12.2025', text: 'Пляж Вонгамат + водные горки' },
    { type: 'sight', date: '31.12.2025', text: 'Ват Янсангварам + прогулка по парку' },
    { type: 'sea',   date: '01.01.2026', text: 'Пляж Паттайя + Underwater World' },
    { type: 'sea',   date: '02.01.2026', text: 'Морская прогулка к Ко Лан (снорклинг)' },
    { type: 'sight', date: '03.01.2026', text: 'Сад Нонг Нуч + шоу слонов' },
    { type: 'sea',   date: '04.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sea',   date: '05.01.2026', text: 'Пляж Вонгамат + аренда байка' },
    { type: 'sight', date: '06.01.2026', text: 'Ват Кхао Пхра Бат + обзорная площадка' },
    { type: 'sea',   date: '07.01.2026', text: 'Морская прогулка к Ко Сичанг' },
    { type: 'sea',   date: '08.01.2026', text: 'Пляж Паттайя' },
    { type: 'sight', date: '09.01.2026', text: 'Dolphin World + детская зона' },
    { type: 'sea',   date: '10.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sight', date: '11.01.2026', text: 'Батискаф (12.969175,100.888124)' },
    { type: 'sight', date: '12.01.2026', text: 'Art in Paradise + плавучий рынок' },
    { type: 'sea',   date: '13.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sea',   date: '14.01.2026', text: 'Пляж Паттайя' },
    { type: 'sight', date: '15.01.2026', text: 'Мини-Сиам + детские аттракционы' },
    { type: 'sea',   date: '16.01.2026', text: 'Морская прогулка к Ко Лан' },
    { type: 'sea',   date: '17.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sight', date: '18.01.2026', text: 'Sea Life Pattaya (аквариум)' },
    { type: 'sea',   date: '19.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sea',   date: '20.01.2026', text: 'Пляж Паттайя' },
    { type: 'sight', date: '21.01.2026', text: 'Ват Пхра Яй + парк Люксор' },
    { type: 'sea',   date: '22.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sea',   date: '23.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sight', date: '24.01.2026', text: 'Central Festival + фуд-корт' },
    { type: 'sea',   date: '25.01.2026', text: 'Пляж Паттайя' }
  ];

  const cardsContainer = document.querySelector('.cards');
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-content');
  const filters = document.querySelectorAll('.filter');

  const overlay = document.getElementById('overlay');
  const details = document.getElementById('details');
  const closeBtn = document.getElementById('closeBtn');
  const detailsTitle = document.getElementById('detailsTitle');
  const scheduleList = document.getElementById('scheduleList');

  function renderCards(list) {
    cardsContainer.innerHTML = '';
    list.forEach((a, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `card ${a.type}`;
      card.dataset.index = String(i);
      card.innerHTML = `
        <div class="card-header">${i + 1}. ${a.date}</div>
        <div class="card-body">${a.text}</div>
      `;
      cardsContainer.appendChild(card);
    });
    cardsContainer.setAttribute('aria-busy', 'false');
  }
  renderCards(activities);

  function showTab(id) {
    panels.forEach(p => p.classList.add('hidden'));
    document.getElementById(id)?.classList.remove('hidden');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  }
  tabs.forEach(t => {
    t.addEventListener('click', () => showTab(t.dataset.tab));
    t.addEventListener('touchstart', () => showTab(t.dataset.tab), { passive: true });
  });

  function applyFilter(type) {
    filters.forEach(f => f.classList.toggle('active', f.dataset.filter === type || (type === 'all' && f.dataset.filter === 'all')));
    document.querySelectorAll('.card').forEach(c => {
      c.style.display = (type === 'all' || c.classList.contains(type)) ? 'flex' : 'none';
    });
  }
  filters.forEach(btn => {
    const type = btn.dataset.filter;
    btn.addEventListener('click', () => applyFilter(type));
    btn.addEventListener('touchstart', () => applyFilter(type), { passive: true });
  });

  function openDetails(idx) {
    const act = activities[idx];
    detailsTitle.textContent = `День ${idx + 1} • ${act.date}`;
    scheduleList.innerHTML = '';
    const rows = ['09:00 — Выход из дома'];
    if (act.type === 'sea') {
      const loc = act.text.split(' +')[0];
      rows.push(`10:00–13:00 — Пляж ${loc}`);
      rows.push('13:00–14:00 — Обед');
      rows.push(`14:00–17:00 — Пляж ${loc}`);
      rows.push('17:00–18:00 — Возвращение домой');
    } else {
      const [main, sub = 'ближайшая локация'] = act.text.split(' +');
      rows.push(`10:00–12:00 — Посещение ${main}`);
      rows.push('12:00–13:00 — Обед');
      rows.push(`13:00–15:00 — Прогулка в ${sub}`);
      rows.push(`15:00–17:00 — Детская зона в ${sub}`);
      rows.push('17:00–18:00 — Возвращение домой');
    }
    rows.forEach(t => { const li = document.createElement('li'); li.textContent = t; scheduleList.appendChild(li); });
    overlay.classList.remove('hidden'); details.classList.remove('hidden'); overlay.setAttribute('aria-hidden', 'false');
  }
  function closeDetails() { overlay.classList.add('hidden'); details.classList.add('hidden'); overlay.setAttribute('aria-hidden', 'true'); }

  cardsContainer.addEventListener('click', e => { const card = e.target.closest('.card'); if (!card) return; openDetails(Number(card.dataset.index)); });
  cardsContainer.addEventListener('touchstart', e => { const card = e.target.closest('.card'); if (!card) return; openDetails(Number(card.dataset.index)); }, { passive: true });

  overlay.addEventListener('click', closeDetails);
  closeBtn.addEventListener('click', closeDetails);

  showTab('calendar');
})();
