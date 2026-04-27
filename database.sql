-- PopcornScore Database Setup
-- Run this in SSMS before starting the application
-- Prerequisites: SQL Server must have SQL Authentication enabled
--                and a login with credentials matching your .env file

CREATE DATABASE PopcornScoreDB;
GO
USE PopcornScoreDB;
GO

-- ===================================================
-- TABLE DEFINITIONS
-- ===================================================

CREATE TABLE Users (
    user_id   INT PRIMARY KEY IDENTITY(1,1),
    username  VARCHAR(50)  NOT NULL UNIQUE,
    email     VARCHAR(255) NOT NULL UNIQUE,
    pass_hash VARCHAR(255) NOT NULL
);

CREATE TABLE Titles (
    title_id    INT PRIMARY KEY IDENTITY(1,1),
    title       NVARCHAR(256) NOT NULL,
    type        VARCHAR(50)   NOT NULL,  -- 'Movie' | 'TV Show'
    release_date DATE         NOT NULL,
    poster_url  VARCHAR(256)  NOT NULL,
    cover_url   VARCHAR(256)  NOT NULL,
    trailer_url VARCHAR(256)  NULL,
    summary     TEXT          NULL,

    CONSTRAINT UQ_Title_Identity UNIQUE (title, type, release_date)
);

CREATE TABLE Genres (
    genre_id   INT PRIMARY KEY IDENTITY(1,1),
    genre_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Title_Genres (
    title_id INT NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    genre_id INT NOT NULL FOREIGN KEY REFERENCES Genres(genre_id),
    PRIMARY KEY (title_id, genre_id)
);

CREATE TABLE People (
    people_id   INT PRIMARY KEY IDENTITY(1,1),
    name        NVARCHAR(256) NOT NULL,
    picture_url VARCHAR(256)  NOT NULL,
    bio         TEXT          NULL,
    birth_date  DATE          NULL
);

CREATE TABLE Reviews (
    review_id   INT PRIMARY KEY IDENTITY(1,1),
    rating      INT      NOT NULL CHECK (rating > 0 AND rating < 11),
    comment     TEXT     NULL,
    user_id     INT      NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    title_id    INT      NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    review_date DATETIME DEFAULT GETDATE(),

    CONSTRAINT UQ_User_Title_Review UNIQUE (user_id, title_id)
);

CREATE TABLE MTS_CAST (
    cast_id        INT PRIMARY KEY IDENTITY(1,1),
    title_id       INT          NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    people_id      INT          NOT NULL FOREIGN KEY REFERENCES People(people_id),
    character_name NVARCHAR(256) NULL,
    role           VARCHAR(50)  NOT NULL,  -- 'Actor' | 'Director' | 'Producer'

    CONSTRAINT UQ_Cast_Member UNIQUE (title_id, people_id, role)
);

CREATE TABLE Wishlist (
    user_id  INT      NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    title_id INT      NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    added_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, title_id)
);
GO

-- ===================================================
-- USEFUL VIEWS (optional, for SSMS reporting)
-- ===================================================

CREATE VIEW vw_TopRated AS
    SELECT TOP 100
        t.title_id, t.title, t.type,
        YEAR(t.release_date) AS release_year,
        ROUND(AVG(CAST(r.rating AS FLOAT)), 2) AS avg_rating,
        COUNT(r.review_id) AS review_count
    FROM Titles t
    JOIN Reviews r ON t.title_id = r.title_id
    GROUP BY t.title_id, t.title, t.type, t.release_date
    ORDER BY avg_rating DESC;
GO

CREATE VIEW vw_UserStats AS
    SELECT
        u.user_id, u.username, u.email,
        COUNT(DISTINCT r.review_id) AS total_ratings,
        COUNT(DISTINCT w.title_id)  AS wishlist_count,
        ROUND(AVG(CAST(r.rating AS FLOAT)), 2) AS avg_given_rating
    FROM Users u
    LEFT JOIN Reviews  r ON u.user_id = r.user_id
    LEFT JOIN Wishlist w ON u.user_id = w.user_id
    GROUP BY u.user_id, u.username, u.email;
GO

PRINT 'PopcornScoreDB setup complete. Run: cd backend && npm run seed';
