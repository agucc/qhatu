// La sala en vivo: un Durable Object por código de sala, con WebSockets que pueden hibernar.
// Las reglas están en sala-logica.js.

import { DurableObject } from 'cloudflare:workers';
import * as S from './sala-logica.js';

const ID_VALIDO = /^[A-Za-z0-9-]{8,40}$/;

export class Sala extends DurableObject {
  async cargar() {
    return (await this.ctx.storage.get('sala')) || null;
  }

  async guardar(sala) {
    await this.ctx.storage.put('sala', sala);
  }

  enviarATodos(sala) {
    const mensaje = JSON.stringify({ tipo: 'sala', sala: S.publico(sala, Date.now()) });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(mensaje);
      } catch {
        /* socket cerrado */
      }
    }
  }

  /** Programa la alarma: fin de la ronda si se está jugando, si no la limpieza de la sala. */
  async programar(sala) {
    const cuando = sala.estado === 'jugando' ? S.finDeRonda(sala) + S.GRACIA_MS : sala.creada + S.VIDA_MS + 60_000;
    await this.ctx.storage.setAlarm(cuando);
  }

  async fetch(req) {
    const url = new URL(req.url);
    const ahora = Date.now();

    if (url.pathname.endsWith('/crear') && req.method === 'POST') {
      if (await this.cargar()) return new Response('existe', { status: 409 });
      const { codigo, puesto } = await req.json();
      const sala = S.nuevaSala(codigo, puesto, ahora);
      if (!sala) return new Response('puesto', { status: 400 });
      await this.guardar(sala);
      await this.programar(sala);
      return Response.json({ codigo });
    }

    const sala = await this.cargar();
    if (!sala || S.vencida(sala, ahora)) return Response.json({ error: 'no-existe' }, { status: 404 });
    if (req.headers.get('Upgrade') !== 'websocket') return Response.json(S.publico(sala, ahora));

    const par = new WebSocketPair();
    const [cliente, servidor] = Object.values(par);
    const id = url.searchParams.get('jugador') || '';
    const rechazo = ID_VALIDO.test(id) ? S.unirse(sala, id, url.searchParams.get('nombre'), url.searchParams.get('pais'), ahora, url.searchParams.get('avatar')) : 'jugador';
    if (rechazo) {
      // Se acepta para poder decir por qué no puede entrar, y se cierra.
      servidor.accept();
      servidor.send(JSON.stringify({ tipo: 'error', motivo: rechazo }));
      servidor.close(4000, rechazo);
      return new Response(null, { status: 101, webSocket: cliente });
    }
    this.ctx.acceptWebSocket(servidor, [id]);
    servidor.serializeAttachment({ id });
    await this.guardar(sala);
    this.enviarATodos(sala);
    return new Response(null, { status: 101, webSocket: cliente });
  }

  async webSocketMessage(ws, datos) {
    const { id } = ws.deserializeAttachment() || {};
    let m;
    try {
      m = JSON.parse(datos);
    } catch {
      return;
    }
    const sala = await this.cargar();
    if (!sala || !id) return;
    const ahora = Date.now();
    if (m.tipo === 'hora') {
      ws.send(JSON.stringify({ tipo: 'hora', ahora }));
      return;
    }
    let cambio = false;
    if (m.tipo === 'empezar') {
      const error = S.empezar(sala, id, ahora, crypto.getRandomValues(new Uint32Array(1))[0]);
      if (error) ws.send(JSON.stringify({ tipo: 'error', motivo: error }));
      else {
        cambio = true;
        await this.programar(sala);
      }
    } else if (m.tipo === 'puntos') {
      cambio = S.anotar(sala, id, m.n, ahora);
    } else if (m.tipo === 'fin') {
      const todos = S.terminarJugador(sala, id, m.n, ahora);
      cambio = true;
      if (todos) {
        S.cerrarRonda(sala);
        await this.programar(sala);
      }
    } else if (m.tipo === 'otra') {
      cambio = !S.otraRonda(sala, id);
      if (cambio) await this.programar(sala);
    }
    if (cambio) {
      await this.guardar(sala);
      this.enviarATodos(sala);
    }
  }

  async webSocketClose(ws) {
    const { id } = ws.deserializeAttachment() || {};
    const sala = await this.cargar();
    if (!sala || !id) return;
    // Si el mismo jugador sigue conectado desde otra pantalla, no se va.
    const otra = this.ctx.getWebSockets(id).some((x) => x !== ws && x.readyState === 1);
    if (otra) return;
    S.salir(sala, id);
    if (S.todosTerminaron(sala)) S.cerrarRonda(sala);
    await this.guardar(sala);
    this.enviarATodos(sala);
  }

  async alarm() {
    const sala = await this.cargar();
    if (!sala) return;
    const ahora = Date.now();
    if (S.vencida(sala, ahora)) {
      for (const ws of this.ctx.getWebSockets()) ws.close(4001, 'vencida');
      await this.ctx.storage.deleteAll();
      return;
    }
    if (sala.estado === 'jugando' && ahora >= S.finDeRonda(sala) + S.GRACIA_MS - 50) {
      S.cerrarRonda(sala);
      await this.guardar(sala);
      this.enviarATodos(sala);
    }
    await this.programar(sala);
  }
}
