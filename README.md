<div align="center">

<img src="icon.png" width="128" alt="Іконка Reclaim">

# Reclaim

**Забув пароль від iPhone або Apple ID? Поверни доступ чесним шляхом.**<br>
Windows-застосунок у стилі Apple, який крок за кроком веде власника iPhone<br>
до офіційних інструментів Apple. Без обходів блокувань і прихованих завантажень.

[![Build](https://img.shields.io/github/actions/workflow/status/Dimonchikk/Reclaim/release.yml?label=Build&logo=github)](../../actions/workflows/release.yml)
[![Release](https://img.shields.io/github/v/release/Dimonchikk/Reclaim?label=Release&color=8b5cf6)](../../releases/latest)
![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)
![Мова](https://img.shields.io/badge/мова-українська-FFD500)

### [⬇️ Завантажити останній реліз](../../releases/latest/download/Reclaim-setup.exe) · [Можливості](#що-вміє) · [Запуск](#запуск-з-вихідного-коду) · [Збірка](#збірка-встановлювача) · [Сайт](https://dimonchikk.github.io/Reclaim/)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Dimonchikk/Reclaim/main/screenshots/home-dark.png">
  <img src="screenshots/home.png" width="760" alt="Головний екран Reclaim">
</picture>

</div>

---

> [!IMPORTANT]
> **Reclaim не обходить блокування активації і не знімає Apple ID без пароля власника.** Усі кроки ведуть до офіційних інструментів Apple.

## Що вміє

| | |
|---|---|
| 🔑 **Відновлення Apple ID** | забули пароль чи пошту: покроково через офіційне відновлення Apple |
| 🔒 **Блокування активації** | iPhone просить чужий Apple ID: що робити і як звернутися в Apple |
| 📄 **Докази власності** | чек, серійний номер та IMEI в одному PDF для підтримки Apple |
| 📱 **Мій iPhone** | модель, версія iOS, серійний номер, IMEI |
| ♻️ **Скидання через режим відновлення** | для власного пристрою, коли забуто код-пароль |
| 🚪 **Вихід із режиму відновлення** | якщо iPhone «завис» на екрані з кабелем |
| ⏳ **Screen Time** | що робити, якщо забуто код «Екранного часу» |
| 🌗 **Теми** | системна, світла й темна |

<details>
<summary><b>📸 Більше знімків екрана</b></summary>
<br>
<div align="center">

| | |
|:---:|:---:|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Dimonchikk/Reclaim/main/screenshots/device-dark.png"><img src="screenshots/device.png" width="380" alt="Мій iPhone"></picture><br>Мій iPhone | <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Dimonchikk/Reclaim/main/screenshots/activation-dark.png"><img src="screenshots/activation.png" width="380" alt="Блокування активації"></picture><br>Блокування активації |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Dimonchikk/Reclaim/main/screenshots/proof-dark.png"><img src="screenshots/proof.png" width="380" alt="Докази власності"></picture><br>Докази власності | <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Dimonchikk/Reclaim/main/screenshots/reset-dark.png"><img src="screenshots/reset.png" width="380" alt="Скидання"></picture><br>Скидання |

</div>
</details>

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
Сайт лежить у корені репозиторію: `index.html`, `script.js`, `config.js`, `icon.png` і папка `screenshots/` (світлі знімки та `-dark`). Це чистий HTML, CSS і JS без збірки. Репозиторій, назва файлу інсталятора й версія задаються в одному місці: `config.js`. На GitHub Pages репозиторій визначається з адреси автоматично, а кнопка «Завантажити» веде прямо на `releases/latest/download/Reclaim-setup.exe`; номер версії сайт бере з останнього релізу. Файл `.nojekyll` вимикає обробку Jekyll.

Налаштування: **Settings → Pages → Source: Deploy from a branch → main / (root)**. Сайт оновлюється після кожного пушу в `main`. Сайт не потрапляє в інсталятор: у збірку входять лише файли зі списку `build.files` у `package.json`.

## Випуск
1. Підніміть `version` у `package.json` (і `config.js`) та допишіть розділ `## номер` у `CHANGES.md`.
2. Запуште в `main`.
3. На GitHub: **Actions → Збирання → Run workflow**, у полі «Версія» впишіть номер, наприклад `0.3.1`.
4. Workflow збере інсталятор на Windows і створить **чернетку** релізу з описом із `CHANGES.md`. Перевірте файл і натисніть **Publish release**: після цього кнопка на сайті й перевірка оновлень у застосунку побачать нову версію.

Порожнє поле «Версія» робить лише пробне збирання (файл у Artifacts).

## Мережа й дані
Єдиний мережевий запит застосунку: раз на годину (і за кнопкою «Шукати оновлення») він питає GitHub API про номер останнього релізу. Нічого не завантажується й не встановлюється без дії користувача. Історія підключених iPhone зберігається лише в папці даних застосунку на комп'ютері й нікуди не надсилається; її можна очистити в «Мій iPhone».

## Структура
```
main.js, preload.js   головний процес і міст
CHANGES.md            журнал змін (розділ «## номер» стає описом релізу)
build/                іконка застосунку та інсталятора
src/                  інтерфейс застосунку
bin/                  вбудовані утиліти libimobiledevice + NOTICE.txt
index.html, script.js, config.js, icon.png, screenshots/   сайт (GitHub Pages)
.github/workflows/    release.yml (збирання інсталятора)
```

## Ліцензії
Вбудовані утиліти мають власні ліцензії (LGPL-2.1+/GPL, OpenSSL: Apache-2.0), див. `bin/NOTICE.txt`. Apple, iPhone, iTunes та Apple ID є торговими марками Apple Inc.; проєкт з Apple не пов'язаний.
