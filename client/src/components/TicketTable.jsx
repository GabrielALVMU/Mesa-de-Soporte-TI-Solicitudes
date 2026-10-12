const ESTADOS = ['Nuevo', 'En proceso', 'Resuelto', 'Cerrado'];

const codigo = (id) => `TK-${String(id).padStart(4, '0')}`;
const clase = (txt) => txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '-');

export default function TicketTable({
  tickets,
  usuarios,
  categorias,
  categoriaActiva,
  onCambiarCategoria,
  onActualizar,
}) {
  return (
    <section className="panel list-panel">
      <div className="list-header">
        <h2>Solicitudes <span className="count">{tickets.length}</span></h2>
        <div className="filters" aria-label="Filtros por categoría">
          <button
            type="button"
            className={categoriaActiva === 'todas' ? 'filter-button active' : 'filter-button'}
            onClick={() => onCambiarCategoria('todas')}
          >
            Todas
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={categoriaActiva === String(categoria.id) ? 'filter-button active' : 'filter-button'}
              onClick={() => onCambiarCategoria(String(categoria.id))}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <p className="empty">
          {categoriaActiva === 'todas'
            ? 'Aún no hay solicitudes. Registra la primera con el formulario.'
            : 'No hay solicitudes en esta categoría.'}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Solicitud</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Creada</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="id">{codigo(t.id)}</td>
                  <td>
                    <strong>{t.titulo}</strong>
                    <span className="sub">{t.solicitante}</span>
                    <span className="desc">{t.descripcion}</span>
                  </td>
                  <td>{t.categoria}</td>
                  <td><span className={`chip p-${clase(t.prioridad)}`}>{t.prioridad}</span></td>
                  <td>
                    <select
                      aria-label={`Responsable de ${codigo(t.id)}`}
                      value={t.responsable_id ?? ''}
                      onChange={(e) =>
                        onActualizar(t.id, { responsable_id: e.target.value === '' ? null : Number(e.target.value) })
                      }
                    >
                      <option value="">Sin asignar</option>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={`Estado de ${codigo(t.id)}`}
                      className={`estado e-${clase(t.estado)}`}
                      value={t.estado}
                      onChange={(e) => onActualizar(t.id, { estado: e.target.value })}
                    >
                      {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="fecha">{t.fecha_creacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
