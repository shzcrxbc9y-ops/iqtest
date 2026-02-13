// Модуль для экспорта результатов

const Export = {
    // Экспорт в PDF (используя html2canvas и jsPDF)
    async exportToPDF(results) {
        try {
            // Создаем временный элемент для экспорта
            const exportContent = document.createElement('div');
            exportContent.className = 'export-content';
            exportContent.style.cssText = 'background: white; padding: 40px; max-width: 800px; margin: 0 auto;';
            
            exportContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #667eea; font-size: 2.5em; margin-bottom: 10px;">Результаты теста IQ</h1>
                    <p style="color: #666;">Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
                    ${(window.currentUserInfo && window.currentUserInfo.name) ? `<p style="color: #666;">Имя: ${window.currentUserInfo.name}</p>` : ''}
                    ${(results.testModeName) ? `<p style="color: #666;">Режим: ${results.testModeName}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                    <div style="font-size: 5em; font-weight: bold; color: #667eea;">${results.iq}</div>
                    <div style="font-size: 1.5em; color: #666; margin-top: 10px;">IQ</div>
                    <div style="margin-top: 20px; font-size: 1.2em; color: #667eea; font-weight: 600;">${results.level}</div>
                </div>
                
                <div style="margin: 30px 0;">
                    <h2 style="color: #333; margin-bottom: 15px;">Статистика</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #666; font-size: 0.9em;">Правильных ответов</div>
                            <div style="font-size: 2em; font-weight: bold; color: #667eea;">${results.correctAnswers}/${results.totalQuestions}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #666; font-size: 0.9em;">Процент выполнения</div>
                            <div style="font-size: 2em; font-weight: bold; color: #667eea;">${results.percentage}%</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #666; font-size: 0.9em;">Время выполнения</div>
                            <div style="font-size: 2em; font-weight: bold; color: #667eea;">${Math.floor(results.timeSpent / 60)}:${(results.timeSpent % 60).toString().padStart(2, '0')}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #666; font-size: 0.9em;">Сложность</div>
                            <div style="font-size: 2em; font-weight: bold; color: #667eea;">${results.difficulty === 'easy' ? 'Легкий' : results.difficulty === 'medium' ? 'Средний' : 'Сложный'}</div>
                        </div>
                        ${results.percentile != null ? `<div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #666; font-size: 0.9em;">Процентиль</div>
                            <div style="font-size: 2em; font-weight: bold; color: #667eea;">${results.percentile}%</div>
                        </div>` : ''}
                    </div>
                </div>
                
                <div style="margin: 30px 0;">
                    <h2 style="color: #333; margin-bottom: 15px;">Результаты по категориям</h2>
                    ${Object.keys(results.categoryBreakdown).map(category => `
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span style="font-weight: 600;">${category}</span>
                                <span style="color: #667eea; font-weight: bold;">${results.categoryBreakdown[category]}%</span>
                            </div>
                            <div style="height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden;">
                                <div style="height: 100%; width: ${results.categoryBreakdown[category]}%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 0.9em;">
                    <p>IQ Test Pro - Профессиональная проверка интеллекта</p>
                    <p>www.iqtestpro.com</p>
                </div>
            `;
            
            document.body.appendChild(exportContent);
            
            // Используем html2canvas для создания изображения
            if (typeof html2canvas !== 'undefined') {
                const canvas = await html2canvas(exportContent, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                
                document.body.removeChild(exportContent);
                
                // Конвертируем в PDF используя jsPDF
                if (typeof jsPDF !== 'undefined') {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210;
                    const pageHeight = 297;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    
                    pdf.save(`IQ_Test_Result_${results.iq}_${Date.now()}.pdf`);
                    Utils.showToast('PDF успешно экспортирован!', 'success');
                } else {
                    // Fallback: скачать как изображение
                    canvas.toBlob(blob => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `IQ_Test_Result_${results.iq}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        Utils.showToast('Результат экспортирован как изображение!', 'success');
                    });
                }
            } else {
                // Простой экспорт текста
                this.exportAsText(results);
            }
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            Utils.showToast('Ошибка при экспорте. Попробуйте экспорт как текст.', 'error');
            this.exportAsText(results);
        }
    },

    // Экспорт как текст
    exportAsText(results) {
        const text = `
РЕЗУЛЬТАТЫ ТЕСТА IQ
===================

Дата: ${new Date().toLocaleDateString('ru-RU')}
${(window.currentUserInfo && window.currentUserInfo.name) ? `Имя: ${window.currentUserInfo.name}\n` : ''}IQ: ${results.iq}
Уровень: ${results.level}
${results.testModeName ? `Режим: ${results.testModeName}\n` : ''}${results.percentile != null ? `Процентиль: ${results.percentile}%\n` : ''}
Статистика:
- Правильных ответов: ${results.correctAnswers}/${results.totalQuestions}
- Процент выполнения: ${results.percentage}%
- Время выполнения: ${Math.floor(results.timeSpent / 60)}:${(results.timeSpent % 60).toString().padStart(2, '0')}
- Сложность: ${results.difficulty === 'easy' ? 'Легкий' : results.difficulty === 'medium' ? 'Средний' : 'Сложный'}

Результаты по категориям:
${results.categoryBreakdown ? Object.keys(results.categoryBreakdown).map(category => `- ${category}: ${results.categoryBreakdown[category]}%`).join('\n') : '-'}

Описание: ${results.description}

---
IQ Test Pro - Профессиональная проверка интеллекта
        `.trim();
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IQ_Test_Result_${results.iq}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showToast('Результат экспортирован как текст!', 'success');
    },

    // Поделиться результатом
    shareResult(results) {
        const text = `Я прошел тест IQ и получил ${results.iq} баллов! ${results.level}. Попробуйте и вы: IQ Test Pro`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Мой результат теста IQ',
                text: text,
                url: window.location.href
            }).then(() => {
                Utils.showToast('Результат успешно опубликован!', 'success');
            }).catch(() => {
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    },

    // Копировать в буфер обмена
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                Utils.showToast('Результат скопирован в буфер обмена!', 'success');
            });
        } else {
            // Fallback для старых браузеров
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Utils.showToast('Результат скопирован в буфер обмена!', 'success');
        }
    }
};
