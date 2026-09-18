import * as React from 'react';

interface IReactiveEngineIntroProps {
  title?: string;
  description?: string;
}

export const ReactiveEngineIntroSvg: React.FC<IReactiveEngineIntroProps> = ({ 
  title = 'Reactive State & Computation Engine',
  description = 'Высокопроизводительное реактивное ядро для синхронизации состояний, параллельных вычислений в воркерах и мгновенного рантайм-процессинга данных.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд (сопло и текст)
  const gunMetalBg = '#ededed';       // Светло-серый пастельный тон деталей
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон (огонь и слово Engine)
  // const alertRed = '#ff3b30';         // Аварийный красный для внутреннего ядра пламени

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И РЕАКТИВНЫМ ДВИГАТЕЛЕМ */}
      <svg 
        viewBox="0 0 800 360" 
        width="100%" 
        height="auto" 
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        xmlns="http://w3.org"
      >
        <defs>
          {/* Мягкая тень для объемного эффекта букв и металла */}
          <filter id="text-art-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.06" />
          </filter>
          
          <style>
            {`
              /* 🎯 КОЛЬЦА МАХА: Пульсирующие круги, имитирующие сверхзвуковые волны пламени */
              @keyframes mach-rings {
                0% { r: 10px; opacity: 0.9; stroke-width: 3px; }
                50% { opacity: 0.5; }
                100% { r: 78px; opacity: 0; stroke-width: 1px; }
              }
              /* Мягкое мерцание / пульсация самого форсажного огня */
              @keyframes fire-thrust {
                0%, 100% { transform: scale(1) rotate(-45deg); opacity: 0.9; }
                50% { transform: scale(1.06) rotate(-45deg); opacity: 1; }
              }
              .pulse-mach-ring { 
                animation: mach-rings 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; 
                transform-origin: 418px 157px; /* Центр смещен в точку извержения пламени */
              }
              .reactive-fire-glow { 
                animation: fire-thrust 0.15s ease-in-out infinite alternate; 
                transform-origin: 400px 175px; 
              }
            `}
          </style>
        </defs>

        {/* 🎯 СИСТЕМА ГЛОБАЛЬНЫХ ФОНОВЫХ КОЛЕЦ (Центрированы по оси 400, 175) */}
        <circle cx="400" cy="175" r="35" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.2" />
        <circle cx="400" cy="175" r="85" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.1" />
        <circle cx="400" cy="175" r="145" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.04" />
        
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
        
        {/* 🔤 СЛОВО "Engine" (Справа, горит неоном, выровнено по левому краю x=465) */}
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
          Engine
        </text>

        {/* ========================================================================= */}
        {/* 🚀 ЦЕНТР: МИНИМАЛИСТИЧНЫЙ РЕАКТИВНЫЙ ДВИГАТЕЛЬ (СОПЛО И ОГОНЬ ПОД 45°) */}
        {/* ========================================================================= */}
        <g id="reactive-engine-core" filter="url(#text-art-shadow)">
          <circle cx="400" cy="175" r="46" fill={gunMetalBg} stroke={primaryColor} strokeWidth="12" />

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
