@echo off
chcp 65001 >nul
echo ========================================
echo   Загрузка проекта IQ Test на GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Проверка Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Git не установлен!
    echo Скачайте Git с https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [2/6] Инициализация репозитория...
if not exist .git (
    git init
)

echo [3/6] Добавление всех файлов проекта...
git add .

echo [4/6] Создание коммита...
git commit -m "Initial commit: IQ Test Pro project"

echo [5/6] Переименование ветки в main...
git branch -M main

echo [6/6] Добавление удаленного репозитория...
git remote remove origin 2>nul
git remote add origin https://github.com/shzcrxbc9y-ops/iqtest.git

echo.
echo [7/7] Отправка файлов на GitHub...
echo Введите ваши учетные данные GitHub при запросе.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo   ОШИБКА при отправке файлов!
    echo ========================================
    echo.
    echo Возможные причины:
    echo 1. Неверный логин/пароль GitHub
    echo 2. Репозиторий еще не создан на GitHub
    echo 3. Проблемы с сетью
    echo.
    echo Решение:
    echo - Убедитесь, что репозиторий создан: https://github.com/shzcrxbc9y-ops/iqtest
    echo - Используйте Personal Access Token вместо пароля
    echo   (Settings ^> Developer settings ^> Personal access tokens)
    echo.
) else (
    echo.
    echo ========================================
    echo   УСПЕШНО! Проект загружен на GitHub!
    echo ========================================
    echo.
    echo Ваш репозиторий: https://github.com/shzcrxbc9y-ops/iqtest
    echo.
    echo Чтобы включить GitHub Pages:
    echo 1. Откройте: https://github.com/shzcrxbc9y-ops/iqtest/settings/pages
    echo 2. Source: Deploy from a branch
    echo 3. Branch: main, folder: / (root)
    echo 4. Save
    echo.
    echo Ваш сайт будет доступен по адресу:
    echo https://shzcrxbc9y-ops.github.io/iqtest/
    echo.
)

pause
