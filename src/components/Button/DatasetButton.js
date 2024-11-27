import './DatasetButton.css';

const DatasetButton = ({ onClick }) => {
  return (
    <div className="dataset-button-wrapper" onClick={onClick}>
      <span className="dataset-button-text">데이터셋 생성</span>
    </div>
  );
};

export default DatasetButton;
