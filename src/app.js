// Reclaim — інтерфейс. Усі дії ведуть до офіційних інструментів Apple.
// У застосунку немає й не буде обходу блокування активації та зняття Apple ID без пароля власника.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  // Номер версії коротко, як у «Тихому ПК»: 1.0.0 → 1.0, 0.3.1 лишається 0.3.1.
  const ver = (v) => String(v || '').replace(/^v/i, '').replace(/^(\d+\.\d+)\.0$/, '$1');
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
    passcode: '<rect x="4" y="6.5" width="16" height="11" rx="2.5"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    sim: '<path d="M8 3.5h6.5L18.5 7.5V19.5a1 1 0 01-1 1h-9.5a1 1 0 01-1-1v-15a1 1 0 011-1z"/><rect x="9.3" y="11" width="5.4" height="6" rx="1"/>',
    carrier: '<path d="M12 20v-8M8.5 8.5a5 5 0 017 0M6 6a8.5 8.5 0 0112 0"/><circle cx="12" cy="11" r="1.2"/>',
    cart: '<path d="M4 5h2l2 10h10l2-7H7.2"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>',
    building: '<path d="M5 20V5.5A1.5 1.5 0 016.5 4h7A1.5 1.5 0 0115 5.5V20M15 10h3.5a1 1 0 011 1v9M3.5 20h17M8.5 8h3M8.5 12h3M8.5 16h3"/>',
    heart: '<path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0112 7.8a3.9 3.9 0 017 2.3c0 5.1-7 9.4-7 9.4z"/>',
    backup: '<path d="M7 18.5h10a4 4 0 00.6-8 5.5 5.5 0 00-10.7 1.2A3.4 3.4 0 007 18.5z"/><rect x="10" y="12.5" width="4" height="3.5" rx=".8"/><path d="M10.8 12.5v-1a1.2 1.2 0 012.4 0v1"/>',
  };
  const COLORS = {
    home: '#007AFF', key: '#0A84FF', lock: '#5856D6', doc: '#34C759', phone: '#32ADE6',
    reset: '#FF9500', exit: '#8E8E93', time: '#FF2D55', info: '#636366',
    passcode: '#FF9F0A', sim: '#30B0C7', carrier: '#00C7BE', cart: '#34C759', building: '#A2845E',
    heart: '#FF375F', backup: '#5AC8FA',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24">${ICONS[n]}</svg>`;
  const ico = (n, lg) => `<span class="ico${lg ? ' lg' : ''}" style="--c:${COLORS[n]}">${svg(n)}</span>`;

  const tile = (go, title, sub) => `<button class="tile" data-go="${go}">${ico(SCREEN_ICON[go] || go, true)}<span class="tx"><b>${title}</b><span class="s">${sub}</span></span></button>`;
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
  const URL_FIND = 'https://www.icloud.com/find';
  const URL_PASSCODE = 'https://support.apple.com/105090';
  const URL_PASSCODE_OLD = 'https://support.apple.com/105039';
  const URL_CARRIER = 'https://support.apple.com/109316';
  const URL_AL_SUPPORT = 'https://al-support.apple.com';
  const URL_LEGACY = 'https://digital-legacy.apple.com';
  const URL_DECEASED = 'https://support.apple.com/102431';
  const URL_COVERAGE = 'https://checkcoverage.apple.com';

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
      does: ['Перевіряє активацію, код-пароль, «Знайти iPhone», SIM-картку, батарею й пам’ять', 'Підказує, у який розділ звернутися', 'Показує модель, iOS, серійний номер та IMEI', 'Запам’ятовує підключені iPhone в історії лише на цьому комп’ютері', 'Перевіряє драйвер Apple і підказує, що зробити, якщо щось не так'],
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
    passcode: {
      does: ['Підказує найшвидший офіційний шлях для вашої версії iOS', 'Пояснює, коли можна зберегти дані, а коли доведеться стерти iPhone'],
      doesnt: ['Не підбирає код-пароль', 'Не обходить екран блокування'],
    },
    carrier: {
      does: ['Показує, як перевірити, чи прив’язаний iPhone до оператора', 'Пояснює, як попросити оператора зняти прив’язку'],
      doesnt: ['Не знімає прив’язку сам: це може зробити лише оператор', 'Не змінює IMEI і не ставить «чіпи»-обманки'],
    },
    sim: {
      does: ['Пояснює різницю між кодом-паролем екрана, PIN і PUK SIM-картки', 'Підказує, де взяти PUK і як вимкнути запит PIN'],
      doesnt: ['Не підбирає PIN чи PUK', 'Не відновлює заблоковану SIM-картку: її замінює оператор'],
    },
    buy: {
      does: ['Дає чек-лист, що перевірити до оплати', 'Пояснює, як продавець має вийти з Apple ID і стерти телефон при вас'],
      doesnt: ['Не перевіряє телефон за базами крадених пристроїв', 'Не допоможе з телефоном, з якого продавець не вийшов'],
    },
    mdm: {
      does: ['Пояснює, що означає «Віддалене керування» і профілі', 'Підказує, як законно звільнити пристрій від керування'],
      doesnt: ['Не видаляє керування без організації', 'Не обходить екран налаштування з віддаленим керуванням'],
    },
    legacy: {
      does: ['Пояснює офіційний шлях Apple для родини власника, який помер', 'Підказує, які документи підготувати'],
      doesnt: ['Не дає доступу до чужого облікового запису', 'Не прискорює розгляд запиту в Apple'],
    },
    backup: {
      does: ['Пояснює, як скинути пароль зашифрованих резервних копій на самому iPhone', 'Підказує, що станеться зі старими копіями'],
      doesnt: ['Не підбирає пароль резервної копії', 'Не розшифровує старі копії'],
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
    'iPhone1,1': 'iPhone (1-го покоління)', 'iPhone1,2': 'iPhone 3G', 'iPhone2,1': 'iPhone 3GS',
    'iPhone3,1': 'iPhone 4', 'iPhone3,2': 'iPhone 4', 'iPhone3,3': 'iPhone 4', 'iPhone4,1': 'iPhone 4S',
    'iPhone5,1': 'iPhone 5', 'iPhone5,2': 'iPhone 5', 'iPhone5,3': 'iPhone 5c', 'iPhone5,4': 'iPhone 5c',
    'iPhone6,1': 'iPhone 5s', 'iPhone6,2': 'iPhone 5s', 'iPhone7,2': 'iPhone 6', 'iPhone7,1': 'iPhone 6 Plus',
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
    'iPhone18,1': 'iPhone 17 Pro', 'iPhone18,2': 'iPhone 17 Pro Max', 'iPhone18,3': 'iPhone 17', 'iPhone18,4': 'iPhone Air', 'iPhone18,5': 'iPhone 17e',
  };
  // Невідомий ідентифікатор не вгадуємо: показуємо «Невідома модель» і сам код.
  const modelName = (id) => {
    if (!id) return '—';
    if (PHONE_NAMES[id]) return `${PHONE_NAMES[id]} (${id})`;
    if (/^iPad/.test(id)) return `iPad (${id})`;
    if (/^iPod/.test(id)) return `iPod touch (${id})`;
    return `Невідома модель (${id})`;
  };

  let timer = null;      // опитування стану пристрою
  let devRefresh = null; // оновити екран пристрою

  const SCREENS = [
    { id: 'home', nav: 'Головна', sub: 'З чого почати', icon: 'home', render: () => `
      <h1>Чим допомогти?</h1>
      <p class="lead">Оберіть, що сталося. Ми проведемо вас офіційним шляхом Apple, крок за кроком.</p>
      <div id="updBox"></div>
      <div id="homeBanner"></div>
      <div class="grid one">${tile('device', 'Діагностика iPhone', 'Підключіть iPhone кабелем: Reclaim перевірить блокування, SIM, батарею й пам’ять і підкаже, що робити')}</div>
      <div class="home-group">Код і паролі</div>
      <div class="grid">
        ${tile('passcode', 'Забув код екрана', 'iPhone недоступний або просить код')}
        ${tile('appleid', 'Забув пароль Apple ID', 'Відновлення на iforgot.apple.com')}
        ${tile('screentime', 'Забув код Screen Time', 'Офіційні способи змінити код')}
        ${tile('backup', 'Забув пароль резервної копії', 'Зашифровані копії на комп’ютері')}
      </div>
      <div class="home-group">Блокування</div>
      <div class="grid">
        ${tile('activation', 'Просить чужий Apple ID', 'Блокування активації після скидання')}
        ${tile('carrier', 'Не бачить SIM іншого оператора', 'Прив’язка до оператора')}
        ${tile('sim', 'Просить PIN або PUK SIM', 'Заблокована SIM-картка')}
        ${tile('mdm', 'Пише «Віддалене керування»', 'Телефон компанії чи школи')}
      </div>
      <div class="home-group">Особливі випадки</div>
      <div class="grid">
        ${tile('buy', 'Купую iPhone з рук', 'Що перевірити до оплати')}
        ${tile('legacy', 'iPhone рідної людини, яка померла', 'Офіційний шлях Apple для родини')}
        ${tile('proof', 'Докази власності', 'Чек, серійний номер та IMEI в одному PDF')}
      </div>
      <p class="small" style="margin-top:24px">Reclaim не обходить захист Apple. Він допомагає власнику повернути доступ законно.</p>`,
      after: () => { renderUpdate(); initHome(); } },

    { id: 'passcode', nav: 'Забули код екрана', sub: 'iPhone недоступний', icon: 'passcode', render: () => `
      <h1>Забули код-пароль екрана</h1>
      <p class="lead">Оберіть спосіб від першого до останнього. Перший зберігає дані, решта стирають iPhone, тож дані повернуться лише з резервної копії.</p>
      ${modes('passcode')}
      <div class="card"><h3>1. Змінили код менше ніж 72 години тому (iOS 17 і новіші)</h3>
        <p>Старий код ще працює. Дані не зникнуть.</p>
        ${steps([
          ['Дочекайтеся екрана «iPhone недоступний»', 'Він з’являється після кількох неправильних спроб.'],
          ['Натисніть «Забули код-пароль?»', 'Унизу екрана.'],
          ['Оберіть «Ввести попередній код-пароль»', 'Введіть старий код і створіть новий.'],
        ])}
        <div class="row">${ext(URL_PASSCODE_OLD, 'Інструкція Apple', 'btn secondary')}</div></div>
      <div class="card"><h3>2. Скидання прямо на iPhone, без комп’ютера</h3>
        <p>Працює на iOS 15.2 і новіших, якщо iPhone у мережі (Wi‑Fi чи мобільний інтернет) і на ньому ввімкнено «Знайти iPhone».</p>
        ${steps([
          ['Екран «iPhone недоступний»', 'Вводьте код, доки він не з’явиться.'],
          ['«Забули код-пароль?» → «Почати скидання iPhone»', 'На iOS 15.2 і 16 кнопка називається «Стерти iPhone».'],
          ['Введіть пароль свого Apple ID', 'Так iPhone вийде з облікового запису.'],
          ['Підтвердьте стирання', 'Після перезапуску налаштуйте iPhone і відновіть дані з копії.'],
        ])}
        <div class="row">${ext(URL_PASSCODE, 'Інструкція Apple', 'btn secondary')}</div></div>
      <div class="card"><h3>3. Стерти через «Знайти» на iCloud.com</h3>
        <p>З будь-якого комп’ютера чи телефону: увійдіть у свій Apple ID, оберіть iPhone і «Стерти пристрій».</p>
        <div class="row">${ext(URL_FIND, 'Відкрити «Знайти» на iCloud.com', 'btn secondary')}</div></div>
      <div class="card"><h3>4. Через комп’ютер</h3>
        <p>Якщо попередні способи не підходять, скиньте iPhone у режимі відновлення.</p>
        <div class="row"><button class="btn" data-go="reset">Скидання через комп’ютер</button></div></div>
      <div class="card info"><h3>Бачите «Затримка безпеки»?</h3>
        <p>Це «Захист викраденого пристрою», а не блокування. Поза знайомими місцями iPhone просить Face ID або Touch ID і годину чекання перед зміною пароля Apple ID чи коду. Просто дочекайтеся кінця таймера або поверніться додому чи на роботу.</p></div>` },

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
      <div class="card"><h3>Apple ID заблоковано або вимкнено</h3>
        <ul class="plain">
          <li><b>«Цей Apple ID заблоковано з міркувань безпеки»:</b> розблокуйте його на iforgot.apple.com своїм паролем або через підтвердження особи.</li>
          <li><b>«Обліковий запис вимкнено в App Store та iTunes»:</b> це питання оплати чи безпеки, його вирішує лише підтримка Apple.</li>
          <li><b>«Обліковий запис не активний»:</b> зверніться до підтримки Apple.</li>
        </ul>
        <div class="row">${ext(URL_IFORGOT, 'Розблокувати на iforgot.apple.com', 'btn secondary')}${ext(URL_SUPPORT, 'Підтримка Apple', 'btn secondary')}</div></div>
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
          <li><b>Продавця немає, але є оригінальний чек:</b> подайте запит на зняття блокування активації на сайті Apple. Потрібен чек від Apple або авторизованого продавця з серійним номером чи IMEI.</li>
          <li><b>Власник помер:</b> дивіться розділ «Пристрій рідної людини».</li>
        </ul>
        <div class="row">${ext(URL_AL_SUPPORT, 'Запит на зняття блокування', 'btn')}${ext(URL_FIND, 'Відкрити «Знайти»', 'btn secondary')}<button class="btn secondary" data-go="legacy">Пристрій рідної людини</button></div></div>
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

    { id: 'device', nav: 'Діагностика iPhone', sub: 'Підключіть кабелем', icon: 'phone', render: () => `
      <h1>Діагностика iPhone</h1>
      <p class="lead">Підключіть iPhone кабелем. Reclaim перевірить активацію, код-пароль, «Знайти iPhone», SIM-картку, батарею й пам’ять і підкаже, куди звернутися.</p>
      <div id="devBody"></div>
      <div id="histBox"></div>
      <h2>Про цей розділ</h2>
      ${modes('device')}`, after: initDevice },

    { id: 'reset', nav: 'Скидання через ПК', sub: 'Режим відновлення, забули код', icon: 'reset', render: () => `
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

    { id: 'exit', nav: 'Вихід із відновлення', sub: 'Завис на екрані кабелю', icon: 'exit', render: () => `
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

    { id: 'screentime', nav: 'Код Screen Time', sub: 'Екранний час', icon: 'time', render: () => `
      <h1>Забули пароль Screen Time</h1>
      <p class="lead">Є три офіційні шляхи, від простого до крайнього.</p>
      ${modes('screentime')}
      <div class="card"><h3>А. Знаю пароль</h3><p>Налаштування → Екранний час → Змінити код-пароль.</p></div>
      <div class="card"><h3>Б. Забув пароль</h3><p>Налаштування → Екранний час → Змінити код-пароль → «Забули код-пароль?» і введіть свій Apple ID.</p></div>
      <div class="card"><h3>В. Не допомогло</h3><p>Скиньте пристрій (розділ «Скидання через режим відновлення») і налаштуйте його як новий, без відновлення з копії.</p></div>
      <p class="small">Порада: для дитини налаштуйте «Сімейний доступ», щоб батьки могли змінити код самі.</p>` },

    { id: 'backup', nav: 'Пароль резервної копії', sub: 'Зашифровані копії', icon: 'backup', render: () => `
      <h1>Забули пароль резервної копії</h1>
      <p class="lead">Зашифровані копії iPhone на комп’ютері захищені окремим паролем. Відновити старі копії без нього неможливо, але для нових копій пароль можна скинути.</p>
      ${modes('backup')}
      <div class="card">${steps([
        ['Відкрийте на iPhone налаштування', 'Налаштування → Основні → Перенесення або скидання iPhone.'],
        ['Оберіть «Скинути» → «Скинути всі налаштування»', 'Дані й фото лишаться. Скинуться лише налаштування: Wi‑Fi, шпалери, яскравість, а також пароль шифрування копій.'],
        ['Зробіть нову резервну копію', 'Підключіть iPhone до Apple Devices або iTunes і створіть копію. Якщо ввімкнете шифрування, задайте новий пароль і збережіть його в менеджері паролів.'],
      ])}</div>
      <div class="card warn"><h3>Старі зашифровані копії</h3><p>Попередні зашифровані копії однаково не відкриються без старого пароля. Програми, що обіцяють «зламати» їх, не потрібні: краще зробіть нову копію.</p></div>` },

    { id: 'carrier', nav: 'Прив’язка до оператора', sub: 'Інша SIM не працює', icon: 'carrier', render: () => `
      <h1>Прив’язка до оператора</h1>
      <p class="lead">Деякі iPhone, куплені в оператора з контрактом, працюють лише з його SIM-картками. Зняти прив’язку може тільки цей оператор, Apple цього не робить.</p>
      ${modes('carrier')}
      <div class="card"><h3>Як перевірити</h3>${steps([
        ['Налаштування → Основні → Про пристрій', ''],
        ['Знайдіть рядок «Блокування оператора»', 'Якщо там написано «Без обмежень SIM» (No SIM restrictions), iPhone ні до кого не прив’язаний.'],
      ])}</div>
      <div class="card"><h3>Як зняти прив’язку</h3>${steps([
        ['Зверніться до оператора, якому належить прив’язка', 'Зазвичай потрібні IMEI, договір і погашений контракт. IMEI є в розділі «Мій iPhone».'],
        ['Дочекайтеся підтвердження', 'Оператор знімає прив’язку у своїй системі.'],
        ['Вставте SIM іншого оператора', 'Якщо iPhone не активується, зробіть резервну копію, скиньте його і відновіть з копії.'],
      ])}<div class="row">${ext(URL_CARRIER, 'Інструкція Apple', 'btn secondary')}<button class="btn secondary" data-go="device">Знайти IMEI</button></div></div>
      <div class="card info"><h3>Обережно з «анлоками»</h3><p>Сервіси, що змінюють IMEI або ставлять під SIM «чіпи»-обманки, працюють нестабільно, а зміна IMEI в багатьох країнах незаконна. Законний шлях лише один: оператор.</p></div>` },

    { id: 'sim', nav: 'PIN і PUK SIM-картки', sub: 'Заблокована SIM', icon: 'sim', render: () => `
      <h1>SIM-картка просить PIN або PUK</h1>
      <p class="lead">PIN захищає саму SIM-картку, а не iPhone. Це не код-пароль екрана, тож його не скинути через Apple.</p>
      ${modes('sim')}
      <div class="card"><h3>Якщо просить PIN</h3>
        <p>Введіть PIN SIM-картки. Стандартний PIN часто вказаний на пластиковій картці, з якої виламали SIM. Не вгадуйте: після трьох неправильних спроб SIM попросить PUK.</p></div>
      <div class="card"><h3>Якщо просить PUK</h3>${steps([
        ['Візьміть PUK у оператора', 'Він є на пластиковій картці від SIM, в особистому кабінеті або в службі підтримки оператора.'],
        ['Введіть PUK і новий PIN', ''],
        ['Не вгадуйте', 'Після кількох неправильних PUK (зазвичай 10) SIM блокується назавжди, і її доведеться замінити в оператора. Номер при цьому зберігається.'],
      ])}</div>
      <div class="card"><h3>Як вимкнути або змінити PIN</h3><p>Налаштування → Мобільний зв’язок → PIN-код SIM.</p></div>` },

    { id: 'buy', nav: 'Купівля з рук', sub: 'Перевірка перед покупкою', icon: 'cart', render: () => `
      <h1>Купуєте iPhone з рук?</h1>
      <p class="lead">Найчастіше блокування активації з’являється саме після покупки б/в. Перевірте все до оплати.</p>
      ${modes('buy')}
      <div class="card">${steps([
        ['Продавець виходить з Apple ID при вас', 'Налаштування → [ім’я] → Вийти. Потрібен його пароль. Якщо він «забув пароль», не купуйте.'],
        ['Продавець стирає iPhone при вас', 'Налаштування → Основні → Перенесення або скидання iPhone → Стерти весь вміст і налаштування.'],
        ['Увімкніть iPhone і пройдіть налаштування до кінця', 'Якщо він просить чужий Apple ID, телефон заблоковано. Не платіть.'],
        ['Перевірте прив’язку до оператора', 'Налаштування → Основні → Про пристрій → «Блокування оператора».'],
        ['Звірте серійний номер', 'Номер у налаштуваннях має збігатися з коробкою. Перевірте його на сайті покриття Apple.'],
        ['Візьміть чек або розписку', 'Знадобиться, якщо колись доведеться звертатися в Apple.'],
      ])}<div class="row">${ext(URL_COVERAGE, 'Перевірити серійний номер', 'btn secondary')}</div></div>
      <div class="card info"><h3>Продавець уже далеко?</h3><p>Попросіть його видалити iPhone дистанційно: iCloud.com → «Знайти» → оберіть пристрій → «Видалити з облікового запису».</p>
        <div class="row">${ext(URL_FIND, 'Відкрити «Знайти»', 'btn secondary')}</div></div>` },

    { id: 'mdm', nav: 'Пристрій організації', sub: 'Віддалене керування', icon: 'building', render: () => `
      <h1>«Віддалене керування» на iPhone</h1>
      <p class="lead">Якщо під час налаштування з’являється «Віддалене керування» або в iPhone є профіль компанії чи школи, ним керує організація.</p>
      ${modes('mdm')}
      <div class="card"><h3>Що робити</h3><ul class="plain">
        <li><b>Телефон видали на роботі чи в навчальному закладі:</b> зверніться до їхнього IT-відділу. Лише вони можуть звільнити пристрій.</li>
        <li><b>Купили такий телефон:</b> попросіть продавця або організацію, яка його продала, прибрати iPhone зі своєї системи керування (Apple Business Manager чи School Manager). Без цього керування повертатиметься після кожного скидання.</li>
        <li><b>Профіль поставили ви самі:</b> Налаштування → Основні → Керування VPN і пристроєм → оберіть профіль → Видалити.</li>
      </ul></div>
      <div class="card info"><h3>Чесно про межі</h3><p>Обходити віддалене керування на чужому пристрої незаконно. Reclaim лише підказує, до кого звернутися.</p></div>` },

    { id: 'legacy', nav: 'Пристрій рідної людини', sub: 'Власник помер', icon: 'heart', render: () => `
      <h1>iPhone рідної людини, яка померла</h1>
      <p class="lead">Співчуваємо вашій втраті. Apple має офіційні шляхи для родини, і їх можна пройти без поспіху.</p>
      ${modes('legacy')}
      <div class="card"><h3>1. Вас призначено контактом спадку</h3>
        <p>Якщо людина додала вас як контакт спадку (Legacy Contact), у вас є ключ доступу. Подайте запит на сайті Apple разом зі свідоцтвом про смерть.</p>
        <div class="row">${ext(URL_LEGACY, 'Цифровий спадок Apple', 'btn')}</div></div>
      <div class="card"><h3>2. Контакту спадку немає</h3>
        <p>Родина може попросити Apple надати доступ до облікового запису або зняти блокування активації. Зазвичай потрібні свідоцтво про смерть, документ про право на спадок або рішення суду, а для зняття блокування ще й підтвердження покупки пристрою.</p>
        <div class="row">${ext(URL_DECEASED, 'Як подати запит до Apple', 'btn secondary')}${ext(URL_AL_SUPPORT, 'Запит на зняття блокування', 'btn secondary')}</div></div>
      <div class="card info"><h3>Що підготувати</h3><p>Чек на пристрій, серійний номер та IMEI. Їх можна зібрати в розділі «Докази власності».</p>
        <div class="row"><button class="btn secondary" data-go="proof">Докази власності</button></div></div>` },

    { id: 'about', nav: 'Про застосунок', sub: 'Версія, видалення', icon: 'info', bottom: true, render: () => `
      <h1>Про Reclaim</h1>
      <p class="lead">Чесний помічник для власника iPhone.</p>
      <div class="card"><div class="kv">
        <div class="k">Версія</div><div class="v" id="abVer">…</div><div></div>
        <div class="k">Вбудовані утиліти</div><div class="v" id="abTools">…</div><div></div>
        <div class="k">Драйвер Apple</div><div class="v" id="abDrv">…</div><div></div>
      </div></div>
      <div class="card"><h3>Оновлення</h3>
        <p id="abUpd" class="small">Перевіряю…</p>
        <p class="small">Reclaim питає GitHub лише про номер останньої версії: під час запуску й раз на годину. Нічого не завантажується й не встановлюється без вашої дії.</p>
        <div class="row" id="abUpdRow"><button class="btn secondary" id="abCheck">Шукати оновлення</button></div></div>
      <div class="card"><h3>Що нового</h3><div id="abLog" class="small" translate="no">…</div></div>
      <div class="card info"><h3>Що Reclaim не робить</h3>
        <ul class="plain"><li>Не обходить блокування активації.</li><li>Не знімає Apple ID без пароля власника.</li></ul>
        <p>Усі кроки ведуть до офіційних інструментів Apple: iforgot.apple.com, Apple Devices або iTunes, налаштувань iPhone та підтримки Apple.</p></div>
      <div class="card"><h3>Видалення</h3>
        <p>Запускає стандартне видалення Windows.</p>
        <div class="row"><button class="btn danger" id="uninstall">Видалити Reclaim…</button></div></div>`, after: initAbout },
  ];

  const SCREEN_ICON = Object.fromEntries(SCREENS.map((x) => [x.id, x.icon]));

  // ---------- Навігація ----------
  // Групи бокового меню. Кожну можна згорнути; стан запам’ятовується.
  const GROUPS = [
    ['codes', 'Код і паролі', ['passcode', 'appleid', 'screentime', 'backup']],
    ['locks', 'Блокування', ['activation', 'carrier', 'sim', 'mdm']],
    ['special', 'Особливі випадки', ['buy', 'legacy', 'proof']],
    ['iphone', 'Мій iPhone', ['device', 'reset', 'exit']],
  ];
  const I18N = window.I18N || { lang: 'uk', locale: 'uk-UA', set() {} };
  const LANG_BTNS = [['uk', 'УКР', 'Українська'], ['ru', 'РУС', 'Русский'], ['en', 'ENG', 'English']];
  const THEMES = [['system', 'Авто'], ['light', 'Світла'], ['dark', 'Темна'], ['glass', 'Скло']];
  const CHEV = '<svg class="chev" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3"/></svg>';
  const SEARCH = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>';
  const closedGroups = () => { try { return JSON.parse(localStorage.getItem('navClosed') || '[]'); } catch (_) { return []; } };
  const sidebar = $('#sidebar'), page = $('#page');
  const byId = (id) => SCREENS.find((x) => x.id === id);

  function buildSidebar() {
    const item = (sc) => `<button class="nav" data-go="${sc.id}" title="${esc(sc.sub)}" data-q="${esc((sc.nav + ' ' + sc.sub).toLowerCase())}">${ico(sc.icon)}<span class="t">${sc.nav}</span></button>`;
    const closed = closedGroups();
    sidebar.innerHTML =
      `<div class="brand">${ico('phone')}<span>Reclaim</span>` +
        `<div class="lang" translate="no">${LANG_BTNS.map((l) => `<button data-lang="${l[0]}" class="${l[0] === I18N.lang ? 'on' : ''}" title="${l[2]}">${l[1]}</button>`).join('')}</div></div>` +
      `<label class="search">${SEARCH}<input id="navSearch" type="search" placeholder="Пошук" autocomplete="off" spellcheck="false"></label>` +
      item(byId('home')) +
      GROUPS.map(([gid, title, ids]) => {
        const c = closed.includes(gid) ? ' closed' : '';
        return `<button class="group${c}" data-group="${gid}">${title}${CHEV}</button><div class="items${c}" data-items="${gid}">${ids.map((id) => item(byId(id))).join('')}</div>`;
      }).join('') +
      '<div class="nomatch" id="noMatch" hidden>Нічого не знайдено</div>' +
      '<div class="spacer"></div><div class="sep"></div>' +
      '<div class="seg-label">Тема</div>' +
      `<div class="seg" id="themeSeg">${THEMES.map((t) => `<button data-theme-set="${t[0]}">${t[1]}</button>`).join('')}</div>` +
      SCREENS.filter((x) => x.bottom).map(item).join('');
    markTheme();
    $('#navSearch').addEventListener('input', filterNav);
  }
  function toggleGroup(gid, open) {
    const g = $(`[data-group="${gid}"]`), it = $(`[data-items="${gid}"]`);
    if (!g) return;
    const isOpen = open === undefined ? g.classList.contains('closed') : open;
    g.classList.toggle('closed', !isOpen); it.classList.toggle('closed', !isOpen);
    const set = new Set(closedGroups());
    if (isOpen) set.delete(gid); else set.add(gid);
    try { localStorage.setItem('navClosed', JSON.stringify([...set])); } catch (_) {}
  }
  // Пошук: показує лише збіги, групи при цьому розгорнуті.
  function filterNav() {
    const q = $('#navSearch').value.trim().toLowerCase();
    let any = false;
    document.querySelectorAll('.sidebar .nav[data-q]').forEach((n) => {
      const hay = n.dataset.q + ' ' + (n.textContent + ' ' + (n.title || '')).toLowerCase(); // і українською, і поточною мовою
      const hit = !q || hay.includes(q);
      n.hidden = !hit; if (hit && q) any = true;
    });
    GROUPS.forEach(([gid]) => {
      const it = $(`[data-items="${gid}"]`), g = $(`[data-group="${gid}"]`);
      const vis = [...it.querySelectorAll('.nav')].some((n) => !n.hidden);
      if (q) { it.classList.remove('closed'); g.hidden = !vis; it.hidden = !vis; }
      else { g.hidden = false; it.hidden = false; it.classList.toggle('closed', g.classList.contains('closed')); }
    });
    $('#noMatch').hidden = !q || any;
  }

  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'system'; }
  function markTheme() {
    document.querySelectorAll('[data-theme-set]').forEach((b) => b.classList.toggle('on', b.dataset.themeSet === currentTheme()));
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (_) {}
    markTheme();
    applyGlass();
  }
  // «Скло»: підкладаємо розмиті шпалери робочого стола. Немає шпалер — м’яке синьо-фіолетове сяйво.
  async function applyGlass() {
    const root = document.documentElement;
    if (currentTheme() !== 'glass') return;
    let w = null;
    try { w = await window.api.wallpaper(); } catch (_) {}
    if (currentTheme() !== 'glass') return;
    if (w && w.url) { root.style.setProperty('--wall', `url("${w.url}")`); root.setAttribute('data-wall', w.light > 0.55 ? 'light' : 'dark'); }
    else { root.style.removeProperty('--wall'); root.removeAttribute('data-wall'); }
  }
  window.addEventListener('focus', applyGlass); // шпалери могли змінитися, поки вікно було у фоні

  function go(id) {
    clearInterval(timer); timer = null; devRefresh = null;
    const s = SCREENS.find((x) => x.id === id) || SCREENS[0];
    try { sessionStorage.setItem('screen', s.id); } catch (_) {}
    page.innerHTML = `<div class="page-ico">${ico(s.icon, true)}</div>` + s.render();
    page.style.animation = 'none'; void page.offsetWidth; page.style.animation = '';
    document.querySelectorAll('.nav').forEach((n) => n.classList.toggle('active', n.dataset.go === s.id));
    const grp = GROUPS.find((g) => g[2].includes(s.id));
    if (grp && $(`[data-group="${grp[0]}"]`)?.classList.contains('closed')) toggleGroup(grp[0], true);
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
    const gr = e.target.closest('[data-group]'); if (gr) return toggleGroup(gr.dataset.group);
    const lg = e.target.closest('[data-lang]'); if (lg) return I18N.set(lg.dataset.lang);
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
    $('#copyNums').addEventListener('click', () => { const d = collect(); copy(`${I18N.t('Серійний номер')}: ${d.serial}\nIMEI: ${d.imei}`); });
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
        const d = diag.udid === i.udid ? diag.data : null;
        if (diag.udid !== i.udid && !diag.loading) setTimeout(() => loadDiag(i.udid), 0);
        info = `<div id="diagBox">${d ? renderDiag(d) : '<div class="card"><span class="spin"></span>Збираю діагностику iPhone…</div>'}</div>`;
        break; }
    }
    // Коли все гаразд, рядки підключення стискаються в одну зелену плашку.
    if (s.state === 'ready') {
      const many = s.count > 1 ? ` · знайдено пристроїв: ${s.count}, показано перший` : '';
      return `<div class="card banner ok"><span>✓ Драйвер Apple працює · iPhone підключено · довіру підтверджено${many}</span></div>${info}`;
    }
    return `<div class="card"><div class="ready">${['drv', 'dev', 'trust'].map((k) => row(...R[k])).join('')}</div><div class="row"><button class="btn secondary" id="devRefresh">Перевірити ще раз</button></div></div>${info}`;
  }

  // ---------- Діагностика ----------
  const diag = { udid: null, data: null, loading: false };
  async function loadDiag(udid, force) {
    if (diag.loading || (!force && diag.udid === udid)) return;
    diag.loading = true;
    let d = null;
    try { d = await window.api.deviceDiag(udid); } catch (_) {}
    diag.loading = false;
    diag.udid = udid; diag.data = d && d.ok ? d : { ok: false };
    const box = $('#diagBox');
    if (box) box.innerHTML = renderDiag(diag.data);
  }
  const SIM = {
    kCTSIMSupportSIMStatusReady: ['ok', 'Готова до роботи'],
    kCTSIMSupportSIMStatusNotInserted: ['na', 'SIM-картки немає'],
    kCTSIMSupportSIMStatusPINLocked: ['bad', 'Просить PIN'],
    kCTSIMSupportSIMStatusPUKLocked: ['bad', 'Просить PUK'],
    kCTSIMSupportSIMStatusOperatorLocked: ['bad', 'Заблоковано оператором'],
    kCTSIMSupportSIMStatusNotReady: ['na', 'Не готова'],
  };
  const gb = (b) => (b == null ? '—' : `${(b / 1e9).toFixed(b >= 1e11 ? 0 : 1)} ГБ`);
  function diagFacts(d) {
    const act = d.security.activation;
    const sim = SIM[d.sim.status] || (d.sim.status ? ['na', d.sim.status.replace(/^kCTSIMSupport(SIM)?(Status)?/, '')] : ['na', 'Невідомо']);
    const b = d.battery;
    const freePct = d.disk.total && d.disk.free != null ? Math.round((d.disk.free / (d.disk.data || d.disk.total)) * 100) : null;
    return {
      act: act === 'Activated' || act === 'FactoryActivated' ? ['ok', 'Активовано'] : act === 'Unactivated' ? ['bad', 'Не активовано'] : ['na', act || 'Невідомо'],
      pass: d.security.passcode === true ? ['ok', 'Увімкнено'] : d.security.passcode === false ? ['warn', 'Не задано'] : ['na', 'Невідомо'],
      find: d.security.findMy === true ? ['ok', 'Увімкнено'] : d.security.findMy === false ? ['na', 'Вимкнено'] : ['na', 'Не вдалося визначити'],
      sim,
      bat: b.health != null ? [b.health >= 80 ? 'ok' : 'bad', `${b.health}% ємності`] : b.level != null ? ['na', `Заряд ${b.level}%`] : ['na', 'Невідомо'],
      disk: freePct != null ? [freePct < 10 ? 'warn' : 'ok', `Вільно ${gb(d.disk.free)}`] : ['na', 'Невідомо'],
    };
  }
  // Поради: що з цим iPhone робити далі і в якому розділі.
  function diagAdvice(d, f) {
    const a = [];
    if (f.act[0] === 'bad') a.push(['bad', 'iPhone не активовано', 'Якщо під час налаштування він просить чужий Apple ID, це блокування активації.', 'activation', 'Блокування активації']);
    if (d.sim.status === 'kCTSIMSupportSIMStatusOperatorLocked') a.push(['bad', 'SIM-картку відхилено оператором', 'Схоже, iPhone прив’язаний до іншого оператора.', 'carrier', 'Прив’язка до оператора']);
    if (/PINLocked|PUKLocked/.test(d.sim.status)) a.push(['bad', 'SIM-картка заблокована', 'Потрібен PIN або PUK від оператора.', 'sim', 'PIN і PUK SIM-картки']);
    if (f.bat[0] === 'bad') a.push(['warn', 'Батарея зношена', 'Ємність нижче 80%: Apple радить заміну в авторизованому сервісі.', null, null, 'https://support.apple.com/iphone/repair', 'Ремонт Apple']);
    if (f.disk[0] === 'warn') a.push(['warn', 'Мало вільного місця', 'Менше 10% пам’яті. Оновлення iOS і резервні копії можуть не вдатися.']);
    if (d.security.findMy === true) a.push(['info', '«Знайти iPhone» увімкнено', 'Перед продажем чи скиданням вийдіть з Apple ID, інакше iPhone попросить ваш пароль.', 'buy', 'Купівля з рук']);
    if (d.security.passcode === true) a.push(['info', 'Код-пароль встановлено', 'Забули його? Є офіційні способи, деякі зберігають дані.', 'passcode', 'Забули код екрана']);
    if (!a.some((x) => x[0] === 'bad')) a.unshift(['ok', 'Блокувань не виявлено', 'iPhone активовано, SIM-картка не заблокована.']);
    return a;
  }
  function renderDiag(d) {
    if (!d || !d.ok) return `<div class="card warn"><h3>Не вдалося зібрати діагностику</h3><p>Розблокуйте iPhone і натисніть «Оновити діагностику».</p><div class="row"><button class="btn secondary" id="diagRefresh">Оновити діагностику</button></div></div>`;
    const f = diagFacts(d);
    const chip = (t, v) => `<div class="chip ${v[0]}"><span>${t}</span><b>${esc(v[1])}</b></div>`;
    const kvRows = (rows) => `<div class="kv">${rows.filter((x) => x[1] !== '' && x[1] != null).map((x) => `<div class="k">${x[0]}</div><div class="v"${x[2] ? ' translate="no"' : ''}>${esc(x[1])}</div><div>${x[2] ? `<button class="btn secondary small" data-copy="${esc(x[1])}">Копіювати</button>` : ''}</div>`).join('')}</div>`;
    const dv = d.device, b = d.battery, k = d.disk;
    const used = k.total && k.free != null ? Math.max(0, Math.min(100, 100 - Math.round((k.free / (k.data || k.total)) * 100))) : null;
    return `
      <div class="card"><h3>Діагностика</h3>
        <div class="chips">${chip('Активація', f.act)}${chip('Код-пароль', f.pass)}${chip('Знайти iPhone', f.find)}${chip('SIM-картка', f.sim)}${chip('Батарея', f.bat)}${chip('Пам’ять', f.disk)}</div>
        <p class="small" style="margin-top:12px">Прив’язку до оператора кабелем надійно не перевірити: дивіться «Налаштування → Основні → Про пристрій → Блокування оператора».</p></div>
      <div class="card"><h3>Що робити</h3><div class="advice">${diagAdvice(d, f).map((x) => `<div class="adv ${x[0]}"><i></i><div><b>${x[1]}</b><span>${x[2]}</span></div>${x[3] ? `<button class="btn secondary small" data-go="${x[3]}">${x[4]}</button>` : x[5] ? ext(x[5], x[6], 'btn secondary small') : ''}</div>`).join('')}</div></div>
      <div class="dgrid">
        <div class="card wide"><h3>Пристрій</h3>${kvRows([['Назва', dv.name], ['Модель', modelName(dv.model)], ['Номер моделі', dv.modelNumber], ['Колір корпусу', dv.color && /^#/.test(dv.color) ? dv.color : ''], ['iOS', dv.ios + (dv.build ? ` (${dv.build})` : '')], ['Серійний номер', dv.serial, 1], ['IMEI', dv.imei, 1], ['IMEI 2', dv.imei2, 1], ['Wi‑Fi', dv.wifi], ['Bluetooth', dv.bluetooth]])}</div>
        <div class="card"><h3>Батарея</h3>${kvRows([['Ємність', b.health != null ? `${b.health}%` : (b.readable ? '—' : 'Не вдалося прочитати')], ['Цикли заряду', b.cycles], ['Заряд зараз', b.level != null ? `${b.level}%${b.charging ? ', заряджається' : ''}` : ''], ['Заводська ємність', b.design ? `${b.design} мА·год` : ''], ['Повна ємність зараз', b.full ? `${b.full} мА·год` : ''], ['Температура', b.temp != null ? `${b.temp} °C` : '']])}
          ${b.health != null ? `<div class="meter"><i style="width:${b.health}%;background:${b.health >= 80 ? 'var(--ok)' : 'var(--danger)'}"></i></div>` : ''}</div>
        <div class="card"><h3>Пам’ять</h3>${kvRows([['Обсяг', gb(k.total)], ['Вільно', gb(k.free)]])}
          ${used != null ? `<div class="meter"><i style="width:${used}%"></i></div><p class="small" style="margin-top:6px">Зайнято ${used}%</p>` : ''}</div>
        <div class="card wide"><h3>Зв’язок</h3>${kvRows([['SIM-картка', f.sim[1]], ['Номер телефону', d.sim.phone || 'iOS не передає номер через кабель', d.sim.phone ? 1 : 0], ['ICCID', d.sim.iccid, 1], ['Модем', d.sim.baseband]])}</div>
      </div>
      <div class="row diag-actions"><button class="btn" id="diagCopy">Копіювати звіт</button><button class="btn secondary" id="diagRefresh">Оновити діагностику</button><button class="btn secondary" data-go="proof">Додати номери до доказів власності</button></div>`;
  }
  function diagReport(d) {
    const f = diagFacts(d), dv = d.device, b = d.battery, t = I18N.t;
    return [
      `${t('Звіт Reclaim')} · ${new Date().toLocaleString(I18N.locale)}`,
      `${t('Пристрій')}: ${dv.name} · ${modelName(dv.model)} · ${dv.modelNumber}`,
      `iOS: ${dv.ios} ${dv.build ? `(${dv.build})` : ''}`,
      `${t('Серійний номер')}: ${dv.serial}`, `IMEI: ${dv.imei}${dv.imei2 ? `, ${dv.imei2}` : ''}`,
      `${t('Активація')}: ${t(f.act[1])}`, `${t('Код-пароль')}: ${t(f.pass[1])}`, `${t('Знайти iPhone')}: ${t(f.find[1])}`, `${t('SIM-картка')}: ${t(f.sim[1])}`,
      `${t('Батарея')}: ${b.health != null ? b.health + '%' : '—'}, ${t('циклів')}: ${b.cycles ?? '—'}`,
      `${t('Пам’ять')}: ${gb(d.disk.total)}, ${t('вільно')} ${gb(d.disk.free)}`,
    ].join('\n');
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('#diagRefresh') && diag.udid) {
      const box = $('#diagBox'); if (box) box.innerHTML = '<div class="card"><span class="spin"></span>Збираю діагностику iPhone…</div>';
      loadDiag(diag.udid, true);
    }
    if (e.target.closest('#devRefresh') && devRefresh) devRefresh(true);
    if (e.target.closest('#diagCopy') && diag.data && diag.data.ok) copy(diagReport(diag.data));
  });

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
      if (s.state === 'ready') renderHistory(); // щойно прочитаний iPhone потрапив в історію
    }
    devRefresh = refresh;
    renderHistory();
    refresh(true);
    timer = setInterval(() => refresh(false), 3000);
  }

  // ---------- Про застосунок ----------
  async function initAbout() {
    const info = await window.api.appInfo();
    const d = await window.api.driverStatus();
    if (!$('#abVer')) return;
    $('#abVer').textContent = ver(info.version) + (info.packaged ? '' : ' (запуск із папки)');
    $('#abTools').textContent = info.tools ? 'Знайдено (libimobiledevice)' : 'Не знайдено';
    $('#abDrv').textContent = !d.installed ? 'Не встановлено' : d.running ? 'Працює' : 'Службу зупинено';
    renderUpdate();
    const log = await window.api.changelog();
    if ($('#abLog')) {
      $('#abLog').innerHTML = log.length
        ? log.map((v) => `<h4 style="margin:12px 0 4px;color:var(--text)">${I18N.t('Версія')} ${esc(ver(v.version))}${ver(v.version) === ver(info.version) ? ` (${I18N.t('поточна')})` : ''}</h4><ul class="plain">${v.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')
        : 'Журнал змін недоступний.';
    }
    $('#uninstall').addEventListener('click', async () => {
      const r = await window.api.uninstall();
      if (r.mode === 'settings') toast('Відкрито «Встановлені програми» Windows: оберіть Reclaim');
      else if (r.mode === 'folder') toast('Застосунок запущено з папки: щоб видалити, просто видаліть цю папку');
    });
  }

  // ---------- Перевірка оновлень ----------
  let updState = null;
  async function checkUpdate() {
    try { updState = await window.api.checkUpdate(); } catch (_) { updState = { ok: false }; }
    renderUpdate();
    return updState;
  }
  function renderUpdate() {
    const u = updState;
    const home = $('#updBox');
    if (home) {
      home.innerHTML = u && u.ok && u.newer
        ? `<div class="card banner"><div><b>Вийшла нова версія ${esc(ver(u.latest))}</b><br><span class="small">У вас ${esc(ver(u.current))}. Відкриється сторінка завантаження, нічого не встановиться саме.</span></div>
           <div class="row" style="margin:0"><button class="btn" data-release="1">Оновити до ${esc(ver(u.latest))}</button></div></div>` : '';
    }
    const ab = $('#abUpd');
    if (ab) {
      ab.textContent = !u ? 'Перевіряю…'
        : !u.ok ? 'Не вдалося перевірити (немає інтернету або GitHub не відповів).'
        : u.newer ? `Доступна версія ${ver(u.latest)}. У вас ${ver(u.current)}.`
        : u.latest ? `У вас остання версія (${ver(u.current)}).`
        : 'Опублікованих версій ще немає.';
      const row = $('#abUpdRow');
      if (row) row.innerHTML = (u && u.ok && u.newer ? `<button class="btn" data-release="1">Оновити до ${esc(ver(u.latest))}</button>` : '')
        + '<button class="btn secondary" id="abCheck">Шукати оновлення</button>';
      const c = $('#abCheck');
      if (c) c.addEventListener('click', async () => {
        c.disabled = true; await checkUpdate();
        const s = updState;
        if (s && s.ok && !s.newer) toast('У вас остання версія'); else if (s && !s.ok) toast('Не вдалося перевірити оновлення');
      });
    }
  }

  // ---------- Історія підключених iPhone ----------
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(I18N.locale); } catch (_) { return ''; } };
  let histCache = [];
  async function renderHistory() {
    const box = $('#histBox');
    if (!box) return;
    histCache = await window.api.historyList();
    if (!$('#histBox')) return;
    if (!histCache.length) {
      box.innerHTML = `<div class="card"><h3>Історія iPhone</h3><p class="small">Тут з’являться iPhone, які ви підключали. Список зберігається лише на цьому комп’ютері й нікуди не надсилається.</p></div>`;
      return;
    }
    box.innerHTML = `<div class="card"><h3>Історія iPhone</h3>
      <p class="small">Зберігається лише на цьому комп’ютері й нікуди не надсилається.</p>
      ${histCache.map((h, i) => `<div class="kv hist-item">
        <div class="k">Пристрій</div><div class="v">${esc(h.name || 'iPhone')} · ${esc(modelName(h.model))}</div><div></div>
        <div class="k">Серійний номер</div><div class="v">${esc(h.serial || '—')}</div><div>${h.serial ? `<button class="btn secondary small" data-copy="${esc(h.serial)}">Копіювати</button>` : ''}</div>
        <div class="k">IMEI</div><div class="v">${esc(h.imei || '—')}</div><div>${h.imei ? `<button class="btn secondary small" data-copy="${esc(h.imei)}">Копіювати</button>` : ''}</div>
        <div class="k">Востаннє підключено</div><div class="v">${esc(fmtDate(h.lastSeen))}</div><div><button class="btn secondary small" data-hist-proof="${i}">Додати до доказів власності</button></div>
      </div>`).join('')}
      <div class="row"><button class="btn danger" id="histClear">Очистити історію…</button></div></div>`;
    $('#histClear').addEventListener('click', async () => {
      const r = await window.api.historyClear();
      if (r && r.ok) { toast('Історію очищено'); renderHistory(); }
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-release]')) return window.api.openRelease();
    const hp = e.target.closest('[data-hist-proof]');
    if (hp) {
      const h = histCache[+hp.dataset.histProof]; if (!h) return;
      const cur = store.get();
      store.set({ done: cur.done || {}, serial: h.serial || '', imei: h.imei || '' });
      toast('Номери додано до доказів власності');
      go('proof');
    }
  });

  if (window.api.setLang) window.api.setLang(I18N.lang); // діалоги й PDF тією ж мовою
  buildSidebar();
  applyGlass();
  let start = 'home';
  try { start = sessionStorage.getItem('screen') || 'home'; } catch (_) {}
  go(start);
  checkUpdate();
  setInterval(checkUpdate, 60 * 60 * 1000); // далі раз на годину
})();
