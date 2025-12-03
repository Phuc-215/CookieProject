type Props = {
  onSignup: () => void;
};

export const Signup = ({ onSignup }: Props) => {
  return (
    <div className="p-6">
      <h1>Signup</h1>
      <button onClick={onSignup}>Signup</button>
    </div>
  );
}