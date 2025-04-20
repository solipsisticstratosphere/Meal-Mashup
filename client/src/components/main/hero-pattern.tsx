export function HeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-rose-100 opacity-50"></div>
      <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-fuchsia-100 opacity-60"></div>

      <div className="absolute -left-20 top-1/3 w-60 h-60 rounded-full bg-amber-100 opacity-40"></div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZGJhNzQiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIG9wYWNpdHk9IjAuMiIgc3Ryb2tlLWRhc2hhcnJheT0iMTAgMTAiPjxwYXRoIGQ9Ik0zMCAwdjYwTTYwIDMwSDBNNTQgNmwtNDggNDhNNiA2bDQ4IDQ4Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
    </div>
  );
}
