# Reclaim

Чесний помічник для власника iPhone, який забув пароль або Apple ID. Windows-застосунок (Electron) у стилі Apple.

**Застосунок не обходить блокування активації і не знімає Apple ID без пароля власника.** Усі кроки ведуть до офіційних інструментів Apple.

- Сайт: `https://dimonchikk.github.io/Reclaim/` (публікується з папки `site`)
- Завантаження: [останній реліз](../../releases/latest)

## Що вміє
Відновлення Apple ID · Блокування активації · Докази власності (PDF-пакет) · Мій iPhone (модель, iOS, серійний номер, IMEI) · Скидання через режим відновлення · Вихід із режиму відновлення · Screen Time · Теми: системна, світла, темна.

## Запуск з вихідного коду
```
npm install
npm start
```
Або двічі клацніть `run.bat` на Windows. Потрібен Node.js.

## Збірка встановлювача
```
npm run dist
```
Готовий NSIS-інсталятор з'явиться в `dist/`.

## Потрібно для роботи з iPhone
Windows і драйвер Apple (служба Apple Mobile Device Service) з застосунку Apple Devices (Microsoft Store) або iTunes. Застосунок перевіряє це сам і лише пропонує відкрити офіційне встановлення, нічого не завантажуючи приховано. Утиліти libimobiledevice вбудовані в `bin/`; походження й ліцензії: [`bin/NOTICE.txt`](bin/NOTICE.txt).

## Сайт (GitHub Pages)
Папка `site/` — чистий HTML, CSS і JS без збірки. Репозиторій, назва файлу інсталятора й версія задаються в одному місці: `site/config.js`. На GitHub Pages репозиторій визначається з адреси автоматично, а кнопка «Завантажити» веде прямо на `releases/latest/download/Reclaim-setup.exe`; номер версії сайт бере з останнього релізу. Знімки застосунку лежать у `site/screenshots/` (світлі й `-dark`).

Увімкнення: **Settings → Pages → Source: GitHub Actions**. Далі сайт публікує `.github/workflows/pages.yml` після кожного пушу в `main`, що змінює `site/`.

## Випуск
```
git tag v0.2.0
git push origin v0.2.0
```
Workflow `.github/workflows/release.yml` збере інсталятор на Windows і додасть його до релізу за цим тегом. Номер у теґу має збігатися з `version` у `package.json`.

## Структура
```
main.js, preload.js   головний процес і міст
src/                  інтерфейс застосунку
bin/                  вбудовані утиліти libimobiledevice + NOTICE.txt
site/                 лендинг для GitHub Pages
.github/workflows/    pages.yml, release.yml
```

## Ліцензії
Вбудовані утиліти мають власні ліцензії (LGPL-2.1+/GPL, OpenSSL: Apache-2.0), див. `bin/NOTICE.txt`. Apple, iPhone, iTunes та Apple ID є торговими марками Apple Inc.; проєкт з Apple не пов'язаний.
