// 1. Внутренний хелпер умного автопереноса слов для мобильных экранов
const wrapText = (text, limit = 36) => {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > limit) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  if (currentLine) lines.push(currentLine.trim());
  return lines.join('\n');
};
