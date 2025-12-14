"use client"

import { useEffect, useMemo } from "react"

// Generate particles outside component to ensure consistency
function generateParticles() {
  return Array.from({ length: 25 }).map((_, i) => {
    const angle = (360 / 25) * i // Even distribution around circle
    const delay = i * 0.15
    const duration = 18 + (i % 6) * 2 // Varying durations 18-28s
    const size = 150 + (i % 4) * 80 // Varying sizes 150-470px (MUCH larger)
    const distance = 150 + (i % 5) * 20 // Varying distance 150-230vh
    
    // Calculate end position using trigonometry
    const radians = (angle * Math.PI) / 180
    const endX = Math.cos(radians) * distance
    const endY = Math.sin(radians) * distance
    
    return {
      angle,
      delay,
      duration,
      size,
      endX,
      endY,
      opacity: 0.6 + (i % 3) * 0.2, // Varying opacity 0.6-1.0 (MUCH more visible - almost solid)
    }
  })
}

export function BackgroundAnimation() {
  const particles = useMemo(() => generateParticles(), [])

  // Inject keyframes dynamically
  useEffect(() => {
    const styleId = 'background-animation-styles'
    let style = document.getElementById(styleId) as HTMLStyleElement
    
    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }
    
    style.textContent = particles.map((particle, i) => {
      return `
        @keyframes float-particle-${i} {
          0% {
            transform: translate(-50%, -50%) translate(0, 0);
            opacity: 0;
          }
          5% {
            opacity: ${particle.opacity};
          }
          95% {
            opacity: ${particle.opacity};
          }
          100% {
            transform: translate(-50%, -50%) translate(${particle.endX}vw, ${particle.endY}vh);
            opacity: 0;
          }
        }
      `
    }).join('\n')
    
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [particles])

  // Debug: Log to verify component is rendering
  useEffect(() => {
    console.log('[BackgroundAnimation] Component mounted with', particles.length, 'particles')
  }, [particles.length])

  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none" 
      style={{ 
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Floating particles from center */}
      {particles.map((particle, i) => {
        // Use VERY visible colors - bright and obvious
        const baseOpacity = 0.3 // Much higher base opacity
        
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `float-particle-${i} ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              opacity: particle.opacity,
              willChange: 'transform, opacity',
              background: `radial-gradient(circle, rgba(99, 102, 241, ${baseOpacity * particle.opacity}) 0%, rgba(139, 92, 246, ${baseOpacity * particle.opacity * 0.8}) 30%, rgba(168, 85, 247, ${baseOpacity * particle.opacity * 0.5}) 60%, rgba(99, 102, 241, ${baseOpacity * particle.opacity * 0.2}) 100%)`,
              boxShadow: `0 0 ${particle.size * 1.5}px rgba(99, 102, 241, ${baseOpacity * particle.opacity}), 0 0 ${particle.size * 2.5}px rgba(139, 92, 246, ${baseOpacity * particle.opacity * 0.6})`,
              filter: 'blur(40px)',
              zIndex: 0,
            }}
          />
        )
      })}
    </div>
  )
}

