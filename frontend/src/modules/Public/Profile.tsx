import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/src/store';
import { Button, Card } from '@/src/components/ui/Base';
import { ArrowLeft, Mail, User, ShieldCheck, Home } from 'lucide-react';
import { usersService } from '@/src/services/users.service';

export const Profile = () => {
  const { user, setUser, notify } = useStore();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    role: 'operator' as const,
    institution: '',
  });
  const [saving, setSaving] = React.useState(false);

  const roleOptions = React.useMemo(
    () => [
      { value: 'admin', label: 'Admin' },
      { value: 'operator', label: 'Operador' },
      { value: 'b2b_client', label: 'Cliente B2B' },
      { value: 'customer', label: 'Cliente' },
    ],
    []
  );

  const hasChanges = React.useMemo(
    () => !!user && (
      form.name !== user.name ||
      form.email !== user.email ||
      form.role !== user.role ||
      (form.institution || '') !== (user.institution || '')
    ),
    [form, user]
  );

  React.useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution ?? '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updatedUser = {
      ...user,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      institution: form.institution.trim() || undefined,
    };

    setUser(updatedUser);

    try {
      await usersService.update(user.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        institution: updatedUser.institution,
      });
      notify('Perfil actualizado correctamente', 'success');
    } catch (error) {
      notify('Cambios guardados localmente. Sincronización remota falló.', 'info');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <Card className="max-w-lg w-full p-6 text-center border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40">
          <div className="mb-4 text-slate-300">
            <h1 className="text-2xl font-black text-white">Perfil no disponible</h1>
            <p className="mt-2 text-sm">Inicia sesión desde la página principal para configurar tus datos.</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition">
            <Home size={16} /> Volver a inicio
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/logistics" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft size={18} /> Volver
          </Link>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tu perfil</p>
            <p className="text-sm text-slate-400">Configura tus datos de acceso y contacto</p>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/40">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 shadow-inner shadow-cyan-500/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-slate-900/40 text-cyan-300 shadow-lg shadow-cyan-500/10">
                    <User size={34} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Operador</p>
                    <h1 className="text-3xl font-black text-white">{user.name}</h1>
                    <p className="mt-2 text-sm text-slate-400">{roleOptions.find((item) => item.value === user.role)?.label ?? user.role}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 text-slate-300 shadow-inner shadow-slate-800/20">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Información actual</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-cyan-300" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-cyan-300" />
                    <span>{roleOptions.find((item) => item.value === user.role)?.label ?? user.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home size={14} className="text-cyan-300" />
                    <span>{user.institution ?? 'Sin institución'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-inner shadow-slate-800/20">
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nombre</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Correo</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Rol</label>
                    <select
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value as any })}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institución</label>
                    <input
                      type="text"
                      value={form.institution}
                      onChange={(event) => setForm({ ...form, institution: event.target.value })}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2 text-slate-400">
                    <p className="text-[10px] uppercase tracking-[0.24em]">Seguridad</p>
                    <p className="text-sm">Actualiza tu perfil y guarda los cambios para mantenerlos en la sesión.</p>
                  </div>
                  <Button
                    className="rounded-3xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>

                {!hasChanges && (
                  <p className="text-xs text-slate-500">No hay cambios por guardar.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-950/80 p-5 text-slate-300 shadow-inner shadow-slate-800/20">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
              <ShieldCheck size={16} /> Datos confidenciales
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Solo los campos visibles se usan para mostrar tu perfil en el sistema. Puedes actualizar nombre, correo, rol o institución y guardar los cambios.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
