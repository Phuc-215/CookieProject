type Props = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

export const RecipeDetail = ({ isLoggedIn, onLogout }: Props) => {
  return (
    <div className="p-6">
      <h1>Recipe Detail</h1>
      {isLoggedIn && <button onClick={onLogout}>Logout</button>}
    </div>
  );
}