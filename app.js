document.addEventListener('DOMContentLoaded', () => {
  const activities = [
    { type: 'sea', date: '29.12.2025', text: 'Пляж Джомтьен' },
    { type: 'sea', date: '30.12.2025', text: 'Пляж Вонгамат' },
    { type: 'sight', date: '31.12.2025', text: 'Ват Янсангварам' },
    { type: 'sea', date: '01.01.2026', text: 'Пляж Паттайя' },
    { type: 'sea', date: '02.01.2026', text: 'Ко Лан (снорклинг)' },
    { type: 'sight', date: '03.01.2026', text: 'Сад Нонг Нуч' },
    { type: 'sea', date: '04.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sea', date: '05.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sight', date: '06.01.2026', text: 'Ват Кхао Пхра Бат' },
    { type: 'sea', date: '07.01.2026', text: 'Ко Сичанг' },
    { type: 'sea', date: '08.01.2026', text: 'Пляж Паттайя' },
    { type: 'sight', date: '09.01.2026', text: 'Dolphin World' },
    { type: 'sea', date: '10.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sight', date: '11.01.2026', text: 'Батискаф' },
    { type: 'sight', date: '12.01.2026', text: 'Art in Paradise' },
    { type: 'sea', date: '13.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sea', date: '14.01.2026', text: 'Пляж Паттайя' },
    { type: 'sight', date: '15.01.2026', text: 'Мини-Сиам' },
    { type: 'sea', date: '16.01.2026', text: 'Ко Лан' },
    { type: 'sea', date: '17.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sight', date: '18.01.2026', text: 'Sea Life Pattaya' },
    { type: 'sea', date: '19.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sea', date: '20.01.2026', text: 'Пляж Паттайя' },
    { type: 'sight', date: '21.01.2026', text: 'Ват Пхра Яй' },
    { type: 'sea', date: '22.01.2026', text: 'Пляж Джомтьен' },
    { type: 'sea', date: '23.01.2026', text: 'Пляж Вонгамат' },
    { type: 'sight', date: '24.01.2026', text: 'Central Festival' },
    { type: 'sea', date: '25.01.2026', text: 'Пляж Паттайя' }
  ];

  const cardsContainer = document.querySelector('.cards');
  activities.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = `card ${a.type}`;
    card.textContent = `${i + 1}. ${a.date}`;
    card.dataset.index = i;
    cardsContainer.append(card);
  });

  // Tab switching
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(sec => sec.classList.add('hidden'));
      document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
  });

  // Filtering
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.filter;
      document.querySelectorAll('.card').forEach(card => {
        card.style.display = (type === 'all' || card.classList.contains(type)) ? 'block' : 'none';
      });
    });
  });

  // Schedule details
  const overlay = document.getElementById('overlay');
  const details = document.getElementById('details');
  const detailsTitle = document.getElementById('detailsTitle');
  const scheduleList = document.getElementById('scheduleList');
  const closeBtn = document.getElementById('closeBtn');

  cardsContainer.addEventListener('click', e => {
    if (!e.target.classList.contains('card')) return;
    const idx = +e.target.dataset.index;
    const act = activities[idx];
    detailsTitle.textContent = `День ${idx + 1} • ${act.date}`;
    scheduleList.innerHTML = '';
    const base = [
      '09:00 — Выход из дома',
      act.type === 'sea'
        ? `10:00–13:00 — Пляж ${act.text}`
        : `10:00–12:00 — Посещение ${act.text}`,
      '13:00–14:00 — Обед'
    ];
    const extra = act.type === 'sea'
      ? [`14:00–17:00 — Пляж ${act.text}`, '17:00–18:00 — Возвращение домой']
      : [`13:00–15:00 — Прогулка`, '15:00–17:00 — Детская зона', '17:00–18:00 — Возвращение домой'];
    [...base, ...extra].forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      scheduleList.append(li);
    });
    overlay.classList.remove('hidden');
    details.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    details.classList.add('hidden');
  });
  overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
    details.classList.add('hidden');
  });

  if (window.Telegram?.WebApp) Telegram.WebApp.ready();
});

