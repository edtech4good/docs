-- Runs once on first container start (empty data volume only).
-- App user uses '%' so connections from the host (Node on your machine) work.
-- The password below is a development default, committed to a public
-- repository. Change it before this database is reachable from any network
-- other than your own machine.

CREATE DATABASE IF NOT EXISTS edtech_lms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS edtech_lms_rpi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'edtech_local'@'%' IDENTIFIED BY 'edtech_dev_pass';

GRANT ALL PRIVILEGES ON edtech_lms.* TO 'edtech_local'@'%';
GRANT ALL PRIVILEGES ON edtech_lms_rpi.* TO 'edtech_local'@'%';

FLUSH PRIVILEGES;
