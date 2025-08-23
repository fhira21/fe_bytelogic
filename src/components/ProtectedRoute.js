// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function getToken() {
  return localStorage.getItem("token") || null;
}

/** Ambil role mentah dari berbagai kemungkinan */
function getRawRoles() {
  // kandidat: 'role' (string), 'roles' (json/array), 'user' (json) -> role/roles
  const out = [];

  try {
    const r = localStorage.getItem("role");
    if (r) out.push(r);
  } catch {}

  try {
    const rs = localStorage.getItem("roles");
    if (rs) {
      const parsed = JSON.parse(rs);
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(rs);
    }
  } catch {}

  try {
    const s = localStorage.getItem("user");
    if (s) {
      const u = JSON.parse(s);
      if (u?.role) out.push(u.role);
      if (u?.roles) {
        if (Array.isArray(u.roles)) out.push(...u.roles);
        else out.push(u.roles);
      }
      // kadang disimpan sebagai user.data.role(s)
      if (u?.data?.role) out.push(u.data.role);
      if (u?.data?.roles) {
        if (Array.isArray(u.data.roles)) out.push(...u.data.roles);
        else out.push(u.data.roles);
      }
    }
  } catch {}

  // fallback: kalau kosong, kembalikan array kosong
  return out.filter(Boolean);
}

/** pecah string multi role: "manager/admin, staff | pegawai" -> ["manager","admin","staff","pegawai"] */
function splitMultiRoles(v) {
  if (Array.isArray(v)) return v;
  const s = String(v ?? "");
  return s
    .split(/[\/,;|\s]+/g) // pisah by / , ; | dan spasi
    .map((x) => x.trim())
    .filter(Boolean);
}

/** normalisasi satu role ke canonical */
function normOneRole(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();

  const ALIAS = {
    admin: ["admin", "administrator", "superadmin", "super-admin", "owner"],
    manager: ["manager", "manajer", "mgr"],
    client: ["client", "klien", "customer"],
    employee: ["employee", "karyawan", "staff", "pegawai"],
  };

  for (const canonical of Object.keys(ALIAS)) {
    if (ALIAS[canonical].includes(s)) return canonical;
  }
  return s; // biarkan apa adanya bila tak terpetakan
}

/** normalisasi kumpulan roles user */
function normalizeUserRoles(raws) {
  const bag = new Set();
  raws.forEach((r) => {
    splitMultiRoles(r).forEach((one) => {
      const n = normOneRole(one);
      if (n) bag.add(n);
    });
  });
  return Array.from(bag);
}

/** normalisasi daftar allowedRoles dari props */
function normalizeAllowed(rolesProp) {
  if (!Array.isArray(rolesProp)) return [];
  const bag = new Set();
  rolesProp.forEach((r) => {
    splitMultiRoles(r).forEach((one) => {
      const n = normOneRole(one);
      if (n) bag.add(n);
    });
  });
  return Array.from(bag);
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = normalizeUserRoles(getRawRoles());     // misal: ["admin"] atau ["manager","employee"]
  const allowed = normalizeAllowed(allowedRoles);          // misal: ["manager","admin"]

  // Jika allowed kosong, izinkan semua. Kalau tidak, cek INTERSECTION
  const isAllowed =
    allowed.length === 0 ||
    userRoles.some((ur) => allowed.includes(ur));

  if (!isAllowed) {
    // Debug cepat bila perlu:
    // console.warn("Unauthorized →", { userRoles, allowed, raw: getRawRoles() });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}