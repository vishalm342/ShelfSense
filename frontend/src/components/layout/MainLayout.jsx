import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {showHeader && <Header />}
      <main className="flex-grow pt-24">
        {children || <Outlet />}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
