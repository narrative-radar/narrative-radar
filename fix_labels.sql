UPDATE clusters SET label = REGEXP_REPLACE(label, '(?i) tokens$', '') WHERE label ILIKE '% tokens';
UPDATE clusters SET label = REGEXP_REPLACE(label, '(?i) cluster$', '') WHERE label ILIKE '% cluster';
UPDATE clusters SET label = REPLACE(label, '...', '') WHERE label LIKE '%...%';
