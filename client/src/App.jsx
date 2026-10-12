import { useEffect, useState } from 'react';
import { api } from './api.js';
import TicketForm from './components/TicketForm.jsx';
import TicketTable from './components/TicketTable.jsx';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    Promise.all([api.tickets(), api.categorias(), api.usuarios()])
      .then(([t, c, u]) => {
        setTickets(t);
        setCategorias(c);
        setUsuarios(u);
      })
      .catch((e) => setError(e.message));
  }, []);

  const ticketsFiltrados = categoriaActiva === 'todas'
    ? tickets
    : tickets.filter((ticket) => Number(ticket.categoria_id) === Number(categoriaActiva));

  const mostrarAviso = (texto) => {
    setAviso(texto);
    setTimeout(() => setAviso(''), 3000);
  };

  const crear = async (datos) => {
    const nuevo = await api.crearTicket(datos);
    setTickets((prev) => [nuevo, ...prev]);
    mostrarAviso(`Solicitud TK-${String(nuevo.id).padStart(4, '0')} registrada.`);
  };

  const actualizar = async (id, cambios) => {
    try {
      const actualizado = await api.actualizarTicket(id, cambios);
      setTickets((prev) => prev.map((t) => (t.id === id ? actualizado : t)));
      setError('');
      mostrarAviso('Cambio guardado.');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="app">
      <header className="top">
        <h1>Mesa de Soporte TI</h1>
        <p>Registra solicitudes y sigue su atención hasta el cierre.</p>
      </header>

      {error && <div className="banner error" role="alert">{error}</div>}
      {aviso && <div className="banner ok" role="status">{aviso}</div>}

      <main className="layout">
        <TicketForm categorias={categorias} onCrear={crear} />
        <TicketTable
          tickets={ticketsFiltrados}
          usuarios={usuarios}
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          onCambiarCategoria={setCategoriaActiva}
          onActualizar={actualizar}
        />
      </main>
    </div>
  );
}
