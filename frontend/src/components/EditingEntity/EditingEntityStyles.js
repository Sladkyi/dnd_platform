export const colors = {
  health: '#c24545',
  defense: '#e0b84a',
  attacks: '#5060a0',
  initiative: '#3d6fa5',
  hitdice: '#8a5ac8',
  states: '#2a2a2a',
  text: '#f6f3e6',
  paper: '#e8d8c9',
  border: '#4b607f',
  accent: '#f3701e',
};

export const shojiStyle = (type, hoveredCard) => ({
  background: `linear-gradient(to bottom, rgba(232, 216, 201, 0.05), rgba(13, 15, 21, 0.9))`,
  borderRadius: '4px',
  border: `1px solid rgba(75, 96, 127, 0.25)`,
  boxShadow:
    hoveredCard === type
      ? `0 0 12px rgba(${hexToRgb(colors[type]).r}, ${hexToRgb(colors[type]).g}, ${hexToRgb(colors[type]).b}, 0.3)`
      : '0 4px 12px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  padding: '1.2rem',
  fontFamily: "'Noto Sans JP', sans-serif",
});

export const japanesePattern = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100' stroke='%23e8d8c9' stroke-width='0.3' opacity='0.1'/%3E%3C/svg%3E")`,
  opacity: 0.1,
  pointerEvents: 'none',
  zIndex: 0,
};

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export const sectionTitleStyle = (color) => ({
  color: color,
  fontSize: '1.1rem',
  fontWeight: 600,
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  borderBottom: `2px solid ${color}`,
  paddingBottom: '0.5rem',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const buttonStyle = (color) => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: colors.text,
  borderRadius: '2px',
  padding: '0.3rem 0.8rem',
  transition: 'all 0.3s ease',
  fontFamily: "'Noto Sans JP', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
});
