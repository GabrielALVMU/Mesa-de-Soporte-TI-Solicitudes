async function request(url, options) {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que la API esté en ejecución.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.errores || ['Error inesperado.']).join(' '));
  return data;
}

export const api = {
  categorias: () => request('/api/categorias'),
  usuarios: () => request('/api/usuarios'),
  tickets: (categoriaId) => {
    const url = categoriaId ? `/api/tickets?categoria_id=${encodeURIComponent(categoriaId)}` : '/api/tickets';
    return request(url);
  },
  crearTicket: (datos) => request('/api/tickets', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarTicket: (id, cambios) =>
    request(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),
};
/////http pre 