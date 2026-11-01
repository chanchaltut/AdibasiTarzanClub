import Activity from '../models/Activity.js';
import { log } from '../utils/http.js';

/** Note an action in the activity log. Never blocks or breaks the request it belongs to. */
export function record(req, { action, area = '', areaLabel = '', itemId = '', itemTitle = '' }) {
  const user = req.user;
  Activity.create({
    user: user?._id,
    userName: user?.name || '',
    action,
    area,
    areaLabel,
    itemId: itemId ? String(itemId) : '',
    itemTitle: String(itemTitle || '').slice(0, 200),
  }).catch((err) => log.warn('Activity log write failed:', err.message));
}
