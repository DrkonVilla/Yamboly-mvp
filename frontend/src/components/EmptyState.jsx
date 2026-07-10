import { InboxIcon } from '@heroicons/react/24/outline';

export const EmptyState = ({ title = 'No hay datos', message = 'Aún no hay registros para mostrar', action }) => (
  <div className="text-center py-16">
    <InboxIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-700">{title}</h3>
    <p className="text-gray-400 mt-1">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);