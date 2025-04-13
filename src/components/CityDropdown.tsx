interface CityDropdownProps {
  label: string;
  cities: string[];
  value: string;
  onChange: (city: string) => void;
  placeholder: string;
  excludeCity?: string;
}

const CityDropdown: React.FC<CityDropdownProps> = ({
  label,
  cities,
  value,
  onChange,
  placeholder,
  excludeCity
}) => {
  // ... rest of your existing code ...
}; 