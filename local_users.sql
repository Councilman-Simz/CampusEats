--
-- PostgreSQL database dump
--

\restrict T5DzcAm9nAjr44W7i4K4t1f1LVxlTPdU0vAjOzVFobEQ1WqCdzmozPS9x3blRNm

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg12+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: campuseats
--

INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (2, 'user@example.com', '$2b$12$/n8/MagiGrsf9Wt3xcldk.NY.Vj.oyKT4.zy.pE5eoJk49cxV5QqW', 'string', 'string', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (3, 'simba@mail.yu.edu', '$2b$12$/TDZwaavtu/gh5dg9dk5eeXiq7v4ZiGRwSldwlv/JmBjc8ctaWp/i', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (4, 'prince@gmail.com', '$2b$12$9aYIF2iZICEfXW3UuHbe5u9gFnUptzb9KpfMLb2njzcmYZAUIK5Oq', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (5, 'simbarashe2@example.com', '$2b$12$eJ8Ljc1pMWcg.ptdP4Dieu.wsjv/dPy0ETLp1O.pfezovAZgbf2Ym', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (7, 'simbarashe@example.com', '$2b$12$/VEfHGm3z1pKkpna1c79legVi22EVTiD9lfHLnsahjhGY0K4WaDDu', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (8, 'simbarashe@mail.com', '$2b$12$pQnO6yks4PPlPg4E7xWWj.eCg.vnJvHvAgBD.QmoqPQfkQaJh7T8K', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (9, 's@mail.com', '$2b$12$N6tX.Ka13lBhajCvee2o/OAPC7zDKPh/DlLwqDYd/wLwtp3zDlvuC', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (10, 'simbarashep@mail.com', '$2b$12$6hsMGuU0e45xBTwii8ri0.rQqNw/UoAJC3DiUTf0LhItzL0l9.TJW', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (11, 'campus@mail.com', '$2b$12$frVmu0n.C.d/mb.Wl6r1weKCtA093ZNsXDK3O8KYQst9QEVa6JNcu', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (12, 'si@mail.com', '$2b$12$QCmTEUX.gE25c7UwE7vtaO9J5BEQuwzxJyfC9tlrdxCLeW7HpchSm', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (13, 'yeu@mail.com', '$2b$12$.0S6s9wPziYbBjIF58WDa.58QwCQuv7.7vH2MRlt.fAr83yyag5ye', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (14, 'sim@mail.com', '$2b$12$3YpBiJy3lhRcA.769lsQxOOmLv5UBziCD31JK5SUKxzJYsGTC40rK', 'Vegetarian', 'Yeshiva University', 'student');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (1, 'simbarashepmukanganwa@gmail.com', '$2b$12$58Sl7y.PdQWQqh1vS//cMe/DTEZWWCJEBrR8nnPAB96jfxsvozzqm', 'Vegetarian', 'Yeshiva University', 'admin');
INSERT INTO public.users (id, email, password_hash, dietary_preferences, campus, role) VALUES (6, 'simbarashe4@example.com', '$2b$12$XU.xmQVJ7VDIH8kfmtxgfOJyeS3L3A3pA2BPgLYovBUFgCVr3uFm2', 'Vegetarian', 'Yeshiva University', 'restaurant_owner');


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: campuseats
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- PostgreSQL database dump complete
--

\unrestrict T5DzcAm9nAjr44W7i4K4t1f1LVxlTPdU0vAjOzVFobEQ1WqCdzmozPS9x3blRNm

