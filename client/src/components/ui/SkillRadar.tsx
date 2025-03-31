import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SkillRadarProps {
  skills: {
    name: string;
    value: number;
    color?: string;
  }[];
  size?: number;
  className?: string;
  animate?: boolean;
  strokeWidth?: number;
  labelSize?: number;
}

export default function SkillRadar({
  skills,
  size = 300,
  className = '',
  animate = true,
  strokeWidth = 1.5,
  labelSize = 12,
}: SkillRadarProps) {
  const [points, setPoints] = useState<string[]>([]);
  const [center] = useState({ x: size / 2, y: size / 2 });
  const [radius] = useState(size * 0.4);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const anglePer = (Math.PI * 2) / skills.length;
    
    const generatePoints = (scale = 1) => {
      return skills.map((skill, i) => {
        const angle = i * anglePer - Math.PI / 2; // Start from top
        const normalizedValue = skill.value / 100;
        const distance = normalizedValue * radius * scale;
        const x = center.x + Math.cos(angle) * distance;
        const y = center.y + Math.sin(angle) * distance;
        return `${x},${y}`;
      });
    };

    // Generate full radar points
    setPoints(generatePoints(1));
  }, [skills, center, radius, isClient]);

  // Base rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1].map(scale => {
    const ringPoints = [];
    const segments = 40; // More segments = smoother circle
    const anglePerSegment = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
      const angle = i * anglePerSegment - Math.PI / 2;
      const distance = radius * scale;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;
      ringPoints.push(`${x},${y}`);
    }
    
    return ringPoints.join(' ');
  });

  // Axis lines
  const axes = skills.map((_, i) => {
    const angle = i * ((Math.PI * 2) / skills.length) - Math.PI / 2;
    const x2 = center.x + Math.cos(angle) * radius;
    const y2 = center.y + Math.sin(angle) * radius;
    return { x1: center.x, y1: center.y, x2, y2 };
  });

  // Label positions
  const labels = skills.map((skill, i) => {
    const angle = i * ((Math.PI * 2) / skills.length) - Math.PI / 2;
    const distance = radius * 1.15; // Slightly outside the circle
    const x = center.x + Math.cos(angle) * distance;
    const y = center.y + Math.sin(angle) * distance;
    
    // Calculate text anchor based on position
    let textAnchor = 'middle';
    if (angle > Math.PI / 4 && angle < Math.PI * 3 / 4) {
      textAnchor = 'start';
    } else if (angle > Math.PI * 5 / 4 && angle < Math.PI * 7 / 4) {
      textAnchor = 'end';
    }
    
    return { x, y, textAnchor, name: skill.name, color: skill.color || 'var(--accent-color)' };
  });

  if (!isClient) return null;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background rings */}
        {rings.map((ring, index) => (
          <motion.polygon
            key={`ring-${index}`}
            points={ring}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-gray-300 dark:text-gray-700"
            opacity={0.4}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.1 * index,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          />
        ))}
        
        {/* Axes */}
        {axes.map((axis, i) => (
          <motion.line
            key={`axis-${i}`}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-gray-300 dark:text-gray-700"
            strokeDasharray="2,2"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.6, pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
          />
        ))}
        
        {/* Skill area */}
        <motion.polygon
          points={points.join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary fill-primary/10"
          initial={{ opacity: 0, scale: 0 }}
          animate={animate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1,
            delay: 0.8,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        />
        
        {/* Skill points */}
        {points.map((point, i) => {
          const [x, y] = point.split(',').map(Number);
          return (
            <motion.circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill={skills[i].color || 'var(--accent-color)'}
              className="text-primary"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 1 + i * 0.1,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            />
          );
        })}
        
        {/* Labels */}
        {labels.map((label, i) => (
          <motion.text
            key={`label-${i}`}
            x={label.x}
            y={label.y}
            textAnchor={label.textAnchor}
            dominantBaseline="middle"
            fontSize={labelSize}
            fill={label.color}
            className="font-medium pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
          >
            {label.name}
          </motion.text>
        ))}
      </svg>
    </div>
  );
}