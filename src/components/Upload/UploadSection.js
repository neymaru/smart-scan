import { useState, useEffect, useCallback } from 'react';
import './UploadSection.css';
import axios from 'axios';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCoordMode, setIsCoordMode] = useState(false);
  const [problems, setProblems] = useState([
    { id: 'supervisor', name: '감독관 확인', value: '미지정' },
    ...Array(10).fill().map((_, i) => ({
      id: `problem${i + 1}`,
      name: `문제 ${i + 1}`,
      value: '미지정'
    }))
  ]);
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [activeProblemId, setActiveProblemId] = useState(null);

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

  const handleAnalyze = async () => {
    if (!selectedImages.length) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      
      for await (const image of selectedImages) {
        const response = await fetch(image.url);
        const blob = await response.blob();
        formData.append('images', blob, image.name);
      }

      const { data } = await axios.post('http://localhost:8081/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: ({ loaded, total }) => {
          setUploadProgress(Math.round((loaded * 100) / total));
        },
        timeout: 30000,
      });

      return data;
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message ?? error.message;
      console.error('이미지 분석 실패:', errorMessage);
      throw error;
      
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const newPercent = Math.round((scale * 100 + (direction * 10)) / 10) * 10;
    setScale(Math.min(Math.max(50, newPercent), 400) / 100);
  }, [scale]);

  const handleWheelCoordMode = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (isCoordMode) return;
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

  const handleCoordToggle = () => {
    setIsCoordMode(prev => !prev);
  };

  const handleAddProblem = () => {
    setProblems(prev => {
      const lastProblemNumber = prev
        .filter(p => p.id !== 'supervisor')
        .reduce((maxNum, problem) => {
          const num = parseInt(problem.name.replace('문제 ', ''));
          return Math.max(maxNum, num);
        }, 0);

      const newProblemNumber = lastProblemNumber + 1;

      return [
        ...prev,
        {
          id: `problem${newProblemNumber}`,
          name: `문제 ${newProblemNumber}`,
          value: '미지정'
        }
      ];
    });
  };

  const handleDeleteSelected = () => {
    setProblems(prev => 
      prev.filter(problem => 
        problem.id === 'supervisor' || !selectedProblemIds.includes(problem.id)
      )
    );
    setSelectedProblemIds([]);
  };

  const handleProblemClick = (id) => {
    setActiveProblemId(id);
  };

  const handleCheckboxChange = (e, id) => {
    e.stopPropagation();
    setSelectedProblemIds(prev => {
      return prev.includes(id)
        ? prev.filter(pId => pId !== id)
        : [...prev, id];
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allProblemIds = problems
        .filter(p => p.id !== 'supervisor')
        .map(p => p.id);
      setSelectedProblemIds(allProblemIds);
    } else {
      setSelectedProblemIds([]);
    }
  };

  const handleDeleteAll = () => {
    setProblems(prev => 
      prev.filter(problem => problem.id === 'supervisor')
    );
    setSelectedProblemIds([]);
    setActiveProblemId(null);
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
      const wheelHandler = isCoordMode ? handleWheelCoordMode : handleWheel;
      imagePreview.addEventListener('wheel', wheelHandler, { passive: false });
      return () => {
        imagePreview.removeEventListener('wheel', wheelHandler);
      };
    }
  }, [isCoordMode, handleWheel, handleWheelCoordMode]);

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
            className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? `분석 중 ${uploadProgress}%` : '분석'}
          </button>
        </div>

        <div className={`error-message ${showError ? 'show' : ''}`}>
          이미지를 업로드 해주세요.
        </div>

        <div className="content-wrapper">
          <div className="left-sidebar">
            <div className="image-list">
              <h3>이미지 목록</h3>
              <div className="image-list-content">
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
            </div>
            <div className="coordinates-section">
              <h3>좌표</h3>
              <div className="coord-controls">
                <input
                  type="checkbox"
                  className="coord-checkbox"
                  onChange={handleSelectAll}
                  checked={selectedProblemIds.length === problems.length - 1}
                  indeterminate={selectedProblemIds.length > 0 && selectedProblemIds.length < problems.length - 1}
                />
                <div className="coord-controls-buttons">
                  <button 
                    className="coord-control-button"
                    onClick={handleAddProblem}
                  >
                    문제추가
                  </button>
                  <button 
                    className="coord-control-button delete"
                    onClick={() => {
                      if (selectedProblemIds.length > 0) {
                        handleDeleteSelected();
                      }
                    }}
                  >
                    선택삭제
                  </button>
                  <button 
                    className="coord-control-button delete-all"
                    onClick={handleDeleteAll}
                    disabled={problems.length <= 1}
                  >
                    전체삭제
                  </button>
                </div>
              </div>
              <div className="coordinates-content">
                {problems.map(problem => (
                  <div 
                    key={problem.id}
                    className={`coord-list-item ${activeProblemId === problem.id ? 'active' : ''}`}
                    onClick={() => handleProblemClick(problem.id)}
                  >
                    <div className="coord-item-left">
                      <input
                        type="checkbox"
                        className="coord-checkbox"
                        checked={selectedProblemIds.includes(problem.id)}
                        onChange={(e) => handleCheckboxChange(e, problem.id)}
                        disabled={problem.id === 'supervisor'}
                      />
                      <span className="coord-name">{problem.name}</span>
                    </div>
                    <span className="coord-value">{problem.value}</span>
                  </div>
                ))}
              </div>
            </div>
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
                  className={`coord-toggle-button ${isCoordMode ? 'active' : ''}`}
                  onClick={handleCoordToggle}
                >
                  <span>좌표설정 {isCoordMode ? 'ON' : 'OFF'}</span>
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
              {selectedImages.length > 0 && (
                <div 
                  className="image-container"
                  style={{
                    cursor: isCoordMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab'
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
