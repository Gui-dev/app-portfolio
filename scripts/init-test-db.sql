-- Creates the integration-test database alongside the dev database.
-- Mounted into /docker-entrypoint-initdb.d/ by compose.yaml.
CREATE DATABASE foliocraft_test;
GRANT ALL PRIVILEGES ON DATABASE foliocraft_test TO foliocraft;
