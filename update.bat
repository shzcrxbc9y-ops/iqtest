@echo off
chcp 65001 >nul
echo ========================================
echo   Обновление сайта в Netlify
echo ========================================
echo.

cd /d "C:\Users\User\Desktop\iq"

echo [1/3] Добавление изменений...
git add .
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось добавить файлы
    pause
    exit /b 1
)

echo [2/3] Создание коммита...
set /p commit_msg="Введите описание изменений (или нажмите Enter для авто): "
if "%commit_msg%"=="" set commit_msg=Update site - %date% %time%

git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo Предупреждение: Нет изменений для коммита или ошибка
)

echo [3/3] Отправка в GitHub...
git push
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось отправить изменения
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ Успешно отправлено в GitHub!
echo ========================================
echo.
echo Netlify автоматически обновит сайт в течение 1-2 минут.
echo Проверьте статус: https://app.netlify.com/
echo.
pause
