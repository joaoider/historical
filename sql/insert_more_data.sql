-- Script para inserir mais dados históricos
-- Adiciona: 2 cientistas + 2 artistas

-- CIENTISTAS
INSERT INTO history.entity (name, entity_type, track, description, start_year, end_year) VALUES
('Isaac Newton', 'Pessoa', 'Ciência', 'Matemático, físico e astrônomo inglês. Desenvolveu as leis do movimento e da gravitação universal.', 1643, 1727),
('Marie Curie', 'Pessoa', 'Ciência', 'Física e química polonesa-francesa. Pioneira no estudo da radioatividade e primeira mulher a ganhar Prêmio Nobel.', 1867, 1934);

-- ARTISTAS
INSERT INTO history.entity (name, entity_type, track, description, start_year, end_year) VALUES
('Leonardo da Vinci', 'Pessoa', 'Arte', 'Pintor, escultor, arquiteto e inventor italiano do Renascimento. Criador da Mona Lisa e A Última Ceia.', 1452, 1519),
('Michelangelo', 'Pessoa', 'Arte', 'Escultor, pintor e arquiteto italiano. Responsável pelo afresco do teto da Capela Sistina.', 1475, 1564);

-- Adicionar relacionamentos entre os cientistas e artistas
INSERT INTO history.entity (name, entity_type, track, description, start_year, end_year) VALUES
('Renascimento', 'Era Histórica', 'Cultura', 'Período de grande desenvolvimento artístico, científico e cultural na Europa.', 1300, 1600);

-- Relacionar Leonardo da Vinci com o Renascimento
INSERT INTO history.relationship (source_entity_id, target_entity_id, relationship_type, description) VALUES
((SELECT id FROM history.entity WHERE name = 'Leonardo da Vinci'), 
 (SELECT id FROM history.entity WHERE name = 'Renascimento'), 
 'participante', 
 'Participou ativamente do Renascimento');

-- Relacionar Michelangelo com o Renascimento
INSERT INTO history.relationship (source_entity_id, target_entity_id, relationship_type, description) VALUES
((SELECT id FROM history.entity WHERE name = 'Michelangelo'), 
 (SELECT id FROM history.entity WHERE name = 'Renascimento'), 
 'participante', 
 'Participou ativamente do Renascimento');

-- Relacionar Newton com Revolução Científica (já existe no banco)
INSERT INTO history.relationship (source_entity_id, target_entity_id, relationship_type, description) VALUES
((SELECT id FROM history.entity WHERE name = 'Isaac Newton'), 
 (SELECT id FROM history.entity WHERE name = 'Era Digital'), 
 'precedente', 
 'Suas descobertas influenciaram a ciência moderna');

SELECT 'Dados inseridos com sucesso!' as status;
SELECT COUNT(*) as total_entidades FROM history.entity;
