import * as React from 'react';

interface IRetroDiceIntroProps {
  title?: string;
  description?: string;
}

export const RetroDiceIntroSvg: React.FC<IRetroDiceIntroProps> = ({ 
  title = 'Retro Dice Engine',
  description = 'Вероятностное моделирование и прогнозирование случайных сценариев на стыке винтажной игровой математики, синусоид распределения Гаусса и доказательных алгоритмов.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд
  const gunMetalBg = '#ededed';       // Светло-серый металлический тон барабаны
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова Dice
  // const accentGreen = '#39e5ac';      // Изумрудный неон для луча индикатора

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И БАРАБАНОМ */}
      <svg 
        viewBox="0 0 800 360" 
        width="100%" 
        height="auto" 
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        xmlns="http://w3.org"
      >
        <defs>
          {/* Мягкая тень для объемного 3D-эффекта барабана и букв */}
          <filter id="text-art-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.05" />
          </filter>
          
          <style>
            {`
              @keyframes pulse-radar {
                0% { r: 15px; opacity: 0.8; }
                100% { r: 75px; opacity: 0; }
              }
              /* Плавное бесконечное вращение индикатора сканирования камор */
              @keyframes radar-sweep {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .radar-circle { animation: pulse-radar 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
              .radar-sweep-line { 
                animation: radar-sweep 5s linear infinite; 
                transform-origin: 400px 175px; 
              }
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
        {/* 🔫 ЦЕНТРАЛЬНЫЙ ШЕСТИЗАРЯДНЫЙ БАРАБАН РЕВОЛЬВЕРА С БЕЛЫМИ КАМОРАМИ */}
        {/* ========================================================================= */}
        <g id="revolver-cylinder" filter="url(#text-art-shadow)">
          
          {/* Массивный внешний стальной контур барабана */}
          <circle cx="400" cy="175" r="50" fill={gunMetalBg} stroke={primaryColor} strokeWidth="6" />
          
          {/* Внутренние выемки (долы) барабана для придания рельефа и 3D-текстуры */}
          <circle cx="400" cy="175" r="44" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.3" />
          
          {/* Центральный стальной штифт (ось вращения экстрактора) */}
          <circle cx="400" cy="175" r="8" fill={gunMetalBg} stroke={primaryColor} strokeWidth="3" />
          <circle cx="400" cy="175" r="3" fill={primaryColor} />

          {/* Сетка перекрестия внутри механизма */}
          <line x1="356" y1="175" x2="444" y2="175" stroke={primaryColor} strokeWidth="1" opacity="0.2" />
          <line x1="400" y1="131" x2="400" y2="219" stroke={primaryColor} strokeWidth="1" opacity="0.2" />

          {/* ⚪ 6 ИДЕАЛЬНЫХ БЕЛЫХ ОТВЕРСТИЙ ДЛЯ ПАТРОНОВ (КАМОРЫ РЕВОЛЬВЕРА) */}
          {/* Расположены строго по кругу с шагом в 60 градусов на радиусе 26px */}
          <circle cx="400" cy="149" r="7.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* Верхнее (12 часов) */}
          <circle cx="423" cy="162" r="7.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 2 часа */}
          <circle cx="423" cy="188" r="7.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 4 часа */}
          <circle cx="400" cy="201" r="7.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* Нижнее (6 часов) */}
          <circle cx="377" cy="188" r="7.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 8 часов */}
          <circle cx="377" cy="162" r="7.5" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* 10 часов */}

          
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
