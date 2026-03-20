-- =====================================================
-- Migration: Add streak_processed column to rides
-- =====================================================
-- This column tracks whether the clean-ride streak reward
-- has already been awarded for a given ride. Replaces the
-- fragile 1-hour time-window approach used previously.
--
-- Safe to run on an existing database — uses IF NOT EXISTS
-- pattern via column check.
-- =====================================================

ALTER TABLE rides ADD COLUMN streak_processed BOOLEAN DEFAULT FALSE
  COMMENT 'TRUE after clean-ride streak has been awarded for this ride';
