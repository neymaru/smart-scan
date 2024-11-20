import { useState, useRef, useEffect } from 'react';
import './UploadSection.css';

const UploadSection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileName, setFileName] = useState('이미지를 선택해주세요');
  const [showError, setShowError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedImage(URL.createObjectURL(file));
      setShowError(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 2000);
      return;
    }
    // 분석 로직
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    const currentPercent = Math.round(scale * 100);
    
    const direction = e.deltaY > 0 ? -1 : 1;
    const newPercent = Math.round((currentPercent + (direction * 10)) / 10) * 10;
    
    const clampedPercent = Math.min(Math.max(50, newPercent), 400);
    
    setScale(clampedPercent / 100);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) * 0.6;
      const newY = (e.clientY - dragStart.y) * 0.6;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleOriginalView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setFileName('이미지를 선택해주세요');
    setScale(1);
    setPosition({ x: 0, y: 0 });
    
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const imagePreview = document.querySelector('.image-preview');
    if (imagePreview) {
      imagePreview.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        imagePreview.removeEventListener('wheel', handleWheel);
      };
    }
  }, [scale, position]);

  return (
    <div className="upload-section">
      <div className="upload-container">
        <div className="input-group">
          <div className="file-input-container">
            <input
              type="file"
              id="image-upload"
              className="file-input"
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload" className="file-label">
              <span className="upload-icon">📁</span>
              <span className="file-name">{fileName}</span>
            </label>
          </div>
          <button 
            className="analyze-button"
            onClick={handleAnalyze}
          >
            <span className="button-text">분석</span>
          </button>
        </div>

        <div className={`error-message ${showError ? 'show' : ''}`}>
          이미지를 업로드 해주세요.
        </div>

        {selectedImage && (
          <>
            <div className="image-controls">
              <div className="left-controls">
                <button 
                  className="original-view-button"
                  onClick={handleOriginalView}
                >
                  <span>원본보기</span>
                </button>
                <button 
                  className="delete-image-button"
                  onClick={handleDeleteImage}
                >
                  <span>사진삭제</span>
                </button>
              </div>
              <div className="scale-indicator">
                {Math.round(scale * 100)}%
              </div>
            </div>
            
            <div className="image-preview">
              <div 
                className="image-container"
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
              >
                <img 
                  ref={imageRef}
                  src={selectedImage} 
                  alt="Preview"
                  style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
