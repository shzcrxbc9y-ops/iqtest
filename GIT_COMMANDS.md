# Команды для загрузки проекта на GitHub

## Выполните эти команды по порядку:

```bash
# 1. Перейдите в папку проекта
cd C:\Users\User\Desktop\iq

# 2. Инициализируйте Git репозиторий
git init

# 3. Добавьте ВСЕ файлы проекта (не только README.md!)
git add .

# 4. Сделайте первый коммит
git commit -m "Initial commit: IQ Test Pro project"

# 5. Переименуйте ветку в main (если нужно)
git branch -M main

# 6. Добавьте удаленный репозиторий (ваш репозиторий уже создан)
git remote add origin https://github.com/shzcrxbc9y-ops/iqtest.git

# 7. Отправьте файлы на GitHub
git push -u origin main
```

## ⚠️ Важно:

- Команда `git add .` добавит ВСЕ файлы проекта (HTML, CSS, JS и т.д.)
- Если возникнет ошибка "remote origin already exists", выполните:
  ```bash
  git remote remove origin
  git remote add origin https://github.com/shzcrxbc9y-ops/iqtest.git
  ```

## После успешной загрузки:

1. Зайдите на https://github.com/shzcrxbc9y-ops/iqtest
2. Убедитесь, что все файлы загружены
3. Включите GitHub Pages:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Save
4. Ваш сайт будет доступен по адресу:
   `https://shzcrxbc9y-ops.github.io/iqtest/`
