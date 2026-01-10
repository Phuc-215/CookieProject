type PublicProfileProps = {
  isLoggedIn: boolean;
};

export const PublicProfile = ({ isLoggedIn }: PublicProfileProps) => {
  return (
    <div className="p-6">
      Public Profile — Logged in: {String(isLoggedIn)}
    </div>
  );
};