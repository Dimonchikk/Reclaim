// Reclaim — інтерфейс. Усі дії ведуть до офіційних інструментів Apple.
// У застосунку немає й не буде обходу блокування активації та зняття Apple ID без пароля власника.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ICONS = {
    home: '<path d="M4 11.2L12 4l8 7.2V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1z"/>',
    key: '<circle cx="12" cy="9" r="3.3"/><path d="M5.5 19.5c.8-3.3 3.5-5.2 6.5-5.2s5.7 1.9 6.5 5.2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 018 0v2.5M12 14.6v1.8"/>',
    doc: '<path d="M6.5 3.5h7.2L18 7.8V19.5a1 1 0 01-1 1H6.5a1 1 0 01-1-1v-15a1 1 0 011-1z"/><path d="M13.5 3.5V8H18M8.7 14.3l2.1 2.1 4-4.2"/>',
    phone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2.6"/><path d="M10.5 5.7h3M11 18.2h2"/>',
    reset: '<path d="M20 12a8 8 0 11-2.6-5.9"/><path d="M20 4.5v4.2h-4.2"/>',
    exit: '<path d="M9.5 4.5H6A1.5 1.5 0 004.5 6v12A1.5 1.5 0 006 19.5h3.5M14.5 8l4 4-4 4M18.5 12h-9"/>',
    time: '<path d="M7 4h10M7 20h10M8 4c0 4 4 5 4 8s-4 4-4 8M16 4c0 4-4 5-4 8s4 4 4 8"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 7.9v.1"/>',
  };
  const COLORS = {
    home: '#007AFF', key: '#0A84FF', lock: '#5856D6', doc: '#34C759', phone: '#32ADE6',
    reset: '#FF9500', exit: '#8E8E93', time: '#FF2D55', info: '#636366',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24">${ICONS[n]}</svg>`;
  const ico = (n, lg) => `<span class="ico${lg ? ' lg' : ''}" style="--c:${COLORS[n]}">${svg(n)}</span>`;

  const ext = (url, label, cls = 'btn') => `<button class="${cls}" data-ext="${url}">${label}</button>`;
  const steps = (list) =>
    `<ol class="steps">${list.map((s) => `<li><b>${s[0]}</b><span>${s[1] || ''}</span></li>`).join('')}</ol>`;
  const tabs = (id, list) =>
    `<div class="tabs">${list.map((t, i) => `<button class="${i ? '' : 'on'}" data-tab="${id}:${i}">${t[0]}</button>`).join('')}</div>` +
    list.map((t, i) => `<div class="pane ${i ? '' : 'on'}" data-pane="${id}:${i}">${t[1]}</div>`).join('');
  const modelTabs = (id, list) => tabs(id, list.map((m) => [m[0], `<p>${m[1]}</p>`]));

  const URL_IFORGOT = 'https://iforgot.apple.com';
  const URL_SUPPORT = 'https://support.apple.com/uk-ua/contact';
  const URL_ICLOUD = 'https://www.icloud.com';
  const URL_ITUNES = 'https://www.apple.com/itunes/';

  const MODELS_ENTER = [
    ['iPhone 8 і новіші', 'Швидко натисніть і відпустіть кнопку збільшення гучності, потім зменшення гучності. Після цього утримуйте бічну кнопку, доки не з’явиться екран режиму відновлення (кабель і комп’ютер).'],
    ['iPhone 7', 'Одночасно утримуйте бічну кнопку та кнопку зменшення гучності, доки не з’явиться екран режиму відновлення.'],
    ['iPhone 6s і старші', 'Одночасно утримуйте кнопку «Додому» та бічну (верхню) кнопку, доки не з’явиться екран режиму відновлення.'],
  ];
  const MODELS_EXIT = [
    ['iPhone 8 і новіші', 'Відключіть кабель. Натисніть і відпустіть збільшення гучності, потім зменшення, і утримуйте бічну кнопку до появи логотипа Apple.'],
    ['iPhone 7', 'Відключіть кабель. Утримуйте бічну кнопку та зменшення гучності до появи логотипа Apple.'],
    ['iPhone 6s і старші', 'Відключіть кабель. Утримуйте кнопку «Додому» та бічну кнопку до появи логотипа Apple.'],
  ];

  const PROOF_ITEMS = [
    ['receipt', 'Чек або рахунок про покупку (оригінал, фото чи скан)'],
    ['serial', 'Серійний номер'],
    ['imei', 'IMEI'],
    ['box', 'Оригінальна коробка'],
    ['photos', 'Фото пристрою спереду й ззаду'],
  ];

  // Короткі описи режимів: що робить і чого не робить.
  const MODES = {
    appleid: {
      does: ['Веде крок за кроком офіційною сторінкою відновлення Apple ID', 'Підказує, що підготувати перед початком'],
      doesnt: ['Не бачить і не показує ваш пароль', 'Не скидає пароль замість Apple', 'Не обходить двофакторну автентифікацію'],
    },
    activation: {
      does: ['Пояснює, що таке блокування активації і чому iPhone його просить', 'Підказує, до кого звертатися у вашій ситуації'],
      doesnt: ['Не знімає блокування активації', 'Не пропонує «розблокувати без Apple ID»: так роблять лише шахраї'],
    },
    proof: {
      does: ['Складає чек-лист того, що потрібно підтримці Apple', 'Зберігає серійний номер та IMEI й створює PDF-пакет'],
      doesnt: ['Не надсилає ваші дані нікуди: усе лишається на цьому комп’ютері', 'Не гарантує, що Apple підтвердить власність'],
    },
    device: {
      does: ['Показує назву, модель, версію iOS, серійний номер та IMEI iPhone', 'Перевіряє драйвер Apple і підказує, що зробити, якщо щось не так'],
      doesnt: ['Нічого не змінює на телефоні', 'Не обходить запит довіри: підтвердити його можете лише ви на екрані iPhone'],
    },
    reset: {
      does: ['Покроково пояснює офіційне скидання через режим відновлення', 'Показує комбінацію кнопок для вашої моделі'],
      doesnt: ['Не стирає телефон сам: скидання робить програма Apple', 'Не знімає блокування активації: після скидання потрібен ваш Apple ID'],
    },
    exit: {
      does: ['Пояснює, як вийти з режиму відновлення без втрати даних', 'Показує комбінації кнопок за моделями'],
      doesnt: ['Не прошиває телефон', 'Не стирає дані: стирання можливе лише у програмі Apple за вашим підтвердженням'],
    },
    screentime: {
      does: ['Показує офіційні способи змінити код-пароль Screen Time', 'Підказує, що робити, якщо код забуто'],
      doesnt: ['Не підбирає і не «ламає» код-пароль', 'Не вимикає Screen Time без вашого Apple ID'],
    },
  };
  const modes = (id) => {
    const m = MODES[id];
    return `<div class="modes"><div class="mode yes"><h4>Що робить</h4><ul>${m.does.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      <div class="mode no"><h4>Чого не робить</h4><ul>${m.doesnt.map((x) => `<li>${x}</li>`).join('')}</ul></div></div>`;
  };

  // Назви моделей iPhone за ідентифікатором.
  const PHONE_NAMES = {
    'iPhone8,1': 'iPhone 6s', 'iPhone8,2': 'iPhone 6s Plus', 'iPhone8,4': 'iPhone SE (1-го покоління)',
    'iPhone9,1': 'iPhone 7', 'iPhone9,3': 'iPhone 7', 'iPhone9,2': 'iPhone 7 Plus', 'iPhone9,4': 'iPhone 7 Plus',
    'iPhone10,1': 'iPhone 8', 'iPhone10,4': 'iPhone 8', 'iPhone10,2': 'iPhone 8 Plus', 'iPhone10,5': 'iPhone 8 Plus',
    'iPhone10,3': 'iPhone X', 'iPhone10,6': 'iPhone X', 'iPhone11,2': 'iPhone XS', 'iPhone11,4': 'iPhone XS Max',
    'iPhone11,6': 'iPhone XS Max', 'iPhone11,8': 'iPhone XR', 'iPhone12,1': 'iPhone 11', 'iPhone12,3': 'iPhone 11 Pro',
    'iPhone12,5': 'iPhone 11 Pro Max', 'iPhone12,8': 'iPhone SE (2-го покоління)', 'iPhone13,1': 'iPhone 12 mini',
    'iPhone13,2': 'iPhone 12', 'iPhone13,3': 'iPhone 12 Pro', 'iPhone13,4': 'iPhone 12 Pro Max',
    'iPhone14,4': 'iPhone 13 mini', 'iPhone14,5': 'iPhone 13', 'iPhone14,2': 'iPhone 13 Pro', 'iPhone14,3': 'iPhone 13 Pro Max',
    'iPhone14,6': 'iPhone SE (3-го покоління)', 'iPhone14,7': 'iPhone 14', 'iPhone14,8': 'iPhone 14 Plus',
    'iPhone15,2': 'iPhone 14 Pro', 'iPhone15,3': 'iPhone 14 Pro Max', 'iPhone15,4': 'iPhone 15', 'iPhone15,5': 'iPhone 15 Plus',
    'iPhone16,1': 'iPhone 15 Pro', 'iPhone16,2': 'iPhone 15 Pro Max', 'iPhone17,3': 'iPhone 16', 'iPhone17,4': 'iPhone 16 Plus',
    'iPhone17,1': 'iPhone 16 Pro', 'iPhone17,2': 'iPhone 16 Pro Max', 'iPhone17,5': 'iPhone 16e',
  };
  const modelName = (id) => (PHONE_NAMES[id] ? `${PHONE_NAMES[id]} (${id})` : id || '—');

  let timer = null;      // опитування стану пристрою
  let devRefresh = null; // оновити екран пристрою

  const SCREENS = [
    { id: 'home', nav: 'Головна', sub: 'З чого почати', icon: 'home', render: () => `
      <h1>Чим допомогти?</h1>
      <p class="lead">Оберіть, що сталося. Ми проведемо вас офіційним шляхом Apple, крок за кроком.</p>
      <div id="homeBanner"></div>
      <div class="grid">
        <button class="tile" data-go="appleid">${ico('key', true)}<b>Забув пароль Apple ID</b><span>Покрокове відновлення на iforgot.apple.com</span></button>
        <button class="tile" data-go="activation">${ico('lock', true)}<b>iPhone просить Apple ID після скидання</b><span>Що таке блокування активації і що робити</span></button>
        <button class="tile" data-go="reset">${ico('reset', true)}<b>Забув пароль екрана</b><span>Скидання через режим відновлення</span></button>
        <button class="tile" data-go="screentime">${ico('time', true)}<b>Забув пароль Screen Time</b><span>Офіційні способи змінити код-пароль</span></button>
        <button class="tile wide" data-go="device">${ico('phone', true)}<div><b>Переглянути інформацію про iPhone</b><span>Модель, версія iOS, серійний номер, IMEI. Підключіть телефон кабелем.</span></div></button>
      </div>
      <p class="small" style="margin-top:24px">Reclaim не обходить захист Apple. Він допомагає власнику повернути доступ законно.</p>`,
      after: initHome },

    { id: 'appleid', nav: 'Відновлення Apple ID', sub: 'Забули пароль чи пошту', icon: 'key', render: () => `
      <h1>Відновлення Apple ID</h1>
      <p class="lead">Це безкоштовно й займає кілька хвилин. Якщо доступу до довірених даних немає, Apple запропонує відновлення облікового запису.</p>
      ${modes('appleid')}
      <div class="card">${steps([
        ['Підготуйтеся', 'Потрібен будь-який пристрій з інтернетом. Згадайте пошту або номер телефону, пов’язані з Apple ID.'],
        ['Відкрийте сторінку відновлення', 'Натисніть кнопку нижче: сторінка відкриється в браузері.'],
        ['Введіть Apple ID', 'Зазвичай це ваша пошта. Якщо не пам’ятаєте, скористайтеся пошуком Apple ID на тій самій сторінці.'],
        ['Підтвердьте особу', 'Apple надішле код на довірений номер або пристрій. Якщо доступу немає, запустіть відновлення облікового запису: воно може тривати кілька днів, це нормально.'],
        ['Створіть новий пароль', 'Не повторюйте старі паролі та збережіть новий у менеджері паролів.'],
      ])}
        <div class="row">${ext(URL_IFORGOT, 'Відкрити iforgot.apple.com')}</div>
      </div>
      <p>Не виходить? <button class="btn link" data-go="proof">Підготуйте докази власності</button> або ${ext(URL_SUPPORT, 'зверніться до підтримки Apple', 'btn link')}.</p>` },

    { id: 'activation', nav: 'Блокування активації', sub: 'iPhone просить чужий Apple ID', icon: 'lock', render: () => `
      <h1>Що таке блокування активації</h1>
      <p class="lead">Це захист Apple. Якщо в iPhone увімкнено «Знайти iPhone», після стирання він просить Apple ID власника. Так украдений телефон не можна використати.</p>
      ${modes('activation')}
      <div class="card"><h3>Чому ви це бачите</h3>
        <ul class="plain"><li>Ви забули свої дані Apple ID.</li><li>Ви купили телефон із рук, і попередній власник не вийшов з акаунта.</li></ul></div>
      <div class="card"><h3>Що робити</h3>
        <ul class="plain">
          <li><b>Це ваш телефон:</b> відновіть Apple ID (розділ «Відновлення Apple ID»).</li>
          <li><b>Купили б/в:</b> попросіть продавця зайти на iCloud.com → «Знайти iPhone» і видалити пристрій зі свого акаунта.</li>
          <li><b>Продавця немає:</b> зверніться до підтримки Apple з чеком про покупку.</li>
        </ul>
        <div class="row">${ext(URL_ICLOUD, 'Відкрити iCloud.com', 'btn secondary')}${ext(URL_SUPPORT, 'Підтримка Apple', 'btn secondary')}</div></div>
      <div class="card info"><h3>Чесно про межі</h3>
        <p>Жодна програма не може законно зняти блокування активації. Пропозиції «розблокувати без Apple ID» часто шахрайські. Reclaim цього не робить і не робитиме.</p></div>` },

    { id: 'proof', nav: 'Докази власності', sub: 'Чек, серійний номер, IMEI', icon: 'doc', render: () => `
      <h1>Підготуйте докази власності</h1>
      <p class="lead">З цим набором підтримка Apple швидше підтвердить, що пристрій ваш.</p>
      ${modes('proof')}
      <div class="card" id="proofList">${PROOF_ITEMS.map((p) => `<label class="check"><input type="checkbox" data-proof="${p[0]}"><span>${p[1]}</span></label>`).join('')}</div>
      <div class="card">
        <div class="field"><label for="serial">Серійний номер</label><input id="serial" autocomplete="off" spellcheck="false"></div>
        <div class="field"><label for="imei">IMEI</label><input id="imei" autocomplete="off" spellcheck="false" inputmode="numeric"></div>
        <p class="small">Де знайти: на коробці, у «Налаштування → Основні → Про пристрій» або в розділі «Мій iPhone». Якщо iPhone підключено, номери можна скопіювати звідти.</p>
        <div class="row"><button class="btn" id="savePdf">Зберегти як PDF-пакет</button><button class="btn secondary" id="copyNums">Скопіювати номери</button></div>
      </div>`, after: initProof },

    { id: 'device', nav: 'Мій iPhone', sub: 'Підключення й інформація', icon: 'phone', render: () => `
      <h1>Мій iPhone</h1>
      <p class="lead">Підключіть iPhone кабелем. Reclaim покаже, що готово, а чого бракує.</p>
      ${modes('device')}
      <div id="devBody"></div>
      <div class="row"><button class="btn secondary" id="devRefresh">Оновити</button></div>`, after: initDevice },

    { id: 'reset', nav: 'Скидання через режим відновлення', sub: 'Забули пароль екрана', icon: 'reset', render: () => `
      <h1>Скидання через режим відновлення</h1>
      ${modes('reset')}
      <div class="card warn"><h3>Усі дані на пристрої буде стерто</h3>
        <p>Продовжуйте, лише якщо це ваш iPhone і ви забули пароль екрана. Після скидання потрібен ваш Apple ID.</p></div>
      <div class="card">${steps([
        ['Резервна копія', 'Якщо маєте копію в iCloud чи на комп’ютері, дані можна буде відновити.'],
        ['Вимкніть iPhone', ''],
        ['Увійдіть у режим відновлення', 'Оберіть вкладку з вашою моделлю нижче.'],
        ['Підключіть до комп’ютера', 'Відкрийте застосунок Apple Devices (Windows 11) або iTunes.'],
        ['Натисніть «Відновити»', 'У програмі Apple. Вона сама завантажить iOS і скине пристрій.'],
        ['Налаштуйте заново', 'Введіть свій Apple ID, коли телефон попросить.'],
      ])}</div>
      <div class="card"><h3>Комбінації кнопок</h3>${modelTabs('enter', MODELS_ENTER)}</div>` },

    { id: 'exit', nav: 'Вихід із режиму відновлення', sub: 'iPhone завис на екрані кабелю', icon: 'exit', render: () => `
      <h1>iPhone завис на екрані відновлення?</h1>
      <p class="lead">Спершу спробуйте вийти без втрати даних.</p>
      ${modes('exit')}
      <div class="card">${steps([
        ['Відключіть кабель', ''],
        ['Перезавантажте кнопками', 'Утримуйте кнопки до появи логотипа Apple. Комбінація залежить від моделі.'],
        ['Якщо не допомогло', 'Підключіть до Apple Devices або iTunes і оберіть «Оновити», а не «Відновити»: так дані збережуться.'],
      ])}</div>
      <div class="card"><h3>Комбінації кнопок</h3>${modelTabs('exit', MODELS_EXIT)}</div>
      <div class="card info"><h3>Не допомагає?</h3><div class="row">${ext(URL_SUPPORT, 'Звернутися до підтримки Apple')}</div></div>` },

    { id: 'screentime', nav: 'Screen Time', sub: 'Забули код-пароль', icon: 'time', render: () => `
      <h1>Забули пароль Screen Time</h1>
      <p class="lead">Є три офіційні шляхи, від простого до крайнього.</p>
      ${modes('screentime')}
      <div class="card"><h3>А. Знаю пароль</h3><p>Налаштування → Екранний час → Змінити код-пароль.</p></div>
      <div class="card"><h3>Б. Забув пароль</h3><p>Налаштування → Екранний час → Змінити код-пароль → «Забули код-пароль?» і введіть свій Apple ID.</p></div>
      <div class="card"><h3>В. Не допомогло</h3><p>Скиньте пристрій (розділ «Скидання через режим відновлення») і налаштуйте його як новий, без відновлення з копії.</p></div>
      <p class="small">Порада: для дитини налаштуйте «Сімейний доступ», щоб батьки могли змінити код самі.</p>` },

    { id: 'about', nav: 'Про застосунок', sub: 'Версія, видалення', icon: 'info', bottom: true, render: () => `
      <h1>Про Reclaim</h1>
      <p class="lead">Чесний помічник для власника iPhone.</p>
      <div class="card"><div class="kv">
        <div class="k">Версія</div><div class="v" id="abVer">…</div><div></div>
        <div class="k">Вбудовані утиліти</div><div class="v" id="abTools">…</div><div></div>
        <div class="k">Драйвер Apple</div><div class="v" id="abDrv">…</div><div></div>
      </div></div>
      <div class="card info"><h3>Що Reclaim не робить</h3>
        <ul class="plain"><li>Не обходить блокування активації.</li><li>Не знімає Apple ID без пароля власника.</li></ul>
        <p>Усі кроки ведуть до офіційних інструментів Apple: iforgot.apple.com, Apple Devices або iTunes, налаштувань iPhone та підтримки Apple.</p></div>
      <div class="card"><h3>Видалення</h3>
        <p>Запускає стандартне видалення Windows.</p>
        <div class="row"><button class="btn danger" id="uninstall">Видалити Reclaim…</button></div></div>`, after: initAbout },
  ];

  // ---------- Навігація ----------
  const sidebar = $('#sidebar'), page = $('#page');
  function buildSidebar() {
    const item = (s) => `<button class="nav" data-go="${s.id}">${ico(s.icon)}<span class="t"><b>${s.nav}</b><small>${s.sub}</small></span></button>`;
    const body = SCREENS.filter((s) => !s.bottom);
    sidebar.innerHTML =
      `<div class="brand">${ico('phone')}Reclaim</div>` +
      item(body[0]) +
      '<div class="group">Відновлення доступу</div>' + body.slice(1, 4).map(item).join('') +
      '<div class="group">Мій iPhone</div>' + body.slice(4).map(item).join('') +
      '<div class="spacer"></div><div class="sep"></div>' +
      '<div class="seg-label">Тема</div>' +
      `<div class="seg" id="themeSeg">${[['system', 'Системна'], ['light', 'Світла'], ['dark', 'Темна']].map((t) => `<button data-theme-set="${t[0]}">${t[1]}</button>`).join('')}</div>` +
      SCREENS.filter((s) => s.bottom).map(item).join('');
    markTheme();
  }
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'system'; }
  function markTheme() {
    document.querySelectorAll('[data-theme-set]').forEach((b) => b.classList.toggle('on', b.dataset.themeSet === currentTheme()));
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (_) {}
    markTheme();
  }

  function go(id) {
    clearInterval(timer); timer = null; devRefresh = null;
    const s = SCREENS.find((x) => x.id === id) || SCREENS[0];
    page.innerHTML = `<div class="page-ico">${ico(s.icon, true)}</div>` + s.render();
    page.style.animation = 'none'; void page.offsetWidth; page.style.animation = '';
    document.querySelectorAll('.nav').forEach((n) => n.classList.toggle('active', n.dataset.go === s.id));
    $('.content').scrollTop = 0;
    if (s.after) s.after();
  }

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Скопійовано'); } catch (_) { toast('Не вдалося скопіювати'); }
  }

  document.addEventListener('click', async (e) => {
    const g = e.target.closest('[data-go]'); if (g) return go(g.dataset.go);
    const th = e.target.closest('[data-theme-set]'); if (th) return setTheme(th.dataset.themeSet);
    const x = e.target.closest('[data-ext]'); if (x) return window.api.openExternal(x.dataset.ext);
    const st = e.target.closest('[data-store]'); if (st) return window.api.openAppleDevices();
    const cp = e.target.closest('[data-copy]'); if (cp) return copy(cp.dataset.copy);
    const pr = e.target.closest('[data-pair]');
    if (pr) {
      pr.disabled = true;
      const r = await window.api.devicePair();
      toast(r.ok ? 'iPhone довіряє цьому комп’ютеру' : 'Підтвердьте «Довіряти» на екрані iPhone');
      pr.disabled = false;
      if (devRefresh) devRefresh(true);
      return;
    }
    const tb = e.target.closest('[data-tab]');
    if (tb) {
      const [id, i] = tb.dataset.tab.split(':');
      document.querySelectorAll(`[data-tab^="${id}:"]`).forEach((b) => b.classList.toggle('on', b === tb));
      document.querySelectorAll(`[data-pane^="${id}:"]`).forEach((p) => p.classList.toggle('on', p.dataset.pane === `${id}:${i}`));
    }
  });

  // ---------- Головна: перевірка драйвера Apple при відкритті ----------
  async function initHome() {
    const d = await window.api.driverStatus();
    const box = $('#homeBanner');
    if (!box) return;
    if (!d.installed) {
      box.innerHTML = `<div class="card warn banner"><div><b>Не встановлено драйвер Apple</b><br><span class="small">Без нього Reclaim не побачить iPhone. Він входить до безкоштовного застосунку Apple Devices.</span></div>
        <div class="row" style="margin:0"><button class="btn" data-store="1">Встановити з Microsoft Store</button></div></div>`;
    } else if (!d.running) {
      box.innerHTML = `<div class="card warn banner"><div><b>Службу Apple Mobile Device зупинено</b><br><span class="small">Перезавантажте комп’ютер або відкрийте Apple Devices, щоб вона запустилась.</span></div></div>`;
    } else {
      box.innerHTML = `<div class="card banner ok"><span>✓ Драйвер Apple встановлено, iPhone можна підключати</span></div>`;
    }
  }

  // ---------- Докази власності ----------
  const store = {
    get: () => { try { return JSON.parse(localStorage.getItem('proof') || '{}'); } catch (_) { return {}; } },
    set: (v) => { try { localStorage.setItem('proof', JSON.stringify(v)); } catch (_) {} },
  };
  function initProof() {
    const st = store.get();
    document.querySelectorAll('[data-proof]').forEach((c) => {
      c.checked = !!(st.done && st.done[c.dataset.proof]);
      c.addEventListener('change', save);
    });
    $('#serial').value = st.serial || ''; $('#imei').value = st.imei || '';
    $('#serial').addEventListener('input', save); $('#imei').addEventListener('input', save);
    function collect() {
      const done = {}; document.querySelectorAll('[data-proof]').forEach((c) => (done[c.dataset.proof] = c.checked));
      return { done, serial: $('#serial').value.trim(), imei: $('#imei').value.trim() };
    }
    function save() { store.set(collect()); }
    $('#copyNums').addEventListener('click', () => { const d = collect(); copy(`Серійний номер: ${d.serial}\nIMEI: ${d.imei}`); });
    $('#savePdf').addEventListener('click', async () => {
      const d = collect();
      const items = PROOF_ITEMS.map((p) => ({ label: p[1], done: !!d.done[p[0]] }));
      const r = await window.api.saveProofPdf({ items, serial: d.serial, imei: d.imei });
      if (r && r.ok) toast('PDF збережено');
    });
  }

  // ---------- Мій iPhone ----------
  const row = (status, title, text, actions) =>
    `<div class="r ${status}"><div class="dot">${status === 'ok' ? '✓' : status === 'bad' ? '!' : ''}</div><div><b>${title}</b><span>${text || ''}</span>${actions ? `<div class="row">${actions}</div>` : ''}</div></div>`;

  function renderDevice(s) {
    const storeBtn = `<button class="btn" data-store="1">Встановити Apple Devices (Microsoft Store)</button>${ext(URL_ITUNES, 'Або iTunes з сайту Apple', 'btn secondary')}`;
    const pairBtn = '<button class="btn" data-pair="1">Запросити довіру на iPhone</button>';
    const DRV_OK = ['ok', 'Драйвер Apple', 'Установлено й працює'];
    const R = { drv: ['wait', 'Драйвер Apple', 'Перевіряю…'], dev: ['wait', 'iPhone підключено', 'Очікує на драйвер'], trust: ['wait', 'Довіра до цього комп’ютера', 'Очікує на підключення'] };
    let info = '';
    switch (s.state) {
      case 'no-tools':
        R.drv = ['bad', 'Вбудовані утиліти не знайдено', 'Файли в папці bin пошкоджено або видалено. Перевстановіть застосунок.']; break;
      case 'no-driver':
        R.drv = ['bad', 'Драйвер Apple не встановлено', 'Без нього комп’ютер не бачить iPhone. Встановіть безкоштовний застосунок Apple Devices з Microsoft Store: нічого не завантажується автоматично, усе відкриється в Store.', storeBtn]; break;
      case 'driver-stopped':
        R.drv = ['bad', 'Службу Apple Mobile Device зупинено', 'Перезавантажте комп’ютер або відкрийте Apple Devices, щоб вона запустилась.']; break;
      case 'no-device':
        R.drv = DRV_OK;
        R.dev = ['bad', 'iPhone не знайдено', 'Підключіть iPhone кабелем і розблокуйте екран. Якщо не з’являється, спробуйте інший кабель чи порт.']; break;
      case 'locked':
        R.drv = DRV_OK; R.dev = ['ok', 'iPhone підключено', ''];
        R.trust = ['bad', 'iPhone заблоковано', 'Розблокуйте iPhone кодом і натисніть «Довіряти» у вікні на екрані.']; break;
      case 'not-trusted':
        R.drv = DRV_OK; R.dev = ['ok', 'iPhone підключено', ''];
        R.trust = ['bad', 'Потрібна довіра', 'На iPhone має з’явитися вікно «Довіряти цьому комп’ютеру?». Натисніть «Довіряти» й введіть код-пароль. Якщо вікна немає, натисніть кнопку нижче.', pairBtn]; break;
      case 'error':
        R.drv = DRV_OK; R.dev = ['ok', 'iPhone підключено', ''];
        R.trust = ['bad', 'Не вдалося прочитати дані', esc(s.detail || 'Невідома помилка') + '<br>Відключіть і підключіть кабель, розблокуйте iPhone й натисніть «Довіряти».', pairBtn]; break;
      case 'ready': {
        R.drv = DRV_OK;
        R.dev = ['ok', 'iPhone підключено', s.count > 1 ? `Знайдено пристроїв: ${s.count}. Показано перший.` : ''];
        R.trust = ['ok', 'Довіра до цього комп’ютера', 'Підтверджено'];
        const i = s.info;
        const act = i.activation === 'Activated' ? 'Активовано' : (i.activation || '—');
        const kv = [['Назва', i.name], ['Модель', modelName(i.model)], ['Версія iOS', i.ios], ['Серійний номер', i.serial], ['IMEI', i.imei], ['Стан активації', act]];
        info = `<div class="card"><h3>Інформація про iPhone</h3><div class="kv">${kv.map((x) => `<div class="k">${x[0]}</div><div class="v">${esc(x[1] || '—')}</div><div>${x[1] ? `<button class="btn secondary small" data-copy="${esc(x[1])}">Копіювати</button>` : ''}</div>`).join('')}</div>
          <p class="small" style="margin-top:12px">Це загальний стан активації пристрою. Чи ввімкнено «Знайти iPhone», дивіться в «Налаштування → Apple ID» на самому телефоні.</p>
          <div class="row"><button class="btn secondary" data-go="proof">Додати номери до доказів власності</button></div></div>`;
        break; }
    }
    return `<div class="card"><div class="ready">${['drv', 'dev', 'trust'].map((k) => row(...R[k])).join('')}</div></div>${info}`;
  }

  function initDevice() {
    const body = $('#devBody');
    let last = '';
    async function refresh(first) {
      if (first) { body.innerHTML = '<div class="card"><span class="spin"></span>Перевіряю підключення…</div>'; last = ''; }
      const s = await window.api.deviceStatus();
      if (!$('#devBody')) return; // користувач перейшов на інший екран
      const sig = JSON.stringify(s);
      if (sig === last) return;
      last = sig;
      body.innerHTML = renderDevice(s);
    }
    devRefresh = refresh;
    $('#devRefresh').addEventListener('click', () => refresh(true));
    refresh(true);
    timer = setInterval(() => refresh(false), 3000);
  }

  // ---------- Про застосунок ----------
  async function initAbout() {
    const info = await window.api.appInfo();
    const d = await window.api.driverStatus();
    if (!$('#abVer')) return;
    $('#abVer').textContent = info.version + (info.packaged ? '' : ' (запуск із папки)');
    $('#abTools').textContent = info.tools ? 'Знайдено (libimobiledevice)' : 'Не знайдено';
    $('#abDrv').textContent = !d.installed ? 'Не встановлено' : d.running ? 'Працює' : 'Службу зупинено';
    $('#uninstall').addEventListener('click', async () => {
      const r = await window.api.uninstall();
      if (r.mode === 'settings') toast('Відкрито «Встановлені програми» Windows: оберіть Reclaim');
      else if (r.mode === 'folder') toast('Застосунок запущено з папки: щоб видалити, просто видаліть цю папку');
    });
  }

  buildSidebar();
  go('home');
})();
