import { useState } from 'react';
import Logo from '../Logo/Logo';
import DatasetButton from '../Button/DatasetButton';
import DatasetModal from '../Modal/DatasetModal';
import './Header.css';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDatasetClick = () => {
    setIsModalOpen(true);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Logo />
        <DatasetButton onClick={handleDatasetClick} />
      </div>
      <DatasetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
