import { useState, useEffect, useCallback } from 'react';
import './UploadSection.css';

const UploadSection = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fileName, setFileName] = useState('이미지를 선택해주세요');
  const [showError, setShowError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageState, setImageState] = useState({
    position: { x: 0, y: 0 },
    dragStart: { x: 0, y: 0 }
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFileName(`${files.length}개의 이미지 선택됨`);
      
      const imageUrls = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        state: {
          position: { x: 0, y: 0 },
          dragStart: { x: 0, y: 0 },
          scale: 1
        }
      }));
      
      setSelectedImages(imageUrls);
      setCurrentImageIndex(0);
      setShowError(false);
      setScale(1);
      setImageState({
        position: { x: 0, y: 0 },
        dragStart: { x: 0, y: 0 }
      });
    }
  };

  const handleAnalyze = () => {
    if (!selectedImages.length) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 2000);
      return;
    }
    // 분석 로직
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const newPercent = Math.round((scale * 100 + (direction * 10)) / 10) * 10;
    setScale(Math.min(Math.max(50, newPercent), 400) / 100);
  }, [scale]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setImageState(prev => ({
      ...prev,
      dragStart: {
        x: e.clientX - prev.position.x,
        y: e.clientY - prev.position.y
      }
    }));
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setImageState(prev => ({
        ...prev,
        position: {
          x: e.clientX - prev.dragStart.x,
          y: e.clientY - prev.dragStart.y
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleOriginalView = () => {
    setScale(1);
    setImageState({
      position: { x: 0, y: 0 },
      dragStart: { x: 0, y: 0 }
    });
  };

  const handleDeleteImage = () => {
    setSelectedImages([]);
    setFileName('이미지를 선택해주세요');
    setScale(1);
    setImageState({
      position: { x: 0, y: 0 },
      dragStart: { x: 0, y: 0 }
    });
    
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageSelect = (index) => {
    setCurrentImageIndex(index);
    setScale(1);
    setImageState({
      position: { x: 0, y: 0 },
      dragStart: { x: 0, y: 0 }
    });
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
  }, [scale, imageState.position]);

  useEffect(() => {
    return () => {
      selectedImages.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [selectedImages]);

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
              multiple
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

        {selectedImages.length > 0 && (
          <div className="content-wrapper">
            <div className="image-list">
              <h3>이미지 목록</h3>
              {selectedImages.map((image, index) => (
                <div 
                  key={image.name}
                  className={`image-list-item ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => handleImageSelect(index)}
                >
                  <span className="image-number">{index + 1}</span>
                  <span className="image-name">{image.name}</span>
                </div>
              ))}
            </div>

            <div className="preview-section">
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
                    src={selectedImages[currentImageIndex].url}
                    alt={`Preview ${currentImageIndex + 1}`}
                    style={{
                      transform: `scale(${scale}) translate(${imageState.position.x}px, ${imageState.position.y}px)`,
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
