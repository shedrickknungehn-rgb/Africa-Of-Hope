import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Search, X, BookOpen, RefreshCw, Check, AlertCircle } from "lucide-react";
import type { Book, Borrow, User } from "../schoolApi";
import {
  apiGetBooks, apiCreateBook, apiUpdateBook, apiDeleteBook,
  apiGetBorrows, apiCreateBorrow, apiUpdateBorrow, apiDeleteBorrow,
} from "../schoolApi";

interface Props { users: User[]; }

const BORROW_STATUS_COLORS: Record<string, string> = {
  borrowed: "bg-blue-100 text-blue-700",
  returned: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  lost: "bg-gray-100 text-gray-600",
};

const emptyBook = { title: "", author: "", isbn: "", category: "", totalCopies: 1, availableCopies: 1, description: "" };

export default function LibraryTab({ users }: Props) {
  const [subTab, setSubTab] = useState<"catalog" | "borrows">("catalog");
  const [books, setBooks] = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showBookForm, setShowBookForm] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({ ...emptyBook });
  const [bookSaving, setBookSaving] = useState(false);
  const [bookError, setBookError] = useState("");

  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowBookId, setBorrowBookId] = useState("");
  const [borrowUserId, setBorrowUserId] = useState("");
  const [borrowDueDate, setBorrowDueDate] = useState("");
  const [borrowSaving, setBorrowSaving] = useState(false);

  const [actionBorrow, setActionBorrow] = useState<Borrow | null>(null);
  const [fineInput, setFineInput] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bs, brs] = await Promise.allSettled([apiGetBooks(), apiGetBorrows()]);
      if (bs.status === "fulfilled") setBooks(bs.value);
      if (brs.status === "fulfilled") setBorrows(brs.value);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const categories = ["all", ...Array.from(new Set(books.map(b => b.category).filter(Boolean)))];

  const filteredBooks = books.filter(b => {
    const matchCat = categoryFilter === "all" || b.category === categoryFilter;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()) || b.isbn.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredBorrows = borrows.filter(b => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch = !search || b.bookTitle.toLowerCase().includes(search.toLowerCase()) || b.userName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openAddBook = () => { setBookForm({ ...emptyBook }); setBookError(""); setEditBook(null); setShowBookForm(true); };
  const openEditBook = (b: Book) => {
    setBookForm({ title: b.title, author: b.author, isbn: b.isbn, category: b.category, totalCopies: b.totalCopies, availableCopies: b.availableCopies, description: b.description });
    setBookError(""); setEditBook(b); setShowBookForm(true);
  };

  const saveBook = async () => {
    if (!bookForm.title) { setBookError("Title is required"); return; }
    setBookSaving(true); setBookError("");
    try {
      if (editBook) {
        const updated = await apiUpdateBook(editBook.id, bookForm);
        setBooks(prev => prev.map(b => b.id === editBook.id ? updated : b));
        setEditBook(null);
      } else {
        const created = await apiCreateBook(bookForm);
        setBooks(prev => [...prev, created]);
      }
      setShowBookForm(false);
    } catch (e) { setBookError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setBookSaving(false); }
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    try { await apiDeleteBook(id); setBooks(prev => prev.filter(b => b.id !== id)); } catch { }
  };

  const saveBorrow = async () => {
    if (!borrowBookId || !borrowUserId || !borrowDueDate) return;
    setBorrowSaving(true);
    try {
      const created = await apiCreateBorrow({ bookId: borrowBookId, userId: borrowUserId, dueDate: borrowDueDate });
      setBorrows(prev => [created, ...prev]);
      setBooks(prev => prev.map(b => b.id === borrowBookId ? { ...b, availableCopies: b.availableCopies - 1 } : b));
      setShowBorrowForm(false); setBorrowBookId(""); setBorrowUserId(""); setBorrowDueDate("");
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to create borrow"); }
    finally { setBorrowSaving(false); }
  };

  const markReturned = async (borrow: Borrow) => {
    try {
      const updated = await apiUpdateBorrow(borrow.id, { status: "returned", fineAmount: fineInput || "0" });
      setBorrows(prev => prev.map(b => b.id === borrow.id ? updated : b));
      setBooks(prev => prev.map(b => b.id === borrow.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b));
      setActionBorrow(null); setFineInput("");
    } catch { }
  };

  const updateBorrowStatus = async (borrow: Borrow, status: string) => {
    try {
      const updated = await apiUpdateBorrow(borrow.id, { status });
      setBorrows(prev => prev.map(b => b.id === borrow.id ? updated : b));
    } catch { }
  };

  const deleteBorrow = async (id: string) => {
    try { await apiDeleteBorrow(id); setBorrows(prev => prev.filter(b => b.id !== id)); loadAll(); } catch { }
  };

  const isOverdue = (b: Borrow) => b.status === "borrowed" && new Date(b.dueDate) < new Date();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          {(["catalog", "borrows"] as const).map(t => (
            <button key={t} onClick={() => { setSubTab(t); setSearch(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${subTab === t ? "bg-[#1a6b2a] text-white" : "bg-white text-gray-500 hover:text-[#1a6b2a] shadow-sm"}`}>
              {t === "catalog" ? `Catalog (${books.length})` : `Borrows (${borrows.filter(b => b.status === "borrowed").length} active)`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} disabled={loading} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a6b2a] transition-colors disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {subTab === "catalog" && (
            <button onClick={openAddBook} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />Add Book
            </button>
          )}
          {subTab === "borrows" && (
            <button onClick={() => { setShowBorrowForm(true); setBorrowBookId(""); setBorrowUserId(""); setBorrowDueDate(""); }}
              className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />Issue Book
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={subTab === "catalog" ? "Search books…" : "Search borrows…"}
            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1a6b2a] focus:outline-none" />
        </div>
        {subTab === "catalog" && categories.length > 1 && (
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none bg-white">
            {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
        )}
        {subTab === "borrows" && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none bg-white">
            {["all", "borrowed", "returned", "overdue", "lost"].map(s => (
              <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[#1a6b2a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subTab === "catalog" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[#0f0f0f] text-sm leading-tight">{b.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{b.author || "Unknown Author"}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEditBook(b)} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => deleteBook(b.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {b.category && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{b.category}</span>}
                {b.isbn && <span className="text-[10px] text-gray-400 font-mono">ISBN: {b.isbn}</span>}
              </div>
              {b.description && <p className="text-xs text-gray-400 line-clamp-2">{b.description}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-black text-[#0d3d1a]">{b.availableCopies}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-gray-400">{b.totalCopies}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-black ${b.availableCopies === 0 ? "text-red-500" : "text-green-600"}`}>{b.availableCopies > 0 ? "In Stock" : "All Out"}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Status</p>
                </div>
              </div>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-12 shadow-sm text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 font-bold">No books found.</p>
              <button onClick={openAddBook} className="mt-4 text-[#1a6b2a] text-sm font-bold hover:underline">Add the first book →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f7f5f0] border-b border-gray-100">
                {["Book", "Borrower", "Issued", "Due", "Returned", "Fine", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase px-4 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredBorrows.map(b => {
                  const overdue = isOverdue(b);
                  return (
                    <tr key={b.id} className={`border-b border-gray-50 last:border-0 ${overdue ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 font-bold text-[#0f0f0f] max-w-[160px]"><p className="truncate">{b.bookTitle}</p></td>
                      <td className="px-4 py-3 text-gray-600 max-w-[120px]"><p className="truncate">{b.userName}</p></td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{new Date(b.borrowedDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className={overdue ? "text-red-600 font-bold" : "text-gray-400"}>{new Date(b.dueDate).toLocaleDateString()}</span>
                        {overdue && <span className="ml-1 text-[9px] bg-red-100 text-red-600 font-black px-1 rounded">OVERDUE</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{b.returnedDate ? new Date(b.returnedDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {parseFloat(b.fineAmount) > 0 ? <span className="text-red-600 font-bold">${parseFloat(b.fineAmount).toFixed(2)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${BORROW_STATUS_COLORS[overdue ? "overdue" : b.status] || "bg-gray-100 text-gray-600"}`}>
                          {overdue ? "overdue" : b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {b.status === "borrowed" && (
                            <button onClick={() => { setActionBorrow(b); setFineInput(b.fineAmount); }}
                              title="Mark returned" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          {b.status === "borrowed" && (
                            <button onClick={() => updateBorrowStatus(b, "lost")} title="Mark lost"
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center">
                              <AlertCircle className="w-3 h-3" />
                            </button>
                          )}
                          <button onClick={() => deleteBorrow(b.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredBorrows.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No borrow records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBookForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg text-[#0f0f0f]">{editBook ? "Edit Book" : "Add Book"}</h3>
              <button onClick={() => setShowBookForm(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {bookError && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 rounded-lg p-2">{bookError}</p>}
            <div className="space-y-3">
              {[
                { label: "Title *", key: "title", ph: "e.g. Introduction to Computing" },
                { label: "Author", key: "author", ph: "e.g. John Smith" },
                { label: "ISBN", key: "isbn", ph: "e.g. 978-0-12345-678-9" },
                { label: "Category", key: "category", ph: "e.g. Science, Mathematics, Fiction" },
                { label: "Description", key: "description", ph: "Brief description of the book…" },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                  <input type="text" placeholder={ph} value={String((bookForm as Record<string, string | number>)[key])}
                    onChange={e => setBookForm({ ...bookForm, [key]: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Total Copies</label>
                  <input type="number" min={1} value={bookForm.totalCopies}
                    onChange={e => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
                </div>
                {editBook && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Available Now</label>
                    <input type="number" min={0} max={bookForm.totalCopies} value={bookForm.availableCopies}
                      onChange={e => setBookForm({ ...bookForm, availableCopies: Number(e.target.value) })}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBookForm(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={saveBook} disabled={bookSaving} className="flex-1 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
                {bookSaving ? "Saving…" : editBook ? "Update Book" : "Add Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBorrowForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg text-[#0f0f0f]">Issue Book</h3>
              <button onClick={() => setShowBorrowForm(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Book *</label>
                <select value={borrowBookId} onChange={e => setBorrowBookId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                  <option value="">Select book…</option>
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Borrower *</label>
                <select value={borrowUserId} onChange={e => setBorrowUserId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none">
                  <option value="">Select user…</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Due Date *</label>
                <input type="date" value={borrowDueDate} onChange={e => setBorrowDueDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBorrowForm(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={saveBorrow} disabled={!borrowBookId || !borrowUserId || !borrowDueDate || borrowSaving}
                className="flex-1 bg-[#1a6b2a] disabled:bg-gray-200 text-white font-black py-3 rounded-xl text-sm">
                {borrowSaving ? "Issuing…" : "Issue Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionBorrow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-[#0f0f0f]">Mark Returned</h3>
              <button onClick={() => setActionBorrow(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Returning <span className="font-bold text-[#0f0f0f]">{actionBorrow.bookTitle}</span> borrowed by{" "}
              <span className="font-bold">{actionBorrow.userName}</span>.
              Due: <span className={`font-mono font-bold ${isOverdue(actionBorrow) ? "text-red-600" : "text-gray-600"}`}>{new Date(actionBorrow.dueDate).toLocaleDateString()}</span>
              {isOverdue(actionBorrow) && <span className="ml-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">OVERDUE</span>}
            </p>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Fine Amount ($ — enter 0 if none)</label>
              <input type="number" min={0} step="0.01" value={fineInput} onChange={e => setFineInput(e.target.value)} placeholder="0.00"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a6b2a] focus:outline-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setActionBorrow(null)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={() => markReturned(actionBorrow)} className="flex-1 bg-[#1a6b2a] text-white font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
