import * as React from 'react';

interface IAutoparkIntroProps {
  title?: string;
  description?: string;
}

export const AutoparkIntroSvg: React.FC<IAutoparkIntroProps> = ({ 
  title = 'Fleet Management Platform',
  description = 'Универсальная система мониторинга автопарка, контроля логистических маршрутов, учета техобслуживания и сквозной аналитики транспортных средств.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд (Шина и контуры)
  const gunMetalBg = '#ededed';       // Светло-серый пастельный тон тела диска
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова "Park"

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И АВТОМОБИЛЬНЫМ КОЛЕСОМ */}
      <svg
        className='autopark-logo-svg'
        viewBox="0 0 800 360" 
        width="100%" 
        height="auto" 
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        xmlns="http://w3.org"
      >
        <defs>
          {/* Мягкая тень для объемного эффекта букв и колеса */}
          <filter id="text-art-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.06" />
          </filter>
          
          <style>
            {`
              .autopark-logo-svg {
                /* transform: translateX(8px) scale(0.8); */
                width: 100%;
                border: 1px dashed red;
              }
              @keyframes pulse-radar {
                0% { r: 15px; opacity: 0.8; }
                100% { r: 75px; opacity: 0; }
              }
              .radar-circle { animation: pulse-radar 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            `}
          </style>
        </defs>

        {/* 🎯 СИСТЕМА ВНЕШНИХ ВЕРОЯТНОСТНЫХ КОЛЕЦ */}
        <circle cx="400" cy="175" r="35" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.25" />
        <circle cx="400" cy="175" r="85" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.12" />
        <circle cx="400" cy="175" r="145" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.05" />
        <circle cx="400" cy="175" className="radar-circle" fill="none" stroke={primaryColor} strokeWidth="2.5" />

        {/* 🔤 СЛОВО "Auto" (Слева, выровнено по правому краю x=335) */}
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
          Auto
        </text>
        
        {/* 🔤 СЛОВО "Park" (Справа, горит неоном, выровнено по левому краю x=465) */}
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
          Park
        </text>

        {/* ========================================================================= */}
        {/* 🏎️ ЦЕНТРАЛЬНОЕ КОЛЕСО (КЛАССИЧЕСКАЯ РАЗБОЛТОВКА С 5 ОТВЕРСТИЯМИ) */}
        {/* ========================================================================= */}
        <g id="autopark-wheel-5x100" filter="url(#text-art-shadow)">
          
          {/* Массивный внешний синий контур (Низкопрофильная шина: r=46, stroke=12) */}
          <circle cx="400" cy="175" r="46" fill={gunMetalBg} stroke={primaryColor} strokeWidth="12" />
          
          {/* Внутреннее прижимное кольцо обода диска */}
          <circle cx="400" cy="175" r="41" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.25" />
          
          {/* Центральная ступица (ось колеса) */}
          <circle cx="400" cy="175" r="8" fill={primaryColor} />

          {/* ⚪ 5 ИДЕАЛЬНЫХ ОТВЕРСТИЙ СТАНДАРТНОЙ РАЗБОЛТОВКИ 5х100 */}
          {/* Просчитано тригонометрически на радиусе 25px с шагом в 72 градуса относительно центра (400, 175) */}
          <circle cx="400.00" cy="150.00" r="6.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 0° (Точно вверху на 12 часов) */}
          <circle cx="423.78" cy="167.27" r="6.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 72° */}
          <circle cx="414.69" cy="195.23" r="6.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 144° */}
          <circle cx="385.31" cy="195.23" r="6.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 216° */}
          <circle cx="376.22" cy="167.27" r="6.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 288° */}

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
