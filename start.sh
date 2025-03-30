#!/bin/bash

# Остановка всех процессов на портах
echo "Остановка процессов на портах 8001 и 3003, если они запущены..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

# Запуск бэкенда в фоновом режиме
echo "Запуск бэкенда на порту 8001..."
cd "$(dirname "$0")"
source venv/bin/activate
PORT=8001 python run.py &
BACKEND_PID=$!

# Ждем 3 секунды для запуска бэкенда
echo "Ожидание запуска бэкенда..."
sleep 3

# Запуск фронтенда
echo "Запуск фронтенда..."
cd frontend
npm run dev

# Корректное завершение при прерывании
trap "kill $BACKEND_PID" EXIT 