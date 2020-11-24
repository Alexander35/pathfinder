# Как развернуть проект
На тестовом хосте был использован Debian 10 и рекомендуется использовать его.
Здесь не используется ни docker ни ansible ни что-либо другое для деплоя и контейнерезации для упращения и чтобы видеть всю картину сразу на машине.

### 1. Установка postgresql

Установливаем
``` sudo apt-get install postgresql ```

Создаём пользователя  pathfinder и БД pathfinder
``` sudo su postgres ```
``` psql ```
``` CREATE USER pathfinder; ```
``` ALTER USER pathfinder PASSWORD 'pathfinder'; ```
``` CREATE DATABASE pathfinder; ```
``` GRANT ALL ON DATABASE pathfinder TO pathfinder; ```

Перезапускаем postgresql
``` sudo systemctl restart postgresql ```

### 2. Установка RabbitMQ

``` https://github.com/rabbitmq/rabbitmq-server/releases/download/v3.8.9/rabbitmq-server_3.8.9-1_all.deb ```

``` sudo dpkg -i rabbitmq-server_3.8.9-1_all.deb ```
``` sudo rabbitmq-plugins enable rabbitmq_management ```
``` sudo systemctl restart rabbitmq-server ```

``` http://localhost:15672/ ```

### 3. Виртуальное окружение и conda

При проектировании была использована conda для
виртуального окружения

``` https://docs.conda.io/en/latest/miniconda.html#linux-installers ```

создаём окружение 
``` conda create -n pathfinder ```

переходим в окружение 
``` conda activate pathfinder ```

### 4. Зависимости проекта

``` pip install -r requirements.txt ```

### 5. Миграция, пользователи и начальные данные

``` python manage.py makemigrations ```
``` python manage.py migrate ```

``` python manage.py createfirstusers ```
``` python manage.py createpoints ```

В результате этих действий будут созданы пользователи
```admin``` с паролем ```admin```
```user1 ,user2, user3, user4```
с паролем ```user12345```

А также точки

### 6. Запуск

Также не используем http серверов. Обойдёмся для примера отладочным
``` python manage.py runserver 8000 ```

### 7. Запуск сервиса генерации маршрута
``` python route_creator/route_creator.py ```

### 8. Генерация маршрута из консоли

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"Owner":"admin", "Start_Point_Name": "02440eaa-00ae-4504-8108-d5169f285464", "End_Point_Name": "038f80b5-f39e-4d39-9606-ec556f159fa2"}' \
  http://localhost:8000/route/
```

Имена точек можно посмотреть в django admin
``` http://localhost:8000/admin ```

### 9. Запуск фронтенда

``` cd pathfinder_frontend ```
``` npm start ```

``` http://localhost:3000 ```

Фронтенд выполнен на ReactJS.
У Фронтенда есть аутентификация и форма добавления маршрута кнопки

Name  имя уникальное. и при совпадении имён ен будет сгенерирован маршрут (обработки события нет, поэтому просто, не создавайте пожалуйста, с одинаковыми именами.)
Start point список точек
End point список точек
Add route кнопка добавления

Кнопка Show report показывает отчёт по маршрутам

### 10. Замечания

- В этом проекте использованы python3, djangoREST, rabbitMQ, ReactJS, PostgreSQL
- Каждая точка входит в кластер точек, чтобы немного проще находить маршрут
С маршрутом возникли некоторые трудности. Их не стал шибко решать. Потому как маршрут строится.
Схема построения маршрута такая:
Маршрут строится в отдельном сервисе - это должно убыстрить работу системы, потому что каждый
маршрут строится в фоне, также можно запустить несколько инстансов этого сервиса и они будут работать независимо, читая задачи из очереди и, записывая новые маршруты в базу самостоятельно, отдельно от основного бэкенда и фронтенда.

Чтобы построить маршрут используется уравнение прямой между конечными точками маршрута.
Далее итеративно мы движемся в  доль оси x и находим y. смотрим в каком кластере точек находится такая точка. и берём из кластера любую наугад для простоты (хотя поидее надо брать ближайшую)
Далее мы эту точку присоединяем к маршруту.

- У точек есть два типа координат longitude, latitude и x,y. Тут можно было обойтись одним. Но в вебинтерфейсе ось x и y строго положительный и направлены от верхнего левого угла экрана вниз и вправо. А такие координаты обычно не используются в жизненных ситуациях. Поэтому longitude, latitude играют роль обычных координат с отрицательными величинам, необязательно это широта и долгота, это могут быть просто координаты. А x,y это приведённые координаты для нашего вронтенда, чтобы можно было легко показать точки и маршруты на экране. Приведение типов координат происходит во время сохранения точки.

- Маршруты хранят в себе информацию о точках как внешние ключи, но ещё и в специальной структуре, в которой точки идут строго по порядку, месте с координатами. Оба этих подхода сохранены, так как у проекта поидее моглы бы быть развитие и связи в сущностях лучше сохранить, хотя можно было бы обойтись списком координат

- Сервис создания маршрута не разбит на подфункции, хотя это бы повысило читаемость и дополняемость кода. Но в следствие того что обращения к Django ORM не могут быть вызхваны из асинхроннного кода была использована одна главная функция. А замена Django ORM  на SQLAlhemy представляется здесь не слишком целесообразной. Писать же в базу при помощи просто SQL не слишком красиво и тоже, кажется не оправданым в этом проекте.

- Отчёт делает допущения по длине маршрута - мы считаем по количеству точек, для простоты, хотя нужно бы считать по расстоянию между точками. Также отчёт на больших данных лучше хранить отдельно в таблице или в хранилище данных и вносить туда поравки по мере поступления данных (создании новых маршрутов) Но здесь я решил этого не делать и так же использовал просто запрос через ORM

- В проекте применены переменные окружения, тоесть при желании их можно задать (такие как адрес бэкенда, и менеджера очередей) Это сделано для удобства последующего (если нужно) разворачивания этого проекта в docker или в других контейнерах, например.

- В проекте соблюдаются права пользователя в части права на маршрут (он привязан к пользователю) и во фронтенде отмечаются они разными цветами

- Фронтенд не оптимизирован для больших данных, поэтому подгружает сразу всё

- Для аутентификации используется токен при доступе к созданию маршрута

- ``` http://localhost:8000/ ``` Эндпоинты бэкенда + login + report

- По любым вопросам обращайтесь ко мне. Готов подискутировать 
```+79146149360```
```alexander.ivanov.35@gmail.com```















