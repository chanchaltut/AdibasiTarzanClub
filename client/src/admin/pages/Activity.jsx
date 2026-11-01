import { useEffect, useState } from 'react';
import { api } from '../api';
import { Button, Icon, Loading, Notice } from '../ui';
import { ActivityLine } from './Dashboard';

export default function Activity() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  useEffect(() => { api(`/admin/activity?page=${page}`).then(setData).catch((e) => setError(e.message)); }, [page]);
  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1><Icon name="activity" size={26} /> Activity log</h1>
          <p className="a-page__desc">Who changed what, and when. Kept for one year.</p>
        </div>
      </header>
      {error && <Notice kind="error">{error}</Notice>}
      {!data && !error && <Loading />}
      {data && (
        <section className="a-card">
          {data.items.length ? <ul className="a-activity">{data.items.map((a) => <ActivityLine key={a._id} a={a} />)}</ul> : <p className="a-muted">Nothing has happened yet.</p>}
          {data.pages > 1 && (
            <nav className="a-pager">
              <Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Newer</Button>
              <span>Page {page} of {data.pages}</span>
              <Button size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Older</Button>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
