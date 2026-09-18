import * as React from 'react';

interface IOnlineTradeinIntroProps {
  title?: string;
  description?: string;
}

export const OnlineTradeinIntroSvg: React.FC<IOnlineTradeinIntroProps> = ({ 
  title = 'Online Trade-In Evaluation Platform',
  description = 'Высокотехнологичный движок для мгновенной онлайн-оценки устройств, расчета стоимости обмена и автоматизации трейд-ин транзакций в режиме реального времени.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд (контуры и текст)
  const gunMetalBg = '#ededed';       // Светло-серый пастельный тон корпуса телефона
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова "Tradein"

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И КИБЕР-ОБМЕНОМ */}
      <svg
        className="online-tradein-logo-svg"
        viewBox="0 0 800 360" 
        width="100%" 
        height="auto" 
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        xmlns="http://w3.org"
      >
        <defs>
          {/* Мягкая тень для объемного эффекта букв и элементов */}
          <filter id="text-art-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.06" />
          </filter>
          
          <style>
            {`
              .online-tradein-logo-svg {
                transform: translateX(8px) scale(0.8);
                width: 100%;
                border: 1px dashed red;
              }
              @keyframes pulse-radar {
                0% { r: 15px; opacity: 0.8; }
                100% { r: 75px; opacity: 0; }
              }
              .radar-circle { animation: pulse-radar 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

              /* ========================================================================= */
              /* 🎯 МОБИЛЬНАЯ АДАПТИВНОСТЬ: Масштабируем без конфликтов с инлайном */
              /* ========================================================================= */
              @media (max-width: 600px) {
                .online-tradein-logo-svg {
                  /* width: 100vw !important; */
                  transform: translateX(8px) scale(0.8) !important;
                  transform-origin: center center !important;
                  margin: 0 auto !important;
                }
              }
            `}
          </style>
        </defs>

        {/* 🎯 СИСТЕМА ВНЕШНИХ ВЕРОЯТНОСТНЫХ КОЛЕЦ */}
        <circle cx="400" cy="175" r="35" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.25" />
        <circle cx="400" cy="175" r="85" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.12" />
        <circle cx="400" cy="175" r="145" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.05" />
        <circle cx="400" cy="175" className="radar-circle" fill="none" stroke={primaryColor} strokeWidth="2.5" />

        {/* 🔤 СЛОВО "Online" (Слева, выровнено по правому краю x=335) */}
        <text 
          x="335" 
          y="215" 
          fontFamily="Montserrat, system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="115" 
          fill={primaryColor}
          textAnchor="end"
          letterSpacing="-0.04em"
          filter="url(#text-art-shadow)"
        >
          Online
        </text>
        
        {/* 🔤 СЛОВО "Tradein" (Справа, горит неоном, выровнено по левому краю x=465) */}
        <text 
          x="465" 
          y="215" 
          fontFamily="Montserrat, system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="115" 
          fill={neonOrange}
          textAnchor="start"
          letterSpacing="-0.02em"
          filter="url(#text-art-shadow)"
        >
          Tradein
        </text>

        {/* ========================================================================= */}
        {/* 📱 ЦЕНТР: СМАРТФОН С ТОЧКОЙ И ДВЕ КОР ОТКИЕ СТРЕЛКИ ОБМЕНА ВПРИТИРКУ К КОРПУСУ */}
        {/* ========================================================================= */}
        <g id="central-tradein-engine" filter="url(#text-art-shadow)">
          
          {/* Вся группа элементов развернута на -45 градусов вокруг центра (400, 175) */}
          <g transform="rotate(-45 400 175)">
            
            {/* ↘️ СТРЕЛКА 1 (СЛЕВА): Направлена строго В ЦЕНТР устройства (смещение ближе к корпусу) */}
            <g stroke={primaryColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <line x1="326" y1="175" x2="344" y2="175" />
              <polygon points="346,175 332,164 332,186" fill={primaryColor} strokeWidth="1" />
            </g>

            {/* 📱 СМАРТФОН: Унаследованный габарит 92px по высоте */}
            <rect 
              x="363" 
              y="129" 
              width="74"  
              height="92" 
              rx="11" 
              fill={gunMetalBg} 
              stroke={primaryColor} 
              strokeWidth="11" 
              strokeLinejoin="round" 
            />
            
            {/* Внутренняя разметка экрана дисплея (Ваша редакция: stroke=2, opacity=1) */}
            <rect x="372" y="138" width="56" height="66" rx="3" fill="none" stroke={primaryColor} strokeWidth="2" opacity="1" />
            
            {/* Большая четкая круглая кнопка Home внизу экрана (r=7, stroke=2) */}
            <circle cx="400" cy="211" r="8" fill="#ffffff" stroke={primaryColor} strokeWidth="2" />
            
            {/* Разговорный динамик сверху */}
            <line x1="392" y1="134" x2="408" y2="134" stroke={primaryColor} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />

            {/* ↘️ СТРЕЛКА 2 (СПРАВА): Направлена ИЗ ЦЕНТРА устройства наружу (прижата к правой грани) */}
            <g stroke={primaryColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <line x1="454" y1="175" x2="472" y2="175" />
              <polygon points="474,175 460,164 460,186" fill={primaryColor} strokeWidth="1" />
            </g>

          </g>
          
        </g>

      </svg>

      {/* 📝 ТЕКСТОВЫЙ ИНФОРМАЦИОННЫЙ БЛОК */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          padding: '0 24px',
          marginTop: '1.5rem'
        }}
      >
        <h2 
          style={{ 
            margin: 0,
            fontFamily: 'Montserrat, system-ui, sans-serif', 
            fontWeight: 800, 
            fontSize: '1.5rem', 
            lineHeight: 1.3,
            color: titleColor,
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h2>
        
        <p 
          style={{ 
            margin: 0,
            fontFamily: 'Montserrat, system-ui, sans-serif', 
            fontWeight: 500, 
            fontSize: '0.88rem',
            lineHeight: 1.6,
            color: textColor
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
