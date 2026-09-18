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
  const subBgColor = '#ededed';       // Светло-серый пастельный тон для центрального кольца
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова Dice
  const accentGreen = '#39e5ac';      // Изумрудный неон для стрелки радара

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И РАДАРОМ */}
      <svg 
        viewBox="0 0 800 360" 
        width="100%" 
        height="auto" 
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        xmlns="http://w3.org"
      >
        <defs>
          {/* Мягкая тень для парящего эффекта букв */}
          <filter id="text-art-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.05" />
          </filter>
          
          <style>
            {`
              @keyframes pulse-radar {
                0% { r: 15px; opacity: 0.8; }
                100% { r: 75px; opacity: 0; }
              }
              /* 🎯 НА ТИВНОЕ ВРАЩЕНИЕ ЛУЧА РАДАРА: Крутится строго вокруг центра (400, 175) */
              @keyframes radar-sweep {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .radar-circle { animation: pulse-radar 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
              .radar-sweep-line { 
                animation: radar-sweep 4s linear infinite; 
                transform-origin: 400px 175px; 
              }
            `}
          </style>
        </defs>

        {/* 🎯 СИСТЕМА ВНЕШНИХ КОНЦЕНТРИЧЕСКИХ КОЛЕЦ ТЕОРИИ ВЕРОЯТНОСТЕЙ */}
        <circle cx="400" cy="175" r="35" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.25" />
        <circle cx="400" cy="175" r="85" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.12" />
        <circle cx="400" cy="175" r="145" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.05" />
        <circle cx="400" cy="175" className="radar-circle" fill="none" stroke={primaryColor} strokeWidth="2.5" />

        {/* 🔤 СЛОВО "Retro" (Слева, жестко зафиксировано, выровнено по правому краю x=335) */}
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
        
        {/* 🔤 СЛОВО "Dice" (Справа, жестко зафиксировано, горит неоном, выровнено по левому краю x=465) */}
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
        {/* 📡 ЦЕНТРАЛЬНЫЙ АНАЛОГОВЫЙ РАДАР И ПРИЦЕЛ С КРУТЯЩИМСЯ ЛУЧОМ */}
        {/* ========================================================================= */}
        <g id="central-radar-lens">
          {/* Массивное внешнее кольцо линзы */}
          <circle cx="400" cy="175" r="50" fill={subBgColor} stroke={primaryColor} strokeWidth="10" />
          {/* Внутреннее стекло радара */}
          <circle cx="400" cy="175" r="44" fill="rgba(0,0,0,0.01)" />
          
          {/* СЕТКА ПРИЦЕЛА (Внутренние кольца делений) */}
          <circle cx="400" cy="175" r="30" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.25" />
          <circle cx="400" cy="175" r="16" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.25" />
          
          {/* ОСЕВЫЕ ЛИНИИ ПЕРЕКРЕСТИЯ (Сканирование осей координат) */}
          <line x1="356" y1="175" x2="444" y2="175" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
          <line x1="400" y1="131" x2="400" y2="219" stroke={primaryColor} strokeWidth="1" opacity="0.3" />
          
          {/* ⚡ ВРАЩАЮЩИЙСЯ СВЕТОВОЙ ЛУЧ РАДАРА */}
          {/* Тонкая, яркая неоновая стрелка сканера дедлайнов */}
          <line 
            x1="400" y1="175" 
            x2="400" y2="133" 
            stroke={accentGreen} 
            strokeWidth="2.5" 
            strokeLinecap="round"
            className="radar-sweep-line" 
            filter="url(#text-art-shadow)"
          />
        </g>

        {/* ⚡ ВРАЩАЮЩИЙСЯ СВЕТОВОЙ ЛУЧ ИНДИКАТОРА СЦЕНАРИЕВ */}
        {/* Тонкий неоновый маркер, который плавно сканирует каморы по кругу */}
        <line 
          x1="400" y1="175" 
          x2="400" y2="132" 
          stroke={accentGreen} 
          strokeWidth="3" 
          strokeLinecap="round"
          className="radar-sweep-line" 
        />

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
