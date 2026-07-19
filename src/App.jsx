import AppRoutes from './routes/AppRoutes';

/**
 * ============================================================
 * ROOT APPLICATION COMPONENT
 * Sets up global styling and renders the routing engine.
 * Future global context providers (Auth, Theme, Toast) will wrap
 * the AppRoutes component here.
 * ============================================================
 */
function App() {
  return (
    <AppRoutes />
  );
}

export default App;
