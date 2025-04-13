interface BookingFormProps {
  onClose: () => void;
  selectedTrain: Train | null;
  activeTab?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ onClose, selectedTrain, activeTab }) => {
  // ... rest of your existing code ...
}; 