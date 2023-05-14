import React, { useState } from 'react';
import './styles.css';

function Tooltip(props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="tooltip-container">
      <div
        className="i-button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className='italic'>i</span>
      </div>
      {showTooltip && <div className="tooltip">{props.text}</div>}
    </div>
  );
}

export default Tooltip;
