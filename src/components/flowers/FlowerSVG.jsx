import { motion } from 'framer-motion'

export default function FlowerSVG({ type = 'Tulip', progress = 0, isWilted = false }) {
  // Flower Colors mapping
  const colors = {
    Sunflower: { petals: '#facc15', center: '#78350f', stem: '#22c55e', leaf: '#15803d', shape: 'Sunflower' },
    Rose: { petals: '#f43f5e', center: '#be123c', stem: '#16a34a', leaf: '#166534', shape: 'Rose' },
    Lavender: { petals: '#a855f7', center: '#7e22ce', stem: '#22c55e', leaf: '#15803d', shape: 'Lavender' },
    Orchid: { petals: '#ec4899', center: '#c084fc', stem: '#22c55e', leaf: '#15803d', shape: 'Orchid' },
    Tulip: { petals: '#fb923c', center: '#ea580c', stem: '#22c55e', leaf: '#15803d', shape: 'Tulip' },
    // New species
    Lotus: { petals: '#f472b6', center: '#f43f5e', stem: '#22c55e', leaf: '#15803d', shape: 'Orchid' },
    Marigold: { petals: '#f59e0b', center: '#78350f', stem: '#22c55e', leaf: '#15803d', shape: 'Sunflower' },
    Lily: { petals: '#f8fafc', center: '#e2e8f0', stem: '#22c55e', leaf: '#15803d', shape: 'Tulip' },
    Hydrangea: { petals: '#60a5fa', center: '#2563eb', stem: '#22c55e', leaf: '#15803d', shape: 'Lavender' },
    Hibiscus: { petals: '#ef4444', center: '#b91c1c', stem: '#22c55e', leaf: '#15803d', shape: 'Rose' }
  }

  const activeColor = colors[type] || colors.Tulip
  const shapeType = colors[type]?.shape || type

  // Wilting filters
  const filterStyle = isWilted
    ? 'filter grayscale(60%) brightness(75%) saturate(50%) contrast(90%)'
    : ''

  // Stem and Soil (Common for most growth stages >= 10%)
  const renderStemAndSoil = (height = 60) => (
    <>
      {/* Soil / Pot */}
      <ellipse cx="100" cy="180" rx="45" ry="12" fill="#7c2d12" />
      <path d="M60 178 L70 205 Q100 215 130 205 L140 178 Z" fill="#451a03" />
      
      {progress >= 10 && (
        /* Stem */
        <path
          d={`M100 180 Q98 ${180 - height / 2} 100 ${180 - height}`}
          stroke={activeColor.stem}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500"
        />
      )}
    </>
  )

  // Leaves (Stage >= 25%)
  const renderLeaves = (stemHeight = 60) => {
    if (progress < 25) return null
    const leafY = 180 - stemHeight / 3
    return (
      <g className="transition-all duration-500">
        {/* Left Leaf */}
        <path
          d={`M100 ${leafY} Q75 ${leafY - 10} 70 ${leafY - 5} Q85 ${leafY + 10} 100 ${leafY}`}
          fill={activeColor.leaf}
        />
        {/* Right Leaf */}
        <path
          d={`M100 ${leafY - 10} Q125 ${leafY - 20} 130 ${leafY - 15} Q115 ${leafY} 100 ${leafY - 10}`}
          fill={activeColor.leaf}
        />
      </g>
    )
  }

  // Helper to render flower heads by type
  const renderFlowerHead = (yCoord) => {
    if (progress < 50) return null

    // Stages: Bud (50-74%), Nearly Bloomed (75-99%), Bloomed (100%)
    const scale = progress >= 100 ? 1 : progress >= 75 ? 0.75 : 0.45

    return (
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        style={{ originX: '100px', originY: `${yCoord}px` }}
        className="transition-all duration-500"
      >
        {shapeType === 'Sunflower' && (
          <g>
            {/* Petals layer */}
            {progress >= 100 ? (
              // 12 Outer petals
              Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12
                return (
                  <ellipse
                    key={i}
                    cx="100"
                    cy={yCoord - 28}
                    rx="10"
                    ry="28"
                    fill={activeColor.petals}
                    transform={`rotate(${angle}, 100, ${yCoord})`}
                  />
                )
              })
            ) : (
              // Closed Yellow Petal Bunch
              <path
                d={`M85 ${yCoord} Q100 ${yCoord - 35} 115 ${yCoord} Q100 ${yCoord + 15} 85 ${yCoord}`}
                fill={activeColor.petals}
              />
            )}
            {/* Center Disk */}
            <circle cx="100" cy={yCoord} r={progress >= 100 ? 16 : 8} fill={activeColor.center} />
          </g>
        )}

        {shapeType === 'Rose' && (
          <g>
            {progress >= 100 ? (
              // Open Rose Petals
              <g>
                <circle cx="100" cy={yCoord} r="25" fill={activeColor.petals} />
                <path d={`M82 ${yCoord} Q100 ${yCoord - 30} 118 ${yCoord}`} fill={activeColor.center} opacity="0.8" />
                <circle cx="100" cy={yCoord} r="18" fill={activeColor.petals} />
                <path d={`M88 ${yCoord} Q100 ${yCoord - 22} 112 ${yCoord}`} fill={activeColor.center} />
                <circle cx="100" cy={yCoord} r="10" fill={activeColor.center} />
              </g>
            ) : (
              // Closed Rose Bud
              <path
                d={`M88 ${yCoord + 10} Q75 ${yCoord - 15} 100 ${yCoord - 25} Q125 ${yCoord - 15} 112 ${yCoord + 10} Z`}
                fill={activeColor.petals}
              />
            )}
            {/* Rose sepals at bottom of bud */}
            <path d={`M88 ${yCoord + 8} L100 ${yCoord + 18} L112 ${yCoord + 8} Q100 ${yCoord + 5} 88 ${yCoord + 8}`} fill={activeColor.stem} />
          </g>
        )}

        {shapeType === 'Lavender' && (
          <g>
            {/* Lavender nodes ascending */}
            <g transform={`translate(0, ${yCoord - 70})`}>
              <ellipse cx="100" cy="70" rx="8" ry="12" fill={activeColor.petals} />
              <ellipse cx="92" cy="75" rx="10" ry="6" fill={activeColor.petals} transform="rotate(-30, 92, 75)" />
              <ellipse cx="108" cy="75" rx="10" ry="6" fill={activeColor.petals} transform="rotate(30, 108, 75)" />
              
              {progress >= 75 && (
                <>
                  <ellipse cx="100" cy="50" rx="7" ry="10" fill={activeColor.petals} />
                  <ellipse cx="94" cy="53" rx="8" ry="5" fill={activeColor.petals} transform="rotate(-30, 94, 53)" />
                  <ellipse cx="106" cy="53" rx="8" ry="5" fill={activeColor.petals} transform="rotate(30, 106, 53)" />
                </>
              )}
              {progress >= 100 && (
                <>
                  <ellipse cx="100" cy="30" rx="6" ry="8" fill={activeColor.petals} />
                  <ellipse cx="95" cy="32" rx="6" ry="4" fill={activeColor.petals} transform="rotate(-30, 95, 32)" />
                  <ellipse cx="105" cy="32" rx="6" ry="4" fill={activeColor.petals} transform="rotate(30, 105, 32)" />
                  <circle cx="100" cy="15" r="4" fill={activeColor.petals} />
                </>
              )}
            </g>
          </g>
        )}

        {shapeType === 'Orchid' && (
          <g>
            {progress >= 100 ? (
              // Open Orchid shape
              <g>
                {/* 3 Outer Sepals */}
                <path d={`M100 ${yCoord} L75 ${yCoord - 25} L100 ${yCoord - 35} Z`} fill={activeColor.petals} />
                <path d={`M100 ${yCoord} L125 ${yCoord - 25} L100 ${yCoord - 35} Z`} fill={activeColor.petals} />
                <path d={`M100 ${yCoord} L100 ${yCoord + 30} L85 ${yCoord + 15} Z`} fill={activeColor.petals} />
                <path d={`M100 ${yCoord} L100 ${yCoord + 30} L115 ${yCoord + 15} Z`} fill={activeColor.petals} />
                {/* 2 Wide Petals */}
                <ellipse cx="80" cy={yCoord} rx="16" ry="12" fill={activeColor.petals} transform={`rotate(-15, 80, ${yCoord})`} />
                <ellipse cx="120" cy={yCoord} rx="16" ry="12" fill={activeColor.petals} transform={`rotate(15, 120, ${yCoord})`} />
                {/* Center Lip */}
                <circle cx="100" cy={yCoord} r="7" fill={activeColor.center} />
                <path d={`M95 ${yCoord + 2} Q100 ${yCoord + 12} 105 ${yCoord + 2}`} fill={activeColor.center} />
              </g>
            ) : (
              // Closed Orchid Bud
              <ellipse cx="100" cy={yCoord} rx="10" ry="16" fill={activeColor.petals} />
            )}
          </g>
        )}

        {shapeType === 'Tulip' && (
          <g>
            {progress >= 100 ? (
              // Opened Tulip petals
              <g>
                <path d={`M78 ${yCoord + 15} Q72 ${yCoord - 20} 92 ${yCoord - 25} Q100 ${yCoord - 5} 78 ${yCoord + 15}`} fill={activeColor.petals} />
                <path d={`M122 ${yCoord + 15} Q128 ${yCoord - 20} 108 ${yCoord - 25} Q100 ${yCoord - 5} 122 ${yCoord + 15}`} fill={activeColor.petals} />
                <path d={`M82 ${yCoord + 20} Q100 ${yCoord - 32} 118 ${yCoord + 20} Q100 ${yCoord + 5} 82 ${yCoord + 20}`} fill={activeColor.center} />
              </g>
            ) : (
              // Simple Tulip Bud
              <path
                d={`M82 ${yCoord + 10} Q75 ${yCoord - 20} 100 ${yCoord - 25} Q125 ${yCoord - 20} 118 ${yCoord + 10} Q100 ${yCoord + 20} 82 ${yCoord + 10}`}
                fill={activeColor.petals}
              />
            )}
          </g>
        )}
      </motion.g>
    )
  }

  // Draw the full scene depending on growth progress
  return (
    <svg
      viewBox="0 0 200 240"
      className={`w-full h-full object-contain transition-all duration-300 ${filterStyle} ${
        isWilted ? 'wilt' : ''
      }`}
    >
      {progress === 0 ? (
        // Stage 1: Seed / Soil only
        <>
          <ellipse cx="100" cy="180" rx="45" ry="12" fill="#7c2d12" />
          <path d="M60 178 L70 205 Q100 215 130 205 L140 178 Z" fill="#451a03" />
          <circle cx="100" cy="175" r="3" fill="#15803d" opacity="0.7" />
        </>
      ) : progress < 25 ? (
        // Stage 2: Sprout (tiny shoot)
        <g className="animate-sprout">
          {renderStemAndSoil(25)}
        </g>
      ) : progress < 50 ? (
        // Stage 3: Small plant (leaves emerge)
        <g className="animate-sprout">
          {renderStemAndSoil(55)}
          {renderLeaves(55)}
        </g>
      ) : progress < 75 ? (
        // Stage 4: Bud forming
        <g>
          {renderStemAndSoil(80)}
          {renderLeaves(80)}
          {renderFlowerHead(100)}
        </g>
      ) : progress < 100 ? (
        // Stage 5: Nearly Bloomed
        <g>
          {renderStemAndSoil(100)}
          {renderLeaves(100)}
          {renderFlowerHead(80)}
        </g>
      ) : (
        // Stage 6: Full Bloom
        <g className="animate-bloom">
          {renderStemAndSoil(110)}
          {renderLeaves(110)}
          {renderFlowerHead(70)}
        </g>
      )}
    </svg>
  )
}
