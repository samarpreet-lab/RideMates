-- =====================================================
-- Dummy Data for Reports Table
-- =====================================================
-- Inserts sample report data for testing the reports system.
-- References existing users (IDs 6-17) and rides (IDs 711-718)
--

INSERT INTO reports (ride_id, reporter_id, reported_user_id, reason, description, penalty_applied) VALUES
(711, 9, 7, 'bad_conduct', 'Passenger was rude and used abusive language during the ride.', 10),
(712, 10, 7, 'unsafe_driving', 'Driver was speeding and took risky turns. Felt very unsafe.', 10),
(713, 11, 6, 'no_show', 'Driver did not show up at the meeting point. I waited for 25 minutes.', 10),
(714, 12, 6, 'harassment', 'Driver kept asking personal questions and making me uncomfortable.', 10),
(715, 13, 6, 'bad_conduct', 'Driver played very loud music and refused to lower volume when asked.', 10),
(716, 14, 6, 'unsafe_driving', 'Driver ran a red light and nearly caused an accident.', 10),
(717, 15, 6, 'no_show', 'Passenger confirmed booking but never showed up at pickup point.', 10),
(718, 16, 7, 'harassment', 'Passenger made inappropriate comments and was making driver uncomfortable.', 10);
