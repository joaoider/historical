-- Script SQL para inicializar o banco de dados do projeto História
-- Execute este script após criar o banco de dados

-- Criar schema
CREATE SCHEMA IF NOT EXISTS history;

-- Tabela de Entidades (Entity)
CREATE TABLE IF NOT EXISTS history.entity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    track VARCHAR(100),
    description TEXT,
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Relacionamentos (Relationship)
CREATE TABLE IF NOT EXISTS history.relationship (
    id SERIAL PRIMARY KEY,
    source_entity_id INTEGER NOT NULL REFERENCES history.entity(id) ON DELETE CASCADE,
    target_entity_id INTEGER NOT NULL REFERENCES history.entity(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor desempenho
CREATE INDEX idx_entity_type ON history.entity(entity_type);
CREATE INDEX idx_entity_track ON history.entity(track);
CREATE INDEX idx_entity_start_year ON history.entity(start_year);
CREATE INDEX idx_relationship_source ON history.relationship(source_entity_id);
CREATE INDEX idx_relationship_target ON history.relationship(target_entity_id);

-- Inserir dados de exemplo
INSERT INTO history.entity (name, entity_type, track, description, start_year, end_year) VALUES
('Queda do Império Romano', 'Evento Histórico', 'Política', 'Fim do Império Romano do Ocidente', 476, 476),
('Descoberta da América', 'Evento Histórico', 'Exploração', 'Viagem de Cristóvão Colombo', 1492, 1492),
('Revolução Francesa', 'Evento Histórico', 'Política', 'Revolução que transformou a França e o mundo', 1789, 1799),
('Revolução Industrial', 'Evento Histórico', 'Tecnologia', 'Transformação econômica e social', 1760, 1840),
('Primeira Guerra Mundial', 'Evento Histórico', 'Guerra', 'Grande conflito europeu', 1914, 1918),
('Segunda Guerra Mundial', 'Evento Histórico', 'Guerra', 'Maior conflito armado da história', 1939, 1945),
('Era Digital', 'Era Histórica', 'Tecnologia', 'Computadores e internet transformam o mundo', 1970, NULL);

-- Inserir relacionamentos de exemplo
INSERT INTO history.relationship (source_entity_id, target_entity_id, relationship_type, description) VALUES
(1, 2, 'precedente', 'Queda do Império precedeu a exploração'),
(3, 4, 'paralelo', 'Revolução Francesa ocorreu durante a Revolução Industrial'),
(5, 6, 'precedente', 'Primeira Guerra levou à Segunda Guerra'),
(4, 7, 'precedente', 'Tecnologia da Industrial levou à Era Digital');

-- Adicionar constraints de triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entity_update
BEFORE UPDATE ON history.entity
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Exibir confirmação
SELECT 'Schema e tabelas criadas com sucesso!' as status;
