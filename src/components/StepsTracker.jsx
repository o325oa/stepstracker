import { useState } from "react";

function parseDMY(str) {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(str);
    if (!m) return null;
    const dd = parseInt(m[1], 10);
    const mIdx = parseInt(m[2], 10) - 1;
    const y = parseInt(m[3], 10);
    const date = new Date(y, mIdx, dd);
    if (date.getFullYear() !== y || date.getMonth() !== mIdx || date.getDate() !== dd) return null;
    return date;
}

function formatDMY(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

function fromHTMLDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return "";
    const y = m[1];
    const mth = m[2];
    const d = m[3];
    return `${d}.${mth}.${y}`;
}

function toHTMLDate(dmy) {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy);
    if (!m) return "";
    const d = m[1];
    const mth = m[2];
    const y = m[3];
    return `${y}-${mth}-${d}`;
}

export default function StepsTracker() {
  const [items, setItems] = useState([]);
  const [dateStr, setDateStr] = useState("");
  const [distStr, setDistStr] = useState("");
  const [editKey, setEditKey] = useState(null);

  const sortedItems = [...items].sort((a, b) => {
    const da = parseDMY(a.date);
    const db = parseDMY(b.date);
    return db - da;
  });

  function handleSubmit(e) {
    e.preventDefault();
    const d = parseDMY(dateStr);
    const dist = parseFloat(distStr.replace(",", "."));
    if (!d || !Number.isFinite(dist) || dist <= 0) {
      alert("Введите корректные дату и расстояние (> 0).");
      return;
    }
    const dmy = formatDMY(d);

    setItems((prev) => {
      const existing = prev.find((it) => it.date === dmy);
      if (existing) {
        return prev.map((it) =>
          it.date === dmy ? { ...it, dist: +(it.dist + dist).toFixed(2) } : it
        );
      }
      return [...prev, { date: dmy, dist: +dist.toFixed(2) }];
    });

    setDateStr("");
    setDistStr("");
    setEditKey(null);
  }

  function handleDelete(dmy) {
    setItems((prev) => prev.filter((it) => it.date !== dmy));
    if (editKey === dmy) {
      setEditKey(null);
      setDateStr("");
      setDistStr("");
    }
  }

  function handleEdit(dmy) {
    const row = items.find((it) => it.date === dmy);
    if (!row) return;
    setEditKey(dmy);
    setDateStr(row.date);
    setDistStr(String(row.dist));
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editKey) return handleSubmit(e);

    const d = parseDMY(dateStr);
    const dist = parseFloat(distStr.replace(",", "."));
    if (!d || !Number.isFinite(dist) || dist <= 0) {
      alert("Введите корректные дату и расстояние (> 0).");
      return;
    }
    const dmy = formatDMY(d);

    setItems((prev) => {
      let next = prev.filter((it) => it.date !== editKey);
      const idx = next.findIndex((it) => it.date === dmy);
      if (idx >= 0) {
        next = next.map((it, i) =>
          i === idx ? { ...it, dist: +(it.dist + dist).toFixed(2) } : it
        );
      } else {
        next = [...next, { date: dmy, dist: +dist.toFixed(2) }];
      }
      return next;
    });

    setEditKey(null);
    setDateStr("");
    setDistStr("");
  }

  const page = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    padding: 16,
  };

  const card = {
    width: 560,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: 16,
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 8,
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 16,
  };

  const thtd = {
    borderBottom: "1px solid #eee",
    padding: "8px 6px",
    textAlign: "left",
  };

  const actionsBtn = {
    cursor: "pointer",
    background: "transparent",
    border: "none",
    fontSize: 16,
    padding: 4,
  };

  return (
    <div style={page}>
      <div style={card}>
        <form onSubmit={editKey ? saveEdit : handleSubmit}>
          <div style={grid}>
            <input
              type="date"
              value={toHTMLDate(dateStr)}
              onChange={(e) => setDateStr(fromHTMLDate(e.target.value))}
              placeholder="ДД.ММ.ГГГГ"
              required
            />
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={distStr}
              onChange={(e) => setDistStr(e.target.value)}
              placeholder="Км, напр. 5.7"
              required
            />
            <button type="submit">{editKey ? "Ok" : "Добавить"}</button>
          </div>
        </form>

        <table style={table}>
          <thead>
            <tr>
              <th style={thtd}>Дата</th>
              <th style={thtd}>Пройдено, км</th>
              <th style={thtd}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((it) => (
              <tr key={it.date}>
                <td style={thtd}>{it.date}</td>
                <td style={thtd}>{it.dist.toFixed(1)}</td>
                <td style={thtd}>
                  <button
                    type="button"
                    title="Редактировать"
                    style={actionsBtn}
                    onClick={() => handleEdit(it.date)}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    title="Удалить"
                    style={actionsBtn}
                    onClick={() => handleDelete(it.date)}
                  >
                    ✘
                  </button>
                </td>
              </tr>
            ))}
            {sortedItems.length === 0 && (
              <tr>
                <td style={thtd} colSpan={3}>
                  Нет записей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
