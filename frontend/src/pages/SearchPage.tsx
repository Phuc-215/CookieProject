type SearchProps = {
  isLoggedIn: boolean;
};

export const Search = ({ isLoggedIn }: SearchProps) => {
  return <div className="p-6">Search Page — Logged in: {String(isLoggedIn)}</div>;
};