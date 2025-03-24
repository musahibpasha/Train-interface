const SearchButton = ({ onClick }) => {
  return (
    <button
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md text-lg transition-colors shadow-md"
      onClick={onClick}
    >
      SEARCH
    </button>
  );
};

export default SearchButton;
