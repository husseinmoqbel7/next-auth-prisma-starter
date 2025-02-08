import Navbar from "./_components/navbar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full flex flex-col gap-y-10 justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-purple-800">
      <Navbar />
      {children}
    </div>
  );
};

export default ProtectedLayout;
