type Props = {
  onLogin: () => void;
};

export const Login = ({ onLogin }: Props) => {
  return (
    <div className="p-6">
      <h1>Login</h1>
      <button onClick={onLogin}>Login</button>
    </div>
  );
}