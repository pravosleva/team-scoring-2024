import * as React from 'react';

interface IReactiveChatIntroProps {
  title?: string;
  description?: string;
}

export const ReactiveChatIntroSvg: React.FC<IReactiveChatIntroProps> = ({ 
  title = 'Reactive Messaging & Streaming Engine',
  description = 'Высокопроизводительное ядро для мгновенного обмена сообщениями, асинхронного стриминга данных через веб-сокеты и реактивной синхронизации чат-комнат.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд (контуры балуна и текст)
  const gunMetalBg = '#ededed';       // Светло-серый пастельный тон тела балуна
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова "Chat"

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И БАЛУНОМ КИБЕР-ЧАТА */}
      <svg
        className="reactive-chat-logo-svg"
        viewBox="0 0 800 360" 
        // width="100%" 
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
              .reactive-chat-logo-svg {
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
              /* 🎯 МОБИЛЬНАЯ АДАПТИВНОСТЬ: Перебиваем инлайновые стили без конфликтов */
              /* ========================================================================= */
              @media (max-width: 420px) {
                .reactive-chat-logo-svg {
                  /* !important принудительно выжигает инлайновые width/margin/transform на мобилках */
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

        {/* 🔤 СЛОВО "Reactive" (Слева, выровнено по правому краю x=335) */}
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
          Reactive
        </text>
        
        {/* 🔤 СЛОВО "Chat" (Справа, горит неоном, выровнено по левому краю x=465) */}
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
          Chat
        </text>

        {/* ========================================================================= */}
        {/* 💬 МИНИМАЛИСТИЧНЫЙ БАЛУН СООБЩЕНИЯ С ХВОСТИКОМ СПРАВА-ВНИЗУ В ЦЕНТРЕ ПО ОСИ (400, 175) */}
        {/* ========================================================================= */}
        <g id="central-chat-balloon" filter="url(#text-art-shadow)">
          
          {/* 🎯 ТРЕУГОЛЬНИК СПРАВА-ВНИЗУ (Указатель/хвостик балуна сообщения) */}
          {/* Сплошной синий полигон, идеально сопряженный с нижней правой гранью корпуса */}
          <polygon 
            points="436,206 454,222 422,216" 
            fill={primaryColor} 
            stroke={primaryColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          
          {/* Внутренняя рельефная фаска для глубины и сохранения стиля чертежа */}
          <circle cx="400" cy="175" r="46" fill={gunMetalBg} stroke={primaryColor} strokeWidth="12" />

          {/* Три лаконичные точки-индикаторы набора текста (Печать ИИ/Собеседника) */}
          <circle cx="382" cy="175" r="4.5" fill={primaryColor} opacity="0.8" />
          <circle cx="400" cy="175" r="4.5" fill={primaryColor} opacity="0.8" />
          <circle cx="418" cy="175" r="4.5" fill={primaryColor} opacity="0.8" />

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
