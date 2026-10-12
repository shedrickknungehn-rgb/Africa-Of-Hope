import { useState } from "react";
import { Edit2, Plus, Power, Search, Trash2, X } from "lucide-react";
import type { User } from "../schoolApi";
import {
  ALL_ROLES,
  ROLE_COLORS,
  ROLE_LABELS,
  apiCreateUser,
  apiDeleteUser,
  apiUpdateUser,
} from "../schoolApi";

interface Props {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}
const emptyUser: Omit<User, "id" | "createdAt"> = {
  username: "",
  password: "",
  name: "",
  email: "",
  phone: "",
  role: "student",
};
const isSupportedRole = (role: string) =>
  ALL_ROLES.includes(role as (typeof ALL_ROLES)[number]);
const roleLabel = (role: string) =>
  ROLE_LABELS[role] || `Legacy role: ${role.replaceAll("_", " ")}`;

export default function UsersTab({ users, currentUser, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [form, setForm] = useState({ ...emptyUser });
  const [editing, setEditing] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = users.filter(
    (user) =>
      (roleFilter === "all" || user.role === roleFilter) &&
      `${user.name} ${user.username} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const openEdit = (user: User) => {
    setForm({
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      role: isSupportedRole(user.role) ? user.role : "student",
    });
    setError("");
    setEditing(user);
  };
  const save = async () => {
    if (!form.name || !form.username || !form.password)
      return setError("Name, username, and password are required.");
    setSaving(true);
    try {
      if (editing) {
        await apiUpdateUser(editing.id, form);
        setEditing(null);
      } else {
        await apiCreateUser(form);
        setAdding(false);
      }
      onRefresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save user.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (id !== currentUser.id && window.confirm("Delete this user?")) {
      await apiDeleteUser(id).catch(() => {});
      onRefresh();
    }
  };
  const toggleActivation = async (user: User) => {
    if (!isSupportedRole(user.role)) {
      setActionError(
        "Convert this legacy role to a supported academy role before activation.",
      );
      return;
    }
    setActionError("");
    try {
      await apiUpdateUser(user.id, { isActive: user.isActive === false });
      onRefresh();
    } catch (reason) {
      setActionError(
        reason instanceof Error
          ? reason.message
          : "Unable to update account activation.",
      );
    }
  };
  const Modal = ({ close, title }: { close: () => void; title: string }) => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black">{title}</h2>
          <button onClick={close}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {!isSupportedRole(editing?.role || form.role) && editing && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            This inactive legacy account must be explicitly converted to a
            supported academy role before its other details can be edited.
          </p>
        )}
        <div className="space-y-3">
          {(
            [
              { label: "Full name *", key: "name", type: "text" },
              { label: "Username *", key: "username", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "Password *", key: "password", type: "password" },
            ] as const
          ).map((field) => (
            <label
              key={field.key}
              className="block text-xs font-bold uppercase text-gray-500"
            >
              {field.label}
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(event) =>
                  setForm({ ...form, [field.key]: event.target.value })
                }
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-normal"
                disabled={Boolean(editing && !isSupportedRole(editing.role))}
              />
            </label>
          ))}
          <label className="block text-xs font-bold uppercase text-gray-500">
            Role
            <select
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as User["role"] })
              }
              className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-normal"
              disabled={editing?.id === currentUser.id}
            >
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={close}
            className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#1a6b2a] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : editing && !isSupportedRole(editing.role)
                ? "Convert role"
                : editing
                  ? "Update"
                  : "Add user"}
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div>
      {actionError && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users…"
            className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All roles</option>
          {ALL_ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setForm({ ...emptyUser });
            setError("");
            setAdding(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#1a6b2a] px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Add user
        </button>
      </div>
      <div className="space-y-3">
        {filtered.map((user) => (
          <article
            key={user.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a6b2a]/10 text-sm font-black text-[#1a6b2a]">
              {user.name
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-black text-[#0f0f0f]">{user.name}</p>
              <p className="truncate text-xs text-gray-400">
                {user.username} · {user.email}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-bold ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"}`}
            >
              {roleLabel(user.role)}
            </span>
            {user.isActive === false && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                Inactive
              </span>
            )}
            {isSupportedRole(user.role) && user.id !== currentUser.id ? (
              <button
                onClick={() => void toggleActivation(user)}
                className={`rounded-lg p-2 ${user.isActive === false ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                title={
                  user.isActive === false
                    ? "Activate account"
                    : "Deactivate account"
                }
                aria-label={
                  user.isActive === false
                    ? "Activate account"
                    : "Deactivate account"
                }
              >
                <Power className="h-4 w-4" />
              </button>
            ) : !isSupportedRole(user.role) ? (
              <span className="text-xs font-medium text-amber-700">
                Convert role to activate
              </span>
            ) : null}
            <button
              onClick={() => openEdit(user)}
              className="rounded-lg bg-blue-50 p-2 text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            {user.id !== currentUser.id && (
              <button
                onClick={() => remove(user.id)}
                className="rounded-lg bg-red-50 p-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </article>
        ))}
        {!filtered.length && (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
            No users found.
          </div>
        )}
      </div>
      {adding && <Modal title="Add user" close={() => setAdding(false)} />}
      {editing && (
        <Modal
          title={`Edit — ${editing.name}`}
          close={() => setEditing(null)}
        />
      )}
    </div>
  );
}
