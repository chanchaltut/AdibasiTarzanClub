import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Club from './pages/Club';
import Schedule from './pages/Schedule';
import News from './pages/News';
import Article from './pages/Article';
import Squad from './pages/Squad';
import Committee from './pages/Committee';
import Gallery from './pages/Gallery';
import Membership from './pages/Membership';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="club" element={<Club />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<Article />} />
          <Route path="squad" element={<Squad />} />
          <Route path="committee" element={<Committee />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="membership" element={<Membership />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
