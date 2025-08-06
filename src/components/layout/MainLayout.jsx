import Sidebar from './Sidebar';
import Header from './Header';
import PageContent from './PageContent';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <PageContent>
          {children}
        </PageContent>
      </div>
    </div>
  );
};

export default MainLayout;