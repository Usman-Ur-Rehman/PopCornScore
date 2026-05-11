-- ===================================================
-- PopcornScore Database Setup
-- 4th Semester DB Project
-- Includes: Tables, Views, Triggers, Stored Procedures,
--           and Transactions (where they actually matter)
-- ===================================================

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
GO

CREATE TABLE Titles (
    title_id      INT PRIMARY KEY IDENTITY(1,1),
    title         NVARCHAR(256) NOT NULL,
    type          VARCHAR(50)   NOT NULL,  -- 'Movie' | 'TV Show'
    release_date  DATE          NOT NULL,
    poster_url    VARCHAR(256)  NOT NULL,
    cover_url     VARCHAR(256)  NOT NULL,
    trailer_url   VARCHAR(256)  NULL,
    summary       TEXT          NULL,
    avg_rating    DECIMAL(3,2)  DEFAULT 0,   -- Cached, maintained by trigger
    review_count  INT           DEFAULT 0,   -- Cached, maintained by trigger
    CONSTRAINT UQ_Title_Identity UNIQUE (title, type, release_date)
);
GO

CREATE TABLE Genres (
    genre_id   INT PRIMARY KEY IDENTITY(1,1),
    genre_name VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE Title_Genres (
    title_id INT NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    genre_id INT NOT NULL FOREIGN KEY REFERENCES Genres(genre_id),
    PRIMARY KEY (title_id, genre_id)
);
GO

CREATE TABLE People (
    people_id   INT PRIMARY KEY IDENTITY(1,1),
    name        NVARCHAR(256) NOT NULL,
    picture_url VARCHAR(256)  NOT NULL,
    bio         TEXT          NULL,
    birth_date  DATE          NULL
);
GO

CREATE TABLE Reviews (
    review_id   INT PRIMARY KEY IDENTITY(1,1),
    rating      INT      NOT NULL CHECK (rating > 0 AND rating < 11),
    comment     TEXT     NULL,
    user_id     INT      NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    title_id    INT      NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    review_date DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_User_Title_Review UNIQUE (user_id, title_id)
);
GO

CREATE TABLE MTS_CAST (
    cast_id        INT PRIMARY KEY IDENTITY(1,1),
    title_id       INT           NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    people_id      INT           NOT NULL FOREIGN KEY REFERENCES People(people_id),
    character_name NVARCHAR(256) NULL,
    role           VARCHAR(50)   NOT NULL,  -- 'Actor' | 'Director' | 'Producer'
    CONSTRAINT UQ_Cast_Member UNIQUE (title_id, people_id, role)
);
GO

CREATE TABLE Wishlist (
    user_id  INT      NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    title_id INT      NOT NULL FOREIGN KEY REFERENCES Titles(title_id),
    added_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, title_id)
);
GO

-- ===================================================
-- VIEWS
-- ===================================================
CREATE VIEW vw_TopRated AS
    SELECT TOP 100
        t.title_id, t.title, t.type,
        YEAR(t.release_date) AS release_year,
        t.avg_rating,
        t.review_count
    FROM Titles t
    WHERE t.review_count > 0
    ORDER BY t.avg_rating DESC, t.review_count DESC;
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

-- ===================================================
-- TRIGGERS (2)
-- ===================================================

-- ---------------------------------------------------
-- TRIGGER 1: Keep Titles.avg_rating and review_count
--            in sync whenever a review is added,
--            updated, or deleted.
--
-- Why a trigger? Recalculating AVG() on every page load
-- is wasteful. A cached column on Titles is fast to read,
-- and a trigger guarantees it stays accurate without the
-- application having to remember to update it.
--
-- TRANSACTION SCOPE:
--   The trigger runs inside the same implicit transaction
--   as the INSERT/UPDATE/DELETE on Reviews. So if the
--   review change rolls back, this stats update rolls
--   back too -- they can never get out of sync.
-- ---------------------------------------------------
CREATE TRIGGER trg_Reviews_UpdateTitleStats
ON Reviews
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Find which titles were affected by this change
    DECLARE @AffectedTitles TABLE (title_id INT);

    INSERT INTO @AffectedTitles (title_id)
    SELECT DISTINCT title_id FROM inserted
    UNION
    SELECT DISTINCT title_id FROM deleted;

    -- Recalculate cached stats for those titles
    UPDATE t
    SET
        t.avg_rating   = ISNULL(stats.avg_r, 0),
        t.review_count = ISNULL(stats.cnt, 0)
    FROM Titles t
    INNER JOIN @AffectedTitles a ON t.title_id = a.title_id
    LEFT JOIN (
        SELECT
            title_id,
            ROUND(AVG(CAST(rating AS FLOAT)), 2) AS avg_r,
            COUNT(*) AS cnt
        FROM Reviews
        GROUP BY title_id
    ) stats ON t.title_id = stats.title_id;
END;
GO

-- ---------------------------------------------------
-- TRIGGER 2: Auto-remove a title from a user's wishlist
--            once they review it.
--
-- Business rule: if you've watched and rated something,
-- it shouldn't still be in your "to watch" list.
--
-- TRANSACTION SCOPE:
--   Implicit -- runs inside the same tx as the INSERT
--   on Reviews. If the review insert rolls back, the
--   wishlist row stays.
-- ---------------------------------------------------
CREATE TRIGGER trg_Reviews_CleanWishlist
ON Reviews
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE w
    FROM Wishlist w
    INNER JOIN inserted i
        ON w.user_id  = i.user_id
       AND w.title_id = i.title_id;
END;
GO

-- ===================================================
-- STORED PROCEDURES
-- ===================================================

-- ---------------------------------------------------
-- sp_RegisterUser
-- Registers a new user with uniqueness checks.
-- TRANSACTION: not needed -- single INSERT.
-- ---------------------------------------------------
CREATE PROCEDURE sp_RegisterUser
    @username    VARCHAR(50),
    @email       VARCHAR(255),
    @pass_hash   VARCHAR(255),
    @new_user_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE username = @username)
    BEGIN
        RAISERROR('Username already exists.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
    BEGIN
        RAISERROR('Email already registered.', 16, 1);
        RETURN;
    END

    INSERT INTO Users (username, email, pass_hash)
    VALUES (@username, @email, @pass_hash);

    SET @new_user_id = SCOPE_IDENTITY();
END;
GO

-- ---------------------------------------------------
-- sp_LoginUser
-- Auth check (returns user record if credentials match).
-- TRANSACTION: not needed -- read-only.
-- ---------------------------------------------------
CREATE PROCEDURE sp_LoginUser
    @username_or_email VARCHAR(255),
    @pass_hash         VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT user_id, username, email
    FROM Users
    WHERE (username = @username_or_email OR email = @username_or_email)
      AND pass_hash = @pass_hash;
END;
GO

-- ---------------------------------------------------
-- sp_UpsertReview
-- Insert a new review or update the user's existing one
-- for the same title.
--
-- TRANSACTION: EXPLICIT.
--   This is the most important procedure in the system,
--   and it's an upsert (check + insert OR update). When
--   the review is written, the trigger trg_Reviews_*
--   also fires, recalculating avg_rating and cleaning
--   the wishlist. We wrap everything in a transaction so:
--     - If anything fails, all of it rolls back together
--     - We never end up with stale stats or half-applied
--       changes.
--   XACT_ABORT ON guarantees runtime errors trigger
--   automatic rollback.
-- ---------------------------------------------------
CREATE PROCEDURE sp_UpsertReview
    @user_id  INT,
    @title_id INT,
    @rating   INT,
    @comment  TEXT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @rating < 1 OR @rating > 10
    BEGIN
        RAISERROR('Rating must be between 1 and 10.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

            IF EXISTS (SELECT 1 FROM Reviews WHERE user_id = @user_id AND title_id = @title_id)
            BEGIN
                UPDATE Reviews
                SET rating = @rating, comment = @comment
                WHERE user_id = @user_id AND title_id = @title_id;
            END
            ELSE
            BEGIN
                INSERT INTO Reviews (user_id, title_id, rating, comment)
                VALUES (@user_id, @title_id, @rating, @comment);
            END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ---------------------------------------------------
-- sp_AddTitle
-- Add a new title and (optionally) link it to genres
-- in one go.
--
-- TRANSACTION: EXPLICIT.
--   Two related writes: insert the title, then insert
--   one row per genre into Title_Genres. If a genre
--   insert fails (e.g. invalid genre_id), we roll back
--   the title insert too, so we don't leave an orphan
--   title with no genres.
--   @genre_ids_csv example: '1,3,7'
-- ---------------------------------------------------
CREATE PROCEDURE sp_AddTitle
    @title          NVARCHAR(256),
    @type           VARCHAR(50),
    @release_date   DATE,
    @poster_url     VARCHAR(256),
    @cover_url      VARCHAR(256),
    @trailer_url    VARCHAR(256) = NULL,
    @summary        TEXT         = NULL,
    @genre_ids_csv  VARCHAR(500) = NULL,
    @new_title_id   INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            INSERT INTO Titles (title, type, release_date, poster_url, cover_url, trailer_url, summary)
            VALUES (@title, @type, @release_date, @poster_url, @cover_url, @trailer_url, @summary);

            SET @new_title_id = SCOPE_IDENTITY();

            IF @genre_ids_csv IS NOT NULL
            BEGIN
                INSERT INTO Title_Genres (title_id, genre_id)
                SELECT @new_title_id, CAST(value AS INT)
                FROM STRING_SPLIT(@genre_ids_csv, ',');
            END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ---------------------------------------------------
-- sp_GetTitleDetails
-- Returns a title's info, its genres, its cast, and
-- (if logged in) the user's own review + wishlist flag.
-- TRANSACTION: not needed -- read-only.
-- ---------------------------------------------------
CREATE PROCEDURE sp_GetTitleDetails
    @title_id INT,
    @user_id  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1) Title core info
    SELECT
        t.title_id, t.title, t.type, t.release_date,
        t.poster_url, t.cover_url, t.trailer_url, t.summary,
        t.avg_rating, t.review_count
    FROM Titles t
    WHERE t.title_id = @title_id;

    -- 2) Genres
    SELECT g.genre_id, g.genre_name
    FROM Title_Genres tg
    INNER JOIN Genres g ON tg.genre_id = g.genre_id
    WHERE tg.title_id = @title_id;

    -- 3) Cast
    SELECT c.cast_id, c.role, c.character_name,
           p.people_id, p.name, p.picture_url
    FROM MTS_CAST c
    INNER JOIN People p ON c.people_id = p.people_id
    WHERE c.title_id = @title_id;

    -- 4) Logged-in user's own review and wishlist status
    IF @user_id IS NOT NULL
    BEGIN
        SELECT review_id, rating, comment, review_date
        FROM Reviews
        WHERE user_id = @user_id AND title_id = @title_id;

        SELECT CAST(CASE WHEN EXISTS (
            SELECT 1 FROM Wishlist
            WHERE user_id = @user_id AND title_id = @title_id
        ) THEN 1 ELSE 0 END AS BIT) AS in_wishlist;
    END
END;
GO

-- ---------------------------------------------------
-- sp_SearchTitles
-- Search by name / type / genre / minimum rating
-- with pagination.
-- TRANSACTION: not needed -- read-only.
-- ---------------------------------------------------
CREATE PROCEDURE sp_SearchTitles
    @search_term VARCHAR(256) = NULL,
    @type        VARCHAR(50)  = NULL,
    @genre_id    INT          = NULL,
    @min_rating  DECIMAL(3,2) = NULL,
    @page        INT = 1,
    @page_size   INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @offset INT = (@page - 1) * @page_size;

    SELECT DISTINCT
        t.title_id, t.title, t.type, t.release_date,
        t.poster_url, t.avg_rating, t.review_count
    FROM Titles t
    LEFT JOIN Title_Genres tg ON t.title_id = tg.title_id
    WHERE (@search_term IS NULL OR t.title LIKE '%' + @search_term + '%')
      AND (@type IS NULL OR t.type = @type)
      AND (@genre_id IS NULL OR tg.genre_id = @genre_id)
      AND (@min_rating IS NULL OR t.avg_rating >= @min_rating)
    ORDER BY t.avg_rating DESC, t.review_count DESC
    OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY;
END;
GO

-- ---------------------------------------------------
-- sp_GetUserWishlist
-- Returns the user's wishlist with title info.
-- TRANSACTION: not needed -- read-only.
-- ---------------------------------------------------
CREATE PROCEDURE sp_GetUserWishlist
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        w.added_at,
        t.title_id, t.title, t.type, t.release_date,
        t.poster_url, t.avg_rating, t.review_count
    FROM Wishlist w
    INNER JOIN Titles t ON w.title_id = t.title_id
    WHERE w.user_id = @user_id
    ORDER BY w.added_at DESC;
END;
GO

-- ---------------------------------------------------
-- sp_AddToWishlist
-- Adds a title to a user's wishlist (no-op if already there).
-- TRANSACTION: not needed -- single INSERT.
-- ---------------------------------------------------
CREATE PROCEDURE sp_AddToWishlist
    @user_id  INT,
    @title_id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Wishlist WHERE user_id = @user_id AND title_id = @title_id)
    BEGIN
        INSERT INTO Wishlist (user_id, title_id)
        VALUES (@user_id, @title_id);
    END
END;
GO

-- ---------------------------------------------------
-- sp_RemoveFromWishlist
-- Removes a title from a user's wishlist.
-- TRANSACTION: not needed -- single DELETE.
-- ---------------------------------------------------
CREATE PROCEDURE sp_RemoveFromWishlist
    @user_id  INT,
    @title_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Wishlist WHERE user_id = @user_id AND title_id = @title_id;
END;
GO

PRINT 'PopcornScoreDB setup complete.';
PRINT 'Run: cd backend && npm run seed';
GO
