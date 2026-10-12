import { useState } from 'react';

const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'];
const VACIO = { solicitante: '', titulo: '', descripcion: '', categoria_id: '', prioridad: 'Media' };

export default function TicketForm({ categorias, onCrear }) {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

 
  const validar = () => {
    const e = [];
    if (form.solicitante.trim().length < 3) e.push('Ingresa el nombre del solicitante (mínimo 3 caracteres).');
    if (form.titulo.trim().length < 5) e.push('El título debe tener al menos 5 caracteres.');
    if (form.descripcion.trim().length < 10) e.push('Describe el problema con al menos 10 caracteres.');
    if (!form.categoria_id) e.push('Selecciona una categoría.');
    return e;
  };

  const enviar = async (e) => {
    e.preventDefault();
    const e1 = validar();
    setErrores(e1);
    if (e1.length) return;
    setEnviando(true);
    try {
      await onCrear({ ...form, categoria_id: Number(form.categoria_id) });
      setForm(VACIO);
    } catch (err) {
      setErrores([err.message]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="panel form-panel">
      <h2>Nueva solicitud</h2>
      <form onSubmit={enviar} noValidate>
        <label>
          Solicitante
          <input name="solicitante" value={form.solicitante} onChange={cambiar} />
        </label>
        <label>
          Título
          <input name="titulo" value={form.titulo} onChange={cambiar} maxLength={100} />
        </label>
        <label>
          Descripción
          <textarea name="descripcion" rows={4} value={form.descripcion} onChange={cambiar} />
        </label>
        <div className="row">
          <label>
            Categoría
            <select name="categoria_id" value={form.categoria_id} onChange={cambiar}>
              <option value="">Seleccionar…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Prioridad
            <select name="prioridad" value={form.prioridad} onChange={cambiar}>
              {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>

        {errores.length > 0 && (
          <ul className="errores" role="alert">
            {errores.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}

        <button type="submit" className="primary" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrar solicitud'}
        </button>
      </form>
    </section>
  );
}
