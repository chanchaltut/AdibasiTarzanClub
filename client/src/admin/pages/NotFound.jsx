import { Link } from 'react-router-dom';
import { Empty } from '../ui';

export default function NotFound() {
  return (
    <div className="a-page">
      <Empty icon="help" title="This page doesn’t exist" action={<Link className="a-btn a-btn--primary" to="/">Go to the dashboard</Link>}>
        The link may be old. Use the menu to find what you need.
      </Empty>
    </div>
  );
}
