export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      {children}
    </div>
  );
};
