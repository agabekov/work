# Дизайн-система · daniyar.work

Справочник по визуальному языку сайта. Цель — чтобы новые (внутренние) страницы
выглядели и вели себя как существующие: единые токены, типографика, компоненты,
доступность.

> Правило №1: **не хардкодь значения** (цвета, отступы, размеры). Используй
> CSS-переменные и классы из `styles.css`. Если чего-то не хватает — добавь токен,
> а не «магическое число».

---

## 1. Философия

- **Минимализм / «электронные чернила» (e-ink).** Бумага и тушь, минимум декора,
  максимум воздуха. Контент (текст) — главный герой.
- **Моноширинный во всём.** JetBrains Mono задаёт характер «пишущего человека,
  точного и немного технаря».
- **Две темы:** светлая **Usuki** (薄, бумага) и тёмная **Sumi** (墨, тушь).
- **Один акцент — фиолетовый.** Им заданы и ссылки, и маркер `.highlight`.
  Других цветов нет; оттенок фиолета подбирается под тему ради контраста
  (на светлой — глубокий, на тёмной — светлый).
- **Прогрессивное улучшение.** Контент виден без JS; JS только добавляет анимацию.

---

## 2. Быстрый старт: скелет новой страницы

Скопируй этот `<head>` (он даёт тему без вспышки, шрифты, иконки, мета):

```html
<!DOCTYPE html>
<html lang="ru" class="no-js">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Тема решается ДО первой отрисовки: без вспышки светлой темы у тёмных юзеров -->
    <script>
    (function () {
        var d = document.documentElement;
        d.classList.remove('no-js');
        d.classList.add('js');
        d.classList.add('no-transitions');
        try {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || (t === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                d.classList.add('dark-theme');
            }
        } catch (e) {}
    })();
    </script>

    <title>Заголовок страницы — Данияр Агабеков</title>
    <meta name="description" content="…">
    <link rel="canonical" href="https://work.daniyar.link/…">
    <meta name="theme-color" content="#F0F0E8" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1A1A1A" media="(prefers-color-scheme: dark)">

    <!-- Иконки -->
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- Шрифты (self-hosted) -->
    <link rel="preload" href="/public/fonts/jetbrains-mono-latin-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/public/fonts/jetbrains-mono-cyrillic-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="header-controls">
        <button class="theme-toggle" type="button" aria-pressed="false">Ночью</button>
    </div>

    <main class="container">
        <!-- контент в секциях, см. §6 -->
    </main>

    <footer>
        <div class="container">…</div>
    </footer>

    <script src="script.js" defer></script>
</body>
</html>
```

`script.js` обязателен: он управляет переключателем темы, снимает `no-transitions`
после загрузки, делает плавное появление секций и уважает `prefers-reduced-motion`.

Базовая структура контента:

```html
<main class="container">
    <header>…</header>                          <!-- шапка, см. §6.1 -->
    <section class="typed-section">             <!-- .typed-section = плавное появление -->
        <h2>Заголовок раздела</h2>
        <div class="content"> … </div>
    </section>
</main>
```

> `.typed-section` включает анимацию появления при скролле. Внутри обязательно
> `<div class="content">` — именно он проявляется. Без JS / при reduce-motion всё
> видно сразу.

---

## 3. Цветовые токены

Один набор имён, переопределяется под `.dark-theme`. **Всегда** ссылайся на токен,
никогда — на хекс напрямую.

| Токен | Usuki (светлая) | Sumi (тёмная) | Назначение |
|---|---|---|---|
| `--color-text` | `#000` | `#E5E5DF` | Основной текст |
| `--color-background` | `#F0F0E8` | `#1A1A1A` | Фон страницы |
| `--color-link` | `#5B3FC0` | `#A78BFA` | Ссылки (фиолет, тон под тему) |
| `--color-link-hover` | `#4F35A8` | `#9C82E8` | Ссылки при наведении |
| `--color-border` | `rgba(0,0,0,.1)` | `rgba(229,229,223,.1)` | Разделители, рамки |
| `--color-muted` | `rgba(0,0,0,.55)` | `rgba(229,229,223,.6)` | Второстепенный текст (даты, подписи) |
| `--highlight-color` | `rgba(167,139,250,.4)` | `rgba(167,139,250,.4)` | Маркер `.highlight` |

```css
/* пример: всё тянется через токены и само адаптируется к теме */
.my-card {
    color: var(--color-text);
    border: 1px solid var(--color-border);
    background: var(--color-background);
}
```

Также объявлен `color-scheme: light` / `dark` — нативные элементы (скроллбары,
форм-контролы) подстраиваются под тему автоматически.

---

## 4. Отступы (spacing scale)

Единая шкала. Бери из неё, не вводи произвольные rem.

| Токен | Значение |
|---|---|
| `--space-1` | `0.5rem` |
| `--space-2` | `1rem` |
| `--space-3` | `1.5rem` |
| `--space-4` | `2rem` |
| `--space-6` | `3rem` |

Правило «воздуха» (три уровня):
- внутри элемента (заголовок → текст): `--space-1`
- между связанными элементами: `--space-3`
- между крупными блоками/секциями: `--space-6`

---

## 5. Типографика

- **Шрифт:** `--font-main` = `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
  Self-hosted (`/public/fonts/`): начертания **400**, **700**, **400 italic**;
  подмножества latin/latin-ext/cyrillic/cyrillic-ext. Только эти веса — не используй
  500/600 (будет синтетический «псевдо-жир», мажет в моно).
- **Базовый текст:** 16px, `line-height: 1.6`.
- **Шкала заголовков (плавная, `clamp()`):**

| Элемент | Размер | Трекинг | Вес |
|---|---|---|---|
| `h1` | `clamp(1.75rem, 1.4rem + 1.6vw, 2rem)` | `-0.02em` | 700 |
| `h2` | `clamp(1.5rem, 1.3rem + 1vw, 1.75rem)` | `-0.015em` | 700 |
| `h3` | `1.25rem` | — | 700 |
| `.position` | `1.1rem` | — | 700 |
| `.company-name` | `0.95rem` | — | 400, `--color-muted` |
| `.work-section-title` | `0.85rem` UPPERCASE | `0.08em` | 700, `--color-muted` |

> Крупные моно-заголовки требуют **отрицательного** трекинга (заданного выше).
> Мелкие капс-метки — **положительного** (`0.08em`), иначе кириллица слипается.

- **`h2` несёт мини-разделитель:** `h2::after` рисует короткую черту 2rem шириной
  (`currentColor`, opacity .4). Так начинаются все разделы.
- **Перенос строк:** `text-wrap: balance` на заголовках, `text-wrap: pretty` на `<p>`
  (убирает «висячие» слова). `hanging-punctuation: first last` на `html`.

### Текстовые конвенции (важно для копирайтера-владельца)
- **Неразрывные пробелы:** после коротких предлогов/союзов и вокруг тире — `&nbsp;`
  (по Ильяхову). Пример: `с&nbsp;заботой`, `2025&nbsp;— Сейчас`.
- **Кавычки** — ёлочки «…», тире — длинное «—».

---

## 6. Компоненты

Все компоненты используют только токены и существующие классы.

### 6.1. Шапка (hero)
```html
<header>
    <div class="header-content">
        <div class="profile-image-container">
            <img src="daniyar-avatar.jpg" alt="Портрет: Данияр Агабеков"
                 class="profile-image" width="100" height="100"
                 decoding="async" fetchpriority="high">
        </div>
        <hgroup class="header-text">
            <h1 id="name">Данияр Агабеков</h1>
            <p id="title">Подзаголовок…</p>
        </hgroup>
    </div>
</header>
```
- Аватар: круг 100×100. Всегда указывай `width`/`height` (нет сдвига макета).
  Файл `daniyar-avatar.jpg` — 200px (2× для retina); большой `daniyar.jpg` (800px) —
  только для og-картинки соцсетей.
- `#name` и `#title` плавно проявляются через `script.js`.

### 6.2. Раздел
```html
<section class="typed-section">
    <h2>Заголовок</h2>
    <div class="content">
        <p>Текст. Меру чтения не ограничиваем — блок на всю ширину колонки.</p>
    </div>
</section>
```

### 6.3. Услуги / карточки
```html
<div class="service">
    <h3>Название</h3>
    <p>Описание.</p>
</div>
```

### 6.4. Опыт работы

Обычная запись (одна роль = одна компания):
```html
<div class="work-entry">
    <div class="work-header">
        <div class="work-period">Месяц 2021&nbsp;— Месяц 2023</div>
        <div class="company-name">Компания</div>
    </div>
    <h4 class="position">Должность</h4>
</div>
```

Повышение (несколько ролей в одной компании) — оборачивай роли в `.work-role`
внутри **одного** `.work-entry`. Тогда разделительная линия остаётся только
после всей группы, а между ролями линии нет:
```html
<div class="work-entry">
    <div class="work-role">
        <div class="work-header">
            <div class="work-period">Новейшая&nbsp;— Сейчас</div>
            <div class="company-name">Компания</div>   <!-- компания только у верхней роли -->
        </div>
        <h4 class="position">Новая должность</h4>
    </div>
    <div class="work-role">
        <div class="work-header">
            <div class="work-period">Раньше&nbsp;— Раньше</div>   <!-- компанию не повторяем -->
        </div>
        <h4 class="position">Прежняя должность</h4>
    </div>
</div>
```
Правила раздела «Опыт»:
- Порядок — **обратный хронологический** (новейшее сверху), и между компаниями,
  и между ролями внутри повышения.
- Иерархия заголовков: группа (`В штате`/`Проектно`) = `h3.work-section-title`,
  должность = `h4.position` (не нарушай порядок уровней).
- Главная строка визуально — **должность** (жирная); компания и даты приглушены
  (`--color-muted`).

### 6.5. Сетки (клиенты, образование)
```html
<div class="client-grid">      <!-- 1 → 2 → 3 колонки (576px, 768px) -->
    <div class="client-item">Имя</div>
</div>

<div class="education-grid">   <!-- 1 → 2 колонки (576px) -->
    <div class="education-item">2025. Курс | Школа</div>
</div>
```
Это CSS-grid: колонки ровные, последний нечётный элемент не растягивается.

### 6.6. Ссылки и highlight
```html
<a href="…">Ссылка</a>                              <!-- подчёркивание со смещением 3px -->
<a href="…" target="_blank" rel="noopener">Внешняя</a>  <!-- всегда rel="noopener" -->
<span class="highlight">важная мысль</span>          <!-- фиолетовый маркер, переносится по строкам -->
```

### 6.7. Футер
```html
<footer>
    <div class="container">
        <div class="footer-links">
            <a href="…" target="_blank" rel="noopener">LinkedIn</a>
        </div>
        <p>&copy; 2026 Данияр Агабеков</p>
    </div>
</footer>
```
Сверху футера — тонкая линия (`--color-border`) как «закрытие» страницы.

### 6.8. Переключатель темы
Фиксирован вверху-справа, всегда доступен. Кнопка показывает действие
(«Ночью» в светлой теме / «Днём» в тёмной); `script.js` сам ставит текст и
`aria-pressed`. Просто включи разметку из §2 и подключи `script.js`.

---

## 7. Сетка и адаптив

- **Колонка:** `.container`, `max-width: 800px`, по центру, паддинги из токенов.
  Все блоки — на всю ширину колонки (единый правый край).
- **Брейкпоинты:**
  - `min-width: 576px` — 2 колонки в сетках
  - `min-width: 768px` — 3 колонки у клиентов
  - `max-width: 767.98px` — мобильная раскладка (паддинги меньше, `work-header`
    в столбик). Граница 767.98 не пересекается с 768 (без «шва» на ровно 768px).

---

## 8. Движение

- Секции `.typed-section` плавно появляются при скролле (`IntersectionObserver`,
  fade + сдвиг 20px). Показанная секция перестаёт отслеживаться.
- Заголовок (имя/подзаголовок) проявляется на следующем кадре после загрузки.
- **`prefers-reduced-motion: reduce`** — вся анимация отключается, контент виден
  сразу. Любую новую анимацию заводи под этот же media-query.
- `no-transitions` на `<html>` гасит переходы на первой отрисовке (чтобы тема не
  «переливалась» при загрузке); `script.js` снимает класс после первого кадра.

---

## 9. Доступность (чеклист для каждой страницы)

- [ ] Основной контент в `<main>`; есть `<header>` / `<footer>`.
- [ ] Порядок заголовков не прыгает через уровень (h1 → h2 → h3 → h4).
- [ ] У интерактивных элементов виден фокус (`:focus-visible` — есть глобально,
      не убирай `outline` без замены).
- [ ] Картинки: осмысленный `alt` (или `alt=""` для декоративных), `width`/`height`.
- [ ] Внешние ссылки: `rel="noopener"`; у `mailto:` — без `target="_blank"`.
- [ ] Кнопки-тумблеры: видимый текст = доступное имя (без перекрывающего
      `aria-label`), состояние через `aria-pressed`.
- [ ] Контраст текста ≥ 4.5:1 (текущая палитра проходит AA/AAA — не уводи цвета
      в более бледные).
- [ ] Анимации отключаются при `prefers-reduced-motion`.

---

## 10. Иконки / фавиконы

- `icon.svg` — основной значок: монограмма «Д», **прозрачный фон**, цвет буквы
  адаптируется к теме ОС (`prefers-color-scheme`). Прозрачный фон = значок чисто
  лежит во вкладке при любой теме браузера.
- `favicon.ico` — 32+16, запасной для старых браузеров (светлый квадрат с «Д»).
- `apple-touch-icon.png` — 180×180, **непрозрачный**, с фоном и отступом (требование iOS).
- Разметка — ровно 3 строки (см. §2). `sizes="32x32"` у `.ico` обязателен (иначе
  Chrome берёт `.ico` вместо SVG).
- Важно: фавикон следует за темой **ОС**, а не за кнопкой на сайте — это
  ограничение платформы, иначе никак.

---

## 11. Структура файлов

```
index.html              — главная
styles.css              — все стили + @font-face (источник правды дизайн-системы)
script.js               — тема, появление секций, reduced-motion
icon.svg                — адаптивный фавикон-монограмма
favicon.ico             — фавикон для старых браузеров
apple-touch-icon.png    — иконка для iOS
daniyar.jpg             — 800×800, только для og-картинки соцсетей
daniyar-avatar.jpg      — 200×200, аватар в шапке
public/fonts/           — JetBrains Mono woff2 (latin/cyrillic, 400/700/400i)
public/                 — фавиконы для разных платформ (png)
CNAME                   — домен GitHub Pages (work.daniyar.link)
DESIGN.md               — этот файл
```

---

## 12. Кратко: что делать и чего не делать

**Делай:**
- тяни цвета/отступы из токенов;
- оборачивай контент в `.typed-section` + `.content`;
- веса шрифта только 400 и 700;
- неразрывные пробелы по тексту;
- проверяй чеклист доступности (§9).

**Не делай:**
- не вводи новые цвета (палитра — две темы + один фиолетовый акцент: ссылки и highlight);
- не используй `font-weight: 500/600` (псевдо-жир);
- не ставь произвольные `rem` вместо шкалы отступов;
- не убирай фон/линии так, чтобы блок «выпадал» из единой ширины колонки;
- не привязывай фавикон к внутристраничному тумблеру (невозможно).
