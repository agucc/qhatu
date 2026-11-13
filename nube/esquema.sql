-- Base de datos D1 de Qhatu. Se puede volver a ejecutar sin perder nada.

CREATE TABLE IF NOT EXISTS jugadores (
  id TEXT PRIMARY KEY,
  google TEXT UNIQUE,          -- "sub" de Google si el jugador vinculó su cuenta
  creado INTEGER NOT NULL      -- milisegundos desde 1970
);

-- Llaves de acceso (códigos de recuperación). Solo se guarda su SHA-256, nunca la llave.
CREATE TABLE IF NOT EXISTS llaves (
  hash TEXT PRIMARY KEY,
  jugador TEXT NOT NULL REFERENCES jugadores(id),
  creada INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS llaves_jugador ON llaves(jugador);

-- La partida completa de cada jugador, con versión para no pisar lo que guardó otro celular.
CREATE TABLE IF NOT EXISTS partidas (
  jugador TEXT PRIMARY KEY REFERENCES jugadores(id),
  datos TEXT NOT NULL,
  version INTEGER NOT NULL,
  actualizada INTEGER NOT NULL
);
