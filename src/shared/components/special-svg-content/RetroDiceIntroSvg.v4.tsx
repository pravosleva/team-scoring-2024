import * as React from 'react';

interface IRetroDiceIntroProps {
  title?: string;
  description?: string;
}

export const RetroDiceIntroSvg: React.FC<IRetroDiceIntroProps> = ({ 
  title,
  description, // 'Вероятностное моделирование и прогнозирование сценариев на стыке винтажной игровой математики.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд
  const gunMetalBg = '#ededed';       // Светло-серый металлический тон деталей
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова Dice

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И МАССИВНЫМ БАРАБАНОМ */}
      <svg
        className='retro-dice-logo-svg'
        viewBox="0 0 800 360" 
        width="100%" 
        height="auto" 
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        xmlns="http://w3.org"
      >
        <defs>
          {/* Мягкая тень для объемного 3D-эффекта букв и металла */}
          <filter id="text-art-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.06" />
          </filter>
          
          {/* 🎯 МАСКА ДЛЯ ВЫСЕКАНИЯ ВНЕШНИХ ВЫЕМОК (ДОЛОВ) БАРАБАНА */}
          {/* Мы берем белый круг и вырезаем из него 6 маленьких кругов по краям */}
          <mask id="revolver-cylinder-mask">
            <rect x="300" y="70" width="200" height="210" fill="#ffffff" />
            {/* 6 выемок, расположенных строго между каморами для рельефа */}
            <circle cx="400" cy="117" r="12" fill="#000000" />
            <circle cx="450" cy="146" r="12" fill="#000000" />
            <circle cx="450" cy="204" r="12" fill="#000000" />
            <circle cx="400" cy="233" r="12" fill="#000000" />
            <circle cx="350" cy="204" r="12" fill="#000000" />
            <circle cx="350" cy="146" r="12" fill="#000000" />
          </mask>

          <style>
            {`
              .retro-dice-logo-svg {
                /* transform: translateX(8px) scale(0.8); */
                width: 100%;
                /* border: 1px dashed red; */
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

        {/* 🔤 СЛОВО "Retro" (Слева, выровнено по правому краю x=335) */}
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
          Retro
        </text>
        
        {/* 🔤 СЛОВО "Dice" (Справа, горит неоном, выровнено по левому краю x=465) */}
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
          Dice
        </text>

        {/* ========================================================================= */}
        {/* 🔫 РЕЛЬЕФНЫЙ ШЕСТИЗАРЯДНЫЙ БАРАБАН С ВЫЕМОЧКАМИ И ТОЛСТЫМ КОЛЬЦОМ */}
        {/* ========================================================================= */}
        <g id="revolver-cylinder" filter="url(#text-art-shadow)">
          
          {/* Применяем маску к основному телу барабана для получения внешних пазов */}
          <g mask="url(#revolver-cylinder-mask)">
            {/* Тостый внешний стальной контур (strokeWidth: 12) */}
            <circle cx="400" cy="175" r="46" fill={gunMetalBg} stroke={primaryColor} strokeWidth="12" />
          </g>
          
          {/* Внутренняя рельефная фаска */}
          <circle cx="400" cy="175" r="41" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.25" />
          
          {/* Центральный массивный штифт (ось экстрактора) */}
          <circle cx="400" cy="175" r="8" fill={primaryColor} />

          {/* ⚪ 6 ЧЁТКИХ БЕЛЫХ ОТВЕРСТИЙ ДЛЯ ПАТРОНОВ (КАМОРЫ) */}
          {/* Расположены симметрично по кругу радиусом 24px */}
          <circle cx="400" cy="151" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 12 часов */}
          <circle cx="421" cy="163" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 2 часа */}
          <circle cx="421" cy="187" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 4 часа */}
          <circle cx="400" cy="199" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 6 часов */}
          <circle cx="379" cy="187" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 8 часов */}
          <circle cx="379" cy="163" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 10 часов */}

        </g>

      </svg>

      {/* 📝 ТЕКСТОВЫЙ ИНФОРМАЦИОННЫЙ БЛОК */}
      {
        (!!title || !!description) && (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              padding: '0 24px',
              marginTop: '1.5rem'
            }}
          >
            {
              !!title && (
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
              )
            }
            {
              !!description && (
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
              )
            }
          </div>
        )
      }
    </div>
  )
}
