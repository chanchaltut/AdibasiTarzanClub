import { Outlet, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { SchemaProvider } from './schema';
import { FeedbackProvider, Loading } from './ui';
import Layout from './Layout';
import Login from './pages/Login';
import PasswordForm from './pages/PasswordForm';
import Dashboard from './pages/Dashboard';
import CollectionList from './pages/CollectionList';
import ItemEditor from './pages/ItemEditor';
import MediaLibrary from './pages/MediaLibrary';
import Translations from './pages/Translations';
import Users from './pages/Users';
import Activity from './pages/Activity';
import Account from './pages/Account';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

/** Signed in? Password chosen? Then the panel; otherwise the right screen to get there. */
function Gate() {
  const { loading, user, logout } = useAuth();
  if (loading) return <div className="a-center"><Loading label="Checking your sign-in…" /></div>;
  if (!user) return <Login />;
  if (user.mustChangePassword) {
    return (
      <div className="a-login">
        <div className="a-login__card a-login__card--wide">
          <h1>Welcome, {user.name.split(' ')[0]}</h1>
          <PasswordForm forced />
          <button type="button" className="a-link" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }
  return (
    <SchemaProvider>
      <Outlet />
    </SchemaProvider>
  );
}

/** A fresh editor for every item, so nothing leaks from the previous one. */
function Editor({ single }) {
  const { pathname } = useLocation();
  return <ItemEditor key={pathname} single={single} />;
}

const router = createBrowserRouter([
  {
    element: <Gate />,
    children: [{
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'c/:type', element: <CollectionList /> },
        { path: 'c/:type/new', element: <Editor /> },
        { path: 'c/:type/:id', element: <Editor /> },
        { path: 's/:key', element: <Editor single /> },
        { path: 'media', element: <MediaLibrary /> },
        { path: 'translations', element: <Translations /> },
        { path: 'users', element: <Users /> },
        { path: 'activity', element: <Activity /> },
        { path: 'account', element: <Account /> },
        { path: 'help', element: <Help /> },
        { path: '*', element: <NotFound /> },
      ],
    }],
  },
], { basename: '/admin' });

export default function App() {
  return (
    <FeedbackProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </FeedbackProvider>
  );
}
