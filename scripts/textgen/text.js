class BoxText {
  characters = [];          // 存储字符数组
  fontSize = 80;           // 字体大小
  fontFamily = "sans-serif";  // 默认字体族
  characterSpacing = 5;    // 字符间距
  padding = 30;           // 内边距

  // 风格差异更大的中文字体
  fontFamilies = [
    // 现代风格字体
    "Microsoft YaHei",     // 微软雅黑：现代无衬线字体，清晰易读，适合标题和正文
    "SimHei",             // 黑体：粗体无衬线字体，醒目有力，适合强调和标题
    
    // 传统风格字体
    "SimSun",             // 宋体：传统衬线字体，正式典雅，适合正文
    "FangSong",           // 仿宋：传统衬线字体，古朴典雅，适合正式场合
    "STSong",             // 华文宋体：传统衬线字体，适合正文
    "STFangsong",         // 华文仿宋：传统衬线字体，适合正式文档
    "STZhongsong",        // 华文中宋：传统风格，适合正式场合
    
    // 书法风格字体
    "KaiTi",              // 楷体：楷书风格，优雅流畅，适合艺术效果
    "STKaiti",            // 华文楷体：楷书风格，适合艺术效果
    "STXingkai",          // 华文行楷：行书风格，流畅自然，适合艺术效果
    "STLiti",             // 华文隶书：隶书风格，古朴典雅，适合传统风格
    "LiSu",               // 隶书：传统隶书，适合传统风格
    
    // 艺术字体
    //"STHupo",             // 华文琥珀：艺术字体，有立体感，适合装饰效果
    "STXinwei",           // 华文新魏：魏碑风格，有雕刻感，适合艺术效果
    //"STCaiyun",           // 华文彩云：艺术字体，有云纹效果，适合装饰效果
    "YouYuan"             // 幼圆：圆润可爱的风格，适合活泼内容
  ];

  getRandomColors() {
    const grayValue = Math.floor(Math.random() * 255);
    
    const textColor = grayValue < 128 ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
    const backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    
    return {
      background: backgroundColor,
      text: textColor
    };
  }

  getRandomFont() {
    const randomIndex = Math.floor(Math.random() * this.fontFamilies.length);
    return this.fontFamilies[randomIndex];
  }

  constructor(text, options = {}) {
    if (options) {
      const { 
        fontSize: newFontSize, 
        fontFamily: newFontFamily, 
        gutter: newGutter, 
        pendding: newPadding,
        fontFamilies: customFontFamilies
      } = options;
      
      newFontSize && (this.fontSize = newFontSize);
      newFontFamily && (this.fontFamily = newFontFamily);
      newGutter && (this.characterSpacing = newGutter);
      newPadding && (this.padding = newPadding);
      customFontFamilies && (this.fontFamilies = customFontFamilies);
    }
    if (!text) {
      console.error("必须设置文本内容");
      return;
    }
    const textChars = text.split("");
    const charModes = new Array(textChars.length).fill(CHAR_MODE.WHITE);
    
    charModes[0] = CHAR_MODE.FIRST;
    
    for (let i = 1; i < textChars.length; i += 5) {
      for (let j = i; j < i + 5 - 1 && j < textChars.length; ++j) {
        if (10 * Math.random() > 6) {
          charModes[j] = CHAR_MODE.RED;
          break;
        }
      }
    }
    
    for (const [index, char] of textChars.entries()) {
      if (/^\s$/.test(char)) {
        this.characters.push(new BoxChar("", CHAR_MODE.SPACE));
      } else {
        const selectedFont = this.getRandomFont();
        
        this.characters.push(new BoxChar(
          char, 
          charModes[index], 
          this.fontSize, 
          selectedFont
        ));
      }
    }
  }
  draw(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      console.error("[BoxText.call::draw()] 无法加载画布上下文");
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = this.padding;
    const spacing = this.characterSpacing;
    let totalWidth = 2 * padding;
    let maxHeight = 0;

    for (const char of this.characters) {
      if (char instanceof BoxChar) {
        const size = char.outterSize;
        totalWidth += size.width + spacing;
        maxHeight = Math.max(maxHeight, size.height);
      } else {
        totalWidth += 2 * spacing;
      }
    }

    const alignSelect = document.querySelector("#text-align");
    let startX = 0;
    if (alignSelect.value === "center") {
      startX = (canvas.width - totalWidth) / 2;
    } else if (alignSelect.value === "right") {
      startX = canvas.width - totalWidth;
    }

    let currentX = padding + startX;
    maxHeight += 2 * padding;

    context.fillStyle = COLORS.WHITE;
    context.textBaseline = "top";
    context.textAlign = "left";

    for (const char of this.characters) {
      if (char.mode === CHAR_MODE.SPACE) {
        currentX += 2 * spacing;
        continue;
      }

      context.save();
      
      const {
        char: character,
        top: offsetTop,
        left: offsetLeft,
        width: charWidth,
        height: charHeight,
        angle: rotation,
        mode: charMode,
        color: charColor,
      } = char;

      if (charMode === CHAR_MODE.FIRST) {
        const { width: outerWidth, height: outerHeight } = char.outterSize;
        const centerX = currentX + outerWidth / 2;
        const centerY = padding + outerHeight / 2;

        const colors = this.getRandomColors();
        rotateCanvas(context, rotation - 5, centerX, centerY);
        context.fillStyle = colors.background;
        context.fillRect(currentX, (maxHeight - outerHeight) / 2, outerWidth, outerHeight);

        rotateCanvas(context, rotation + 2, centerX, centerY);
        const charX = currentX + (outerWidth - charWidth) / 2 - offsetLeft;
        const charY = (maxHeight - charHeight) / 2 - offsetTop;
        context.fillStyle = colors.text;
        context.font = char.font;
        context.fillText(character, charX, charY);

        currentX += char.outterSize.width + spacing;
      } else {
        const { width: outerWidth, height: outerHeight } = char.outterSize;
        const centerX = currentX + outerWidth / 2;
        const centerY = padding + outerHeight / 2;

        const colors = this.getRandomColors();
        rotateCanvas(context, rotation + 1, centerX, centerY);
        context.fillStyle = colors.background;
        context.fillRect(currentX, (maxHeight - outerHeight) / 2, outerWidth, outerHeight);

        const charX = currentX + (outerWidth - charWidth) / 2 - offsetLeft;
        const charY = (maxHeight - charHeight) / 2 - offsetTop;
        rotateCanvas(context, -1, centerX, centerY);
        context.fillStyle = colors.text;
        context.font = char.font;
        context.fillText(character, charX, charY);

        currentX += char.outterSize.width + spacing;
      }

      context.restore();
    }

    if (textStroke) {
      const strokeWidth = parseInt(textStrokeWidth);
      const halfStroke = Math.floor(strokeWidth / 2);
      const imageData = context.getImageData(0, 0, 1770, 1300);
      const strokeData = context.createImageData(1770, 1300);

      for (let y = halfStroke; y < imageData.height - halfStroke; ++y) {
        for (let x = halfStroke; x < imageData.width - halfStroke; ++x) {
          const pixelIndex = y * imageData.width * 4 + 4 * x;
          if (!imageData.data[pixelIndex + 3]) continue;
          
          const alpha = imageData.data[pixelIndex + 3];
          for (let strokeY = y - strokeWidth + 1; strokeY < y + strokeWidth; ++strokeY) {
            for (let strokeX = x - strokeWidth + 1; strokeX < x + strokeWidth; ++strokeX) {
              const strokePixelIndex = strokeY * imageData.width * 4 + 4 * strokeX;
              strokeData.data[strokePixelIndex] = 255;
              strokeData.data[strokePixelIndex + 1] = 255;
              strokeData.data[strokePixelIndex + 2] = 255;
              strokeData.data[strokePixelIndex + 3] += alpha / 4;
            }
          }
        }
      }

      const { canvas: strokeCanvas, context: strokeContext } = letterCanvas(1770, 1300);
      strokeContext.putImageData(strokeData, 0, 0);
      context.save();
      context.globalCompositeOperation = "destination-over";
      context.drawImage(strokeCanvas, 0, 0);
      context.restore();
    }

    return maxHeight;
  }
}
