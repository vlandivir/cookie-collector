# ПЛАН

## Распределить куки по категориям 

Главное на что обращаем внимание это поле `url_pattern`. По нему происходит блокировка скриптов. Поэтому надо постараться сделать так чтобы куки с одним `url_pattern` были в одной категории.

**!!NB** Категория которая у нас называется `Marketing cookies` в cookie_consent отмечена, как `advertisement`

Используем такие правила.
1. Если кука добавлена автоматически CookieYes (это можно понять из интерфейса), то мы не обращаем внимание в какой она категории. (Считаем что CookieYes магическим способом работает)
2. Мы договорились, что используем не 6 категорий, а только 4 (не используем Performance и Uncategorized)
3. Стараемся чтобы все одинаковые url_pattern попали в одну категорию.
4. Всё что попало в категорию Necessary можно не смотреть.

Ниже список доменов у разных куки (за исключением категории Necessary)

В идеале у каждого домена должна быть или одна категория, или 2 но в этом случае это должно быть результатом автоматического распределения.

**Кажется, что сейчас всё поделено верно. Если будут появляться новые куки, которые не распределятся автоматически, то надо ориентироваться на известные домены, чтобы правильно определить категорию**

При тестировании отключения особенное внимание надо уделить тем доменам у которых больше одной категории (может быть что-то придётся перенести)

```
'bing.com': ['Marketing cookies', 'Analytics cookies'],
'clarity.ms': ['Analytics cookies'],
'doubleclick.net': ['Marketing cookies'],
'facebook.net': ['Analytics cookies'],
'google-analytics.com|googletagmanager.com/gtag/js': ['Analytics cookies'],
'google.com': ['Analytics cookies', 'Marketing cookies'],
'googletagmanager.com': ['Analytics cookies'],
'hubspot.com': ['Analytics cookies'],
'js.hs-analytics.net': ['Analytics cookies'],
'reddit.com': ['Marketing cookies']
'rudderlabs.com': ['Marketing cookies'],
'tiktok.com|analytics.tiktok.com/i18n/pixel/config.js': ['Marketing cookies'],
'tildacdn.com/js/tilda-stat-1.0.min.js': ['Analytics cookies'],
'tomi.ai': ['Analytics cookies'],
'typeform.com': ['Analytics cookies'],
'woopra.com': ['Analytics cookies'],
'youtube.com': ['Marketing cookies', 'Functional cookies'],
```

### Вопросы

Надо расперделить куки
 `marketing_uid, marketing_updater, marketing_source, marketing_created` – здесь надо сделать микро задачу в нашей лямбде, чтобы эти куки устанавливались только в том случае, если в куке консенте установлено `advertisement:yes` т.к. это серверная кука, то в `url_pattern` надо что-то странное писать, чтобы блокирования скрипта на самом деле не происходило.

`c_c` – вот эту тоже как-то надо описать и распределить в нужную категорию. У нас есть какое-то обращение к `carbon.now.sh` но я не понимаю, каким скриптом она дол

`consentid:ckxHUVptSXdJZ1lhTEFEcWZhRU8ycXdjSXFRVXFxdWI,consent:yes,action:yes,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes,other:yes`

## Проверить на se-light

В этом же репозитории есть скрипт `index.ts`, на примере которого можно написать несколько тестов, которые отключают определённую категорию куки (для этого до загрузки страницы надо записать `cookieyes-consent`) и проверяют, что они не выставляются. 

*Может быть для запуска достаточно руками проверить, пока не понял, как быстрее это сделать*

## Проверка на проде 

В общем-то тоже, что и в прошлом пункте, но уже с обходом большего количества страниц. Сейчас в `index.ts` собран минимальный список страниц для того чтобы собрать все куки. 

К сожалению я так и не придумал, как получить куки от google.com или youtube.com – это ещё предстоит придумать в будущем. Но для первога запуска это не нужно.