interface ClassOption {
  id: string;
  name: string;
  description: string;
}

interface ClassPickerProps {
  label: string;
  selectedClass: ClassOption;
  onClassSelect: (classOption: ClassOption) => void;
}

const ClassPicker: React.FC<ClassPickerProps> = ({ label, selectedClass, onClassSelect }) => {
  // ... rest of your existing code ...
}; 