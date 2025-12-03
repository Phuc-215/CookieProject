type Props = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

export const HomeFeed = ({ isLoggedIn, onLogout }: Props) => {
  return (
    <div className="p-6">
      <h1>Home Feed</h1>
      {isLoggedIn && <button onClick={onLogout}>Logout</button>}
    </div>
  );
}
