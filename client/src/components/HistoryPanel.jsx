import Calendar from './calendar';

export function HistoryPanel({ history }) {
  return (
    <div className="h-full w-full">
      <Calendar data={history} />
    </div>
  );
}
