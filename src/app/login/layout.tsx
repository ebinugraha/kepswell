const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center h-screen">
      {children}
    </div>
  );
};

export default AuthLayout;
