/**
 * Componente wrapper para o conteúdo principal da página
 */
const PageContent = ({ children }) => {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {children}
    </main>
  );
};

export default PageContent
