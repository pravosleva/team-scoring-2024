import * as React from 'react';

interface IAuditListIntroProps {
  title?: string;
  description?: string;
}

export const AuditListIntroSvg: React.FC<IAuditListIntroProps> = ({ 
  title = 'Application Audit Platform',
  description = 'Универсальный инструмент для автоматического аудита корпоративных приложений, выявления расхождений в биллинге и сквозной аналитики затрат.' 
}) => {
  // Фиксированная палитра для светлой темы
  const primaryColor = '#0162c8';     // Глубокий синий бренд
  const lightGreyBg = '#ededed';      // Светло-серый пастельный тон корпуса
  const textColor = '#334155';        // Цвет описания (Slate)
  const titleColor = '#0f172a';       // Цвет заголовка (Dark Slate)
  const neonOrange = '#FF8E53';       // Фирменный оранжевый неон для слова "лист"

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
      {/* 📐 ШИРОКОФОРМАТНЫЙ ВЕКТОРНЫЙ СЛОЙ С ТЕКСТОВЫМ АРТОМ И СХЕМАТИЧНЫМ КАЛЬКУЛЯТОРОМ */}
      <svg 
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

        {/* 🔤 СЛОВО "Audit" (Слева, выровнено по правому краю x=335) */}
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
          Audit
        </text>
        
        {/* 🔤 СЛОВО "лист" (Справа, горит неоном, выровнено по левому краю x=465) */}
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
          лист
        </text>

        {/* ========================================================================= */}
        {/* 🧮 МИНИМАЛИСТИЧНЫЙ КАЛЬКУЛЯТОР СО СКРУГЛЕННЫМИ КРАЯМИ В ЦЕНТРЕ ПО ОСИ (400, 175) */}
        {/* ========================================================================= */}
        <g id="central-calculator" filter="url(#text-art-shadow)">
          
          {/* Основной корпус калькулятора (Размер 92x92, отцентрирован) */}
          <rect 
            x="354" 
            y="129" 
            width="92" 
            height="92" 
            rx="12" 
            fill={lightGreyBg} 
            stroke={primaryColor} 
            strokeWidth="6" 
            strokeLinejoin="round" 
          />
          
          {/* Схематичный дисплей сверху */}
          <rect 
            x="368" 
            y="143" 
            width="64" 
            height="16" 
            rx="3" 
            fill="#ffffff" 
            stroke={primaryColor} 
            strokeWidth="2" 
          />
          
          {/* Минималистичный индикатор значения на дисплее */}
          <line x1="374" y1="151" x2="386" y2="151" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />

          {/* ⚪ 4 ЧЁТКИЕ КНОПКИ ДЕЙСТВИЙ */}
          {/* Верхний ряд кнопок */}
          <circle cx="382" cy="177" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* Левая верхняя */}
          <circle cx="418" cy="177" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* Правая верхняя */}
          
          {/* Нижний ряд кнопок */}
          <circle cx="382" cy="201" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* Левая нижняя */}
          <circle cx="418" cy="201" r="7" fill="#ffffff" stroke={primaryColor} strokeWidth="2" /> {/* Правая нижняя */}

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
