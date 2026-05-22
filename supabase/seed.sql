-- Seed data for development/demo
-- Run after schema.sql

-- Sample groups
INSERT INTO groups (name, type, description, visibility) VALUES
  ('Year 3', 'year', 'All Year 3 families', 'public'),
  ('Year 4', 'year', 'All Year 4 families', 'public'),
  ('Year 5', 'year', 'All Year 5 families', 'public'),
  ('Year 6', 'year', 'All Year 6 families', 'public'),
  ('3A — Ms Johnson', 'class', 'Class 3A', 'public'),
  ('3B — Mr Smith', 'class', 'Class 3B', 'public'),
  ('4A — Ms Brown', 'class', 'Class 4A', 'public'),
  ('Swimming Squad', 'activity', 'School swimming team', 'public'),
  ('School Band', 'activity', 'Musical ensemble', 'public'),
  ('Chess Club', 'activity', 'Weekly chess club', 'public')
ON CONFLICT DO NOTHING;

-- Sample info pages
INSERT INTO info_pages (title, slug, body, category) VALUES
  ('School Contact Details', 'contact-details',
   'Main office: (02) 9000 1234\nEmail: admin@ourschool.edu.au\nAddress: 123 School Street, Suburbia NSW 2000\n\nPrincipal: Ms Rebecca Williams\nDeputy Principal: Mr James Chen\n\nAbsence line: (02) 9000 1235 (available from 7:30am)\nAbsences can also be reported via the app.',
   'contact'),
  ('Bell Times', 'bell-times',
   'Morning bell: 8:50am\nFirst period: 9:00am\nMorning tea: 10:30am – 11:00am\nLunch: 1:00pm – 1:45pm\nAfternoon bell: 3:15pm\n\nEarly Friday dismissal: 2:45pm\nPupil-free days are published in the school calendar.',
   'schedules'),
  ('Term Dates 2025', 'term-dates',
   'Term 1: 28 January – 11 April\nTerm 2: 28 April – 4 July\nTerm 3: 21 July – 26 September\nTerm 4: 13 October – 19 December\n\nPupil-free days:\n- 27 January (staff development)\n- 27 April (staff development)\n- 20 July (staff development)',
   'schedules'),
  ('Uniform Policy', 'uniform-policy',
   'Students are required to wear the school uniform on all school days.\n\nSummer uniform (Terms 1 & 4):\n- White polo shirt with school crest\n- Navy shorts or skirt\n- White socks and black leather shoes\n- School hat (compulsory outdoors)\n\nWinter uniform (Terms 2 & 3):\n- Navy long trousers or skirt\n- White shirt with school crest\n- Navy jumper\n- Black leather shoes\n\nPhysical Education:\n- School sports polo\n- Navy shorts\n- White sports socks and runners\n\nUniforms are available from the school uniform shop, open Tuesdays 8am–9am and Thursdays 3pm–4pm.',
   'policies'),
  ('Canteen Information', 'canteen',
   'The school canteen is open Monday, Wednesday and Friday.\n\nOrdering:\nOrders must be placed by 8:30am on the day. Use the school app to order online.\n\nCollection:\nLunches are delivered to classrooms at 1:00pm.\n\nSpecial dietary requirements:\nPlease notify the canteen coordinator at canteen@ourschool.edu.au for allergy management.',
   'facilities'),
  ('Emergency Procedures', 'emergency-procedures',
   'Evacuation:\nIn the event of a fire or other emergency requiring evacuation, teachers will lead students to the oval assembly area. Parents will be notified via the school app.\n\nLockdown:\nIn a lockdown, students remain in classrooms. Do not come to school during a lockdown. Await official all-clear notification via the app and emergency contacts.\n\nEmergency contact:\nAlways ensure your emergency contacts are up to date with the school office.',
   'policies'),
  ('Important Links', 'important-links',
   'School website: https://ourschool.edu.au\nParent portal: https://portal.ourschool.edu.au\nDepartment of Education: https://education.nsw.gov.au\nStudent absences form: Available in this app under Notices.\n\nSocial media:\nFacebook: @OurSchoolPrimary\nInstagram: @ourschoolprimary',
   'links')
ON CONFLICT (slug) DO NOTHING;
