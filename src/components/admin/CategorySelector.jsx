import React from 'react';
import { apiService } from '../../services/api.js';

export default function CategorySelector({ value, onChange, onChangeDetail, className = '' }) {
  const [cats, setCats] = React.useState([]);
  const [parentId, setParentId] = React.useState('');
  const [childId, setChildId] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const tree = await apiService.getCategories();
        setCats(Array.isArray(tree) ? tree : []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    })();
  }, []);

  // Helper to emit detailed selection info
  const emitDetail = React.useCallback(
    (parent, child) => {
      if (typeof onChangeDetail === 'function') {
        onChangeDetail({
          parentId: parent?.id ?? null,
          parentName: parent?.name ?? null,
          childId: child?.id ?? null,
          childName: child?.name ?? null,
          effectiveId: child?.id ?? parent?.id ?? null,
        });
      }
    },
    [onChangeDetail],
  );

  // Initialize from value
  React.useEffect(() => {
    if (!value || !cats.length) return;

    const all = [];
    const dfs = (n) => {
      all.push(n);
      (n.children || []).forEach(dfs);
    };
    cats.forEach(dfs);
    let found = all.find((n) => n.id === value || String(n.id) === String(value));

    if (!found) {
      // fallback: find parent whose child matches value
      const parent = cats.find((p) =>
        (p.children || []).some((c) => String(c.id) === String(value)),
      );
      if (parent) {
        setParentId(String(parent.id));
        const child = parent.children.find((c) => String(c.id) === String(value));
        if (child) {
          setChildId(String(child.id));
          emitDetail(parent, child);
        }
        return;
      }
    }
    if (found) {
      if (found.parentId) {
        setParentId(String(found.parentId));
        setChildId(String(found.id));
        const parent = cats.find((p) => p.id === found.parentId);
        emitDetail(parent, found);
      } else {
        // Top-level category selected directly
        setParentId(String(found.id));
        setChildId('');
        if (onChange) onChange(Number(found.id));
        emitDetail(found, null);
      }
    }
  }, [value, cats, onChange, emitDetail]);

  // When childId resolves (from initial value or user change), notify parent so hidden field updates
  React.useEffect(() => {
    if (childId && onChange) onChange(childId);
  }, [childId, onChange]);

  const parents = cats;
  const children = React.useMemo(() => {
    const pid = parentId ? Number(parentId) : null;
    return parents.find((p) => p.id === pid)?.children || [];
  }, [parents, parentId]);

  const handleParent = (e) => {
    const id = e.target.value || '';
    setParentId(id);
    setChildId('');
    if (!id) {
      onChange && onChange(null);
      emitDetail(null, null);
    } else {
      const selectedParent = parents.find((p) => String(p.id) === String(id));
      const hasChildren = (selectedParent?.children || []).length > 0;
      // If parent has no children, emit parent as final selection
      if (!hasChildren) {
        onChange && onChange(Number(id));
        emitDetail(selectedParent, null);
      } else {
        emitDetail(selectedParent, null);
      }
    }
  };

  const handleChild = (e) => {
    const id = e.target.value || '';
    setChildId(id);
    onChange && onChange(id ? Number(id) : null);
    const parent = parents.find((p) => String(p.id) === String(parentId));
    const child = (parent?.children || []).find((c) => String(c.id) === String(id));
    emitDetail(parent || null, child || null);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <select
        value={parentId}
        onChange={handleParent}
        className="h-11 px-3 rounded-lg border-2 border-slate-200/60 bg-white/90 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all appearance-none"
      >
        <option value="">Select Category</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        value={childId}
        onChange={handleChild}
        disabled={!parentId}
        className="h-11 px-3 rounded-lg border-2 border-slate-200/60 bg-white/90 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all appearance-none disabled:opacity-60"
      >
        <option value="">Select Subcategory</option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
