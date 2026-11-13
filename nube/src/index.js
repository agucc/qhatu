// Entrada del Worker. La lógica está en servidor.js para poder probarla sin Cloudflare.
import { crearServidor } from './servidor.js';

// Las salas en vivo (Durable Object con WebSockets).
export { Sala } from './sala.js';

const manejar = crearServidor();

export default {
  fetch: (req, env) => manejar(req, env),
};
