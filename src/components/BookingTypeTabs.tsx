interface BookingTypeTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const BookingTypeTabs: React.FC<BookingTypeTabsProps> = ({ activeTab, onTabChange }) => {
  // ... rest of your existing code ...
}; 