import { useState, useEffect } from 'react';
import { Users, Shield, GraduationCap, Calendar, UserPlus, X, Eye, EyeOff, School, Edit3, Trash2, ChevronLeft, Clock, BarChart3, User, Mail, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../ThemeContext';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { TermsCheckbox } from '../components/TermsAndConditions';

interface UserEntry {
  id: string;
  name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Profesor',
  student: 'Estudiante',
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'rgba(255,123,114,.15)', text: '#ff7b72' },
  teacher: { bg: 'rgba(130,80,223,.15)', text: '#8250df' },
  student: { bg: 'rgba(56,139,253,.15)', text: '#388bfd' },
};

export function RegisteredUsers() {
  const { theme } = useTheme();
  const currentRole = useCognitiveStore((s) => s.role);
  const isDark = theme === 'dark';

  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'students' | 'admins'>('students');
  const [selectedStudent, setSelectedStudent] = useState<UserEntry | null>(null);
  const [editingUser, setEditingUser] = useState<UserEntry | null>(null);
  const [editForm, setEditForm] = useState({ name: '', last_name: '', email: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', last_name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createTermsAccepted, setCreateTermsAccepted] = useState(false);

  const textPrimary = isDark ? '#e6edf3' : '#1f2328';
  const textSecondary = isDark ? '#8b949e' : '#656d76';
  const cardBg = isDark ? '#161b22' : '#ffffff';
  const cardBorder = isDark ? 'rgba(48,54,61,.5)' : 'rgba(209,213,218,.5)';
  const rowBorder = isDark ? 'rgba(48,54,61,.5)' : 'rgba(209,213,218,.5)';
  const inputBg = isDark ? '#0d1117' : '#f6f8fa';

  const canCreate = currentRole === 'admin';
  const students = users.filter(u => u.role === 'student');
  const admins = users.filter(u => u.role === 'admin' || u.role === 'teacher');

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.listUsers() as unknown as UserEntry[];
      setUsers(res);
    } catch (err: any) {
      setLoadError(err?.message || 'No se pudo conectar con el servidor');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = {
    total: users.length,
    students: students.length,
    admins: admins.length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!createForm.name || !createForm.last_name || !createForm.email || !createForm.password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (!createTermsAccepted) {
      setError('Debes confirmar la aceptación de los Términos y Condiciones y el Tratamiento de Datos Personales por parte del usuario.');
      return;
    }
    setCreating(true);
    try {
      await api.register({ ...createForm, terms_accepted: createTermsAccepted });
      setShowCreateForm(false);
      setCreateForm({ name: '', last_name: '', email: '', password: '', role: 'student' });
      setShowPassword(false);
      setCreateTermsAccepted(false);
      const res = await api.listUsers() as unknown as UserEntry[];
      setUsers(res);
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (u: UserEntry) => {
    setEditingUser(u);
    setEditForm({ name: u.name, last_name: u.last_name, email: u.email });
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setError(null);
    setSaving(true);
    try {
      await api.updateUser(editingUser.id, editForm);
      setEditingUser(null);
      const res = await api.listUsers() as unknown as UserEntry[];
      setUsers(res);
      if (selectedStudent?.id === editingUser.id) {
        setSelectedStudent({ ...selectedStudent, ...editForm });
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setError(null);
    try {
      await api.deleteUser(userId);
      setDeleteConfirm(null);
      if (selectedStudent?.id === userId) setSelectedStudent(null);
      const res = await api.listUsers() as unknown as UserEntry[];
      setUsers(res);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    }
  };

  const s = (v: string) => ({
    color: textSecondary,
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    ...(v ? JSON.parse(v) : {}),
  });

  const btnStyle = (active: boolean, color: string) => ({
    padding: '6px 14px',
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    borderRadius: 6,
    cursor: 'pointer',
    border: `0.5px solid ${active ? color : cardBorder}`,
    background: active ? `${color}18` : 'transparent',
    color: active ? color : textSecondary,
    transition: 'all .15s',
  });

  const tableHeader = (cols: string) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    padding: '8px 14px',
    borderBottom: `0.5px solid ${rowBorder}`,
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    color: textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  });

  const tableRow = (cols: string, last: boolean) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    padding: '9px 14px',
    borderBottom: last ? 'none' : `0.5px solid ${rowBorder}`,
    fontSize: 12,
    alignItems: 'center',
  });

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: textSecondary, fontSize: 13 }}>Cargando usuarios...</div>;
  }

  if (loadError) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#ff7b72', marginBottom: 12 }}>
          No se pudo cargar la lista de usuarios. Revisa la conexión con el servidor o la base de datos.
        </div>
        <div style={{ fontSize: 11, color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 16 }}>{loadError}</div>
        <button onClick={fetchUsers}
          style={{ padding: '8px 18px', borderRadius: 8, background: '#238636', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: textPrimary, margin: '0 0 4px 0' }}>Usuarios Registrados</h1>
          <p style={{ fontSize: 13, color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {stats.total} usuarios · {stats.students} estudiantes · {stats.admins} administradores/profesores
          </p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowCreateForm(!showCreateForm); setError(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
              background: '#238636', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <UserPlus size={16} /> Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => { setTab('students'); setSelectedStudent(null); }}
          style={btnStyle(tab === 'students', '#388bfd')}>
          <GraduationCap size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Estudiantes ({stats.students})
        </button>
        <button onClick={() => { setTab('admins'); setSelectedStudent(null); }}
          style={btnStyle(tab === 'admins', '#ff7b72')}>
          <Shield size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Administradores / Profesores ({stats.admins})
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && canCreate && (
        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: 0 }}>Crear Nuevo Usuario</h2>
            <button onClick={() => setShowCreateForm(false)} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Nombre</label>
              <input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none' }} placeholder="Nombre" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Apellido</label>
              <input value={createForm.last_name} onChange={e => setCreateForm({ ...createForm, last_name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none' }} placeholder="Apellido" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Email</label>
              <input value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none' }} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', paddingRight: 36 }} placeholder="••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Rol</label>
              <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none' }}>
                <option value="student">Estudiante</option>
                <option value="teacher">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <TermsCheckbox checked={createTermsAccepted} onChange={setCreateTermsAccepted} dark={isDark} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" disabled={creating || !createTermsAccepted}
                style={{ width: '100%', padding: '10px', borderRadius: 8, background: '#238636', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: (creating || !createTermsAccepted) ? 'not-allowed' : 'pointer', opacity: (creating || !createTermsAccepted) ? 0.6 : 1 }}>
                {creating ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
          {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,123,114,.15)', color: '#ff7b72', fontSize: 12 }}>{error}</div>}
        </div>
      )}

      {/* STUDENTS TAB */}
      {tab === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1.4fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
          {/* Student list */}
          <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={tableHeader('2fr 2fr 1.5fr')}>
              <span>Nombre</span><span>Email</span><span>Registro</span>
            </div>
            {students.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: textSecondary, fontSize: 12 }}>No hay estudiantes registrados</div>
            ) : students.map((u, i) => {
              const initials = `${u.name[0]}${u.last_name[0]}`.toUpperCase();
              const created = new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
              const isSelected = selectedStudent?.id === u.id;
              return (
                <div key={u.id} onClick={() => setSelectedStudent(isSelected ? null : u)}
                  style={{
                    ...tableRow('2fr 2fr 1.5fr', i === students.length - 1),
                    cursor: 'pointer', background: isSelected ? `${ROLE_COLORS.student.bg}` : 'transparent',
                  }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, background: ROLE_COLORS.student.bg, color: ROLE_COLORS.student.text }}>{initials}</span>
                    <span style={{ color: textPrimary }}>{u.name} {u.last_name}</span>
                  </span>
                  <span style={{ color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{u.email}</span>
                  <span style={{ color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={12} /> {created}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Student detail */}
          {selectedStudent && (
            <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: 16, position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0 }}>Detalle del Estudiante</h2>
                <button onClick={() => setSelectedStudent(null)}
                  style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
                  <ChevronLeft size={14} /> cerrar
                </button>
              </div>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `0.5px solid ${rowBorder}` }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, background: ROLE_COLORS.student.bg, color: ROLE_COLORS.student.text }}>
                  {selectedStudent.name[0]}{selectedStudent.last_name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{selectedStudent.name} {selectedStudent.last_name}</div>
                  <div style={{ fontSize: 11, color: textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>{selectedStudent.email}</div>
                </div>
              </div>

              {/* Info cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: Calendar, label: 'Registrado', val: new Date(selectedStudent.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }), color: '#f2cc60' },
                  { icon: Clock, label: 'Última sesión', val: '—', color: textSecondary },
                  { icon: BarChart3, label: 'Progreso', val: 'Sin datos aún', color: textSecondary },
                  { icon: BookOpen, label: 'Fase actual', val: '—', color: textSecondary },
                ].map(c => (
                  <div key={c.label} style={{ background: inputBg, borderRadius: 8, padding: 10, border: `0.5px solid ${rowBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <c.icon size={13} color={c.color} />
                      <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{c.label}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{c.val}</div>
                  </div>
                ))}
              </div>

              {/* Edit section */}
              {canCreate && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Edit3 size={14} color="#f2cc60" />
                    <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Editar datos</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, color: textSecondary, marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>Nombre</label>
                      <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, color: textSecondary, marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>Apellido</label>
                      <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 10, color: textSecondary, marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>Email</label>
                      <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleSaveEdit} disabled={saving}
                      style={{ padding: '8px 16px', borderRadius: 6, background: '#238636', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button onClick={() => setDeleteConfirm(selectedStudent.id)}
                      style={{ padding: '8px 16px', borderRadius: 6, background: 'rgba(255,123,114,.15)', color: '#ff7b72', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ADMINS TAB */}
      {tab === 'admins' && (
        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={tableHeader('2fr 2fr 1fr 1.5fr 100px')}>
            <span>Nombre</span><span>Email</span><span>Rol</span><span>Registro</span><span />
          </div>
          {admins.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: textSecondary, fontSize: 12 }}>No hay administradores o profesores</div>
          ) : admins.map((u, i) => {
            const initials = `${u.name[0]}${u.last_name[0]}`.toUpperCase();
            const colors = ROLE_COLORS[u.role] || ROLE_COLORS.admin;
            const created = new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            const isEditing = editingUser?.id === u.id;
            return (
              <div key={u.id}
                style={{
                  ...tableRow('2fr 2fr 1fr 1.5fr 100px', i === admins.length - 1),
                  background: isEditing ? `${colors.bg}` : 'transparent',
                }}>
                {isEditing ? (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '80%', padding: '5px 8px', borderRadius: 4, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none' }} />
                    </span>
                    <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                      style={{ width: '90%', padding: '5px 8px', borderRadius: 4, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none' }} />
                    <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ width: '90%', padding: '5px 8px', borderRadius: 4, border: `0.5px solid ${cardBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none' }} />
                    <span />
                    <span style={{ display: 'flex', gap: 4 }}>
                      <button onClick={handleSaveEdit} disabled={saving}
                        style={{ padding: '4px 10px', borderRadius: 4, background: '#238636', color: '#fff', border: 'none', fontSize: 10, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>Guardar</button>
                      <button onClick={() => setEditingUser(null)}
                        style={{ padding: '4px 10px', borderRadius: 4, background: 'transparent', color: textSecondary, border: `0.5px solid ${cardBorder}`, fontSize: 10, cursor: 'pointer' }}>Cancelar</button>
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, background: colors.bg, color: colors.text }}>{initials}</span>
                      <span style={{ color: textPrimary }}>{u.name} {u.last_name}</span>
                    </span>
                    <span style={{ color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{u.email}</span>
                    <span>
                      <span style={{ background: colors.bg, color: colors.text, borderRadius: 5, padding: '2px 7px', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </span>
                    <span style={{ color: textSecondary, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} /> {created}
                    </span>
                    {canCreate && (
                      <span style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleEdit(u)}
                          style={{ padding: '4px 8px', borderRadius: 4, background: 'transparent', color: '#f2cc60', border: `0.5px solid ${cardBorder}`, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Edit3 size={12} /> Editar
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => setDeleteConfirm(u.id)}
                            style={{ padding: '4px 8px', borderRadius: 4, background: 'transparent', color: '#ff7b72', border: `0.5px solid ${cardBorder}`, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Trash2 size={12} /> Eliminar
                          </button>
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 8px 0' }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize: 13, color: textSecondary, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Esta acción eliminará permanentemente al usuario y todos sus datos asociados (sesiones, resultados, eventos). No se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: textSecondary, border: `0.5px solid ${cardBorder}`, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ padding: '8px 16px', borderRadius: 6, background: '#ff7b72', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
