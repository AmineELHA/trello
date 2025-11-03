-- PostgreSQL initialization script for Trello clone

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE trello_production'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'trello_production')\gexec

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";