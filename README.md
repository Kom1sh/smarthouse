# SmartHome Frontend

Фронтенд теперь работает в режиме прямого HTTP polling к ESP32.

## Настройка

1. Скопируй `.env.example` в `.env.local`
2. Укажи адрес своей ESP32:

```env
NEXT_PUBLIC_ESP32_BASE_URL=http://192.168.0.50
NEXT_PUBLIC_ESP32_SENSORS_PATH=/sensors
NEXT_PUBLIC_ESP32_POLL_INTERVAL_MS=3000
```

3. Установи зависимости и запусти проект:

```bash
npm install
npm run dev
```

## Формат JSON от ESP32

Ожидается ответ `GET /sensors` примерно такого вида:

```json
{
  "gas": 2450,
  "water": 0,
  "vibro": 1,
  "light": 0,
  "temp": 24.5,
  "hum": 56.0
}
```

## Важно

Чтобы браузер мог читать JSON напрямую с ESP32, устройство должно отдавать CORS-заголовок:

```http
Access-Control-Allow-Origin: *
```

Если фронт открыт по `https`, запросы на `http://<esp32-ip>` браузер может заблокировать как mixed content.
