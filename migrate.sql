-- ===================================================
-- PopcornScore Migration Script
-- Run this in SSMS on the existing PopcornScoreDB
-- to upgrade from the old schema to the new one.
-- Safe to run on a live database -- does NOT drop tables.
-- ===================================================

USE PopcornScoreDB;
GO

-- ===================================================
-- STEP 1: Add cached columns to Titles
-- ===================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Titles') AND name = 'avg_rating')
    ALTER TABLE Titles ADD avg_rating DECIMAL(3,2) DEFAULT 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Titles') AND name = 'review_count')
    ALTER TABLE Titles ADD review_count INT DEFAULT 0;
GO

-- ===================================================
-- STEP 2: Backfill cached values from existing reviews
-- ===================================================
UPDATE t
SET
    t.avg_rating   = ISNULL(stats.avg_r, 0),
    t.review_count = ISNULL(stats.cnt, 0)
FROM Titles t
LEFT JOIN (
    SELECT
        title_id,
        ROUND(AVG(CAST(rating AS FLOAT)), 2) AS avg_r,
        COUNT(*) AS cnt
    FROM Reviews
    GROUP BY title_id
) stats ON t.title_id = stats.title_id;
GO

PRINT 'Columns added and backfilled.';

-- ===================================================
-- STEP 3: Drop and recreate views (new definitions)
-- ===================================================
IF OBJECT_ID('vw_TopRated', 'V') IS NOT NULL DROP VIEW vw_TopRated;
GO
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

IF OBJECT_ID('vw_UserStats', 'V') IS NOT NULL DROP VIEW vw_UserStats;
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

PRINT 'Views recreated.';

-- ===================================================
-- STEP 4: Drop and recreate triggers
-- ===================================================
IF OBJECT_ID('trg_Reviews_UpdateTitleStats', 'TR') IS NOT NULL DROP TRIGGER trg_Reviews_UpdateTitleStats;
GO
CREATE TRIGGER trg_Reviews_UpdateTitleStats
ON Reviews
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @AffectedTitles TABLE (title_id INT);
    INSERT INTO @AffectedTitles (title_id)
    SELECT DISTINCT title_id FROM inserted
    UNION
    SELECT DISTINCT title_id FROM deleted;

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

IF OBJECT_ID('trg_Reviews_CleanWishlist', 'TR') IS NOT NULL DROP TRIGGER trg_Reviews_CleanWishlist;
GO
CREATE TRIGGER trg_Reviews_CleanWishlist
ON Reviews
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE w
    FROM Wishlist w
    INNER JOIN inserted i ON w.user_id = i.user_id AND w.title_id = i.title_id;
END;
GO

PRINT 'Triggers recreated.';

-- ===================================================
-- STEP 5: Drop and recreate stored procedures
-- ===================================================
IF OBJECT_ID('sp_RegisterUser',       'P') IS NOT NULL DROP PROCEDURE sp_RegisterUser;
IF OBJECT_ID('sp_LoginUser',          'P') IS NOT NULL DROP PROCEDURE sp_LoginUser;
IF OBJECT_ID('sp_UpsertReview',       'P') IS NOT NULL DROP PROCEDURE sp_UpsertReview;
IF OBJECT_ID('sp_AddTitle',           'P') IS NOT NULL DROP PROCEDURE sp_AddTitle;
IF OBJECT_ID('sp_GetTitleDetails',    'P') IS NOT NULL DROP PROCEDURE sp_GetTitleDetails;
IF OBJECT_ID('sp_SearchTitles',       'P') IS NOT NULL DROP PROCEDURE sp_SearchTitles;
IF OBJECT_ID('sp_GetUserWishlist',    'P') IS NOT NULL DROP PROCEDURE sp_GetUserWishlist;
IF OBJECT_ID('sp_AddToWishlist',      'P') IS NOT NULL DROP PROCEDURE sp_AddToWishlist;
IF OBJECT_ID('sp_RemoveFromWishlist', 'P') IS NOT NULL DROP PROCEDURE sp_RemoveFromWishlist;
GO

CREATE PROCEDURE sp_RegisterUser
    @username    VARCHAR(50),
    @email       VARCHAR(255),
    @pass_hash   VARCHAR(255),
    @new_user_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Users WHERE username = @username)
    BEGIN RAISERROR('Username already exists.', 16, 1); RETURN; END
    IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
    BEGIN RAISERROR('Email already registered.', 16, 1); RETURN; END
    INSERT INTO Users (username, email, pass_hash) VALUES (@username, @email, @pass_hash);
    SET @new_user_id = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_LoginUser
    @username_or_email VARCHAR(255),
    @pass_hash         VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT user_id, username, email FROM Users
    WHERE (username = @username_or_email OR email = @username_or_email)
      AND pass_hash = @pass_hash;
END;
GO

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
    BEGIN RAISERROR('Rating must be between 1 and 10.', 16, 1); RETURN; END
    BEGIN TRY
        BEGIN TRANSACTION;
            IF EXISTS (SELECT 1 FROM Reviews WHERE user_id = @user_id AND title_id = @title_id)
                UPDATE Reviews SET rating = @rating, comment = @comment WHERE user_id = @user_id AND title_id = @title_id;
            ELSE
                INSERT INTO Reviews (user_id, title_id, rating, comment) VALUES (@user_id, @title_id, @rating, @comment);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_AddTitle
    @title         NVARCHAR(256),
    @type          VARCHAR(50),
    @release_date  DATE,
    @poster_url    VARCHAR(256),
    @cover_url     VARCHAR(256),
    @trailer_url   VARCHAR(256) = NULL,
    @summary       TEXT         = NULL,
    @genre_ids_csv VARCHAR(500) = NULL,
    @new_title_id  INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON; SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO Titles (title, type, release_date, poster_url, cover_url, trailer_url, summary)
            VALUES (@title, @type, @release_date, @poster_url, @cover_url, @trailer_url, @summary);
            SET @new_title_id = SCOPE_IDENTITY();
            IF @genre_ids_csv IS NOT NULL
                INSERT INTO Title_Genres (title_id, genre_id)
                SELECT @new_title_id, CAST(value AS INT) FROM STRING_SPLIT(@genre_ids_csv, ',');
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION; THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_GetTitleDetails
    @title_id INT,
    @user_id  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.title_id, t.title, t.type, t.release_date,
           t.poster_url, t.cover_url, t.trailer_url, t.summary,
           t.avg_rating, t.review_count
    FROM Titles t WHERE t.title_id = @title_id;

    SELECT g.genre_id, g.genre_name FROM Title_Genres tg
    INNER JOIN Genres g ON tg.genre_id = g.genre_id WHERE tg.title_id = @title_id;

    SELECT c.cast_id, c.role, c.character_name, p.people_id, p.name, p.picture_url
    FROM MTS_CAST c INNER JOIN People p ON c.people_id = p.people_id WHERE c.title_id = @title_id;

    IF @user_id IS NOT NULL
    BEGIN
        SELECT review_id, rating, comment, review_date FROM Reviews
        WHERE user_id = @user_id AND title_id = @title_id;
        SELECT CAST(CASE WHEN EXISTS (
            SELECT 1 FROM Wishlist WHERE user_id = @user_id AND title_id = @title_id
        ) THEN 1 ELSE 0 END AS BIT) AS in_wishlist;
    END
END;
GO

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
    SELECT DISTINCT t.title_id, t.title, t.type, t.release_date,
        t.poster_url, t.avg_rating, t.review_count
    FROM Titles t LEFT JOIN Title_Genres tg ON t.title_id = tg.title_id
    WHERE (@search_term IS NULL OR t.title LIKE '%' + @search_term + '%')
      AND (@type IS NULL OR t.type = @type)
      AND (@genre_id IS NULL OR tg.genre_id = @genre_id)
      AND (@min_rating IS NULL OR t.avg_rating >= @min_rating)
    ORDER BY t.avg_rating DESC, t.review_count DESC
    OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY;
END;
GO

CREATE PROCEDURE sp_GetUserWishlist @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT w.added_at, t.title_id, t.title, t.type, t.release_date,
           t.poster_url, t.avg_rating, t.review_count
    FROM Wishlist w INNER JOIN Titles t ON w.title_id = t.title_id
    WHERE w.user_id = @user_id ORDER BY w.added_at DESC;
END;
GO

CREATE PROCEDURE sp_AddToWishlist @user_id INT, @title_id INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Wishlist WHERE user_id = @user_id AND title_id = @title_id)
        INSERT INTO Wishlist (user_id, title_id) VALUES (@user_id, @title_id);
END;
GO

CREATE PROCEDURE sp_RemoveFromWishlist @user_id INT, @title_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Wishlist WHERE user_id = @user_id AND title_id = @title_id;
END;
GO

PRINT 'Migration complete. PopcornScoreDB is now on the new schema.';
GO
