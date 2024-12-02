ALTER TABLE trips
ADD COLUMN latEnd nvarchar(50),
ADD COLUMN lngEnd nvarchar(50);

ALTER TABLE trips
ADD COLUMN latCurrent nvarchar(50),
ADD COLUMN lngCurrent nvarchar(50);