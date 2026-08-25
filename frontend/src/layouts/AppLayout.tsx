import { Outlet } from 'react-router';

function AppLayout() {
  return (
    <div className="min-h-screen">
      <header>
        <h1>YumYard</h1>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;