import { memo } from 'react';
import './Logo.css';

const Logo = () => {
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="logo-wrapper" onClick={handleLogoClick}>
      <h1 className="logo-text">Smart Scan</h1>
    </div>
  );
};

export default memo(Logo);
