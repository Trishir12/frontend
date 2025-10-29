export default function Pagination({ page, total, pageSize, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center gap-2 justify-center my-6">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={page <= 1}
        onClick={()=>onPage(page - 1)}
      >Prev</button>
      <span className="text-sm">Page {page} / {pages}</span>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={page >= pages}
        onClick={()=>onPage(page + 1)}
      >Next</button>
    </div>
  );
}
